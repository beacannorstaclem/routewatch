import {
  makePinKey,
  pinEndpoint,
  isPinned,
  removePin,
  formatPinList,
  parsePinArgs,
  PinEntry,
} from './pin';
import { Endpoint } from './index';

const endpoint: Endpoint = { method: 'GET', path: '/api/users', status: 200 };

describe('makePinKey', () => {
  it('formats method and path as key', () => {
    expect(makePinKey('get', '/api/users')).toBe('GET:/api/users');
  });

  it('uppercases method', () => {
    expect(makePinKey('post', '/items')).toBe('POST:/items');
  });
});

describe('pinEndpoint', () => {
  it('creates a pin entry from endpoint', () => {
    const entry = pinEndpoint(endpoint);
    expect(entry.key).toBe('GET:/api/users');
    expect(entry.method).toBe('GET');
    expect(entry.path).toBe('/api/users');
    expect(entry.note).toBeUndefined();
    expect(typeof entry.pinnedAt).toBe('string');
  });

  it('includes note when provided', () => {
    const entry = pinEndpoint(endpoint, { note: 'critical route' });
    expect(entry.note).toBe('critical route');
  });
});

describe('isPinned', () => {
  const pins: PinEntry[] = [
    { key: 'GET:/api/users', method: 'GET', path: '/api/users', pinnedAt: '2024-01-01T00:00:00.000Z' },
  ];

  it('returns true when endpoint is pinned', () => {
    expect(isPinned(pins, 'GET', '/api/users')).toBe(true);
  });

  it('returns false when endpoint is not pinned', () => {
    expect(isPinned(pins, 'POST', '/api/users')).toBe(false);
  });
});

describe('removePin', () => {
  it('removes a pin by method and path', () => {
    const pins: PinEntry[] = [
      { key: 'GET:/api/users', method: 'GET', path: '/api/users', pinnedAt: '2024-01-01T00:00:00.000Z' },
      { key: 'POST:/api/items', method: 'POST', path: '/api/items', pinnedAt: '2024-01-01T00:00:00.000Z' },
    ];
    const result = removePin(pins, 'GET', '/api/users');
    expect(result).toHaveLength(1);
    expect(result[0].key).toBe('POST:/api/items');
  });
});

describe('formatPinList', () => {
  it('returns message when no pins', () => {
    expect(formatPinList([])).toBe('No pinned endpoints.');
  });

  it('formats pins with method, path and timestamp', () => {
    const pins: PinEntry[] = [
      { key: 'GET:/api/users', method: 'GET', path: '/api/users', pinnedAt: '2024-01-01T00:00:00.000Z', note: 'important' },
    ];
    const output = formatPinList(pins);
    expect(output).toContain('GET');
    expect(output).toContain('/api/users');
    expect(output).toContain('important');
  });
});

describe('parsePinArgs', () => {
  it('extracts note from args', () => {
    expect(parsePinArgs({ note: 'my note' })).toEqual({ note: 'my note' });
  });

  it('returns empty options when no note', () => {
    expect(parsePinArgs({})).toEqual({ note: undefined });
  });
});
