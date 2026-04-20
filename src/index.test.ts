import * as RouteWatch from './index';

describe('index barrel exports', () => {
  it('exports snapshot utilities', () => {
    expect(typeof RouteWatch.createSnapshotFile).toBe('function');
  });

  it('exports diff utilities', () => {
    expect(typeof RouteWatch.diffSnapshots).toBe('function');
    expect(typeof RouteWatch.isEmptyDiff).toBe('function');
    expect(typeof RouteWatch.formatDiffSummary).toBe('function');
    expect(typeof RouteWatch.endpointKey).toBe('function');
  });

  it('exports fetch utilities', () => {
    expect(typeof RouteWatch.fetchEndpoint).toBe('function');
  });

  it('exports report utilities', () => {
    expect(typeof RouteWatch.colorize).toBe('function');
    expect(typeof RouteWatch.formatReport).toBe('function');
  });

  it('exports storage utilities', () => {
    expect(typeof RouteWatch.getSnapshotsDir).toBe('function');
    expect(typeof RouteWatch.ensureSnapshotsDir).toBe('function');
    expect(typeof RouteWatch.listSnapshots).toBe('function');
    expect(typeof RouteWatch.saveSnapshot).toBe('function');
    expect(typeof RouteWatch.loadSnapshot).toBe('function');
  });

  it('exports watch utilities', () => {
    expect(typeof RouteWatch.startWatch).toBe('function');
    expect(typeof RouteWatch.parseWatchConfig).toBe('function');
  });

  it('exports alert utilities', () => {
    expect(typeof RouteWatch.generateAlerts).toBe('function');
    expect(typeof RouteWatch.formatAlerts).toBe('function');
    expect(typeof RouteWatch.isSeverity).toBe('function');
  });

  it('exports filter utilities', () => {
    expect(typeof RouteWatch.filterEndpoints).toBe('function');
    expect(typeof RouteWatch.parseFilterArgs).toBe('function');
  });

  it('exports tag utilities', () => {
    expect(typeof RouteWatch.makeTagKey).toBe('function');
    expect(typeof RouteWatch.isTagKey).toBe('function');
    expect(typeof RouteWatch.tagFromKey).toBe('function');
  });

  it('exports plugin utilities', () => {
    expect(typeof RouteWatch.registerPlugin).toBe('function');
    expect(typeof RouteWatch.unregisterPlugin).toBe('function');
    expect(typeof RouteWatch.listPlugins).toBe('function');
    expect(typeof RouteWatch.clearPlugins).toBe('function');
  });

  it('exports auth utilities', () => {
    expect(typeof RouteWatch.applyAuth).toBe('function');
    expect(typeof RouteWatch.parseAuthArgs).toBe('function');
  });

  it('exports output utilities', () => {
    expect(typeof RouteWatch.parseOutputArgs).toBe('function');
    expect(typeof RouteWatch.isOutputFormat).toBe('function');
    expect(typeof RouteWatch.writeOutput).toBe('function');
    expect(typeof RouteWatch.resolveOutputPath).toBe('function');
  });

  it('exports export utilities', () => {
    expect(typeof RouteWatch.exportSnapshot).toBe('function');
    expect(typeof RouteWatch.exportDiff).toBe('function');
    expect(typeof RouteWatch.snapshotToCsv).toBe('function');
    expect(typeof RouteWatch.snapshotToMarkdown).toBe('function');
    expect(typeof RouteWatch.diffToCsv).toBe('function');
  });

  it('exports normalize utilities', () => {
    expect(typeof RouteWatch.normalizeMethod).toBe('function');
    expect(typeof RouteWatch.normalizePath).toBe('function');
    expect(typeof RouteWatch.normalizeEndpoint).toBe('function');
  });

  it('exports replay utilities', () => {
    expect(typeof RouteWatch.parseReplayArgs).toBe('function');
    expect(typeof RouteWatch.formatReplaySummary).toBe('function');
  });
});
