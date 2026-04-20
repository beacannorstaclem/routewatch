export interface BatchOptions {
  size: number;
  concurrency: number;
}

export interface BatchResult<T> {
  results: T[];
  errors: Array<{ index: number; error: Error }>;
}

export function parseBatchArgs(args: Record<string, unknown>): BatchOptions {
  const size = typeof args.batchSize === 'number' ? args.batchSize : 10;
  const concurrency = typeof args.concurrency === 'number' ? args.concurrency : 3;
  return { size, concurrency };
}

export function chunkArray<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

export async function runBatch<T, R>(
  items: T[],
  fn: (item: T, index: number) => Promise<R>,
  options: BatchOptions
): Promise<BatchResult<R>> {
  const results: R[] = [];
  const errors: Array<{ index: number; error: Error }> = [];
  const chunks = chunkArray(items, options.size);

  for (const chunk of chunks) {
    const slots = chunkArray(chunk, Math.ceil(chunk.length / options.concurrency));
    const settled = await Promise.allSettled(
      slots.flat().map((item, i) => fn(item, i))
    );
    settled.forEach((res, i) => {
      if (res.status === 'fulfilled') {
        results.push(res.value);
      } else {
        errors.push({ index: i, error: res.reason instanceof Error ? res.reason : new Error(String(res.reason)) });
      }
    });
  }

  return { results, errors };
}

export function formatBatchSummary(result: BatchResult<unknown>): string {
  const total = result.results.length + result.errors.length;
  return `Batch complete: ${result.results.length}/${total} succeeded, ${result.errors.length} failed.`;
}
