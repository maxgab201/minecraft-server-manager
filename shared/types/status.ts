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
