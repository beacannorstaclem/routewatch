import * as fs from 'fs';
import * as path from 'path';
import { TimeoutConfig, DEFAULT_TIMEOUT, mergeTimeoutConfig } from './timeout';

export interface TimeoutConfigFile {
  timeout?: { request?: number; connect?: number };
}

export function parseTimeoutConfig(raw: unknown): Partial<TimeoutConfig> {
  if (!raw || typeof raw !== 'object') return {};
  const obj = raw as TimeoutConfigFile;
  const result: Partial<TimeoutConfig> = {};
  if (obj.timeout?.request !== undefined) {
    const v = Number(obj.timeout.request);
    if (!isFinite(v) || v <= 0) throw new Error(`Invalid timeout.request: ${obj.timeout.request}`);
    result.requestTimeout = v;
  }
  if (obj.timeout?.connect !== undefined) {
    const v = Number(obj.timeout.connect);
    if (!isFinite(v) || v <= 0) throw new Error(`Invalid timeout.connect: ${obj.timeout.connect}`);
    result.connectTimeout = v;
  }
  return result;
}

export function loadTimeoutConfig(configPath?: string): TimeoutConfig {
  const filePath = configPath ?? path.join(process.cwd(), 'routewatch.timeout.json');
  if (!fs.existsSync(filePath)) return { ...DEFAULT_TIMEOUT };
  try {
    const raw = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    return mergeTimeoutConfig(DEFAULT_TIMEOUT, parseTimeoutConfig(raw));
  } catch {
    return { ...DEFAULT_TIMEOUT };
  }
}
