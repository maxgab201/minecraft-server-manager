import { Server as HttpServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import jwt from 'jsonwebtoken';
import { CONFIG } from '../config/env.js';
import { sessionManager } from '../services/sessionManager.js';
import { validate } from '../services/commandValidator.js';

interface JwtPayload {
  sessionId: string;
  username: string;
  host: string;
  port: number;
}

export function createTerminalWebSocket(httpServer: HttpServer): WebSocketServer {
  const wss = new WebSocketServer({
    server: httpServer,
    path: '/terminal',
  });

  wss.on('connection', (ws: WebSocket, req) => {
    const url = new URL(req.url || '', `http://${req.headers.host}`);
    const token = url.searchParams.get('token');

    if (!token) {
      ws.close(4001, 'Authentication token required');
      return;
    }

    let decoded: JwtPayload;
    try {
      decoded = jwt.verify(token, CONFIG.JWT_SECRET) as JwtPayload;
    } catch {
      ws.close(4001, 'Invalid or expired token');
      return;
    }

    const session = sessionManager.getSession(decoded.sessionId);
    if (!session) {
      ws.close(4001, 'Session not found or expired');
      return;
    }

    const sessionId = decoded.sessionId;
    const shellStream = session.shellStream;
    let closed = false;
    let buffer = '';

    const shellDataHandler = (data: Buffer) => {
      if (!closed && ws.readyState === WebSocket.OPEN) {
        ws.send(data);
      }
    };

    const shellCloseHandler = () => {
      if (!closed) {
        closed = true;
        cleanup();
        if (ws.readyState === WebSocket.OPEN) {
          ws.close(1000, 'Shell closed');
        }
      }
    };

    const shellErrorHandler = () => {
      if (!closed) {
        closed = true;
        cleanup();
        if (ws.readyState === WebSocket.OPEN) {
          ws.close(1011, 'Shell error');
        }
      }
    };

    shellStream.on('data', shellDataHandler);
    shellStream.on('close', shellCloseHandler);
    shellStream.on('error', shellErrorHandler);

    ws.on('message', (data: Buffer) => {
      if (closed) return;

      try {
        const text = data.toString('utf8');
        const parsed = JSON.parse(text);

        if (parsed.type === 'resize' && parsed.cols && parsed.rows) {
          try {
            shellStream.setWindow(parsed.rows, parsed.cols, 0, 0);
          } catch {
            // ignore resize errors
          }
          return;
        }

        if (parsed.type === 'input' && parsed.data !== undefined) {
          sessionManager.touch(sessionId);

          if (parsed.data === '\r' || parsed.data === '\n') {
            const fullCommand = buffer.trim();
            buffer = '';

            if (fullCommand.length > 0) {
              const validation = validate(fullCommand);
              if (!validation.allowed) {
                if (ws.readyState === WebSocket.OPEN) {
                  ws.send(Buffer.from(validation.error + '\r\n'));
                }
                return;
              }
            }

            shellStream.write(parsed.data);
          } else if (parsed.data === '\x7f' || parsed.data === '\b') {
            if (buffer.length > 0) {
              buffer = buffer.slice(0, -1);
            }
            shellStream.write(parsed.data);
          } else {
            buffer += parsed.data;
            shellStream.write(parsed.data);
          }
          return;
        }

        if (parsed.type === 'data') {
          sessionManager.touch(sessionId);
          shellStream.write(parsed.data);
          return;
        }
      } catch {
        shellStream.write(data);
      }
    });

    ws.on('close', () => {
      cleanup();
    });

    ws.on('error', () => {
      cleanup();
    });

    function cleanup() {
      if (closed) return;
      closed = true;

      shellStream.removeListener('data', shellDataHandler);
      shellStream.removeListener('close', shellCloseHandler);
      shellStream.removeListener('error', shellErrorHandler);
    }
  });

  return wss;
}
