import { readFileSync } from 'fs';
import { existsSync } from 'fs';
import type { ScoreWeights } from './score';

export interface ScoreConfig {
  weights?: Partial<ScoreWeights>;
  minScore?: number;
}

const DEFAULT_SCORE_CONFIG: ScoreConfig = {
  weights: {
    status: 0.4,
    latency: 0.3,
    size: 0.1,
    errors: 0.2,
  },
  minScore: 0,
};

export function parseScoreConfig(raw: unknown): ScoreConfig {
  if (typeof raw !== 'object' || raw === null) return { ...DEFAULT_SCORE_CONFIG };
  const obj = raw as Record<string, unknown>;
  const config: ScoreConfig = {};

  if (typeof obj['minScore'] === 'number') {
    config.minScore = obj['minScore'];
  }

  if (typeof obj['weights'] === 'object' && obj['weights'] !== null) {
    const w = obj['weights'] as Record<string, unknown>;
    config.weights = {};
    if (typeof w['status'] === 'number') config.weights.status = w['status'];
    if (typeof w['latency'] === 'number') config.weights.latency = w['latency'];
    if (typeof w['size'] === 'number') config.weights.size = w['size'];
    if (typeof w['errors'] === 'number') config.weights.errors = w['errors'];
  }

  return config;
}

export function loadScoreConfig(filePath: string): ScoreConfig {
  if (!existsSync(filePath)) return { ...DEFAULT_SCORE_CONFIG };
  try {
    const raw = JSON.parse(readFileSync(filePath, 'utf-8'));
    return parseScoreConfig(raw?.score ?? raw);
  } catch {
    return { ...DEFAULT_SCORE_CONFIG };
  }
}

export function mergeScoreConfigs(
  base: ScoreConfig,
  override: Partial<ScoreConfig>
): ScoreConfig {
  return {
    minScore: override.minScore ?? base.minScore,
    weights: { ...base.weights, ...override.weights },
  };
}
