import fs from 'fs';
import path from 'path';
import { HookEvent, registerHook } from './hook';

export interface HookConfigEntry {
  event: HookEvent;
  module: string;
  id?: string;
}

export interface HookConfig {
  hooks: HookConfigEntry[];
}

const VALID_EVENTS: HookEvent[] = ['before-fetch', 'after-fetch', 'on-diff', 'on-alert'];

export function isHookEvent(value: string): value is HookEvent {
  return VALID_EVENTS.includes(value as HookEvent);
}

export function parseHookConfig(raw: unknown): HookConfig {
  if (!raw || typeof raw !== 'object' || !Array.isArray((raw as Record<string, unknown>).hooks)) {
    return { hooks: [] };
  }
  const entries = ((raw as Record<string, unknown>).hooks as unknown[]).filter(
    (e): e is HookConfigEntry =>
      typeof e === 'object' && e !== null &&
      isHookEvent((e as Record<string, string>).event) &&
      typeof (e as Record<string, string>).module === 'string'
  );
  return { hooks: entries };
}

export function loadHookConfig(configPath?: string): HookConfig {
  const file = configPath ?? path.resolve(process.cwd(), 'routewatch.hooks.json');
  if (!fs.existsSync(file)) return { hooks: [] };
  const raw = JSON.parse(fs.readFileSync(file, 'utf-8'));
  return parseHookConfig(raw);
}

export async function applyHookConfig(config: HookConfig): Promise<void> {
  for (const entry of config.hooks) {
    const mod = await import(path.resolve(process.cwd(), entry.module));
    if (typeof mod.default === 'function') {
      registerHook(entry.event, mod.default, entry.id);
    }
  }
}
