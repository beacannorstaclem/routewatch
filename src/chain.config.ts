/**
 * chain.config.ts — load and parse chain configuration
 */

import * as fs from 'fs';
import * as path from 'path';
import type { ChainOptions, ChainStep } from './chain';

export interface ChainConfig {
  steps?: string[];
  stopOnEmpty?: boolean;
}

export function parseChainConfig(raw: Record<string, unknown>): ChainConfig {
  const config: ChainConfig = {};
  if (Array.isArray(raw['steps'])) {
    config.steps = (raw['steps'] as unknown[]).filter(
      (s): s is string => typeof s === 'string'
    );
  }
  if (typeof raw['stopOnEmpty'] === 'boolean') {
    config.stopOnEmpty = raw['stopOnEmpty'];
  }
  return config;
}

export function loadChainConfig(configPath?: string): ChainConfig {
  const resolved = configPath ?? path.join(process.cwd(), 'chain.config.json');
  if (!fs.existsSync(resolved)) return {};
  try {
    const raw = JSON.parse(fs.readFileSync(resolved, 'utf-8'));
    return parseChainConfig(raw);
  } catch {
    return {};
  }
}

export function chainConfigToOptions(
  config: ChainConfig,
  availableSteps: Record<string, ChainStep['fn']>
): Partial<ChainOptions> {
  const steps: ChainStep[] = (config.steps ?? []).flatMap((name) => {
    const fn = availableSteps[name];
    return fn ? [{ name, fn }] : [];
  });
  return {
    steps,
    stopOnEmpty: config.stopOnEmpty ?? true,
  };
}
