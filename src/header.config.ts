import * as fs from 'fs';
import * as path from 'path';
import { HeaderConfig } from './header';

export interface HeaderConfigFile {
  headers?: Record<string, string>;
}

export function parseHeaderConfig(raw: unknown): HeaderConfig {
  if (!raw || typeof raw !== 'object') throw new Error('Header config must be an object');
  const obj = raw as Record<string, unknown>;
  const headers: Record<string, string> = {};

  if (obj.headers !== undefined) {
    if (typeof obj.headers !== 'object' || Array.isArray(obj.headers))
      throw new Error('"headers" must be a key-value object');
    for (const [k, v] of Object.entries(obj.headers as Record<string, unknown>)) {
      if (typeof v !== 'string') throw new Error(`Header value for "${k}" must be a string`);
      headers[k] = v;
    }
  }

  return { headers };
}

export function loadHeaderConfig(configPath: string): HeaderConfig {
  const resolved = path.resolve(configPath);
  if (!fs.existsSync(resolved)) throw new Error(`Header config file not found: ${resolved}`);
  const raw = JSON.parse(fs.readFileSync(resolved, 'utf-8'));
  return parseHeaderConfig(raw);
}
