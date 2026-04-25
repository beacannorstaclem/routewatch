import { parseRollupArgs, rollupEndpoints, formatRollupSummary } from "./rollup";
import { loadRollupConfig, rollupConfigToOptions, mergeRollupConfigs, parseRollupConfig } from "./rollup.config";
import type { Endpoint } from "./snapshot";

export interface RollupRunInput {
  endpoints: Endpoint[];
  args: string[];
  configPath?: string;
}

export function runRollup(input: RollupRunInput): string {
  const { endpoints, args, configPath } = input;

  const fileConfig = configPath ? loadRollupConfig(configPath) : {};
  const argOptions = parseRollupArgs(args);
  const argConfig = parseRollupConfig(argOptions);
  const merged = mergeRollupConfigs(fileConfig, argConfig);
  const options = rollupConfigToOptions(merged);

  let result = rollupEndpoints(endpoints, options);

  const topNIdx = args.indexOf("--top");
  const topN = merged.topN ?? (topNIdx !== -1 ? parseInt(args[topNIdx + 1], 10) : undefined);
  if (topN && topN > 0) {
    result = { ...result, buckets: result.buckets.slice(0, topN) };
  }

  return formatRollupSummary(result);
}
