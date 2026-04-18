import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

let tmpDir: string;

jest.mock('./storage', () => ({
  getSnapshotsDir: () => tmpDir,
}));

import {
  loadCache,
  saveCache,
  updateCacheEntry,
  getCacheEntry,
  clearCache,
  parseCacheArgs,
} from './cache';

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'rw-cache-'));
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

test('loadCache returns empty object when no file', () => {
  expect(loadCache()).toEqual({});
});

test('saveCache and loadCache round-trip', () => {
  const cache = { 'http://a.com': { url: 'http://a.com', etag: '"abc"', cachedAt: '2024-01-01T00:00:00.000Z' } };
  saveCache(cache);
  expect(loadCache()).toEqual(cache);
});

test('updateCacheEntry adds entry with cachedAt', () => {
  updateCacheEntry('http://b.com', { etag: '"xyz"', lastModified: 'Wed, 01 Jan 2025 00:00:00 GMT' });
  const entry = getCacheEntry('http://b.com');
  expect(entry).toBeDefined();
  expect(entry!.etag).toBe('"xyz"');
  expect(entry!.url).toBe('http://b.com');
  expect(entry!.cachedAt).toBeTruthy();
});

test('getCacheEntry returns undefined for unknown url', () => {
  expect(getCacheEntry('http://unknown.com')).toBeUndefined();
});

test('clearCache empties the cache', () => {
  updateCacheEntry('http://c.com', { etag: '"1"' });
  clearCache();
  expect(loadCache()).toEqual({});
});

test('parseCacheArgs returns true by default', () => {
  expect(parseCacheArgs(['--watch', 'http://a.com'])).toBe(true);
});

test('parseCacheArgs returns false with --no-cache', () => {
  expect(parseCacheArgs(['--no-cache'])).toBe(false);
});
