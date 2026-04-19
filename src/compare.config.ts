import { CompareField, CompareOptions, isCompareField, COMPARE_FIELDS } from './compare';

export interface CompareConfig {
  fields: CompareField[];
  ignoreKeys: string[];
  latencyThreshold: number;
}

export function parseCompareConfig(args: Record<string, unknown>): CompareConfig {
  const rawFields = args['compareFields'];
  let fields: CompareField[] = COMPARE_FIELDS;
  if (typeof rawFields === 'string') {
    fields = rawFields.split(',').map(f => f.trim()).filter(isCompareField);
  } else if (Array.isArray(rawFields)) {
    fields = rawFields.filter(isCompareField);
  }

  const rawIgnore = args['ignoreKeys'];
  let ignoreKeys: string[] = [];
  if (typeof rawIgnore === 'string') {
    ignoreKeys = rawIgnore.split(',').map(k => k.trim());
  } else if (Array.isArray(rawIgnore)) {
    ignoreKeys = rawIgnore.map(String);
  }

  const latencyThreshold = typeof args['latencyThreshold'] === 'number'
    ? args['latencyThreshold']
    : Number(args['latencyThreshold'] ?? 0);

  return { fields, ignoreKeys, latencyThreshold: isNaN(latencyThreshold) ? 0 : latencyThreshold };
}

export function loadCompareConfig(path: string): CompareConfig {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const raw = require(path);
    return parseCompareConfig(raw);
  } catch {
    return parseCompareConfig({});
  }
}

export function compareConfigToOptions(cfg: CompareConfig): CompareOptions {
  return {
    fields: cfg.fields,
    ignoreKeys: cfg.ignoreKeys,
    latencyThreshold: cfg.latencyThreshold,
  };
}
