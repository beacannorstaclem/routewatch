import { describe, it, expect, vi, beforeEach } from 'vitest';
import { parseNotifyArgs, isNotifyChannel, sendNotification } from './notify';
import type { Alert } from './alert';

const mockAlerts: Alert[] = [
  { severity: 'high', message: 'Status changed 200->500', endpoint: 'GET /api/users' },
  { severity: 'low', message: 'New field added', endpoint: 'GET /api/items' },
];

describe('isNotifyChannel', () => {
  it('accepts valid channels', () => {
    expect(isNotifyChannel('console')).toBe(true);
    expect(isNotifyChannel('webhook')).toBe(true);
    expect(isNotifyChannel('file')).toBe(true);
  });
  it('rejects invalid channels', () => {
    expect(isNotifyChannel('slack')).toBe(false);
  });
});

describe('parseNotifyArgs', () => {
  it('defaults to console channel', () => {
    expect(parseNotifyArgs({})).toEqual({ channel: 'console', webhookUrl: undefined, filePath: undefined });
  });
  it('parses webhook channel with url', () => {
    const result = parseNotifyArgs({ 'notify-channel': 'webhook', 'notify-webhook': 'http://example.com/hook' });
    expect(result.channel).toBe('webhook');
    expect(result.webhookUrl).toBe('http://example.com/hook');
  });
  it('throws on invalid channel', () => {
    expect(() => parseNotifyArgs({ 'notify-channel': 'slack' })).toThrow();
  });
});

describe('sendNotification', () => {
  it('does nothing when alerts are empty', async () => {
    const spy = vi.spyOn(console, 'log');
    await sendNotification([], { channel: 'console' });
    expect(spy).not.toHaveBeenCalled();
  });

  it('logs to console', async () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    await sendNotification(mockAlerts, { channel: 'console' });
    expect(spy).toHaveBeenCalledTimes(2);
    spy.mockRestore();
  });

  it('throws if webhook url missing', async () => {
    await expect(sendNotification(mockAlerts, { channel: 'webhook' })).rejects.toThrow('webhookUrl required');
  });

  it('throws if file path missing', async () => {
    await expect(sendNotification(mockAlerts, { channel: 'file' })).rejects.toThrow('filePath required');
  });
});
