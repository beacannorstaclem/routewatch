import { readFile } from 'fs/promises';
import { isNotifyChannel, NotifyConfig } from './notify';

export function parseNotifyConfig(raw: Record<string, unknown>): NotifyConfig {
  const channel = raw['channel'];
  if (typeof channel !== 'string' || !isNotifyChannel(channel)) {
    throw new Error(`Invalid or missing notify channel: ${channel}`);
  }
  return {
    channel,
    webhookUrl: typeof raw['webhookUrl'] === 'string' ? raw['webhookUrl'] : undefined,
    filePath: typeof raw['filePath'] === 'string' ? raw['filePath'] : undefined,
  };
}

export async function loadNotifyConfig(configPath: string): Promise<NotifyConfig> {
  const raw = await readFile(configPath, 'utf-8');
  const parsed = JSON.parse(raw);
  return parseNotifyConfig(parsed);
}

export function defaultNotifyConfig(): NotifyConfig {
  return { channel: 'console' };
}
