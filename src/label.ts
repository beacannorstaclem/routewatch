export interface LabelMap { [key: string]: string }

export interface LabelOptions {
  labels: LabelMap
  prefix?: string
}

export function parseLabelArgs(args: Record<string, unknown>): LabelOptions {
  const raw = args['label'] ?? args['labels']
  const labels: LabelMap = {}

  if (typeof raw === 'string') {
    for (const pair of raw.split(',')) {
      const [k, v] = pair.split('=').map(s => s.trim())
      if (k && v !== undefined) labels[k] = v
    }
  } else if (Array.isArray(raw)) {
    for (const pair of raw) {
      if (typeof pair === 'string') {
        const [k, v] = pair.split('=').map(s => s.trim())
        if (k && v !== undefined) labels[k] = v
      }
    }
  } else if (raw && typeof raw === 'object') {
    Object.assign(labels, raw)
  }

  const prefix = typeof args['label-prefix'] === 'string' ? args['label-prefix'] : undefined
  return { labels, prefix }
}

export function applyLabels<T extends Record<string, unknown>>(
  obj: T,
  options: LabelOptions
): T & { labels: LabelMap } {
  const { labels, prefix } = options
  const applied: LabelMap = {}
  for (const [k, v] of Object.entries(labels)) {
    const key = prefix ? `${prefix}/${k}` : k
    applied[key] = v
  }
  return { ...obj, labels: { ...(obj['labels'] as LabelMap | undefined), ...applied } }
}

export function formatLabels(labels: LabelMap): string {
  return Object.entries(labels)
    .map(([k, v]) => `${k}=${v}`)
    .join(', ')
}
