import { enrichEndpoint, enrichEndpoints, parseEnrichArgs } from './enrich';

const base = { method: 'GET', path: '/users', status: 200 };

describe('enrichEndpoint', () => {
  it('returns endpoint unchanged when no options set', () => {
    const result = enrichEndpoint(base);
    expect(result).toEqual(base);
  });

  it('adds timestamp when addTimestamp is true', () => {
    const result = enrichEndpoint(base, { addTimestamp: true });
    expect(result['_enrichedAt']).toBeDefined();
    expect(typeof result['_enrichedAt']).toBe('string');
  });

  it('adds hash when addHash is true', () => {
    const result = enrichEndpoint(base, { addHash: true });
    expect(result['_hash']).toBeDefined();
    expect(typeof result['_hash']).toBe('string');
  });

  it('produces consistent hash for same input', () => {
    const r1 = enrichEndpoint(base, { addHash: true });
    const r2 = enrichEndpoint(base, { addHash: true });
    expect(r1['_hash']).toBe(r2['_hash']);
  });

  it('adds source field when addSource is provided', () => {
    const result = enrichEndpoint(base, { addSource: 'prod' });
    expect(result['_source']).toBe('prod');
  });

  it('prepends prefix to path', () => {
    const result = enrichEndpoint(base, { prefix: '/api/v1' });
    expect(result.path).toBe('/api/v1/users');
  });

  it('does not mutate original endpoint', () => {
    enrichEndpoint(base, { prefix: '/v2', addTimestamp: true });
    expect(base.path).toBe('/users');
    expect((base as Record<string, unknown>)['_enrichedAt']).toBeUndefined();
  });
});

describe('enrichEndpoints', () => {
  it('enriches all endpoints', () => {
    const endpoints = [base, { method: 'POST', path: '/items' }];
    const results = enrichEndpoints(endpoints, { addSource: 'test' });
    expect(results).toHaveLength(2);
    results.forEach((r) => expect(r['_source']).toBe('test'));
  });
});

describe('parseEnrichArgs', () => {
  it('parses --timestamp flag', () => {
    expect(parseEnrichArgs(['--timestamp'])).toMatchObject({ addTimestamp: true });
  });

  it('parses --hash flag', () => {
    expect(parseEnrichArgs(['--hash'])).toMatchObject({ addHash: true });
  });

  it('parses --source value', () => {
    expect(parseEnrichArgs(['--source', 'staging'])).toMatchObject({ addSource: 'staging' });
  });

  it('parses --prefix value', () => {
    expect(parseEnrichArgs(['--prefix', '/v2'])).toMatchObject({ prefix: '/v2' });
  });

  it('returns empty object for unknown args', () => {
    expect(parseEnrichArgs(['--unknown'])).toEqual({});
  });
});
