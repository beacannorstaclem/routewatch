import { BatchOptions } from './batch';

export interface BatchConfig {
  size?: number;
  concurrency?: number;
}

export function parseBatchConfig(raw: unknown): BatchConfig {
  if (!raw || typeof raw !== 'object') return {};
  const obj = raw as Record<string, unknown>;
  const config: BatchConfig = {};
  if (typeof obj.size === 'number' && obj.size > 0) config.size = obj.size;
  if (typeof obj.concurrency === 'number' && obj.concurrency > 0) config.concurrency = obj.concurrency;
  return config;
}

export function loadBatchConfig(configPath?: string): BatchConfig {
  if (!configPath) return {};
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const raw = require(configPath);
    return parseBatchConfig(raw.batch ?? raw);
  } catch {
    return {};
  }
}

export function batchConfigToOptions(config: BatchConfig): BatchOptions {
  return {
    size: config.size ?? 10,
    concurrency: config.concurrency ?? 3,
  };
}
