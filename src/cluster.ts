import type { Endpoint } from "./index";

export type ClusterField = "method" | "status" | "host" | "prefix";

export interface ClusterOptions {
  field: ClusterField;
  minSize?: number;
}

export interface ClusterGroup {
  key: string;
  endpoints: Endpoint[];
  count: number;
}

export function isClusterField(value: string): value is ClusterField {
  return ["method", "status", "host", "prefix"].includes(value);
}

function extractClusterKey(endpoint: Endpoint, field: ClusterField): string {
  switch (field) {
    case "method":
      return endpoint.method.toUpperCase();
    case "status":
      return String(endpoint.status ?? "unknown");
    case "host": {
      try {
        return new URL(endpoint.url).hostname;
      } catch {
        return "unknown";
      }
    }
    case "prefix": {
      try {
        const parts = new URL(endpoint.url).pathname.split("/").filter(Boolean);
        return parts.length > 0 ? `/${parts[0]}` : "/";
      } catch {
        return "/";
      }
    }
  }
}

export function clusterEndpoints(
  endpoints: Endpoint[],
  options: ClusterOptions
): ClusterGroup[] {
  const map = new Map<string, Endpoint[]>();

  for (const ep of endpoints) {
    const key = extractClusterKey(ep, options.field);
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(ep);
  }

  const groups: ClusterGroup[] = [];
  for (const [key, eps] of map.entries()) {
    if (options.minSize !== undefined && eps.length < options.minSize) continue;
    groups.push({ key, endpoints: eps, count: eps.length });
  }

  return groups.sort((a, b) => b.count - a.count);
}

export function formatClusterSummary(groups: ClusterGroup[]): string {
  if (groups.length === 0) return "No clusters found.";
  const lines = groups.map(
    (g) => `  ${g.key.padEnd(30)} ${g.count} endpoint${g.count !== 1 ? "s" : ""}`
  );
  return `Clusters (${groups.length}):\n${lines.join("\n")}`;
}

export function parseClusterArgs(args: Record<string, unknown>): ClusterOptions {
  const field = typeof args.field === "string" && isClusterField(args.field)
    ? args.field
    : "method";
  const minSize = typeof args.minSize === "number" ? args.minSize : undefined;
  return { field, minSize };
}
