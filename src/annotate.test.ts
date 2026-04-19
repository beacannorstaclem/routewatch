import { parseAnnotateArgs, applyAnnotations, formatAnnotations } from './annotate';
import { Endpoint } from './snapshot';

const ep = (overrides: Partial<Endpoint> = {}): Endpoint => ({
  method: 'GET',
  url: 'https://api.example.com/users',
  status: 200,
  headers: {},
  body: null,
  ...overrides,
});

describe('parseAnnotateArgs', () => {
  it('returns empty annotations when arg missing', () => {
    expect(parseAnnotateArgs({})).toEqual({ annotations: [] });
  });

  it('parses a single annotation', () => {
    const result = parseAnnotateArgs({ annotate: 'env=production' });
    expect(result.annotations).toEqual([{ key: 'env', value: 'production' }]);
  });

  it('parses multiple annotations', () => {
    const result = parseAnnotateArgs({ annotate: ['env=production', 'team=backend'] });
    expect(result.annotations).toHaveLength(2);
    expect(result.annotations[1]).toEqual({ key: 'team', value: 'backend' });
  });

  it('ignores entries without =', () => {
    const result = parseAnnotateArgs({ annotate: 'badentry' });
    expect(result.annotations).toHaveLength(0);
  });

  it('handles value containing =', () => {
    const result = parseAnnotateArgs({ annotate: 'token=abc=def' });
    expect(result.annotations[0]).toEqual({ key: 'token', value: 'abc=def' });
  });
});

describe('applyAnnotations', () => {
  it('returns endpoints unchanged when no annotations', () => {
    const endpoints = [ep()];
    expect(applyAnnotations(endpoints, { annotations: [] })).toBe(endpoints);
  });

  it('adds annotation to all endpoints', () => {
    const result = applyAnnotations([ep(), ep()], {
      annotations: [{ key: 'env', value: 'staging' }],
    });
    expect(result[0].meta?.env).toBe('staging');
    expect(result[1].meta?.env).toBe('staging');
  });

  it('preserves existing meta', () => {
    const result = applyAnnotations([ep({ meta: { existing: 'yes' } })], {
      annotations: [{ key: 'env', value: 'prod' }],
    });
    expect(result[0].meta?.existing).toBe('yes');
    expect(result[0].meta?.env).toBe('prod');
  });
});

describe('formatAnnotations', () => {
  it('returns empty string when no meta', () => {
    expect(formatAnnotations(ep())).toBe('');
  });

  it('formats meta as key=value pairs', () => {
    const result = formatAnnotations(ep({ meta: { env: 'prod', team: 'api' } }));
    expect(result).toContain('env=prod');
    expect(result).toContain('team=api');
  });
});
