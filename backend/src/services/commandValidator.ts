import { CONFIG } from '../config/env.js';

const BLOCKED_DIRECTORY_PATTERNS = [
  /^cd\s+(\/|~|\.\.)\s*$/,
  /^cd\s+\/etc\/?/,
  /^cd\s+\/var\/?/,
  /^cd\s+~\/?/,
  /^cd\s+\.\.\/?/,
  /\.\.\/?/,
];

const BLOCKED_COMMANDS = [
  /^sudo\b/,
  /^su\b/,
  /^ssh\b/,
  /^scp\b/,
  /^rsync\b/,
  /^telnet\b/,
  /^rlogin\b/,
  /^chmod\s+/,
  /^chown\s+/,
  /^mount\b/,
  /^umount\b/,
  /^rm\s+-rf\s+\//,
  /^rm\s+-rf\s+~/,
  /^rm\s+-rf\s+\/[/~]/,
];

const BLOCKED_ABSOLUTE_PATTERNS = [
  /^rm\s+\/[^o]/,
  /^rm\s+-rf\s+\/[^o]/,
];

export function validate(command: string): {
  allowed: boolean;
  error?: string;
  modifiedCommand?: string;
} {
  if (!command || typeof command !== 'string') {
    return { allowed: false, error: '❌ Access denied: Empty command' };
  }

  const trimmed = command.trim();

  if (trimmed.length === 0) {
    return { allowed: false, error: '❌ Access denied: Empty command' };
  }

  if (trimmed.startsWith('!')) {
    return { allowed: false, error: '❌ Access denied: Bang (!) commands are not allowed' };
  }

  for (const pattern of BLOCKED_DIRECTORY_PATTERNS) {
    if (pattern.test(trimmed)) {
      return {
        allowed: false,
        error: `❌ Access denied: Directory traversal is not allowed outside ${CONFIG.SERVER_DIR}`,
      };
    }
  }

  for (const pattern of BLOCKED_COMMANDS) {
    if (pattern.test(trimmed)) {
      return {
        allowed: false,
        error: `❌ Access denied: This command is restricted for security reasons`,
      };
    }
  }

  const absolutePathMatch = trimmed.match(/\/([a-zA-Z0-9_\-./]+)/);
  if (absolutePathMatch) {
    const path = absolutePathMatch[0];
    if (!path.startsWith(CONFIG.SERVER_DIR)) {
      return {
        allowed: false,
        error: `❌ Access denied: Only paths within ${CONFIG.SERVER_DIR} are allowed`,
      };
    }
  }

  return { allowed: true, modifiedCommand: trimmed };
}
