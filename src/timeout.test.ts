import { parseTimeoutArgs, mergeTimeoutConfig, applyTimeout, DEFAULT_TIMEOUT } from './timeout';

describe('parseTimeoutArgs', () => {
  it('returns empty object for empty args', () => {
    expect(parseTimeoutArgs({})).toEqual({});
  });

  it('parses timeout', () => {
    expect(parseTimeoutArgs({ timeout: '3000' })).toEqual({ requestTimeout: 3000 });
  });

  it('parses connect-timeout', () => {
    expect(parseTimeoutArgs({ 'connect-timeout': '1500' })).toEqual({ connectTimeout: 1500 });
  });

  it('throws on invalid timeout', () => {
    expect(() => parseTimeoutArgs({ timeout: 'abc' })).toThrow('Invalid timeout');
  });

  it('throws on non-positive timeout', () => {
    expect(() => parseTimeoutArgs({ timeout: '-1' })).toThrow('Invalid timeout');
  });
});

describe('mergeTimeoutConfig', () => {
  it('merges override into base', () => {
    const result = mergeTimeoutConfig(DEFAULT_TIMEOUT, { requestTimeout: 999 });
    expect(result.requestTimeout).toBe(999);
    expect(result.connectTimeout).toBe(DEFAULT_TIMEOUT.connectTimeout);
  });

  it('returns default when no override', () => {
    expect(mergeTimeoutConfig(DEFAULT_TIMEOUT, {})).toEqual(DEFAULT_TIMEOUT);
  });
});

describe('applyTimeout', () => {
  it('resolves when promise completes in time', async () => {
    const p = Promise.resolve(42);
    await expect(applyTimeout(p, 1000)).resolves.toBe(42);
  });

  it('rejects when promise exceeds timeout', async () => {
    const p = new Promise<never>((_, reject) => setTimeout(() => reject(new Error('late')), 200));
    await expect(applyTimeout(p, 50, 'Test')).rejects.toThrow('Test timed out after 50ms');
  });

  it('rejects with original error if promise rejects before timeout', async () => {
    const p = Promise.reject(new Error('boom'));
    await expect(applyTimeout(p, 1000)).rejects.toThrow('boom');
  });
});
