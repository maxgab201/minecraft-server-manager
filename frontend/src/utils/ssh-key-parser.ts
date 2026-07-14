import { validateSSHKey } from './validators'

export interface ParsedKey {
  valid: boolean
  type: string | null
  error: string | null
}

export function parseSSHKey(keyString: string): ParsedKey {
  if (!keyString || !keyString.trim()) {
    return { valid: false, type: null, error: 'No key provided' }
  }

  if (!validateSSHKey(keyString)) {
    return { valid: false, type: null, error: 'Key must start with a valid header (e.g. -----BEGIN OPENSSH PRIVATE KEY-----)' }
  }

  const lines = keyString.trim().split('\n')
  const header = lines[0].trim()

  let type: string | null = null
  if (header.includes('OPENSSH')) type = 'OpenSSH'
  else if (header.includes('RSA')) type = 'RSA'
  else if (header.includes('EC')) type = 'EC'
  else if (header.includes('DSA')) type = 'DSA'
  else type = 'PKCS#8'

  if (lines.length < 3) {
    return { valid: false, type, error: 'Key appears to be truncated' }
  }

  const footer = lines[lines.length - 1].trim()
  if (!footer.includes('END') || !footer.includes('PRIVATE KEY')) {
    return { valid: false, type, error: 'Key is missing proper footer' }
  }

  const bodyLines = lines.slice(1, -1).filter((l) => l.trim().length > 0)
  if (bodyLines.length === 0) {
    return { valid: false, type, error: 'Key body is empty' }
  }

  const base64Regex = /^[A-Za-z0-9+/=]+$/
  for (const line of bodyLines) {
    if (!base64Regex.test(line.trim())) {
      return { valid: false, type, error: 'Key body contains invalid base64 characters' }
    }
  }

  return { valid: true, type, error: null }
}

export function formatKeyName(filename: string): string {
  if (!filename) return 'Unknown key'
  const known = ['id_rsa', 'id_ed25519', 'id_ecdsa', 'id_dsa', 'id_ecdsa_sk', 'id_ed25519_sk']
  const name = filename.replace(/\.(pem|key|priv|txt)$/i, '')
  if (known.includes(name)) {
    const typeMap: Record<string, string> = {
      id_rsa: 'RSA',
      id_ed25519: 'Ed25519',
      id_ecdsa: 'ECDSA',
      id_dsa: 'DSA',
      id_ecdsa_sk: 'ECDSA-SK',
      id_ed25519_sk: 'Ed25519-SK',
    }
    return `${typeMap[name] || name} key`
  }
  return name
}
