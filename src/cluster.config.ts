import { existsSync, readFileSync } from "fs";
import type { ClusterField, ClusterOptions } from "./cluster";
import { isClusterField } from "./cluster";

export interface ClusterConfig {
  field?: ClusterField;
  minSize?: number;
}

export function parseClusterConfig(raw: unknown): ClusterConfig {
  if (!raw || typeof raw !== "object") return {};
  const obj = raw as Record<string, unknown>;
  const config: ClusterConfig = {};

  if (typeof obj.field === "string" && isClusterField(obj.field)) {
    config.field = obj.field;
  }
  if (typeof obj.minSize === "number" && obj.minSize >= 1) {
    config.minSize = obj.minSize;
  }

  return config;
}

export function loadClusterConfig(configPath?: string): ClusterConfig {
  const candidates = configPath
    ? [configPath]
    : ["routewatch.cluster.json", ".routewatch/cluster.json"];

  for (const p of candidates) {
    if (existsSync(p)) {
      try {
        const raw = JSON.parse(readFileSync(p, "utf8"));
        return parseClusterConfig(raw);
      } catch {
        // ignore parse errors
      }
    }
  }
  return {};
}

export function clusterConfigToOptions(config: ClusterConfig): Partial<ClusterOptions> {
  const opts: Partial<ClusterOptions> = {};
  if (config.field !== undefined) opts.field = config.field;
  if (config.minSize !== undefined) opts.minSize = config.minSize;
  return opts;
}
