import { parseRedactArgs, redactHeaders, redactObject } from "./redact";

describe("parseRedactArgs", () => {
  it("returns defaults with no args", () => {
    const cfg = parseRedactArgs({});
    expect(cfg.fields).toContain("authorization");
    expect(cfg.replacement).toBe("[REDACTED]");
  });

  it("appends custom fields from array", () => {
    const cfg = parseRedactArgs({ redact: ["x-secret"] });
    expect(cfg.fields).toContain("x-secret");
    expect(cfg.fields).toContain("authorization");
  });

  it("appends custom fields from comma string", () => {
    const cfg = parseRedactArgs({ redact: "x-secret, x-internal" });
    expect(cfg.fields).toContain("x-secret");
    expect(cfg.fields).toContain("x-internal");
  });

  it("uses custom replacement", () => {
    const cfg = parseRedactArgs({ redactWith: "***" });
    expect(cfg.replacement).toBe("***");
  });
});

describe("redactHeaders", () => {
  const cfg = { fields: ["authorization", "x-api-key"], replacement: "[REDACTED]" };

  it("redacts matching headers case-insensitively", () => {
    const result = redactHeaders({ Authorization: "Bearer abc", "Content-Type": "application/json" }, cfg);
    expect(result["Authorization"]).toBe("[REDACTED]");
    expect(result["Content-Type"]).toBe("application/json");
  });

  it("leaves non-sensitive headers unchanged", () => {
    const result = redactHeaders({ Accept: "*/*" }, cfg);
    expect(result["Accept"]).toBe("*/*");
  });
});

describe("redactObject", () => {
  const cfg = { fields: ["password", "token"], replacement: "[REDACTED]" };

  it("redacts matching keys", () => {
    const result = redactObject({ password: "secret", username: "alice" }, cfg);
    expect(result["password"]).toBe("[REDACTED]");
    expect(result["username"]).toBe("alice");
  });

  it("is case-insensitive", () => {
    const result = redactObject({ TOKEN: "abc123" }, cfg);
    expect(result["TOKEN"]).toBe("[REDACTED]");
  });
});
