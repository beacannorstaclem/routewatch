import {
  createAuditEntry,
  formatAuditLog,
  parseAuditArgs,
  filterAuditLog,
  type AuditLog,
} from './audit';
import { parseAuditConfig } from './audit.config';

describe('createAuditEntry', () => {
  it('creates an entry with correct fields', () => {
    const entry = createAuditEntry('snapshot', { url: 'http://a.com' }, 'success');
    expect(entry.command).toBe('snapshot');
    expect(entry.result).toBe('success');
    expect(entry.message).toBeUndefined();
    expect(entry.timestamp).toBeTruthy();
  });

  it('includes message when provided', () => {
    const entry = createAuditEntry('diff', {}, 'failure', 'error occurred');
    expect(entry.message).toBe('error occurred');
  });
});

describe('formatAuditLog', () => {
  it('returns placeholder for empty log', () => {
    expect(formatAuditLog({ entries: [] })).toBe('No audit entries.');
  });

  it('formats entries', () => {
    const entry = createAuditEntry('watch', {}, 'success');
    const out = formatAuditLog({ entries: [entry] });
    expect(out).toContain('watch');
    expect(out).toContain('SUCCESS');
  });
});

describe('parseAuditArgs', () => {
  it('parses --limit', () => {
    expect(parseAuditArgs(['--limit', '10'])).toEqual({ limit: 10 });
  });

  it('parses --command', () => {
    expect(parseAuditArgs(['--command', 'diff'])).toEqual({ command: 'diff' });
  });

  it('returns empty object for no args', () => {
    expect(parseAuditArgs([])).toEqual({});
  });
});

describe('filterAuditLog', () => {
  const log: AuditLog = {
    entries: [
      createAuditEntry('snapshot', {}, 'success'),
      createAuditEntry('diff', {}, 'failure'),
      createAuditEntry('snapshot', {}, 'skipped'),
    ],
  };

  it('filters by command', () => {
    const result = filterAuditLog(log, { command: 'diff' });
    expect(result.entries).toHaveLength(1);
    expect(result.entries[0].command).toBe('diff');
  });

  it('limits entries', () => {
    const result = filterAuditLog(log, { limit: 2 });
    expect(result.entries).toHaveLength(2);
  });
});

describe('parseAuditConfig', () => {
  it('applies defaults', () => {
    const cfg = parseAuditConfig({});
    expect(cfg.enabled).toBe(true);
    expect(cfg.maxEntries).toBe(500);
  });

  it('overrides with provided values', () => {
    const cfg = parseAuditConfig({ enabled: false, maxEntries: 100, filePath: '/tmp/audit.json' });
    expect(cfg.enabled).toBe(false);
    expect(cfg.maxEntries).toBe(100);
    expect(cfg.filePath).toBe('/tmp/audit.json');
  });
});
