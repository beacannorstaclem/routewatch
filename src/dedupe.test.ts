import { dedupeEndpoints, parseDedupeArgs } from './dedupe';
import { Endpoint } from './snapshot';

const makeEndpoint = (method: string, url: string, statusCode = 200): Endpoint => ({
  method,
  url,
  statusCode,
  headers: {},
  body: null,
  timestamp: new Date().toISOString(),
});

describe('dedupeEndpoints', () => {
  it('removes duplicate method+url by default', () => {
    const eps = [
      makeEndpoint('GET', '/users'),
      makeEndpoint('GET', '/users'),
      makeEndpoint('POST', '/users'),
    ];
    expect(dedupeEndpoints(eps)).toHaveLength(2);
  });

  it('dedupes by url only', () => {
    const eps = [
      makeEndpoint('GET', '/users'),
      makeEndpoint('POST', '/users'),
    ];
    expect(dedupeEndpoints(eps, { by: 'url' })).toHaveLength(1);
  });

  it('dedupes by key (method+url+status)', () => {
    const eps = [
      makeEndpoint('GET', '/users', 200),
      makeEndpoint('GET', '/users', 404),
      makeEndpoint('GET', '/users', 200),
    ];
    expect(dedupeEndpoints(eps, { by: 'key' })).toHaveLength(2);
  });

  it('returns all when no duplicates', () => {
    const eps = [
      makeEndpoint('GET', '/a'),
      makeEndpoint('POST', '/b'),
    ];
    expect(dedupeEndpoints(eps)).toHaveLength(2);
  });
});

describe('parseDedupeArgs', () => {
  it('parses dedupe-by url', () => {
    expect(parseDedupeArgs({ 'dedupe-by': 'url' })).toEqual({ by: 'url' });
  });

  it('returns empty for unknown value', () => {
    expect(parseDedupeArgs({ 'dedupe-by': 'unknown' })).toEqual({});
  });

  it('returns empty when not set', () => {
    expect(parseDedupeArgs({})).toEqual({});
  });
});
