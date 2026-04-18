import * as fs from 'fs';
import * as path from 'path';
import { getSnapshotsDir } from './storage';

export interface CacheEntry {
  url: string;
  etag?: string;
  lastModified?: string;
  cachedAt: string;
}

export type CacheMap = Record<string, CacheEntry>;

const CACHE_FILE = 'cache.json';

export function getCacheFilePath(): string {
  return path.join(getSnapshotsDir(), CACHE_FILE);
}

export function loadCache(): CacheMap {
  const filePath = getCacheFilePath();
  if (!fs.existsSync(filePath)) return {};
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw) as CacheMap;
  } catch {
    return {};
  }
}

export function saveCache(cache: CacheMap): void {
  const filePath = getCacheFilePath();
  fs.writeFileSync(filePath, JSON.stringify(cache, null, 2), 'utf-8');
}

export function updateCacheEntry(url: string, entry: Omit<CacheEntry, 'url' | 'cachedAt'>): void {
  const cache = loadCache();
  cache[url] = { url, ...entry, cachedAt: new Date().toISOString() };
  saveCache(cache);
}

export function getCacheEntry(url: string): CacheEntry | undefined {
  return loadCache()[url];
}

export function clearCache(): void {
  saveCache({});
}

export function parseCacheArgs(args: string[]): boolean {
  return args.includes('--no-cache') === false;
}
