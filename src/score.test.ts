import { describe, it, expect } from 'vitest';
import {
  scoreEndpoint,
  scoreSnapshot,
  formatScoreSummary,
  parseScoreArgs,
  isScoreField,
} from './score';
import type { Endpoint } from './index';

const makeEndpoint = (overrides: Partial<Endpoint> = {}): Endpoint => ({
  method: 'GET',
  path: '/api/test',
  status: 200,
  latency: 100,
  size: 512,
  ...overrides,
} as Endpoint);

describe('isScoreField', () => {
  it('returns true for valid fields', () => {
    expect(isScoreField('status')).toBe(true);
    expect(isScoreField('latency')).toBe(true);
    expect(isScoreField('size')).toBe(true);
    expect(isScoreField('errors')).toBe(true);
  });

  it('returns false for invalid fields', () => {
    expect(isScoreField('unknown')).toBe(false);
    expect(isScoreField('')).toBe(false);
  });
});

describe('scoreEndpoint', () => {
  it('gives high score to healthy endpoint', () => {
    const ep = makeEndpoint({ status: 200, latency: 50 });
    const result = scoreEndpoint(ep);
    expect(result.score).toBeGreaterThan(0.8);
  });

  it('penalises non-2xx status', () => {
    const ep = makeEndpoint({ status: 500 });
    const result = scoreEndpoint(ep);
    expect(result.breakdown.status).toBe(0);
  });

  it('penalises high latency', () => {
    const ep = makeEndpoint({ latency: 4999 });
    const result = scoreEndpoint(ep);
    expect(result.breakdown.latency).toBeLessThan(0.01);
  });

  it('penalises endpoints with errors', () => {
    const ep = makeEndpoint({ error: 'timeout' } as Endpoint);
    const result = scoreEndpoint(ep);
    expect(result.breakdown.errors).toBe(0);
  });
});

describe('scoreSnapshot', () => {
  it('scores all endpoints', () => {
    const endpoints = [makeEndpoint(), makeEndpoint({ path: '/b', status: 404 })];
    const results = scoreSnapshot(endpoints);
    expect(results).toHaveLength(2);
  });
});

describe('formatScoreSummary', () => {
  it('returns message for empty list', () => {
    expect(formatScoreSummary([])).toBe('No endpoints scored.');
  });

  it('includes avg and per-endpoint lines', () => {
    const eps = [makeEndpoint()];
    const scores = scoreSnapshot(eps);
    const output = formatScoreSummary(scores);
    expect(output).toContain('avg:');
    expect(output).toContain('GET /api/test');
  });
});

describe('parseScoreArgs', () => {
  it('returns defaults for empty args', () => {
    const w = parseScoreArgs({});
    expect(w.status).toBe(0.4);
    expect(w.latency).toBe(0.3);
  });

  it('overrides individual weights', () => {
    const w = parseScoreArgs({ 'score-weight-status': 0.9 });
    expect(w.status).toBe(0.9);
    expect(w.latency).toBe(0.3);
  });
});
