import { parseAlertConfig } from './alert.config';

describe('parseAlertConfig', () => {
  it('parses valid config', () => {
    const config = parseAlertConfig({
      onRemoved: 'critical',
      onAdded: 'info',
      onStatusChange: 'warning',
      onBodyChange: 'info',
    });
    expect(config.onRemoved).toBe('critical');
    expect(config.onAdded).toBe('info');
    expect(config.onStatusChange).toBe('warning');
    expect(config.onBodyChange).toBe('info');
  });

  it('allows undefined/null fields', () => {
    const config = parseAlertConfig({ onRemoved: null, onAdded: undefined });
    expect(config.onRemoved).toBeUndefined();
    expect(config.onAdded).toBeUndefined();
  });

  it('throws on invalid severity value', () => {
    expect(() => parseAlertConfig({ onRemoved: 'extreme' })).toThrow('Invalid severity for onRemoved');
  });

  it('returns empty config for empty input', () => {
    const config = parseAlertConfig({});
    expect(config).toEqual({});
  });

  it('ignores extra unknown keys', () => {
    const config = parseAlertConfig({ onAdded: 'info', unknownKey: 'value' } as any);
    expect(config.onAdded).toBe('info');
  });
});
