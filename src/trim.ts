/**
 * trim.ts — trim whitespace and control characters from endpoint string fields
 */

export interface TrimOptions {
  fields?: string[];
  deep?: boolean;
}

export interface TrimArgs {
  trimFields?: string[];
  trimDeep?: boolean;
}

const DEFAULT_FIELDS = ['path', 'method', 'description', 'summary'];

export function parseTrimArgs(argv: Record<string, unknown>): TrimArgs {
  const raw = argv['trim-fields'];
  const trimFields =
    typeof raw === 'string'
      ? raw.split(',').map((f) => f.trim()).filter(Boolean)
      : Array.isArray(raw)
      ? (raw as string[])
      : undefined;

  return {
    trimFields,
    trimDeep: argv['trim-deep'] === true || argv['trim-deep'] === 'true',
  };
}

export function trimValue(value: unknown): unknown {
  if (typeof value === 'string') {
    return value.trim();
  }
  return value;
}

export function trimObject(
  obj: Record<string, unknown>,
  fields: string[],
  deep: boolean
): Record<string, unknown> {
  const result: Record<string, unknown> = { ...obj };
  for (const key of Object.keys(result)) {
    const val = result[key];
    if (fields.includes(key) || deep) {
      if (typeof val === 'string') {
        result[key] = val.trim();
      } else if (deep && val !== null && typeof val === 'object' && !Array.isArray(val)) {
        result[key] = trimObject(val as Record<string, unknown>, fields, deep);
      }
    }
  }
  return result;
}

export function applyTrim(
  endpoints: Record<string, unknown>[],
  options: TrimOptions
): Record<string, unknown>[] {
  const fields = options.fields ?? DEFAULT_FIELDS;
  const deep = options.deep ?? false;
  return endpoints.map((ep) => trimObject(ep, fields, deep));
}
