/**
 * slice.runner.ts — CLI runner for the slice command
 */

import { parseSliceArgs, applySlice, formatSliceSummary } from "./slice";
import { loadSliceConfig, sliceConfigToOptions, mergeSliceConfigs, parseSliceConfig } from "./slice.config";

export interface SliceRunnerResult {
  items: unknown[];
  summary: string;
}

export function resolveSliceOptions(
  cliArgs: Record<string, unknown>,
  configPath?: string
) {
  const fileCfg = configPath ? loadSliceConfig(configPath) : {};
  const cliCfg = parseSliceConfig(cliArgs);
  const merged = mergeSliceConfigs(fileCfg, cliCfg);
  return sliceConfigToOptions(merged);
}

export function runSlice(
  items: unknown[],
  cliArgs: Record<string, unknown>,
  configPath?: string
): SliceRunnerResult {
  const opts = resolveSliceOptions(cliArgs, configPath);
  // Allow explicit start/end override from raw CLI args
  const directOpts = parseSliceArgs(cliArgs);
  const finalOpts = { ...opts, ...directOpts };
  const result = applySlice(items, finalOpts);
  return {
    items: result.items,
    summary: formatSliceSummary(result),
  };
}
