import { describe, it, expect } from 'vitest';
import {
  parseSearchArgs,
  searchEndpoints,
  formatSearchSummary,
  type SearchOptions,
} from './search';
import { parseSearchConfig, mergeSearchConfigs, searchConfigToOptions } from './search.config';

const endpoints = [
  { method: 'GET', path: '/users', status: 200 },
  { method: 'POST', path: '/users', status: 201 },
  { method: 'DELETE', path: '/users/1', status: 204 },
  { method: 'GET', path: '/products', status: 200 },
] as any[];

describe('parseSearchArgs', () => {
  it('parses query and fields', () => {
    const opts = parseSearchArgs({ query: 'users', fields: ['path', 'method'] });
    expect(opts.query).toBe('users');
    expect(opts.fields).toEqual(['path', 'method']);
  });

  it('ignores invalid fields', () => {
    const opts = parseSearchArgs({ query: 'x', fields: ['path', 'invalid'] });
    expect(opts.fields).toEqual(['path']);
  });

  it('defaults to empty query when missing', () => {
    const opts = parseSearchArgs({});
    expect(opts.query).toBe('');
  });
});

describe('searchEndpoints', () => {
  it('matches by path substring', () => {
    const results = searchEndpoints(endpoints, { query: 'users' });
    expect(results).toHaveLength(3);
  });

  it('matches by method', () => {
    const results = searchEndpoints(endpoints, { query: 'GET', fields: ['method'] });
    expect(results).toHaveLength(2);
  });

  it('is case-insensitive by default', () => {
    const results = searchEndpoints(endpoints, { query: 'get', fields: ['method'] });
    expect(results).toHaveLength(2);
  });

  it('respects caseSensitive flag', () => {
    const results = searchEndpoints(endpoints, { query: 'get', fields: ['method'], caseSensitive: true });
    expect(results).toHaveLength(0);
  });

  it('supports regex mode', () => {
    const results = searchEndpoints(endpoints, { query: '/users/\\d+', fields: ['path'], regex: true });
    expect(results).toHaveLength(1);
    expect(results[0].endpoint.path).toBe('/users/1');
  });

  it('returns empty when no match', () => {
    const results = searchEndpoints(endpoints, { query: 'nonexistent' });
    expect(results).toHaveLength(0);
  });
});

describe('formatSearchSummary', () => {
  it('shows count and matched entries', () => {
    const results = searchEndpoints(endpoints, { query: 'products' });
    const summary = formatSearchSummary(results, 'products');
    expect(summary).toContain('1 endpoint');
    expect(summary).toContain('/products');
  });

  it('shows no-match message', () => {
    const summary = formatSearchSummary([], 'xyz');
    expect(summary).toContain('No endpoints matched');
  });
});

describe('parseSearchConfig', () => {
  it('parses valid config', () => {
    const cfg = parseSearchConfig({ fields: ['method', 'path'], caseSensitive: true });
    expect(cfg.fields).toEqual(['method', 'path']);
    expect(cfg.caseSensitive).toBe(true);
  });

  it('filters invalid fields in config', () => {
    const cfg = parseSearchConfig({ fields: ['path', 'bogus'] });
    expect(cfg.fields).toEqual(['path']);
  });
});

describe('mergeSearchConfigs', () => {
  it('override wins', () => {
    const merged = mergeSearchConfigs({ caseSensitive: false }, { caseSensitive: true });
    expect(merged.caseSensitive).toBe(true);
  });

  it('base used when override is absent', () => {
    const merged = mergeSearchConfigs({ regex: true }, {});
    expect(merged.regex).toBe(true);
  });
});

describe('searchConfigToOptions', () => {
  it('builds options from config and query', () => {
    const opts = searchConfigToOptions('hello', { fields: ['path'], regex: true });
    expect(opts.query).toBe('hello');
    expect(opts.fields).toEqual(['path']);
    expect(opts.regex).toBe(true);
  });
});
