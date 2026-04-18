import { filterEndpoints, parseFilterArgs } from './filter';
import { Endpoint } from './snapshot';

const endpoints: Endpoint[] = [
  { method: 'GET', path: '/users', statusCode: 200, responseTime: 120, body: '{}' },
  { method: 'POST', path: '/users', statusCode: 201, responseTime: 80, body: '{}' },
  { method: 'DELETE', path: '/users/1', statusCode: 204, responseTime: 60, body: '' },
  { method: 'GET', path: '/health', statusCode: 200, responseTime: 10, body: 'ok' },
];

describe('filterEndpoints', () => {
  it('filters by method', () => {
    const result = filterEndpoints(endpoints, { methods: ['GET'] });
    expect(result).toHaveLength(2);
    expect(result.every((e) => e.method === 'GET')).toBe(true);
  });

  it('filters by multiple methods', () => {
    const result = filterEndpoints(endpoints, { methods: ['GET', 'POST'] });
    expect(result).toHaveLength(3);
  });

  it('filters by status code', () => {
    const result = filterEndpoints(endpoints, { statusCodes: [200] });
    expect(result).toHaveLength(2);
  });

  it('filters by path pattern', () => {
    const result = filterEndpoints(endpoints, { pathPattern: '^/users' });
    expect(result).toHaveLength(3);
  });

  it('filters by path pattern matching specific route', () => {
    const result = filterEndpoints(endpoints, { pathPattern: '/health' });
    expect(result).toHaveLength(1);
    expect(result[0].path).toBe('/health');
  });

  it('combines multiple filters', () => {
    const result = filterEndpoints(endpoints, { methods: ['GET'], statusCodes: [200] });
    expect(result).toHaveLength(2);
  });

  it('returns all endpoints when no filters applied', () => {
    const result = filterEndpoints(endpoints, {});
    expect(result).toHaveLength(4);
  });
});

describe('parseFilterArgs', () => {
  it('parses method filter', () => {
    const opts = parseFilterArgs({ method: 'GET,POST' });
    expect(opts.methods).toEqual(['GET', 'POST']);
  });

  it('parses status code filter', () => {
    const opts = parseFilterArgs({ status: '200,404' });
    expect(opts.statusCodes).toEqual([200, 404]);
  });

  it('parses path pattern', () => {
    const opts = parseFilterArgs({ path: '^/api' });
    expect(opts.pathPattern).toBe('^/api');
  });

  it('returns empty options for empty args', () => {
    const opts = parseFilterArgs({});
    expect(opts).toEqual({});
  });
});
