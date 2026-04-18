import { parseBaselineArgs, saveBaseline, loadBaseline, hasBaseline } from './baseline';
import { loadSnapshot, listSnapshots } from './storage';
import { diffSnapshots, isEmptyDiff } from './diff';
import { formatReport } from './report';

export async function runBaseline(subcommand: string, args: string[]): Promise<void> {
  const { tag } = parseBaselineArgs(args);

  if (subcommand === 'set') {
    const snapshots = await listSnapshots();
    if (snapshots.length === 0) {
      console.error('No snapshots found. Run a probe first.');
      process.exit(1);
    }
    const latest = snapshots[snapshots.length - 1];
    const snapshot = await loadSnapshot(latest);
    const result = await saveBaseline(snapshot, tag);
    console.log(`Baseline saved as: ${result.name}`);
    return;
  }

  if (subcommand === 'compare') {
    const baseline = await loadBaseline(tag);
    if (!baseline) {
      console.error('No baseline found. Run `baseline set` first.');
      process.exit(1);
    }
    const snapshots = await listSnapshots();
    if (snapshots.length === 0) {
      console.error('No snapshots found to compare against baseline.');
      process.exit(1);
    }
    const latest = snapshots[snapshots.length - 1];
    const current = await loadSnapshot(latest);
    const diff = diffSnapshots(baseline, current);
    if (isEmptyDiff(diff)) {
      console.log('No changes from baseline.');
    } else {
      console.log(formatReport(diff));
    }
    return;
  }

  if (subcommand === 'status') {
    const exists = await hasBaseline(tag);
    console.log(exists ? `Baseline exists${tag ? ` (tag: ${tag})` : ''}.` : 'No baseline set.');
    return;
  }

  console.error(`Unknown baseline subcommand: ${subcommand}`);
  process.exit(1);
}
