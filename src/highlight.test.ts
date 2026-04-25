import {
  parseHighlightArgs,
  highlightTerm,
  applyHighlight,
  formatHighlightSummary,
} from './highlight';

describe('parseHighlightArgs', () => {
  it('parses term and fields', () => {
    const opts = parseHighlightArgs(['--highlight-term', 'foo', '--highlight-fields', 'url,method']);
    expect(opts.term).toBe('foo');
    expect(opts.fields).toEqual(['url', 'method']);
  });

  it('parses case sensitive flag', () => {
    const opts = parseHighlightArgs(['--highlight-case-sensitive']);
    expect(opts.caseSensitive).toBe(true);
  });

  it('parses custom marker', () => {
    const opts = parseHighlightArgs(['--highlight-marker', '>>']);
    expect(opts.marker).toBe('>>');
  });

  it('returns empty opts for unknown args', () => {
    const opts = parseHighlightArgs(['--unrelated', 'val']);
    expect(opts.term).toBeUndefined();
  });
});

describe('highlightTerm', () => {
  it('wraps matches with default marker', () => {
    const { result, count } = highlightTerm('hello world', 'world');
    expect(result).toBe('hello **world**');
    expect(count).toBe(1);
  });

  it('is case-insensitive by default', () => {
    const { result, count } = highlightTerm('Hello WORLD', 'world');
    expect(count).toBe(1);
    expect(result).toContain('**WORLD**');
  });

  it('respects caseSensitive option', () => {
    const { count } = highlightTerm('Hello WORLD', 'world', { caseSensitive: true });
    expect(count).toBe(0);
  });

  it('uses custom marker', () => {
    const { result } = highlightTerm('foo bar', 'bar', { marker: '@@' });
    expect(result).toBe('foo @@bar@@');
  });

  it('counts multiple matches', () => {
    const { count } = highlightTerm('abc abc abc', 'abc');
    expect(count).toBe(3);
  });
});

describe('applyHighlight', () => {
  const record = { url: '/api/users', method: 'GET', status: 'active' };

  it('highlights matching fields', () => {
    const results = applyHighlight(record, { term: 'api' });
    expect(results).toHaveLength(1);
    expect(results[0].key).toBe('url');
  });

  it('restricts to specified fields', () => {
    const results = applyHighlight(record, { term: 'GET', fields: ['method'] });
    expect(results).toHaveLength(1);
    expect(results[0].key).toBe('method');
  });

  it('returns empty array when no matches', () => {
    const results = applyHighlight(record, { term: 'xyz' });
    expect(results).toHaveLength(0);
  });

  it('skips non-string fields', () => {
    const results = applyHighlight({ count: 42 }, { term: '42' });
    expect(results).toHaveLength(0);
  });
});

describe('formatHighlightSummary', () => {
  it('returns no-match message for empty results', () => {
    expect(formatHighlightSummary([])).toBe('No matches found.');
  });

  it('formats results with field names and counts', () => {
    const results = [{ key: 'url', original: '/api', highlighted: '/**api**', matchCount: 1 }];
    const summary = formatHighlightSummary(results);
    expect(summary).toContain('[url]');
    expect(summary).toContain('1 match(es)');
  });
});
