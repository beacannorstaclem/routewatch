import { loadSnapshot } from './storage';
import { replayAll, parseReplayArgs, formatReplaySummary } from './replay';
import { loadReplayConfig, replayConfigToOptions } from './replay.config';

export async function runReplay(
  snapshotName: string,
  args: Record<string, unknown> = {}
): Promise<void> {
  const snapshot = await loadSnapshot(snapshotName);
  if (!snapshot) {
    console.error(`Snapshot not found: ${snapshotName}`);
    process.exit(1);
  }

  const fileConfig = loadReplayConfig(
    typeof args['config'] === 'string' ? args['config'] : undefined
  );
  const argOptions = parseReplayArgs(args);
  const options = { ...replayConfigToOptions(fileConfig), ...argOptions };

  if (options.dryRun) {
    console.log(`[dry-run] Would replay ${snapshot.endpoints.length} endpoint(s) from "${snapshotName}"`);
  }

  const results = await replayAll(snapshot.endpoints, options);

  for (const r of results) {
    const label = r.skipped
      ? '[skip]'
      : r.ok
      ? '[ok]  '
      : '[fail]';
    const timing = r.skipped ? '' : ` (${r.durationMs}ms)`;
    console.log(`${label} ${r.endpoint.method} ${r.endpoint.url}${timing}`);
  }

  console.log();
  console.log(formatReplaySummary(results));

  const anyFailed = results.some((r) => !r.ok && !r.skipped);
  if (anyFailed) process.exit(1);
}
