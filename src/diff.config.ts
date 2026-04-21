import { existsSync, readFileSync } from "fs";
import { resolve } from "path";

export type DiffMode = "strict" | "loose" | "keys-only";

export interface DiffConfig {
  mode: DiffMode;
  ignoreFields: string[];
  ignoreStatus: boolean;
  ignoreHeaders: boolean;
  minChanges: number;
}

export const defaultDiffConfig: DiffConfig = {
  mode: "strict",
  ignoreFields: [],
  ignoreStatus: false,
  ignoreHeaders: false,
  minChanges: 0,
};

export function isDiffMode(value: unknown): value is DiffMode {
  return value === "strict" || value === "loose" || value === "keys-only";
}

export function parseDiffConfig(raw: Record<string, unknown>): DiffConfig {
  const mode = isDiffMode(raw.mode) ? raw.mode : defaultDiffConfig.mode;
  const ignoreFields = Array.isArray(raw.ignoreFields)
    ? (raw.ignoreFields as string[])
    : defaultDiffConfig.ignoreFields;
  const ignoreStatus =
    typeof raw.ignoreStatus === "boolean"
      ? raw.ignoreStatus
      : defaultDiffConfig.ignoreStatus;
  const ignoreHeaders =
    typeof raw.ignoreHeaders === "boolean"
      ? raw.ignoreHeaders
      : defaultDiffConfig.ignoreHeaders;
  const minChanges =
    typeof raw.minChanges === "number"
      ? raw.minChanges
      : defaultDiffConfig.minChanges;
  return { mode, ignoreFields, ignoreStatus, ignoreHeaders, minChanges };
}

export function loadDiffConfig(configPath?: string): DiffConfig {
  const candidates = [
    configPath,
    "routewatch.diff.json",
    ".routewatch/diff.json",
  ].filter(Boolean) as string[];

  for (const candidate of candidates) {
    const fullPath = resolve(process.cwd(), candidate);
    if (existsSync(fullPath)) {
      try {
        const raw = JSON.parse(readFileSync(fullPath, "utf-8"));
        return parseDiffConfig(raw);
      } catch {
        // ignore parse errors
      }
    }
  }
  return { ...defaultDiffConfig };
}

export function mergeDiffConfigs(
  base: DiffConfig,
  override: Partial<DiffConfig>
): DiffConfig {
  return {
    ...base,
    ...override,
    ignoreFields: [
      ...base.ignoreFields,
      ...(override.ignoreFields ?? []),
    ],
  };
}
