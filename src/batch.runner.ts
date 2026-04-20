import { runBatch, formatBatchSummary, parseBatchArgs, BatchOptions } from './batch';
import { loadBatchConfig, batchConfigToOptions } from './batch.config';

export async function resolveBatchOptions(
  args: Record<string, unknown>,
  configPath?: string
): Promise<BatchOptions> {
  const fileConfig = loadBatchConfig(configPath);
  const argOptions = parseBatchArgs(args);
  return {
    size: argOptions.size ?? fileConfig.size ?? 10,
    concurrency: argOptions.concurrency ?? fileConfig.concurrency ?? 3,
  };
}

export async function runBatchRunner<T, R>(
  items: T[],
  fn: (item: T, index: number) => Promise<R>,
  args: Record<string, unknown>,
  configPath?: string
): Promise<void> {
  const options = await resolveBatchOptions(args, configPath);
  const result = await runBatch(items, fn, options);
  console.log(formatBatchSummary(result));
  if (result.errors.length > 0) {
    for (const e of result.errors) {
      console.error(`  [${e.index}] ${e.error.message}`);
    }
  }
}
