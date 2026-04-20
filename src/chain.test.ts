import { buildChain, runChain, parseChainArgs, formatChainSummary } from './chain';
import type { ChainStep } from './chain';

const makeEndpoints = () => [
  { method: 'GET', path: '/a', status: 200 },
  { method: 'POST', path: '/b', status: 404 },
  { method: 'GET', path: '/a', status: 200 },
];

const dedupeStep: ChainStep = {
  name: 'dedupe',
  fn: (eps) => {
    const seen = new Set<string>();
    return eps.filter((ep) => {
      const k = `${ep['method']}:${ep['path']}`;
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
  },
};

const filterOkStep: ChainStep = {
  name: 'filterOk',
  fn: (eps) => eps.filter((ep) => Number(ep['status']) < 400),
};

const emptyStep: ChainStep = {
  name: 'empty',
  fn: () => [],
};

describe('buildChain', () => {
  it('returns options with provided steps', () => {
    const opts = buildChain([dedupeStep]);
    expect(opts.steps).toHaveLength(1);
    expect(opts.stopOnEmpty).toBe(true);
  });
});

describe('runChain', () => {
  it('applies steps in order', () => {
    const opts = buildChain([dedupeStep, filterOkStep]);
    const result = runChain(makeEndpoints(), opts);
    expect(result.output).toHaveLength(1);
    expect(result.stepCount).toBe(2);
    expect(result.stoppedEarly).toBe(false);
  });

  it('stops early when output is empty and stopOnEmpty is true', () => {
    const opts = buildChain([emptyStep, filterOkStep]);
    const result = runChain(makeEndpoints(), opts);
    expect(result.stoppedEarly).toBe(true);
    expect(result.stepCount).toBe(1);
  });

  it('does not stop early when stopOnEmpty is false', () => {
    const opts = { ...buildChain([emptyStep, filterOkStep]), stopOnEmpty: false };
    const result = runChain(makeEndpoints(), opts);
    expect(result.stoppedEarly).toBe(false);
    expect(result.stepCount).toBe(2);
  });
});

describe('parseChainArgs', () => {
  it('defaults stopOnEmpty to true', () => {
    expect(parseChainArgs({})['stopOnEmpty']).toBe(true);
  });

  it('parses stop-on-empty false', () => {
    expect(parseChainArgs({ 'stop-on-empty': 'false' })['stopOnEmpty']).toBe(false);
  });
});

describe('formatChainSummary', () => {
  it('includes step count and output count', () => {
    const summary = formatChainSummary({ output: [{ method: 'GET', path: '/a', status: 200 }], stepCount: 3, stoppedEarly: false });
    expect(summary).toContain('3 step(s)');
    expect(summary).toContain('1');
  });

  it('mentions stopped early when applicable', () => {
    const summary = formatChainSummary({ output: [], stepCount: 1, stoppedEarly: true });
    expect(summary).toContain('Stopped early');
  });
});
