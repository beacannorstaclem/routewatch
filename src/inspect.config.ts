import { readFileSync, existsSync } from 'fs';
import type { InspectOptions } from './inspect';

export interface InspectConfig {
  fields?: string[];
  verbose?: boolean;
  showMeta?: boolean;
}

export function parseInspectConfig(raw: Record<string, unknown>): InspectConfig {
  const config: InspectConfig = {};

  if (Array.isArray(raw['fields'])) {
    config.fields = (raw['fields'] as unknown[]).filter(
      (f): f is string => typeof f === 'string'
    );
  } else if (typeof raw['fields'] === 'string') {
    config.fields = raw['fields'].split(',').map((f) => f.trim()).filter(Boolean);
  }

  if (typeof raw['verbose'] === 'boolean') config.verbose = raw['verbose'];
  if (typeof raw['showMeta'] === 'boolean') config.showMeta = raw['showMeta'];

  return config;
}

export function loadInspectConfig(configPath?: string): InspectConfig {
  const candidates = configPath
    ? [configPath]
    : ['routewatch.inspect.json', 'routewatch.json'];

  for (const candidate of candidates) {
    if (existsSync(candidate)) {
      try {
        const raw = JSON.parse(readFileSync(candidate, 'utf-8')) as Record<string, unknown>;
        const section = (raw['inspect'] ?? raw) as Record<string, unknown>;
        return parseInspectConfig(section);
      } catch {
        // skip malformed config
      }
    }
  }

  return {};
}

export function mergeInspectConfigs(
  base: InspectConfig,
  override: Partial<InspectConfig>
): InspectConfig {
  return {
    fields: override.fields ?? base.fields,
    verbose: override.verbose ?? base.verbose,
    showMeta: override.showMeta ?? base.showMeta,
  };
}

export function inspectConfigToOptions(config: InspectConfig): InspectOptions {
  return {
    fields: config.fields,
    verbose: config.verbose,
    showMeta: config.showMeta,
  };
}
