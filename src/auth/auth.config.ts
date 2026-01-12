import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

export async function hashPassword(password: string) {
  console.log('Hashing password', password);
  return await bcrypt.hash(password, 12);
}

export function checkPassword(password: string, passwordHash: string): boolean {
  return bcrypt.compareSync(password, passwordHash);
}

export function generateRefreshToken() {
  return crypto.randomBytes(64).toString('hex');
}
