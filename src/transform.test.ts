import {
  resolveTransformFn,
  applyTransforms,
  parseTransformArgs,
} from "./transform";

describe("resolveTransformFn", () => {
  it("returns lowercase fn", () => {
    expect(resolveTransformFn("lowercase")("HELLO")).toBe("hello");
  });
  it("returns redact fn", () => {
    expect(resolveTransformFn("redact")("secret")).toBe("[REDACTED]");
  });
  it("throws for unknown transform", () => {
    expect(() => resolveTransformFn("unknown")).toThrow('Unknown transform: "unknown"');
  });
});

describe("applyTransforms", () => {
  it("applies transform to matching field", () => {
    const result = applyTransforms(
      { name: "Alice", status: "ACTIVE" },
      [{ field: "status", fn: (v) => v.toLowerCase() }]
    );
    expect(result.status).toBe("active");
    expect(result.name).toBe("Alice");
  });

  it("ignores missing fields", () => {
    const result = applyTransforms(
      { name: "Bob" },
      [{ field: "missing", fn: () => "x" }]
    );
    expect(result).toEqual({ name: "Bob" });
  });

  it("applies multiple transforms", () => {
    const result = applyTransforms(
      { a: "  hello  ", b: "world" },
      [
        { field: "a", fn: (v) => v.trim() },
        { field: "b", fn: (v) => v.toUpperCase() },
      ]
    );
    expect(result).toEqual({ a: "hello", b: "WORLD" });
  });
});

describe("parseTransformArgs", () => {
  it("parses single transform", () => {
    const transforms = parseTransformArgs(["--transform", "token:redact"]);
    expect(transforms).toHaveLength(1);
    expect(transforms[0].field).toBe("token");
    expect(transforms[0].fn("abc")).toBe("[REDACTED]");
  });

  it("parses multiple transforms", () => {
    const transforms = parseTransformArgs([
      "--transform", "name:lowercase",
      "--transform", "id:trim",
    ]);
    expect(transforms).toHaveLength(2);
  });

  it("throws on malformed value", () => {
    expect(() => parseTransformArgs(["--transform", "nocoron"])).toThrow();
  });

  it("returns empty array with no flags", () => {
    expect(parseTransformArgs(["--url", "http://x.com"])).toEqual([]);
  });
});
