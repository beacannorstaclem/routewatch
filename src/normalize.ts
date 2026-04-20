export interface NormalizeOptions {
  lowercaseMethod?: boolean;
  trimTrailingSlash?: boolean;
  sortQueryParams?: boolean;
  lowercasePath?: boolean;
}

export interface NormalizeArgs {
  options: NormalizeOptions;
}

export function parseNormalizeArgs(args: Record<string, unknown>): NormalizeArgs {
  return {
    options: {
      lowercaseMethod: args['lowercase-method'] !== false,
      trimTrailingSlash: args['trim-slash'] !== false,
      sortQueryParams: args['sort-query'] === true,
      lowercasePath: args['lowercase-path'] === true,
    },
  };
}

export function normalizeMethod(method: string, opts: NormalizeOptions): string {
  return opts.lowercaseMethod ? method.toLowerCase() : method.toUpperCase();
}

export function normalizePath(path: string, opts: NormalizeOptions): string {
  let p = path;
  if (opts.lowercasePath) p = p.toLowerCase();
  if (opts.trimTrailingSlash && p.length > 1 && p.endsWith('/')) {
    p = p.slice(0, -1);
  }
  if (opts.sortQueryParams && p.includes('?')) {
    const [base, query] = p.split('?', 2);
    const sorted = query.split('&').sort().join('&');
    p = `${base}?${sorted}`;
  }
  return p;
}

export function normalizeEndpoint(
  endpoint: { method: string; path: string },
  opts: NormalizeOptions
): { method: string; path: string } {
  return {
    method: normalizeMethod(endpoint.method, opts),
    path: normalizePath(endpoint.path, opts),
  };
}

export function applyNormalize<T extends { method: string; path: string }>(
  endpoints: T[],
  opts: NormalizeOptions
): T[] {
  return endpoints.map((e) => ({
    ...e,
    ...normalizeEndpoint(e, opts),
  }));
}
