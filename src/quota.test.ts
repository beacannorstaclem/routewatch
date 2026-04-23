import {
  parseQuotaArgs,
  checkQuota,
  resetQuota,
  clearAllQuotas,
  formatQuotaSummary,
} from './quota';

beforeEach(() => clearAllQuotas());

describe('parseQuotaArgs', () => {
  it('returns defaults when no args provided', () => {
    const opts = parseQuotaArgs({});
    expect(opts.maxRequests).toBe(100);
    expect(opts.windowMs).toBe(60_000);
    expect(opts.perHost).toBe(false);
  });

  it('parses numeric args', () => {
    const opts = parseQuotaArgs({ quotaMax: 10, quotaWindow: 5000 });
    expect(opts.maxRequests).toBe(10);
    expect(opts.windowMs).toBe(5000);
  });
});

describe('checkQuota', () => {
  const opts = { maxRequests: 3, windowMs: 60_000, perHost: false };

  it('allows requests under the limit', () => {
    const r1 = checkQuota('host-a', opts);
    expect(r1.allowed).toBe(true);
    expect(r1.remaining).toBe(2);
  });

  it('blocks requests over the limit', () => {
    checkQuota('host-b', opts);
    checkQuota('host-b', opts);
    checkQuota('host-b', opts);
    const r = checkQuota('host-b', opts);
    expect(r.allowed).toBe(false);
    expect(r.remaining).toBe(0);
  });

  it('resets after window expires', () => {
    const shortOpts = { maxRequests: 1, windowMs: 1, perHost: false };
    checkQuota('host-c', shortOpts);
    return new Promise<void>((resolve) =>
      setTimeout(() => {
        const r = checkQuota('host-c', shortOpts);
        expect(r.allowed).toBe(true);
        resolve();
      }, 10)
    );
  });

  it('tracks separate keys independently', () => {
    checkQuota('x', opts);
    checkQuota('x', opts);
    checkQuota('x', opts);
    const ry = checkQuota('y', opts);
    expect(ry.allowed).toBe(true);
  });
});

describe('resetQuota', () => {
  it('clears state for a key', () => {
    const opts = { maxRequests: 1, windowMs: 60_000, perHost: false };
    checkQuota('z', opts);
    resetQuota('z');
    const r = checkQuota('z', opts);
    expect(r.allowed).toBe(true);
  });
});

describe('formatQuotaSummary', () => {
  it('includes key and status in output', () => {
    const opts = { maxRequests: 5, windowMs: 60_000, perHost: false };
    const result = checkQuota('api.example.com', opts);
    const summary = formatQuotaSummary([{ key: 'api.example.com', result }]);
    expect(summary).toContain('api.example.com');
    expect(summary).toContain('allowed');
  });
});
