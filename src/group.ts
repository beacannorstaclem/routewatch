export type GroupField = 'method' | 'status' | 'tag' | 'host';

export interface GroupedEndpoints {
  [key: string]: import('./probe').probeResultToEndpoint extends (...args: any[]) => infer R ? R[] : any[];
}

import type { Endpoint } from './snapshot';

export function isGroupField(value: string): value is GroupField {
  return ['method', 'status', 'tag', 'host'].includes(value);
}

export function groupEndpoints(
  endpoints: Endpoint[],
  field: GroupField
): Record<string, Endpoint[]> {
  const groups: Record<string, Endpoint[]> = {};
  for (const ep of endpoints) {
    let key: string;
    switch (field) {
      case 'method':
        key = ep.method ?? 'UNKNOWN';
        break;
      case 'status':
        key = String(ep.status ?? 0);
        break;
      case 'tag':
        key = (ep.tags ?? []).join(',') || 'untagged';
        break;
      case 'host': {
        try {
          key = new URL(ep.url).hostname;
        } catch {
          key = 'unknown';
        }
        break;
      }
    }
    if (!groups[key]) groups[key] = [];
    groups[key].push(ep);
  }
  return groups;
}

export function parseGroupArgs(args: Record<string, unknown>): GroupField | undefined {
  const val = args['group'] ?? args['g'];
  if (typeof val === 'string' && isGroupField(val)) return val;
  return undefined;
}

export function formatGroupSummary(groups: Record<string, Endpoint[]>): string {
  return Object.entries(groups)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, eps]) => `  ${key}: ${eps.length} endpoint${eps.length !== 1 ? 's' : ''}`)
    .join('\n');
}
