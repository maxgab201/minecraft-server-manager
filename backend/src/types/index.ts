import { Client, ClientChannel } from 'ssh2';

export interface SSHCredentials {
  username: string;
  host: string;
  port: number;
  privateKey: string;
  passphrase?: string;
}

export interface SSHConnection {
  sessionId: string;
  username: string;
  host: string;
  port: number;
  connectedAt: number;
  serverDir: string;
}

export interface Session {
  sessionId: string;
  client: Client;
  shellStream: ClientChannel;
  createdAt: number;
  lastActivity: number;
  username: string;
  host: string;
  port: number;
}

export interface ServerStatus {
  running: boolean;
  cpuUsage?: number;
  ramUsage?: {
    used: number;
    total: number;
    percent: number;
  };
  tps?: number[];
  players?: {
    online: number;
    max: number;
    list: string[];
  };
  uptime?: number;
  version?: string;
  type?: string;
  port?: number;
  motd?: string;
}

export interface LogLine {
  timestamp?: string;
  level?: string;
  message: string;
  raw: string;
}

export interface LogLines {
  lines: LogLine[];
  total: number;
  hasMore: boolean;
  offset: number;
}

export interface LogFilter {
  search?: string;
  level?: string;
  since?: string;
  until?: string;
  limit?: number;
  offset?: number;
}

export enum ShortcutAction {
  StartServer = 'start-server',
  StopServer = 'stop-server',
  RestartServer = 'restart-server',
  SaveWorld = 'save-world',
  ListPlayers = 'list-players',
  Tps = 'tps',
  Memory = 'memory',
  Uptime = 'uptime',
  ClearConsole = 'clear-console',
  GetLogs = 'get-logs',
}

export interface ShortcutDefinition {
  id: ShortcutAction;
  label: string;
  command: string;
  icon?: string;
}

export interface TerminalSize {
  cols: number;
  rows: number;
}

declare global {
  namespace Express {
    interface Request {
      sessionId?: string;
      session?: Session;
    }
  }
}
