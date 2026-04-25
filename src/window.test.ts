import { parseWindowArgs, applyWindow, formatWindowSummary } from './window';

const rows = [
  { method: 'GET', path: '/users', status: 200, latency: 120 },
  { method: 'GET', path: '/users', status: 200, latency: 95 },
  { method: 'GET', path: '/users', status: 500, latency: 300 },
  { method: 'POST', path: '/items', status: 201, latency: 80 },
  { method: 'POST', path: '/items', status: 201, latency: 110 },
];

describe('parseWindowArgs', () => {
  it('parses valid args', () => {
    const opts = parseWindowArgs({ size: 3, field: 'latency', aggregation: 'avg' });
    expect(opts).toEqual({ size: 3, field: 'latency', aggregation: 'avg' });
  });

  it('defaults field to status and aggregation to count', () => {
    const opts = parseWindowArgs({ size: 5 });
    expect(opts.field).toBe('status');
    expect(opts.aggregation).toBe('count');
  });

  it('throws on invalid size', () => {
    expect(() => parseWindowArgs({ size: 0 })).toThrow('Invalid window size');
    expect(() => parseWindowArgs({ size: 'abc' })).toThrow('Invalid window size');
  });

  it('throws on invalid aggregation', () => {
    expect(() => parseWindowArgs({ size: 3, aggregation: 'sum' })).toThrow('Invalid aggregation');
  });

  it('parses string size', () => {
    const opts = parseWindowArgs({ size: '10', field: 'status', aggregation: 'max' });
    expect(opts.size).toBe(10);
  });
});

describe('applyWindow', () => {
  it('groups by method:path and slices to window size', () => {
    const results = applyWindow(rows, { size: 2, field: 'latency', aggregation: 'avg' });
    const users = results.find(r => r.key === 'GET:/users')!;
    expect(users.values).toHaveLength(2);
    expect(users.values).toEqual([95, 300]);
  });

  it('computes avg correctly', () => {
    const results = applyWindow(rows, { size: 10, field: 'latency', aggregation: 'avg' });
    const items = results.find(r => r.key === 'POST:/items')!;
    expect(items.aggregated).toBe(95);
  });

  it('computes min and max', () => {
    const results = applyWindow(rows, { size: 10, field: 'latency', aggregation: 'min' });
    const users = results.find(r => r.key === 'GET:/users')!;
    expect(users.aggregated).toBe(95);
    const maxResults = applyWindow(rows, { size: 10, field: 'latency', aggregation: 'max' });
    expect(maxResults.find(r => r.key === 'GET:/users')!.aggregated).toBe(300);
  });

  it('computes count', () => {
    const results = applyWindow(rows, { size: 10, field: 'status', aggregation: 'count' });
    expect(results.find(r => r.key === 'GET:/users')!.aggregated).toBe(3);
  });

  it('returns empty array for empty input', () => {
    expect(applyWindow([], { size: 5, field: 'status', aggregation: 'count' })).toEqual([]);
  });
});

describe('formatWindowSummary', () => {
  it('returns no results message for empty array', () => {
    expect(formatWindowSummary([])).toBe('No window results.');
  });

  it('formats results with endpoint count', () => {
    const results = applyWindow(rows, { size: 5, field: 'latency', aggregation: 'avg' });
    const summary = formatWindowSummary(results);
    expect(summary).toContain('Window Summary');
    expect(summary).toContain('GET:/users');
    expect(summary).toContain('POST:/items');
  });
});
