export interface PaginationConfig {
  enabled: boolean;
  pageParam: string;
  pageSizeParam: string;
  pageSize: number;
  maxPages: number;
}

export interface PaginationArgs {
  paginate?: boolean;
  pageParam?: string;
  pageSizeParam?: string;
  pageSize?: number;
  maxPages?: number;
}

const DEFAULTS: PaginationConfig = {
  enabled: false,
  pageParam: 'page',
  pageSizeParam: 'per_page',
  pageSize: 100,
  maxPages: 10,
};

export function parsePaginationArgs(args: Record<string, unknown>): PaginationConfig {
  return {
    enabled: Boolean(args.paginate ?? DEFAULTS.enabled),
    pageParam: typeof args.pageParam === 'string' ? args.pageParam : DEFAULTS.pageParam,
    pageSizeParam: typeof args.pageSizeParam === 'string' ? args.pageSizeParam : DEFAULTS.pageSizeParam,
    pageSize: typeof args.pageSize === 'number' ? args.pageSize : DEFAULTS.pageSize,
    maxPages: typeof args.maxPages === 'number' ? args.maxPages : DEFAULTS.maxPages,
  };
}

export function buildPageUrl(baseUrl: string, config: PaginationConfig, page: number): string {
  const url = new URL(baseUrl);
  url.searchParams.set(config.pageParam, String(page));
  url.searchParams.set(config.pageSizeParam, String(config.pageSize));
  return url.toString();
}

export function paginatedUrls(baseUrl: string, config: PaginationConfig): string[] {
  if (!config.enabled) return [baseUrl];
  return Array.from({ length: config.maxPages }, (_, i) =>
    buildPageUrl(baseUrl, config, i + 1)
  );
}
