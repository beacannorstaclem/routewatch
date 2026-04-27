import {
  parseProjectionArgs,
  projectObject,
  applyProjection,
  formatProjectionSummary,
} from './projection';
import {
  parseProjectionConfig,
  mergeProjectionConfigs,
  projectionConfigToOptions,
} from './projection.config';

const sampleEndpoint = { method: 'GET', path: '/users', status: 200, latency: 42 };

describe('parseProjectionArgs', () => {
  it('parses include list', () => {
    const opts = parseProjectionArgs({ include: 'method,path' });
    expect(opts.include).toEqual(['method', 'path']);
    expect(opts.exclude).toBeUndefined();
  });

  it('parses exclude list', () => {
    const opts = parseProjectionArgs({ exclude: 'latency' });
    expect(opts.exclude).toEqual(['latency']);
  });

  it('returns empty opts when no args', () => {
    expect(parseProjectionArgs({})).toEqual({});
  });
});

describe('projectObject', () => {
  it('includes only specified fields', () => {
    const result = projectObject(sampleEndpoint, { include: ['method', 'path'] });
    expect(result).toEqual({ method: 'GET', path: '/users' });
  });

  it('excludes specified fields', () => {
    const result = projectObject(sampleEndpoint, { exclude: ['latency', 'status'] });
    expect(result).toEqual({ method: 'GET', path: '/users' });
  });

  it('returns full object when no opts', () => {
    const result = projectObject(sampleEndpoint, {});
    expect(result).toEqual(sampleEndpoint);
  });

  it('include takes precedence over exclude', () => {
    const result = projectObject(sampleEndpoint, { include: ['method'], exclude: ['latency'] });
    expect(Object.keys(result)).toEqual(['method']);
  });
});

describe('applyProjection', () => {
  it('maps projection over array', () => {
    const results = applyProjection([sampleEndpoint, sampleEndpoint], { include: ['status'] });
    expect(results).toHaveLength(2);
    expect(results[0]).toEqual({ status: 200 });
  });

  it('returns original array when opts are empty', () => {
    const results = applyProjection([sampleEndpoint], {});
    expect(results[0]).toEqual(sampleEndpoint);
  });
});

describe('formatProjectionSummary', () => {
  it('includes include fields in summary', () => {
    const s = formatProjectionSummary({ include: ['method', 'path'] }, 5);
    expect(s).toContain('5 endpoint(s)');
    expect(s).toContain('method, path');
  });

  it('includes exclude fields in summary', () => {
    const s = formatProjectionSummary({ exclude: ['latency'] }, 3);
    expect(s).toContain('latency');
  });
});

describe('parseProjectionConfig', () => {
  it('parses valid config object', () => {
    const cfg = parseProjectionConfig({ include: ['method'], exclude: ['latency'] });
    expect(cfg.include).toEqual(['method']);
    expect(cfg.exclude).toEqual(['latency']);
  });

  it('returns empty config for null input', () => {
    expect(parseProjectionConfig(null)).toEqual({});
  });
});

describe('mergeProjectionConfigs', () => {
  it('override wins over base', () => {
    const merged = mergeProjectionConfigs(
      { include: ['a'] },
      { include: ['b'] }
    );
    expect(merged.include).toEqual(['b']);
  });

  it('falls back to base when override is empty', () => {
    const merged = mergeProjectionConfigs({ exclude: ['x'] }, {});
    expect(merged.exclude).toEqual(['x']);
  });
});

describe('projectionConfigToOptions', () => {
  it('converts config to options', () => {
    const opts = projectionConfigToOptions({ include: ['method'], exclude: ['latency'] });
    expect(opts.include).toEqual(['method']);
    expect(opts.exclude).toEqual(['latency']);
  });
});
