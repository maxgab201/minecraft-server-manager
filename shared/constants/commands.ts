import { ShortcutAction, ShortcutDefinition } from '../types/shortcuts.js';

export const SHORTCUT_COMMANDS: Record<ShortcutAction, string> = {
  [ShortcutAction.StartServer]: 'java -Xmx2G -Xms1G -jar server.jar nogui',
  [ShortcutAction.StopServer]: 'stop',
  [ShortcutAction.RestartServer]: 'stop && sleep 3 && java -Xmx2G -Xms1G -jar server.jar nogui',
  [ShortcutAction.SaveWorld]: 'save-all',
  [ShortcutAction.ListPlayers]: 'list',
  [ShortcutAction.Tps]: 'tps',
  [ShortcutAction.Memory]: 'memory',
  [ShortcutAction.Uptime]: 'uptime',
  [ShortcutAction.ClearConsole]: 'clear',
  [ShortcutAction.GetLogs]: 'cat logs/latest.log | tail -100',
};

export const SHORTCUT_DEFINITIONS: ShortcutDefinition[] = [
  { id: ShortcutAction.StartServer, label: 'Start Server', command: SHORTCUT_COMMANDS[ShortcutAction.StartServer], icon: 'play' },
  { id: ShortcutAction.StopServer, label: 'Stop Server', command: SHORTCUT_COMMANDS[ShortcutAction.StopServer], icon: 'stop' },
  { id: ShortcutAction.RestartServer, label: 'Restart Server', command: SHORTCUT_COMMANDS[ShortcutAction.RestartServer], icon: 'refresh' },
  { id: ShortcutAction.SaveWorld, label: 'Save World', command: SHORTCUT_COMMANDS[ShortcutAction.SaveWorld], icon: 'save' },
  { id: ShortcutAction.ListPlayers, label: 'List Players', command: SHORTCUT_COMMANDS[ShortcutAction.ListPlayers], icon: 'people' },
  { id: ShortcutAction.Tps, label: 'TPS', command: SHORTCUT_COMMANDS[ShortcutAction.Tps], icon: 'speed' },
  { id: ShortcutAction.Memory, label: 'Memory Usage', command: SHORTCUT_COMMANDS[ShortcutAction.Memory], icon: 'memory' },
  { id: ShortcutAction.Uptime, label: 'Uptime', command: SHORTCUT_COMMANDS[ShortcutAction.Uptime], icon: 'clock' },
  { id: ShortcutAction.ClearConsole, label: 'Clear Console', command: SHORTCUT_COMMANDS[ShortcutAction.ClearConsole], icon: 'erase' },
  { id: ShortcutAction.GetLogs, label: 'Recent Logs', command: SHORTCUT_COMMANDS[ShortcutAction.GetLogs], icon: 'logs' },
];
