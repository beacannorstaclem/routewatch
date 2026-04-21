import { readFileSync } from "fs";
import { parseSampleArgs, type SampleOptions } from "./sample";

export interface SampleConfig {
  strategy?: string;
  count?: number;
  nth?: number;
  seed?: number;
}

export function parseSampleConfig(raw: unknown): SampleConfig {
  if (typeof raw !== "object" || raw === null) {
    throw new Error("Sample config must be an object");
  }
  const obj = raw as Record<string, unknown>;
  const config: SampleConfig = {};
  if (obj.strategy !== undefined) {
    if (typeof obj.strategy !== "string") throw new Error("sample.strategy must be a string");
    config.strategy = obj.strategy;
  }
  if (obj.count !== undefined) {
    if (typeof obj.count !== "number") throw new Error("sample.count must be a number");
    config.count = obj.count;
  }
  if (obj.nth !== undefined) {
    if (typeof obj.nth !== "number") throw new Error("sample.nth must be a number");
    config.nth = obj.nth;
  }
  if (obj.seed !== undefined) {
    if (typeof obj.seed !== "number") throw new Error("sample.seed must be a number");
    config.seed = obj.seed;
  }
  return config;
}

export function loadSampleConfig(filePath: string): SampleConfig {
  const raw = JSON.parse(readFileSync(filePath, "utf-8"));
  return parseSampleConfig(raw?.sample ?? raw);
}

export function sampleConfigToOptions(config: SampleConfig): SampleOptions {
  return parseSampleArgs({
    strategy: config.strategy,
    count: config.count !== undefined ? String(config.count) : undefined,
    nth: config.nth !== undefined ? String(config.nth) : undefined,
    seed: config.seed !== undefined ? String(config.seed) : undefined,
  });
}
