import { HighlightOptions } from './highlight';

export interface HighlightConfig {
  term?: string;
  fields?: string[];
  caseSensitive?: boolean;
  marker?: string;
}

export function parseHighlightConfig(raw: Record<string, unknown>): HighlightConfig {
  const cfg: HighlightConfig = {};
  if (typeof raw['term'] === 'string') cfg.term = raw['term'];
  if (Array.isArray(raw['fields'])) {
    cfg.fields = (raw['fields'] as unknown[]).filter(f => typeof f === 'string') as string[];
  }
  if (typeof raw['caseSensitive'] === 'boolean') cfg.caseSensitive = raw['caseSensitive'];
  if (typeof raw['marker'] === 'string') cfg.marker = raw['marker'];
  return cfg;
}

export function loadHighlightConfig(path: string): HighlightConfig {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const raw = require(path);
    return parseHighlightConfig(typeof raw === 'object' && raw !== null ? raw : {});
  } catch {
    return {};
  }
}

export function mergeHighlightConfigs(
  base: HighlightConfig,
  override: HighlightConfig
): HighlightConfig {
  return {
    term: override.term ?? base.term,
    fields: override.fields ?? base.fields,
    caseSensitive: override.caseSensitive ?? base.caseSensitive,
    marker: override.marker ?? base.marker,
  };
}

export function highlightConfigToOptions(cfg: HighlightConfig): HighlightOptions {
  return {
    term: cfg.term,
    fields: cfg.fields,
    caseSensitive: cfg.caseSensitive,
    marker: cfg.marker,
  };
}
