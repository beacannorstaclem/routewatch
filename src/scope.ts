export type ScopeField = 'method' | 'path' | 'status' | 'tag';

export interface ScopeOptions {
  include?: string[];
  exclude?: string[];
  field: ScopeField;
}

export interface Endpoint {
  method: string;
  path: string;
  status?: number;
  tag?: string;
  [key: string]: unknown;
}

export function isScopeField(value: string): value is ScopeField {
  return ['method', 'path', 'status', 'tag'].includes(value);
}

export function parseScopeArgs(args: Record<string, unknown>): ScopeOptions {
  const field = typeof args['scopeField'] === 'string' && isScopeField(args['scopeField'])
    ? args['scopeField']
    : 'path';

  const include = Array.isArray(args['scopeInclude'])
    ? (args['scopeInclude'] as string[])
    : typeof args['scopeInclude'] === 'string'
    ? [args['scopeInclude']]
    : undefined;

  const exclude = Array.isArray(args['scopeExclude'])
    ? (args['scopeExclude'] as string[])
    : typeof args['scopeExclude'] === 'string'
    ? [args['scopeExclude']]
    : undefined;

  return { field, include, exclude };
}

export function applyScope(endpoints: Endpoint[], options: ScopeOptions): Endpoint[] {
  const { field, include, exclude } = options;

  return endpoints.filter((ep) => {
    const value = String(ep[field] ?? '');

    if (include && include.length > 0) {
      const matched = include.some((pattern) => value.includes(pattern));
      if (!matched) return false;
    }

    if (exclude && exclude.length > 0) {
      const matched = exclude.some((pattern) => value.includes(pattern));
      if (matched) return false;
    }

    return true;
  });
}

export function formatScopeSummary(original: Endpoint[], scoped: Endpoint[]): string {
  const removed = original.length - scoped.length;
  return `Scope applied: ${scoped.length} endpoint(s) retained, ${removed} excluded.`;
}
