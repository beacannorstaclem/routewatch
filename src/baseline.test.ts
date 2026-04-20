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

  it('handles tag with special characters', () => {
    expect(baselineName('my-feature')).toBe('baseline-my-feature');
  });
});

describe('parseBaselineArgs', () => {
  it('returns empty object when no args', () => {
    expect(parseBaselineArgs([])).toEqual({});
  });

  it('parses --tag argument', () => {
    expect(parseBaselineArgs(['--tag', 'v1'])).toEqual({ tag: 'v1' });
  });

  it('ignores unknown arguments', () => {
    expect(parseBaselineArgs(['--unknown', 'value'])).toEqual({});
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

  it('calls saveSnapshot with tagged name', async () => {
    await saveBaseline(mockSnapshot as any, 'staging');
    expect(storage.saveSnapshot).toHaveBeenCalledWith(mockSnapshot, 'baseline-staging');
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

  it('loads baseline by tag when provided', async () => {
    (storage.loadSnapshot as jest.Mock).mockResolvedValueOnce(mockSnapshot);
    const result = await loadBaseline('prod');
    expect(result).toEqual(mockSnapshot);
    expect(storage.loadSnapshot).toHaveBeenCalledWith('baseline-prod');
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
