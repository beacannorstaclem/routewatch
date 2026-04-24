import type { Endpoint } from './snapshot';
import type { DiffResult } from './diff';

export interface DriftOptions {
  threshold: number;   // percentage of changed endpoints to flag as drift
  window: number;      // number of recent snapshots to consider
  ignoreAdded?: boolean;
  ignoreRemoved?: boolean;
}

export interface DriftSummary {
  score: number;        // 0-100 drift score
  level: 'none' | 'low' | 'medium' | 'high';
  changedCount: number;
  totalCount: number;
  windowSize: number;
}

export function computeDriftScore(
  diffs: DiffResult[],
  totalEndpoints: number
): number {
  if (totalEndpoints === 0) return 0;
  const changed = diffs.filter(d => d.type !== 'unchanged').length;
  return Math.min(100, Math.round((changed / totalEndpoints) * 100));
}

export function classifyDrift(score: number): DriftSummary['level'] {
  if (score === 0) return 'none';
  if (score < 20) return 'low';
  if (score < 50) return 'medium';
  return 'high';
}

export function buildDriftSummary(
  diffs: DiffResult[],
  endpoints: Endpoint[],
  opts: Partial<DriftOptions> = {}
): DriftSummary {
  const { ignoreAdded = false, ignoreRemoved = false, window = 1 } = opts;
  const filtered = diffs.filter(d => {
    if (ignoreAdded && d.type === 'added') return false;
    if (ignoreRemoved && d.type === 'removed') return false;
    return d.type !== 'unchanged';
  });
  const score = computeDriftScore(filtered, endpoints.length);
  return {
    score,
    level: classifyDrift(score),
    changedCount: filtered.length,
    totalCount: endpoints.length,
    windowSize: window,
  };
}

export function formatDriftSummary(summary: DriftSummary): string {
  const { score, level, changedCount, totalCount, windowSize } = summary;
  const pct = `${changedCount}/${totalCount} endpoints changed`;
  return `Drift [${level.toUpperCase()}] score=${score} (${pct}, window=${windowSize})`;
}

export function parseDriftArgs(args: Record<string, unknown>): Partial<DriftOptions> {
  const opts: Partial<DriftOptions> = {};
  if (typeof args['threshold'] === 'number') opts.threshold = args['threshold'];
  if (typeof args['window'] === 'number') opts.window = args['window'];
  if (args['ignore-added'] === true) opts.ignoreAdded = true;
  if (args['ignore-removed'] === true) opts.ignoreRemoved = true;
  return opts;
}
