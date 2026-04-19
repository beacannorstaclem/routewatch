import { compareEndpoints, formatCompareResults, isCompareField, COMPARE_FIELDS } from './compare';
import { Endpoint } from './snapshot';

const base: Endpoint = { method: 'GET', url: 'https://api.example.com/users', status: 200, headers: { 'content-type': 'application/json' }, body: { count: 1 }, latency: 120 };

describe('isCompareField', () => {
  it('accepts valid fields', () => {
    COMPARE_FIELDS.forEach(f => expect(isCompareField(f)).toBe(true));
  });
  it('rejects invalid', () => {
    expect(isCompareField('foo')).toBe(false);
  });
});

describe('compareEndpoints', () => {
  it('reports match when identical', () => {
    const results = compareEndpoints(base, { ...base }, { fields: ['status', 'body'] });
    expect(results.every(r => r.match)).toBe(true);
  });

  it('detects status mismatch', () => {
    const right = { ...base, status: 404 };
    const results = compareEndpoints(base, right, { fields: ['status'] });
    expect(results[0].match).toBe(false);
  });

  it('detects body mismatch', () => {
    const right = { ...base, body: { count: 2 } };
    const results = compareEndpoints(base, right, { fields: ['body'] });
    expect(results[0].match).toBe(false);
  });

  it('ignores specified keys in body', () => {
    const right = { ...base, body: { count: 1, ts: 999 } };
    const results = compareEndpoints(base, right, { fields: ['body'], ignoreKeys: ['ts'] });
    expect(results[0].match).toBe(true);
  });

  it('respects latency threshold', () => {
    const right = { ...base, latency: 130 };
    const results = compareEndpoints(base, right, { fields: ['latency'], latencyThreshold: 20 });
    expect(results[0].match).toBe(true);
  });

  it('fails latency outside threshold', () => {
    const right = { ...base, latency: 300 };
    const results = compareEndpoints(base, right, { fields: ['latency'], latencyThreshold: 10 });
    expect(results[0].match).toBe(false);
  });
});

describe('formatCompareResults', () => {
  it('shows checkmark for matches', () => {
    const results = compareEndpoints(base, { ...base }, { fields: ['status'] });
    expect(formatCompareResults(results)).toContain('✓');
  });

  it('shows cross and diff for mismatches', () => {
    const right = { ...base, status: 500 };
    const results = compareEndpoints(base, right, { fields: ['status'] });
    const out = formatCompareResults(results);
    expect(out).toContain('✗');
    expect(out).toContain('200');
    expect(out).toContain('500');
  });
});
