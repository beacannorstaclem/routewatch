import https from "https";
import http from "http";
import { URL } from "url";

export interface FetchOptions {
  timeout?: number;
  headers?: Record<string, string>;
}

export interface FetchResult {
  status: number;
  headers: Record<string, string>;
  body: string;
}

export function fetchEndpoint(
  url: string,
  options: FetchOptions = {}
): Promise<FetchResult> {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const lib = parsed.protocol === "https:" ? https : http;
    const timeout = options.timeout ?? 10000;

    const req = lib.get(
      {
        hostname: parsed.hostname,
        port: parsed.port,
        path: parsed.pathname + parsed.search,
        headers: options.headers ?? {},
      },
      (res) => {
        let body = "";
        res.on("data", (chunk) => (body += chunk));
        res.on("end", () => {
          const headers: Record<string, string> = {};
          for (const [k, v] of Object.entries(res.headers)) {
            if (typeof v === "string") headers[k] = v;
            else if (Array.isArray(v)) headers[k] = v.join(", ");
          }
          resolve({ status: res.statusCode ?? 0, headers, body });
        });
      }
    );

    req.setTimeout(timeout, () => {
      req.destroy();
      reject(new Error(`Request to ${url} timed out after ${timeout}ms`));
    });

    req.on("error", reject);
  });
}
