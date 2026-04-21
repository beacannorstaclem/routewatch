import { parseMetricConfig, loadMetricConfig, mergeMetricConfigs } from './metric.config';
import * as fs from 'fs';

jest.mock('fs');

const mockedFs = fs as jest.Mocked<typeof fs>;

describe('parseMetricConfig', () => {
  it('returns empty config for empty input', () => {
    const result = parseMetricConfig({});
    expect(result).toEqual({});
  });

  it('parses fields array', () => {
    const result = parseMetricConfig({ fields: ['status', 'latency'] });
    expect(result.fields).toEqual(['status', 'latency']);
  });

  it('parses enabled flag', () => {
    const result = parseMetricConfig({ enabled: true });
    expect(result.enabled).toBe(true);
  });

  it('parses aggregation strategy', () => {
    const result = parseMetricConfig({ aggregation: 'avg' });
    expect(result.aggregation).toBe('avg');
  });

  it('ignores unknown keys', () => {
    const result = parseMetricConfig({ unknown: 'value', fields: ['status'] });
    expect((result as Record<string, unknown>).unknown).toBeUndefined();
    expect(result.fields).toEqual(['status']);
  });
});

describe('loadMetricConfig', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('returns empty config when file does not exist', () => {
    mockedFs.existsSync.mockReturnValue(false);
    const result = loadMetricConfig('/nonexistent/path.json');
    expect(result).toEqual({});
  });

  it('loads and parses config from file', () => {
    mockedFs.existsSync.mockReturnValue(true);
    mockedFs.readFileSync.mockReturnValue(
      JSON.stringify({ fields: ['status'], enabled: true })
    );
    const result = loadMetricConfig('/some/path.json');
    expect(result.fields).toEqual(['status']);
    expect(result.enabled).toBe(true);
  });

  it('returns empty config on parse error', () => {
    mockedFs.existsSync.mockReturnValue(true);
    mockedFs.readFileSync.mockReturnValue('not valid json');
    const result = loadMetricConfig('/bad/path.json');
    expect(result).toEqual({});
  });
});

describe('mergeMetricConfigs', () => {
  it('returns base when override is empty', () => {
    const base = { fields: ['status'], enabled: true };
    const result = mergeMetricConfigs(base, {});
    expect(result).toEqual(base);
  });

  it('override takes precedence over base', () => {
    const base = { fields: ['status'], enabled: false, aggregation: 'sum' };
    const override = { enabled: true, aggregation: 'avg' };
    const result = mergeMetricConfigs(base, override);
    expect(result.enabled).toBe(true);
    expect(result.aggregation).toBe('avg');
    expect(result.fields).toEqual(['status']);
  });

  it('merges fields arrays by union', () => {
    const base = { fields: ['status', 'latency'] };
    const override = { fields: ['latency', 'method'] };
    const result = mergeMetricConfigs(base, override);
    expect(result.fields).toEqual(expect.arrayContaining(['status', 'latency', 'method']));
    expect(result.fields?.length).toBe(3);
  });

  it('handles both configs empty', () => {
    const result = mergeMetricConfigs({}, {});
    expect(result).toEqual({});
  });
});
