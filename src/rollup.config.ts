import { readFileSync } from "fs";
import { isRollupField, isRollupAgg, type RollupOptions, type RollupAgg, type RollupField } from "./rollup";

export interface RollupConfig {
  field?: RollupField;
  agg?: RollupAgg;
  topN?: number;
}

export function parseRollupConfig(raw: unknown): RollupConfig {
  if (!raw || typeof raw !== "object") return {};
  const obj = raw as Record<string, unknown>;
  const config: RollupConfig = {};
  if (typeof obj["field"] === "string" && isRollupField(obj["field"])) {
    config.field = obj["field"];
  }
  if (typeof obj["agg"] === "string" && isRollupAgg(obj["agg"])) {
    config.agg = obj["agg"];
  }
  if (typeof obj["topN"] === "number" && obj["topN"] > 0) {
    config.topN = obj["topN"];
  }
  return config;
}

export function loadRollupConfig(configPath: string): RollupConfig {
  try {
    const raw = JSON.parse(readFileSync(configPath, "utf-8"));
    return parseRollupConfig(
      typeof raw["rollup"] !== "undefined" ? raw["rollup"] : raw
    );
  } catch {
    return {};
  }
}

export function rollupConfigToOptions(config: RollupConfig): RollupOptions {
  return {
    field: config.field ?? "method",
    agg: config.agg ?? "count",
  };
}

export function mergeRollupConfigs(
  base: RollupConfig,
  override: RollupConfig
): RollupConfig {
  return {
    field: override.field ?? base.field,
    agg: override.agg ?? base.agg,
    topN: override.topN ?? base.topN,
  };
}
