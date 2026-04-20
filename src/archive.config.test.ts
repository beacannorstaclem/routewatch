import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import {
  parseArchiveConfig,
  loadArchiveConfig,
  archiveConfigToOptions,
  defaultArchiveDir,
} from './archive.config';

let tmpDir: string;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'archive-cfg-'));
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

describe('parseArchiveConfig', () => {
  it('parses all fields', () => {
    const result = parseArchiveConfig({ archiveDir: '/tmp/arch', compress: false, maxAge: 14, maxCount: 10 });
    expect(result).toEqual({ archiveDir: '/tmp/arch', compress: false, maxAge: 14, maxCount: 10 });
  });

  it('returns empty object for unknown keys', () => {
    expect(parseArchiveConfig({ foo: 123 })).toEqual({});
  });
});

describe('loadArchiveConfig', () => {
  it('returns empty config if file does not exist', () => {
    expect(loadArchiveConfig(path.join(tmpDir, 'nope.json'))).toEqual({});
  });

  it('loads and parses a config file', () => {
    const cfgPath = path.join(tmpDir, 'archive.config.json');
    fs.writeFileSync(cfgPath, JSON.stringify({ compress: true, maxCount: 5 }));
    expect(loadArchiveConfig(cfgPath)).toEqual({ compress: true, maxCount: 5 });
  });

  it('returns empty config on malformed JSON', () => {
    const cfgPath = path.join(tmpDir, 'bad.json');
    fs.writeFileSync(cfgPath, 'not-json');
    expect(loadArchiveConfig(cfgPath)).toEqual({});
  });
});

describe('archiveConfigToOptions', () => {
  it('maps config fields to options', () => {
    const opts = archiveConfigToOptions({ compress: false, maxAge: 7, maxCount: 3 });
    expect(opts).toEqual({ compress: false, maxAge: 7, maxCount: 3 });
  });

  it('omits undefined fields', () => {
    expect(archiveConfigToOptions({})).toEqual({});
  });
});

describe('defaultArchiveDir', () => {
  it('appends archive subdir to snapshots dir', () => {
    expect(defaultArchiveDir('/home/user/.routewatch/snapshots')).toBe(
      '/home/user/.routewatch/snapshots/archive'
    );
  });
});
