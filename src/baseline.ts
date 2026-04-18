import { loadSnapshot, saveSnapshot } from './storage';
import { Snapshot } from './snapshot';

export const BASELINE_PREFIX = 'baseline';

export interface BaselineResult {
  saved: boolean;
  name: string;
}

export function baselineName(tag?: string): string {
  return tag ? `${BASELINE_PREFIX}-${tag}` : BASELINE_PREFIX;
}

export async function saveBaseline(snapshot: Snapshot, tag?: string): Promise<BaselineResult> {
  const name = baselineName(tag);
  await saveSnapshot(snapshot, name);
  return { saved: true, name };
}

export async function loadBaseline(tag?: string): Promise<Snapshot | null> {
  const name = baselineName(tag);
  try {
    return await loadSnapshot(name);
  } catch {
    return null;
  }
}

export async function hasBaseline(tag?: string): Promise<boolean> {
  const snapshot = await loadBaseline(tag);
  return snapshot !== null;
}

export function parseBaselineArgs(args: string[]): { tag?: string } {
  const tagIndex = args.indexOf('--tag');
  const tag = tagIndex !== -1 ? args[tagIndex + 1] : undefined;
  return { tag };
}
