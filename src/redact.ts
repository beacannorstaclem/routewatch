/**
 * Redact sensitive values from endpoint data before saving snapshots or displaying output.
 */

export interface RedactConfig {
  fields: string[];
  replacement: string;
}

const DEFAULT_REPLACEMENT = "[REDACTED]";

const SENSITIVE_DEFAULTS = ["authorization", "x-api-key", "cookie", "set-cookie", "token", "password"];

export function parseRedactArgs(args: Record<string, unknown>): RedactConfig {
  const fields = Array.isArray(args.redact)
    ? (args.redact as string[])
    : typeof args.redact === "string"
    ? args.redact.split(",").map((f) => f.trim())
    : [];

  const replacement =
    typeof args.redactWith === "string" ? args.redactWith : DEFAULT_REPLACEMENT;

  return { fields: [...SENSITIVE_DEFAULTS, ...fields], replacement };
}

export function redactHeaders(
  headers: Record<string, string>,
  config: RedactConfig
): Record<string, string> {
  const lower = config.fields.map((f) => f.toLowerCase());
  return Object.fromEntries(
    Object.entries(headers).map(([k, v]) =>
      lower.includes(k.toLowerCase()) ? [k, config.replacement] : [k, v]
    )
  );
}

export function redactObject(
  obj: Record<string, unknown>,
  config: RedactConfig
): Record<string, unknown> {
  const lower = config.fields.map((f) => f.toLowerCase());
  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) =>
      lower.includes(k.toLowerCase()) ? [k, config.replacement] : [k, v]
    )
  );
}
