/**
 * mask.ts — field masking for sensitive response body fields
 */

export interface MaskConfig {
  fields: string[];
  replacement?: string;
}

const DEFAULT_REPLACEMENT = "***";

export function parseMaskArgs(args: Record<string, unknown>): MaskConfig {
  const fields = Array.isArray(args.maskFields)
    ? (args.maskFields as string[])
    : typeof args.maskFields === "string"
    ? args.maskFields.split(",").map((f) => f.trim()).filter(Boolean)
    : [];

  const replacement =
    typeof args.maskReplacement === "string"
      ? args.maskReplacement
      : DEFAULT_REPLACEMENT;

  return { fields, replacement };
}

export function maskObject(
  obj: unknown,
  fields: string[],
  replacement: string = DEFAULT_REPLACEMENT
): unknown {
  if (fields.length === 0) return obj;
  if (Array.isArray(obj)) {
    return obj.map((item) => maskObject(item, fields, replacement));
  }
  if (obj !== null && typeof obj === "object") {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      if (fields.includes(key)) {
        result[key] = replacement;
      } else {
        result[key] = maskObject(value, fields, replacement);
      }
    }
    return result;
  }
  return obj;
}

export function applyMask(body: unknown, config: MaskConfig): unknown {
  return maskObject(body, config.fields, config.replacement ?? DEFAULT_REPLACEMENT);
}
