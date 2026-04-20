import {
  parseNamespaceArgs,
  buildNamespace,
  extractPathNamespace,
  namespaceEndpoints,
  groupByNamespace,
} from './namespace';

const endpoints = [
  { method: 'GET', url: 'https://api.example.com/users/1' },
  { method: 'POST', url: 'https://api.example.com/users' },
  { method: 'GET', url: 'https://api.example.com/orders/42' },
  { method: 'DELETE', url: 'https://api.example.com/orders/42' },
];

describe('parseNamespaceArgs', () => {
  it('returns empty options for empty args', () => {
    expect(parseNamespaceArgs({})).toEqual({});
  });

  it('parses separator and prefix', () => {
    expect(parseNamespaceArgs({ 'namespace-separator': '::', 'namespace-prefix': 'v1' })).toEqual({
      separator: '::',
      prefix: 'v1',
    });
  });
});

describe('extractPathNamespace', () => {
  it('extracts first path segment from full URL', () => {
    expect(extractPathNamespace('https://api.example.com/users/1')).toBe('users');
  });

  it('returns root for URL with no path', () => {
    expect(extractPathNamespace('https://api.example.com/')).toBe('root');
  });

  it('handles relative paths', () => {
    expect(extractPathNamespace('/orders/42')).toBe('orders');
  });
});

describe('buildNamespace', () => {
  it('builds namespace without prefix', () => {
    expect(buildNamespace('GET', 'https://api.example.com/users/1')).toBe('users');
  });

  it('builds namespace with prefix', () => {
    expect(buildNamespace('GET', 'https://api.example.com/users/1', { prefix: 'v2' })).toBe('v2/users');
  });

  it('uses custom separator', () => {
    expect(buildNamespace('GET', 'https://api.example.com/users/1', { prefix: 'v2', separator: '::' })).toBe('v2::users');
  });
});

describe('namespaceEndpoints', () => {
  it('adds namespace to each endpoint', () => {
    const result = namespaceEndpoints(endpoints);
    expect(result[0].namespace).toBe('users');
    expect(result[2].namespace).toBe('orders');
  });
});

describe('groupByNamespace', () => {
  it('groups endpoints by namespace', () => {
    const groups = groupByNamespace(endpoints);
    expect(Object.keys(groups).sort()).toEqual(['orders', 'users']);
    expect(groups['users']).toHaveLength(2);
    expect(groups['orders']).toHaveLength(2);
  });
});
