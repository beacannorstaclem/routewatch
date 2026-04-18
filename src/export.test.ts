import { exportSnapshot, exportDiff } from './export';
import { Snapshot } from './snapshot';
import { EndpointDiff } from './diff';

const mockSnapshot: Snapshot = {
  id: 'snap-001',
  createdAt: '2024-01-01T00:00:00Z',
  endpoints: [
    { method: 'GET', url: 'https://api.example.com/users', status: 200, latencyMs: 120 },
    { method: 'POST', url: 'https://api.example.com/users', status: 201, latencyMs: 200 },
  ],
};

const mockDiff: EndpointDiff = {
  added: [{ method: 'DELETE', url: 'https://api.example.com/users', status: 204, latencyMs: 80 }],
  removed: [{ method: 'PATCH', url: 'https://api.example.com/users', status: 200, latencyMs: 150 }],
  changed: [
    {
      method: 'GET',
      url: 'https://api.example.com/users',
      changes: { status: { from: 200, to: 503 } },
    },
  ],
};

describe('exportSnapshot', () => {
  it('exports snapshot as JSON', () => {
    const result = exportSnapshot(mockSnapshot, 'json');
    const parsed = JSON.parse(result);
    expect(parsed.id).toBe('snap-001');
    expect(parsed.endpoints).toHaveLength(2);
  });

  it('exports snapshot as CSV with header and rows', () => {
    const result = exportSnapshot(mockSnapshot, 'csv');
    const lines = result.split('\n');
    expect(lines[0]).toBe('method,url,status,latency_ms');
    expect(lines).toHaveLength(3);
    expect(lines[1]).toContain('GET');
  });

  it('exports snapshot as markdown table', () => {
    const result = exportSnapshot(mockSnapshot, 'markdown');
    expect(result).toContain('# Snapshot: snap-001');
    expect(result).toContain('| Method | URL | Status | Latency (ms) |');
    expect(result).toContain('GET');
  });

  it('throws on unsupported format', () => {
    expect(() => exportSnapshot(mockSnapshot, 'xml' as any)).toThrow('Unsupported export format');
  });
});

describe('exportDiff', () => {
  it('exports diff as JSON', () => {
    const result = exportDiff(mockDiff, 'json');
    const parsed = JSON.parse(result);
    expect(parsed.added).toHaveLength(1);
    expect(parsed.removed).toHaveLength(1);
  });

  it('exports diff as CSV', () => {
    const result = exportDiff(mockDiff, 'csv');
    expect(result).toContain('added,DELETE');
    expect(result).toContain('removed,PATCH');
    expect(result).toContain('changed,GET');
  });

  it('exports diff as markdown', () => {
    const result = exportDiff(mockDiff, 'markdown');
    expect(result).toContain('## Added');
    expect(result).toContain('## Removed');
    expect(result).toContain('## Changed');
    expect(result).toContain('status');
  });
});
