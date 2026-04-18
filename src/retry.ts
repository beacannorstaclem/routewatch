export interface RetryOptions {
  maxAttempts: number;
  delayMs: number;
  backoff?: boolean;
}

export const DEFAULT_RETRY_OPTIONS: RetryOptions = {
  maxAttempts: 3,
  delayMs: 500,
  backoff: true,
};

export function parseRetryArgs(args: Record<string, unknown>): RetryOptions {
  const opts: RetryOptions = { ...DEFAULT_RETRY_OPTIONS };
  if (typeof args['retry-attempts'] === 'string') {
    const n = parseInt(args['retry-attempts'], 10);
    if (!isNaN(n) && n >= 1) opts.maxAttempts = n;
  }
  if (typeof args['retry-delay'] === 'string') {
    const d = parseInt(args['retry-delay'], 10);
    if (!isNaN(d) && d >= 0) opts.delayMs = d;
  }
  if (args['retry-backoff'] === false) {
    opts.backoff = false;
  }
  return opts;
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = DEFAULT_RETRY_OPTIONS
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= options.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (attempt < options.maxAttempts) {
        const delay = options.backoff
          ? options.delayMs * Math.pow(2, attempt - 1)
          : options.delayMs;
        await new Promise((res) => setTimeout(res, delay));
      }
    }
  }
  throw lastError;
}
