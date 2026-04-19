import { summarizeSnapshot, formatSummary } from './summarize';
import type { Snapshot } from './snapshot';

const makeSnapshot = (endpoints: any[]): Snapshot =>
  ({ timestamp: '2024-01-01T00:00:00Z', endpoints } as Snapshot);

describe('summarizeSnapshot', () => {
  it('returns zeros for empty snapshot', () => {
    const result = summarizeSnapshot(makeSnapshot([]));
    expect(result.total).toBe(0);
    expect(result.byMethod).toEqual({});
    expect(result.byStatus).toEqual({});
    expect(result.avgResponseTime).toBeNull();
    expect(result.urls).toEqual([]);
  });

  it('counts methods correctly', () => {
    const result = summarizeSnapshot(makeSnapshot([
      { url: 'http://a.com/1', method: 'GET', status: 200 },
      { url: 'http://a.com/2', method: 'POST', status: 201 },
      { url: 'http://a.com/3', method: 'get', status: 200 },
    ]));
    expect(result.byMethod['GET']).toBe(2);
    expect(result.byMethod['POST']).toBe(1);
    expect(result.total).toBe(3);
  });

  it('counts statuses correctly', () => {
    const result = summarizeSnapshot(makeSnapshot([
      { url: 'http://a.com/1', method: 'GET', status: 200 },
      { url: 'http://a.com/2', method: 'GET', status: 404 },
      { url: 'http://a.com/3', method: 'GET', status: 200 },
    ]));
    expect(result.byStatus['200']).toBe(2);
    expect(result.byStatus['404']).toBe(1);
  });

  it('calculates average response time', () => {
    const result = summarizeSnapshot(makeSnapshot([
      { url: 'http://a.com/1', method: 'GET', status: 200, responseTime: 100 },
      { url: 'http://a.com/2', method: 'GET', status: 200, responseTime: 200 },
    ]));
    expect(result.avgResponseTime).toBe(150);
  });

  it('handles missing responseTime', () => {
    const result = summarizeSnapshot(makeSnapshot([
      { url: 'http://a.com/1', method: 'GET', status: 200 },
    ]));
    expect(result.avgResponseTime).toBeNull();
  });

  it('collects urls', () => {
    const result = summarizeSnapshot(makeSnapshot([
      { url: 'http://a.com/x', method: 'GET', status: 200 },
    ]));
    expect(result.urls).toContain('http://a.com/x');
  });
});

describe('formatSummary', () => {
  it('includes total and method/status breakdowns', () => {
    const summary = summarizeSnapshot(makeSnapshot([
      { url: 'http://a.com/1', method: 'GET', status: 200, responseTime: 50 },
    ]));
    const output = formatSummary(summary);
    expect(output).toContain('Total endpoints: 1');
    expect(output).toContain('GET: 1');
    expect(output).toContain('200: 1');
    expect(output).toContain('Avg response time: 50ms');
  });
});
