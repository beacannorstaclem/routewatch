import * as cron from 'node-cron';
import { startWatch } from './watch';
import { parseWatchConfig } from './watch.config';
import { loadAlertConfig } from './alert.config';

export interface ScheduleEntry {
  configPath: string;
  cronExpression: string;
  task?: cron.ScheduledTask;
}

export function validateCron(expression: string): boolean {
  return cron.validate(expression);
}

export function scheduleWatch(entry: ScheduleEntry): cron.ScheduledTask {
  if (!validateCron(entry.cronExpression)) {
    throw new Error(`Invalid cron expression: "${entry.cronExpression}"`);
  }

  const task = cron.schedule(entry.cronExpression, async () => {
    try {
      const watchConfig = parseWatchConfig(entry.configPath);
      const alertConfig = loadAlertConfig(entry.configPath);
      await startWatch(watchConfig, alertConfig);
    } catch (err) {
      console.error(`[schedule] Error running watch for ${entry.configPath}:`, err);
    }
  });

  entry.task = task;
  return task;
}

export function stopSchedule(entry: ScheduleEntry): void {
  if (entry.task) {
    entry.task.stop();
    entry.task = undefined;
  }
}

export function parseScheduleArgs(args: string[]): ScheduleEntry {
  const configPath = args[0];
  const cronExpression = args.slice(1).join(' ');

  if (!configPath) {
    throw new Error('Missing config path argument');
  }
  if (!cronExpression) {
    throw new Error('Missing cron expression argument');
  }

  return { configPath, cronExpression };
}
