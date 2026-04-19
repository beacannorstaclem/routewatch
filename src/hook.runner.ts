import { loadHookConfig, applyHookConfig } from './hook.config';
import { runHooks, HookEvent } from './hook';

export async function initHooks(configPath?: string): Promise<void> {
  const config = loadHookConfig(configPath);
  await applyHookConfig(config);
}

export async function dispatchHook(event: HookEvent, payload: unknown): Promise<unknown> {
  try {
    return await runHooks(event, payload);
  } catch (err) {
    console.error(`[hook] Error in "${event}" hook:`, err);
    return payload;
  }
}
