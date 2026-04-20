import * as fs from 'fs';
import * as path from 'path';
import { ReplayOptions } from './replay';

export interface ReplayConfig {
  delay?: number;
  dryRun?: boolean;
  headers?: Record<string, string>;
  authToken?: string;
}

export function parseReplayConfig(raw: unknown): ReplayConfig {
  if (typeof raw !== 'object' || raw === null) return {};
  const obj = raw as Record<string, unknown>;
  const config: ReplayConfig = {};
  if (typeof obj['delay'] === 'number') config.delay = obj['delay'];
  if (typeof obj['dryRun'] === 'boolean') config.dryRun = obj['dryRun'];
  if (typeof obj['authToken'] === 'string') config.authToken = obj['authToken'];
  if (typeof obj['headers'] === 'object' && obj['headers'] !== null) {
    config.headers = obj['headers'] as Record<string, string>;
  }
  return config;
}

export function loadReplayConfig(configPath?: string): ReplayConfig {
  const candidates = configPath
    ? [configPath]
    : ['.routewatch/replay.json', 'replay.config.json'];
  for (const candidate of candidates) {
    const resolved = path.resolve(process.cwd(), candidate);
    if (fs.existsSync(resolved)) {
      try {
        const raw = JSON.parse(fs.readFileSync(resolved, 'utf-8'));
        return parseReplayConfig(raw);
      } catch {
        return {};
      }
    }
  }
  return {};
}

export function replayConfigToOptions(config: ReplayConfig): ReplayOptions {
  return {
    delay: config.delay,
    dryRun: config.dryRun,
    headers: config.headers,
    authToken: config.authToken,
  };
}
