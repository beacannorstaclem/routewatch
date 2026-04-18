import * as fs from 'fs';
import { parseTimeoutConfig, loadTimeoutConfig } from './timeout.config';
import { DEFAULT_TIMEOUT } from './timeout';

jest.mock('fs');
const mockedFs = fs as jest.Mocked<typeof fs>;

describe('parseTimeoutConfig', () => {
  it('returns empty for non-object', () => {
    expect(parseTimeoutConfig(null)).toEqual({});
    expect(parseTimeoutConfig('string')).toEqual({});
  });

  it('parses request and connect timeouts', () => {
    const result = parseTimeoutConfig({ timeout: { request: 2000, connect: 1000 } });
    expect(result).toEqual({ requestTimeout: 2000, connectTimeout: 1000 });
  });

  it('throws on invalid request timeout', () => {
    expect(() => parseTimeoutConfig({ timeout: { request: -5 } })).toThrow('Invalid timeout.request');
  });

  it('ignores missing fields', () => {
    expect(parseTimeoutConfig({ timeout: { request: 500 } })).toEqual({ requestTimeout: 500 });
  });
});

describe('loadTimeoutConfig', () => {
  afterEach(() => jest.resetAllMocks());

  it('returns defaults when file does not exist', () => {
    mockedFs.existsSync.mockReturnValue(false);
    expect(loadTimeoutConfig('/fake/path.json')).toEqual(DEFAULT_TIMEOUT);
  });

  it('merges file config with defaults', () => {
    mockedFs.existsSync.mockReturnValue(true);
    mockedFs.readFileSync.mockReturnValue(JSON.stringify({ timeout: { request: 7000 } }) as any);
    const result = loadTimeoutConfig('/fake/path.json');
    expect(result.requestTimeout).toBe(7000);
    expect(result.connectTimeout).toBe(DEFAULT_TIMEOUT.connectTimeout);
  });

  it('returns defaults on parse error', () => {
    mockedFs.existsSync.mockReturnValue(true);
    mockedFs.readFileSync.mockReturnValue('not json' as any);
    expect(loadTimeoutConfig('/fake/path.json')).toEqual(DEFAULT_TIMEOUT);
  });
});
