import { existsSync, readFileSync } from "fs";
import type { DigestOptions } from "./digest";

export interface DigestConfig {
  algorithm?: "md5" | "sha1" | "sha256";
  fields?: string[];
}

export function parseDigestConfig(raw: unknown): DigestConfig {
  if (!raw || typeof raw !== "object") return {};
  const obj = raw as Record<string, unknown>;
  const config: DigestConfig = {};
  if (
    typeof obj["algorithm"] === "string" &&
    ["md5", "sha1", "sha256"].includes(obj["algorithm"])
  ) {
    config.algorithm = obj["algorithm"] as DigestConfig["algorithm"];
  }
  if (Array.isArray(obj["fields"])) {
    config.fields = obj["fields"].filter((f) => typeof f === "string");
  }
  return config;
}

export function loadDigestConfig(configPath?: string): DigestConfig {
  const candidates = configPath
    ? [configPath]
    : ["routewatch.digest.json", "routewatch.json"];
  for (const p of candidates) {
    if (existsSync(p)) {
      try {
        const raw = JSON.parse(readFileSync(p, "utf8"));
        const section = raw["digest"] ?? raw;
        return parseDigestConfig(section);
      } catch {
        return {};
      }
    }
  }
  return {};
}

export function digestConfigToOptions(config: DigestConfig): DigestOptions {
  const opts: DigestOptions = {};
  if (config.algorithm) opts.algorithm = config.algorithm;
  if (config.fields)
    opts.fields = config.fields as DigestOptions["fields"];
  return opts;
}
