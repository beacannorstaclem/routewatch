/**
 * sanitize.config.ts — load and merge sanitize configuration
 */

import fs from 'fs';
import path from 'path';
import { SanitizeOptions, parseSanitizeArgs } from './sanitize';

export interface SanitizeConfig {
  sanitize?: SanitizeOptions;
}

export function parseSanitizeConfig(raw: unknown): SanitizeOptions {
  if (!raw || typeof raw !== 'object') return {};
  return parseSanitizeArgs(raw as Record<string, unknown>);
}

export function loadSanitizeConfig(configPath?: string): SanitizeOptions {
  const candidates = configPath
    ? [configPath]
    : [
        path.resolve(process.cwd(), 'routewatch.sanitize.json'),
        path.resolve(process.cwd(), 'routewatch.json'),
      ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      try {
        const raw = JSON.parse(fs.readFileSync(candidate, 'utf-8'));
        const section = raw['sanitize'] ?? raw;
        return parseSanitizeConfig(section);
      } catch {
        // ignore parse errors
      }
    }
  }
  return {};
}

export function mergeSanitizeConfigs(
  base: SanitizeOptions,
  override: SanitizeOptions
): SanitizeOptions {
  return {
    ...base,
    ...override,
    allowedMethods:
      override.allowedMethods ?? base.allowedMethods,
  };
}
