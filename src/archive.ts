import * as fs from 'fs';
import * as path from 'path';
import * as zlib from 'zlib';
import { promisify } from 'util';

const gzip = promisify(zlib.gzip);
const gunzip = promisify(zlib.gunzip);

export interface ArchiveOptions {
  compress?: boolean;
  maxAge?: number; // days
  maxCount?: number;
}

export function parseArchiveArgs(args: Record<string, unknown>): ArchiveOptions {
  const opts: ArchiveOptions = {};
  if (typeof args['compress'] === 'boolean') opts.compress = args['compress'];
  if (typeof args['max-age'] === 'number') opts.maxAge = args['max-age'];
  if (typeof args['max-count'] === 'number') opts.maxCount = args['max-count'];
  return opts;
}

export async function archiveSnapshot(
  snapshotPath: string,
  archiveDir: string,
  opts: ArchiveOptions = {}
): Promise<string> {
  const { compress = true } = opts;
  await fs.promises.mkdir(archiveDir, { recursive: true });
  const basename = path.basename(snapshotPath);
  const archiveName = compress ? `${basename}.gz` : basename;
  const archivePath = path.join(archiveDir, archiveName);
  const content = await fs.promises.readFile(snapshotPath);
  if (compress) {
    const compressed = await gzip(content);
    await fs.promises.writeFile(archivePath, compressed);
  } else {
    await fs.promises.copyFile(snapshotPath, archivePath);
  }
  return archivePath;
}

export async function restoreArchive(
  archivePath: string,
  destDir: string
): Promise<string> {
  await fs.promises.mkdir(destDir, { recursive: true });
  const basename = path.basename(archivePath);
  const isGzip = basename.endsWith('.gz');
  const destName = isGzip ? basename.slice(0, -3) : basename;
  const destPath = path.join(destDir, destName);
  const content = await fs.promises.readFile(archivePath);
  if (isGzip) {
    const decompressed = await gunzip(content);
    await fs.promises.writeFile(destPath, decompressed);
  } else {
    await fs.promises.copyFile(archivePath, destPath);
  }
  return destPath;
}

export async function pruneArchives(
  archiveDir: string,
  opts: ArchiveOptions = {}
): Promise<string[]> {
  const { maxAge, maxCount } = opts;
  let files = await fs.promises.readdir(archiveDir);
  files = files.sort();
  const removed: string[] = [];
  if (maxAge !== undefined) {
    const cutoff = Date.now() - maxAge * 86400 * 1000;
    for (const f of files) {
      const fp = path.join(archiveDir, f);
      const stat = await fs.promises.stat(fp);
      if (stat.mtimeMs < cutoff) {
        await fs.promises.unlink(fp);
        removed.push(fp);
      }
    }
    files = files.filter((f) => !removed.includes(path.join(archiveDir, f)));
  }
  if (maxCount !== undefined && files.length > maxCount) {
    const toRemove = files.slice(0, files.length - maxCount);
    for (const f of toRemove) {
      const fp = path.join(archiveDir, f);
      await fs.promises.unlink(fp);
      removed.push(fp);
    }
  }
  return removed;
}
