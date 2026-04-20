import { existsSync, readFileSync } from "fs";
import { resolve } from "path";

export type SnapshotFormat = "json" | "ndjson";

export interface SnapshotConfig {
  format: SnapshotFormat;
  pretty: boolean;
  includeTimestamp: boolean;
  includeMetadata: boolean;
  maxEndpoints?: number;
}

const DEFAULT_SNAPSHOT_CONFIG: SnapshotConfig = {
  format: "json",
  pretty: true,
  includeTimestamp: true,
  includeMetadata: true,
};

export function isSnapshotFormat(value: unknown): value is SnapshotFormat {
  return value === "json" || value === "ndjson";
}

export function parseSnapshotConfig(raw: Record<string, unknown>): SnapshotConfig {
  const format = isSnapshotFormat(raw["format"]) ? raw["format"] : DEFAULT_SNAPSHOT_CONFIG.format;
  const pretty = typeof raw["pretty"] === "boolean" ? raw["pretty"] : DEFAULT_SNAPSHOT_CONFIG.pretty;
  const includeTimestamp =
    typeof raw["includeTimestamp"] === "boolean" ? raw["includeTimestamp"] : DEFAULT_SNAPSHOT_CONFIG.includeTimestamp;
  const includeMetadata =
    typeof raw["includeMetadata"] === "boolean" ? raw["includeMetadata"] : DEFAULT_SNAPSHOT_CONFIG.includeMetadata;
  const maxEndpoints =
    typeof raw["maxEndpoints"] === "number" && raw["maxEndpoints"] > 0 ? raw["maxEndpoints"] : undefined;

  return { format, pretty, includeTimestamp, includeMetadata, maxEndpoints };
}

export function loadSnapshotConfig(configPath?: string): SnapshotConfig {
  const candidates = [configPath, ".routewatch.snapshot.json", ".routewatch.json"].filter(Boolean) as string[];

  for (const candidate of candidates) {
    const abs = resolve(process.cwd(), candidate);
    if (existsSync(abs)) {
      try {
        const raw = JSON.parse(readFileSync(abs, "utf-8"));
        const section = typeof raw["snapshot"] === "object" && raw["snapshot"] ? raw["snapshot"] : raw;
        return parseSnapshotConfig(section as Record<string, unknown>);
      } catch {
        // ignore malformed config
      }
    }
  }

  return { ...DEFAULT_SNAPSHOT_CONFIG };
}

export function mergeSnapshotConfigs(base: SnapshotConfig, override: Partial<SnapshotConfig>): SnapshotConfig {
  return { ...base, ...override };
}
