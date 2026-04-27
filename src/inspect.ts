import type { Endpoint } from './index';

export interface InspectOptions {
  fields?: string[];
  verbose?: boolean;
  showMeta?: boolean;
}

export interface InspectResult {
  endpoint: Endpoint;
  fields: Record<string, unknown>;
  summary: string;
}

export function parseInspectArgs(args: Record<string, unknown>): InspectOptions {
  const fields =
    typeof args['fields'] === 'string'
      ? args['fields'].split(',').map((f) => f.trim()).filter(Boolean)
      : Array.isArray(args['fields'])
      ? (args['fields'] as string[])
      : undefined;

  return {
    fields,
    verbose: args['verbose'] === true || args['verbose'] === 'true',
    showMeta: args['show-meta'] === true || args['show-meta'] === 'true',
  };
}

export function inspectEndpoint(
  endpoint: Endpoint,
  options: InspectOptions = {}
): InspectResult {
  const { fields, verbose, showMeta } = options;

  const base: Record<string, unknown> = {
    method: endpoint.method,
    path: endpoint.path,
    status: endpoint.status,
  };

  if (verbose || showMeta) {
    if (endpoint.headers) base['headers'] = endpoint.headers;
    if (endpoint.body !== undefined) base['body'] = endpoint.body;
    if ((endpoint as Record<string, unknown>)['meta']) {
      base['meta'] = (endpoint as Record<string, unknown>)['meta'];
    }
  }

  const selected: Record<string, unknown> =
    fields && fields.length > 0
      ? Object.fromEntries(
          fields
            .filter((f) => f in base)
            .map((f) => [f, base[f]])
        )
      : base;

  const summary = `${endpoint.method} ${endpoint.path} → ${endpoint.status}`;

  return { endpoint, fields: selected, summary };
}

export function inspectEndpoints(
  endpoints: Endpoint[],
  options: InspectOptions = {}
): InspectResult[] {
  return endpoints.map((ep) => inspectEndpoint(ep, options));
}

export function formatInspectOutput(results: InspectResult[]): string {
  return results
    .map((r) => {
      const lines = [`  ${r.summary}`];
      for (const [key, val] of Object.entries(r.fields)) {
        if (key !== 'method' && key !== 'path' && key !== 'status') {
          lines.push(`    ${key}: ${JSON.stringify(val)}`);
        }
      }
      return lines.join('\n');
    })
    .join('\n');
}
