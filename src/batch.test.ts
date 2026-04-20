import { chunkArray, runBatch, formatBatchSummary, parseBatchArgs } from './batch';

describe('parseBatchArgs', () => {
  it('returns defaults for empty args', () => {
    expect(parseBatchArgs({})).toEqual({ size: 10, concurrency: 3 });
  });
  it('uses provided values', () => {
    expect(parseBatchArgs({ batchSize: 5, concurrency: 2 })).toEqual({ size: 5, concurrency: 2 });
  });
});

describe('chunkArray', () => {
  it('splits array into chunks', () => {
    expect(chunkArray([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
  });
  it('returns single chunk if size >= length', () => {
    expect(chunkArray([1, 2], 5)).toEqual([[1, 2]]);
  });
  it('returns empty for empty input', () => {
    expect(chunkArray([], 3)).toEqual([]);
  });
});

describe('runBatch', () => {
  it('processes all items successfully', async () => {
    const items = [1, 2, 3, 4, 5];
    const result = await runBatch(items, async (n) => n * 2, { size: 2, concurrency: 2 });
    expect(result.errors).toHaveLength(0);
    expect(result.results).toHaveLength(5);
  });

  it('captures errors without throwing', async () => {
    const items = [1, 2, 3];
    const result = await runBatch(
      items,
      async (n) => { if (n === 2) throw new Error('fail'); return n; },
      { size: 3, concurrency: 1 }
    );
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].error.message).toBe('fail');
    expect(result.results).toHaveLength(2);
  });
});

describe('formatBatchSummary', () => {
  it('formats summary correctly', () => {
    const summary = formatBatchSummary({ results: [1, 2, 3], errors: [{ index: 0, error: new Error('x') }] });
    expect(summary).toContain('3/4 succeeded');
    expect(summary).toContain('1 failed');
  });
});
