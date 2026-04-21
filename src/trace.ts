import { Endpoint } from './index';

export interface TraceEntry {
  timestamp: string;
  method: string;
  url: string;
  statusCode: number;
  durationMs: number;
  tags?: string[];
}

export interface TraceOptions {
  includeTags?: boolean;
  minDurationMs?: number;
  maxEntries?: number;
}

export function endpointToTraceEntry(
  endpoint: Endpoint,
  durationMs: number
): TraceEntry {
  return {
    timestamp: new Date().toISOString(),
    method: endpoint.method,
    url: endpoint.url,
    statusCode: endpoint.statusCode,
    durationMs,
    tags: endpoint.tags,
  };
}

export function filterTraceEntries(
  entries: TraceEntry[],
  options: TraceOptions
): TraceEntry[] {
  let result = [...entries];

  if (options.minDurationMs !== undefined) {
    result = result.filter((e) => e.durationMs >= options.minDurationMs!);
  }

  if (options.maxEntries !== undefined) {
    result = result.slice(-options.maxEntries);
  }

  return result;
}

export function formatTraceEntry(entry: TraceEntry): string {
  const tags = entry.tags && entry.tags.length > 0 ? ` [${entry.tags.join(', ')}]` : '';
  return `${entry.timestamp} ${entry.method} ${entry.url} ${entry.statusCode} ${entry.durationMs}ms${tags}`;
}

export function formatTraceSummary(entries: TraceEntry[]): string {
  if (entries.length === 0) return 'No trace entries.';
  const total = entries.reduce((sum, e) => sum + e.durationMs, 0);
  const avg = Math.round(total / entries.length);
  const max = Math.max(...entries.map((e) => e.durationMs));
  const min = Math.min(...entries.map((e) => e.durationMs));
  return [
    `Trace summary: ${entries.length} entries`,
    `  avg: ${avg}ms  min: ${min}ms  max: ${max}ms`,
  ].join('\n');
}

export function parseTraceArgs(args: Record<string, unknown>): TraceOptions {
  const options: TraceOptions = {};
  if (typeof args['min-duration'] === 'number') {
    options.minDurationMs = args['min-duration'] as number;
  }
  if (typeof args['max-entries'] === 'number') {
    options.maxEntries = args['max-entries'] as number;
  }
  if (args['include-tags'] === true) {
    options.includeTags = true;
  }
  return options;
}
