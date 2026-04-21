import type { Endpoint } from "./index";

export type SampleStrategy = "random" | "first" | "last" | "nth";

export interface SampleOptions {
  strategy: SampleStrategy;
  count: number;
  nth?: number;
  seed?: number;
}

export interface SampleArgs {
  strategy?: string;
  count?: string;
  nth?: string;
  seed?: string;
}

export function parseSampleArgs(args: SampleArgs): SampleOptions {
  const strategy = (args.strategy ?? "random") as SampleStrategy;
  if (!["random", "first", "last", "nth"].includes(strategy)) {
    throw new Error(`Invalid sample strategy: ${strategy}`);
  }
  const count = args.count !== undefined ? parseInt(args.count, 10) : 10;
  if (isNaN(count) || count < 1) {
    throw new Error(`Invalid sample count: ${args.count}`);
  }
  const nth = args.nth !== undefined ? parseInt(args.nth, 10) : undefined;
  if (strategy === "nth" && (nth === undefined || isNaN(nth) || nth < 1)) {
    throw new Error(`Strategy 'nth' requires a valid --nth value`);
  }
  const seed = args.seed !== undefined ? parseInt(args.seed, 10) : undefined;
  return { strategy, count, nth, seed };
}

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

export function sampleEndpoints(
  endpoints: Endpoint[],
  options: SampleOptions
): Endpoint[] {
  const { strategy, count, nth, seed } = options;
  if (endpoints.length === 0) return [];

  switch (strategy) {
    case "first":
      return endpoints.slice(0, count);
    case "last":
      return endpoints.slice(-count);
    case "nth": {
      const step = nth!;
      return endpoints.filter((_, i) => i % step === 0).slice(0, count);
    }
    case "random": {
      const rand = seed !== undefined ? seededRandom(seed) : Math.random;
      const pool = [...endpoints];
      const result: Endpoint[] = [];
      const take = Math.min(count, pool.length);
      for (let i = 0; i < take; i++) {
        const idx = Math.floor(rand() * (pool.length - i));
        result.push(pool[idx]);
        pool[idx] = pool[pool.length - i - 1];
      }
      return result;
    }
  }
}

export function formatSampleSummary(
  original: number,
  sampled: Endpoint[],
  options: SampleOptions
): string {
  const pct = original > 0 ? ((sampled.length / original) * 100).toFixed(1) : "0.0";
  return [
    `Sample strategy : ${options.strategy}`,
    `Total endpoints : ${original}`,
    `Sampled         : ${sampled.length} (${pct}%)`,
    ...(options.nth ? [`Nth step        : ${options.nth}`] : []),
    ...(options.seed !== undefined ? [`Seed            : ${options.seed}`] : []),
  ].join("\n");
}
