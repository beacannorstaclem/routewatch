export type MetricField = 'status' | 'latency' | 'size' | 'count';

export interface EndpointMetric {
  method: string;
  url: string;
  status: number;
  latencyMs: number;
  responseSize: number;
  timestamp: string;
}

export interface MetricSummary {
  totalRequests: number;
  avgLatencyMs: number;
  maxLatencyMs: number;
  minLatencyMs: number;
  statusCounts: Record<number, number>;
  avgResponseSize: number;
}

export function isMetricField(value: string): value is MetricField {
  return ['status', 'latency', 'size', 'count'].includes(value);
}

export function computeMetricSummary(metrics: EndpointMetric[]): MetricSummary {
  if (metrics.length === 0) {
    return { totalRequests: 0, avgLatencyMs: 0, maxLatencyMs: 0, minLatencyMs: 0, statusCounts: {}, avgResponseSize: 0 };
  }
  const latencies = metrics.map((m) => m.latencyMs);
  const sizes = metrics.map((m) => m.responseSize);
  const statusCounts: Record<number, number> = {};
  for (const m of metrics) {
    statusCounts[m.status] = (statusCounts[m.status] ?? 0) + 1;
  }
  return {
    totalRequests: metrics.length,
    avgLatencyMs: Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length),
    maxLatencyMs: Math.max(...latencies),
    minLatencyMs: Math.min(...latencies),
    statusCounts,
    avgResponseSize: Math.round(sizes.reduce((a, b) => a + b, 0) / sizes.length),
  };
}

export function parseMetricArgs(args: Record<string, unknown>): MetricField[] {
  const raw = args['metric'] ?? args['m'];
  if (!raw) return ['status', 'latency'];
  const fields = String(raw).split(',').map((s) => s.trim());
  return fields.filter(isMetricField) as MetricField[];
}

export function formatMetricSummary(summary: MetricSummary): string {
  const lines: string[] = [
    `Total Requests : ${summary.totalRequests}`,
    `Avg Latency    : ${summary.avgLatencyMs}ms`,
    `Min Latency    : ${summary.minLatencyMs}ms`,
    `Max Latency    : ${summary.maxLatencyMs}ms`,
    `Avg Size       : ${summary.avgResponseSize}B`,
    `Status Counts  : ${Object.entries(summary.statusCounts).map(([k, v]) => `${k}×${v}`).join(', ')}`,
  ];
  return lines.join('\n');
}
