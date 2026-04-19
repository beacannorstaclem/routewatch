import { describe, it, expect } from 'vitest';
import { parseNotifyConfig, defaultNotifyConfig } from './notify.config';

describe('parseNotifyConfig', () => {
  it('parses a valid console config', () => {
    const result = parseNotifyConfig({ channel: 'console' });
    expect(result).toEqual({ channel: 'console', webhookUrl: undefined, filePath: undefined });
  });

  it('parses a webhook config', () => {
    const result = parseNotifyConfig({ channel: 'webhook', webhookUrl: 'https://hooks.example.com/notify' });
    expect(result.channel).toBe('webhook');
    expect(result.webhookUrl).toBe('https://hooks.example.com/notify');
  });

  it('parses a file config', () => {
    const result = parseNotifyConfig({ channel: 'file', filePath: '/tmp/alerts.log' });
    expect(result.channel).toBe('file');
    expect(result.filePath).toBe('/tmp/alerts.log');
  });

  it('throws on missing channel', () => {
    expect(() => parseNotifyConfig({})).toThrow();
  });

  it('throws on invalid channel', () => {
    expect(() => parseNotifyConfig({ channel: 'email' })).toThrow();
  });
});

describe('defaultNotifyConfig', () => {
  it('returns console channel by default', () => {
    expect(defaultNotifyConfig()).toEqual({ channel: 'console' });
  });
});
