import * as fs from 'fs';
import * as path from 'path';
import { EndpointMetric } from './metric';

export function getMetricFilePath(dir: string, name: string): string {
  return path.join(dir, `${name}.metrics.json`);
}

export function loadMetrics(filePath: string): EndpointMetric[] {
  if (!fs.existsSync(filePath)) return [];
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw) as EndpointMetric[];
  } catch {
    return [];
  }
}

export function saveMetrics(filePath: string, metrics: EndpointMetric[]): void {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filePath, JSON.stringify(metrics, null, 2), 'utf-8');
}

export function appendMetric(filePath: string, entry: EndpointMetric): void {
  const existing = loadMetrics(filePath);
  existing.push(entry);
  saveMetrics(filePath, existing);
}

export function clearMetrics(filePath: string): void {
  saveMetrics(filePath, []);
}

export function filterMetricsByUrl(metrics: EndpointMetric[], url: string): EndpointMetric[] {
  return metrics.filter((m) => m.url === url);
}
