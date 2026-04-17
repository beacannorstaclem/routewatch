import { diffSnapshots } from './diff';
import { SnapshotFile } from './snapshot';

const makeSnapshot = (id: string, endpoints: Record<string, unknown>[]): SnapshotFile => ({
  id,
  createdAt: new Date().toISOString(),
  baseUrl: 'http://example.com',
  endpoints: endpoints as any,
});

describe('diffSnapshots', () => {
  it('detects added endpoints', () => {
    const base = makeSnapshot('snap-1', [{ method: 'GET', path: '/users' }]);
    const head = makeSnapshot('snap-2', [
      { method: 'GET', path: '/users' },
      { method: 'POST', path: '/users' },
    ]);
    const result = diffSnapshots(base, head);
    expect(result.summary.added).toBe(1);
    expect(result.summary.removed).toBe(0);
    expect(result.changes[0].type).toBe('added');
    expect(result.changes[0].path).toBe('/users');
  });

  it('detects removed endpoints', () => {
    const base = makeSnapshot('snap-1', [
      { method: 'GET', path: '/users' },
      { method: 'DELETE', path: '/users/:id' },
    ]);
    const head = makeSnapshot('snap-2', [{ method: 'GET', path: '/users' }]);
    const result = diffSnapshots(base, head);
    expect(result.summary.removed).toBe(1);
    expect(result.changes[0].type).toBe('removed');
  });

  it('detects modified endpoints', () => {
    const base = makeSnapshot('snap-1', [{ method: 'GET', path: '/users', statusCode: 200 }]);
    const head = makeSnapshot('snap-2', [{ method: 'GET', path: '/users', statusCode: 404 }]);
    const result = diffSnapshots(base, head);
    expect(result.summary.modified).toBe(1);
    expect(result.changes[0].type).toBe('modified');
    expect(result.changes[0].before).toBeDefined();
    expect(result.changes[0].after).toBeDefined();
  });

  it('returns empty diff for identical snapshots', () => {
    const endpoints = [{ method: 'GET', path: '/health' }];
    const base = makeSnapshot('snap-1', endpoints);
    const head = makeSnapshot('snap-2', endpoints);
    const result = diffSnapshots(base, head);
    expect(result.changes).toHaveLength(0);
    expect(result.summary).toEqual({ added: 0, removed: 0, modified: 0 });
  });

  it('sets correct snapshot ids in result', () => {
    const base = makeSnapshot('snap-abc', []);
    const head = makeSnapshot('snap-xyz', []);
    const result = diffSnapshots(base, head);
    expect(result.baseSnapshot).toBe('snap-abc');
    expect(result.headSnapshot).toBe('snap-xyz');
  });
});
