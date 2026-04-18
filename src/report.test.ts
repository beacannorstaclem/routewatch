import { formatReport, ReportOptions } from './report';
import { SnapshotDiff } from './diff';

const baseDiff: SnapshotDiff = {
  fromFile: 'snap-a.json',
  toFile: 'snap-b.json',
  added: [],
  removed: [],
  changed: [],
};

describe('formatReport', () => {
  it('returns JSON string when format is json', () => {
    const opts: ReportOptions = { format: 'json' };
    const result = formatReport(baseDiff, opts);
    const parsed = JSON.parse(result);
    expect(parsed.fromFile).toBe('snap-a.json');
  });

  it('shows no changes message when diff is empty', () => {
    const opts: ReportOptions = { format: 'text' };
    const result = formatReport(baseDiff, opts);
    expect(result).toContain('No changes detected.');
  });

  it('shows added endpoints', () => {
    const diff: SnapshotDiff = {
      ...baseDiff,
      added: [{ method: 'GET', path: '/users', statusCode: 200, responseTimeMs: 120, headers: {} }],
    };
    const result = formatReport(diff, { format: 'text' });
    expect(result).toContain('+ GET /users');
    expect(result).toContain('Added endpoints (1)');
  });

  it('shows removed endpoints', () => {
    const diff: SnapshotDiff = {
      ...baseDiff,
      removed: [{ method: 'DELETE', path: '/items/1', statusCode: 204, responseTimeMs: 80, headers: {} }],
    };
    const result = formatReport(diff, { format: 'text' });
    expect(result).toContain('- DELETE /items/1');
  });

  it('shows changed endpoints with field diffs', () => {
    const diff: SnapshotDiff = {
      ...baseDiff,
      changed: [{
        method: 'POST',
        path: '/login',
        changedFields: [{ field: 'statusCode', from: 200, to: 201 }],
      }],
    };
    const result = formatReport(diff, { format: 'text' });
    expect(result).toContain('~ POST /login');
    expect(result).toContain('statusCode');
    expect(result).toContain('200');
    expect(result).toContain('201');
  });

  it('includes file names in header', () => {
    const result = formatReport(baseDiff, { format: 'text' });
    expect(result).toContain('snap-a.json');
    expect(result).toContain('snap-b.json');
  });
});
