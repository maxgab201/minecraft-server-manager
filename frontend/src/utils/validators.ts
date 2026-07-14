export interface ValidationResult {
  valid: boolean
  errors: Record<string, string>
}

export function validateSSHForm(
  username: string,
  host: string,
  port: number,
  privateKey: string
): ValidationResult {
  const errors: Record<string, string> = {}

  if (!username.trim()) {
    errors.username = 'Username is required'
  } else if (username.includes(' ')) {
    errors.username = 'Username cannot contain spaces'
  }

  if (!host.trim()) {
    errors.host = 'Host is required'
  } else {
    const hostnameRegex = /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$|^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$|^localhost$/i
    if (!hostnameRegex.test(host.trim())) {
      errors.host = 'Enter a valid hostname or IP address'
    }
  }

  if (!port || port < 1 || port > 65535) {
    errors.port = 'Port must be between 1 and 65535'
  }

  if (!privateKey.trim()) {
    errors.privateKey = 'SSH private key is required'
  } else if (!privateKey.includes('BEGIN') || !privateKey.includes('PRIVATE KEY')) {
    errors.privateKey = 'Invalid private key format'
  }

  return { valid: Object.keys(errors).length === 0, errors }
}

export function validateSSHKey(keyString: string): boolean {
  if (!keyString) return false
  const validHeaders = [
    '-----BEGIN OPENSSH PRIVATE KEY-----',
    '-----BEGIN RSA PRIVATE KEY-----',
    '-----BEGIN EC PRIVATE KEY-----',
    '-----BEGIN DSA PRIVATE KEY-----',
    '-----BEGIN PRIVATE KEY-----',
  ]
  return validHeaders.some((h) => keyString.trim().startsWith(h))
}
