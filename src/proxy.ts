import { URL } from "url";

export interface ProxyConfig {
  url: string;
  auth?: string;
}

export function parseProxyArgs(args: Record<string, unknown>): ProxyConfig | undefined {
  const proxyUrl = args["proxy"] as string | undefined;
  if (!proxyUrl) return undefined;

  try {
    new URL(proxyUrl);
  } catch {
    throw new Error(`Invalid proxy URL: ${proxyUrl}`);
  }

  const auth = args["proxy-auth"] as string | undefined;
  return { url: proxyUrl, ...(auth ? { auth } : {}) };
}

export function applyProxy(
  options: Record<string, unknown>,
  proxy: ProxyConfig | undefined
): Record<string, unknown> {
  if (!proxy) return options;

  const proxyHeaders: Record<string, string> = {};
  if (proxy.auth) {
    const encoded = Buffer.from(proxy.auth).toString("base64");
    proxyHeaders["Proxy-Authorization"] = `Basic ${encoded}`;
  }

  return {
    ...options,
    proxy: proxy.url,
    ...(Object.keys(proxyHeaders).length > 0
      ? { proxyHeaders }
      : {}),
  };
}

export function proxyConfigToEnv(proxy: ProxyConfig): Record<string, string> {
  const env: Record<string, string> = { HTTP_PROXY: proxy.url, HTTPS_PROXY: proxy.url };
  if (proxy.auth) env["PROXY_AUTH"] = proxy.auth;
  return env;
}
