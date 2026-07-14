import { Client, ClientChannel } from 'ssh2';
import { SSHCredentials, Session } from '../types/index.js';
import { sessionManager } from './sessionManager.js';
import { parseKey } from '../utils/ssh-key-parser.js';
import { CONFIG } from '../config/env.js';

class SSHService {
  async connect(credentials: SSHCredentials): Promise<{ sessionId: string; session: Session }> {
    const { username, host, port, privateKey, passphrase } = credentials;

    if (!username || !host || !port || !privateKey) {
      throw new Error('Missing required SSH credentials');
    }

    const parsedKey = parseKey(privateKey);

    return new Promise((resolve, reject) => {
      const client = new Client();

      client.on('ready', () => {
        client.shell(
          { term: 'xterm-256color', cols: 80, rows: 24 },
          (err: Error | undefined, stream: ClientChannel) => {
            if (err) {
              client.end();
              reject(new Error(`Failed to create shell: ${err.message}`));
              return;
            }

            stream.stderr.on('data', () => {
              // stderr is forwarded via the shell stream
            });

            stream.on('close', () => {
              const sessions = sessionManager.getAllSessions();
              for (const s of sessions) {
                if (s.client === client) {
                  sessionManager.removeSession(s.sessionId);
                  break;
                }
              }
            });

            stream.on('error', () => {
              const sessions = sessionManager.getAllSessions();
              for (const s of sessions) {
                if (s.client === client) {
                  sessionManager.removeSession(s.sessionId);
                  break;
                }
              }
            });

            stream.write(`cd ${CONFIG.SERVER_DIR}\n`);

            const sessionId = sessionManager.createSession(
              client,
              stream,
              username,
              host,
              port
            );

            const session = sessionManager.getSession(sessionId)!;
            resolve({ sessionId, session });
          }
        );
      });

      client.on('error', (err: Error) => {
        reject(new Error(`SSH connection failed: ${err.message}`));
      });

      client.on('close', () => {
        // handled by stream close
      });

      const connectConfig: any = {
        username,
        host,
        port,
        privateKey: parsedKey,
        readyTimeout: 10000,
        keepaliveInterval: 10000,
        keepaliveCountMax: 3,
      };

      if (passphrase) {
        connectConfig.passphrase = passphrase;
      }

      client.connect(connectConfig);
    });
  }

  getSession(sessionId: string): Session | undefined {
    return sessionManager.getSession(sessionId);
  }

  async executeCommand(
    sessionId: string,
    command: string
  ): Promise<string> {
    const session = sessionManager.getSession(sessionId);
    if (!session) {
      throw new Error('Session not found or expired');
    }

    sessionManager.touch(sessionId);

    return new Promise((resolve, reject) => {
      const shell = session.shellStream;
      let output = '';
      let timeoutId: ReturnType<typeof setTimeout> | null = null;

      const dataHandler = (data: Buffer) => {
        output += data.toString();
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(() => {
          shell.removeListener('data', dataHandler);
          shell.removeListener('close', closeHandler);
          resolve(output);
        }, 500);
      };

      const closeHandler = () => {
        if (timeoutId) clearTimeout(timeoutId);
        shell.removeListener('data', dataHandler);
        resolve(output);
      };

      shell.on('data', dataHandler);
      shell.on('close', closeHandler);

      shell.write(command + '\n');

      timeoutId = setTimeout(() => {
        shell.removeListener('data', dataHandler);
        shell.removeListener('close', closeHandler);
        resolve(output);
      }, 10000);
    });
  }

  async resize(sessionId: string, cols: number, rows: number): Promise<void> {
    const session = sessionManager.getSession(sessionId);
    if (!session) {
      throw new Error('Session not found or expired');
    }

    sessionManager.touch(sessionId);

    return new Promise((resolve, reject) => {
      try {
        session.shellStream.setWindow(rows, cols, 0, 0);
        resolve();
      } catch (err) {
        reject(new Error(`Failed to resize terminal: ${(err as Error).message}`));
      }
    });
  }

  disconnect(sessionId: string): void {
    sessionManager.removeSession(sessionId);
  }
}

export const sshService = new SSHService();
