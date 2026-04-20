import * as fs from 'fs';
import * as path from 'path';

export interface AuditConfig {
  enabled: boolean;
  filePath?: string;
  maxEntries?: number;
}

const DEFAULTS: AuditConfig = {
  enabled: true,
  maxEntries: 500,
};

export function parseAuditConfig(raw: Record<string, unknown>): AuditConfig {
  const config: AuditConfig = { ...DEFAULTS };
  if (typeof raw.enabled === 'boolean') config.enabled = raw.enabled;
  if (typeof raw.filePath === 'string') config.filePath = raw.filePath;
  if (typeof raw.maxEntries === 'number') config.maxEntries = raw.maxEntries;
  return config;
}

export function loadAuditConfig(configPath?: string): AuditConfig {
  const target = configPath ?? path.resolve(process.cwd(), 'audit.config.json');
  if (!fs.existsSync(target)) return { ...DEFAULTS };
  try {
    const raw = JSON.parse(fs.readFileSync(target, 'utf-8'));
    return parseAuditConfig(raw);
  } catch {
    return { ...DEFAULTS };
  }
}
