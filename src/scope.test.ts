import { parseScopeArgs, applyScope, isScopeField, formatScopeSummary, Endpoint } from './scope';

const endpoints: Endpoint[] = [
  { method: 'GET', path: '/users', status: 200, tag: 'users' },
  { method: 'POST', path: '/users', status: 201, tag: 'users' },
  { method: 'GET', path: '/orders', status: 200, tag: 'orders' },
  { method: 'DELETE', path: '/orders/1', status: 204, tag: 'orders' },
];

describe('isScopeField', () => {
  it('returns true for valid fields', () => {
    expect(isScopeField('method')).toBe(true);
    expect(isScopeField('path')).toBe(true);
    expect(isScopeField('status')).toBe(true);
    expect(isScopeField('tag')).toBe(true);
  });

  it('returns false for invalid fields', () => {
    expect(isScopeField('body')).toBe(false);
    expect(isScopeField('')).toBe(false);
  });
});

describe('parseScopeArgs', () => {
  it('defaults to path field', () => {
    const opts = parseScopeArgs({});
    expect(opts.field).toBe('path');
  });

  it('parses include as array', () => {
    const opts = parseScopeArgs({ scopeInclude: ['users', 'orders'] });
    expect(opts.include).toEqual(['users', 'orders']);
  });

  it('wraps string include in array', () => {
    const opts = parseScopeArgs({ scopeInclude: 'users' });
    expect(opts.include).toEqual(['users']);
  });

  it('parses exclude', () => {
    const opts = parseScopeArgs({ scopeExclude: 'orders' });
    expect(opts.exclude).toEqual(['orders']);
  });
});

describe('applyScope', () => {
  it('filters by include pattern on path', () => {
    const result = applyScope(endpoints, { field: 'path', include: ['/users'] });
    expect(result).toHaveLength(2);
    expect(result.every((e) => e.path.includes('/users'))).toBe(true);
  });

  it('filters by exclude pattern on tag', () => {
    const result = applyScope(endpoints, { field: 'tag', exclude: ['orders'] });
    expect(result).toHaveLength(2);
    expect(result.every((e) => e.tag === 'users')).toBe(true);
  });

  it('returns all when no include or exclude', () => {
    const result = applyScope(endpoints, { field: 'path' });
    expect(result).toHaveLength(endpoints.length);
  });

  it('filters by method', () => {
    const result = applyScope(endpoints, { field: 'method', include: ['GET'] });
    expect(result).toHaveLength(2);
  });
});

describe('formatScopeSummary', () => {
  it('returns correct summary string', () => {
    const scoped = applyScope(endpoints, { field: 'tag', include: ['users'] });
    const summary = formatScopeSummary(endpoints, scoped);
    expect(summary).toContain('2 endpoint(s) retained');
    expect(summary).toContain('2 excluded');
  });
});
