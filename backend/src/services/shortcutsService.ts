import { ShortcutAction } from '../types/index.js';
import { sshService } from './sshService.js';
import { SHORTCUT_COMMANDS } from '../../../shared/constants/commands.js';
import { validate } from './commandValidator.js';

class ShortcutsService {
  async executeShortcut(
    sessionId: string,
    action: ShortcutAction
  ): Promise<{ output: string }> {
    const command = SHORTCUT_COMMANDS[action];

    if (!command) {
      throw new Error(`Unknown shortcut action: ${action}`);
    }

    const validation = validate(command);
    if (!validation.allowed) {
      throw new Error(validation.error || 'Command validation failed');
    }

    const output = await sshService.executeCommand(
      sessionId,
      validation.modifiedCommand || command
    );

    return { output };
  }
}

export const shortcutsService = new ShortcutsService();
