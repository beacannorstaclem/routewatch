import { parseWatchConfig } from './watch.config';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

describe('parseWatchConfig', () => {
  let tmpDir: string;
  let configPath: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'routewatch-'));
    configPath = path.join(tmpDir, 'watch.config.json');
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('parses a valid config file with required fields', () => {
    const raw = {
      interval: 60,
      endpoints: [
        { url: 'https://api.example.com/users', method: 'GET' },
        { url: 'https://api.example.com/posts', method: 'GET' },
      ],
    };
    fs.writeFileSync(configPath, JSON.stringify(raw));
    const config = parseWatchConfig(configPath);
    expect(config.interval).toBe(60);
    expect(config.endpoints).toHaveLength(2);
    expect(config.endpoints[0].url).toBe('https://api.example.com/users');
  });

  it('applies default method GET when method is omitted', () => {
    const raw = {
      interval: 30,
      endpoints: [{ url: 'https://api.example.com/items' }],
    };
    fs.writeFileSync(configPath, JSON.stringify(raw));
    const config = parseWatchConfig(configPath);
    expect(config.endpoints[0].method).toBe('GET');
  });

  it('throws when config file does not exist', () => {
    expect(() => parseWatchConfig('/nonexistent/path/watch.config.json')).toThrow();
  });

  it('throws when endpoints array is missing', () => {
    const raw = { interval: 30 };
    fs.writeFileSync(configPath, JSON.stringify(raw));
    expect(() => parseWatchConfig(configPath)).toThrow(/endpoints/);
  });

  it('throws when interval is not a positive number', () => {
    const raw = {
      interval: -5,
      endpoints: [{ url: 'https://api.example.com/users', method: 'GET' }],
    };
    fs.writeFileSync(configPath, JSON.stringify(raw));
    expect(() => parseWatchConfig(configPath)).toThrow(/interval/);
  });

  it('parses optional headers per endpoint', () => {
    const raw = {
      interval: 120,
      endpoints: [
        {
          url: 'https://api.example.com/secure',
          method: 'GET',
          headers: { Authorization: 'Bearer token123' },
        },
      ],
    };
    fs.writeFileSync(configPath, JSON.stringify(raw));
    const config = parseWatchConfig(configPath);
    expect(config.endpoints[0].headers).toEqual({ Authorization: 'Bearer token123' });
  });
});
