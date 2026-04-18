import { parseHeaderArgs, mergeHeaders, applyHeaders } from './header';
import { parseHeaderConfig } from './header.config';

describe('parseHeaderArgs', () => {
  it('parses a single header', () => {
    const result = parseHeaderArgs({ header: 'Authorization: Bearer token' });
    expect(result.headers).toEqual({ Authorization: 'Bearer token' });
  });

  it('parses multiple headers', () => {
    const result = parseHeaderArgs({ header: ['X-Api-Key: abc', 'Accept: application/json'] });
    expect(result.headers).toEqual({ 'X-Api-Key': 'abc', Accept: 'application/json' });
  });

  it('returns empty headers when none provided', () => {
    expect(parseHeaderArgs({}).headers).toEqual({});
  });

  it('throws on invalid format', () => {
    expect(() => parseHeaderArgs({ header: 'BadHeader' })).toThrow('Invalid header format');
  });

  it('throws on empty header name', () => {
    expect(() => parseHeaderArgs({ header: ': value' })).toThrow('Header name cannot be empty');
  });
});

describe('mergeHeaders', () => {
  it('merges base and override', () => {
    const result = mergeHeaders({ A: '1', B: '2' }, { B: '3', C: '4' });
    expect(result).toEqual({ A: '1', B: '3', C: '4' });
  });
});

describe('applyHeaders', () => {
  it('applies headers to RequestInit', () => {
    const init = applyHeaders({ method: 'GET' }, { headers: { 'X-Test': 'yes' } });
    expect((init.headers as Record<string, string>)['X-Test']).toBe('yes');
  });

  it('merges with existing headers', () => {
    const init = applyHeaders(
      { headers: { Accept: 'text/plain' } },
      { headers: { 'X-Test': 'yes' } }
    );
    expect(init.headers).toEqual({ Accept: 'text/plain', 'X-Test': 'yes' });
  });
});

describe('parseHeaderConfig', () => {
  it('parses valid config object', () => {
    const result = parseHeaderConfig({ headers: { 'X-Custom': 'value' } });
    expect(result.headers).toEqual({ 'X-Custom': 'value' });
  });

  it('throws on non-object input', () => {
    expect(() => parseHeaderConfig(null)).toThrow('Header config must be an object');
  });

  it('throws on non-string header value', () => {
    expect(() => parseHeaderConfig({ headers: { Bad: 123 } })).toThrow('must be a string');
  });
});
