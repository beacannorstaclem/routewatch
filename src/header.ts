export interface HeaderConfig {
  headers: Record<string, string>;
}

export function parseHeaderArgs(args: Record<string, unknown>): HeaderConfig {
  const headers: Record<string, string> = {};

  if (args.header) {
    const raw = Array.isArray(args.header) ? args.header : [args.header];
    for (const h of raw) {
      const idx = String(h).indexOf(':');
      if (idx < 1) throw new Error(`Invalid header format: "${h}" (expected "Name: Value")`);
      const name = String(h).slice(0, idx).trim();
      const value = String(h).slice(idx + 1).trim();
      if (!name) throw new Error(`Header name cannot be empty in: "${h}"`);
      headers[name] = value;
    }
  }

  return { headers };
}

export function mergeHeaders(
  base: Record<string, string>,
  override: Record<string, string>
): Record<string, string> {
  return { ...base, ...override };
}

export function applyHeaders(
  init: RequestInit,
  config: HeaderConfig
): RequestInit {
  const existing = (init.headers as Record<string, string>) ?? {};
  return {
    ...init,
    headers: mergeHeaders(existing, config.headers),
  };
}
