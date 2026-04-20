/**
 * Central configuration aggregator for routewatch.
 * Merges all sub-configs into a single resolved RunConfig.
 */

import { parseWatchConfig, WatchConfig } from './watch.config';
import { parseAlertConfig, AlertConfig } from './alert.config';
import { parseRetryConfig, RetryConfig } from './retry.config';
import { parseCacheConfig, CacheConfig } from './cache.config';
import { parseTimeoutConfig, TimeoutConfig } from './timeout.config';
import { parseThrottleConfig, ThrottleConfig } from './throttle.config';
import { parseOutputArgs, OutputFormat } from './output';
import { parseProxyArgs, ProxyConfig } from './proxy';
import { parseHeaderConfig, HeaderConfig } from './header.config';
import { parseAuthConfig, AuthConfig } from './auth.config';

export interface RunConfig {
  watch: WatchConfig;
  alert: AlertConfig;
  retry: RetryConfig;
  cache: CacheConfig;
  timeout: TimeoutConfig;
  throttle: ThrottleConfig;
  output: { format: OutputFormat; path?: string };
  proxy: ProxyConfig;
  headers: HeaderConfig;
  auth: AuthConfig;
}

export function buildRunConfig(raw: Record<string, unknown>): RunConfig {
  return {
    watch: parseWatchConfig(raw),
    alert: parseAlertConfig(raw),
    retry: parseRetryConfig(raw),
    cache: parseCacheConfig(raw),
    timeout: parseTimeoutConfig(raw),
    throttle: parseThrottleConfig(raw),
    output: parseOutputArgs(raw as Record<string, string>),
    proxy: parseProxyArgs(raw as Record<string, string>),
    headers: parseHeaderConfig(raw),
    auth: parseAuthConfig(raw),
  };
}

export function mergeRunConfigs(
  base: Partial<RunConfig>,
  overrides: Partial<RunConfig>
): Partial<RunConfig> {
  return {
    ...base,
    ...overrides,
    watch: { ...(base.watch ?? {}), ...(overrides.watch ?? {}) } as WatchConfig,
    alert: { ...(base.alert ?? {}), ...(overrides.alert ?? {}) } as AlertConfig,
    retry: { ...(base.retry ?? {}), ...(overrides.retry ?? {}) } as RetryConfig,
    cache: { ...(base.cache ?? {}), ...(overrides.cache ?? {}) } as CacheConfig,
    timeout: { ...(base.timeout ?? {}), ...(overrides.timeout ?? {}) } as TimeoutConfig,
    throttle: { ...(base.throttle ?? {}), ...(overrides.throttle ?? {}) } as ThrottleConfig,
    headers: { ...(base.headers ?? {}), ...(overrides.headers ?? {}) } as HeaderConfig,
  };
}
