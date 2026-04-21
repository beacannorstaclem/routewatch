import { pruneEndpoints, parsePruneArgs, formatPruneSummary } from './prune';
import { parsePruneConfig, mergePruneConfigs, pruneConfigToOptions } from './prune.config';
import { Endpoint } from './index';

const NOW = new Date('2024-06-01T00:00:00Z').getTime();

function ep(method: string, path: string, status?: number, daysAgo?: number): Endpoint {
  return {
    method,
    path,
    status,
    timestamp: daysAgo != null
      ? new Date(NOW - daysAgo * 86_400_000).toISOString()
      : undefined,
  } as unknown as Endpoint;
}

describe('pruneEndpoints', () => {
  it('keeps all endpoints when no options given', () => {
    const endpoints = [ep('GET', '/a'), ep('POST', '/b')];
    const result = pruneEndpoints(endpoints, {}, NOW);
    expect(result.keptCount).toBe(2);
    expect(result.removedCount).toBe(0);
  });

  it('removes endpoints by status code', () => {
    const endpoints = [ep('GET', '/a', 200), ep('GET', '/b', 404), ep('DELETE', '/c', 500)];
    const result = pruneEndpoints(endpoints, { statusCodes: [404, 500] }, NOW);
    expect(result.keptCount).toBe(1);
    expect(result.removedCount).toBe(2);
  });

  it('removes endpoints by method', () => {
    const endpoints = [ep('GET', '/a'), ep('DELETE', '/b'), ep('POST', '/c')];
    const result = pruneEndpoints(endpoints, { methods: ['DELETE'] }, NOW);
    expect(result.keptCount).toBe(2);
    expect(result.removedCount).toBe(1);
    expect(result.removed[0].method).toBe('DELETE');
  });

  it('removes endpoints by path pattern', () => {
    const endpoints = [ep('GET', '/internal/health'), ep('GET', '/api/users'), ep('GET', '/internal/metrics')];
    const result = pruneEndpoints(endpoints, { pathPattern: '^/internal' }, NOW);
    expect(result.keptCount).toBe(1);
    expect(result.removedCount).toBe(2);
  });

  it('removes endpoints older than maxAge', () => {
    const endpoints = [ep('GET', '/old', 200, 40), ep('GET', '/new', 200, 5)];
    const result = pruneEndpoints(endpoints, { maxAge: 30 }, NOW);
    expect(result.keptCount).toBe(1);
    expect(result.removed[0].path).toBe('/old');
  });
});

describe('parsePruneArgs', () => {
  it('parses status codes from comma string', () => {
    const opts = parsePruneArgs({ status: '404,500' });
    expect(opts.statusCodes).toEqual([404, 500]);
  });

  it('parses methods to uppercase', () => {
    const opts = parsePruneArgs({ method: 'delete,patch' });
    expect(opts.methods).toEqual(['DELETE', 'PATCH']);
  });

  it('parses max-age as number', () => {
    const opts = parsePruneArgs({ 'max-age': 7 });
    expect(opts.maxAge).toBe(7);
  });
});

describe('formatPruneSummary', () => {
  it('includes kept and removed counts', () => {
    const result = { kept: [], removed: [ep('GET', '/old', 404)], keptCount: 3, removedCount: 1 };
    const summary = formatPruneSummary(result);
    expect(summary).toContain('Kept:    3');
    expect(summary).toContain('Removed: 1');
    expect(summary).toContain('[GET] /old');
  });
});

describe('parsePruneConfig', () => {
  it('parses valid config object', () => {
    const config = parsePruneConfig({ maxAge: 14, statusCodes: [404], methods: ['delete'], pathPattern: '^/v1' });
    expect(config.maxAge).toBe(14);
    expect(config.statusCodes).toEqual([404]);
    expect(config.methods).toEqual(['DELETE']);
    expect(config.pathPattern).toBe('^/v1');
  });

  it('returns empty config for invalid input', () => {
    expect(parsePruneConfig(null)).toEqual({});
    expect(parsePruneConfig('bad')).toEqual({});
  });
});

describe('mergePruneConfigs', () => {
  it('override takes precedence', () => {
    const merged = mergePruneConfigs({ maxAge: 30 }, { maxAge: 7 });
    expect(merged.maxAge).toBe(7);
  });

  it('falls back to base when override is missing', () => {
    const merged = mergePruneConfigs({ maxAge: 30, methods: ['DELETE'] }, {});
    expect(merged.maxAge).toBe(30);
    expect(merged.methods).toEqual(['DELETE']);
  });
});

describe('pruneConfigToOptions', () => {
  it('maps config to options', () => {
    const opts = pruneConfigToOptions({ maxAge: 10, statusCodes: [500], methods: ['PATCH'], pathPattern: '/old' });
    expect(opts).toEqual({ maxAge: 10, statusCodes: [500], methods: ['PATCH'], pathPattern: '/old' });
  });
});
