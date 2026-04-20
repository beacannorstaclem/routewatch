/**
 * resolve.ts — URL and base path resolution utilities for routewatch.
 * Handles combining base URLs with endpoint paths, variable substitution,
 * and normalization before fetch.
 */

export interface ResolveOptions {
  baseUrl?: string;
  variables?: Record<string, string>;
  trailingSlash?: boolean;
}

/**
 * Substitute {variable} placeholders in a string using the provided map.
 */
export function substituteVars(
  template: string,
  variables: Record<string, string>
): string {
  return template.replace(/\{([^}]+)\}/g, (match, key) => {
    return Object.prototype.hasOwnProperty.call(variables, key)
      ? variables[key]
      : match;
  });
}

/**
 * Join a base URL and a path segment, avoiding double slashes.
 */
export function joinUrl(base: string, path: string): string {
  const b = base.replace(/\/+$/, "");
  const p = path.replace(/^\/+/, "");
  return p ? `${b}/${p}` : b;
}

/**
 * Resolve a full URL from a path and options.
 * If path is already absolute, base is ignored.
 */
export function resolveUrl(
  path: string,
  options: ResolveOptions = {}
): string {
  const { baseUrl = "", variables = {}, trailingSlash = false } = options;

  // Substitute variables first
  let resolved = substituteVars(path, variables);

  // If not absolute, join with base
  if (!/^https?:\/\//i.test(resolved)) {
    if (!baseUrl) {
      throw new Error(
        `Cannot resolve relative path "${path}" without a baseUrl`
      );
    }
    resolved = joinUrl(substituteVars(baseUrl, variables), resolved);
  }

  // Normalize trailing slash (only on pathname, not query)
  try {
    const url = new URL(resolved);
    if (trailingSlash) {
      if (!url.pathname.endsWith("/")) url.pathname += "/";
    } else {
      url.pathname = url.pathname.replace(/\/+$/, "") || "/";
    }
    return url.toString();
  } catch {
    return resolved;
  }
}

/**
 * Parse --base-url and --var key=value args from argv.
 */
export function parseResolveArgs(argv: string[]): ResolveOptions {
  const options: ResolveOptions = { variables: {} };

  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--base-url" && argv[i + 1]) {
      options.baseUrl = argv[++i];
    } else if (argv[i] === "--var" && argv[i + 1]) {
      const [key, ...rest] = argv[++i].split("=");
      if (key) options.variables![key] = rest.join("=");
    } else if (argv[i] === "--trailing-slash") {
      options.trailingSlash = true;
    }
  }

  return options;
}
