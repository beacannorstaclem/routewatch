import { Endpoint } from './index';

export interface PinEntry {
  key: string;
  method: string;
  path: string;
  pinnedAt: string;
  note?: string;
}

export interface PinOptions {
  note?: string;
}

export function makePinKey(method: string, path: string): string {
  return `${method.toUpperCase()}:${path}`;
}

export function pinEndpoint(endpoint: Endpoint, options: PinOptions = {}): PinEntry {
  return {
    key: makePinKey(endpoint.method, endpoint.path),
    method: endpoint.method.toUpperCase(),
    path: endpoint.path,
    pinnedAt: new Date().toISOString(),
    note: options.note,
  };
}

export function isPinned(pins: PinEntry[], method: string, path: string): boolean {
  const key = makePinKey(method, path);
  return pins.some((p) => p.key === key);
}

export function removePin(pins: PinEntry[], method: string, path: string): PinEntry[] {
  const key = makePinKey(method, path);
  return pins.filter((p) => p.key !== key);
}

export function formatPinList(pins: PinEntry[]): string {
  if (pins.length === 0) return 'No pinned endpoints.';
  return pins
    .map((p) => {
      const note = p.note ? ` — ${p.note}` : '';
      return `  [${p.method}] ${p.path}  (pinned ${p.pinnedAt})${note}`;
    })
    .join('\n');
}

export function parsePinArgs(args: Record<string, unknown>): PinOptions {
  return {
    note: typeof args['note'] === 'string' ? args['note'] : undefined,
  };
}
