import { SnapshotDiff } from './diff';

export type ReportFormat = 'text' | 'json';

export interface ReportOptions {
  format: ReportFormat;
  color?: boolean;
}

const RESET = '\x1b[0m';
const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const BOLD = '\x1b[1m';

function colorize(text: string, code: string, enabled: boolean): string {
  return enabled ? `${code}${text}${RESET}` : text;
}

export function formatReport(diff: SnapshotDiff, options: ReportOptions): string {
  if (options.format === 'json') {
    return JSON.stringify(diff, null, 2);
  }

  const { color = false } = options;
  const lines: string[] = [];

  const header = `Snapshot diff: ${diff.fromFile} → ${diff.toFile}`;
  lines.push(colorize(header, BOLD, color));
  lines.push('');

  if (diff.added.length > 0) {
    lines.push(colorize(`Added endpoints (${diff.added.length}):`, GREEN, color));
    for (const ep of diff.added) {
      lines.push(colorize(`  + ${ep.method} ${ep.path}`, GREEN, color));
    }
    lines.push('');
  }

  if (diff.removed.length > 0) {
    lines.push(colorize(`Removed endpoints (${diff.removed.length}):`, RED, color));
    for (const ep of diff.removed) {
      lines.push(colorize(`  - ${ep.method} ${ep.path}`, RED, color));
    }
    lines.push('');
  }

  if (diff.changed.length > 0) {
    lines.push(colorize(`Changed endpoints (${diff.changed.length}):`, YELLOW, color));
    for (const ch of diff.changed) {
      lines.push(colorize(`  ~ ${ch.method} ${ch.path}`, YELLOW, color));
      for (const field of ch.changedFields) {
        lines.push(`      ${field.field}: ${JSON.stringify(field.from)} → ${JSON.stringify(field.to)}`);
      }
    }
    lines.push('');
  }

  if (diff.added.length === 0 && diff.removed.length === 0 && diff.changed.length === 0) {
    lines.push('No changes detected.');
  }

  return lines.join('\n');
}
