import { describe, it, expect } from "vitest";
import { parseMaskArgs, maskObject, applyMask } from "./mask";

describe("parseMaskArgs", () => {
  it("parses array maskFields", () => {
    const result = parseMaskArgs({ maskFields: ["password", "token"] });
    expect(result.fields).toEqual(["password", "token"]);
  });

  it("parses comma-separated string maskFields", () => {
    const result = parseMaskArgs({ maskFields: "password, token" });
    expect(result.fields).toEqual(["password", "token"]);
  });

  it("defaults to empty fields", () => {
    const result = parseMaskArgs({});
    expect(result.fields).toEqual([]);
  });

  it("uses custom replacement", () => {
    const result = parseMaskArgs({ maskFields: ["x"], maskReplacement: "[HIDDEN]" });
    expect(result.replacement).toBe("[HIDDEN]");
  });

  it("defaults replacement to ***", () => {
    const result = parseMaskArgs({ maskFields: [] });
    expect(result.replacement).toBe("***");
  });
});

describe("maskObject", () => {
  it("masks top-level fields", () => {
    const result = maskObject({ password: "secret", name: "alice" }, ["password"]);
    expect(result).toEqual({ password: "***", name: "alice" });
  });

  it("masks nested fields", () => {
    const result = maskObject({ user: { token: "abc", id: 1 } }, ["token"]);
    expect(result).toEqual({ user: { token: "***", id: 1 } });
  });

  it("masks fields inside arrays", () => {
    const result = maskObject([{ key: "val" }, { key: "other" }], ["key"]);
    expect(result).toEqual([{ key: "***" }, { key: "***" }]);
  });

  it("returns primitives unchanged", () => {
    expect(maskObject("hello", ["x"])).toBe("hello");
    expect(maskObject(42, ["x"])).toBe(42);
  });

  it("uses custom replacement string", () => {
    const result = maskObject({ secret: "value" }, ["secret"], "[REDACTED]");
    expect(result).toEqual({ secret: "[REDACTED]" });
  });
});

describe("applyMask", () => {
  it("applies mask config to body", () => {
    const body = { token: "abc123", status: "ok" };
    const result = applyMask(body, { fields: ["token"], replacement: "***" });
    expect(result).toEqual({ token: "***", status: "ok" });
  });

  it("returns body unchanged when no fields", () => {
    const body = { a: 1 };
    expect(applyMask(body, { fields: [] })).toEqual({ a: 1 });
  });
});
