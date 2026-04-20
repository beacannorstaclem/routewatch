/**
 * sanitize.ts — strip or normalize unwanted characters/fields from endpoint data
 */

export interface SanitizeOptions {
  stripNullFields?: boolean;
  stripEmptyStrings?: boolean;
  trimStrings?: boolean;
  allowedMethods?: string[];
}

export function parseSanitizeArgs(args: Record<string, unknown>): SanitizeOptions {
  return {
    stripNullFields: args['strip-null'] === true || args['stripNullFields'] === true,
    stripEmptyStrings: args['strip-empty'] === true || args['stripEmptyStrings'] === true,
    trimStrings: args['trim'] !== false && args['trimStrings'] !== false,
    allowedMethods: Array.isArray(args['allowed-methods'])
      ? (args['allowed-methods'] as string[]).map((m) => m.toUpperCase())
      : undefined,
  };
}

export function sanitizeValue(value: unknown, opts: SanitizeOptions): unknown {
  if (value === null && opts.stripNullFields) return undefined;
  if (typeof value === 'string') {
    let v = opts.trimStrings ? value.trim() : value;
    if (opts.stripEmptyStrings && v === '') return undefined;
    return v;
  }
  if (Array.isArray(value)) {
    return value
      .map((item) => sanitizeValue(item, opts))
      .filter((item) => item !== undefined);
  }
  if (value !== null && typeof value === 'object') {
    return sanitizeObject(value as Record<string, unknown>, opts);
  }
  return value;
}

export function sanitizeObject(
  obj: Record<string, unknown>,
  opts: SanitizeOptions
): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(obj)) {
    const sanitized = sanitizeValue(val, opts);
    if (sanitized !== undefined) {
      result[key] = sanitized;
    }
  }
  return result;
}

export function sanitizeEndpoint(
  endpoint: Record<string, unknown>,
  opts: SanitizeOptions
): Record<string, unknown> | null {
  if (
    opts.allowedMethods &&
    typeof endpoint['method'] === 'string' &&
    !opts.allowedMethods.includes(endpoint['method'].toUpperCase())
  ) {
    return null;
  }
  return sanitizeObject(endpoint, opts);
}

export function applyBulkSanitize(
  endpoints: Record<string, unknown>[],
  opts: SanitizeOptions
): Record<string, unknown>[] {
  return endpoints
    .map((ep) => sanitizeEndpoint(ep, opts))
    .filter((ep): ep is Record<string, unknown> => ep !== null);
}
