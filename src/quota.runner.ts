import { parseQuotaArgs, checkQuota, formatQuotaSummary, QuotaOptions } from './quota';
import { loadQuotaConfig, mergeQuotaConfigs, quotaConfigToOptions } from './quota.config';

export function resolveQuotaOptions(
  args: Record<string, unknown>,
  configPath?: string
): QuotaOptions {
  const fileConfig = configPath ? loadQuotaConfig(configPath) : {};
  const argConfig = parseQuotaArgs(args);
  const merged = mergeQuotaConfigs(fileConfig, {
    maxRequests: argConfig.maxRequests,
    windowMs: argConfig.windowMs,
    perHost: argConfig.perHost,
  });
  return quotaConfigToOptions(merged);
}

export function runQuotaCheck(
  keys: string[],
  opts: QuotaOptions
): void {
  const results = keys.map((key) => ({ key, result: checkQuota(key, opts) }));
  const blocked = results.filter((r) => !r.result.allowed);
  if (blocked.length > 0) {
    console.warn(formatQuotaSummary(results));
    const blockedKeys = blocked.map((r) => r.key).join(', ');
    throw new Error(`Quota exceeded for: ${blockedKeys}`);
  }
}
