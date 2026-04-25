import type { Endpoint } from './index';

export type PivotField = 'method' | 'status' | 'tag' | 'namespace';

export interface PivotOptions {
  field: PivotField;
  countOnly?: boolean;
}

export interface PivotRow {
  key: string;
  endpoints: Endpoint[];
  count: number;
}

export interface PivotResult {
  field: PivotField;
  rows: PivotRow[];
  total: number;
}

export function isPivotField(value: unknown): value is PivotField {
  return ['method', 'status', 'tag', 'namespace'].includes(value as string);
}

export function pivotEndpoints(
  endpoints: Endpoint[],
  options: PivotOptions
): PivotResult {
  const { field } = options;
  const map = new Map<string, Endpoint[]>();

  for (const ep of endpoints) {
    const raw = ep[field as keyof Endpoint];
    const key = raw !== undefined && raw !== null ? String(raw) : '(none)';
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(ep);
  }

  const rows: PivotRow[] = Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, eps]) => ({ key, endpoints: eps, count: eps.length }));

  return { field, rows, total: endpoints.length };
}

export function formatPivotSummary(result: PivotResult): string {
  const lines: string[] = [
    `Pivot by ${result.field} (${result.total} endpoints total):`,
  ];
  for (const row of result.rows) {
    lines.push(`  ${row.key}: ${row.count}`);
  }
  return lines.join('\n');
}

export function parsePivotArgs(args: Record<string, unknown>): PivotOptions {
  const field = args['field'] ?? args['f'] ?? 'method';
  if (!isPivotField(field)) {
    throw new Error(
      `Invalid pivot field: "${field}". Must be one of: method, status, tag, namespace`
    );
  }
  return {
    field,
    countOnly: Boolean(args['count-only'] ?? args['c'] ?? false),
  };
}
