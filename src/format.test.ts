import { describe, it, expect } from "vitest";
import {
  isFormatStyle,
  parseFormatArgs,
  formatEndpointCompact,
  formatEndpointVerbose,
  formatEndpointTable,
  applyFormat,
} from "./format";
import type { Endpoint } from "./index";

const ep: Endpoint = { method: "GET", path: "/api/users", status: 200 };
const epWithHeaders: Endpoint = { method: "POST", path: "/api/items", status: 201, headers: { "content-type": "application/json" } };

describe("isFormatStyle", () => {
  it("accepts valid styles", () => {
    expect(isFormatStyle("compact")).toBe(true);
    expect(isFormatStyle("verbose")).toBe(true);
    expect(isFormatStyle("table")).toBe(true);
  });
  it("rejects invalid styles", () => {
    expect(isFormatStyle("json")).toBe(false);
    expect(isFormatStyle("")).toBe(false);
  });
});

describe("parseFormatArgs", () => {
  it("defaults to compact with no args", () => {
    const opts = parseFormatArgs({});
    expect(opts.style).toBe("compact");
    expect(opts.showHeaders).toBe(false);
    expect(opts.showStatus).toBe(true);
    expect(opts.showBody).toBe(false);
  });
  it("parses style from args", () => {
    expect(parseFormatArgs({ style: "verbose" }).style).toBe("verbose");
    expect(parseFormatArgs({ style: "table" }).style).toBe("table");
  });
  it("falls back to compact for unknown style", () => {
    expect(parseFormatArgs({ style: "xml" }).style).toBe("compact");
  });
  it("parses showHeaders and showBody flags", () => {
    const opts = parseFormatArgs({ "show-headers": true, "show-body": true });
    expect(opts.showHeaders).toBe(true);
    expect(opts.showBody).toBe(true);
  });
});

describe("formatEndpointCompact", () => {
  it("formats as [METHOD] path", () => {
    expect(formatEndpointCompact(ep)).toBe("[GET] /api/users");
  });
});

describe("formatEndpointVerbose", () => {
  it("includes method and path", () => {
    const opts = parseFormatArgs({ style: "verbose" });
    const out = formatEndpointVerbose(ep, opts);
    expect(out).toContain("GET");
    expect(out).toContain("/api/users");
  });
  it("includes status when showStatus is true", () => {
    const opts = parseFormatArgs({ style: "verbose" });
    expect(formatEndpointVerbose(ep, opts)).toContain("200");
  });
  it("includes headers when showHeaders is true", () => {
    const opts = parseFormatArgs({ style: "verbose", "show-headers": true });
    expect(formatEndpointVerbose(epWithHeaders, opts)).toContain("content-type");
  });
});

describe("formatEndpointTable", () => {
  it("renders a table with header and rows", () => {
    const out = formatEndpointTable([ep, epWithHeaders]);
    expect(out).toContain("METHOD");
    expect(out).toContain("PATH");
    expect(out).toContain("/api/users");
    expect(out).toContain("/api/items");
  });
});

describe("applyFormat", () => {
  it("compact style returns one line per endpoint", () => {
    const opts = parseFormatArgs({});
    const out = applyFormat([ep, epWithHeaders], opts);
    const lines = out.split("\n");
    expect(lines).toHaveLength(2);
  });
  it("table style returns table output", () => {
    const opts = parseFormatArgs({ style: "table" });
    expect(applyFormat([ep], opts)).toContain("METHOD");
  });
  it("verbose style separates entries with ---", () => {
    const opts = parseFormatArgs({ style: "verbose" });
    expect(applyFormat([ep, epWithHeaders], opts)).toContain("---");
  });
});
