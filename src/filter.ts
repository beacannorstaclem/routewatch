import { Endpoint } from './snapshot';

export interface FilterOptions {
  methods?: string[];
  statusCodes?: number[];
  pathPattern?: string;
  tags?: string[];
}

export function filterEndpoints(
  endpoints: Endpoint[],
  options: FilterOptions
): Endpoint[] {
  return endpoints.filter((ep) => {
    if (options.methods && options.methods.length > 0) {
      const methods = options.methods.map((m) => m.toUpperCase());
      if (!methods.includes(ep.method.toUpperCase())) return false;
    }

    if (options.statusCodes && options.statusCodes.length > 0) {
      if (!options.statusCodes.includes(ep.statusCode)) return false;
    }

    if (options.pathPattern) {
      const regex = new RegExp(options.pathPattern);
      if (!regex.test(ep.path)) return false;
    }

    if (options.tags && options.tags.length > 0) {
      const epTags: string[] = (ep as any).tags ?? [];
      const hasTag = options.tags.some((t) => epTags.includes(t));
      if (!hasTag) return false;
    }

    return true;
  });
}

export function parseFilterArgs(args: Record<string, unknown>): FilterOptions {
  const options: FilterOptions = {};

  if (args.method) {
    options.methods = String(args.method).split(',').map((m) => m.trim());
  }

  if (args.status) {
    options.statusCodes = String(args.status)
      .split(',')
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !isNaN(n));
  }

  if (args.path) {
    options.pathPattern = String(args.path);
  }

  if (args.tag) {
    options.tags = String(args.tag).split(',').map((t) => t.trim());
  }

  return options;
}
