import { LogLine, LogLines } from '../types/index.js';
import { sshService } from './sshService.js';
import { CONFIG } from '../config/env.js';
import WebSocket from 'ws';
import { sessionManager } from './sessionManager.js';

class LogsService {
  async getLatestLogPath(sessionId: string): Promise<string> {
    const output = await sshService.executeCommand(
      sessionId,
      `ls -t ${CONFIG.SERVER_DIR}/logs/*.log 2>/dev/null | head -1`
    );
    const path = output.trim().split('\n').filter((l) => l.length > 0)[0];
    if (!path) {
      throw new Error('No log files found');
    }
    return path;
  }

  async getLogs(
    sessionId: string,
    options: { limit?: number; offset?: number; search?: string } = {}
  ): Promise<LogLines> {
    const limit = options.limit || 100;
    const offset = options.offset || 0;

    try {
      const logPath = await this.getLatestLogPath(sessionId);

      let command: string;
      if (options.search) {
        const escaped = options.search.replace(/'/g, "'\\''");
        command = `grep -n '${escaped}' "${logPath}" 2>/dev/null | tail -n +${offset + 1} | head -${limit}`;
      } else {
        command = `wc -l < "${logPath}" 2>/dev/null`;
        const totalOutput = await sshService.executeCommand(sessionId, command);
        const total = parseInt(totalOutput.trim(), 10) || 0;

        const startLine = Math.max(1, total - offset - limit + 1);
        const count = Math.min(limit, total - offset);

        command = `tail -n +${startLine} "${logPath}" 2>/dev/null | head -${count}`;
        const output = await sshService.executeCommand(sessionId, command);
        const lines = this.parseLogLines(output);

        return {
          lines,
          total,
          hasMore: offset + limit < total,
          offset: offset + limit,
        };
      }

      const output = await sshService.executeCommand(sessionId, command);
      const lines = this.parseLogLines(output);

      return {
        lines,
        total: lines.length,
        hasMore: lines.length >= limit,
        offset: offset + lines.length,
      };
    } catch (err) {
      return {
        lines: [],
        total: 0,
        hasMore: false,
        offset: 0,
      };
    }
  }

  async searchLogs(
    sessionId: string,
    query: string,
    options: { limit?: number; offset?: number } = {}
  ): Promise<LogLines> {
    return this.getLogs(sessionId, {
      ...options,
      search: query,
    });
  }

  async streamLogs(sessionId: string, ws: WebSocket): Promise<void> {
    const session = sessionManager.getSession(sessionId);
    if (!session) {
      ws.close(4001, 'Session not found');
      return;
    }

    try {
      const logPath = await this.getLatestLogPath(sessionId);

      const { Client } = await import('ssh2');
      const parsedKey = session.client as any;

      const tailClient = new Client();
      let tailStream: any = null;
      let closed = false;

      tailClient.on('ready', () => {
        tailClient.exec(
          `tail -f "${logPath}"`,
          (err: Error | undefined, stream: any) => {
            if (err) {
              ws.close(4002, `Failed to tail logs: ${err.message}`);
              tailClient.end();
              return;
            }

            tailStream = stream;

            stream.on('data', (data: Buffer) => {
              if (!closed && ws.readyState === WebSocket.OPEN) {
                ws.send(data.toString());
              }
            });

            stream.stderr.on('data', (data: Buffer) => {
              if (!closed && ws.readyState === WebSocket.OPEN) {
                ws.send(data.toString());
              }
            });

            stream.on('close', () => {
              if (!closed && ws.readyState === WebSocket.OPEN) {
                ws.close();
              }
            });

            stream.on('error', () => {
              if (!closed && ws.readyState === WebSocket.OPEN) {
                ws.close();
              }
            });
          }
        );
      });

      tailClient.on('error', () => {
        if (!closed && ws.readyState === WebSocket.OPEN) {
          ws.close(4003, 'SSH connection error');
        }
      });

      tailClient.connect({
        username: session.username,
        host: session.host,
        port: session.port,
        privateKey: parsedKey,
        readyTimeout: 10000,
      });

      ws.on('close', () => {
        closed = true;
        if (tailStream) {
          try {
            tailStream.close();
          } catch {
            // already closed
          }
        }
        try {
          tailClient.end();
        } catch {
          // already ended
        }
      });

      ws.on('error', () => {
        closed = true;
        if (tailStream) {
          try {
            tailStream.close();
          } catch {
            // already closed
          }
        }
        try {
          tailClient.end();
        } catch {
          // already ended
        }
      });
    } catch (err) {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close(4004, `Failed to stream logs: ${(err as Error).message}`);
      }
    }
  }

  private parseLogLines(output: string): LogLine[] {
    const lines: LogLine[] = [];
    const rawLines = output.split('\n').filter((l) => l.length > 0);

    for (const raw of rawLines) {
      const line = this.parseLogLine(raw);
      if (line) {
        lines.push(line);
      }
    }

    return lines;
  }

  private parseLogLine(raw: string): LogLine {
    const logPattern =
      /^\[?(\d{2}:\d{2}:\d{2})\]?\s*\[?(\w+)\]?:\s*(.*)$/;
    const match = raw.match(logPattern);

    if (match) {
      return {
        timestamp: match[1],
        level: match[2],
        message: match[3],
        raw,
      };
    }

    const fullDatePattern =
      /^\[?(\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2})\]?\s*\[?(\w+)\]?:\s*(.*)$/;
    const dateMatch = raw.match(fullDatePattern);

    if (dateMatch) {
      return {
        timestamp: dateMatch[1],
        level: dateMatch[2],
        message: dateMatch[3],
        raw,
      };
    }

    return { message: raw, raw };
  }
}

export const logsService = new LogsService();
