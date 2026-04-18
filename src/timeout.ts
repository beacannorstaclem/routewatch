export interface TimeoutConfig {
  requestTimeout: number; // ms
  connectTimeout: number; // ms
}

export const DEFAULT_TIMEOUT: TimeoutConfig = {
  requestTimeout: 10000,
  connectTimeout: 5000,
};

export function parseTimeoutArgs(args: Record<string, unknown>): Partial<TimeoutConfig> {
  const config: Partial<TimeoutConfig> = {};

  if (args['timeout'] !== undefined) {
    const val = Number(args['timeout']);
    if (!isFinite(val) || val <= 0) throw new Error(`Invalid timeout: ${args['timeout']}`);
    config.requestTimeout = val;
  }

  if (args['connect-timeout'] !== undefined) {
    const val = Number(args['connect-timeout']);
    if (!isFinite(val) || val <= 0) throw new Error(`Invalid connect-timeout: ${args['connect-timeout']}`);
    config.connectTimeout = val;
  }

  return config;
}

export function mergeTimeoutConfig(
  base: TimeoutConfig,
  override: Partial<TimeoutConfig>
): TimeoutConfig {
  return { ...base, ...override };
}

export function applyTimeout<T>(promise: Promise<T>, ms: number, label = 'Request'): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);
    promise.then(
      (val) => { clearTimeout(timer); resolve(val); },
      (err) => { clearTimeout(timer); reject(err); }
    );
  });
}
