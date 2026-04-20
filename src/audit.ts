export interface AuditEntry {
  timestamp: string;
  command: string;
  args: Record<string, unknown>;
  result: 'success' | 'failure' | 'skipped';
  message?: string;
}

export interface AuditLog {
  entries: AuditEntry[];
}

export function createAuditEntry(
  command: string,
  args: Record<string, unknown>,
  result: AuditEntry['result'],
  message?: string
): AuditEntry {
  return {
    timestamp: new Date().toISOString(),
    command,
    args,
    result,
    message,
  };
}

export function formatAuditLog(log: AuditLog): string {
  if (log.entries.length === 0) return 'No audit entries.';
  return log.entries
    .map((e) => {
      const base = `[${e.timestamp}] ${e.command} — ${e.result.toUpperCase()}`;
      return e.message ? `${base}: ${e.message}` : base;
    })
    .join('\n');
}

export function parseAuditArgs(argv: string[]): { limit?: number; command?: string } {
  const opts: { limit?: number; command?: string } = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--limit' && argv[i + 1]) opts.limit = parseInt(argv[++i], 10);
    if (argv[i] === '--command' && argv[i + 1]) opts.command = argv[++i];
  }
  return opts;
}

export function filterAuditLog(
  log: AuditLog,
  opts: { limit?: number; command?: string }
): AuditLog {
  let entries = [...log.entries];
  if (opts.command) entries = entries.filter((e) => e.command === opts.command);
  if (opts.limit && opts.limit > 0) entries = entries.slice(-opts.limit);
  return { entries };
}
