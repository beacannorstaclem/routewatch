/**
 * chain.runner.ts — wire up and execute a chain from CLI args
 */

import { buildChain, runChain, parseChainArgs, formatChainSummary } from './chain';
import { loadChainConfig, chainConfigToOptions } from './chain.config';
import type { ChainStep } from './chain';

const builtinSteps: Record<string, ChainStep['fn']> = {
  dedupe: (endpoints) => {
    const seen = new Set<string>();
    return endpoints.filter((ep) => {
      const key = `${ep['method']}:${ep['path']}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  },
  sort: (endpoints) =>
    [...endpoints].sort((a, b) =>
      String(a['path'] ?? '').localeCompare(String(b['path'] ?? ''))
    ),
  filterOk: (endpoints) =>
    endpoints.filter((ep) => Number(ep['status']) >= 200 && Number(ep['status']) < 300),
};

export function runChainFromArgs(
  endpoints: Record<string, unknown>[],
  args: Record<string, unknown>
): void {
  const fileConfig = loadChainConfig(args['chain-config'] as string | undefined);
  const argOptions = parseChainArgs(args);
  const configOptions = chainConfigToOptions(fileConfig, builtinSteps);

  const steps: ChainStep[] =
    configOptions.steps && configOptions.steps.length > 0
      ? configOptions.steps
      : Object.entries(builtinSteps).map(([name, fn]) => ({ name, fn }));

  const options = buildChain(steps);
  options.stopOnEmpty = argOptions.stopOnEmpty ?? configOptions.stopOnEmpty ?? true;

  const result = runChain(endpoints, options);
  console.log(formatChainSummary(result));
}
