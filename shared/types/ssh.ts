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
