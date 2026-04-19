import { Endpoint } from './snapshot';

export interface ValidationRule {
  field: keyof Endpoint;
  required?: boolean;
  pattern?: RegExp;
  allowedValues?: string[];
}

export interface ValidationResult {
  endpoint: string;
  errors: string[];
}

export interface ValidationSummary {
  valid: number;
  invalid: number;
  results: ValidationResult[];
}

const DEFAULT_RULES: ValidationRule[] = [
  { field: 'method', required: true, allowedValues: ['GET','POST','PUT','PATCH','DELETE','HEAD','OPTIONS'] },
  { field: 'url', required: true, pattern: /^https?:\/\/.+/ },
  { field: 'status', required: true },
];

export function validateEndpoints(
  endpoints: Endpoint[],
  rules: ValidationRule[] = DEFAULT_RULES
): ValidationSummary {
  const results: ValidationResult[] = [];

  for (const ep of endpoints) {
    const errors: string[] = [];
    for (const rule of rules) {
      const value = ep[rule.field];
      if (rule.required && (value === undefined || value === null || value === '')) {
        errors.push(`Field '${rule.field}' is required`);
        continue;
      }
      if (value !== undefined && rule.pattern && typeof value === 'string') {
        if (!rule.pattern.test(value)) {
          errors.push(`Field '${rule.field}' does not match pattern ${rule.pattern}`);
        }
      }
      if (value !== undefined && rule.allowedValues) {
        if (!rule.allowedValues.includes(String(value))) {
          errors.push(`Field '${rule.field}' has invalid value '${value}'`);
        }
      }
    }
    if (errors.length > 0) {
      results.push({ endpoint: `${ep.method} ${ep.url}`, errors });
    }
  }

  return {
    valid: endpoints.length - results.length,
    invalid: results.length,
    results,
  };
}

export function formatValidationSummary(summary: ValidationSummary): string {
  const lines: string[] = [`Validation: ${summary.valid} valid, ${summary.invalid} invalid`];
  for (const r of summary.results) {
    lines.push(`  ${r.endpoint}`);
    for (const e of r.errors) lines.push(`    - ${e}`);
  }
  return lines.join('\n');
}

export function parseValidateArgs(args: Record<string, unknown>): ValidationRule[] {
  if (args['validate-rules']) {
    try {
      return JSON.parse(String(args['validate-rules']));
    } catch {
      return DEFAULT_RULES;
    }
  }
  return DEFAULT_RULES;
}
