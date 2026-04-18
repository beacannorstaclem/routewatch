export type TransformFn = (value: string) => string;

export interface Transform {
  field: string;
  fn: TransformFn;
}

const builtins: Record<string, TransformFn> = {
  lowercase: (v) => v.toLowerCase(),
  uppercase: (v) => v.toUpperCase(),
  trim: (v) => v.trim(),
  redact: () => "[REDACTED]",
  truncate: (v) => (v.length > 64 ? v.slice(0, 64) + "..." : v),
};

export function resolveTransformFn(name: string): TransformFn {
  const fn = builtins[name];
  if (!fn) throw new Error(`Unknown transform: "${name}"`);
  return fn;
}

export function applyTransforms(
  record: Record<string, string>,
  transforms: Transform[]
): Record<string, string> {
  const result = { ...record };
  for (const { field, fn } of transforms) {
    if (field in result) {
      result[field] = fn(result[field]);
    }
  }
  return result;
}

export function parseTransformArgs(args: string[]): Transform[] {
  // --transform field:fnName
  const transforms: Transform[] = [];
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--transform" && args[i + 1]) {
      const [field, fnName] = args[i + 1].split(":");
      if (!field || !fnName) throw new Error(`Invalid --transform value: "${args[i + 1]}"`);
      transforms.push({ field, fn: resolveTransformFn(fnName) });
      i++;
    }
  }
  return transforms;
}
