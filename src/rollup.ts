import type { Endpoint } from "./snapshot";

export type RollupField = "method" | "status" | "tag" | "namespace";
export type RollupAgg = "count" | "avg_status" | "unique_paths";

export interface RollupOptions {
  field: RollupField;
  agg: RollupAgg;
}

export interface RollupBucket {
  key: string;
  count: number;
  avg_status?: number;
  unique_paths?: number;
}

export interface RollupResult {
  field: RollupField;
  agg: RollupAgg;
  buckets: RollupBucket[];
}

export function isRollupField(value: string): value is RollupField {
  return ["method", "status", "tag", "namespace"].includes(value);
}

export function isRollupAgg(value: string): value is RollupAgg {
  return ["count", "avg_status", "unique_paths"].includes(value);
}

export function rollupEndpoints(
  endpoints: Endpoint[],
  options: RollupOptions
): RollupResult {
  const { field, agg } = options;
  const groups = new Map<string, Endpoint[]>();

  for (const ep of endpoints) {
    const key =
      field === "status"
        ? String(ep.status)
        : field === "method"
        ? ep.method
        : field === "namespace"
        ? (ep as Record<string, unknown>)["namespace"] as string ?? "(none)"
        : (ep as Record<string, unknown>)["tag"] as string ?? "(none)";
    const bucket = groups.get(key) ?? [];
    bucket.push(ep);
    groups.set(key, bucket);
  }

  const buckets: RollupBucket[] = [];
  for (const [key, eps] of groups) {
    const bucket: RollupBucket = { key, count: eps.length };
    if (agg === "avg_status") {
      bucket.avg_status =
        eps.reduce((sum, e) => sum + e.status, 0) / eps.length;
    } else if (agg === "unique_paths") {
      bucket.unique_paths = new Set(eps.map((e) => e.path)).size;
    }
    buckets.push(bucket);
  }

  buckets.sort((a, b) => b.count - a.count);
  return { field, agg, buckets };
}

export function formatRollupSummary(result: RollupResult): string {
  const lines: string[] = [
    `Rollup by ${result.field} (${result.agg}):`,
  ];
  for (const b of result.buckets) {
    const extra =
      result.agg === "avg_status"
        ? ` avg_status=${b.avg_status?.toFixed(1)}`
        : result.agg === "unique_paths"
        ? ` unique_paths=${b.unique_paths}`
        : "";
    lines.push(`  ${b.key}: count=${b.count}${extra}`);
  }
  return lines.join("\n");
}

export function parseRollupArgs(args: string[]): RollupOptions {
  let field: RollupField = "method";
  let agg: RollupAgg = "count";
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--field" && args[i + 1]) {
      const v = args[++i];
      if (isRollupField(v)) field = v;
    } else if (args[i] === "--agg" && args[i + 1]) {
      const v = args[++i];
      if (isRollupAgg(v)) agg = v;
    }
  }
  return { field, agg };
}
