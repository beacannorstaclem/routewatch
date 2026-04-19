export type SortField = 'method' | 'path' | 'status' | 'latency';
export type SortOrder = 'asc' | 'desc';

export interface SortConfig {
  field: SortField;
  order: SortOrder;
}

const SORT_FIELDS: SortField[] = ['method', 'path', 'status', 'latency'];

export function isSortField(value: string): value is SortField {
  return SORT_FIELDS.includes(value as SortField);
}

export function parseSortArgs(args: Record<string, unknown>): SortConfig {
  const field = typeof args['sort'] === 'string' && isSortField(args['sort'])
    ? args['sort']
    : 'path';
  const order = args['order'] === 'desc' ? 'desc' : 'asc';
  return { field, order };
}

export function sortEndpoints<T extends Record<string, unknown>>(
  endpoints: T[],
  config: SortConfig
): T[] {
  const { field, order } = config;
  return [...endpoints].sort((a, b) => {
    const av = a[field] ?? '';
    const bv = b[field] ?? '';
    let cmp = 0;
    if (typeof av === 'number' && typeof bv === 'number') {
      cmp = av - bv;
    } else {
      cmp = String(av).localeCompare(String(bv));
    }
    return order === 'desc' ? -cmp : cmp;
  });
}
