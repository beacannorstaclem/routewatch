import { listSnapshots, loadSnapshot } from './storage';

export interface StreakResult {
  endpoint: string;
  currentStreak: number;
  longestStreak: number;
  totalChecks: number;
  lastStatus: number | null;
}

export interface StreakSummary {
  results: StreakResult[];
  activeStreaks: number;
  brokenStreaks: number;
}

export function computeStreak(statuses: (number | null)[]): { current: number; longest: number } {
  let current = 0;
  let longest = 0;
  let streak = 0;

  for (const status of statuses) {
    const ok = status !== null && status >= 200 && status < 300;
    if (ok) {
      streak++;
      if (streak > longest) longest = streak;
    } else {
      streak = 0;
    }
  }
  current = streak;
  return { current, longest };
}

export async function buildStreakSummary(snapshotsDir?: string): Promise<StreakSummary> {
  const names = await listSnapshots(snapshotsDir);
  const endpointStatuses: Record<string, (number | null)[]> = {};

  for (const name of names) {
    const snapshot = await loadSnapshot(name, snapshotsDir);
    for (const ep of snapshot.endpoints) {
      const key = `${ep.method} ${ep.url}`;
      if (!endpointStatuses[key]) endpointStatuses[key] = [];
      endpointStatuses[key].push(ep.status ?? null);
    }
  }

  const results: StreakResult[] = Object.entries(endpointStatuses).map(([key, statuses]) => {
    const { current, longest } = computeStreak(statuses);
    return {
      endpoint: key,
      currentStreak: current,
      longestStreak: longest,
      totalChecks: statuses.length,
      lastStatus: statuses[statuses.length - 1] ?? null,
    };
  });

  const activeStreaks = results.filter(r => r.currentStreak > 0).length;
  const brokenStreaks = results.filter(r => r.currentStreak === 0 && r.totalChecks > 0).length;

  return { results, activeStreaks, brokenStreaks };
}

export function formatStreakSummary(summary: StreakSummary): string {
  const lines: string[] = [
    `Streak Summary — ${summary.activeStreaks} active, ${summary.brokenStreaks} broken`,
    '',
  ];
  for (const r of summary.results) {
    const bar = '✓'.repeat(Math.min(r.currentStreak, 10));
    lines.push(
      `  ${r.endpoint}\n    current: ${r.currentStreak}  longest: ${r.longestStreak}  checks: ${r.totalChecks}  ${bar}`
    );
  }
  return lines.join('\n');
}

export function parseStreakArgs(args: string[]): { snapshotsDir?: string } {
  const opts: { snapshotsDir?: string } = {};
  for (let i = 0; i < args.length; i++) {
    if ((args[i] === '--dir' || args[i] === '-d') && args[i + 1]) {
      opts.snapshotsDir = args[++i];
    }
  }
  return opts;
}
