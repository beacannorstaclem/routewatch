import { replayEndpoint, replayAll, parseReplayArgs, formatReplaySummary, ReplayResult } from './replay';
import { Endpoint } from './snapshot';

jest.mock('./fetch', () => ({
  fetchEndpoint: jest.fn().mockResolvedValue({ status: 200, body: '{}', headers: {} }),
}));
jest.mock('./auth', () => ({
  applyAuth: jest.fn((_cfg: unknown, headers: Record<string, string>) => headers),
}));
jest.mock('./header', () => ({
  mergeHeaders: jest.fn((...maps: Record<string, string>[]) => Object.assign({}, ...maps)),
}));

const endpoint: Endpoint = { method: 'GET', url: 'https://api.example.com/users', status: 200, headers: {} };

describe('replayEndpoint', () => {
  it('returns skipped result when dryRun is true', async () => {
    const result = await replayEndpoint(endpoint, { dryRun: true });
    expect(result.skipped).toBe(true);
    expect(result.status).toBe(0);
  });

  it('calls fetchEndpoint and returns result', async () => {
    const result = await replayEndpoint(endpoint, {});
    expect(result.skipped).toBe(false);
    expect(result.status).toBe(200);
    expect(result.ok).toBe(true);
    expect(result.durationMs).toBeGreaterThanOrEqual(0);
  });
});

describe('replayAll', () => {
  it('replays all endpoints', async () => {
    const endpoints = [endpoint, { ...endpoint, url: 'https://api.example.com/posts' }];
    const results = await replayAll(endpoints, {});
    expect(results).toHaveLength(2);
    expect(results.every((r) => r.ok)).toBe(true);
  });

  it('respects delay option without error', async () => {
    const results = await replayAll([endpoint], { delay: 1 });
    expect(results).toHaveLength(1);
  });
});

describe('parseReplayArgs', () => {
  it('parses delay and dryRun', () => {
    const opts = parseReplayArgs({ delay: 100, 'dry-run': true });
    expect(opts.delay).toBe(100);
    expect(opts.dryRun).toBe(true);
  });

  it('parses auth-token and headers', () => {
    const opts = parseReplayArgs({ 'auth-token': 'tok', headers: { 'X-Foo': 'bar' } });
    expect(opts.authToken).toBe('tok');
    expect(opts.headers).toEqual({ 'X-Foo': 'bar' });
  });

  it('returns empty object for unknown args', () => {
    const opts = parseReplayArgs({});
    expect(opts.delay).toBeUndefined();
    expect(opts.dryRun).toBeUndefined();
  });
});

describe('formatReplaySummary', () => {
  it('formats a summary correctly', () => {
    const results: ReplayResult[] = [
      { endpoint, status: 200, ok: true, durationMs: 120, skipped: false },
      { endpoint, status: 500, ok: false, durationMs: 80, skipped: false },
      { endpoint, status: 0, ok: true, durationMs: 0, skipped: true },
    ];
    const summary = formatReplaySummary(results);
    expect(summary).toContain('3 total');
    expect(summary).toContain('1 ok');
    expect(summary).toContain('1 failed');
    expect(summary).toContain('1 skipped');
    expect(summary).toContain('avg 100ms');
  });

  it('handles all skipped', () => {
    const results: ReplayResult[] = [
      { endpoint, status: 0, ok: true, durationMs: 0, skipped: true },
    ];
    const summary = formatReplaySummary(results);
    expect(summary).toContain('avg 0ms');
  });
});
