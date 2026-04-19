import { parseThrottleArgs, createThrottle, throttledMap, DEFAULT_THROTTLE } from './throttle';

describe('parseThrottleArgs', () => {
  it('returns defaults when no args', () => {
    expect(parseThrottleArgs({})).toEqual(DEFAULT_THROTTLE);
  });

  it('parses throttle-rps', () => {
    const cfg = parseThrottleArgs({ 'throttle-rps': '5' });
    expect(cfg.requestsPerSecond).toBe(5);
  });

  it('parses rps shorthand', () => {
    const cfg = parseThrottleArgs({ rps: 2 });
    expect(cfg.requestsPerSecond).toBe(2);
  });

  it('parses burst', () => {
    const cfg = parseThrottleArgs({ burst: '15' });
    expect(cfg.burstLimit).toBe(15);
  });
});

describe('createThrottle', () => {
  it('returns a function', () => {
    const throttle = createThrottle({ requestsPerSecond: 100 });
    expect(typeof throttle).toBe('function');
  });

  it('resolves without error', async () => {
    const throttle = createThrottle({ requestsPerSecond: 1000 });
    await expect(throttle()).resolves.toBeUndefined();
  });
});

describe('throttledMap', () => {
  it('maps all items', async () => {
    const items = [1, 2, 3];
    const results = await throttledMap(items, async (x) => x * 2, { requestsPerSecond: 100 });
    expect(results).toEqual([2, 4, 6]);
  });

  it('handles empty array', async () => {
    const results = await throttledMap([], async (x: number) => x, { requestsPerSecond: 10 });
    expect(results).toEqual([]);
  });

  it('propagates errors', async () => {
    await expect(
      throttledMap([1], async () => { throw new Error('fail'); }, { requestsPerSecond: 100 })
    ).rejects.toThrow('fail');
  });
});
