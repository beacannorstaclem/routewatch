import type { Endpoint } from './snapshot';

export interface SearchOptions {
  query: string;
  fields?: Array<'method' | 'path' | 'status' | 'tag'>;
  caseSensitive?: boolean;
  regex?: boolean;
}

export interface SearchResult {
  endpoint: Endpoint;
  matchedFields: string[];
}

export function parseSearchArgs(args: Record<string, unknown>): SearchOptions {
  const query = typeof args['query'] === 'string' ? args['query'] : '';
  const raw = args['fields'];
  const fields = Array.isArray(raw)
    ? (raw as string[]).filter((f): f is SearchOptions['fields'][number] =>
        ['method', 'path', 'status', 'tag'].includes(f)
      )
    : undefined;
  return {
    query,
    fields,
    caseSensitive: args['case-sensitive'] === true || args['caseSensitive'] === true,
    regex: args['regex'] === true,
  };
}

function buildMatcher(opts: SearchOptions): (value: string) => boolean {
  if (opts.regex) {
    const flags = opts.caseSensitive ? '' : 'i';
    const re = new RegExp(opts.query, flags);
    return (v) => re.test(v);
  }
  const q = opts.caseSensitive ? opts.query : opts.query.toLowerCase();
  return (v) => (opts.caseSensitive ? v : v.toLowerCase()).includes(q);
}

export function searchEndpoints(
  endpoints: Endpoint[],
  opts: SearchOptions
): SearchResult[] {
  const fields = opts.fields ?? ['method', 'path', 'status', 'tag'];
  const match = buildMatcher(opts);
  const results: SearchResult[] = [];

  for (const endpoint of endpoints) {
    const matchedFields: string[] = [];
    if (fields.includes('method') && match(endpoint.method)) matchedFields.push('method');
    if (fields.includes('path') && match(endpoint.path)) matchedFields.push('path');
    if (fields.includes('status') && match(String(endpoint.status))) matchedFields.push('status');
    if (fields.includes('tag')) {
      const tags: string[] = (endpoint as Record<string, unknown>)['tags'] as string[] ?? [];
      if (tags.some((t) => match(t))) matchedFields.push('tag');
    }
    if (matchedFields.length > 0) results.push({ endpoint, matchedFields });
  }
  return results;
}

export function formatSearchSummary(results: SearchResult[], query: string): string {
  if (results.length === 0) return `No endpoints matched "${query}".`;
  const lines = [`Found ${results.length} endpoint(s) matching "${query}":`, ''];
  for (const { endpoint, matchedFields } of results) {
    lines.push(`  ${endpoint.method.padEnd(7)} ${endpoint.path}  (matched: ${matchedFields.join(', ')})`);
  }
  return lines.join('\n');
}
