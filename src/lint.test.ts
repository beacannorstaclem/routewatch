import { lintEndpoints, parseLintArgs, formatLintResult, LintRule } from './lint';
import { parseLintConfig } from './lint.config';
import { Endpoint } from './snapshot';

const base: Endpoint = { method: 'GET', url: 'https://api.example.com/users', status: 200, tags: ['users'], description: 'List users' };

describe('lintEndpoints', () => {
  it('passes clean endpoint', () => {
    const result = lintEndpoints([base], ['no-http', 'require-tag', 'no-wildcard-path', 'require-description']);
    expect(result.passed).toBe(true);
    expect(result.violations).toHaveLength(0);
  });

  it('flags http url', () => {
    const ep = { ...base, url: 'http://api.example.com/users' };
    const result = lintEndpoints([ep], ['no-http']);
    expect(result.passed).toBe(false);
    expect(result.violations[0].rule).toBe('no-http');
  });

  it('flags missing tag', () => {
    const ep = { ...base, tags: [] };
    const result = lintEndpoints([ep], ['require-tag']);
    expect(result.violations[0].rule).toBe('require-tag');
  });

  it('flags wildcard path', () => {
    const ep = { ...base, url: 'https://api.example.com/*' };
    const result = lintEndpoints([ep], ['no-wildcard-path']);
    expect(result.violations[0].rule).toBe('no-wildcard-path');
  });

  it('flags missing description', () => {
    const ep = { ...base, description: undefined };
    const result = lintEndpoints([ep], ['require-description']);
    expect(result.violations[0].rule).toBe('require-description');
  });
});

describe('parseLintArgs', () => {
  it('returns defaults when no arg', () => {
    expect(parseLintArgs({})).toEqual(['no-http', 'no-wildcard-path']);
  });

  it('parses comma-separated rules', () => {
    const rules = parseLintArgs({ 'lint-rules': 'no-http,require-tag' });
    expect(rules).toContain('no-http');
    expect(rules).toContain('require-tag');
  });

  it('ignores invalid rules', () => {
    const rules = parseLintArgs({ 'lint-rules': 'no-http,invalid-rule' });
    expect(rules).toEqual(['no-http']);
  });
});

describe('formatLintResult', () => {
  it('formats passing result', () => {
    expect(formatLintResult({ violations: [], passed: true })).toMatch(/passed/);
  });

  it('formats violations', () => {
    const result = lintEndpoints([{ ...base, url: 'http://x.com' }], ['no-http']);
    expect(formatLintResult(result)).toMatch(/no-http/);
  });
});

describe('parseLintConfig', () => {
  it('returns defaults for empty input', () => {
    const cfg = parseLintConfig(null);
    expect(cfg.failOnViolation).toBe(true);
    expect(cfg.rules).toContain('no-http');
  });

  it('parses valid config', () => {
    const cfg = parseLintConfig({ rules: ['require-tag'], failOnViolation: false });
    expect(cfg.rules).toEqual(['require-tag']);
    expect(cfg.failOnViolation).toBe(false);
  });
});
