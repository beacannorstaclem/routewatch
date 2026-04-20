import * as fs from 'fs';
import * as path from 'path';
import type { AuditEntry, AuditLog } from './audit';

const DEFAULT_AUDIT_FILE = path.resolve(process.cwd(), '.routewatch', 'audit.json');

export function getAuditFilePath(override?: string): string {
  return override ?? DEFAULT_AUDIT_FILE;
}

export function loadAuditLog(filePath?: string): AuditLog {
  const target = getAuditFilePath(filePath);
  if (!fs.existsSync(target)) return { entries: [] };
  try {
    return JSON.parse(fs.readFileSync(target, 'utf-8')) as AuditLog;
  } catch {
    return { entries: [] };
  }
}

export function saveAuditLog(log: AuditLog, filePath?: string): void {
  const target = getAuditFilePath(filePath);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, JSON.stringify(log, null, 2), 'utf-8');
}

export function appendAuditEntry(
  entry: AuditEntry,
  filePath?: string,
  maxEntries = 500
): AuditLog {
  const log = loadAuditLog(filePath);
  log.entries.push(entry);
  if (log.entries.length > maxEntries) {
    log.entries = log.entries.slice(log.entries.length - maxEntries);
  }
  saveAuditLog(log, filePath);
  return log;
}
