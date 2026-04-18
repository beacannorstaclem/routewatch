import * as fs from 'fs';
import * as path from 'path';
import { AlertConfig, AlertSeverity } from './alert';

const VALID_SEVERITIES: AlertSeverity[] = ['info', 'warning', 'critical'];

function isSeverity(value: unknown): value is AlertSeverity {
  return typeof value === 'string' && (VALID_SEVERITIES as string[]).includes(value);
}

export function parseAlertConfig(raw: Record<string, unknown>): AlertConfig {
  const config: AlertConfig = {};

  const fields: (keyof AlertConfig)[] = ['onRemoved', 'onAdded', 'onStatusChange', 'onBodyChange'];
  for (const field of fields) {
    const val = raw[field];
    if (val === null || val === undefined) {
      config[field] = undefined;
    } else if (isSeverity(val)) {
      config[field] = val;
    } else {
      throw new Error(`Invalid severity for ${field}: ${val}`);
    }
  }

  return config;
}

export function loadAlertConfig(configPath: string): AlertConfig {
  const resolved = path.resolve(configPath);
  if (!fs.existsSync(resolved)) {
    throw new Error(`Alert config file not found: ${resolved}`);
  }
  const raw = JSON.parse(fs.readFileSync(resolved, 'utf-8'));
  return parseAlertConfig(raw);
}
