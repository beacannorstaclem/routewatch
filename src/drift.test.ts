import {
  computeDriftScore,
  classifyDrift,
  buildDriftSummary,
  formatDriftSummary,
  parseDriftArgs,
} from './drift';
import { parseDriftConfig, driftConfigToOptions, mergeDriftConfigs } from './drift.config';
import type { DiffResult } from './diff';
import type { Endpoint } from './snapshot';

const ep = (method: string, path: string): Endpoint => ({ method, path, status: 200, headers: {}, body: null });

const diffs = (types: DiffResult['type'][]): DiffResult[] =>
  types.map((type, i) => ({ type, key: `GET /ep${i}`, endpoint: ep('GET', `/ep${i}`) } as DiffResult));

describe('computeDriftScore', () => {
  it('returns 0 for no endpoints', () => {
    expect(computeDriftScore([], 0)).toBe(0);
  });

  it('returns 0 when all unchanged', () => {
    expect(computeDriftScore(diffs(['unchanged', 'unchanged']), 2)).toBe(0);
  });

  it('returns 50 for half changed', () => {
    expect(computeDriftScore(diffs(['added', 'unchanged']), 2)).toBe(50);
  });

  it('caps at 100', () => {
    expect(computeDriftScore(diffs(['added', 'removed', 'modified']), 2)).toBe(100);
  });
});

describe('classifyDrift', () => {
  it('none for 0', () => expect(classifyDrift(0)).toBe('none'));
  it('low for 10', () => expect(classifyDrift(10)).toBe('low'));
  it('medium for 30', () => expect(classifyDrift(30)).toBe('medium'));
  it('high for 75', () => expect(classifyDrift(75)).toBe('high'));
});

describe('buildDriftSummary', () => {
  const endpoints = [ep('GET', '/a'), ep('POST', '/b'), ep('DELETE', '/c')];

  it('builds summary with defaults', () => {
    const d = diffs(['added', 'unchanged', 'removed']);
    const s = buildDriftSummary(d, endpoints);
    expect(s.changedCount).toBe(2);
    expect(s.totalCount).toBe(3);
  });

  it('respects ignoreAdded', () => {
    const d = diffs(['added', 'removed']);
    const s = buildDriftSummary(d, endpoints, { ignoreAdded: true });
    expect(s.changedCount).toBe(1);
  });

  it('respects ignoreRemoved', () => {
    const d = diffs(['added', 'removed']);
    const s = buildDriftSummary(d, endpoints, { ignoreRemoved: true });
    expect(s.changedCount).toBe(1);
  });
});

describe('formatDriftSummary', () => {
  it('formats correctly', () => {
    const s = { score: 33, level: 'medium' as const, changedCount: 1, totalCount: 3, windowSize: 5 };
    const out = formatDriftSummary(s);
    expect(out).toContain('MEDIUM');
    expect(out).toContain('score=33');
    expect(out).toContain('window=5');
  });
});

describe('parseDriftArgs', () => {
  it('parses threshold and window', () => {
    const opts = parseDriftArgs({ threshold: 25, window: 3, 'ignore-added': true });
    expect(opts.threshold).toBe(25);
    expect(opts.window).toBe(3);
    expect(opts.ignoreAdded).toBe(true);
  });
});

describe('drift.config', () => {
  it('parseDriftConfig returns empty for invalid input', () => {
    expect(parseDriftConfig(null)).toEqual({});
    expect(parseDriftConfig('bad')).toEqual({});
  });

  it('parseDriftConfig parses valid object', () => {
    const c = parseDriftConfig({ threshold: 10, window: 2, ignoreAdded: true });
    expect(c.threshold).toBe(10);
    expect(c.ignoreAdded).toBe(true);
  });

  it('driftConfigToOptions maps fields', () => {
    const opts = driftConfigToOptions({ threshold: 15, ignoreRemoved: false });
    expect(opts.threshold).toBe(15);
    expect(opts.ignoreRemoved).toBe(false);
  });

  it('mergeDriftConfigs merges left to right', () => {
    const merged = mergeDriftConfigs({ threshold: 10 }, { threshold: 20, window: 3 });
    expect(merged.threshold).toBe(20);
    expect(merged.window).toBe(3);
  });
});
