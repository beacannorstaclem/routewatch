import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { writeFileSync, unlinkSync, existsSync } from "fs";
import {
  parseDigestConfig,
  loadDigestConfig,
  digestConfigToOptions,
} from "./digest.config";

const TMP = "routewatch.digest.json";

beforeEach(() => {
  if (existsSync(TMP)) unlinkSync(TMP);
});
afterEach(() => {
  if (existsSync(TMP)) unlinkSync(TMP);
});

describe("parseDigestConfig", () => {
  it("parses valid config", () => {
    const cfg = parseDigestConfig({ algorithm: "sha1", fields: ["method"] });
    expect(cfg.algorithm).toBe("sha1");
    expect(cfg.fields).toEqual(["method"]);
  });

  it("ignores invalid algorithm", () => {
    const cfg = parseDigestConfig({ algorithm: "bcrypt" });
    expect(cfg.algorithm).toBeUndefined();
  });

  it("returns empty object for null input", () => {
    expect(parseDigestConfig(null)).toEqual({});
  });
});

describe("loadDigestConfig", () => {
  it("returns empty config when no file exists", () => {
    const cfg = loadDigestConfig();
    expect(cfg).toEqual({});
  });

  it("loads from file", () => {
    writeFileSync(TMP, JSON.stringify({ algorithm: "md5", fields: ["path"] }));
    const cfg = loadDigestConfig(TMP);
    expect(cfg.algorithm).toBe("md5");
  });

  it("handles malformed JSON gracefully", () => {
    writeFileSync(TMP, "not-json");
    const cfg = loadDigestConfig(TMP);
    expect(cfg).toEqual({});
  });
});

describe("digestConfigToOptions", () => {
  it("maps config to options", () => {
    const opts = digestConfigToOptions({
      algorithm: "sha256",
      fields: ["method", "status"],
    });
    expect(opts.algorithm).toBe("sha256");
    expect(opts.fields).toEqual(["method", "status"]);
  });

  it("returns empty options for empty config", () => {
    expect(digestConfigToOptions({})).toEqual({});
  });
});
