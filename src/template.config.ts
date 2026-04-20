import * as fs from 'fs';
import * as path from 'path';
import type { TemplateVars } from './template';

export interface TemplateConfig {
  vars?: TemplateVars;
  strict?: boolean;
}

export function parseTemplateConfig(raw: unknown): TemplateConfig {
  if (!raw || typeof raw !== 'object') return {};
  const obj = raw as Record<string, unknown>;
  const vars: TemplateVars = {};
  if (obj['vars'] && typeof obj['vars'] === 'object') {
    for (const [k, v] of Object.entries(obj['vars'] as Record<string, unknown>)) {
      if (typeof v === 'string') vars[k] = v;
    }
  }
  return {
    vars,
    strict: typeof obj['strict'] === 'boolean' ? obj['strict'] : false,
  };
}

export function loadTemplateConfig(configPath?: string): TemplateConfig {
  const filePath = configPath ?? path.resolve(process.cwd(), 'template.config.json');
  if (!fs.existsSync(filePath)) return {};
  try {
    const raw = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    return parseTemplateConfig(raw);
  } catch {
    return {};
  }
}

export function mergeTemplateConfigs(...configs: TemplateConfig[]): TemplateConfig {
  const vars: TemplateVars = {};
  let strict = false;
  for (const c of configs) {
    Object.assign(vars, c.vars ?? {});
    if (c.strict) strict = true;
  }
  return { vars, strict };
}
