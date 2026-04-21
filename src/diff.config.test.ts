import {
  isDiffMode,
  parseDiffConfig,
  defaultDiffConfig,
  mergeDiffConfigs,
  loadDiffConfig,
} from "./diff.config";
import { existsSync, readFileSync } from "fs";

jest.mock("fs");

const mockExistsSync = existsSync as jest.MockedFunction<typeof existsSync>;
const mockReadFileSync = readFileSync as jest.MockedFunction<typeof readFileSync>;

describe("isDiffMode", () => {
  it("accepts valid modes", () => {
    expect(isDiffMode("strict")).toBe(true);
    expect(isDiffMode("loose")).toBe(true);
    expect(isDiffMode("keys-only")).toBe(true);
  });

  it("rejects invalid modes", () => {
    expect(isDiffMode("deep")).toBe(false);
    expect(isDiffMode(123)).toBe(false);
    expect(isDiffMode(undefined)).toBe(false);
  });
});

describe("parseDiffConfig", () => {
  it("returns defaults for empty input", () => {
    expect(parseDiffConfig({})).toEqual(defaultDiffConfig);
  });

  it("parses all fields correctly", () => {
    const result = parseDiffConfig({
      mode: "loose",
      ignoreFields: ["timestamp"],
      ignoreStatus: true,
      ignoreHeaders: true,
      minChanges: 2,
    });
    expect(result.mode).toBe("loose");
    expect(result.ignoreFields).toEqual(["timestamp"]);
    expect(result.ignoreStatus).toBe(true);
    expect(result.ignoreHeaders).toBe(true);
    expect(result.minChanges).toBe(2);
  });

  it("falls back to defaults for invalid values", () => {
    const result = parseDiffConfig({ mode: "invalid", minChanges: "bad" });
    expect(result.mode).toBe("strict");
    expect(result.minChanges).toBe(0);
  });
});

describe("mergeDiffConfigs", () => {
  it("merges ignoreFields from both configs", () => {
    const base = { ...defaultDiffConfig, ignoreFields: ["a"] };
    const result = mergeDiffConfigs(base, { ignoreFields: ["b"] });
    expect(result.ignoreFields).toEqual(["a", "b"]);
  });

  it("override values take precedence", () => {
    const result = mergeDiffConfigs(defaultDiffConfig, { mode: "keys-only", ignoreStatus: true });
    expect(result.mode).toBe("keys-only");
    expect(result.ignoreStatus).toBe(true);
  });
});

describe("loadDiffConfig", () => {
  afterEach(() => jest.resetAllMocks());

  it("returns defaults when no config file found", () => {
    mockExistsSync.mockReturnValue(false);
    expect(loadDiffConfig()).toEqual(defaultDiffConfig);
  });

  it("loads config from file when found", () => {
    mockExistsSync.mockImplementation((p) =>
      String(p).includes("routewatch.diff.json")
    );
    mockReadFileSync.mockReturnValue(
      JSON.stringify({ mode: "loose", minChanges: 3 }) as unknown as Buffer
    );
    const result = loadDiffConfig();
    expect(result.mode).toBe("loose");
    expect(result.minChanges).toBe(3);
  });

  it("returns defaults on JSON parse error", () => {
    mockExistsSync.mockReturnValue(true);
    mockReadFileSync.mockReturnValue("not-json" as unknown as Buffer);
    expect(loadDiffConfig()).toEqual(defaultDiffConfig);
  });
});
