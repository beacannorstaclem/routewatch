import { SortConfig, SortField, SortOrder, isSortField } from './sort';

export interface RawSortConfig {
  field?: string;
  order?: string;
}

export function parseSortConfig(raw: RawSortConfig): SortConfig {
  const field: SortField =
    raw.field && isSortField(raw.field) ? raw.field : 'path';
  const order: SortOrder = raw.order === 'desc' ? 'desc' : 'asc';
  return { field, order };
}

export function loadSortConfig(env: Record<string, string | undefined> = process.env): SortConfig {
  const raw: RawSortConfig = {
    field: env['ROUTEWATCH_SORT_FIELD'],
    order: env['ROUTEWATCH_SORT_ORDER'],
  };
  return parseSortConfig(raw);
}
