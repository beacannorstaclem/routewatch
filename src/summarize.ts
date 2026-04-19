import type { Snapshot } from './snapshot';

export interface EndpointSummary {
  total: number;
  byMethod: Record<string, number>;
  byStatus: Record<string, number>;
  avgResponseTime: number | null;
  urls: string[];
}

export function summarizeSnapshot(snapshot: Snapshot): EndpointSummary {
  const endpoints = snapshot.endpoints ?? [];
  const byMethod: Record<string, number> = {};
  const byStatus: Record<string, number> = {};
  let totalTime = 0;
  let timeCount = 0;

  for (const ep of endpoints) {
    const method = ep.method?.toUpperCase() ?? 'UNKNOWN';
    byMethod[method] = (byMethod[method] ?? 0) + 1;

    const status = ep.status != null ? String(ep.status) : 'UNKNOWN';
    byStatus[status] = (byStatus[status] ?? 0) + 1;

    if (typeof ep.responseTime === 'number') {
      totalTime += ep.responseTime;
      timeCount++;
    }
  }

  return {
    total: endpoints.length,
    byMethod,
    byStatus,
    avgResponseTime: timeCount > 0 ? Math.round(totalTime / timeCount) : null,
    urls: endpoints.map((ep) => ep.url),
  };
}

export function formatSummary(summary: EndpointSummary): string {
  const lines: string[] = [];
  lines.push(`Total endpoints: ${summary.total}`);

  lines.push('By method:');
  for (const [method, count] of Object.entries(summary.byMethod)) {
    lines.push(`  ${method}: ${count}`);
  }

  lines.push('By status:');
  for (const [status, count] of Object.entries(summary.byStatus)) {
    lines.push(`  ${status}: ${count}`);
  }

  if (summary.avgResponseTime !== null) {
    lines.push(`Avg response time: ${summary.avgResponseTime}ms`);
  }

  return lines.join('\n');
}
