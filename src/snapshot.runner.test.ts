import { describe, it, expect, vi, beforeEach } from "vitest";
import { resolveSnapshotConfig, parseSnapshotRunArgs, runSnapshot } from "./snapshot.runner";
import * as storage from "./storage";
import * as snapshotModule from "./snapshot";

vi.mock("./storage", () => ({
  saveSnapshot: vi.fn().mockResolvedValue(undefined),
  getSnapshotsDir: vi.fn().mockReturnValue("/tmp/snapshots"),
  ensureSnapshotsDir: vi.fn().mockResolvedValue(undefined),
  listSnapshots: vi.fn().mockResolvedValue([]),
  loadSnapshot: vi.fn(),
}));

vi.mock("./snapshot", () => ({
  createSnapshotFile: vi.fn().mockReturnValue({
    id: "snap-001",
    timestamp: "2024-01-01T00:00:00.000Z",
    endpoints: [],
  }),
}));

describe("resolveSnapshotConfig", () => {
  it("returns default config when no overrides", () => {
    const config = resolveSnapshotConfig();
    expect(config.format).toBe("json");
    expect(config.pretty).toBe(true);
  });

  it("applies overrides", () => {
    const config = resolveSnapshotConfig(undefined, { format: "ndjson", pretty: false });
    expect(config.format).toBe("ndjson");
    expect(config.pretty).toBe(false);
  });
});

describe("parseSnapshotRunArgs", () => {
  it("returns empty object for unknown args", () => {
    expect(parseSnapshotRunArgs({})).toEqual({});
  });

  it("parses snapshotFormat", () => {
    const result = parseSnapshotRunArgs({ snapshotFormat: "ndjson" });
    expect(result.format).toBe("ndjson");
  });

  it("parses snapshotPretty", () => {
    const result = parseSnapshotRunArgs({ snapshotPretty: false });
    expect(result.pretty).toBe(false);
  });

  it("parses maxEndpoints", () => {
    const result = parseSnapshotRunArgs({ maxEndpoints: 50 });
    expect(result.maxEndpoints).toBe(50);
  });

  it("parses noTimestamp flag", () => {
    const result = parseSnapshotRunArgs({ noTimestamp: true });
    expect(result.includeTimestamp).toBe(false);
  });

  it("parses noMetadata flag", () => {
    const result = parseSnapshotRunArgs({ noMetadata: true });
    expect(result.includeMetadata).toBe(false);
  });
});

describe("runSnapshot", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("saves snapshot and returns result", async () => {
    const endpoints = [{ method: "GET", path: "/api/users", status: 200, headers: {} }] as any[];
    const result = await runSnapshot({ endpoints });
    expect(result.snapshotId).toBe("snap-001");
    expect(result.endpointCount).toBe(1);
    expect(storage.saveSnapshot).toHaveBeenCalledOnce();
  });

  it("respects maxEndpoints limit", async () => {
    const endpoints = Array.from({ length: 10 }, (_, i) => ({
      method: "GET",
      path: `/api/item/${i}`,
      status: 200,
      headers: {},
    })) as any[];

    await runSnapshot({ endpoints, configOverrides: { maxEndpoints: 3 } });

    const createCall = vi.mocked(snapshotModule.createSnapshotFile).mock.calls[0];
    expect(createCall[0]).toHaveLength(3);
  });

  it("passes label to createSnapshotFile", async () => {
    await runSnapshot({ endpoints: [], label: "production" });
    expect(snapshotModule.createSnapshotFile).toHaveBeenCalledWith([], "production");
  });
});
