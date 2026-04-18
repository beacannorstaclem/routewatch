import * as fs from 'fs';
import * as path from 'path';
import { RetryOptions, DEFAULT_RETRY_OPTIONS } from './retry';

export interface RetryConfig {
  maxAttempts?: number;
  delayMs?: number;
  backoff?: boolean;
}

export function parseRetryConfig(raw: unknown): RetryOptions {
  if (typeof raw !== 'object' || raw === null) return { ...DEFAULT_RETRY_OPTIONS };
  const obj = raw as Record<string, unknown>;
  const opts: RetryOptions = { ...DEFAULT_RETRY_OPTIONS };
  if (typeof obj.maxAttempts === 'number' && obj.maxAttempts >= 1) {
    opts.maxAttempts = obj.maxAttempts;
  }
  if (typeof obj.delayMs === 'number' && obj.delayMs >= 0) {
    opts.delayMs = obj.delayMs;
  }
  if (typeof obj.backoff === 'boolean') {
    opts.backoff = obj.backoff;
  }
  return opts;
}

export function loadRetryConfig(configPath?: string): RetryOptions {
  const filePath = configPath ?? path.resolve(process.cwd(), '.routewatch-retry.json');
  if (!fs.existsSync(filePath)) return { ...DEFAULT_RETRY_OPTIONS };
  try {
    const raw = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    return parseRetryConfig(raw);
  } catch {
    return { ...DEFAULT_RETRY_OPTIONS };
  }
}
