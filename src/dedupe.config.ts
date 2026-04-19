import * as fs from 'fs';
import { DedupeOptions } from './dedupe';

export interface DedupeConfig {
  enabled: boolean;
  by?: DedupeOptions['by'];
}

export function parseDedupeConfig(raw: unknown): DedupeConfig {
  if (typeof raw !== 'object' || raw === null) {
    return { enabled: false };
  }
  const obj = raw as Record<string, unknown>;
  const enabled = obj['enabled'] !== false;
  const by = obj['by'];
  return {
    enabled,
    by:
      by === 'url' || by === 'method+url' || by === 'key' ? by : undefined,
  };
}

export function loadDedupeConfig(configPath: string): DedupeConfig {
  if (!fs.existsSync(configPath)) {
    return { enabled: false };
  }
  try {
    const raw = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    return parseDedupeConfig(raw?.dedupe ?? raw);
  } catch {
    return { enabled: false };
  }
}
