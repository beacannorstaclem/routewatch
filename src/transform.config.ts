import * as fs from "fs";
import { Transform, resolveTransformFn } from "./transform";

export interface TransformConfig {
  transforms: Array<{ field: string; fn: string }>;
}

export function parseTransformConfig(raw: unknown): TransformConfig {
  if (typeof raw !== "object" || raw === null) {
    throw new Error("Transform config must be an object");
  }
  const obj = raw as Record<string, unknown>;
  const list = obj["transforms"];
  if (!Array.isArray(list)) {
    throw new Error('Transform config must have a "transforms" array');
  }
  for (const item of list) {
    if (
      typeof item !== "object" ||
      item === null ||
      typeof (item as any).field !== "string" ||
      typeof (item as any).fn !== "string"
    ) {
      throw new Error("Each transform entry must have string fields: field, fn");
    }
  }
  return { transforms: list as Array<{ field: string; fn: string }> };
}

export function loadTransformConfig(filePath: string): Transform[] {
  const raw = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  const config = parseTransformConfig(raw);
  return config.transforms.map(({ field, fn }) => ({
    field,
    fn: resolveTransformFn(fn),
  }));
}
