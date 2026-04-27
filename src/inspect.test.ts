import {
  parseInspectArgs,
  inspectEndpoint,
  inspectEndpoints,
  formatInspectOutput,
  type InspectOptions,
} from './inspect';
import type { Endpoint } from './index';

const ep = (method: string, path: string, status: number): Endpoint =>
  ({ method, path, status } as Endpoint);

describe('parseInspectArgs', () => {
  it('parses fields as comma-separated string', () => {
    const opts = parseInspectArgs({ fields: 'method,path' });
    expect(opts.fields).toEqual(['method', 'path']);
  });

  it('parses fields as array', () => {
    const opts = parseInspectArgs({ fields: ['status', 'path'] });
    expect(opts.fields).toEqual(['status', 'path']);
  });

  it('parses verbose flag', () => {
    expect(parseInspectArgs({ verbose: true }).verbose).toBe(true);
    expect(parseInspectArgs({ verbose: 'true' }).verbose).toBe(true);
    expect(parseInspectArgs({ verbose: false }).verbose).toBe(false);
  });

  it('parses show-meta flag', () => {
    expect(parseInspectArgs({ 'show-meta': true }).showMeta).toBe(true);
  });

  it('returns empty options for missing args', () => {
    const opts = parseInspectArgs({});
    expect(opts.fields).toBeUndefined();
    expect(opts.verbose).toBe(false);
  });
});

describe('inspectEndpoint', () => {
  it('returns base fields by default', () => {
    const result = inspectEndpoint(ep('GET', '/users', 200));
    expect(result.fields).toEqual({ method: 'GET', path: '/users', status: 200 });
  });

  it('filters to requested fields', () => {
    const result = inspectEndpoint(ep('GET', '/users', 200), { fields: ['method', 'status'] });
    expect(result.fields).toEqual({ method: 'GET', status: 200 });
    expect(result.fields['path']).toBeUndefined();
  });

  it('includes headers when verbose', () => {
    const endpoint = { ...ep('POST', '/items', 201), headers: { 'content-type': 'application/json' } } as Endpoint;
    const result = inspectEndpoint(endpoint, { verbose: true });
    expect(result.fields['headers']).toEqual({ 'content-type': 'application/json' });
  });

  it('formats summary correctly', () => {
    const result = inspectEndpoint(ep('DELETE', '/items/1', 204));
    expect(result.summary).toBe('DELETE /items/1 → 204');
  });
});

describe('inspectEndpoints', () => {
  it('maps over multiple endpoints', () => {
    const eps = [ep('GET', '/a', 200), ep('POST', '/b', 201)];
    const results = inspectEndpoints(eps);
    expect(results).toHaveLength(2);
    expect(results[0].summary).toBe('GET /a → 200');
    expect(results[1].summary).toBe('POST /b → 201');
  });
});

describe('formatInspectOutput', () => {
  it('formats results to string', () => {
    const results = inspectEndpoints([ep('GET', '/ping', 200)]);
    const output = formatInspectOutput(results);
    expect(output).toContain('GET /ping → 200');
  });

  it('returns empty string for no results', () => {
    expect(formatInspectOutput([])).toBe('');
  });
});
