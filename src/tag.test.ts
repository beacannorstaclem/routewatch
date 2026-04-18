import { makeTagKey, isTagKey, tagFromKey, parseTagArgs } from './tag';

describe('makeTagKey', () => {
  it('prefixes tag with tag:', () => {
    expect(makeTagKey('stable')).toBe('tag:stable');
  });
});

describe('isTagKey', () => {
  it('returns true for tag keys', () => {
    expect(isTagKey('tag:stable')).toBe(true);
  });

  it('returns false for regular snapshot ids', () => {
    expect(isTagKey('2024-01-01T00:00:00Z')).toBe(false);
  });
});

describe('tagFromKey', () => {
  it('extracts tag name from key', () => {
    expect(tagFromKey('tag:stable')).toBe('stable');
  });

  it('handles hyphenated tags', () => {
    expect(tagFromKey('tag:pre-release')).toBe('pre-release');
  });
});

describe('parseTagArgs', () => {
  it('returns null when args are missing', () => {
    expect(parseTagArgs([])).toBeNull();
    expect(parseTagArgs(['only-one'])).toBeNull();
  });

  it('returns snapshotId and tag when both provided', () => {
    const result = parseTagArgs(['snap-123', 'stable']);
    expect(result).toEqual({ snapshotId: 'snap-123', tag: 'stable' });
  });

  it('throws on invalid tag name', () => {
    expect(() => parseTagArgs(['snap-123', 'bad tag!'])).toThrow('Invalid tag name');
  });

  it('accepts underscores and hyphens in tag', () => {
    const result = parseTagArgs(['snap-123', 'my_tag-1']);
    expect(result).toEqual({ snapshotId: 'snap-123', tag: 'my_tag-1' });
  });
});
