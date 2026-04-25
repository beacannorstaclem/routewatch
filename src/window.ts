/**
 * window.ts — sliding window aggregation over endpoint snapshots
 */

export interface WindowOptions {
  size: number;       // number of snapshots to include
  field: string;      // field to aggregate (e.g. 'status', 'latency')
  aggregation: 'avg' | 'min' | 'max' | 'count';
}

export interface WindowResult {
  key: string;
  values: (number | string)[];
  aggregated: number | string;
}

export function parseWindowArgs(args: Record<string, unknown>): WindowOptions {
  const size = typeof args.size === 'number' ? args.size : parseInt(String(args.size ?? '5'), 10);
  if (isNaN(size) || size < 1) throw new Error(`Invalid window size: ${args.size}`);
  const field = typeof args.field === 'string' && args.field ? args.field : 'status';
  const agg = String(args.aggregation ?? args.agg ?? 'count');
  if (!['avg', 'min', 'max', 'count'].includes(agg)) {
    throw new Error(`Invalid aggregation: ${agg}`);
  }
  return { size, field, aggregation: agg as WindowOptions['aggregation'] };
}

export function applyWindow(
  rows: Record<string, unknown>[],
  opts: WindowOptions
): WindowResult[] {
  const groups = new Map<string, (number | string)[]>();

  for (const row of rows) {
    const key = String(row['method'] ?? '') + ':' + String(row['path'] ?? '');
    const val = row[opts.field];
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(val as number | string);
  }

  const results: WindowResult[] = [];
  for (const [key, allValues] of groups) {
    const values = allValues.slice(-opts.size);
    results.push({ key, values, aggregated: aggregate(values, opts.aggregation) });
  }
  return results;
}

function aggregate(values: (number | string)[], agg: WindowOptions['aggregation']): number | string {
  if (agg === 'count') return values.length;
  const nums = values.map(Number).filter(n => !isNaN(n));
  if (nums.length === 0) return 0;
  if (agg === 'avg') return parseFloat((nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(4));
  if (agg === 'min') return Math.min(...nums);
  if (agg === 'max') return Math.max(...nums);
  return 0;
}

export function formatWindowSummary(results: WindowResult[]): string {
  if (results.length === 0) return 'No window results.';
  const lines = results.map(r =>
    `  ${r.key.padEnd(40)} values=${r.values.length}  aggregated=${r.aggregated}`
  );
  return `Window Summary (${results.length} endpoints):\n${lines.join('\n')}`;
}
