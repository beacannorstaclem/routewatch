import { mergeEndpoints, mergeSnapshots, formatMergeSummary, parseMergeArgs, endpointMergeKey } from './merge';
import { Endpoint, Snapshot } from './snapshot';

const ep = (method: string, url: string, status = 200): Endpoint => ({ method, url, status, headers: {}, body: null });

describe('endpointMergeKey', () => {
  it('combines method and url', () => {
    expect(endpointMergeKey(ep('GET', '/a'))).toBe('GET:/a');
  });
});

describe('mergeEndpoints', () => {
  it('merges without duplicates by default', () => {
    const left = [ep('GET', '/a'), ep('POST', '/b')];
    const right = [ep('GET', '/a'), ep('DELETE', '/c')];
    const result = mergeEndpoints(left, right);
    expect(result).toHaveLength(3);
  });

  it('prefers left by default', () => {
    const left = [ep('GET', '/a', 200)];
    const right = [ep('GET', '/a', 404)];
    const result = mergeEndpoints(left, right);
    expect(result[0].status).toBe(200);
  });

  it('prefers right when preferLeft=false', () => {
    const left = [ep('GET', '/a', 200)];
    const right = [ep('GET', '/a', 404)];
    const result = mergeEndpoints(left, right, { preferLeft: false });
    expect(result[0].status).toBe(404);
  });

  it('concatenates when dedupeByKey=false', () => {
    const left = [ep('GET', '/a')];
    const right = [ep('GET', '/a')];
    const result = mergeEndpoints(left, right, { dedupeByKey: false });
    expect(result).toHaveLength(2);
  });
});

describe('mergeSnapshots', () => {
  const makeSnap = (endpoints: Endpoint[]): Snapshot => ({
    timestamp: '2024-01-01T00:00:00.000Z',
    endpoints,
  });

  it('returns merged snapshot with new timestamp', () => {
    const left = makeSnap([ep('GET', '/a')]);
    const right = makeSnap([ep('POST', '/b')]);
    const result = mergeSnapshots(left, right);
    expect(result.endpoints).toHaveLength(2);
    expect(result.timestamp).not.toBe(left.timestamp);
  });
});

describe('formatMergeSummary', () => {
  it('formats summary string', () => {
    const left = [ep('GET', '/a')];
    const right = [ep('POST', '/b')];
    const merged = [ep('GET', '/a'), ep('POST', '/b')];
    const summary = formatMergeSummary(left, right, merged);
    expect(summary).toContain('Left: 1');
    expect(summary).toContain('Right: 2');
    expect(summary).toContain('Merged: 2');
  });
});

describe('parseMergeArgs', () => {
  it('defaults preferLeft and dedupe to true', () => {
    expect(parseMergeArgs({})).toEqual({ preferLeft: true, dedupeByKey: true });
  });

  it('respects prefer-left=false', () => {
    expect(parseMergeArgs({ 'prefer-left': false })).toMatchObject({ preferLeft: false });
  });
});
