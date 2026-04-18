import { Snapshot } from './snapshot';
import { EndpointDiff } from './diff';

export type ExportFormat = 'json' | 'csv' | 'markdown';

export function exportSnapshot(snapshot: Snapshot, format: ExportFormat): string {
  switch (format) {
    case 'json':
      return JSON.stringify(snapshot, null, 2);
    case 'csv':
      return snapshotToCsv(snapshot);
    case 'markdown':
      return snapshotToMarkdown(snapshot);
    default:
      throw new Error(`Unsupported export format: ${format}`);
  }
}

export function exportDiff(diff: EndpointDiff, format: ExportFormat): string {
  switch (format) {
    case 'json':
      return JSON.stringify(diff, null, 2);
    case 'csv':
      return diffToCsv(diff);
    case 'markdown':
      return diffToMarkdown(diff);
    default:
      throw new Error(`Unsupported export format: ${format}`);
  }
}

function snapshotToCsv(snapshot: Snapshot): string {
  const lines = ['method,url,status,latency_ms'];
  for (const ep of snapshot.endpoints) {
    lines.push(`${ep.method},${ep.url},${ep.status},${ep.latencyMs}`);
  }
  return lines.join('\n');
}

function snapshotToMarkdown(snapshot: Snapshot): string {
  const lines = [
    `# Snapshot: ${snapshot.id}`,
    `**Created:** ${snapshot.createdAt}`,
    '',
    '| Method | URL | Status | Latency (ms) |',
    '|--------|-----|--------|--------------|',
  ];
  for (const ep of snapshot.endpoints) {
    lines.push(`| ${ep.method} | ${ep.url} | ${ep.status} | ${ep.latencyMs} |`);
  }
  return lines.join('\n');
}

function diffToCsv(diff: EndpointDiff): string {
  const lines = ['type,method,url,field,old_value,new_value'];
  for (const ep of diff.added) {
    lines.push(`added,${ep.method},${ep.url},,, `);
  }
  for (const ep of diff.removed) {
    lines.push(`removed,${ep.method},${ep.url},,,`);
  }
  for (const ch of diff.changed) {
    for (const [field, { from, to }] of Object.entries(ch.changes)) {
      lines.push(`changed,${ch.method},${ch.url},${field},${from},${to}`);
    }
  }
  return lines.join('\n');
}

function diffToMarkdown(diff: EndpointDiff): string {
  const lines = ['# Diff Report', ''];
  if (diff.added.length) {
    lines.push('## Added', ...diff.added.map(e => `- \`${e.method} ${e.url}\``), '');
  }
  if (diff.removed.length) {
    lines.push('## Removed', ...diff.removed.map(e => `- \`${e.method} ${e.url}\``), '');
  }
  if (diff.changed.length) {
    lines.push('## Changed');
    for (const ch of diff.changed) {
      lines.push(`### \`${ch.method} ${ch.url}\``);
      for (const [field, { from, to }] of Object.entries(ch.changes)) {
        lines.push(`- **${field}**: \`${from}\` → \`${to}\``);
      }
    }
  }
  return lines.join('\n');
}
