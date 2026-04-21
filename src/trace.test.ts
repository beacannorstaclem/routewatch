import {
  endpointToTraceEntry,
  filterTraceEntries,
  formatTraceEntry,
  formatTraceSummary,
  parseTraceArgs,
  TraceEntry,
} from './trace';
import { Endpoint } from './index';

const mockEndpoint: Endpoint = {
  method: 'GET',
  url: 'https://api.example.com/users',
  statusCode: 200,
  tags: ['users', 'public'],
};

const makeEntry = (overrides: Partial<TraceEntry> = {}): TraceEntry => ({
  timestamp: '2024-01-01T00:00:00.000Z',
  method: 'GET',
  url: 'https://api.example.com/users',
  statusCode: 200,
  durationMs: 120,
  ...overrides,
});

describe('endpointToTraceEntry', () => {
  it('maps endpoint fields to trace entry', () => {
    const entry = endpointToTraceEntry(mockEndpoint, 250);
    expect(entry.method).toBe('GET');
    expect(entry.url).toBe('https://api.example.com/users');
    expect(entry.statusCode).toBe(200);
    expect(entry.durationMs).toBe(250);
    expect(entry.tags).toEqual(['users', 'public']);
    expect(entry.timestamp).toBeDefined();
  });
});

describe('filterTraceEntries', () => {
  const entries = [
    makeEntry({ durationMs: 50 }),
    makeEntry({ durationMs: 150 }),
    makeEntry({ durationMs: 300 }),
  ];

  it('filters by minDurationMs', () => {
    const result = filterTraceEntries(entries, { minDurationMs: 100 });
    expect(result).toHaveLength(2);
    expect(result.every((e) => e.durationMs >= 100)).toBe(true);
  });

  it('limits by maxEntries', () => {
    const result = filterTraceEntries(entries, { maxEntries: 2 });
    expect(result).toHaveLength(2);
  });

  it('returns all entries with no options', () => {
    const result = filterTraceEntries(entries, {});
    expect(result).toHaveLength(3);
  });
});

describe('formatTraceEntry', () => {
  it('formats entry with tags', () => {
    const entry = makeEntry({ tags: ['alpha'] });
    const out = formatTraceEntry(entry);
    expect(out).toContain('GET');
    expect(out).toContain('200');
    expect(out).toContain('120ms');
    expect(out).toContain('[alpha]');
  });

  it('omits tag section when no tags', () => {
    const entry = makeEntry({ tags: [] });
    const out = formatTraceEntry(entry);
    expect(out).not.toContain('[');
  });
});

describe('formatTraceSummary', () => {
  it('returns no entries message for empty array', () => {
    expect(formatTraceSummary([])).toBe('No trace entries.');
  });

  it('includes count and timing stats', () => {
    const entries = [makeEntry({ durationMs: 100 }), makeEntry({ durationMs: 200 })];
    const out = formatTraceSummary(entries);
    expect(out).toContain('2 entries');
    expect(out).toContain('avg: 150ms');
    expect(out).toContain('min: 100ms');
    expect(out).toContain('max: 200ms');
  });
});

describe('parseTraceArgs', () => {
  it('parses all options', () => {
    const opts = parseTraceArgs({ 'min-duration': 50, 'max-entries': 10, 'include-tags': true });
    expect(opts.minDurationMs).toBe(50);
    expect(opts.maxEntries).toBe(10);
    expect(opts.includeTags).toBe(true);
  });

  it('returns empty options for unknown args', () => {
    const opts = parseTraceArgs({});
    expect(opts).toEqual({});
  });
});
