export interface QuotaOptions {
  maxRequests: number;
  windowMs: number;
  perHost?: boolean;
}

export interface QuotaState {
  count: number;
  windowStart: number;
}

export interface QuotaResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

const quotaStore = new Map<string, QuotaState>();

export function parseQuotaArgs(args: Record<string, unknown>): QuotaOptions {
  return {
    maxRequests: typeof args.quotaMax === 'number' ? args.quotaMax : 100,
    windowMs: typeof args.quotaWindow === 'number' ? args.quotaWindow : 60_000,
    perHost: args.quotaPerHost === true,
  };
}

export function checkQuota(key: string, opts: QuotaOptions): QuotaResult {
  const now = Date.now();
  const state = quotaStore.get(key);

  if (!state || now - state.windowStart >= opts.windowMs) {
    quotaStore.set(key, { count: 1, windowStart: now });
    return { allowed: true, remaining: opts.maxRequests - 1, resetAt: now + opts.windowMs };
  }

  if (state.count >= opts.maxRequests) {
    return { allowed: false, remaining: 0, resetAt: state.windowStart + opts.windowMs };
  }

  state.count += 1;
  return { allowed: true, remaining: opts.maxRequests - state.count, resetAt: state.windowStart + opts.windowMs };
}

export function resetQuota(key: string): void {
  quotaStore.delete(key);
}

export function clearAllQuotas(): void {
  quotaStore.clear();
}

export function formatQuotaSummary(results: Array<{ key: string; result: QuotaResult }>): string {
  const lines = results.map(({ key, result }) => {
    const status = result.allowed ? 'allowed' : 'blocked';
    return `  ${key}: ${status}, remaining=${result.remaining}, resetAt=${new Date(result.resetAt).toISOString()}`;
  });
  return `Quota Summary:\n${lines.join('\n')}`;
}
