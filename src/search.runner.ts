import { loadSearchConfig, mergeSearchConfigs, searchConfigToOptions } from './search.config';
import { parseSearchArgs, searchEndpoints, formatSearchSummary } from './search';
import type { Endpoint } from './snapshot';

export interface SearchRunOptions {
  query: string;
  configPath?: string;
  args?: Record<string, unknown>;
}

export function runSearch(
  endpoints: Endpoint[],
  opts: SearchRunOptions
): { summary: string; count: number } {
  const fileCfg = loadSearchConfig(opts.configPath);
  const argCfg = opts.args ? parseSearchArgs({ query: opts.query, ...opts.args }) : { query: opts.query };
  const merged = mergeSearchConfigs(fileCfg, {
    fields: argCfg.fields,
    caseSensitive: argCfg.caseSensitive,
    regex: argCfg.regex,
  });
  const searchOpts = searchConfigToOptions(opts.query, merged);
  const results = searchEndpoints(endpoints, searchOpts);
  return {
    summary: formatSearchSummary(results, opts.query),
    count: results.length,
  };
}
