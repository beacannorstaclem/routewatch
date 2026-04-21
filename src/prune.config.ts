import * as fs from 'fs';
import { PruneOptions } from './prune';

export interface PruneConfig {
  maxAge?: number;
  statusCodes?: number[];
  methods?: string[];
  pathPattern?: string;
}

export function parsePruneConfig(raw: unknown): PruneConfig {
  if (!raw || typeof raw !== 'object') return {};
  const obj = raw as Record<string, unknown>;
  const config: PruneConfig = {};
  if (typeof obj['maxAge'] === 'number') config.maxAge = obj['maxAge'];
  if (Array.isArray(obj['statusCodes'])) {
    config.statusCodes = (obj['statusCodes'] as unknown[]).map(Number);
  }
  if (Array.isArray(obj['methods'])) {
    config.methods = (obj['methods'] as unknown[]).map(String).map((m) => m.toUpperCase());
  }
  if (typeof obj['pathPattern'] === 'string') config.pathPattern = obj['pathPattern'];
  return config;
}

export function loadPruneConfig(filePath: string): PruneConfig {
  if (!fs.existsSync(filePath)) return {};
  try {
    const raw = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    return parsePruneConfig(raw?.prune ?? raw);
  } catch {
    return {};
  }
}

export function pruneConfigToOptions(config: PruneConfig): PruneOptions {
  return {
    maxAge: config.maxAge,
    statusCodes: config.statusCodes,
    methods: config.methods,
    pathPattern: config.pathPattern,
  };
}

export function mergePruneConfigs(base: PruneConfig, override: PruneConfig): PruneConfig {
  return {
    maxAge: override.maxAge ?? base.maxAge,
    statusCodes: override.statusCodes ?? base.statusCodes,
    methods: override.methods ?? base.methods,
    pathPattern: override.pathPattern ?? base.pathPattern,
  };
}
