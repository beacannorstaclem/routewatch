import * as fs from 'fs';
import * as path from 'path';

const SNAPSHOTS_DIR = '.routewatch';

export function getSnapshotsDir(): string {
  return path.resolve(process.cwd(), SNAPSHOTS_DIR);
}

export function ensureSnapshotsDir(): void {
  const dir = getSnapshotsDir();
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export function listSnapshots(): string[] {
  const dir = getSnapshotsDir();
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.json'))
    .sort();
}

export function saveSnapshot(name: string, data: unknown): string {
  ensureSnapshotsDir();
  const filePath = path.join(getSnapshotsDir(), name);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  return filePath;
}

export function loadSnapshot(name: string): unknown {
  const filePath = path.join(getSnapshotsDir(), name);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Snapshot not found: ${name}`);
  }
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw);
}

export function deleteSnapshot(name: string): void {
  const filePath = path.join(getSnapshotsDir(), name);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Snapshot not found: ${name}`);
  }
  fs.unlinkSync(filePath);
}

export function getLatestTwoSnapshots(): [string, string] | null {
  const snapshots = listSnapshots();
  if (snapshots.length < 2) return null;
  return [snapshots[snapshots.length - 2], snapshots[snapshots.length - 1]];
}
