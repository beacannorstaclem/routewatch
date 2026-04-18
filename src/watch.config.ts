export interface WatchTarget {
  url: string;
  label?: string;
  interval?: number; // seconds, default 60
}

export interface WatchConfig {
  targets: WatchTarget[];
  defaultInterval: number;
  notifyOnChange: boolean;
}

export const DEFAULT_WATCH_CONFIG: WatchConfig = {
  targets: [],
  defaultInterval: 60,
  notifyOnChange: true,
};

export function parseWatchConfig(raw: unknown): WatchConfig {
  if (typeof raw !== 'object' || raw === null) {
    throw new Error('Invalid watch config: expected an object');
  }

  const obj = raw as Record<string, unknown>;

  if (!Array.isArray(obj.targets)) {
    throw new Error('Invalid watch config: "targets" must be an array');
  }

  const targets: WatchTarget[] = obj.targets.map((t: unknown, i: number) => {
    if (typeof t !== 'object' || t === null || typeof (t as any).url !== 'string') {
      throw new Error(`Invalid watch config: target[${i}] must have a "url" string`);
    }
    const target = t as Record<string, unknown>;
    return {
      url: target.url as string,
      label: typeof target.label === 'string' ? target.label : undefined,
      interval: typeof target.interval === 'number' ? target.interval : undefined,
    };
  });

  return {
    targets,
    defaultInterval: typeof obj.defaultInterval === 'number' ? obj.defaultInterval : DEFAULT_WATCH_CONFIG.defaultInterval,
    notifyOnChange: typeof obj.notifyOnChange === 'boolean' ? obj.notifyOnChange : DEFAULT_WATCH_CONFIG.notifyOnChange,
  };
}
