import { createHash } from "crypto";
import type { Endpoint } from "./index";

export interface DigestOptions {
  algorithm?: "md5" | "sha1" | "sha256";
  fields?: ("method" | "path" | "status" | "headers" | "body")[];
}

export interface DigestResult {
  key: string;
  hash: string;
  algorithm: string;
}

const DEFAULT_FIELDS: DigestOptions["fields"] = ["method", "path", "status"];
const DEFAULT_ALGORITHM = "sha256";

export function digestEndpoint(
  endpoint: Endpoint,
  options: DigestOptions = {}
): DigestResult {
  const algorithm = options.algorithm ?? DEFAULT_ALGORITHM;
  const fields = options.fields ?? DEFAULT_FIELDS;

  const parts: string[] = [];
  if (fields.includes("method")) parts.push(endpoint.method ?? "");
  if (fields.includes("path")) parts.push(endpoint.path ?? "");
  if (fields.includes("status")) parts.push(String(endpoint.status ?? ""));
  if (fields.includes("headers"))
    parts.push(JSON.stringify(endpoint.headers ?? {}));
  if (fields.includes("body")) parts.push(JSON.stringify(endpoint.body ?? null));

  const raw = parts.join("|");
  const hash = createHash(algorithm).update(raw).digest("hex");
  const key = `${endpoint.method}:${endpoint.path}`;

  return { key, hash, algorithm };
}

export function digestSnapshot(
  endpoints: Endpoint[],
  options: DigestOptions = {}
): Map<string, DigestResult> {
  const map = new Map<string, DigestResult>();
  for (const ep of endpoints) {
    const result = digestEndpoint(ep, options);
    map.set(result.key, result);
  }
  return map;
}

export function parseDigestArgs(argv: string[]): DigestOptions {
  const options: DigestOptions = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--digest-algo" && argv[i + 1]) {
      const algo = argv[++i] as DigestOptions["algorithm"];
      if (["md5", "sha1", "sha256"].includes(algo!)) options.algorithm = algo;
    } else if (argv[i] === "--digest-fields" && argv[i + 1]) {
      options.fields = argv[++i].split(",") as DigestOptions["fields"];
    }
  }
  return options;
}
