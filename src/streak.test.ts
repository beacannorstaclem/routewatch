import { computeStreak, formatStreakSummary, parseStreakArgs, buildStreakSummary, StreakSummary } from './streak';

describe('computeStreak', () => {
  it('returns zero streak for empty array', () => {
    expect(computeStreak([])).toEqual({ current: 0, longest: 0 });
  });

  it('computes streak for all successful', () => {
    const result = computeStreak([200, 201, 200]);
    expect(result.current).toBe(3);
    expect(result.longest).toBe(3);
  });

  it('resets current streak on failure', () => {
    const result = computeStreak([200, 200, 500, 200, 200, 200]);
    expect(result.current).toBe(3);
    expect(result.longest).toBe(3);
  });

  it('tracks longest streak correctly', () => {
    const result = computeStreak([200, 200, 200, 500, 200]);
    expect(result.current).toBe(1);
    expect(result.longest).toBe(3);
  });

  it('treats null status as broken', () => {
    const result = computeStreak([200, null, 200]);
    expect(result.current).toBe(1);
    expect(result.longest).toBe(1);
  });

  it('handles all failures', () => {
    const result = computeStreak([500, 503, 404]);
    expect(result.current).toBe(0);
    expect(result.longest).toBe(0);
  });
});

describe('formatStreakSummary', () => {
  it('includes active and broken counts in header', () => {
    const summary: StreakSummary = {
      results: [
        { endpoint: 'GET /health', currentStreak: 5, longestStreak: 10, totalChecks: 20, lastStatus: 200 },
        { endpoint: 'POST /login', currentStreak: 0, longestStreak: 3, totalChecks: 5, lastStatus: 500 },
      ],
      activeStreaks: 1,
      brokenStreaks: 1,
    };
    const output = formatStreakSummary(summary);
    expect(output).toContain('1 active');
    expect(output).toContain('1 broken');
    expect(output).toContain('GET /health');
    expect(output).toContain('POST /login');
  });

  it('renders checkmark bar for current streak', () => {
    const summary: StreakSummary = {
      results: [
        { endpoint: 'GET /api', currentStreak: 3, longestStreak: 3, totalChecks: 3, lastStatus: 200 },
      ],
      activeStreaks: 1,
      brokenStreaks: 0,
    };
    const output = formatStreakSummary(summary);
    expect(output).toContain('✓✓✓');
  });
});

describe('parseStreakArgs', () => {
  it('parses --dir flag', () => {
    expect(parseStreakArgs(['--dir', '/tmp/snaps'])).toEqual({ snapshotsDir: '/tmp/snaps' });
  });

  it('parses -d shorthand', () => {
    expect(parseStreakArgs(['-d', './snaps'])).toEqual({ snapshotsDir: './snaps' });
  });

  it('returns empty object with no args', () => {
    expect(parseStreakArgs([])).toEqual({});
  });
});
