/**
 * enrich.config.ts
 * Configuration parsing and loading for endpoint enrichment options.
 */

import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

/** Fields that can be added during enrichment */
export type EnrichField = "latency" | "size" | "hash" | "timestamp" | "tags";

const ENRICH_FIELDS: EnrichField[] = ["latency", "size", "hash", "timestamp", "tags"];

export function isEnrichField(value: unknown): value is EnrichField {
  return typeof value === "string" && ENRICH_FIELDS.includes(value as EnrichField);
}

export interface EnrichConfig {
  /** Fields to add during enrichment */
  fields: EnrichField[];
  /** Whether to overwrite existing field values */
  overwrite: boolean;
  /** Static tags to apply to all endpoints */
  tags?: Record<string, string>;
}

export const defaultEnrichConfig: EnrichConfig = {
  fields: ["timestamp", "hash"],
  overwrite: false,
};

/**
 * Parse an EnrichConfig from a plain object (e.g. loaded from JSON/YAML).
 */
export function parseEnrichConfig(raw: unknown): EnrichConfig {
  if (!raw || typeof raw !== "object") {
    return { ...defaultEnrichConfig };
  }

  const obj = raw as Record<string, unknown>;

  const fields: EnrichField[] = Array.isArray(obj["fields"])
    ? (obj["fields"] as unknown[]).filter(isEnrichField)
    : defaultEnrichConfig.fields;

  const overwrite =
    typeof obj["overwrite"] === "boolean"
      ? obj["overwrite"]
      : defaultEnrichConfig.overwrite;

  const tags =
    obj["tags"] && typeof obj["tags"] === "object" && !Array.isArray(obj["tags"])
      ? (obj["tags"] as Record<string, string>)
      : undefined;

  return { fields, overwrite, tags };
}

/**
 * Load an EnrichConfig from a JSON file path.
 * Returns the default config if the file does not exist.
 */
export function loadEnrichConfig(configPath?: string): EnrichConfig {
  const candidates = configPath
    ? [configPath]
    : ["enrich.config.json", ".routewatch/enrich.json"];

  for (const candidate of candidates) {
    const fullPath = resolve(process.cwd(), candidate);
    if (existsSync(fullPath)) {
      try {
        const raw = JSON.parse(readFileSync(fullPath, "utf-8"));
        return parseEnrichConfig(raw);
      } catch {
        // fall through to default
      }
    }
  }

  return { ...defaultEnrichConfig };
}

/**
 * Merge two EnrichConfigs, with the override taking precedence.
 */
export function mergeEnrichConfigs(
  base: EnrichConfig,
  override: Partial<EnrichConfig>
): EnrichConfig {
  return {
    fields:
      override.fields && override.fields.length > 0
        ? override.fields
        : base.fields,
    overwrite:
      override.overwrite !== undefined ? override.overwrite : base.overwrite,
    tags: { ...(base.tags ?? {}), ...(override.tags ?? {}) },
  };
}
