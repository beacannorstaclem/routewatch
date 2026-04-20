import type { Endpoint } from "./index";

export type FormatStyle = "compact" | "verbose" | "table";

export interface FormatOptions {
  style: FormatStyle;
  showHeaders: boolean;
  showStatus: boolean;
  showBody: boolean;
}

export function isFormatStyle(value: string): value is FormatStyle {
  return ["compact", "verbose", "table"].includes(value);
}

export function parseFormatArgs(args: Record<string, unknown>): FormatOptions {
  const style = typeof args.style === "string" && isFormatStyle(args.style)
    ? args.style
    : "compact";
  return {
    style,
    showHeaders: args.showHeaders === true || args["show-headers"] === true,
    showStatus: args.showStatus !== false && args["show-status"] !== false,
    showBody: args.showBody === true || args["show-body"] === true,
  };
}

export function formatEndpointCompact(endpoint: Endpoint): string {
  return `[${endpoint.method}] ${endpoint.path}`;
}

export function formatEndpointVerbose(endpoint: Endpoint, opts: FormatOptions): string {
  const lines: string[] = [
    `Method  : ${endpoint.method}`,
    `Path    : ${endpoint.path}`,
  ];
  if (opts.showStatus && endpoint.status !== undefined) {
    lines.push(`Status  : ${endpoint.status}`);
  }
  if (opts.showHeaders && endpoint.headers && Object.keys(endpoint.headers).length > 0) {
    lines.push(`Headers : ${JSON.stringify(endpoint.headers)}`);
  }
  if (opts.showBody && endpoint.body !== undefined) {
    lines.push(`Body    : ${JSON.stringify(endpoint.body)}`);
  }
  return lines.join("\n");
}

export function formatEndpointTable(endpoints: Endpoint[]): string {
  const header = `${ "METHOD".padEnd(10) }${ "PATH".padEnd(50) }STATUS`;
  const divider = "-".repeat(70);
  const rows = endpoints.map((e) =>
    `${(e.method ?? "").padEnd(10)}${e.path.padEnd(50)}${e.status ?? ""}`.trimEnd()
  );
  return [header, divider, ...rows].join("\n");
}

export function applyFormat(endpoints: Endpoint[], opts: FormatOptions): string {
  if (opts.style === "table") {
    return formatEndpointTable(endpoints);
  }
  if (opts.style === "verbose") {
    return endpoints.map((e) => formatEndpointVerbose(e, opts)).join("\n---\n");
  }
  return endpoints.map(formatEndpointCompact).join("\n");
}
