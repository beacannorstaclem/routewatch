import { Endpoint } from './snapshot';

export type LintRule = 'no-http' | 'require-tag' | 'no-wildcard-path' | 'require-description';

export interface LintViolation {
  endpoint: string;
  rule: LintRule;
  message: string;
}

export interface LintResult {
  violations: LintViolation[];
  passed: boolean;
}

export function lintEndpoints(endpoints: Endpoint[], rules: LintRule[]): LintResult {
  const violations: LintViolation[] = [];

  for (const ep of endpoints) {
    const key = `${ep.method} ${ep.url}`;

    if (rules.includes('no-http') && ep.url.startsWith('http://')) {
      violations.push({ endpoint: key, rule: 'no-http', message: 'Endpoint uses insecure HTTP' });
    }

    if (rules.includes('require-tag') && (!ep.tags || ep.tags.length === 0)) {
      violations.push({ endpoint: key, rule: 'require-tag', message: 'Endpoint has no tags' });
    }

    if (rules.includes('no-wildcard-path') && ep.url.includes('*')) {
      violations.push({ endpoint: key, rule: 'no-wildcard-path', message: 'Endpoint URL contains wildcard' });
    }

    if (rules.includes('require-description') && !ep.description) {
      violations.push({ endpoint: key, rule: 'require-description', message: 'Endpoint missing description' });
    }
  }

  return { violations, passed: violations.length === 0 };
}

export function parseLintArgs(args: Record<string, unknown>): LintRule[] {
  const raw = args['lint-rules'];
  if (!raw) return ['no-http', 'no-wildcard-path'];
  const list = String(raw).split(',').map(s => s.trim());
  const valid: LintRule[] = ['no-http', 'require-tag', 'no-wildcard-path', 'require-description'];
  return list.filter((r): r is LintRule => valid.includes(r as LintRule));
}

export function formatLintResult(result: LintResult): string {
  if (result.passed) return '✔ All lint checks passed.';
  const lines = result.violations.map(v => `  [${v.rule}] ${v.endpoint}: ${v.message}`);
  return `✖ ${result.violations.length} lint violation(s):\n${lines.join('\n')}`;
}
