import { baselineName, parseBaselineArgs, BASELINE_PREFIX } from './baseline';
import * as storage from './storage';
import { saveBaseline, loadBaseline, hasBaseline } from './baseline';

const mockSnapshot = {
  timestamp: '2024-01-01T00:00:00Z',
  endpoints: [{ method: 'GET', path: '/health', status: 200, responseTime: 50, headers: {} }],
};

jest.mock('./storage', () => ({
  saveSnapshot: jest.fn().mockResolvedValue(undefined),
  loadSnapshot: jest.fn(),
}));

describe('baselineName', () => {
  it('returns default prefix without tag', () => {
    expect(baselineName()).toBe(BASELINE_PREFIX);
  });

  it('includes tag when provided', () => {
    expect(baselineName('v2')).toBe('baseline-v2');
  });
});

describe('parseBaselineArgs', () => {
  it('returns empty object when no args', () => {
    expect(parseBaselineArgs([])).toEqual({});
  });

  it('parses --tag argument', () => {
    expect(parseBaselineArgs(['--tag', 'v1'])).toEqual({ tag: 'v1' });
  });
});

describe('saveBaseline', () => {
  it('saves snapshot with baseline name', async () => {
    const result = await saveBaseline(mockSnapshot as any);
    expect(result.saved).toBe(true);
    expect(result.name).toBe(BASELINE_PREFIX);
    expect(storage.saveSnapshot).toHaveBeenCalledWith(mockSnapshot, BASELINE_PREFIX);
  });

  it('uses tag in name when provided', async () => {
    const result = await saveBaseline(mockSnapshot as any, 'prod');
    expect(result.name).toBe('baseline-prod');
  });
});

describe('loadBaseline', () => {
  it('returns null when snapshot not found', async () => {
    (storage.loadSnapshot as jest.Mock).mockRejectedValueOnce(new Error('not found'));
    const result = await loadBaseline();
    expect(result).toBeNull();
  });

  it('returns snapshot when found', async () => {
    (storage.loadSnapshot as jest.Mock).mockResolvedValueOnce(mockSnapshot);
    const result = await loadBaseline();
    expect(result).toEqual(mockSnapshot);
  });
});

describe('hasBaseline', () => {
  it('returns false when no baseline exists', async () => {
    (storage.loadSnapshot as jest.Mock).mockRejectedValueOnce(new Error());
    expect(await hasBaseline()).toBe(false);
  });

  it('returns true when baseline exists', async () => {
    (storage.loadSnapshot as jest.Mock).mockResolvedValueOnce(mockSnapshot);
    expect(await hasBaseline()).toBe(true);
  });
});
