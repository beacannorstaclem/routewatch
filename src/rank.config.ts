import { isRankField, type RankField } from "./rank";

export interface RankConfig {
  field?: RankField;
  limit?: number;
  ascending?: boolean;
}

export function parseRankConfig(raw: unknown): RankConfig {
  if (!raw || typeof raw !== "object") return {};
  const obj = raw as Record<string, unknown>;
  const config: RankConfig = {};

  if (typeof obj.field === "string" && isRankField(obj.field)) {
    config.field = obj.field;
  }
  if (typeof obj.limit === "number" && obj.limit > 0) {
    config.limit = obj.limit;
  }
  if (typeof obj.ascending === "boolean") {
    config.ascending = obj.ascending;
  }
  return config;
}

export function loadRankConfig(configPath?: string): RankConfig {
  if (!configPath) return {};
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const raw = require(configPath);
    return parseRankConfig(raw?.rank ?? raw);
  } catch {
    return {};
  }
}

export function mergeRankConfigs(base: RankConfig, override: RankConfig): RankConfig {
  return {
    field: override.field ?? base.field,
    limit: override.limit ?? base.limit,
    ascending: override.ascending ?? base.ascending,
  };
}

export function rankConfigToOptions(
  config: RankConfig
): { field: import("./rank").RankField; limit: number; ascending: boolean } {
  return {
    field: config.field ?? "status",
    limit: config.limit ?? 10,
    ascending: config.ascending ?? false,
  };
}
