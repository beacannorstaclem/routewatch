import {
  parseNormalizeArgs,
  normalizeMethod,
  normalizePath,
  applyNormalize,
} from './normalize';

describe('parseNormalizeArgs', () => {
  it('defaults lowercaseMethod and trimTrailingSlash to true', () => {
    const result = parseNormalizeArgs({});
    expect(result.options.lowercaseMethod).toBe(true);
    expect(result.options.trimTrailingSlash).toBe(true);
  });

  it('respects explicit false for lowercaseMethod', () => {
    const result = parseNormalizeArgs({ 'lowercase-method': false });
    expect(result.options.lowercaseMethod).toBe(false);
  });

  it('enables sortQueryParams when flag set', () => {
    const result = parseNormalizeArgs({ 'sort-query': true });
    expect(result.options.sortQueryParams).toBe(true);
  });
});

describe('normalizeMethod', () => {
  it('lowercases when option enabled', () => {
    expect(normalizeMethod('GET', { lowercaseMethod: true })).toBe('get');
  });

  it('uppercases when option disabled', () => {
    expect(normalizeMethod('get', { lowercaseMethod: false })).toBe('GET');
  });
});

describe('normalizePath', () => {
  it('trims trailing slash', () => {
    expect(normalizePath('/users/', { trimTrailingSlash: true })).toBe('/users');
  });

  it('does not trim root slash', () => {
    expect(normalizePath('/', { trimTrailingSlash: true })).toBe('/');
  });

  it('sorts query params', () => {
    const result = normalizePath('/search?z=1&a=2', { sortQueryParams: true });
    expect(result).toBe('/search?a=2&z=1');
  });

  it('lowercases path', () => {
    expect(normalizePath('/Users/Profile', { lowercasePath: true })).toBe('/users/profile');
  });
});

describe('applyNormalize', () => {
  it('normalizes all endpoints', () => {
    const endpoints = [
      { method: 'GET', path: '/users/' },
      { method: 'POST', path: '/items/' },
    ];
    const result = applyNormalize(endpoints, { lowercaseMethod: true, trimTrailingSlash: true });
    expect(result[0]).toMatchObject({ method: 'get', path: '/users' });
    expect(result[1]).toMatchObject({ method: 'post', path: '/items' });
  });

  it('preserves extra fields', () => {
    const endpoints = [{ method: 'GET', path: '/a/', status: 200 }];
    const result = applyNormalize(endpoints, { trimTrailingSlash: true });
    expect(result[0].status).toBe(200);
  });
});
