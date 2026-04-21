import { computeMetricSummary, formatMetricSummary, parseMetricArgs } from './metric';
import { loadMetricConfig, mergeMetricConfigs, parseMetricConfig } from './metric.config';
import { loadMetrics, appendMetric, getMetricFilePath } from './metric.storage';
import * as path from 'path';

export interface MetricRunArgs {
  dir?: string;
  name?: string;
  configPath?: string;
  [key: string]: unknown;
}

export function runMetricSummary(args: MetricRunArgs): string {
  const dir = args.dir ?? '.routewatch/metrics';
  const name = args.name ?? 'default';
  const filePath = getMetricFilePath(dir, name);

  const baseConfig = loadMetricConfig(args.configPath);
  const overrideFields = parseMetricArgs(args);
  const config = mergeMetricConfigs(baseConfig, { fields: overrideFields.length ? overrideFields : undefined });

  const metrics = loadMetrics(filePath);
  if (metrics.length === 0) {
    return 'No metrics recorded.';
  }

  const summary = computeMetricSummary(metrics);
  return formatMetricSummary(summary);
}

export function recordMetric(
  dir: string,
  name: string,
  entry: Omit<import('./metric').EndpointMetric, 'timestamp'>
): void {
  const filePath = getMetricFilePath(dir, name);
  appendMetric(filePath, { ...entry, timestamp: new Date().toISOString() });
}
