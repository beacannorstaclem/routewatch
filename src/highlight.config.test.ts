import {
  parseHighlightConfig,
  mergeHighlightConfigs,
  highlightConfigToOptions,
} from './highlight.config';

describe('parseHighlightConfig', () => {
  it('parses all fields', () => {
    const cfg = parseHighlightConfig({
      term: 'foo',
      fields: ['url', 'method'],
      caseSensitive: true,
      marker: '>>',
    });
    expect(cfg.term).toBe('foo');
    expect(cfg.fields).toEqual(['url', 'method']);
    expect(cfg.caseSensitive).toBe(true);
    expect(cfg.marker).toBe('>>');
  });

  it('ignores invalid fields array entries', () => {
    const cfg = parseHighlightConfig({ fields: ['url', 42, null] });
    expect(cfg.fields).toEqual(['url']);
  });

  it('returns empty config for empty input', () => {
    const cfg = parseHighlightConfig({});
    expect(cfg).toEqual({});
  });

  it('ignores non-boolean caseSensitive', () => {
    const cfg = parseHighlightConfig({ caseSensitive: 'yes' });
    expect(cfg.caseSensitive).toBeUndefined();
  });
});

describe('mergeHighlightConfigs', () => {
  it('override takes precedence', () => {
    const merged = mergeHighlightConfigs(
      { term: 'base', marker: '**' },
      { term: 'override' }
    );
    expect(merged.term).toBe('override');
    expect(merged.marker).toBe('**');
  });

  it('falls back to base when override is missing', () => {
    const merged = mergeHighlightConfigs({ fields: ['url'] }, {});
    expect(merged.fields).toEqual(['url']);
  });
});

describe('highlightConfigToOptions', () => {
  it('maps config to options', () => {
    const opts = highlightConfigToOptions({
      term: 'test',
      fields: ['url'],
      caseSensitive: false,
      marker: '!!',
    });
    expect(opts.term).toBe('test');
    expect(opts.fields).toEqual(['url']);
    expect(opts.caseSensitive).toBe(false);
    expect(opts.marker).toBe('!!');
  });

  it('passes through undefined values', () => {
    const opts = highlightConfigToOptions({});
    expect(opts.term).toBeUndefined();
    expect(opts.marker).toBeUndefined();
  });
});
