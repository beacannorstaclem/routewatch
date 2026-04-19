import { Endpoint } from './snapshot';

export type CompareField = 'status' | 'headers' | 'body' | 'latency';

export interface CompareOptions {
  fields: CompareField[];
  ignoreKeys?: string[];
  latencyThreshold?: number;
}

export interface CompareResult {
  endpoint: string;
  field: CompareField;
  left: unknown;
  right: unknown;
  match: boolean;
}

export const COMPARE_FIELDS: CompareField[] = ['status', 'headers', 'body', 'latency'];

export function isCompareField(val: string): val is CompareField {
  return COMPARE_FIELDS.includes(val as CompareField);
}

export function compareEndpoints(
  left: Endpoint,
  right: Endpoint,
  options: CompareOptions
): CompareResult[] {
  const results: CompareResult[] = [];
  const key = `${left.method} ${left.url}`;

  for (const field of options.fields) {
    if (field === 'status') {
      results.push({ endpoint: key, field, left: left.status, right: right.status, match: left.status === right.status });
    } else if (field === 'latency') {
      const threshold = options.latencyThreshold ?? 0;
      const match = Math.abs((left.latency ?? 0) - (right.latency ?? 0)) <= threshold;
      results.push({ endpoint: key, field, left: left.latency, right: right.latency, match });
    } else if (field === 'headers') {
      const l = omitKeys(left.headers ?? {}, options.ignoreKeys ?? []);
      const r = omitKeys(right.headers ?? {}, options.ignoreKeys ?? []);
      results.push({ endpoint: key, field, left: l, right: r, match: JSON.stringify(l) === JSON.stringify(r) });
    } else if (field === 'body') {
      const l = omitKeys(left.body ?? {}, options.ignoreKeys ?? []);
      const r = omitKeys(right.body ?? {}, options.ignoreKeys ?? []);
      results.push({ endpoint: key, field, left: l, right: r, match: JSON.stringify(l) === JSON.stringify(r) });
    }
  }
  return results;
}

function omitKeys(obj: Record<string, unknown>, keys: string[]): Record<string, unknown> {
  return Object.fromEntries(Object.entries(obj).filter(([k]) => !keys.includes(k)));
}

export function formatCompareResults(results: CompareResult[]): string {
  const lines: string[] = [];
  for (const r of results) {
    const status = r.match ? '✓' : '✗';
    lines.push(`${status} [${r.field}] ${r.endpoint}`);
    if (!r.match) {
      lines.push(`  left:  ${JSON.stringify(r.left)}`);
      lines.push(`  right: ${JSON.stringify(r.right)}`);
    }
  }
  return lines.join('\n');
}
