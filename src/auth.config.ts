import fs from 'fs';
import path from 'path';
import type { AuthConfig, AuthScheme } from './auth';
import { isSeverity } from './alert.config';

export function isAuthScheme(value: unknown): value is AuthScheme {
  return typeof value === 'string' && ['none', 'bearer', 'basic', 'header'].includes(value);
}

export function parseAuthConfig(raw: unknown): AuthConfig {
  if (!raw || typeof raw !== 'object') return { scheme: 'none' };
  const obj = raw as Record<string, unknown>;
  const scheme = isAuthScheme(obj['scheme']) ? obj['scheme'] : 'none';
  return {
    scheme,
    token: typeof obj['token'] === 'string' ? obj['token'] : undefined,
    username: typeof obj['username'] === 'string' ? obj['username'] : undefined,
    password: typeof obj['password'] === 'string' ? obj['password'] : undefined,
    headerName: typeof obj['headerName'] === 'string' ? obj['headerName'] : undefined,
    headerValue: typeof obj['headerValue'] === 'string' ? obj['headerValue'] : undefined,
  };
}

export function loadAuthConfig(configPath?: string): AuthConfig {
  const filePath = configPath || path.resolve(process.cwd(), 'auth.config.json');
  if (!fs.existsSync(filePath)) return { scheme: 'none' };
  try {
    const raw = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    return parseAuthConfig(raw);
  } catch {
    return { scheme: 'none' };
  }
}
