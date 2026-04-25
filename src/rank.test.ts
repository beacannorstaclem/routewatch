import { describe, it, expect } from "vitest";
import {
  isRankField,
  extractRankValue,
  rankEndpoints,
  formatRankSummary,
  parseRankArgs,
  type RankOptions,
} from "./rank";
import { parseRankConfig, mergeRankConfigs, rankConfigToOptions } from "./rank.config";
import type { Endpoint } from "./snapshot";

const ep = (method: string, path: string, status: number, latency?: number): Endpoint =>
  ({ method, path, status, latency } as Endpoint);

const endpoints: Endpoint[] = [
  ep("GET", "/users", 200, 120),
  ep("POST", "/users", 201, 80),
  ep("DELETE", "/users/1", 204, 45),
  ep("GET", "/items", 500, 300),
];

describe("isRankField", () => {
  it("accepts valid fields", () => {
    expect(isRankField("status")).toBe(true);
    expect(isRankField("latency")).toBe(true);
  });
  it("rejects invalid fields", () => {
    expect(isRankField("unknown")).toBe(false);
  });
});

describe("extractRankValue", () => {
  it("extracts status", () => {
    expect(extractRankValue(endpoints[0], "status")).toBe(200);
  });
  it("extracts latency", () => {
    expect(extractRankValue(endpoints[2], "latency")).toBe(45);
  });
  it("returns 0 for missing latency", () => {
    expect(extractRankValue(ep("GET", "/x", 200), "latency")).toBe(0);
  });
});

describe("rankEndpoints", () => {
  it("ranks by latency descending", () => {
    const opts: RankOptions = { field: "latency", limit: 3, ascending: false };
    const result = rankEndpoints(endpoints, opts);
    expect(result[0].value).toBe(300);
    expect(result.length).toBe(3);
  });

  it("ranks by latency ascending", () => {
    const opts: RankOptions = { field: "latency", limit: 2, ascending: true };
    const result = rankEndpoints(endpoints, opts);
    expect(result[0].value).toBe(45);
  });

  it("assigns sequential rank numbers", () => {
    const opts: RankOptions = { field: "status", limit: 4, ascending: false };
    const result = rankEndpoints(endpoints, opts);
    expect(result.map((r) => r.rank)).toEqual([1, 2, 3, 4]);
  });
});

describe("formatRankSummary", () => {
  it("returns message for empty list", () => {
    expect(formatRankSummary([], "latency")).toBe("No endpoints to rank.");
  });
  it("includes rank and field label", () => {
    const opts: RankOptions = { field: "latency", limit: 1, ascending: false };
    const ranked = rankEndpoints(endpoints, opts);
    const out = formatRankSummary(ranked, "latency");
    expect(out).toContain("#1");
    expect(out).toContain("latency");
  });
});

describe("parseRankArgs", () => {
  it("uses defaults for empty args", () => {
    expect(parseRankArgs({})).toEqual({ field: "status", limit: 10, ascending: false });
  });
  it("parses valid args", () => {
    expect(parseRankArgs({ field: "path", limit: 5, ascending: true })).toEqual({
      field: "path",
      limit: 5,
      ascending: true,
    });
  });
});

describe("parseRankConfig", () => {
  it("returns empty config for invalid input", () => {
    expect(parseRankConfig(null)).toEqual({});
  });
  it("parses valid config", () => {
    expect(parseRankConfig({ field: "method", limit: 3 })).toEqual({ field: "method", limit: 3 });
  });
});

describe("mergeRankConfigs", () => {
  it("overrides base with override values", () => {
    const merged = mergeRankConfigs({ field: "status", limit: 5 }, { limit: 20 });
    expect(merged.field).toBe("status");
    expect(merged.limit).toBe(20);
  });
});

describe("rankConfigToOptions", () => {
  it("fills defaults", () => {
    expect(rankConfigToOptions({})).toEqual({ field: "status", limit: 10, ascending: false });
  });
});
