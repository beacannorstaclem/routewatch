import { describe, it, expect } from 'vitest';
import {
  isPivotField,
  pivotEndpoints,
  formatPivotSummary,
  parsePivotArgs,
} from './pivot';
import type { Endpoint } from './index';

const eps: Endpoint[] = [
  { method: 'GET', path: '/users', status: 200, tag: 'users' } as Endpoint,
  { method: 'POST', path: '/users', status: 201, tag: 'users' } as Endpoint,
  { method: 'GET', path: '/posts', status: 200, tag: 'posts' } as Endpoint,
  { method: 'DELETE', path: '/posts/1', status: 204, tag: 'posts' } as Endpoint,
];

describe('isPivotField', () => {
  it('accepts valid fields', () => {
    expect(isPivotField('method')).toBe(true);
    expect(isPivotField('status')).toBe(true);
    expect(isPivotField('tag')).toBe(true);
    expect(isPivotField('namespace')).toBe(true);
  });

  it('rejects invalid fields', () => {
    expect(isPivotField('path')).toBe(false);
    expect(isPivotField('')).toBe(false);
    expect(isPivotField(42)).toBe(false);
  });
});

describe('pivotEndpoints', () => {
  it('pivots by method', () => {
    const result = pivotEndpoints(eps, { field: 'method' });
    expect(result.field).toBe('method');
    expect(result.total).toBe(4);
    const keys = result.rows.map((r) => r.key);
    expect(keys).toContain('GET');
    expect(keys).toContain('POST');
    expect(keys).toContain('DELETE');
  });

  it('pivots by tag', () => {
    const result = pivotEndpoints(eps, { field: 'tag' });
    expect(result.rows).toHaveLength(2);
    const users = result.rows.find((r) => r.key === 'users');
    expect(users?.count).toBe(2);
  });

  it('handles missing field values as (none)', () => {
    const data = [{ method: 'GET', path: '/x' } as Endpoint];
    const result = pivotEndpoints(data, { field: 'tag' });
    expect(result.rows[0].key).toBe('(none)');
  });

  it('sorts rows alphabetically by key', () => {
    const result = pivotEndpoints(eps, { field: 'method' });
    const keys = result.rows.map((r) => r.key);
    expect(keys).toEqual([...keys].sort());
  });
});

describe('formatPivotSummary', () => {
  it('formats a summary string', () => {
    const result = pivotEndpoints(eps, { field: 'method' });
    const summary = formatPivotSummary(result);
    expect(summary).toContain('Pivot by method');
    expect(summary).toContain('GET: 2');
    expect(summary).toContain('POST: 1');
  });
});

describe('parsePivotArgs', () => {
  it('parses field arg', () => {
    expect(parsePivotArgs({ field: 'status' }).field).toBe('status');
  });

  it('defaults to method', () => {
    expect(parsePivotArgs({}).field).toBe('method');
  });

  it('throws on invalid field', () => {
    expect(() => parsePivotArgs({ field: 'invalid' })).toThrow();
  });

  it('parses countOnly flag', () => {
    expect(parsePivotArgs({ 'count-only': true }).countOnly).toBe(true);
  });
});
