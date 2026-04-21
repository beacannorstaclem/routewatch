import { isMetricField, MetricField } from './metric';

export interface MetricConfig {
  fields: MetricField[];
  includeTimestamp: boolean;
  outputPath?: string;
}

export function parseMetricConfig(raw: Record<string, unknown>): MetricConfig {
  const fieldsRaw = raw['fields'];
  const fields: MetricField[] = Array.isArray(fieldsRaw)
    ? fieldsRaw.filter((f): f is MetricField => typeof f === 'string' && isMetricField(f))
    : ['status', 'latency'];

  const includeTimestamp =
    typeof raw['includeTimestamp'] === 'boolean' ? raw['includeTimestamp'] : true;

  const outputPath = typeof raw['outputPath'] === 'string' ? raw['outputPath'] : undefined;

  return { fields, includeTimestamp, outputPath };
}

export function loadMetricConfig(configPath?: string): MetricConfig {
  if (!configPath) return parseMetricConfig({});
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const raw = require(configPath) as Record<string, unknown>;
    return parseMetricConfig(raw['metric'] as Record<string, unknown> ?? {});
  } catch {
    return parseMetricConfig({});
  }
}

export function mergeMetricConfigs(base: MetricConfig, override: Partial<MetricConfig>): MetricConfig {
  return {
    fields: override.fields ?? base.fields,
    includeTimestamp: override.includeTimestamp ?? base.includeTimestamp,
    outputPath: override.outputPath ?? base.outputPath,
  };
}
