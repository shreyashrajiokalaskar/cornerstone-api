import * as crypto from 'crypto';

export function safeFilename(name: string): string {
  const ext = name.split('.').pop() || '';
  const base = name
    .replace(/\.[^/.]+$/, '') // remove extension
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-') // replace unsafe chars
    .replace(/(^-|-$)/g, ''); // trim dashes

  return `${base}.${ext.toLowerCase()}`;
}

export function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

export function getHashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}
