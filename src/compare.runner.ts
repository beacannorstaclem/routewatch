import { loadSnapshot } from './storage';
import { compareEndpoints, formatCompareResults, CompareOptions } from './compare';
import { endpointKey } from './diff';

export async function runCompare(
  snapshotA: string,
  snapshotB: string,
  options: CompareOptions
): Promise<string> {
  const snapA = await loadSnapshot(snapshotA);
  const snapB = await loadSnapshot(snapshotB);

  if (!snapA) throw new Error(`Snapshot not found: ${snapshotA}`);
  if (!snapB) throw new Error(`Snapshot not found: ${snapshotB}`);

  const mapB = new Map(snapB.endpoints.map(e => [endpointKey(e), e]));

  const results = [];
  for (const epA of snapA.endpoints) {
    const key = endpointKey(epA);
    const epB = mapB.get(key);
    if (!epB) continue;
    results.push(...compareEndpoints(epA, epB, options));
  }

  if (results.length === 0) return 'No matching endpoints to compare.';
  return formatCompareResults(results);
}
