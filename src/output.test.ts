import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import {
  parseOutputArgs,
  isOutputFormat,
  writeOutput,
  serializeJson,
  resolveOutputPath,
} from './output';

describe('isOutputFormat', () => {
  it('accepts valid formats', () => {
    expect(isOutputFormat('json')).toBe(true);
    expect(isOutputFormat('csv')).toBe(true);
    expect(isOutputFormat('markdown')).toBe(true);
  });

  it('rejects invalid formats', () => {
    expect(isOutputFormat('xml')).toBe(false);
    expect(isOutputFormat('')).toBe(false);
    expect(isOutputFormat(null)).toBe(false);
  });
});

describe('parseOutputArgs', () => {
  it('defaults to json format', () => {
    const opts = parseOutputArgs({});
    expect(opts.format).toBe('json');
  });

  it('parses format and file', () => {
    const opts = parseOutputArgs({ format: 'csv', output: 'out.csv', pretty: true });
    expect(opts.format).toBe('csv');
    expect(opts.file).toBe('out.csv');
    expect(opts.pretty).toBe(true);
  });

  it('throws on invalid format', () => {
    expect(() => parseOutputArgs({ format: 'yaml' })).toThrow('Invalid output format');
  });
});

describe('serializeJson', () => {
  it('produces compact json by default', () => {
    expect(serializeJson({ a: 1 })).toBe('{"a":1}');
  });

  it('produces pretty json when requested', () => {
    expect(serializeJson({ a: 1 }, true)).toBe('{\n  "a": 1\n}');
  });
});

describe('writeOutput', () => {
  it('writes to file when file option is set', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'rw-output-'));
    const file = path.join(tmpDir, 'result.json');
    writeOutput('{"ok":true}', { format: 'json', file });
    expect(fs.readFileSync(file, 'utf-8')).toBe('{"ok":true}');
    fs.rmSync(tmpDir, { recursive: true });
  });
});

describe('resolveOutputPath', () => {
  it('appends correct extension', () => {
    expect(resolveOutputPath('report', 'json')).toBe('report.json');
    expect(resolveOutputPath('report', 'csv')).toBe('report.csv');
    expect(resolveOutputPath('report', 'markdown')).toBe('report.md');
  });
});
