import * as fs from 'fs';
import * as path from 'path';

export type OutputFormat = 'json' | 'csv' | 'markdown';

export interface OutputOptions {
  format: OutputFormat;
  file?: string;
  pretty?: boolean;
}

export function parseOutputArgs(args: Record<string, unknown>): OutputOptions {
  const format = (args['format'] as OutputFormat) ?? 'json';
  if (!isOutputFormat(format)) {
    throw new Error(`Invalid output format: ${format}. Must be one of: json, csv, markdown`);
  }
  return {
    format,
    file: args['output'] as string | undefined,
    pretty: args['pretty'] === true || args['pretty'] === 'true',
  };
}

export function isOutputFormat(value: unknown): value is OutputFormat {
  return value === 'json' || value === 'csv' || value === 'markdown';
}

export function writeOutput(content: string, options: OutputOptions): void {
  if (options.file) {
    const dir = path.dirname(options.file);
    if (dir && dir !== '.') {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(options.file, content, 'utf-8');
  } else {
    process.stdout.write(content + '\n');
  }
}

export function serializeJson(data: unknown, pretty = false): string {
  return pretty ? JSON.stringify(data, null, 2) : JSON.stringify(data);
}

export function resolveOutputPath(base: string, format: OutputFormat): string {
  const ext = format === 'markdown' ? 'md' : format;
  return `${base}.${ext}`;
}
