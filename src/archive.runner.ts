import * as path from 'path';
import { getSnapshotsDir } from './storage';
import { archiveSnapshot, pruneArchives, restoreArchive, parseArchiveArgs } from './archive';
import { loadArchiveConfig, archiveConfigToOptions, defaultArchiveDir } from './archive.config';

export async function runArchive(args: Record<string, unknown>): Promise<void> {
  const snapshotsDir = getSnapshotsDir();
  const configPath = path.join(snapshotsDir, 'archive.config.json');
  const fileConfig = loadArchiveConfig(configPath);
  const cliOpts = parseArchiveArgs(args);
  const opts = { ...archiveConfigToOptions(fileConfig), ...cliOpts };
  const archiveDir = typeof args['archive-dir'] === 'string'
    ? args['archive-dir']
    : fileConfig.archiveDir ?? defaultArchiveDir(snapshotsDir);

  const command = typeof args['_'] === 'string' ? args['_'] : 'archive';

  if (command === 'restore') {
    const target = typeof args['file'] === 'string' ? args['file'] : null;
    if (!target) throw new Error('--file required for restore');
    const dest = typeof args['dest'] === 'string' ? args['dest'] : snapshotsDir;
    const restored = await restoreArchive(target, dest);
    console.log(`Restored: ${restored}`);
    return;
  }

  if (command === 'prune') {
    const removed = await pruneArchives(archiveDir, opts);
    console.log(`Pruned ${removed.length} archive(s).`);
    return;
  }

  const target = typeof args['file'] === 'string' ? args['file'] : null;
  if (!target) throw new Error('--file required for archive');
  const archived = await archiveSnapshot(target, archiveDir, opts);
  console.log(`Archived: ${archived}`);
}
