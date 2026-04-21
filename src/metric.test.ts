import {
  computeMetricSummary,
  formatMetricSummary,
  isMetricField,
  parseMetricArgs,
  EndpointMetric,
} from './metric';

const sample: EndpointMetric[] = [
  { method: 'GET', url: 'http://api.test/users', status: 200, latencyMs: 120, responseSize: 512, timestamp: '2024-01-01T00:00:00.000Z' },
  { method: 'GET', url: 'http://api.test/users', status: 200, latencyMs: 80, responseSize: 256, timestamp: '2024-01-01T00:01:00.000Z' },
  { method: 'POST', url: 'http://api.test/users', status: 201, latencyMs: 200, responseSize: 128, timestamp: '2024-01-01T00:02:00.000Z' },
  { method: 'GET', url: 'http://api.test/items', status: 500, latencyMs: 50, responseSize: 64, timestamp: '2024-01-01T00:03:00.000Z' },
];

describe('isMetricField', () => {
  it('returns true for valid fields', () => {
    expect(isMetricField('status')).toBe(true);
    expect(isMetricField('latency')).toBe(true);
    expect(isMetricField('size')).toBe(true);
    expect(isMetricField('count')).toBe(true);
  });
  it('returns false for invalid fields', () => {
    expect(isMetricField('unknown')).toBe(false);
    expect(isMetricField('')).toBe(false);
  });
});

describe('computeMetricSummary', () => {
  it('returns zeros for empty input', () => {
    const s = computeMetricSummary([]);
    expect(s.totalRequests).toBe(0);
    expect(s.avgLatencyMs).toBe(0);
  });
  it('computes correct totals', () => {
    const s = computeMetricSummary(sample);
    expect(s.totalRequests).toBe(4);
    expect(s.minLatencyMs).toBe(50);
    expect(s.maxLatencyMs).toBe(200);
    expect(s.avgLatencyMs).toBe(113);
    expect(s.statusCounts[200]).toBe(2);
    expect(s.statusCounts[201]).toBe(1);
    expect(s.statusCounts[500]).toBe(1);
  });
});

describe('parseMetricArgs', () => {
  it('returns defaults when no args', () => {
    expect(parseMetricArgs({})).toEqual(['status', 'latency']);
  });
  it('parses comma-separated fields', () => {
    expect(parseMetricArgs({ metric: 'size,count' })).toEqual(['size', 'count']);
  });
  it('filters invalid fields', () => {
    expect(parseMetricArgs({ metric: 'latency,bogus' })).toEqual(['latency']);
  });
});

describe('formatMetricSummary', () => {
  it('includes all summary lines', () => {
    const s = computeMetricSummary(sample);
    const output = formatMetricSummary(s);
    expect(output).toContain('Total Requests');
    expect(output).toContain('Avg Latency');
    expect(output).toContain('Status Counts');
  });
});
