import { parseSliceArgs, applySlice, formatSliceSummary } from "./slice";
import { parseSliceConfig, sliceConfigToOptions, mergeSliceConfigs } from "./slice.config";

const items = ["a", "b", "c", "d", "e"];

describe("parseSliceArgs", () => {
  it("parses start only", () => {
    expect(parseSliceArgs({ start: 1 })).toEqual({ start: 1, end: undefined, count: undefined });
  });
  it("parses start and end", () => {
    expect(parseSliceArgs({ start: 1, end: 3 })).toEqual({ start: 1, end: 3, count: undefined });
  });
  it("parses start and count", () => {
    expect(parseSliceArgs({ start: 0, count: 2 })).toEqual({ start: 0, end: undefined, count: 2 });
  });
  it("defaults start to 0", () => {
    expect(parseSliceArgs({})).toEqual({ start: 0, end: undefined, count: undefined });
  });
  it("throws on negative start", () => {
    expect(() => parseSliceArgs({ start: -1 })).toThrow();
  });
  it("throws on end < start", () => {
    expect(() => parseSliceArgs({ start: 3, end: 1 })).toThrow();
  });
  it("throws on count < 1", () => {
    expect(() => parseSliceArgs({ count: 0 })).toThrow();
  });
});

describe("applySlice", () => {
  it("returns all when no end or count", () => {
    const r = applySlice(items, { start: 0 });
    expect(r.items).toEqual(items);
    expect(r.total).toBe(5);
    expect(r.sliced).toBe(5);
  });
  it("slices by end", () => {
    const r = applySlice(items, { start: 1, end: 3 });
    expect(r.items).toEqual(["b", "c"]);
    expect(r.sliced).toBe(2);
  });
  it("slices by count", () => {
    const r = applySlice(items, { start: 2, count: 2 });
    expect(r.items).toEqual(["c", "d"]);
  });
  it("handles start beyond length", () => {
    const r = applySlice(items, { start: 10 });
    expect(r.items).toEqual([]);
    expect(r.sliced).toBe(0);
  });
});

describe("formatSliceSummary", () => {
  it("formats summary string", () => {
    const r = applySlice(items, { start: 1, end: 3 });
    const s = formatSliceSummary(r);
    expect(s).toContain("2 of 5");
    expect(s).toContain("1");
    expect(s).toContain("3");
  });
});

describe("parseSliceConfig", () => {
  it("parses numeric fields", () => {
    expect(parseSliceConfig({ start: "2", count: "3" })).toEqual({ start: 2, count: 3 });
  });
  it("ignores missing fields", () => {
    expect(parseSliceConfig({})).toEqual({});
  });
});

describe("mergeSliceConfigs", () => {
  it("override wins", () => {
    const merged = mergeSliceConfigs({ start: 0, count: 5 }, { start: 2 });
    expect(merged.start).toBe(2);
    expect(merged.count).toBe(5);
  });
});

describe("sliceConfigToOptions", () => {
  it("defaults start to 0", () => {
    expect(sliceConfigToOptions({}).start).toBe(0);
  });
});
