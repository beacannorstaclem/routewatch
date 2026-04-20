import { Snapshot } from './snapshot';
import { loadSnapshot, listSnapshots } from './storage';

export interface CheckpointOptions {
  label?: string;
  maxAge?: number; // in seconds
}

export interface Checkpoint {
  name: string;
  label?: string;
  timestamp: number;
  snapshotFile: string;
}

export function parseCheckpointArgs(args: Record<string, unknown>): CheckpointOptions {
  const opts: CheckpointOptions = {};
  if (typeof args['label'] === 'string') opts.label = args['label'];
  if (typeof args['max-age'] === 'number') opts.maxAge = args['max-age'];
  if (typeof args['maxAge'] === 'number') opts.maxAge = args['maxAge'];
  return opts;
}

export function buildCheckpoint(
  snapshotFile: string,
  opts: CheckpointOptions = {}
): Checkpoint {
  const timestamp = Date.now();
  const name = `checkpoint-${timestamp}`;
  return {
    name,
    label: opts.label,
    timestamp,
    snapshotFile,
  };
}

export function isExpired(checkpoint: Checkpoint, maxAge: number): boolean {
  const ageSeconds = (Date.now() - checkpoint.timestamp) / 1000;
  return ageSeconds > maxAge;
}

export async function resolveCheckpointSnapshot(
  checkpoint: Checkpoint
): Promise<Snapshot> {
  return loadSnapshot(checkpoint.snapshotFile);
}

export async function findLatestCheckpoint(
  checkpoints: Checkpoint[],
  opts: CheckpointOptions = {}
): Promise<Checkpoint | undefined> {
  const sorted = [...checkpoints].sort((a, b) => b.timestamp - a.timestamp);
  if (!opts.maxAge) return sorted[0];
  return sorted.find((cp) => !isExpired(cp, opts.maxAge!));
}

export function formatCheckpointSummary(checkpoints: Checkpoint[]): string {
  if (checkpoints.length === 0) return 'No checkpoints found.';
  const lines = checkpoints.map((cp) => {
    const date = new Date(cp.timestamp).toISOString();
    const label = cp.label ? ` [${cp.label}]` : '';
    return `  ${cp.name}${label} — ${date} (${cp.snapshotFile})`;
  });
  return `Checkpoints (${checkpoints.length}):\n${lines.join('\n')}`;
}
