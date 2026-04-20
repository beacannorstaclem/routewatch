import { Endpoint } from './snapshot';
import { fetchEndpoint } from './fetch';
import { applyAuth } from './auth';
import { mergeHeaders } from './header';

export interface ReplayOptions {
  delay?: number;
  dryRun?: boolean;
  headers?: Record<string, string>;
  authToken?: string;
}

export interface ReplayResult {
  endpoint: Endpoint;
  status: number;
  ok: boolean;
  durationMs: number;
  skipped: boolean;
}

export async function replayEndpoint(
  endpoint: Endpoint,
  options: ReplayOptions = {}
): Promise<ReplayResult> {
  if (options.dryRun) {
    return { endpoint, status: 0, ok: true, durationMs: 0, skipped: true };
  }

  const headers = mergeHeaders(endpoint.headers ?? {}, options.headers ?? {});
  const authHeaders = options.authToken
    ? applyAuth({ scheme: 'bearer', token: options.authToken }, headers)
    : headers;

  const start = Date.now();
  const result = await fetchEndpoint({ ...endpoint, headers: authHeaders });
  const durationMs = Date.now() - start;

  return {
    endpoint,
    status: result.status,
    ok: result.status >= 200 && result.status < 300,
    durationMs,
    skipped: false,
  };
}

export async function replayAll(
  endpoints: Endpoint[],
  options: ReplayOptions = {}
): Promise<ReplayResult[]> {
  const results: ReplayResult[] = [];
  for (const endpoint of endpoints) {
    const result = await replayEndpoint(endpoint, options);
    results.push(result);
    if (options.delay && options.delay > 0) {
      await new Promise((r) => setTimeout(r, options.delay));
    }
  }
  return results;
}

export function parseReplayArgs(args: Record<string, unknown>): ReplayOptions {
  return {
    delay: typeof args['delay'] === 'number' ? args['delay'] : undefined,
    dryRun: args['dry-run'] === true || args['dryRun'] === true,
    headers:
      typeof args['headers'] === 'object' && args['headers'] !== null
        ? (args['headers'] as Record<string, string>)
        : undefined,
    authToken:
      typeof args['auth-token'] === 'string' ? args['auth-token'] : undefined,
  };
}

export function formatReplaySummary(results: ReplayResult[]): string {
  const total = results.length;
  const ok = results.filter((r) => r.ok && !r.skipped).length;
  const failed = results.filter((r) => !r.ok && !r.skipped).length;
  const skipped = results.filter((r) => r.skipped).length;
  const avgMs =
    results.filter((r) => !r.skipped).length > 0
      ? Math.round(
          results.filter((r) => !r.skipped).reduce((s, r) => s + r.durationMs, 0) /
            results.filter((r) => !r.skipped).length
        )
      : 0;
  return `Replay: ${total} total | ${ok} ok | ${failed} failed | ${skipped} skipped | avg ${avgMs}ms`;
}
