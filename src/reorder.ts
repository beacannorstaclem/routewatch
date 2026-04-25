export interface ReorderOptions {
  fields: string[];
  direction?: 'asc' | 'desc';
}

export interface ReorderArgs {
  reorderBy?: string[];
  reorderDir?: 'asc' | 'desc';
}

export function parseReorderArgs(argv: Record<string, unknown>): ReorderArgs {
  const raw = argv['reorder-by'];
  const fields = Array.isArray(raw)
    ? raw.map(String)
    : typeof raw === 'string'
    ? raw.split(',')
    : [];

  const dir = argv['reorder-dir'];
  const direction =
    dir === 'asc' || dir === 'desc' ? dir : undefined;

  return { reorderBy: fields.length ? fields : undefined, reorderDir: direction };
}

export function reorderFields<T extends Record<string, unknown>>(
  obj: T,
  fields: string[]
): T {
  const ordered: Record<string, unknown> = {};
  for (const f of fields) {
    if (Object.prototype.hasOwnProperty.call(obj, f)) {
      ordered[f] = obj[f];
    }
  }
  for (const key of Object.keys(obj)) {
    if (!fields.includes(key)) {
      ordered[key] = obj[key];
    }
  }
  return ordered as T;
}

export function reorderEndpoints<T extends Record<string, unknown>>(
  endpoints: T[],
  options: ReorderOptions
): T[] {
  const { fields, direction = 'asc' } = options;
  return [...endpoints].sort((a, b) => {
    for (const field of fields) {
      const av = String(a[field] ?? '');
      const bv = String(b[field] ?? '');
      const cmp = av.localeCompare(bv);
      if (cmp !== 0) return direction === 'asc' ? cmp : -cmp;
    }
    return 0;
  });
}

export function formatReorderSummary(
  original: unknown[],
  reordered: unknown[],
  options: ReorderOptions
): string {
  const lines: string[] = [
    `Reordered ${reordered.length} endpoint(s)`,
    `  Fields : ${options.fields.join(', ')}`,
    `  Direction: ${options.direction ?? 'asc'}`,
  ];
  if (original.length !== reordered.length) {
    lines.push(`  Warning: count mismatch (${original.length} -> ${reordered.length})`);
  }
  return lines.join('\n');
}
