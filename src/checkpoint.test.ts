import {
  parseCheckpointArgs,
  buildCheckpoint,
  isExpired,
  findLatestCheckpoint,
  formatCheckpointSummary,
  Checkpoint,
} from './checkpoint';

describe('parseCheckpointArgs', () => {
  it('returns empty options for empty args', () => {
    expect(parseCheckpointArgs({})).toEqual({});
  });

  it('parses label', () => {
    expect(parseCheckpointArgs({ label: 'v1' })).toEqual({ label: 'v1' });
  });

  it('parses maxAge from camelCase', () => {
    expect(parseCheckpointArgs({ maxAge: 300 })).toEqual({ maxAge: 300 });
  });

  it('parses maxAge from kebab-case', () => {
    expect(parseCheckpointArgs({ 'max-age': 600 })).toEqual({ maxAge: 600 });
  });
});

describe('buildCheckpoint', () => {
  it('creates a checkpoint with expected fields', () => {
    const cp = buildCheckpoint('snapshot-001.json', { label: 'baseline' });
    expect(cp.snapshotFile).toBe('snapshot-001.json');
    expect(cp.label).toBe('baseline');
    expect(cp.name).toMatch(/^checkpoint-\d+$/);
    expect(typeof cp.timestamp).toBe('number');
  });

  it('creates checkpoint without label', () => {
    const cp = buildCheckpoint('snapshot-002.json');
    expect(cp.label).toBeUndefined();
  });
});

describe('isExpired', () => {
  it('returns false for a fresh checkpoint', () => {
    const cp: Checkpoint = {
      name: 'checkpoint-1',
      timestamp: Date.now(),
      snapshotFile: 'snap.json',
    };
    expect(isExpired(cp, 3600)).toBe(false);
  });

  it('returns true for an old checkpoint', () => {
    const cp: Checkpoint = {
      name: 'checkpoint-old',
      timestamp: Date.now() - 7200 * 1000,
      snapshotFile: 'snap.json',
    };
    expect(isExpired(cp, 3600)).toBe(true);
  });
});

describe('findLatestCheckpoint', () => {
  const now = Date.now();
  const checkpoints: Checkpoint[] = [
    { name: 'cp-1', timestamp: now - 5000, snapshotFile: 'a.json' },
    { name: 'cp-2', timestamp: now - 1000, snapshotFile: 'b.json' },
    { name: 'cp-3', timestamp: now - 9000, snapshotFile: 'c.json' },
  ];

  it('returns the most recent checkpoint without maxAge', async () => {
    const result = await findLatestCheckpoint(checkpoints);
    expect(result?.name).toBe('cp-2');
  });

  it('filters expired checkpoints with maxAge', async () => {
    const result = await findLatestCheckpoint(checkpoints, { maxAge: 3 });
    expect(result).toBeUndefined();
  });
});

describe('formatCheckpointSummary', () => {
  it('returns message when no checkpoints', () => {
    expect(formatCheckpointSummary([])).toBe('No checkpoints found.');
  });

  it('formats checkpoints with label', () => {
    const cp: Checkpoint = {
      name: 'checkpoint-1',
      label: 'release',
      timestamp: new Date('2024-01-01T00:00:00Z').getTime(),
      snapshotFile: 'snap.json',
    };
    const output = formatCheckpointSummary([cp]);
    expect(output).toContain('checkpoint-1');
    expect(output).toContain('[release]');
    expect(output).toContain('snap.json');
  });
});
