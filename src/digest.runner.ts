import { digestSnapshot, parseDigestArgs } from "./digest";
import { loadDigestConfig, digestConfigToOptions } from "./digest.config";
import type { Endpoint } from "./index";

export interface DigestRunResult {
  entries: Array<{ key: string; hash: string; algorithm: string }>;
  total: number;
}

export function runDigest(
  endpoints: Endpoint[],
  argv: string[] = []
): DigestRunResult {
  const fileConfig = loadDigestConfig();
  const fileOptions = digestConfigToOptions(fileConfig);
  const argOptions = parseDigestArgs(argv);
  const merged = { ...fileOptions, ...argOptions };

  const map = digestSnapshot(endpoints, merged);
  const entries = Array.from(map.values());

  return { entries, total: entries.length };
}

export function formatDigestOutput(result: DigestRunResult): string {
  const lines: string[] = [`Digest summary (${result.total} endpoints):`];
  for (const entry of result.entries) {
    lines.push(`  ${entry.key}  [${entry.algorithm}] ${entry.hash}`);
  }
  return lines.join("\n");
}
