import * as fs from 'fs';
import * as path from 'path';
import { RouteWatchPlugin, registerPlugin } from './plugin';

export interface PluginConfigEntry {
  path: string;
  options?: Record<string, unknown>;
}

export interface PluginConfig {
  plugins: PluginConfigEntry[];
}

export function parsePluginConfig(raw: unknown): PluginConfig {
  if (typeof raw !== 'object' || raw === null || !Array.isArray((raw as any).plugins)) {
    return { plugins: [] };
  }
  const entries = (raw as any).plugins.filter(
    (e: any) => typeof e === 'object' && typeof e.path === 'string'
  );
  return { plugins: entries };
}

export function loadPluginConfig(configPath: string): PluginConfig {
  if (!fs.existsSync(configPath)) return { plugins: [] };
  const raw = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  return parsePluginConfig(raw);
}

export async function loadAndRegisterPlugins(
  configPath: string,
  baseDir: string = process.cwd()
): Promise<string[]> {
  const config = loadPluginConfig(configPath);
  const loaded: string[] = [];
  for (const entry of config.plugins) {
    const resolved = path.resolve(baseDir, entry.path);
    const mod = await import(resolved);
    const plugin: RouteWatchPlugin = typeof mod.default === 'function'
      ? mod.default(entry.options ?? {})
      : mod.default;
    registerPlugin(plugin);
    loaded.push(plugin.name);
  }
  return loaded;
}
