import { readFileSync, existsSync } from 'fs';
import { isPivotField, type PivotField, type PivotOptions } from './pivot';

export interface PivotConfig {
  field?: PivotField;
  countOnly?: boolean;
}

export function parsePivotConfig(raw: unknown): PivotConfig {
  if (!raw || typeof raw !== 'object') return {};
  const obj = raw as Record<string, unknown>;
  const config: PivotConfig = {};

  if (obj['field'] !== undefined) {
    if (!isPivotField(obj['field'])) {
      throw new Error(`Invalid pivot.field: "${obj['field']}"`);
    }
    config.field = obj['field'];
  }

  if (obj['countOnly'] !== undefined) {
    config.countOnly = Boolean(obj['countOnly']);
  }

  return config;
}

export function loadPivotConfig(configPath?: string): PivotConfig {
  const target = configPath ?? '.routewatch/pivot.json';
  if (!existsSync(target)) return {};
  try {
    const raw = JSON.parse(readFileSync(target, 'utf-8'));
    return parsePivotConfig(raw);
  } catch {
    return {};
  }
}

export function pivotConfigToOptions(
  config: PivotConfig,
  overrides: Partial<PivotOptions> = {}
): PivotOptions {
  return {
    field: overrides.field ?? config.field ?? 'method',
    countOnly: overrides.countOnly ?? config.countOnly ?? false,
  };
}
