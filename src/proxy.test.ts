import { describe, it, expect } from "vitest";
import { parseProxyArgs, applyProxy, proxyConfigToEnv } from "./proxy";

describe("parseProxyArgs", () => {
  it("returns undefined when no proxy arg", () => {
    expect(parseProxyArgs({})).toBeUndefined();
  });

  it("parses a valid proxy URL", () => {
    const result = parseProxyArgs({ proxy: "http://proxy.example.com:8080" });
    expect(result).toEqual({ url: "http://proxy.example.com:8080" });
  });

  it("includes auth when provided", () => {
    const result = parseProxyArgs({ proxy: "http://proxy.example.com", "proxy-auth": "user:pass" });
    expect(result).toEqual({ url: "http://proxy.example.com", auth: "user:pass" });
  });

  it("throws on invalid proxy URL", () => {
    expect(() => parseProxyArgs({ proxy: "not-a-url" })).toThrow("Invalid proxy URL");
  });
});

describe("applyProxy", () => {
  it("returns options unchanged when no proxy", () => {
    const opts = { timeout: 5000 };
    expect(applyProxy(opts, undefined)).toEqual(opts);
  });

  it("adds proxy url to options", () => {
    const result = applyProxy({}, { url: "http://proxy.example.com" });
    expect(result.proxy).toBe("http://proxy.example.com");
  });

  it("adds Proxy-Authorization header when auth provided", () => {
    const result = applyProxy({}, { url: "http://proxy.example.com", auth: "user:pass" }) as any;
    const encoded = Buffer.from("user:pass").toString("base64");
    expect(result.proxyHeaders["Proxy-Authorization"]).toBe(`Basic ${encoded}`);
  });
});

describe("proxyConfigToEnv", () => {
  it("sets HTTP_PROXY and HTTPS_PROXY", () => {
    const env = proxyConfigToEnv({ url: "http://proxy.example.com" });
    expect(env.HTTP_PROXY).toBe("http://proxy.example.com");
    expect(env.HTTPS_PROXY).toBe("http://proxy.example.com");
  });

  it("includes PROXY_AUTH when auth set", () => {
    const env = proxyConfigToEnv({ url: "http://proxy.example.com", auth: "user:pass" });
    expect(env.PROXY_AUTH).toBe("user:pass");
  });
});
