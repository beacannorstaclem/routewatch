/**
 * projection.config.ts — load and merge ProjectionOptions from config files
 */

import * as fs from 'fs';
import * as path from 'path';
import { ProjectionOptions } from './projection';

export interface ProjectionConfig {
  include?: string[];
  exclude?: string[];
}

export function parseProjectionConfig(raw: unknown): ProjectionConfig {
  if (!raw || typeof raw !== 'object') return {};
  const obj = raw as Record<string, unknown>;
  const config: ProjectionConfig = {};

  if (Array.isArray(obj['include'])) {
    config.include = obj['include'].map(String);
  }

  if (Array.isArray(obj['exclude'])) {
    config.exclude = obj['exclude'].map(String);
  }

  return config;
}

export function loadProjectionConfig(configPath?: string): ProjectionConfig {
  const filePath = configPath ?? path.resolve(process.cwd(), 'projection.config.json');
  if (!fs.existsSync(filePath)) return {};
  try {
    const raw = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    return parseProjectionConfig(raw);
  } catch {
    return {};
  }
}

export function mergeProjectionConfigs(
  base: ProjectionConfig,
  override: ProjectionConfig
): ProjectionConfig {
  return {
    include: override.include ?? base.include,
    exclude: override.exclude ?? base.exclude,
  };
}

export function projectionConfigToOptions(config: ProjectionConfig): ProjectionOptions {
  return {
    include: config.include,
    exclude: config.exclude,
  };
}
