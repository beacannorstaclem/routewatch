import { diffSnapshots, isEmptyDiff } from './diff';
import { loadSnapshot } from './storage';
import { generateAlerts, formatAlerts, AlertConfig } from './alert';
import { loadAlertConfig } from './alert.config';
import * as path from 'path';

export interface AlertRunnerOptions {
  snapshotA: string;
  snapshotB: string;
  configPath?: string;
  silent?: boolean;
}

export async function runAlerts(options: AlertRunnerOptions): Promise<{ alerts: ReturnType<typeof generateAlerts>; output: string }> {
  const snapshotA = await loadSnapshot(options.snapshotA);
  const snapshotB = await loadSnapshot(options.snapshotB);

  const diff = diffSnapshots(snapshotA, snapshotB);

  let alertConfig: AlertConfig = {};
  if (options.configPath) {
    alertConfig = loadAlertConfig(path.resolve(options.configPath));
  }

  const alerts = generateAlerts(diff, alertConfig);
  const output = formatAlerts(alerts);

  if (!options.silent) {
    console.log(output);
  }

  const hasCritical = alerts.some(a => a.severity === 'critical');
  if (hasCritical) {
    process.exitCode = 1;
  }

  return { alerts, output };
}
