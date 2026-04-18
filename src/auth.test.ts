import { applyAuth, parseAuthArgs } from './auth';
import { parseAuthConfig, isAuthScheme } from './auth.config';

describe('isAuthScheme', () => {
  it('accepts valid schemes', () => {
    expect(isAuthScheme('none')).toBe(true);
    expect(isAuthScheme('bearer')).toBe(true);
    expect(isAuthScheme('basic')).toBe(true);
    expect(isAuthScheme('header')).toBe(true);
  });
  it('rejects invalid schemes', () => {
    expect(isAuthScheme('oauth')).toBe(false);
    expect(isAuthScheme(42)).toBe(false);
  });
});

describe('applyAuth', () => {
  it('returns headers unchanged for none', () => {
    const result = applyAuth({ 'X-Foo': 'bar' }, { scheme: 'none' });
    expect(result).toEqual({ 'X-Foo': 'bar' });
  });

  it('applies bearer token', () => {
    const result = applyAuth({}, { scheme: 'bearer', token: 'abc123' });
    expect(result['Authorization']).toBe('Bearer abc123');
  });

  it('throws if bearer token missing', () => {
    expect(() => applyAuth({}, { scheme: 'bearer' })).toThrow();
  });

  it('applies basic auth', () => {
    const result = applyAuth({}, { scheme: 'basic', username: 'user', password: 'pass' });
    const expected = 'Basic ' + Buffer.from('user:pass').toString('base64');
    expect(result['Authorization']).toBe(expected);
  });

  it('throws if basic auth missing username', () => {
    expect(() => applyAuth({}, { scheme: 'basic', password: 'pass' })).toThrow();
  });

  it('throws if basic auth missing password', () => {
    expect(() => applyAuth({}, { scheme: 'basic', username: 'user' })).toThrow();
  });

  it('applies custom header auth', () => {
    const result = applyAuth({}, { scheme: 'header', headerName: 'X-API-Key', headerValue: 'secret' });
    expect(result['X-API-Key']).toBe('secret');
  });

  it('throws if header auth missing fields', () => {
    expect(() => applyAuth({}, { scheme: 'header', headerName: 'X-Key' })).toThrow();
  });

  it('does not mutate the original headers object', () => {
    const headers = { 'X-Existing': 'value' };
    applyAuth(headers, { scheme: 'bearer', token: 'tok' });
    expect(headers).not.toHaveProperty('Authorization');
  });
});

describe('parseAuthArgs', () => {
  it('defaults to none', () => {
    expect(parseAuthArgs({})).toEqual({ scheme: 'none' });
  });
  it('parses bearer args', () => {
    const result = parseAuthArgs({ auth: 'bearer', token: 'tok' });
    expect(result.scheme).toBe('bearer');
    expect(result.token).toBe('tok');
  });
});

describe('parseAuthConfig', () => {
  it('returns none for empty input', () => {
    expect(parseAuthConfig(null)).toEqual({ scheme: 'none' });
  });
  it('parses config object', () => {
    const result = parseAuthConfig({ scheme: 'bearer', token: 'mytoken' });
    expect(result.scheme).toBe('bearer');
    expect(result.token).toBe('mytoken');
  });
});
