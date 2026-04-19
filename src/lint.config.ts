import * as fs from 'fs';
import * as path from 'path';
import { LintRule } from './lint';

export interface LintConfig {
  rules: LintRule[];
  failOnViolation: boolean;
}

const ALL_RULES: LintRule[] = ['no-http', 'require-tag', 'no-wildcard-path', 'require-description'];

export function parseLintConfig(raw: unknown): LintConfig {
  if (!raw || typeof raw !== 'object') {
    return { rules: ['no-http', 'no-wildcard-path'], failOnViolation: true };
  }
  const obj = raw as Record<string, unknown>;
  const rules = Array.isArray(obj.rules)
    ? (obj.rules as string[]).filter((r): r is LintRule => ALL_RULES.includes(r as LintRule))
    : ['no-http', 'no-wildcard-path'] as LintRule[];
  const failOnViolation = obj.failOnViolation !== false;
  return { rules, failOnViolation };
}

export function loadLintConfig(configPath?: string): LintConfig {
  const candidates = configPath
    ? [configPath]
    : ['routewatch.lint.json', path.join('.routewatch', 'lint.json')];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      try {
        const raw = JSON.parse(fs.readFileSync(candidate, 'utf-8'));
        return parseLintConfig(raw);
      } catch {
        // ignore parse errors
      }
    }
  }
  return { rules: ['no-http', 'no-wildcard-path'], failOnViolation: true };
}
