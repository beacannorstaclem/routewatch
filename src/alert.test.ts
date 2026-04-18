import { generateAlerts, formatAlerts, Alert } from './alert';
import { Diff } from './diff';

const baseDiff: Diff = {
  added: [],
  removed: [],
  changed: [],
  unchanged: [],
};

describe('generateAlerts', () => {
  it('returns empty array for empty diff', () => {
    expect(generateAlerts(baseDiff)).toEqual([]);
  });

  it('generates critical alert for removed endpoint', () => {
    const diff: Diff = { ...baseDiff, removed: ['GET /users'] };
    const alerts = generateAlerts(diff);
    expect(alerts).toHaveLength(1);
    expect(alerts[0].severity).toBe('critical');
    expect(alerts[0].endpoint).toBe('GET /users');
  });

  it('generates info alert for added endpoint', () => {
    const diff: Diff = { ...baseDiff, added: ['POST /items'] };
    const alerts = generateAlerts(diff);
    expect(alerts[0].severity).toBe('info');
  });

  it('generates warning for status change', () => {
    const diff: Diff = {
      ...baseDiff,
      changed: [{ key: 'GET /ping', statusChanged: true, bodyChanged: false, before: { status: 200, body: '' }, after: { status: 500, body: '' } }],
    };
    const alerts = generateAlerts(diff);
    expect(alerts[0].severity).toBe('warning');
    expect(alerts[0].message).toContain('200 -> 500');
  });

  it('respects custom config severity overrides', () => {
    const diff: Diff = { ...baseDiff, removed: ['DELETE /old'] };
    const alerts = generateAlerts(diff, { onRemoved: 'warning' });
    expect(alerts[0].severity).toBe('warning');
  });

  it('skips alert when severity is undefined in config', () => {
    const diff: Diff = { ...baseDiff, added: ['GET /new'] };
    const alerts = generateAlerts(diff, { onAdded: undefined });
    expect(alerts).toHaveLength(0);
  });
});

describe('formatAlerts', () => {
  it('returns no alerts message when empty', () => {
    expect(formatAlerts([])).toBe('No alerts.');
  });

  it('formats alerts with severity and message', () => {
    const alert: Alert = { severity: 'critical', message: 'Endpoint removed', timestamp: '2024-01-01T00:00:00.000Z' };
    const output = formatAlerts([alert]);
    expect(output).toContain('[CRITICAL]');
    expect(output).toContain('Endpoint removed');
  });
});
