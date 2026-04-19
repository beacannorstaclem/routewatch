export interface TruncateConfig {
  maxLength: number;
  suffix?: string;
}

const DEFAULT_SUFFIX = '...';
const DEFAULT_MAX_LENGTH = 100;

export function parseTruncateArgs(args: Record<string, unknown>): TruncateConfig {
  const maxLength = typeof args['truncate'] === 'number' ? args['truncate'] : DEFAULT_MAX_LENGTH;
  const suffix = typeof args['truncateSuffix'] === 'string' ? args['truncateSuffix'] : DEFAULT_SUFFIX;
  return { maxLength, suffix };
}

export function truncateString(value: string, config: TruncateConfig): string {
  const { maxLength, suffix = DEFAULT_SUFFIX } = config;
  if (value.length <= maxLength) return value;
  return value.slice(0, maxLength - suffix.length) + suffix;
}

export function truncateObject(
  obj: Record<string, unknown>,
  fields: string[],
  config: TruncateConfig
): Record<string, unknown> {
  const result = { ...obj };
  for (const field of fields) {
    if (typeof result[field] === 'string') {
      result[field] = truncateString(result[field] as string, config);
    }
  }
  return result;
}

export function applyTruncate(
  obj: Record<string, unknown>,
  config: TruncateConfig,
  fields?: string[]
): Record<string, unknown> {
  const keys = fields ?? Object.keys(obj).filter(k => typeof obj[k] === 'string');
  return truncateObject(obj, keys, config);
}
