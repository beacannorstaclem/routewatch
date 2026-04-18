import { loadSnapshot, saveSnapshot } from './storage';

export interface TaggedSnapshot {
  snapshotId: string;
  tag: string;
  createdAt: string;
}

const TAG_PREFIX = 'tag:';

export function makeTagKey(tag: string): string {
  return `${TAG_PREFIX}${tag}`;
}

export function isTagKey(name: string): boolean {
  return name.startsWith(TAG_PREFIX);
}

export function tagFromKey(key: string): string {
  return key.slice(TAG_PREFIX.length);
}

export async function tagSnapshot(
  snapshotId: string,
  tag: string,
  snapshotsDir?: string
): Promise<void> {
  const snapshot = await loadSnapshot(snapshotId, snapshotsDir);
  if (!snapshot) {
    throw new Error(`Snapshot not found: ${snapshotId}`);
  }
  const tagKey = makeTagKey(tag);
  await saveSnapshot(tagKey, snapshot, snapshotsDir);
}

export async function loadTaggedSnapshot(
  tag: string,
  snapshotsDir?: string
) {
  const tagKey = makeTagKey(tag);
  return loadSnapshot(tagKey, snapshotsDir);
}

export function parseTagArgs(args: string[]): { snapshotId: string; tag: string } | null {
  const snapshotId = args[0];
  const tag = args[1];
  if (!snapshotId || !tag) return null;
  if (!/^[\w-]+$/.test(tag)) {
    throw new Error(`Invalid tag name: "${tag}". Use only letters, numbers, hyphens, underscores.`);
  }
  return { snapshotId, tag };
}
