import { fetchEndpoint, FetchOptions, FetchResult } from "./fetch";
import { Endpoint } from "./snapshot";

export interface ProbeResult {
  endpoint: Endpoint;
  result: FetchResult | null;
  error: string | null;
  durationMs: number;
}

export async function probeEndpoint(
  endpoint: Endpoint,
  options: FetchOptions = {}
): Promise<ProbeResult> {
  const start = Date.now();
  try {
    const result = await fetchEndpoint(endpoint.url, options);
    return { endpoint, result, error: null, durationMs: Date.now() - start };
  } catch (err) {
    return {
      endpoint,
      result: null,
      error: err instanceof Error ? err.message : String(err),
      durationMs: Date.now() - start,
    };
  }
}

export async function probeAll(
  endpoints: Endpoint[],
  options: FetchOptions = {}
): Promise<ProbeResult[]> {
  return Promise.all(endpoints.map((ep) => probeEndpoint(ep, options)));
}

export function probeResultToEndpoint(probe: ProbeResult): Endpoint {
  const { endpoint, result } = probe;
  return {
    ...endpoint,
    status: result?.status ?? 0,
    responseHeaders: result?.headers ?? {},
    error: probe.error ?? undefined,
  };
}
