/**
 * projection.ts — select or exclude specific fields from endpoint objects
 */

export interface ProjectionOptions {
  include?: string[];
  exclude?: string[];
}

export function parseProjectionArgs(args: Record<string, unknown>): ProjectionOptions {
  const opts: ProjectionOptions = {};

  if (args['include']) {
    opts.include = String(args['include'])
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }

  if (args['exclude']) {
    opts.exclude = String(args['exclude'])
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }

  return opts;
}

export function projectObject(
  obj: Record<string, unknown>,
  opts: ProjectionOptions
): Record<string, unknown> {
  const { include, exclude } = opts;

  if (include && include.length > 0) {
    return Object.fromEntries(
      Object.entries(obj).filter(([key]) => include.includes(key))
    );
  }

  if (exclude && exclude.length > 0) {
    return Object.fromEntries(
      Object.entries(obj).filter(([key]) => !exclude.includes(key))
    );
  }

  return { ...obj };
}

export function applyProjection(
  endpoints: Record<string, unknown>[],
  opts: ProjectionOptions
): Record<string, unknown>[] {
  if ((!opts.include || opts.include.length === 0) &&
      (!opts.exclude || opts.exclude.length === 0)) {
    return endpoints;
  }
  return endpoints.map((ep) => projectObject(ep, opts));
}

export function formatProjectionSummary(opts: ProjectionOptions, count: number): string {
  const lines: string[] = [`Projection applied to ${count} endpoint(s).`];
  if (opts.include && opts.include.length > 0) {
    lines.push(`  Included fields: ${opts.include.join(', ')}`);
  }
  if (opts.exclude && opts.exclude.length > 0) {
    lines.push(`  Excluded fields: ${opts.exclude.join(', ')}`);
  }
  return lines.join('\n');
}
