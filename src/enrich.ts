export interface EnrichOptions {
  addTimestamp?: boolean;
  addHash?: boolean;
  addSource?: string;
  prefix?: string;
}

export interface EnrichedEndpoint {
  method: string;
  path: string;
  [key: string]: unknown;
}

export function enrichEndpoint(
  endpoint: EnrichedEndpoint,
  options: EnrichOptions = {}
): EnrichedEndpoint {
  const result: EnrichedEndpoint = { ...endpoint };

  if (options.addTimestamp) {
    result['_enrichedAt'] = new Date().toISOString();
  }

  if (options.addHash) {
    const raw = `${endpoint.method}:${endpoint.path}`;
    let hash = 0;
    for (let i = 0; i < raw.length; i++) {
      hash = (hash * 31 + raw.charCodeAt(i)) >>> 0;
    }
    result['_hash'] = hash.toString(16);
  }

  if (options.addSource) {
    result['_source'] = options.addSource;
  }

  if (options.prefix) {
    result.path = options.prefix + result.path;
  }

  return result;
}

export function enrichEndpoints(
  endpoints: EnrichedEndpoint[],
  options: EnrichOptions = {}
): EnrichedEndpoint[] {
  return endpoints.map((ep) => enrichEndpoint(ep, options));
}

export function parseEnrichArgs(argv: string[]): EnrichOptions {
  const options: EnrichOptions = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--timestamp') options.addTimestamp = true;
    if (argv[i] === '--hash') options.addHash = true;
    if (argv[i] === '--source' && argv[i + 1]) options.addSource = argv[++i];
    if (argv[i] === '--prefix' && argv[i + 1]) options.prefix = argv[++i];
  }
  return options;
}
