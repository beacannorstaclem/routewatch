/**
 * chain.ts — pipeline chaining of endpoint transforms
 */

export interface ChainStep {
  name: string;
  fn: (endpoints: Record<string, unknown>[]) => Record<string, unknown>[];
}

export interface ChainOptions {
  steps: ChainStep[];
  stopOnEmpty?: boolean;
}

export interface ChainResult {
  output: Record<string, unknown>[];
  stepCount: number;
  stoppedEarly: boolean;
}

export function buildChain(steps: ChainStep[]): ChainOptions {
  return { steps, stopOnEmpty: true };
}

export function runChain(
  input: Record<string, unknown>[],
  options: ChainOptions
): ChainResult {
  let current = [...input];
  let stoppedEarly = false;

  for (let i = 0; i < options.steps.length; i++) {
    const step = options.steps[i];
    current = step.fn(current);
    if (options.stopOnEmpty && current.length === 0) {
      stoppedEarly = true;
      return { output: current, stepCount: i + 1, stoppedEarly };
    }
  }

  return { output: current, stepCount: options.steps.length, stoppedEarly };
}

export function parseChainArgs(args: Record<string, unknown>): Partial<ChainOptions> {
  return {
    stopOnEmpty: args['stop-on-empty'] !== 'false',
  };
}

export function formatChainSummary(result: ChainResult): string {
  const lines: string[] = [
    `Chain completed: ${result.stepCount} step(s) run`,
    `Output endpoints: ${result.output.length}`,
  ];
  if (result.stoppedEarly) {
    lines.push('Stopped early: no endpoints remaining after a step');
  }
  return lines.join('\n');
}
