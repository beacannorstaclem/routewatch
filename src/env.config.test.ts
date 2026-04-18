import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import {
  loadDefaultEnvFiles,
  mergeEnvConfigs,
  envConfigToRecord,
  validateEnvConfig,
} from "./env.config";

describe("loadDefaultEnvFiles", () => {
  it("loads .env and .env.local from cwd", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "rw-env-"));
    fs.writeFileSync(path.join(dir, ".env"), "FOO=bar\n");
    fs.writeFileSync(path.join(dir, ".env.local"), "BAZ=qux\n");
    const cfg = loadDefaultEnvFiles(dir);
    expect(cfg.vars["FOO"]).toBe("bar");
    expect(cfg.vars["BAZ"]).toBe("qux");
  });

  it("returns empty vars if no env files exist", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "rw-env-empty-"));
    expect(loadDefaultEnvFiles(dir)).toEqual({ vars: {} });
  });
});

describe("mergeEnvConfigs", () => {
  it("merges multiple configs, later wins", () => {
    const a = { vars: { X: "1", Y: "2" } };
    const b = { vars: { Y: "3", Z: "4" } };
    expect(mergeEnvConfigs(a, b)).toEqual({ vars: { X: "1", Y: "3", Z: "4" } });
  });
});

describe("envConfigToRecord", () => {
  it("returns a copy of vars", () => {
    const cfg = { vars: { A: "1" } };
    const rec = envConfigToRecord(cfg);
    expect(rec).toEqual({ A: "1" });
    rec["A"] = "changed";
    expect(cfg.vars["A"]).toBe("1");
  });
});

describe("validateEnvConfig", () => {
  it("returns missing required keys", () => {
    const cfg = { vars: { HOST: "localhost" } };
    expect(validateEnvConfig(cfg, ["HOST", "TOKEN"])).toEqual(["TOKEN"]);
  });

  it("returns empty array when all keys present", () => {
    const cfg = { vars: { A: "1", B: "2" } };
    expect(validateEnvConfig(cfg, ["A", "B"])).toEqual([]);
  });
});
