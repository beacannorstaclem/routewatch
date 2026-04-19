import { Endpoint } from './snapshot';

export interface Annotation {
  key: string;
  value: string;
}

export interface AnnotateOptions {
  annotations: Annotation[];
}

export function parseAnnotateArgs(args: Record<string, unknown>): AnnotateOptions {
  const raw = args['annotate'];
  const annotations: Annotation[] = [];

  if (!raw) return { annotations };

  const entries = Array.isArray(raw) ? raw : [raw];
  for (const entry of entries) {
    if (typeof entry !== 'string') continue;
    const idx = entry.indexOf('=');
    if (idx < 1) continue;
    annotations.push({
      key: entry.slice(0, idx).trim(),
      value: entry.slice(idx + 1).trim(),
    });
  }

  return { annotations };
}

export function applyAnnotations(
  endpoints: Endpoint[],
  options: AnnotateOptions
): Endpoint[] {
  if (!options.annotations.length) return endpoints;

  return endpoints.map((ep) => {
    const meta: Record<string, string> = { ...(ep.meta ?? {}) };
    for (const { key, value } of options.annotations) {
      meta[key] = value;
    }
    return { ...ep, meta };
  });
}

export function formatAnnotations(endpoint: Endpoint): string {
  const meta = endpoint.meta ?? {};
  const keys = Object.keys(meta);
  if (!keys.length) return '';
  return keys.map((k) => `${k}=${meta[k]}`).join(', ');
}
