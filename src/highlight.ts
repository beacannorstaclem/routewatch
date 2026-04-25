export interface HighlightOptions {
  fields?: string[];
  term?: string;
  caseSensitive?: boolean;
  marker?: string;
}

export interface HighlightResult {
  key: string;
  original: string;
  highlighted: string;
  matchCount: number;
}

export function parseHighlightArgs(argv: string[]): HighlightOptions {
  const opts: HighlightOptions = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--highlight-term' && argv[i + 1]) {
      opts.term = argv[++i];
    } else if (argv[i] === '--highlight-fields' && argv[i + 1]) {
      opts.fields = argv[++i].split(',').map(f => f.trim());
    } else if (argv[i] === '--highlight-case-sensitive') {
      opts.caseSensitive = true;
    } else if (argv[i] === '--highlight-marker' && argv[i + 1]) {
      opts.marker = argv[++i];
    }
  }
  return opts;
}

export function highlightTerm(
  text: string,
  term: string,
  opts: Pick<HighlightOptions, 'caseSensitive' | 'marker'> = {}
): { result: string; count: number } {
  const marker = opts.marker ?? '**';
  const flags = opts.caseSensitive ? 'g' : 'gi';
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(escaped, flags);
  let count = 0;
  const result = text.replace(re, match => {
    count++;
    return `${marker}${match}${marker}`;
  });
  return { result, count };
}

export function applyHighlight(
  record: Record<string, unknown>,
  opts: HighlightOptions
): HighlightResult[] {
  if (!opts.term) return [];
  const results: HighlightResult[] = [];
  const fields = opts.fields ?? Object.keys(record);
  for (const field of fields) {
    const val = record[field];
    if (typeof val !== 'string') continue;
    const { result, count } = highlightTerm(val, opts.term, opts);
    if (count > 0) {
      results.push({ key: field, original: val, highlighted: result, matchCount: count });
    }
  }
  return results;
}

export function formatHighlightSummary(results: HighlightResult[]): string {
  if (results.length === 0) return 'No matches found.';
  const lines = results.map(
    r => `  [${r.key}] ${r.matchCount} match(es): ${r.highlighted}`
  );
  return `Highlight results (${results.length} field(s)):\n${lines.join('\n')}`;
}
