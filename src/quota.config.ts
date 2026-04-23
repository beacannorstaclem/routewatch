import { QuotaOptions } from './quota';

export interface QuotaConfig {
  maxRequests?: number;
  windowMs?: number;
  perHost?: boolean;
}

export function parseQuotaConfig(raw: Record<string, unknown>): QuotaConfig {
  const config: QuotaConfig = {};
  if (typeof raw.maxRequests === 'number') config.maxRequests = raw.maxRequests;
  if (typeof raw.windowMs === 'number') config.windowMs = raw.windowMs;
  if (typeof raw.perHost === 'boolean') config.perHost = raw.perHost;
  return config;
}

export function loadQuotaConfig(path: string): QuotaConfig {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const raw = require(path);
    return parseQuotaConfig(typeof raw === 'object' && raw !== null ? raw : {});
  } catch {
    return {};
  }
}

export function mergeQuotaConfigs(base: QuotaConfig, override: QuotaConfig): QuotaConfig {
  return { ...base, ...override };
}

export function quotaConfigToOptions(config: QuotaConfig): QuotaOptions {
  return {
    maxRequests: config.maxRequests ?? 100,
    windowMs: config.windowMs ?? 60_000,
    perHost: config.perHost ?? false,
  };
}
