import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import {
  ensureSnapshotsDir,
  listSnapshots,
  saveSnapshot,
  loadSnapshot,
  deleteSnapshot,
  getLatestTwoSnapshots,
  getSnapshotsDir,
} from './storage';

const originalCwd = process.cwd;

beforeEach(() => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'routewatch-'));
  process.cwd = () => tmpDir;
});

afterEach(() => {
  process.cwd = originalCwd;
});

describe('storage', () => {
  it('ensureSnapshotsDir creates the directory', () => {
    ensureSnapshotsDir();
    expect(fs.existsSync(getSnapshotsDir())).toBe(true);
  });

  it('listSnapshots returns empty array when dir missing', () => {
    expect(listSnapshots()).toEqual([]);
  });

  it('saveSnapshot writes a JSON file and loadSnapshot reads it back', () => {
    const data = { endpoints: [{ method: 'GET', path: '/health' }] };
    saveSnapshot('snap1.json', data);
    const loaded = loadSnapshot('snap1.json');
    expect(loaded).toEqual(data);
  });

  it('listSnapshots returns saved snapshot filenames sorted', () => {
    saveSnapshot('b.json', {});
    saveSnapshot('a.json', {});
    expect(listSnapshots()).toEqual(['a.json', 'b.json']);
  });

  it('deleteSnapshot removes the file', () => {
    saveSnapshot('to-delete.json', {});
    deleteSnapshot('to-delete.json');
    expect(listSnapshots()).not.toContain('to-delete.json');
  });

  it('deleteSnapshot throws if snapshot does not exist', () => {
    expect(() => deleteSnapshot('ghost.json')).toThrow('Snapshot not found');
  });

  it('loadSnapshot throws if snapshot does not exist', () => {
    expect(() => loadSnapshot('missing.json')).toThrow('Snapshot not found');
  });

  it('getLatestTwoSnapshots returns null when fewer than 2 snapshots', () => {
    saveSnapshot('only.json', {});
    expect(getLatestTwoSnapshots()).toBeNull();
  });

  it('getLatestTwoSnapshots returns the last two snapshots', () => {
    saveSnapshot('2024-01.json', {});
    saveSnapshot('2024-02.json', {});
    saveSnapshot('2024-03.json', {});
    expect(getLatestTwoSnapshots()).toEqual(['2024-02.json', '2024-03.json']);
  });
});
