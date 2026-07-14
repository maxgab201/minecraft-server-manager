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
