export type HookEvent = 'before-fetch' | 'after-fetch' | 'on-diff' | 'on-alert';

export type HookFn = (payload: unknown) => unknown | Promise<unknown>;

export interface Hook {
  event: HookEvent;
  fn: HookFn;
  id: string;
}

const registry: Hook[] = [];

export function registerHook(event: HookEvent, fn: HookFn, id?: string): string {
  const hookId = id ?? `${event}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  registry.push({ event, fn, id: hookId });
  return hookId;
}

export function unregisterHook(id: string): boolean {
  const idx = registry.findIndex(h => h.id === id);
  if (idx === -1) return false;
  registry.splice(idx, 1);
  return true;
}

export function listHooks(event?: HookEvent): Hook[] {
  return event ? registry.filter(h => h.event === event) : [...registry];
}

export async function runHooks(event: HookEvent, payload: unknown): Promise<unknown> {
  let current = payload;
  for (const hook of registry.filter(h => h.event === event)) {
    current = (await hook.fn(current)) ?? current;
  }
  return current;
}

export function clearHooks(): void {
  registry.length = 0;
}
