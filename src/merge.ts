import { Endpoint, Snapshot } from './snapshot';

export interface MergeOptions {
  preferLeft?: boolean;
  dedupeByKey?: boolean;
}

export function parseMergeArgs(args: Record<string, unknown>): MergeOptions {
  return {
    preferLeft: args['prefer-left'] !== false,
    dedupeByKey: args['dedupe'] !== false,
  };
}

export function endpointMergeKey(e: Endpoint): string {
  return `${e.method}:${e.url}`;
}

export function mergeEndpoints(
  left: Endpoint[],
  right: Endpoint[],
  options: MergeOptions = {}
): Endpoint[] {
  const { preferLeft = true, dedupeByKey = true } = options;

  if (!dedupeByKey) {
    return [...left, ...right];
  }

  const map = new Map<string, Endpoint>();

  const [primary, secondary] = preferLeft ? [right, left] : [left, right];

  for (const e of primary) {
    map.set(endpointMergeKey(e), e);
  }
  for (const e of secondary) {
    map.set(endpointMergeKey(e), e);
  }

  return Array.from(map.values());
}

export function mergeSnapshots(
  left: Snapshot,
  right: Snapshot,
  options: MergeOptions = {}
): Snapshot {
  return {
    ...left,
    endpoints: mergeEndpoints(left.endpoints, right.endpoints, options),
    timestamp: new Date().toISOString(),
  };
}

export function formatMergeSummary(
  left: Endpoint[],
  right: Endpoint[],
  merged: Endpoint[]
): string {
  const added = merged.length - left.length;
  return [
    `Left: ${left.length} endpoints`,
    `Right: ${right.length} endpoints`,
    `Merged: ${merged.length} endpoints`,
    added > 0 ? `(+${added} from right)` : '(no new endpoints added)',
  ].join('  |  ');
}
