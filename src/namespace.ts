export interface NamespaceOptions {
  separator?: string;
  prefix?: string;
}

export interface NamespacedEndpoint {
  namespace: string;
  key: string;
}

const DEFAULT_SEPARATOR = '/';

export function parseNamespaceArgs(args: Record<string, unknown>): NamespaceOptions {
  const opts: NamespaceOptions = {};
  if (typeof args['namespace-separator'] === 'string') {
    opts.separator = args['namespace-separator'];
  }
  if (typeof args['namespace-prefix'] === 'string') {
    opts.prefix = args['namespace-prefix'];
  }
  return opts;
}

export function buildNamespace(method: string, url: string, opts: NamespaceOptions = {}): string {
  const sep = opts.separator ?? DEFAULT_SEPARATOR;
  const base = extractPathNamespace(url, sep);
  return opts.prefix ? `${opts.prefix}${sep}${base}` : base;
}

export function extractPathNamespace(url: string, separator: string = DEFAULT_SEPARATOR): string {
  try {
    const { pathname } = new URL(url);
    const parts = pathname.split('/').filter(Boolean);
    return parts.length > 0 ? parts[0] : 'root';
  } catch {
    const parts = url.split('/').filter(Boolean);
    return parts.length > 0 ? parts[0] : 'root';
  }
}

export function namespaceEndpoints<T extends { method: string; url: string }>(
  endpoints: T[],
  opts: NamespaceOptions = {}
): (T & { namespace: string })[] {
  return endpoints.map((ep) => ({
    ...ep,
    namespace: buildNamespace(ep.method, ep.url, opts),
  }));
}

export function groupByNamespace<T extends { method: string; url: string }>(
  endpoints: T[],
  opts: NamespaceOptions = {}
): Record<string, T[]> {
  const result: Record<string, T[]> = {};
  for (const ep of endpoints) {
    const ns = buildNamespace(ep.method, ep.url, opts);
    if (!result[ns]) result[ns] = [];
    result[ns].push(ep);
  }
  return result;
}
