import { Endpoint } from './snapshot';

export interface DedupeOptions {
  by?: 'url' | 'method+url' | 'key';
}

export function dedupeEndpoints(
  endpoints: Endpoint[],
  options: DedupeOptions = {}
): Endpoint[] {
  const { by = 'method+url' } = options;

  const seen = new Set<string>();
  const result: Endpoint[] = [];

  for (const ep of endpoints) {
    const key =
      by === 'url'
        ? ep.url
        : by === 'key'
        ? `${ep.method}:${ep.url}:${ep.statusCode}`
        : `${ep.method}:${ep.url}`;

    if (!seen.has(key)) {
      seen.add(key);
      result.push(ep);
    }
  }

  return result;
}

export function parseDedupeArgs(args: Record<string, unknown>): DedupeOptions {
  const by = args['dedupe-by'];
  if (by === 'url' || by === 'method+url' || by === 'key') {
    return { by };
  }
  return {};
}
