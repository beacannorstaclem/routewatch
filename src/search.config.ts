import { readFileSync, existsSync } from 'fs';
import type { SearchOptions } from './search';

export interface SearchConfig {
  fields?: SearchOptions['fields'];
  caseSensitive?: boolean;
  regex?: boolean;
}

const VALID_FIELDS = ['method', 'path', 'status', 'tag'] as const;

export function parseSearchConfig(raw: Record<string, unknown>): SearchConfig {
  const cfg: SearchConfig = {};
  if (Array.isArray(raw['fields'])) {
    cfg.fields = (raw['fields'] as string[]).filter(
      (f): f is typeof VALID_FIELDS[number] => (VALID_FIELDS as readonly string[]).includes(f)
    ) as SearchOptions['fields'];
  }
  if (typeof raw['caseSensitive'] === 'boolean') cfg.caseSensitive = raw['caseSensitive'];
  if (typeof raw['regex'] === 'boolean') cfg.regex = raw['regex'];
  return cfg;
}

export function loadSearchConfig(configPath?: string): SearchConfig {
  const target = configPath ?? '.routewatch/search.json';
  if (!existsSync(target)) return {};
  try {
    const raw = JSON.parse(readFileSync(target, 'utf8'));
    return parseSearchConfig(raw);
  } catch {
    return {};
  }
}

export function mergeSearchConfigs(base: SearchConfig, override: SearchConfig): SearchConfig {
  return {
    fields: override.fields ?? base.fields,
    caseSensitive: override.caseSensitive ?? base.caseSensitive,
    regex: override.regex ?? base.regex,
  };
}

export function searchConfigToOptions(
  query: string,
  cfg: SearchConfig
): SearchOptions {
  return {
    query,
    fields: cfg.fields,
    caseSensitive: cfg.caseSensitive,
    regex: cfg.regex,
  };
}
