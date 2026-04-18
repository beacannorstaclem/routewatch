import { Endpoint } from './snapshot';
import { SnapshotDiff } from './diff';

export interface RouteWatchPlugin {
  name: string;
  onSnapshot?: (endpoints: Endpoint[]) => void | Promise<void>;
  onDiff?: (diff: SnapshotDiff) => void | Promise<void>;
}

const registry: RouteWatchPlugin[] = [];

export function registerPlugin(plugin: RouteWatchPlugin): void {
  if (registry.find(p => p.name === plugin.name)) {
    throw new Error(`Plugin "${plugin.name}" is already registered`);
  }
  registry.push(plugin);
}

export function unregisterPlugin(name: string): boolean {
  const idx = registry.findIndex(p => p.name === name);
  if (idx === -1) return false;
  registry.splice(idx, 1);
  return true;
}

export function listPlugins(): string[] {
  return registry.map(p => p.name);
}

export async function runSnapshotPlugins(endpoints: Endpoint[]): Promise<void> {
  for (const plugin of registry) {
    if (plugin.onSnapshot) {
      await plugin.onSnapshot(endpoints);
    }
  }
}

export async function runDiffPlugins(diff: SnapshotDiff): Promise<void> {
  for (const plugin of registry) {
    if (plugin.onDiff) {
      await plugin.onDiff(diff);
    }
  }
}

export function clearPlugins(): void {
  registry.length = 0;
}
