import { withRetry, parseRetryArgs, DEFAULT_RETRY_OPTIONS } from './retry';

describe('parseRetryArgs', () => {
  it('returns defaults for empty args', () => {
    expect(parseRetryArgs({})).toEqual(DEFAULT_RETRY_OPTIONS);
  });

  it('parses retry-attempts', () => {
    expect(parseRetryArgs({ 'retry-attempts': '5' }).maxAttempts).toBe(5);
  });

  it('parses retry-delay', () => {
    expect(parseRetryArgs({ 'retry-delay': '200' }).delayMs).toBe(200);
  });

  it('disables backoff when retry-backoff is false', () => {
    expect(parseRetryArgs({ 'retry-backoff': false }).backoff).toBe(false);
  });

  it('ignores invalid numbers', () => {
    const opts = parseRetryArgs({ 'retry-attempts': 'abc', 'retry-delay': 'xyz' });
    expect(opts.maxAttempts).toBe(DEFAULT_RETRY_OPTIONS.maxAttempts);
    expect(opts.delayMs).toBe(DEFAULT_RETRY_OPTIONS.delayMs);
  });
});

describe('withRetry', () => {
  it('resolves immediately on success', async () => {
    const fn = jest.fn().mockResolvedValue('ok');
    const result = await withRetry(fn, { maxAttempts: 3, delayMs: 0 });
    expect(result).toBe('ok');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('retries on failure and eventually resolves', async () => {
    const fn = jest.fn()
      .mockRejectedValueOnce(new Error('fail'))
      .mockResolvedValue('ok');
    const result = await withRetry(fn, { maxAttempts: 3, delayMs: 0 });
    expect(result).toBe('ok');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('throws after max attempts', async () => {
    const fn = jest.fn().mockRejectedValue(new Error('always fails'));
    await expect(withRetry(fn, { maxAttempts: 3, delayMs: 0 })).rejects.toThrow('always fails');
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('respects maxAttempts of 1', async () => {
    const fn = jest.fn().mockRejectedValue(new Error('fail'));
    await expect(withRetry(fn, { maxAttempts: 1, delayMs: 0 })).rejects.toThrow();
    expect(fn).toHaveBeenCalledTimes(1);
  });
});
