import { describe, it, expect } from "vitest";
import {
  isRollupField,
  isRollupAgg,
  rollupEndpoints,
  formatRollupSummary,
  parseRollupArgs,
} from "./rollup";
import { parseRollupConfig, rollupConfigToOptions, mergeRollupConfigs } from "./rollup.config";
import type { Endpoint } from "./snapshot";

const ep = (method: string, path: string, status: number): Endpoint =>
  ({ method, path, status, headers: {}, body: null } as unknown as Endpoint);

const endpoints: Endpoint[] = [
  ep("GET", "/users", 200),
  ep("GET", "/posts", 200),
  ep("POST", "/users", 201),
  ep("DELETE", "/users/1", 204),
  ep("GET", "/users/1", 404),
];

describe("isRollupField", () => {
  it("accepts valid fields", () => {
    expect(isRollupField("method")).toBe(true);
    expect(isRollupField("status")).toBe(true);
    expect(isRollupField("tag")).toBe(true);
    expect(isRollupField("namespace")).toBe(true);
  });
  it("rejects invalid fields", () => {
    expect(isRollupField("body")).toBe(false);
  });
});

describe("isRollupAgg", () => {
  it("accepts valid aggs", () => {
    expect(isRollupAgg("count")).toBe(true);
    expect(isRollupAgg("avg_status")).toBe(true);
    expect(isRollupAgg("unique_paths")).toBe(true);
  });
  it("rejects invalid aggs", () => {
    expect(isRollupAgg("sum")).toBe(false);
  });
});

describe("rollupEndpoints", () => {
  it("groups by method with count", () => {
    const result = rollupEndpoints(endpoints, { field: "method", agg: "count" });
    expect(result.buckets.find((b) => b.key === "GET")?.count).toBe(3);
    expect(result.buckets.find((b) => b.key === "POST")?.count).toBe(1);
  });

  it("computes avg_status by method", () => {
    const result = rollupEndpoints(endpoints, { field: "method", agg: "avg_status" });
    const get = result.buckets.find((b) => b.key === "GET");
    expect(get?.avg_status).toBeCloseTo((200 + 200 + 404) / 3);
  });

  it("computes unique_paths by status", () => {
    const result = rollupEndpoints(endpoints, { field: "status", agg: "unique_paths" });
    const ok = result.buckets.find((b) => b.key === "200");
    expect(ok?.unique_paths).toBe(2);
  });
});

describe("formatRollupSummary", () => {
  it("includes field and agg in header", () => {
    const result = rollupEndpoints(endpoints, { field: "method", agg: "count" });
    const out = formatRollupSummary(result);
    expect(out).toContain("method");
    expect(out).toContain("count");
    expect(out).toContain("GET");
  });
});

describe("parseRollupArgs", () => {
  it("parses --field and --agg", () => {
    const opts = parseRollupArgs(["--field", "status", "--agg", "avg_status"]);
    expect(opts.field).toBe("status");
    expect(opts.agg).toBe("avg_status");
  });
  it("defaults to method/count", () => {
    const opts = parseRollupArgs([]);
    expect(opts.field).toBe("method");
    expect(opts.agg).toBe("count");
  });
});

describe("parseRollupConfig", () => {
  it("parses valid config object", () => {
    const cfg = parseRollupConfig({ field: "tag", agg: "unique_paths", topN: 5 });
    expect(cfg.field).toBe("tag");
    expect(cfg.topN).toBe(5);
  });
  it("ignores invalid values", () => {
    const cfg = parseRollupConfig({ field: "bad", agg: "bad" });
    expect(cfg.field).toBeUndefined();
  });
});

describe("mergeRollupConfigs", () => {
  it("override wins", () => {
    const merged = mergeRollupConfigs({ field: "method" }, { field: "status" });
    expect(merged.field).toBe("status");
  });
  it("base used when override missing", () => {
    const merged = mergeRollupConfigs({ field: "method", topN: 3 }, {});
    expect(merged.field).toBe("method");
    expect(merged.topN).toBe(3);
  });
});

describe("rollupConfigToOptions", () => {
  it("returns defaults when config is empty", () => {
    const opts = rollupConfigToOptions({});
    expect(opts.field).toBe("method");
    expect(opts.agg).toBe("count");
  });
});
