import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { Logger } from '@nestjs/common';

const logger = new Logger('AuthConfig');

export async function hashPassword(password: string) {
  logger.debug('Hashing password', { length: password.length });
  return await bcrypt.hash(password, 12);
}

export function checkPassword(password: string, passwordHash: string): boolean {
  return bcrypt.compareSync(password, passwordHash);
}

export function generateRefreshToken() {
  return crypto.randomBytes(64).toString('hex');
}
