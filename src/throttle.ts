export interface ThrottleConfig {
  requestsPerSecond: number;
  burstLimit?: number;
}

export const DEFAULT_THROTTLE: ThrottleConfig = {
  requestsPerSecond: 10,
  burstLimit: 20,
};

export function parseThrottleArgs(args: Record<string, unknown>): ThrottleConfig {
  const rps = args['throttle-rps'] ?? args['rps'];
  const burst = args['throttle-burst'] ?? args['burst'];
  return {
    requestsPerSecond: rps !== undefined ? Number(rps) : DEFAULT_THROTTLE.requestsPerSecond,
    burstLimit: burst !== undefined ? Number(burst) : DEFAULT_THROTTLE.burstLimit,
  };
}

export function createThrottle(config: ThrottleConfig): () => Promise<void> {
  const intervalMs = 1000 / config.requestsPerSecond;
  let lastCall = 0;
  let queue = 0;
  const burst = config.burstLimit ?? config.requestsPerSecond;

  return async function throttle(): Promise<void> {
    if (queue >= burst) {
      await new Promise<void>((resolve) => setTimeout(resolve, intervalMs * queue));
    }
    queue++;
    const now = Date.now();
    const wait = Math.max(0, lastCall + intervalMs - now);
    if (wait > 0) {
      await new Promise<void>((resolve) => setTimeout(resolve, wait));
    }
    lastCall = Date.now();
    queue--;
  };
}

export async function throttledMap<T, R>(
  items: T[],
  fn: (item: T) => Promise<R>,
  config: ThrottleConfig
): Promise<R[]> {
  const throttle = createThrottle(config);
  return Promise.all(
    items.map(async (item) => {
      await throttle();
      return fn(item);
    })
  );
}
