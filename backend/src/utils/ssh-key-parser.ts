import { utils, ParsedKey } from 'ssh2';

export function parseKey(keyString: string): ParsedKey {
  if (!keyString || typeof keyString !== 'string') {
    throw new Error('Private key must be a non-empty string');
  }

  const trimmed = keyString.trim();

  if (!trimmed.includes('BEGIN') && !trimmed.includes('OPENSSH')) {
    throw new Error(
      'Invalid key format. Key must be in PEM or OpenSSH format.'
    );
  }

  const keyInfo = utils.parseKey(trimmed);
  if (keyInfo instanceof Error) {
    throw new Error(`Failed to parse private key: ${keyInfo.message}`);
  }

  return keyInfo;
}
