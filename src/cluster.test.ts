import { describe, it, expect } from "vitest";
import {
  isClusterField,
  clusterEndpoints,
  formatClusterSummary,
  parseClusterArgs,
} from "./cluster";
import type { Endpoint } from "./index";

const makeEndpoint = (overrides: Partial<Endpoint>): Endpoint => ({
  url: "https://api.example.com/users",
  method: "GET",
  status: 200,
  headers: {},
  body: null,
  ...overrides,
});

const endpoints: Endpoint[] = [
  makeEndpoint({ method: "GET", url: "https://api.example.com/users", status: 200 }),
  makeEndpoint({ method: "POST", url: "https://api.example.com/users", status: 201 }),
  makeEndpoint({ method: "GET", url: "https://api.example.com/posts", status: 200 }),
  makeEndpoint({ method: "DELETE", url: "https://other.example.com/items", status: 204 }),
  makeEndpoint({ method: "GET", url: "https://other.example.com/items", status: 404 }),
];

describe("isClusterField", () => {
  it("accepts valid fields", () => {
    expect(isClusterField("method")).toBe(true);
    expect(isClusterField("status")).toBe(true);
    expect(isClusterField("host")).toBe(true);
    expect(isClusterField("prefix")).toBe(true);
  });

  it("rejects invalid fields", () => {
    expect(isClusterField("body")).toBe(false);
    expect(isClusterField("")).toBe(false);
  });
});

describe("clusterEndpoints", () => {
  it("clusters by method", () => {
    const groups = clusterEndpoints(endpoints, { field: "method" });
    const methods = groups.map((g) => g.key);
    expect(methods).toContain("GET");
    expect(groups.find((g) => g.key === "GET")?.count).toBe(3);
  });

  it("clusters by host", () => {
    const groups = clusterEndpoints(endpoints, { field: "host" });
    expect(groups.length).toBe(2);
    expect(groups[0].key).toBe("api.example.com");
  });

  it("clusters by status", () => {
    const groups = clusterEndpoints(endpoints, { field: "status" });
    const keys = groups.map((g) => g.key);
    expect(keys).toContain("200");
  });

  it("respects minSize filter", () => {
    const groups = clusterEndpoints(endpoints, { field: "method", minSize: 2 });
    expect(groups.every((g) => g.count >= 2)).toBe(true);
  });
});

describe("formatClusterSummary", () => {
  it("returns message for empty groups", () => {
    expect(formatClusterSummary([])).toBe("No clusters found.");
  });

  it("formats groups", () => {
    const groups = clusterEndpoints(endpoints, { field: "method" });
    const summary = formatClusterSummary(groups);
    expect(summary).toContain("GET");
    expect(summary).toContain("Clusters");
  });
});

describe("parseClusterArgs", () => {
  it("parses valid args", () => {
    expect(parseClusterArgs({ field: "host", minSize: 2 })).toEqual({ field: "host", minSize: 2 });
  });

  it("defaults to method field", () => {
    expect(parseClusterArgs({})).toEqual({ field: "method", minSize: undefined });
  });

  it("ignores invalid field", () => {
    expect(parseClusterArgs({ field: "invalid" })).toEqual({ field: "method", minSize: undefined });
  });
});
