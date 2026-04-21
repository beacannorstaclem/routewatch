import { loadDiffConfig, mergeDiffConfigs, parseDiffConfig, DiffConfig } from "./diff.config";
import { diffSnapshots, isEmptyDiff, formatDiffSummary } from "./diff";
import { loadSnapshot } from "./storage";
import type { Snapshot } from "./snapshot";

export interface DiffRunArgs {
  snapshotA: string;
  snapshotB: string;
  configPath?: string;
  mode?: string;
  ignoreFields?: string[];
  ignoreStatus?: boolean;
  ignoreHeaders?: boolean;
  minChanges?: number;
}

export interface DiffRunResult {
  summary: string;
  hasChanges: boolean;
  changeCount: number;
}

export function buildDiffRunConfig(args: DiffRunArgs): DiffConfig {
  const base = loadDiffConfig(args.configPath);
  const overrides = parseDiffConfig({
    ...(args.mode !== undefined ? { mode: args.mode } : {}),
    ...(args.ignoreFields !== undefined ? { ignoreFields: args.ignoreFields } : {}),
    ...(args.ignoreStatus !== undefined ? { ignoreStatus: args.ignoreStatus } : {}),
    ...(args.ignoreHeaders !== undefined ? { ignoreHeaders: args.ignoreHeaders } : {}),
    ...(args.minChanges !== undefined ? { minChanges: args.minChanges } : {}),
  });
  return mergeDiffConfigs(base, overrides);
}

export async function runDiff(args: DiffRunArgs): Promise<DiffRunResult> {
  const config = buildDiffRunConfig(args);

  const snapshotA: Snapshot = await loadSnapshot(args.snapshotA);
  const snapshotB: Snapshot = await loadSnapshot(args.snapshotB);

  const diff = diffSnapshots(snapshotA, snapshotB);

  if (config.ignoreStatus) {
    diff.changed = diff.changed.filter(
      (c) => !(Object.keys(c.changes).length === 1 && "status" in c.changes)
    );
  }

  if (config.ignoreHeaders) {
    diff.changed = diff.changed.filter(
      (c) => !(Object.keys(c.changes).length === 1 && "headers" in c.changes)
    );
  }

  if (config.ignoreFields.length > 0) {
    diff.changed = diff.changed.map((c) => ({
      ...c,
      changes: Object.fromEntries(
        Object.entries(c.changes).filter(
          ([key]) => !config.ignoreFields.includes(key)
        )
      ),
    })).filter((c) => Object.keys(c.changes).length > 0);
  }

  const changeCount =
    diff.added.length + diff.removed.length + diff.changed.length;

  if (changeCount < config.minChanges) {
    return {
      summary: `No significant changes (${changeCount} < minChanges: ${config.minChanges})`,
      hasChanges: false,
      changeCount,
    };
  }

  const hasChanges = !isEmptyDiff(diff);
  const summary = formatDiffSummary(diff);

  return { summary, hasChanges, changeCount };
}
