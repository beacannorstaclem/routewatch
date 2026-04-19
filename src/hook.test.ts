import { registerHook, unregisterHook, listHooks, runHooks, clearHooks, HookEvent } from './hook';

beforeEach(() => clearHooks());

test('registerHook returns an id', () => {
  const id = registerHook('before-fetch', x => x);
  expect(typeof id).toBe('string');
});

test('registerHook uses provided id', () => {
  const id = registerHook('after-fetch', x => x, 'my-hook');
  expect(id).toBe('my-hook');
});

test('listHooks returns all hooks', () => {
  registerHook('before-fetch', x => x);
  registerHook('on-diff', x => x);
  expect(listHooks()).toHaveLength(2);
});

test('listHooks filters by event', () => {
  registerHook('before-fetch', x => x);
  registerHook('on-diff', x => x);
  expect(listHooks('before-fetch')).toHaveLength(1);
});

test('unregisterHook removes hook', () => {
  const id = registerHook('on-alert', x => x);
  expect(unregisterHook(id)).toBe(true);
  expect(listHooks()).toHaveLength(0);
});

test('unregisterHook returns false for unknown id', () => {
  expect(unregisterHook('nope')).toBe(false);
});

test('runHooks passes payload through chain', async () => {
  registerHook('before-fetch', (p: unknown) => ({ ...(p as object), a: 1 }));
  registerHook('before-fetch', (p: unknown) => ({ ...(p as object), b: 2 }));
  const result = await runHooks('before-fetch', {});
  expect(result).toEqual({ a: 1, b: 2 });
});

test('runHooks returns original payload if hook returns undefined', async () => {
  registerHook('after-fetch', () => undefined);
  const result = await runHooks('after-fetch', { status: 200 });
  expect(result).toEqual({ status: 200 });
});

test('runHooks with no hooks returns payload unchanged', async () => {
  const result = await runHooks('on-diff', { changed: true });
  expect(result).toEqual({ changed: true });
});
