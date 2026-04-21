import { Endpoint } from './index';

export interface PruneOptions {
  maxAge?: number;       // max age in days
  statusCodes?: number[]; // remove endpoints with these status codes
  methods?: string[];    // remove endpoints with these methods
  pathPattern?: string;  // remove endpoints matching this regex pattern
}

export interface PruneResult {
  kept: Endpoint[];
  removed: Endpoint[];
  removedCount: number;
  keptCount: number;
}

export function parsePruneArgs(args: Record<string, unknown>): PruneOptions {
  const opts: PruneOptions = {};
  if (typeof args['max-age'] === 'number') opts.maxAge = args['max-age'];
  if (typeof args['max-age'] === 'string') opts.maxAge = parseInt(args['max-age'], 10);
  if (Array.isArray(args['status'])) {
    opts.statusCodes = (args['status'] as string[]).map(Number);
  } else if (typeof args['status'] === 'string') {
    opts.statusCodes = args['status'].split(',').map(Number);
  }
  if (Array.isArray(args['method'])) {
    opts.methods = (args['method'] as string[]).map((m) => m.toUpperCase());
  } else if (typeof args['method'] === 'string') {
    opts.methods = args['method'].split(',').map((m) => m.toUpperCase());
  }
  if (typeof args['path-pattern'] === 'string') opts.pathPattern = args['path-pattern'];
  return opts;
}

export function pruneEndpoints(endpoints: Endpoint[], opts: PruneOptions, now = Date.now()): PruneResult {
  const statusSet = opts.statusCodes ? new Set(opts.statusCodes) : null;
  const methodSet = opts.methods ? new Set(opts.methods) : null;
  const pathRegex = opts.pathPattern ? new RegExp(opts.pathPattern) : null;
  const maxAgeMs = opts.maxAge != null ? opts.maxAge * 86_400_000 : null;

  const kept: Endpoint[] = [];
  const removed: Endpoint[] = [];

  for (const ep of endpoints) {
    let shouldRemove = false;
    if (statusSet && ep.status != null && statusSet.has(ep.status)) shouldRemove = true;
    if (methodSet && methodSet.has(ep.method.toUpperCase())) shouldRemove = true;
    if (pathRegex && pathRegex.test(ep.path)) shouldRemove = true;
    if (maxAgeMs && ep.timestamp != null) {
      const age = now - new Date(ep.timestamp).getTime();
      if (age > maxAgeMs) shouldRemove = true;
    }
    (shouldRemove ? removed : kept).push(ep);
  }

  return { kept, removed, removedCount: removed.length, keptCount: kept.length };
}

export function formatPruneSummary(result: PruneResult): string {
  const lines = [
    `Prune summary:`,
    `  Kept:    ${result.keptCount}`,
    `  Removed: ${result.removedCount}`,
  ];
  if (result.removedCount > 0) {
    lines.push('  Removed endpoints:');
    for (const ep of result.removed) {
      lines.push(`    [${ep.method}] ${ep.path}${ep.status != null ? ` (${ep.status})` : ''}`);
    }
  }
  return lines.join('\n');
}
