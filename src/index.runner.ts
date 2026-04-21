import { parseIndexArgs, buildIndexMap, formatIndexSummary } from './index';

export interface IndexRunOptions {
  endpoints: Array<{ method: string; path: string; [key: string]: unknown }>;
  field?: string;
  verbose?: boolean;
}

export function runIndex(options: IndexRunOptions): string {
  const { endpoints, field = 'path', verbose = false } = options;
  const indexMap = buildIndexMap(endpoints, field as 'path' | 'method' | 'status');
  return formatIndexSummary(indexMap, { verbose });
}

export function parseAndRunIndex(argv: string[], endpoints: Array<{ method: string; path: string; [key: string]: unknown }>): string {
  const args = parseIndexArgs(argv);
  return runIndex({
    endpoints,
    field: args.field,
    verbose: args.verbose,
  });
}
