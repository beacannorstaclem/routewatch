import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  isSnapshotFormat,
  parseSnapshotConfig,
  mergeSnapshotConfigs,
  loadSnapshotConfig,
  type SnapshotConfig,
} from "./snapshot.config";

describe("isSnapshotFormat", () => {
  it("returns true for valid formats", () => {
    expect(isSnapshotFormat("json")).toBe(true);
    expect(isSnapshotFormat("ndjson")).toBe(true);
  });

  it("returns false for invalid values", () => {
    expect(isSnapshotFormat("csv")).toBe(false);
    expect(isSnapshotFormat(null)).toBe(false);
    expect(isSnapshotFormat(42)).toBe(false);
  });
});

describe("parseSnapshotConfig", () => {
  it("uses defaults for empty input", () => {
    const config = parseSnapshotConfig({});
    expect(config.format).toBe("json");
    expect(config.pretty).toBe(true);
    expect(config.includeTimestamp).toBe(true);
    expect(config.includeMetadata).toBe(true);
    expect(config.maxEndpoints).toBeUndefined();
  });

  it("parses valid fields", () => {
    const config = parseSnapshotConfig({
      format: "ndjson",
      pretty: false,
      includeTimestamp: false,
      includeMetadata: false,
      maxEndpoints: 100,
    });
    expect(config.format).toBe("ndjson");
    expect(config.pretty).toBe(false);
    expect(config.includeTimestamp).toBe(false);
    expect(config.includeMetadata).toBe(false);
    expect(config.maxEndpoints).toBe(100);
  });

  it("ignores invalid format and falls back to default", () => {
    const config = parseSnapshotConfig({ format: "xml" });
    expect(config.format).toBe("json");
  });

  it("ignores non-positive maxEndpoints", () => {
    expect(parseSnapshotConfig({ maxEndpoints: 0 }).maxEndpoints).toBeUndefined();
    expect(parseSnapshotConfig({ maxEndpoints: -5 }).maxEndpoints).toBeUndefined();
  });
});

describe("mergeSnapshotConfigs", () => {
  const base: SnapshotConfig = {
    format: "json",
    pretty: true,
    includeTimestamp: true,
    includeMetadata: true,
  };

  it("overrides specified fields", () => {
    const merged = mergeSnapshotConfigs(base, { format: "ndjson", pretty: false });
    expect(merged.format).toBe("ndjson");
    expect(merged.pretty).toBe(false);
    expect(merged.includeTimestamp).toBe(true);
  });

  it("returns a new object", () => {
    const merged = mergeSnapshotConfigs(base, {});
    expect(merged).not.toBe(base);
  });
});

describe("loadSnapshotConfig", () => {
  it("returns default config when no file exists", () => {
    const config = loadSnapshotConfig("/nonexistent/path.json");
    expect(config.format).toBe("json");
    expect(config.pretty).toBe(true);
  });
});
