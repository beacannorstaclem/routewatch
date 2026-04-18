import * as fs from "fs";
import * as path from "path";

export interface EnvConfig {
  vars: Record<string, string>;
}

export function loadEnvFile(filePath: string): Record<string, string> {
  if (!fs.existsSync(filePath)) return {};
  const lines = fs.readFileSync(filePath, "utf-8").split("\n");
  const vars: Record<string, string> = {};
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim().replace(/^"|"$/g, "");
    if (key) vars[key] = value;
  }
  return vars;
}

export function resolveEnvVars(
  input: string,
  vars: Record<string, string>
): string {
  return input.replace(/\$\{([^}]+)\}|\$([A-Z_][A-Z0-9_]*)/g, (_, a, b) => {
    const key = a || b;
    return vars[key] ?? process.env[key] ?? "";
  });
}

export function parseEnvArgs(args: string[]): EnvConfig {
  const vars: Record<string, string> = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--env-file" && args[i + 1]) {
      const loaded = loadEnvFile(path.resolve(args[++i]));
      Object.assign(vars, loaded);
    } else if (args[i].startsWith("--env=")) {
      const pair = args[i].slice(6);
      const eq = pair.indexOf("=");
      if (eq !== -1) vars[pair.slice(0, eq)] = pair.slice(eq + 1);
    }
  }
  return { vars };
}
