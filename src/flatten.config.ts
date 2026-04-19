import { FlattenOptions } from './flatten';

export function parseFlattenConfig(raw: unknown): FlattenOptions {
  if (!raw || typeof raw !== 'object') return {};
  const cfg = raw as Record<string, unknown>;
  const opts: FlattenOptions = {};
  if (typeof cfg['delimiter'] === 'string') {
    opts.delimiter = cfg['delimiter'];
  }
  if (typeof cfg['maxDepth'] === 'number') {
    opts.maxDepth = cfg['maxDepth'];
  }
  return opts;
}

export function loadFlattenConfig(config: Record<string, unknown>): FlattenOptions {
  return parseFlattenConfig(config['flatten'] ?? {});
}
