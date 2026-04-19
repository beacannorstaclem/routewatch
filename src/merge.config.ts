import { readFileSync, existsSync } from 'fs';
import { MergeOptions } from './merge';

export interface MergeConfig {
  preferLeft?: boolean;
  dedupeByKey?: boolean;
}

export function parseMergeConfig(raw: unknown): MergeConfig {
  if (!raw || typeof raw !== 'object') return {};
  const obj = raw as Record<string, unknown>;
  const config: MergeConfig = {};
  if (typeof obj['preferLeft'] === 'boolean') config.preferLeft = obj['preferLeft'];
  if (typeof obj['dedupeByKey'] === 'boolean') config.dedupeByKey = obj['dedupeByKey'];
  return config;
}

export function loadMergeConfig(configPath?: string): MergeConfig {
  const paths = configPath ? [configPath] : ['routewatch.merge.json', '.routewatch/merge.json'];
  for (const p of paths) {
    if (existsSync(p)) {
      try {
        const raw = JSON.parse(readFileSync(p, 'utf-8'));
        return parseMergeConfig(raw);
      } catch {
        // ignore parse errors
      }
    }
  }
  return {};
}

export function mergeConfigToOptions(config: MergeConfig): MergeOptions {
  return {
    preferLeft: config.preferLeft ?? true,
    dedupeByKey: config.dedupeByKey ?? true,
  };
}
