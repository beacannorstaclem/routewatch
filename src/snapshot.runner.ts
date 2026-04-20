import { loadSnapshotConfig, mergeSnapshotConfigs, parseSnapshotConfig, type SnapshotConfig } from "./snapshot.config";
import { createSnapshotFile } from "./snapshot";
import { saveSnapshot } from "./storage";
import type { Endpoint } from "./probe";

export interface SnapshotRunOptions {
  endpoints: Endpoint[];
  label?: string;
  configPath?: string;
  configOverrides?: Partial<SnapshotConfig>;
}

export interface SnapshotRunResult {
  snapshotId: string;
  endpointCount: number;
  format: string;
  timestamp: string;
}

export function resolveSnapshotConfig(
  configPath?: string,
  overrides?: Partial<SnapshotConfig>
): SnapshotConfig {
  const base = loadSnapshotConfig(configPath);
  return overrides ? mergeSnapshotConfigs(base, overrides) : base;
}

export async function runSnapshot(options: SnapshotRunOptions): Promise<SnapshotRunResult> {
  const { endpoints, label, configPath, configOverrides } = options;
  const config = resolveSnapshotConfig(configPath, configOverrides);

  let finalEndpoints = endpoints;
  if (config.maxEndpoints !== undefined) {
    finalEndpoints = endpoints.slice(0, config.maxEndpoints);
  }

  const snapshot = createSnapshotFile(finalEndpoints, label);

  if (!config.includeTimestamp) {
    (snapshot as Record<string, unknown>)["timestamp"] = undefined;
  }

  if (!config.includeMetadata) {
    (snapshot as Record<string, unknown>)["meta"] = undefined;
  }

  await saveSnapshot(snapshot);

  return {
    snapshotId: snapshot.id,
    endpointCount: finalEndpoints.length,
    format: config.format,
    timestamp: snapshot.timestamp,
  };
}

export function parseSnapshotRunArgs(args: Record<string, unknown>): Partial<SnapshotConfig> {
  const overrides: Partial<SnapshotConfig> = {};

  if (typeof args["snapshotFormat"] === "string") {
    const raw = { format: args["snapshotFormat"] };
    const parsed = parseSnapshotConfig(raw);
    overrides.format = parsed.format;
  }

  if (typeof args["snapshotPretty"] === "boolean") {
    overrides.pretty = args["snapshotPretty"];
  }

  if (typeof args["maxEndpoints"] === "number") {
    overrides.maxEndpoints = args["maxEndpoints"];
  }

  if (args["noTimestamp"] === true) {
    overrides.includeTimestamp = false;
  }

  if (args["noMetadata"] === true) {
    overrides.includeMetadata = false;
  }

  return overrides;
}
