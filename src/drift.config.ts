import { readFileSync, existsSync } from 'fs';
import type { DriftOptions } from './drift';

export interface DriftConfig {
  threshold?: number;
  window?: number;
  ignoreAdded?: boolean;
  ignoreRemoved?: boolean;
}

export function parseDriftConfig(raw: unknown): DriftConfig {
  if (!raw || typeof raw !== 'object') return {};
  const obj = raw as Record<string, unknown>;
  const config: DriftConfig = {};
  if (typeof obj['threshold'] === 'number') config.threshold = obj['threshold'];
  if (typeof obj['window'] === 'number') config.window = obj['window'];
  if (typeof obj['ignoreAdded'] === 'boolean') config.ignoreAdded = obj['ignoreAdded'];
  if (typeof obj['ignoreRemoved'] === 'boolean') config.ignoreRemoved = obj['ignoreRemoved'];
  return config;
}

export function loadDriftConfig(configPath?: string): DriftConfig {
  const paths = configPath ? [configPath] : ['routewatch.drift.json', '.routewatch/drift.json'];
  for (const p of paths) {
    if (existsSync(p)) {
      try {
        const raw = JSON.parse(readFileSync(p, 'utf8'));
        return parseDriftConfig(raw);
      } catch {
        // ignore parse errors
      }
    }
  }
  return {};
}

export function driftConfigToOptions(config: DriftConfig): Partial<DriftOptions> {
  return {
    ...(config.threshold !== undefined ? { threshold: config.threshold } : {}),
    ...(config.window !== undefined ? { window: config.window } : {}),
    ...(config.ignoreAdded !== undefined ? { ignoreAdded: config.ignoreAdded } : {}),
    ...(config.ignoreRemoved !== undefined ? { ignoreRemoved: config.ignoreRemoved } : {}),
  };
}

export function mergeDriftConfigs(...configs: DriftConfig[]): DriftConfig {
  return Object.assign({}, ...configs);
}
