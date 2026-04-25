import { pivotEndpoints, formatPivotSummary, parsePivotArgs } from './pivot';
import { loadPivotConfig, pivotConfigToOptions } from './pivot.config';
import type { Endpoint } from './index';

export function runPivot(
  endpoints: Endpoint[],
  args: Record<string, unknown> = {}
): string {
  const config = loadPivotConfig(
    typeof args['pivot-config'] === 'string' ? args['pivot-config'] : undefined
  );
  const cliOptions = parsePivotArgs(args);
  const options = pivotConfigToOptions(config, cliOptions);
  const result = pivotEndpoints(endpoints, options);

  if (options.countOnly) {
    const lines = result.rows.map((r) => `${r.key}\t${r.count}`);
    return lines.join('\n');
  }

  return formatPivotSummary(result);
}
