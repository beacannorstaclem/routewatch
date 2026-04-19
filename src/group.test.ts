import { describe, it, expect } from 'vitest';
import { groupEndpoints, isGroupField, parseGroupArgs, formatGroupSummary } from './group';
import type { Endpoint } from './snapshot';

const endpoints: Endpoint[] = [
  { url: 'https://api.example.com/users', method: 'GET', status: 200, tags: ['users'] },
  { url: 'https://api.example.com/posts', method: 'GET', status: 404, tags: ['posts'] },
  { url: 'https://api.example.com/auth', method: 'POST', status: 200, tags: [] },
  { url: 'https://other.example.com/items', method: 'GET', status: 200, tags: ['users'] },
];

describe('isGroupField', () => {
  it('accepts valid fields', () => {
    expect(isGroupField('method')).toBe(true);
    expect(isGroupField('status')).toBe(true);
    expect(isGroupField('tag')).toBe(true);
    expect(isGroupField('host')).toBe(true);
  });
  it('rejects invalid fields', () => {
    expect(isGroupField('unknown')).toBe(false);
    expect(isGroupField('')).toBe(false);
  });
});

describe('groupEndpoints', () => {
  it('groups by method', () => {
    const result = groupEndpoints(endpoints, 'method');
    expect(result['GET']).toHaveLength(3);
    expect(result['POST']).toHaveLength(1);
  });

  it('groups by status', () => {
    const result = groupEndpoints(endpoints, 'status');
    expect(result['200']).toHaveLength(3);
    expect(result['404']).toHaveLength(1);
  });

  it('groups by host', () => {
    const result = groupEndpoints(endpoints, 'host');
    expect(result['api.example.com']).toHaveLength(3);
    expect(result['other.example.com']).toHaveLength(1);
  });

  it('groups by tag', () => {
    const result = groupEndpoints(endpoints, 'tag');
    expect(result['users']).toHaveLength(2);
    expect(result['posts']).toHaveLength(1);
    expect(result['untagged']).toHaveLength(1);
  });
});

describe('parseGroupArgs', () => {
  it('returns field from args', () => {
    expect(parseGroupArgs({ group: 'method' })).toBe('method');
    expect(parseGroupArgs({ g: 'status' })).toBe('status');
  });
  it('returns undefined for missing or invalid', () => {
    expect(parseGroupArgs({})).toBeUndefined();
    expect(parseGroupArgs({ group: 'invalid' })).toBeUndefined();
  });
});

describe('formatGroupSummary', () => {
  it('formats group summary', () => {
    const groups = groupEndpoints(endpoints, 'method');
    const summary = formatGroupSummary(groups);
    expect(summary).toContain('GET: 3 endpoints');
    expect(summary).toContain('POST: 1 endpoint');
  });
});
