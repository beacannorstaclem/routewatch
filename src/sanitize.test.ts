import {
  parseSanitizeArgs,
  sanitizeValue,
  sanitizeObject,
  sanitizeEndpoint,
  applyBulkSanitize,
} from './sanitize';

describe('parseSanitizeArgs', () => {
  it('parses strip-null flag', () => {
    expect(parseSanitizeArgs({ 'strip-null': true }).stripNullFields).toBe(true);
  });

  it('parses allowed-methods', () => {
    const opts = parseSanitizeArgs({ 'allowed-methods': ['get', 'POST'] });
    expect(opts.allowedMethods).toEqual(['GET', 'POST']);
  });

  it('defaults trimStrings to true', () => {
    expect(parseSanitizeArgs({}).trimStrings).toBe(true);
  });
});

describe('sanitizeValue', () => {
  it('trims strings when trimStrings is true', () => {
    expect(sanitizeValue('  hello  ', { trimStrings: true })).toBe('hello');
  });

  it('strips null when stripNullFields is true', () => {
    expect(sanitizeValue(null, { stripNullFields: true })).toBeUndefined();
  });

  it('strips empty strings when stripEmptyStrings is true', () => {
    expect(sanitizeValue('', { trimStrings: true, stripEmptyStrings: true })).toBeUndefined();
  });

  it('recursively sanitizes arrays', () => {
    const result = sanitizeValue(['  a  ', null], {
      trimStrings: true,
      stripNullFields: true,
    }) as string[];
    expect(result).toEqual(['a']);
  });
});

describe('sanitizeObject', () => {
  it('removes null fields when configured', () => {
    const result = sanitizeObject({ a: null, b: 'hello' }, { stripNullFields: true });
    expect(result).toEqual({ b: 'hello' });
  });

  it('trims nested string values', () => {
    const result = sanitizeObject({ url: '  /api  ' }, { trimStrings: true });
    expect(result).toEqual({ url: '/api' });
  });
});

describe('sanitizeEndpoint', () => {
  it('returns null for disallowed methods', () => {
    const ep = { method: 'DELETE', path: '/resource' };
    expect(sanitizeEndpoint(ep, { allowedMethods: ['GET', 'POST'] })).toBeNull();
  });

  it('passes allowed methods through', () => {
    const ep = { method: 'get', path: '/resource' };
    const result = sanitizeEndpoint(ep, { allowedMethods: ['GET'] });
    expect(result).not.toBeNull();
    expect(result?.path).toBe('/resource');
  });
});

describe('applyBulkSanitize', () => {
  it('filters and sanitizes a list of endpoints', () => {
    const endpoints = [
      { method: 'GET', path: '  /users  ', tag: null },
      { method: 'DELETE', path: '/admin' },
    ];
    const result = applyBulkSanitize(endpoints, {
      allowedMethods: ['GET'],
      trimStrings: true,
      stripNullFields: true,
    });
    expect(result).toHaveLength(1);
    expect(result[0].path).toBe('/users');
    expect(result[0]).not.toHaveProperty('tag');
  });
});
