import { Diff } from './diff';

export type AlertSeverity = 'info' | 'warning' | 'critical';

export interface Alert {
  severity: AlertSeverity;
  message: string;
  endpoint?: string;
  timestamp: string;
}

export interface AlertConfig {
  onRemoved?: AlertSeverity;
  onAdded?: AlertSeverity;
  onStatusChange?: AlertSeverity;
  onBodyChange?: AlertSeverity;
}

const DEFAULT_CONFIG: AlertConfig = {
  onRemoved: 'critical',
  onAdded: 'info',
  onStatusChange: 'warning',
  onBodyChange: 'info',
};

export function generateAlerts(diff: Diff, config: AlertConfig = DEFAULT_CONFIG): Alert[] {
  const alerts: Alert[] = [];
  const timestamp = new Date().toISOString();

  for (const key of diff.removed) {
    if (config.onRemoved) {
      alerts.push({ severity: config.onRemoved, message: `Endpoint removed: ${key}`, endpoint: key, timestamp });
    }
  }

  for (const key of diff.added) {
    if (config.onAdded) {
      alerts.push({ severity: config.onAdded, message: `Endpoint added: ${key}`, endpoint: key, timestamp });
    }
  }

  for (const change of diff.changed) {
    if (change.statusChanged && config.onStatusChange) {
      alerts.push({ severity: config.onStatusChange, message: `Status changed for ${change.key}: ${change.before.status} -> ${change.after.status}`, endpoint: change.key, timestamp });
    }
    if (change.bodyChanged && config.onBodyChange) {
      alerts.push({ severity: config.onBodyChange, message: `Body changed for ${change.key}`, endpoint: change.key, timestamp });
    }
  }

  return alerts;
}

export function formatAlerts(alerts: Alert[]): string {
  if (alerts.length === 0) return 'No alerts.';
  return alerts.map(a => `[${a.severity.toUpperCase()}] ${a.timestamp} — ${a.message}`).join('\n');
}
