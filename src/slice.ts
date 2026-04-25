/**
 * slice.ts — extract a subset of endpoints by index range or count
 */

export interface SliceOptions {
  start: number;
  end?: number;
  count?: number;
}

export interface SliceResult<T> {
  items: T[];
  total: number;
  sliced: number;
  start: number;
  end: number;
}

export function parseSliceArgs(args: Record<string, unknown>): SliceOptions {
  const start = args.start !== undefined ? Number(args.start) : 0;
  const end = args.end !== undefined ? Number(args.end) : undefined;
  const count = args.count !== undefined ? Number(args.count) : undefined;
  if (isNaN(start) || start < 0) throw new Error(`Invalid slice start: ${args.start}`);
  if (end !== undefined && (isNaN(end) || end < start))
    throw new Error(`Invalid slice end: ${args.end}`);
  if (count !== undefined && (isNaN(count) || count < 1))
    throw new Error(`Invalid slice count: ${args.count}`);
  return { start, end, count };
}

export function applySlice<T>(items: T[], opts: SliceOptions): SliceResult<T> {
  const total = items.length;
  const start = Math.min(opts.start, total);
  let end: number;
  if (opts.end !== undefined) {
    end = Math.min(opts.end, total);
  } else if (opts.count !== undefined) {
    end = Math.min(start + opts.count, total);
  } else {
    end = total;
  }
  const sliced = items.slice(start, end);
  return { items: sliced, total, sliced: sliced.length, start, end };
}

export function formatSliceSummary(result: SliceResult<unknown>): string {
  return `Showing ${result.sliced} of ${result.total} endpoints (index ${result.start}–${result.end}).`;
}
