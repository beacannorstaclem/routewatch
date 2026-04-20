import * as fs from 'fs';
import * as path from 'path';
import { parseChainConfig, loadChainConfig, chainConfigToOptions } from './chain.config';
import type { ChainStep } from './chain';

const mockStep: ChainStep['fn'] = (eps) => eps;

describe('parseChainConfig', () => {
  it('parses steps array', () => {
    const config = parseChainConfig({ steps: ['dedupe', 'sort'] });
    expect(config.steps).toEqual(['dedupe', 'sort']);
  });

  it('parses stopOnEmpty boolean', () => {
    const config = parseChainConfig({ stopOnEmpty: false });
    expect(config.stopOnEmpty).toBe(false);
  });

  it('ignores non-string step entries', () => {
    const config = parseChainConfig({ steps: ['dedupe', 42, null] });
    expect(config.steps).toEqual(['dedupe']);
  });

  it('returns empty config for unknown keys', () => {
    const config = parseChainConfig({ unknown: true });
    expect(config.steps).toBeUndefined();
    expect(config.stopOnEmpty).toBeUndefined();
  });
});

describe('loadChainConfig', () => {
  it('returns empty config when file does not exist', () => {
    const config = loadChainConfig('/nonexistent/chain.config.json');
    expect(config).toEqual({});
  });

  it('loads and parses a real config file', () => {
    const tmpFile = path.join(process.cwd(), '__chain_test_config__.json');
    fs.writeFileSync(tmpFile, JSON.stringify({ steps: ['sort'], stopOnEmpty: false }));
    try {
      const config = loadChainConfig(tmpFile);
      expect(config.steps).toEqual(['sort']);
      expect(config.stopOnEmpty).toBe(false);
    } finally {
      fs.unlinkSync(tmpFile);
    }
  });
});

describe('chainConfigToOptions', () => {
  it('maps step names to functions', () => {
    const available = { dedupe: mockStep, sort: mockStep };
    const opts = chainConfigToOptions({ steps: ['dedupe'] }, available);
    expect(opts.steps).toHaveLength(1);
    expect(opts.steps![0].name).toBe('dedupe');
  });

  it('skips unknown step names', () => {
    const available = { dedupe: mockStep };
    const opts = chainConfigToOptions({ steps: ['dedupe', 'unknown'] }, available);
    expect(opts.steps).toHaveLength(1);
  });

  it('defaults stopOnEmpty to true', () => {
    const opts = chainConfigToOptions({}, {});
    expect(opts.stopOnEmpty).toBe(true);
  });
});
