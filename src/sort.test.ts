import { parseSortArgs, sortEndpoints, isSortField } from './sort';
import { parseSortConfig, loadSortConfig } from './sort.config';

const endpoints = [
  { method: 'GET', path: '/users', status: 200, latency: 120 },
  { method: 'POST', path: '/auth', status: 201, latency: 80 },
  { method: 'DELETE', path: '/items', status: 204, latency: 200 },
];

describe('isSortField', () => {
  it('returns true for valid fields', () => {
    expect(isSortField('method')).toBe(true);
    expect(isSortField('latency')).toBe(true);
  });
  it('returns false for invalid fields', () => {
    expect(isSortField('unknown')).toBe(false);
  });
});

describe('parseSortArgs', () => {
  it('returns defaults when args are empty', () => {
    expect(parseSortArgs({})).toEqual({ field: 'path', order: 'asc' });
  });
  it('parses valid sort and order', () => {
    expect(parseSortArgs({ sort: 'latency', order: 'desc' })).toEqual({ field: 'latency', order: 'desc' });
  });
  it('falls back to path for invalid field', () => {
    expect(parseSortArgs({ sort: 'bogus' })).toEqual({ field: 'path', order: 'asc' });
  });
});

describe('sortEndpoints', () => {
  it('sorts by path asc', () => {
    const result = sortEndpoints(endpoints, { field: 'path', order: 'asc' });
    expect(result.map(e => e.path)).toEqual(['/auth', '/items', '/users']);
  });
  it('sorts by latency desc', () => {
    const result = sortEndpoints(endpoints, { field: 'latency', order: 'desc' });
    expect(result[0].latency).toBe(200);
    expect(result[2].latency).toBe(80);
  });
  it('does not mutate original array', () => {
    const copy = [...endpoints];
    sortEndpoints(endpoints, { field: 'method', order: 'asc' });
    expect(endpoints).toEqual(copy);
  });
});

describe('parseSortConfig', () => {
  it('uses defaults for empty config', () => {
    expect(parseSortConfig({})).toEqual({ field: 'path', order: 'asc' });
  });
  it('parses valid config', () => {
    expect(parseSortConfig({ field: 'status', order: 'desc' })).toEqual({ field: 'status', order: 'desc' });
  });
});

describe('loadSortConfig', () => {
  it('reads from env vars', () => {
    const env = { ROUTEWATCH_SORT_FIELD: 'method', ROUTEWATCH_SORT_ORDER: 'desc' };
    expect(loadSortConfig(env)).toEqual({ field: 'method', order: 'desc' });
  });
  it('returns defaults when env is empty', () => {
    expect(loadSortConfig({})).toEqual({ field: 'path', order: 'asc' });
  });
});
