import { describe, it, expect } from "vitest";
import {
  digestEndpoint,
  digestSnapshot,
  parseDigestArgs,
} from "./digest";
import type { Endpoint } from "./index";

const ep1: Endpoint = { method: "GET", path: "/users", status: 200 };
const ep2: Endpoint = { method: "POST", path: "/users", status: 201 };

describe("digestEndpoint", () => {
  it("returns a non-empty hash", () => {
    const result = digestEndpoint(ep1);
    expect(result.hash).toHaveLength(64); // sha256 hex
    expect(result.key).toBe("GET:/users");
    expect(result.algorithm).toBe("sha256");
  });

  it("produces different hashes for different endpoints", () => {
    const r1 = digestEndpoint(ep1);
    const r2 = digestEndpoint(ep2);
    expect(r1.hash).not.toBe(r2.hash);
  });

  it("respects algorithm option", () => {
    const result = digestEndpoint(ep1, { algorithm: "md5" });
    expect(result.hash).toHaveLength(32);
    expect(result.algorithm).toBe("md5");
  });

  it("respects fields option", () => {
    const r1 = digestEndpoint(ep1, { fields: ["method", "path"] });
    const r2 = digestEndpoint(
      { ...ep1, status: 500 },
      { fields: ["method", "path"] }
    );
    expect(r1.hash).toBe(r2.hash);
  });
});

describe("digestSnapshot", () => {
  it("returns a map keyed by method:path", () => {
    const map = digestSnapshot([ep1, ep2]);
    expect(map.size).toBe(2);
    expect(map.has("GET:/users")).toBe(true);
    expect(map.has("POST:/users")).toBe(true);
  });

  it("handles empty array", () => {
    expect(digestSnapshot([]).size).toBe(0);
  });
});

describe("parseDigestArgs", () => {
  it("parses --digest-algo", () => {
    const opts = parseDigestArgs(["--digest-algo", "md5"]);
    expect(opts.algorithm).toBe("md5");
  });

  it("parses --digest-fields", () => {
    const opts = parseDigestArgs(["--digest-fields", "method,path"]);
    expect(opts.fields).toEqual(["method", "path"]);
  });

  it("ignores unknown args", () => {
    const opts = parseDigestArgs(["--other", "val"]);
    expect(opts.algorithm).toBeUndefined();
  });
});
