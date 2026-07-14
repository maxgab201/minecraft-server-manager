import { v4 as uuidv4 } from 'uuid';
import { Client, ClientChannel } from 'ssh2';
import { Session } from '../types/index.js';

class SessionManager {
  private sessions: Map<string, Session> = new Map();
  private cleanupInterval: ReturnType<typeof setInterval> | null = null;

  constructor() {
    this.startCleanup();
  }

  createSession(
    client: Client,
    shellStream: ClientChannel,
    username: string,
    host: string,
    port: number
  ): string {
    const sessionId = uuidv4();
    const now = Date.now();

    const session: Session = {
      sessionId,
      client,
      shellStream,
      createdAt: now,
      lastActivity: now,
      username,
      host,
      port,
    };

    this.sessions.set(sessionId, session);
    return sessionId;
  }

  getSession(sessionId: string): Session | undefined {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.lastActivity = Date.now();
    }
    return session;
  }

  touch(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.lastActivity = Date.now();
    }
  }

  removeSession(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    try {
      session.shellStream.close();
    } catch {
      // stream may already be closed
    }

    try {
      session.client.end();
    } catch {
      // client may already be disconnected
    }

    this.sessions.delete(sessionId);
    return true;
  }

  getSessionCount(): number {
    return this.sessions.size;
  }

  getAllSessions(): Session[] {
    return Array.from(this.sessions.values());
  }

  private startCleanup(): void {
    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      const maxIdle = 1800000;

      for (const [id, session] of this.sessions.entries()) {
        if (now - session.lastActivity > maxIdle) {
          try {
            this.removeSession(id);
          } catch {
            this.sessions.delete(id);
          }
        }
      }
    }, 60000);
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }

    for (const [id] of this.sessions.entries()) {
      this.removeSession(id);
    }
  }
}

export const sessionManager = new SessionManager();
