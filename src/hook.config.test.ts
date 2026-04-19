import { parseHookConfig, isHookEvent } from './hook.config';

test('isHookEvent accepts valid events', () => {
  expect(isHookEvent('before-fetch')).toBe(true);
  expect(isHookEvent('after-fetch')).toBe(true);
  expect(isHookEvent('on-diff')).toBe(true);
  expect(isHookEvent('on-alert')).toBe(true);
});

test('isHookEvent rejects invalid events', () => {
  expect(isHookEvent('unknown')).toBe(false);
  expect(isHookEvent('')).toBe(false);
});

test('parseHookConfig returns empty hooks for null input', () => {
  expect(parseHookConfig(null)).toEqual({ hooks: [] });
});

test('parseHookConfig returns empty hooks for missing hooks array', () => {
  expect(parseHookConfig({})).toEqual({ hooks: [] });
});

test('parseHookConfig parses valid entries', () => {
  const raw = {
    hooks: [
      { event: 'before-fetch', module: './my-hook.js', id: 'h1' },
      { event: 'on-diff', module: './diff-hook.js' }
    ]
  };
  const config = parseHookConfig(raw);
  expect(config.hooks).toHaveLength(2);
  expect(config.hooks[0].id).toBe('h1');
  expect(config.hooks[1].event).toBe('on-diff');
});

test('parseHookConfig skips invalid entries', () => {
  const raw = {
    hooks: [
      { event: 'bad-event', module: './x.js' },
      { event: 'on-alert', module: './valid.js' },
      { event: 'after-fetch' }
    ]
  };
  const config = parseHookConfig(raw);
  expect(config.hooks).toHaveLength(1);
  expect(config.hooks[0].event).toBe('on-alert');
});
