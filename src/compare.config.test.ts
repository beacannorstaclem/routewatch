import { parseCompareConfig, compareConfigToOptions, COMPARE_FIELDS } from './compare.config';
import { COMPARE_FIELDS as CF } from './compare';

describe('parseCompareConfig', () => {
  it('defaults to all fields', () => {
    const cfg = parseCompareConfig({});
    expect(cfg.fields).toEqual(CF);
  });

  it('parses fields from comma string', () => {
    const cfg = parseCompareConfig({ compareFields: 'status,body' });
    expect(cfg.fields).toEqual(['status', 'body']);
  });

  it('filters invalid fields', () => {
    const cfg = parseCompareConfig({ compareFields: 'status,bogus' });
    expect(cfg.fields).toEqual(['status']);
  });

  it('parses ignoreKeys', () => {
    const cfg = parseCompareConfig({ ignoreKeys: 'ts,id' });
    expect(cfg.ignoreKeys).toEqual(['ts', 'id']);
  });

  it('parses latencyThreshold', () => {
    const cfg = parseCompareConfig({ latencyThreshold: 50 });
    expect(cfg.latencyThreshold).toBe(50);
  });

  it('handles NaN latencyThreshold', () => {
    const cfg = parseCompareConfig({ latencyThreshold: 'abc' });
    expect(cfg.latencyThreshold).toBe(0);
  });
});

describe('compareConfigToOptions', () => {
  it('maps config to options', () => {
    const cfg = parseCompareConfig({ compareFields: 'status', ignoreKeys: 'x', latencyThreshold: 10 });
    const opts = compareConfigToOptions(cfg);
    expect(opts.fields).toEqual(['status']);
    expect(opts.ignoreKeys).toEqual(['x']);
    expect(opts.latencyThreshold).toBe(10);
  });
});
