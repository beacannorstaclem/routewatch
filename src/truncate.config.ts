import { TruncateConfig } from './truncate';

const DEFAULT_MAX_LENGTH = 100;
const DEFAULT_SUFFIX = '...';

export function parseTruncateConfig(raw: unknown): TruncateConfig {
  if (!raw || typeof raw !== 'object') {
    return { maxLength: DEFAULT_MAX_LENGTH, suffix: DEFAULT_SUFFIX };
  }
  const r = raw as Record<string, unknown>;
  const maxLength =
    typeof r['maxLength'] === 'number' && r['maxLength'] > 0
      ? r['maxLength']
      : DEFAULT_MAX_LENGTH;
  const suffix = typeof r['suffix'] === 'string' ? r['suffix'] : DEFAULT_SUFFIX;
  return { maxLength, suffix };
}

export function loadTruncateConfig(config: Record<string, unknown>): TruncateConfig {
  return parseTruncateConfig(config['truncate']);
}
