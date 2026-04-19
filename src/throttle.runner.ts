import { ThrottleConfig, throttledMap } from './throttle';
import { loadThrottleConfig, parseThrottleConfig } from './throttle.config';
import { fetchEndpoint } from './fetch';
import { EndpointResult } from './probe';

export interface ThrottleRunnerOptions {
  urls: string[];
  throttleConfig?: Partial<ThrottleConfig>;
  configPath?: string;
  headers?: Record<string, string>;
}

export async function runThrottledFetch(
  options: ThrottleRunnerOptions
): Promise<EndpointResult[]> {
  const base = loadThrottleConfig(options.configPath);
  const config: ThrottleConfig = options.throttleConfig
    ? parseThrottleConfig({ ...base, ...options.throttleConfig })
    : base;

  const results = await throttledMap(
    options.urls,
    async (url) => {
      try {
        return await fetchEndpoint(url, { headers: options.headers ?? {} });
      } catch (err) {
        return {
          url,
          status: 0,
          headers: {},
          body: null,
          error: err instanceof Error ? err.message : String(err),
          durationMs: 0,
        } as EndpointResult;
      }
    },
    config
  );

  return results;
}
