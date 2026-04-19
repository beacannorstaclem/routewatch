import { loadFlattenConfig } from './flatten.config';
import { parseFlattenArgs, applyFlatten, FlattenOptions } from './flatten';

export function resolveFlattenOptions(
  cliArgs: Record<string, unknown>,
  fileConfig: Record<string, unknown>
): FlattenOptions {
  const fromFile = loadFlattenConfig(fileConfig);
  const fromCli = parseFlattenArgs(cliArgs);
  return { ...fromFile, ...fromCli };
}

export function runFlatten(
  data: Record<string, unknown>[],
  opts: FlattenOptions
): Record<string, unknown>[] {
  return data.map((item) => applyFlatten(item, opts));
}
