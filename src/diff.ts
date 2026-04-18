import { Endpoint } from './probe';

export interface ChangedField {
  field: string;
  from: unknown;
  to: unknown;
}

export interface ChangedEndpoint {
  method: string;
  path: string;
  changedFields: ChangedField[];
}

export interface SnapshotDiff {
  fromFile: string;
  toFile: string;
  added: Endpoint[];
  removed: Endpoint[];
  changed: ChangedEndpoint[];
}

export function endpointKey(ep: Endpoint): string {
  return `${ep.method}:${ep.path}`;
}

export function diffSnapshots(
  fromEndpoints: Endpoint[],
  toEndpoints: Endpoint[],
  fromFile: string,
  toFile: string
): SnapshotDiff {
  const fromMap = new Map(fromEndpoints.map(ep => [endpointKey(ep), ep]));
  const toMap = new Map(toEndpoints.map(ep => [endpointKey(ep), ep]));

  const added: Endpoint[] = [];
  const removed: Endpoint[] = [];
  const changed: ChangedEndpoint[] = [];

  for (const [key, ep] of toMap) {
    if (!fromMap.has(key)) {
      added.push(ep);
    }
  }

  for (const [key, ep] of fromMap) {
    if (!toMap.has(key)) {
      removed.push(ep);
    } else {
      const toEp = toMap.get(key)!;
      const changedFields: ChangedField[] = [];
      const fields: (keyof Endpoint)[] = ['statusCode', 'headers'];
      for (const field of fields) {
        const fromVal = JSON.stringify(ep[field]);
        const toVal = JSON.stringify(toEp[field]);
        if (fromVal !== toVal) {
          changedFields.push({ field, from: ep[field], to: toEp[field] });
        }
      }
      if (changedFields.length > 0) {
        changed.push({ method: ep.method, path: ep.path, changedFields });
      }
    }
  }

  return { fromFile, toFile, added, removed, changed };
}

export function isEmptyDiff(diff: SnapshotDiff): boolean {
  return diff.added.length === 0 && diff.removed.length === 0 && diff.changed.length === 0;
}
