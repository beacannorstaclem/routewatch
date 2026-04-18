import { parseTransformConfig } from "./transform.config";

describe("parseTransformConfig", () => {
  it("parses valid config", () => {
    const config = parseTransformConfig({
      transforms: [
        { field: "token", fn: "redact" },
        { field: "name", fn: "lowercase" },
      ],
    });
    expect(config.transforms).toHaveLength(2);
    expect(config.transforms[0]).toEqual({ field: "token", fn: "redact" });
  });

  it("throws if not an object", () => {
    expect(() => parseTransformConfig(null)).toThrow();
    expect(() => parseTransformConfig("string")).toThrow();
  });

  it("throws if transforms missing", () => {
    expect(() => parseTransformConfig({})).toThrow();
  });

  it("throws if transforms is not array", () => {
    expect(() => parseTransformConfig({ transforms: "bad" })).toThrow();
  });

  it("throws if entry is malformed", () => {
    expect(() =>
      parseTransformConfig({ transforms: [{ field: 123, fn: "redact" }] })
    ).toThrow();
  });

  it("allows empty transforms array", () => {
    const config = parseTransformConfig({ transforms: [] });
    expect(config.transforms).toEqual([]);
  });
});
