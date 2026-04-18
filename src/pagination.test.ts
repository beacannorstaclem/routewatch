import { parsePaginationArgs, buildPageUrl, paginatedUrls, PaginationConfig } from './pagination';

const baseConfig: PaginationConfig = {
  enabled: true,
  pageParam: 'page',
  pageSizeParam: 'per_page',
  pageSize: 100,
  maxPages: 3,
};

describe('parsePaginationArgs', () => {
  it('returns defaults when no args provided', () => {
    const config = parsePaginationArgs({});
    expect(config.enabled).toBe(false);
    expect(config.pageParam).toBe('page');
    expect(config.pageSizeParam).toBe('per_page');
    expect(config.pageSize).toBe(100);
    expect(config.maxPages).toBe(10);
  });

  it('overrides defaults with provided args', () => {
    const config = parsePaginationArgs({ paginate: true, pageParam: 'p', pageSize: 50, maxPages: 5 });
    expect(config.enabled).toBe(true);
    expect(config.pageParam).toBe('p');
    expect(config.pageSize).toBe(50);
    expect(config.maxPages).toBe(5);
  });
});

describe('buildPageUrl', () => {
  it('appends page and page size params', () => {
    const url = buildPageUrl('https://api.example.com/users', baseConfig, 2);
    expect(url).toContain('page=2');
    expect(url).toContain('per_page=100');
  });

  it('works with existing query params', () => {
    const url = buildPageUrl('https://api.example.com/users?active=true', baseConfig, 1);
    expect(url).toContain('active=true');
    expect(url).toContain('page=1');
  });
});

describe('paginatedUrls', () => {
  it('returns single url when pagination disabled', () => {
    const urls = paginatedUrls('https://api.example.com/items', { ...baseConfig, enabled: false });
    expect(urls).toHaveLength(1);
    expect(urls[0]).toBe('https://api.example.com/items');
  });

  it('returns maxPages urls when enabled', () => {
    const urls = paginatedUrls('https://api.example.com/items', baseConfig);
    expect(urls).toHaveLength(3);
    expect(urls[0]).toContain('page=1');
    expect(urls[2]).toContain('page=3');
  });
});
