import { describe, it, expect } from 'vitest';
import { parseTrimArgs, trimValue, trimObject, applyTrim } from './trim';

describe('parseTrimArgs', () => {
  it('returns empty args when no flags provided', () => {
    expect(parseTrimArgs({})).toEqual({ trimFields: undefined, trimDeep: false });
  });

  it('parses trim-fields as comma-separated string', () => {
    const result = parseTrimArgs({ 'trim-fields': 'path, method , summary' });
    expect(result.trimFields).toEqual(['path', 'method', 'summary']);
  });

  it('parses trim-fields as array', () => {
    const result = parseTrimArgs({ 'trim-fields': ['path', 'method'] });
    expect(result.trimFields).toEqual(['path', 'method']);
  });

  it('parses trim-deep flag', () => {
    expect(parseTrimArgs({ 'trim-deep': true }).trimDeep).toBe(true);
    expect(parseTrimArgs({ 'trim-deep': 'true' }).trimDeep).toBe(true);
    expect(parseTrimArgs({ 'trim-deep': false }).trimDeep).toBe(false);
  });
});

describe('trimValue', () => {
  it('trims string values', () => {
    expect(trimValue('  hello  ')).toBe('hello');
    expect(trimValue('\t/users\n')).toBe('/users');
  });

  it('leaves non-string values unchanged', () => {
    expect(trimValue(42)).toBe(42);
    expect(trimValue(null)).toBeNull();
    expect(trimValue(true)).toBe(true);
  });
});

describe('trimObject', () => {
  it('trims only specified fields', () => {
    const obj = { path: '  /users  ', method: '  GET  ', status: 200 };
    const result = trimObject(obj, ['path'], false);
    expect(result.path).toBe('/users');
    expect(result.method).toBe('  GET  ');
    expect(result.status).toBe(200);
  });

  it('trims all string fields when deep is true', () => {
    const obj = { path: '  /users  ', method: '  GET  ', status: 200 };
    const result = trimObject(obj, [], true);
    expect(result.path).toBe('/users');
    expect(result.method).toBe('GET');
    expect(result.status).toBe(200);
  });

  it('recursively trims nested objects when deep is true', () => {
    const obj = { meta: { description: '  hello  ' } };
    const result = trimObject(obj as Record<string, unknown>, [], true);
    expect((result.meta as Record<string, unknown>).description).toBe('hello');
  });
});

describe('applyTrim', () => {
  it('applies trim to a list of endpoints using default fields', () => {
    const endpoints = [
      { path: '  /users  ', method: '  GET  ', status: 200 },
      { path: '/posts', method: 'POST  ', description: '  Create post  ' },
    ];
    const result = applyTrim(endpoints as Record<string, unknown>[], {});
    expect(result[0].path).toBe('/users');
    expect(result[0].method).toBe('GET');
    expect(result[1].description).toBe('Create post');
  });

  it('respects custom fields option', () => {
    const endpoints = [{ path: '  /users  ', custom: '  value  ' }];
    const result = applyTrim(endpoints as Record<string, unknown>[], { fields: ['custom'] });
    expect(result[0].path).toBe('  /users  ');
    expect(result[0].custom).toBe('value');
  });
});
