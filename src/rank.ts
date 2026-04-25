import type { Endpoint } from "./snapshot";

export type RankField = "status" | "method" | "path" | "latency" | "score";

export interface RankOptions {
  field: RankField;
  limit: number;
  ascending: boolean;
}

export interface RankedEndpoint {
  rank: number;
  endpoint: Endpoint;
  value: string | number;
}

export function isRankField(value: string): value is RankField {
  return ["status", "method", "path", "latency", "score"].includes(value);
}

export function extractRankValue(endpoint: Endpoint, field: RankField): string | number {
  switch (field) {
    case "status": return endpoint.status ?? 0;
    case "method": return endpoint.method ?? "";
    case "path": return endpoint.path ?? "";
    case "latency": return typeof endpoint.latency === "number" ? endpoint.latency : 0;
    case "score": return typeof endpoint.score === "number" ? endpoint.score : 0;
    default: return 0;
  }
}

export function rankEndpoints(
  endpoints: Endpoint[],
  options: RankOptions
): RankedEndpoint[] {
  const { field, limit, ascending } = options;

  const sorted = [...endpoints].sort((a, b) => {
    const va = extractRankValue(a, field);
    const vb = extractRankValue(b, field);
    if (typeof va === "number" && typeof vb === "number") {
      return ascending ? va - vb : vb - va;
    }
    const sa = String(va);
    const sb = String(vb);
    return ascending ? sa.localeCompare(sb) : sb.localeCompare(sa);
  });

  return sorted.slice(0, limit).map((endpoint, i) => ({
    rank: i + 1,
    endpoint,
    value: extractRankValue(endpoint, field),
  }));
}

export function formatRankSummary(ranked: RankedEndpoint[], field: RankField): string {
  if (ranked.length === 0) return "No endpoints to rank.";
  const lines = ranked.map(
    (r) => `#${r.rank} [${r.endpoint.method ?? "?"}] ${r.endpoint.path ?? ""} — ${field}: ${r.value}`
  );
  return `Ranked by ${field}:\n${lines.join("\n")}`;
}

export function parseRankArgs(args: Record<string, unknown>): RankOptions {
  const field = typeof args.field === "string" && isRankField(args.field) ? args.field : "status";
  const limit = typeof args.limit === "number" ? args.limit : 10;
  const ascending = args.ascending === true;
  return { field, limit, ascending };
}
