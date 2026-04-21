import type { Endpoint } from './index';

export type ScoreField = 'status' | 'latency' | 'size' | 'errors';

export interface ScoreWeights {
  status: number;
  latency: number;
  size: number;
  errors: number;
}

export interface EndpointScore {
  endpoint: Endpoint;
  score: number;
  breakdown: Record<ScoreField, number>;
}

const DEFAULT_WEIGHTS: ScoreWeights = {
  status: 0.4,
  latency: 0.3,
  size: 0.1,
  errors: 0.2,
};

export function isScoreField(value: string): value is ScoreField {
  return ['status', 'latency', 'size', 'errors'].includes(value);
}

export function scoreEndpoint(
  endpoint: Endpoint,
  weights: ScoreWeights = DEFAULT_WEIGHTS
): EndpointScore {
  const statusScore = endpoint.status >= 200 && endpoint.status < 300 ? 1 : 0;
  const latencyScore = endpoint.latency !== undefined
    ? Math.max(0, 1 - endpoint.latency / 5000)
    : 0.5;
  const sizeScore = endpoint.size !== undefined
    ? Math.max(0, 1 - endpoint.size / 1_000_000)
    : 0.5;
  const errorScore = endpoint.error ? 0 : 1;

  const breakdown: Record<ScoreField, number> = {
    status: statusScore,
    latency: latencyScore,
    size: sizeScore,
    errors: errorScore,
  };

  const score =
    breakdown.status * weights.status +
    breakdown.latency * weights.latency +
    breakdown.size * weights.size +
    breakdown.errors * weights.errors;

  return { endpoint, score: Math.round(score * 100) / 100, breakdown };
}

export function scoreSnapshot(
  endpoints: Endpoint[],
  weights?: ScoreWeights
): EndpointScore[] {
  return endpoints.map((ep) => scoreEndpoint(ep, weights));
}

export function formatScoreSummary(scores: EndpointScore[]): string {
  if (scores.length === 0) return 'No endpoints scored.';
  const avg = scores.reduce((s, e) => s + e.score, 0) / scores.length;
  const lines = [
    `Scored ${scores.length} endpoint(s) — avg: ${avg.toFixed(2)}`,
    ...scores.map(
      (s) =>
        `  [${s.score.toFixed(2)}] ${s.endpoint.method} ${s.endpoint.path}` +
        ` (status:${s.breakdown.status.toFixed(2)} latency:${s.breakdown.latency.toFixed(2)})`
    ),
  ];
  return lines.join('\n');
}

export function parseScoreArgs(args: Record<string, unknown>): ScoreWeights {
  const w = { ...DEFAULT_WEIGHTS };
  if (typeof args['score-weight-status'] === 'number') w.status = args['score-weight-status'];
  if (typeof args['score-weight-latency'] === 'number') w.latency = args['score-weight-latency'];
  if (typeof args['score-weight-size'] === 'number') w.size = args['score-weight-size'];
  if (typeof args['score-weight-errors'] === 'number') w.errors = args['score-weight-errors'];
  return w;
}
