import * as fs from 'fs';
import * as path from 'path';
import { ArchiveOptions } from './archive';

export interface ArchiveConfig {
  archiveDir?: string;
  compress?: boolean;
  maxAge?: number;
  maxCount?: number;
}

export function parseArchiveConfig(raw: Record<string, unknown>): ArchiveConfig {
  const config: ArchiveConfig = {};
  if (typeof raw['archiveDir'] === 'string') config.archiveDir = raw['archiveDir'];
  if (typeof raw['compress'] === 'boolean') config.compress = raw['compress'];
  if (typeof raw['maxAge'] === 'number') config.maxAge = raw['maxAge'];
  if (typeof raw['maxCount'] === 'number') config.maxCount = raw['maxCount'];
  return config;
}

export function loadArchiveConfig(configPath: string): ArchiveConfig {
  if (!fs.existsSync(configPath)) return {};
  try {
    const raw = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    return parseArchiveConfig(typeof raw === 'object' && raw !== null ? raw : {});
  } catch {
    return {};
  }
}

export function archiveConfigToOptions(config: ArchiveConfig): ArchiveOptions {
  const opts: ArchiveOptions = {};
  if (config.compress !== undefined) opts.compress = config.compress;
  if (config.maxAge !== undefined) opts.maxAge = config.maxAge;
  if (config.maxCount !== undefined) opts.maxCount = config.maxCount;
  return opts;
}

export function defaultArchiveDir(snapshotsDir: string): string {
  return path.join(snapshotsDir, 'archive');
}
