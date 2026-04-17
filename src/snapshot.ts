import fs from 'fs-extra';
import path from 'path';

export interface EndpointSnapshot {
  url: string;
  method: string;
  statusCode: number;
  headers: Record<string, string>;
  body: unknown;
  capturedAt: string;
}

export interface SnapshotFile {
  version: string;
  createdAt: string;
  endpoints: EndpointSnapshot[];
}

const SNAPSHOTS_DIR = '.routewatch/snapshots';

export async function saveSnapshot(name: string, snapshot: SnapshotFile): Promise<string> {
  await fs.ensureDir(SNAPSHOTS_DIR);
  const filename = `${name}-${Date.now()}.json`;
  const filepath = path.join(SNAPSHOTS_DIR, filename);
  await fs.writeJson(filepath, snapshot, { spaces: 2 });
  return filepath;
}

export async function loadSnapshot(filepath: string): Promise<SnapshotFile> {
  const exists = await fs.pathExists(filepath);
  if (!exists) {
    throw new Error(`Snapshot file not found: ${filepath}`);
  }
  return fs.readJson(filepath) as Promise<SnapshotFile>;
}

export async function listSnapshots(): Promise<string[]> {
  await fs.ensureDir(SNAPSHOTS_DIR);
  const files = await fs.readdir(SNAPSHOTS_DIR);
  return files
    .filter(f => f.endsWith('.json'))
    .map(f => path.join(SNAPSHOTS_DIR, f))
    .sort();
}

export function createSnapshotFile(endpoints: EndpointSnapshot[]): SnapshotFile {
  return {
    version: '1.0.0',
    createdAt: new Date().toISOString(),
    endpoints,
  };
}
