export interface FlattenOptions {
  delimiter?: string;
  maxDepth?: number;
}

export function parseFlattenArgs(args: Record<string, unknown>): FlattenOptions {
  const opts: FlattenOptions = {};
  if (typeof args['flatten-delimiter'] === 'string') {
    opts.delimiter = args['flatten-delimiter'];
  }
  if (typeof args['flatten-depth'] === 'number') {
    opts.maxDepth = args['flatten-depth'];
  }
  return opts;
}

export function flattenObject(
  obj: Record<string, unknown>,
  opts: FlattenOptions = {},
  prefix = '',
  depth = 0
): Record<string, unknown> {
  const delimiter = opts.delimiter ?? '.';
  const maxDepth = opts.maxDepth ?? Infinity;
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    const flatKey = prefix ? `${prefix}${delimiter}${key}` : key;
    if (
      value !== null &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      depth < maxDepth
    ) {
      const nested = flattenObject(
        value as Record<string, unknown>,
        opts,
        flatKey,
        depth + 1
      );
      Object.assign(result, nested);
    } else {
      result[flatKey] = value;
    }
  }
  return result;
}

export function applyFlatten(
  obj: Record<string, unknown>,
  opts: FlattenOptions
): Record<string, unknown> {
  if (!opts.delimiter && opts.maxDepth === undefined) return obj;
  return flattenObject(obj, opts);
}
