import { describe, it, expect } from "vitest";
import {
  parseSampleArgs,
  sampleEndpoints,
  formatSampleSummary,
  type SampleOptions,
} from "./sample";
import { parseSampleConfig, sampleConfigToOptions } from "./sample.config";
import type { Endpoint } from "./index";

const makeEndpoints = (n: number): Endpoint[] =>
  Array.from({ length: n }, (_, i) => ({
    method: "GET",
    path: `/api/resource/${i}`,
    status: 200,
    headers: {},
  }));

describe("parseSampleArgs", () => {
  it("defaults to random strategy with count 10", () => {
    const opts = parseSampleArgs({});
    expect(opts.strategy).toBe("random");
    expect(opts.count).toBe(10);
  });

  it("parses first strategy", () => {
    const opts = parseSampleArgs({ strategy: "first", count: "5" });
    expect(opts.strategy).toBe("first");
    expect(opts.count).toBe(5);
  });

  it("throws on invalid strategy", () => {
    expect(() => parseSampleArgs({ strategy: "bogus" })).toThrow();
  });

  it("throws on nth strategy without nth value", () => {
    expect(() => parseSampleArgs({ strategy: "nth" })).toThrow();
  });

  it("parses nth strategy with nth value", () => {
    const opts = parseSampleArgs({ strategy: "nth", nth: "3" });
    expect(opts.nth).toBe(3);
  });
});

describe("sampleEndpoints", () => {
  it("returns first N for first strategy", () => {
    const eps = makeEndpoints(10);
    const result = sampleEndpoints(eps, { strategy: "first", count: 3 });
    expect(result).toHaveLength(3);
    expect(result[0].path).toBe("/api/resource/0");
  });

  it("returns last N for last strategy", () => {
    const eps = makeEndpoints(10);
    const result = sampleEndpoints(eps, { strategy: "last", count: 2 });
    expect(result[0].path).toBe("/api/resource/8");
    expect(result[1].path).toBe("/api/resource/9");
  });

  it("returns every nth endpoint", () => {
    const eps = makeEndpoints(9);
    const result = sampleEndpoints(eps, { strategy: "nth", count: 10, nth: 3 });
    expect(result.map((e) => e.path)).toEqual([
      "/api/resource/0",
      "/api/resource/3",
      "/api/resource/6",
    ]);
  });

  it("returns deterministic random with seed", () => {
    const eps = makeEndpoints(20);
    const a = sampleEndpoints(eps, { strategy: "random", count: 5, seed: 42 });
    const b = sampleEndpoints(eps, { strategy: "random", count: 5, seed: 42 });
    expect(a.map((e) => e.path)).toEqual(b.map((e) => e.path));
  });

  it("returns empty array for empty input", () => {
    expect(sampleEndpoints([], { strategy: "first", count: 5 })).toEqual([]);
  });
});

describe("formatSampleSummary", () => {
  it("includes strategy and counts", () => {
    const eps = makeEndpoints(3);
    const opts: SampleOptions = { strategy: "first", count: 3 };
    const summary = formatSampleSummary(10, eps, opts);
    expect(summary).toContain("first");
    expect(summary).toContain("10");
    expect(summary).toContain("3");
  });
});

describe("parseSampleConfig", () => {
  it("parses valid config object", () => {
    const cfg = parseSampleConfig({ strategy: "last", count: 7, seed: 1 });
    expect(cfg.strategy).toBe("last");
    expect(cfg.count).toBe(7);
    expect(cfg.seed).toBe(1);
  });

  it("throws on non-object input", () => {
    expect(() => parseSampleConfig("bad")).toThrow();
  });
});

describe("sampleConfigToOptions", () => {
  it("converts config to options", () => {
    const opts = sampleConfigToOptions({ strategy: "first", count: 4 });
    expect(opts.strategy).toBe("first");
    expect(opts.count).toBe(4);
  });
});
