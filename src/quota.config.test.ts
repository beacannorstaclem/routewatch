import { parseQuotaConfig, mergeQuotaConfigs, quotaConfigToOptions } from './quota.config';

describe('parseQuotaConfig', () => {
  it('parses valid fields', () => {
    const cfg = parseQuotaConfig({ maxRequests: 50, windowMs: 30000, perHost: true });
    expect(cfg.maxRequests).toBe(50);
    expect(cfg.windowMs).toBe(30000);
    expect(cfg.perHost).toBe(true);
  });

  it('ignores invalid types', () => {
    const cfg = parseQuotaConfig({ maxRequests: 'bad', windowMs: null });
    expect(cfg.maxRequests).toBeUndefined();
    expect(cfg.windowMs).toBeUndefined();
  });

  it('returns empty config for empty input', () => {
    const cfg = parseQuotaConfig({});
    expect(cfg).toEqual({});
  });
});

describe('mergeQuotaConfigs', () => {
  it('override takes precedence', () => {
    const merged = mergeQuotaConfigs({ maxRequests: 10 }, { maxRequests: 20 });
    expect(merged.maxRequests).toBe(20);
  });

  it('base fills in missing override fields', () => {
    const merged = mergeQuotaConfigs({ maxRequests: 10, windowMs: 5000 }, { perHost: true });
    expect(merged.maxRequests).toBe(10);
    expect(merged.perHost).toBe(true);
  });
});

describe('quotaConfigToOptions', () => {
  it('applies defaults for missing fields', () => {
    const opts = quotaConfigToOptions({});
    expect(opts.maxRequests).toBe(100);
    expect(opts.windowMs).toBe(60_000);
    expect(opts.perHost).toBe(false);
  });

  it('uses provided values', () => {
    const opts = quotaConfigToOptions({ maxRequests: 25, windowMs: 10000, perHost: true });
    expect(opts.maxRequests).toBe(25);
    expect(opts.windowMs).toBe(10000);
    expect(opts.perHost).toBe(true);
  });
});
