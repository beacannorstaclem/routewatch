import * as fs from 'fs';
import * as path from 'path';
import { ValidationRule } from './validate';

export interface ValidateConfig {
  rules: ValidationRule[];
  strict?: boolean;
}

export function parseValidateConfig(raw: Record<string, unknown>): ValidateConfig {
  const rules = Array.isArray(raw['rules']) ? (raw['rules'] as ValidationRule[]) : [];
  const strict = typeof raw['strict'] === 'boolean' ? raw['strict'] : false;
  return { rules, strict };
}

export function loadValidateConfig(configPath?: string): ValidateConfig | null {
  const candidates = configPath
    ? [configPath]
    : ['routewatch.validate.json', '.routewatch/validate.json'];

  for (const candidate of candidates) {
    const resolved = path.resolve(process.cwd(), candidate);
    if (fs.existsSync(resolved)) {
      try {
        const raw = JSON.parse(fs.readFileSync(resolved, 'utf-8'));
        return parseValidateConfig(raw);
      } catch {
        return null;
      }
    }
  }
  return null;
}
