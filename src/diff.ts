import { SnapshotFile } from './snapshot';

export interface EndpointChange {
  type: 'added' | 'removed' | 'modified';
  method: string;
  path: string;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
}

export interface DiffResult {
  baseSnapshot: string;
  headSnapshot: string;
  changes: EndpointChange[];
  summary: {
    added: number;
    removed: number;
    modified: number;
  };
}

function endpointKey(method: string, path: string): string {
  return `${method.toUpperCase()} ${path}`;
}

export function diffSnapshots(base: SnapshotFile, head: SnapshotFile): DiffResult {
  const changes: EndpointChange[] = [];

  const baseMap = new Map<string, Record<string, unknown>>();
  const headMap = new Map<string, Record<string, unknown>>();

  for (const endpoint of base.endpoints) {
    baseMap.set(endpointKey(endpoint.method, endpoint.path), endpoint);
  }

  for (const endpoint of head.endpoints) {
    headMap.set(endpointKey(endpoint.method, endpoint.path), endpoint);
  }

  for (const [key, baseEndpoint] of baseMap) {
    const headEndpoint = headMap.get(key);
    if (!headEndpoint) {
      changes.push({ type: 'removed', method: baseEndpoint.method as string, path: baseEndpoint.path as string, before: baseEndpoint });
    } else if (JSON.stringify(baseEndpoint) !== JSON.stringify(headEndpoint)) {
      changes.push({ type: 'modified', method: baseEndpoint.method as string, path: baseEndpoint.path as string, before: baseEndpoint, after: headEndpoint });
    }
  }

  for (const [key, headEndpoint] of headMap) {
    if (!baseMap.has(key)) {
      changes.push({ type: 'added', method: headEndpoint.method as string, path: headEndpoint.path as string, after: headEndpoint });
    }
  }

  return {
    baseSnapshot: base.id,
    headSnapshot: head.id,
    changes,
    summary: {
      added: changes.filter(c => c.type === 'added').length,
      removed: changes.filter(c => c.type === 'removed').length,
      modified: changes.filter(c => c.type === 'modified').length,
    },
  };
}
