/**
 * slice.config.ts — load and merge slice configuration
 */

import { SliceOptions } from "./slice";

export interface SliceConfig {
  start?: number;
  end?: number;
  count?: number;
}

export function parseSliceConfig(raw: Record<string, unknown>): SliceConfig {
  const cfg: SliceConfig = {};
  if (raw.start !== undefined) cfg.start = Number(raw.start);
  if (raw.end !== undefined) cfg.end = Number(raw.end);
  if (raw.count !== undefined) cfg.count = Number(raw.count);
  return cfg;
}

export function loadSliceConfig(path: string): SliceConfig {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const raw = require(path) as Record<string, unknown>;
    return parseSliceConfig(raw.slice ? (raw.slice as Record<string, unknown>) : raw);
  } catch {
    return {};
  }
}

export function sliceConfigToOptions(cfg: SliceConfig): SliceOptions {
  return {
    start: cfg.start ?? 0,
    end: cfg.end,
    count: cfg.count,
  };
}

export function mergeSliceConfigs(base: SliceConfig, override: SliceConfig): SliceConfig {
  return {
    start: override.start ?? base.start,
    end: override.end ?? base.end,
    count: override.count ?? base.count,
  };
}
