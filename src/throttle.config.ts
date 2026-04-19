import * as fs from 'fs';
import * as path from 'path';
import { ThrottleConfig, DEFAULT_THROTTLE } from './throttle';

export interface ThrottleConfigFile {
  throttle?: Partial<ThrottleConfig>;
}

export function parseThrottleConfig(raw: unknown): ThrottleConfig {
  if (!raw || typeof raw !== 'object') return { ...DEFAULT_THROTTLE };
  const obj = raw as Record<string, unknown>;
  return {
    requestsPerSecond:
      typeof obj['requestsPerSecond'] === 'number'
        ? obj['requestsPerSecond']
        : DEFAULT_THROTTLE.requestsPerSecond,
    burstLimit:
      typeof obj['burstLimit'] === 'number'
        ? obj['burstLimit']
        : DEFAULT_THROTTLE.burstLimit,
  };
}

export function loadThrottleConfig(configPath?: string): ThrottleConfig {
  const candidates = configPath
    ? [configPath]
    : ['routewatch.json', 'routewatch.config.json'].map((f) => path.resolve(process.cwd(), f));

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      try {
        const raw = JSON.parse(fs.readFileSync(candidate, 'utf-8')) as ThrottleConfigFile;
        if (raw.throttle) return parseThrottleConfig(raw.throttle);
      } catch {
        // ignore parse errors
      }
    }
  }
  return { ...DEFAULT_THROTTLE };
}
