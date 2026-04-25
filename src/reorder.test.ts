import {
  parseReorderArgs,
  reorderFields,
  reorderEndpoints,
  formatReorderSummary,
} from './reorder';
import {
  parseReorderConfig,
  reorderConfigToOptions,
  mergeReorderConfigs,
} from './reorder.config';

const endpoints = [
  { method: 'GET', path: '/z', status: 200 },
  { method: 'POST', path: '/a', status: 201 },
  { method: 'DELETE', path: '/m', status: 204 },
];

describe('parseReorderArgs', () => {
  it('parses reorder-by as comma-separated string', () => {
    const result = parseReorderArgs({ 'reorder-by': 'method,path' });
    expect(result.reorderBy).toEqual(['method', 'path']);
  });

  it('parses reorder-by as array', () => {
    const result = parseReorderArgs({ 'reorder-by': ['path', 'status'] });
    expect(result.reorderBy).toEqual(['path', 'status']);
  });

  it('parses direction', () => {
    const result = parseReorderArgs({ 'reorder-dir': 'desc' });
    expect(result.reorderDir).toBe('desc');
  });

  it('returns empty when no args', () => {
    const result = parseReorderArgs({});
    expect(result.reorderBy).toBeUndefined();
    expect(result.reorderDir).toBeUndefined();
  });
});

describe('reorderFields', () => {
  it('puts specified fields first', () => {
    const obj = { status: 200, method: 'GET', path: '/x' };
    const result = reorderFields(obj, ['path', 'method']);
    expect(Object.keys(result)).toEqual(['path', 'method', 'status']);
  });

  it('skips missing fields gracefully', () => {
    const obj = { a: 1, b: 2 };
    const result = reorderFields(obj, ['c', 'a']);
    expect(Object.keys(result)).toEqual(['a', 'b']);
  });
});

describe('reorderEndpoints', () => {
  it('sorts ascending by path', () => {
    const result = reorderEndpoints(endpoints, { fields: ['path'] });
    expect(result.map(e => e.path)).toEqual(['/a', '/m', '/z']);
  });

  it('sorts descending by path', () => {
    const result = reorderEndpoints(endpoints, { fields: ['path'], direction: 'desc' });
    expect(result.map(e => e.path)).toEqual(['/z', '/m', '/a']);
  });

  it('does not mutate original array', () => {
    const copy = [...endpoints];
    reorderEndpoints(endpoints, { fields: ['method'] });
    expect(endpoints).toEqual(copy);
  });
});

describe('formatReorderSummary', () => {
  it('includes count and field info', () => {
    const summary = formatReorderSummary(endpoints, endpoints, { fields: ['path'], direction: 'asc' });
    expect(summary).toContain('3 endpoint(s)');
    expect(summary).toContain('path');
    expect(summary).toContain('asc');
  });
});

describe('parseReorderConfig', () => {
  it('parses fields and direction', () => {
    const cfg = parseReorderConfig({ fields: ['method'], direction: 'desc' });
    expect(cfg.fields).toEqual(['method']);
    expect(cfg.direction).toBe('desc');
  });

  it('returns empty object for invalid input', () => {
    expect(parseReorderConfig(null)).toEqual({});
  });
});

describe('reorderConfigToOptions', () => {
  it('returns null when no fields', () => {
    expect(reorderConfigToOptions({})).toBeNull();
  });

  it('returns options with defaults', () => {
    const opts = reorderConfigToOptions({ fields: ['status'] });
    expect(opts?.direction).toBe('asc');
  });
});

describe('mergeReorderConfigs', () => {
  it('override takes precedence', () => {
    const merged = mergeReorderConfigs(
      { fields: ['path'], direction: 'asc' },
      { direction: 'desc' }
    );
    expect(merged.fields).toEqual(['path']);
    expect(merged.direction).toBe('desc');
  });
});
