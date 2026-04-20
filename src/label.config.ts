import * as fs from 'fs'
import * as path from 'path'
import type { LabelMap, LabelOptions } from './label'

export interface LabelConfig {
  labels?: LabelMap
  prefix?: string
}

export function parseLabelConfig(raw: unknown): LabelConfig {
  if (!raw || typeof raw !== 'object') return {}
  const obj = raw as Record<string, unknown>
  const labels: LabelMap = {}

  if (obj['labels'] && typeof obj['labels'] === 'object') {
    for (const [k, v] of Object.entries(obj['labels'] as Record<string, unknown>)) {
      if (typeof v === 'string') labels[k] = v
    }
  }

  const prefix = typeof obj['prefix'] === 'string' ? obj['prefix'] : undefined
  return { labels, prefix }
}

export function loadLabelConfig(configPath?: string): LabelConfig {
  const candidates = configPath
    ? [configPath]
    : ['routewatch.labels.json', path.join('.routewatch', 'labels.json')]

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      try {
        const raw = JSON.parse(fs.readFileSync(candidate, 'utf8'))
        return parseLabelConfig(raw)
      } catch {
        // ignore
      }
    }
  }
  return {}
}

export function labelConfigToOptions(config: LabelConfig): LabelOptions {
  return { labels: config.labels ?? {}, prefix: config.prefix }
}
