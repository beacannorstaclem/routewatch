import { validateEndpoints, formatValidationSummary, parseValidateArgs } from './validate';
import { Endpoint } from './snapshot';

const good: Endpoint = { method: 'GET', url: 'https://api.example.com/users', status: 200, headers: {}, body: '' };
const badMethod: Endpoint = { method: 'FETCH' as any, url: 'https://api.example.com/items', status: 200, headers: {}, body: '' };
const badUrl: Endpoint = { method: 'POST', url: 'not-a-url', status: 201, headers: {}, body: '' };
const missingStatus: Endpoint = { method: 'DELETE', url: 'https://api.example.com/x', status: undefined as any, headers: {}, body: '' };

describe('validateEndpoints', () => {
  it('returns all valid when endpoints are correct', () => {
    const result = validateEndpoints([good]);
    expect(result.valid).toBe(1);
    expect(result.invalid).toBe(0);
    expect(result.results).toHaveLength(0);
  });

  it('catches invalid method', () => {
    const result = validateEndpoints([badMethod]);
    expect(result.invalid).toBe(1);
    expect(result.results[0].errors[0]).toMatch(/method/);
  });

  it('catches invalid url pattern', () => {
    const result = validateEndpoints([badUrl]);
    expect(result.invalid).toBe(1);
    expect(result.results[0].errors[0]).toMatch(/url/);
  });

  it('catches missing required field', () => {
    const result = validateEndpoints([missingStatus]);
    expect(result.invalid).toBe(1);
    expect(result.results[0].errors[0]).toMatch(/status/);
  });

  it('handles multiple endpoints mixed', () => {
    const result = validateEndpoints([good, badMethod, badUrl]);
    expect(result.valid).toBe(1);
    expect(result.invalid).toBe(2);
  });
});

describe('formatValidationSummary', () => {
  it('formats summary string', () => {
    const result = validateEndpoints([good, badMethod]);
    const text = formatValidationSummary(result);
    expect(text).toContain('1 valid');
    expect(text).toContain('1 invalid');
    expect(text).toContain('method');
  });
});

describe('parseValidateArgs', () => {
  it('returns default rules when no args', () => {
    const rules = parseValidateArgs({});
    expect(rules.length).toBeGreaterThan(0);
  });

  it('parses rules from args', () => {
    const custom = [{ field: 'url', required: true }];
    const rules = parseValidateArgs({ 'validate-rules': JSON.stringify(custom) });
    expect(rules).toEqual(custom);
  });

  it('falls back to defaults on invalid JSON', () => {
    const rules = parseValidateArgs({ 'validate-rules': '{bad json' });
    expect(rules.length).toBeGreaterThan(0);
  });
});
