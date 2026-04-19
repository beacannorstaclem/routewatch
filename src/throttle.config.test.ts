import * as fs from 'fs';
import * as path from 'path';
import { parseThrottleConfig, loadThrottleConfig } from './throttle.config';
import { DEFAULT_THROTTLE } from './throttle';

jest.mock('fs');
const mockedFs = fs as jest.Mocked<typeof fs>;

describe('parseThrottleConfig', () => {
  it('returns defaults for null', () => {
    expect(parseThrottleConfig(null)).toEqual(DEFAULT_THROTTLE);
  });

  it('parses valid config', () => {
    const cfg = parseThrottleConfig({ requestsPerSecond: 5, burstLimit: 10 });
    expect(cfg.requestsPerSecond).toBe(5);
    expect(cfg.burstLimit).toBe(10);
  });

  it('falls back to defaults for invalid fields', () => {
    const cfg = parseThrottleConfig({ requestsPerSecond: 'bad' });
    expect(cfg.requestsPerSecond).toBe(DEFAULT_THROTTLE.requestsPerSecond);
  });
});

describe('loadThrottleConfig', () => {
  afterEach(() => jest.resetAllMocks());

  it('returns defaults when no config file', () => {
    mockedFs.existsSync.mockReturnValue(false);
    expect(loadThrottleConfig()).toEqual(DEFAULT_THROTTLE);
  });

  it('loads throttle from config file', () => {
    mockedFs.existsSync.mockReturnValue(true);
    mockedFs.readFileSync.mockReturnValue(
      JSON.stringify({ throttle: { requestsPerSecond: 3, burstLimit: 6 } })
    );
    const cfg = loadThrottleConfig('/fake/path.json');
    expect(cfg.requestsPerSecond).toBe(3);
    expect(cfg.burstLimit).toBe(6);
  });

  it('returns defaults when throttle key missing', () => {
    mockedFs.existsSync.mockReturnValue(true);
    mockedFs.readFileSync.mockReturnValue(JSON.stringify({ other: true }));
    expect(loadThrottleConfig('/fake/path.json')).toEqual(DEFAULT_THROTTLE);
  });
});
