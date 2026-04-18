import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { loadEnvFile, resolveEnvVars, parseEnvArgs } from "./env";

describe("loadEnvFile", () => {
  it("returns empty object for missing file", () => {
    expect(loadEnvFile("/nonexistent/.env")).toEqual({});
  });

  it("parses key=value pairs", () => {
    const tmp = path.join(os.tmpdir(), ".env-test-" + Date.now());
    fs.writeFileSync(tmp, 'BASE_URL=https://api.example.com\nTOKEN="abc123"\n# comment\n');
    const vars = loadEnvFile(tmp);
    expect(vars["BASE_URL"]).toBe("https://api.example.com");
    expect(vars["TOKEN"]).toBe("abc123");
    expect(vars["# comment"]).toBeUndefined();
    fs.unlinkSync(tmp);
  });
});

describe("resolveEnvVars", () => {
  const vars = { HOST: "localhost", PORT: "3000" };

  it("replaces ${VAR} syntax", () => {
    expect(resolveEnvVars("http://${HOST}:${PORT}/api", vars)).toBe(
      "http://localhost:3000/api"
    );
  });

  it("replaces $VAR syntax", () => {
    expect(resolveEnvVars("http://$HOST/path", vars)).toBe(
      "http://localhost/path"
    );
  });

  it("returns empty string for unknown vars", () => {
    expect(resolveEnvVars("${UNKNOWN}", vars)).toBe("");
  });
});

describe("parseEnvArgs", () => {
  it("parses --env=KEY=VALUE", () => {
    const cfg = parseEnvArgs(["--env=API_KEY=secret"]);
    expect(cfg.vars["API_KEY"]).toBe("secret");
  });

  it("parses --env-file", () => {
    const tmp = path.join(os.tmpdir(), ".env-args-" + Date.now());
    fs.writeFileSync(tmp, "REGION=us-east-1\n");
    const cfg = parseEnvArgs(["--env-file", tmp]);
    expect(cfg.vars["REGION"]).toBe("us-east-1");
    fs.unlinkSync(tmp);
  });

  it("returns empty vars for no args", () => {
    expect(parseEnvArgs([])).toEqual({ vars: {} });
  });
});
