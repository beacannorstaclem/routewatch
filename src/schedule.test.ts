import { validateCron, parseScheduleArgs, scheduleWatch, stopSchedule } from './schedule';
import * as watch from './watch';
import * as watchConfig from './watch.config';
import * as alertConfig from './alert.config';

jest.mock('./watch');
jest.mock('./watch.config');
jest.mock('./alert.config');
jest.mock('node-cron', () => ({
  validate: (expr: string) => /^(\S+ ){4}\S+$/.test(expr) || expr === '* * * * *',
  schedule: jest.fn((_expr: string, cb: () => void) => ({
    stop: jest.fn(),
    _cb: cb,
  })),
}));

describe('validateCron', () => {
  it('returns true for valid expression', () => {
    expect(validateCron('* * * * *')).toBe(true);
  });

  it('returns false for invalid expression', () => {
    expect(validateCron('not-a-cron')).toBe(false);
  });
});

describe('parseScheduleArgs', () => {
  it('parses config path and cron expression', () => {
    const entry = parseScheduleArgs(['./watch.json', '0', '*', '*', '*', '*']);
    expect(entry.configPath).toBe('./watch.json');
    expect(entry.cronExpression).toBe('0 * * * *');
  });

  it('throws if config path is missing', () => {
    expect(() => parseScheduleArgs([])).toThrow('Missing config path');
  });

  it('throws if cron expression is missing', () => {
    expect(() => parseScheduleArgs(['./watch.json'])).toThrow('Missing cron expression');
  });
});

describe('scheduleWatch', () => {
  it('throws on invalid cron expression', () => {
    expect(() =>
      scheduleWatch({ configPath: './watch.json', cronExpression: 'bad-expr' })
    ).toThrow('Invalid cron expression');
  });

  it('returns a scheduled task for valid expression', () => {
    (watchConfig.parseWatchConfig as jest.Mock).mockReturnValue({});
    (alertConfig.loadAlertConfig as jest.Mock).mockReturnValue({});
    (watch.startWatch as jest.Mock).mockResolvedValue(undefined);

    const task = scheduleWatch({ configPath: './watch.json', cronExpression: '* * * * *' });
    expect(task).toBeDefined();
    expect(typeof task.stop).toBe('function');
  });
});

describe('stopSchedule', () => {
  it('stops and clears the task', () => {
    const mockStop = jest.fn();
    const entry = {
      configPath: './watch.json',
      cronExpression: '* * * * *',
      task: { stop: mockStop } as any,
    };
    stopSchedule(entry);
    expect(mockStop).toHaveBeenCalled();
    expect(entry.task).toBeUndefined();
  });

  it('does nothing if no task assigned', () => {
    const entry = { configPath: './watch.json', cronExpression: '* * * * *' };
    expect(() => stopSchedule(entry)).not.toThrow();
  });
});
