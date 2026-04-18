import * as fs from 'fs';
import * as path from 'path';

export interface CacheConfig {
  enabled: boolean;
  ttlSeconds?: number;
  respectEtag: boolean;
  respectLastModified: boolean;
}

const DEFAULTS: CacheConfig = {
  enabled: true,
  ttlSeconds: undefined,
  respectEtag: true,
  respectLastModified: true,
};

export function parseCacheConfig(raw: Record<string, unknown>): CacheConfig {
  return {
    enabled: raw.enabled !== false,
    ttlSeconds: typeof raw.ttlSeconds === 'number' ? raw.ttlSeconds : undefined,
    respectEtag: raw.respectEtag !== false,
    respectLastModified: raw.respectLastModified !== false,
  };
}

export function loadCacheConfig(configPath?: string): CacheConfig {
  const filePath = configPath ?? path.resolve(process.cwd(), 'cache.config.json');
  if (!fs.existsSync(filePath)) return { ...DEFAULTS };
  try {
    const raw = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    return parseCacheConfig(raw);
  } catch {
    return { ...DEFAULTS };
  }
}

export function isCacheStale(cachedAt: string, ttlSeconds: number): boolean {
  const age = (Date.now() - new Date(cachedAt).getTime()) / 1000;
  return age > ttlSeconds;
}
