import * as crypto from 'crypto';
import { encoding_for_model } from 'tiktoken';
import { AI_LIMITS, ISimilarSearch } from '..';

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

const encoder = encoding_for_model('gpt-4o-mini');

export function estimateTokens(text: string): number {
  return encoder.encode(text).length;
}

export function truncateContext(
  chunks: ISimilarSearch[],
  maxTokens: number = AI_LIMITS.MAX_CONTEXT_TOKENS,
): ISimilarSearch[] {
  let usedTokens = 0;
  const selected: ISimilarSearch[] = [];

  for (const chunk of chunks) {
    const chunkTokens = encoder.encode(chunk.content).length;

    if (usedTokens + chunkTokens > maxTokens) {
      break;
    }

    selected.push(chunk);
    usedTokens += chunkTokens;
  }

  return selected;
}

export async function retry<T>(
  fn: () => Promise<T>,
  retries = 3,
  delay = 500
): Promise<T> {
  try {
    return await fn();
  } catch (err: any) {
    if (retries <= 0) throw err;

    const retryable =
      err?.status === 429 ||
      err?.status >= 500 ||
      err?.code === 'ECONNRESET' ||
      err?.code === 'ETIMEDOUT';

    if (!retryable) throw err;

    await new Promise(res => setTimeout(res, delay));

    return retry(fn, retries - 1, delay * 2);
  }
}
