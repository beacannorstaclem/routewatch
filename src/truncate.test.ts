import { truncateString, truncateObject, applyTruncate, parseTruncateArgs } from './truncate';
import { parseTruncateConfig, loadTruncateConfig } from './truncate.config';

describe('truncateString', () => {
  it('returns string unchanged if within limit', () => {
    expect(truncateString('hello', { maxLength: 10 })).toBe('hello');
  });

  it('truncates and appends suffix', () => {
    expect(truncateString('hello world', { maxLength: 8, suffix: '...' })).toBe('hello...');
  });

  it('uses default suffix', () => {
    const result = truncateString('abcdefghij', { maxLength: 6, suffix: '...' });
    expect(result).toBe('abc...');
    expect(result.length).toBe(6);
  });
});

describe('truncateObject', () => {
  it('truncates specified fields', () => {
    const obj = { name: 'a very long name here', other: 'short' };
    const result = truncateObject(obj, ['name'], { maxLength: 10, suffix: '...' });
    expect(result['name']).toBe('a very ...');
    expect(result['other']).toBe('short');
  });

  it('ignores non-string fields', () => {
    const obj = { count: 42, label: 'hello world' };
    const result = truncateObject(obj as any, ['count', 'label'], { maxLength: 5, suffix: '..' });
    expect(result['count']).toBe(42);
    expect(result['label']).toBe('hel..');
  });
});

describe('applyTruncate', () => {
  it('applies to all string fields when no fields specified', () => {
    const obj = { a: 'longvalue123', b: 42 };
    const result = applyTruncate(obj as any, { maxLength: 8, suffix: '...' });
    expect(result['a']).toBe('longv...');
    expect(result['b']).toBe(42);
  });
});

describe('parseTruncateArgs', () => {
  it('parses truncate length from args', () => {
    const config = parseTruncateArgs({ truncate: 50, truncateSuffix: '--' });
    expect(config.maxLength).toBe(50);
    expect(config.suffix).toBe('--');
  });

  it('uses defaults for missing args', () => {
    const config = parseTruncateArgs({});
    expect(config.maxLength).toBe(100);
    expect(config.suffix).toBe('...');
  });
});

describe('parseTruncateConfig', () => {
  it('parses valid config object', () => {
    const config = parseTruncateConfig({ maxLength: 200, suffix: '~' });
    expect(config.maxLength).toBe(200);
    expect(config.suffix).toBe('~');
  });

  it('returns defaults for null input', () => {
    const config = parseTruncateConfig(null);
    expect(config.maxLength).toBe(100);
  });
});

describe('loadTruncateConfig', () => {
  it('loads truncate config from parent config', () => {
    const config = loadTruncateConfig({ truncate: { maxLength: 60, suffix: '>' } });
    expect(config.maxLength).toBe(60);
  });
});
