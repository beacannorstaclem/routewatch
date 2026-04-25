import * as fs from 'fs';
import { ReorderOptions } from './reorder';

export interface ReorderConfig {
  fields?: string[];
  direction?: 'asc' | 'desc';
}

export function parseReorderConfig(raw: unknown): ReorderConfig {
  if (!raw || typeof raw !== 'object') return {};
  const obj = raw as Record<string, unknown>;

  const fields = Array.isArray(obj.fields)
    ? obj.fields.map(String)
    : typeof obj.fields === 'string'
    ? obj.fields.split(',')
    : undefined;

  const direction =
    obj.direction === 'asc' || obj.direction === 'desc'
      ? obj.direction
      : undefined;

  return { fields, direction };
}

export function loadReorderConfig(configPath: string): ReorderConfig {
  if (!fs.existsSync(configPath)) return {};
  try {
    const text = fs.readFileSync(configPath, 'utf-8');
    return parseReorderConfig(JSON.parse(text));
  } catch {
    return {};
  }
}

export function reorderConfigToOptions(
  config: ReorderConfig
): ReorderOptions | null {
  if (!config.fields || config.fields.length === 0) return null;
  return {
    fields: config.fields,
    direction: config.direction ?? 'asc',
  };
}

export function mergeReorderConfigs(
  base: ReorderConfig,
  override: ReorderConfig
): ReorderConfig {
  return {
    fields: override.fields ?? base.fields,
    direction: override.direction ?? base.direction,
  };
}
