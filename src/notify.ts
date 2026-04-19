import { Alert } from './alert';

export type NotifyChannel = 'console' | 'webhook' | 'file';

export interface NotifyConfig {
  channel: NotifyChannel;
  webhookUrl?: string;
  filePath?: string;
}

export function parseNotifyArgs(args: Record<string, unknown>): NotifyConfig {
  const channel = (args['notify-channel'] as NotifyChannel) ?? 'console';
  if (!isNotifyChannel(channel)) {
    throw new Error(`Invalid notify channel: ${channel}`);
  }
  return {
    channel,
    webhookUrl: args['notify-webhook'] as string | undefined,
    filePath: args['notify-file'] as string | undefined,
  };
}

export function isNotifyChannel(value: string): value is NotifyChannel {
  return ['console', 'webhook', 'file'].includes(value);
}

export async function sendNotification(
  alerts: Alert[],
  config: NotifyConfig
): Promise<void> {
  if (alerts.length === 0) return;
  switch (config.channel) {
    case 'console':
      for (const alert of alerts) {
        console.log(`[${alert.severity.toUpperCase()}] ${alert.message}`);
      }
      break;
    case 'webhook':
      if (!config.webhookUrl) throw new Error('webhookUrl required for webhook channel');
      await sendWebhook(config.webhookUrl, alerts);
      break;
    case 'file':
      if (!config.filePath) throw new Error('filePath required for file channel');
      await writeAlertsToFile(config.filePath, alerts);
      break;
  }
}

async function sendWebhook(url: string, alerts: Alert[]): Promise<void> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ alerts }),
  });
  if (!res.ok) throw new Error(`Webhook failed: ${res.status}`);
}

async function writeAlertsToFile(filePath: string, alerts: Alert[]): Promise<void> {
  const { writeFile } = await import('fs/promises');
  const lines = alerts.map(a => `[${a.severity.toUpperCase()}] ${a.message}`).join('\n');
  await writeFile(filePath, lines + '\n', { flag: 'a' });
}
