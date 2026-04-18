import * as fs from "fs";
import * as path from "path";
import { loadEnvFile, EnvConfig } from "./env";

const DEFAULT_ENV_FILES = [".env", ".env.local"];

export function loadDefaultEnvFiles(cwd: string = process.cwd()): EnvConfig {
  const vars: Record<string, string> = {};
  for (const file of DEFAULT_ENV_FILES) {
    const full = path.join(cwd, file);
    if (fs.existsSync(full)) {
      Object.assign(vars, loadEnvFile(full));
    }
  }
  return { vars };
}

export function mergeEnvConfigs(...configs: EnvConfig[]): EnvConfig {
  const vars: Record<string, string> = {};
  for (const cfg of configs) {
    Object.assign(vars, cfg.vars);
  }
  return { vars };
}

export function envConfigToRecord(config: EnvConfig): Record<string, string> {
  return { ...config.vars };
}

export function validateEnvConfig(
  config: EnvConfig,
  required: string[]
): string[] {
  return required.filter((key) => !config.vars[key]);
}
