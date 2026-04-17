import fs from 'fs-extra';
import path from 'path';
import {
  saveSnapshot,
  loadSnapshot,
  listSnapshots,
  createSnapshotFile,
  EndpointSnapshot,
} from './snapshot';

const SNAPSHOTS_DIR = '.routewatch/snapshots';

afterEach(async () => {
  await fs.remove('.routewatch');
});

const mockEndpoint: EndpointSnapshot = {
  url: 'https://api.example.com/users',
  method: 'GET',
  statusCode: 200,
  headers: { 'content-type': 'application/json' },
  body: [{ id: 1, name: 'Alice' }],
  capturedAt: new Date().toISOString(),
};

describe('createSnapshotFile', () => {
  it('creates a snapshot file object with correct shape', () => {
    const snap = createSnapshotFile([mockEndpoint]);
    expect(snap.version).toBe('1.0.0');
    expect(snap.endpoints).toHaveLength(1);
    expect(snap.createdAt).toBeDefined();
  });
});

describe('saveSnapshot and loadSnapshot', () => {
  it('saves and loads a snapshot correctly', async () => {
    const snap = createSnapshotFile([mockEndpoint]);
    const filepath = await saveSnapshot('test', snap);
    expect(await fs.pathExists(filepath)).toBe(true);

    const loaded = await loadSnapshot(filepath);
    expect(loaded.endpoints).toHaveLength(1);
    expect(loaded.endpoints[0].url).toBe(mockEndpoint.url);
  });

  it('throws when loading a non-existent snapshot', async () => {
    await expect(loadSnapshot('nonexistent.json')).rejects.toThrow('Snapshot file not found');
  });
});

describe('listSnapshots', () => {
  it('returns sorted list of snapshot files', async () => {
    const snap = createSnapshotFile([mockEndpoint]);
    await saveSnapshot('alpha', snap);
    await saveSnapshot('beta', snap);
    const list = await listSnapshots();
    expect(list.length).toBeGreaterThanOrEqual(2);
    expect(list[0] < list[1]).toBe(true);
  });

  it('returns empty array when no snapshots exist', async () => {
    const list = await listSnapshots();
    expect(list).toEqual([]);
  });
});
