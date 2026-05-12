import crypto from 'crypto';

export function generateBackupCodes(count: number = 10): string[] {
  const codes: string[] = [];

  for (let i = 0; i < count; i++) {
    // Generate 8-character alphanumeric codes
    const code = crypto.randomBytes(4).toString('hex').toUpperCase();
    // Format as XXXX-XXXX for readability
    codes.push(`${code.slice(0, 4)}-${code.slice(4, 8)}`);
  }

  return codes;
}

export function hashBackupCode(code: string): string {
  // Remove dashes and normalize
  const normalized = code.replace(/-/g, '').toUpperCase();
  return crypto.createHash('sha256').update(normalized).digest('hex');
}

export function verifyBackupCode(code: string, hashedCodes: string[]): boolean {
  const hashed = hashBackupCode(code);
  return hashedCodes.includes(hashed);
}
