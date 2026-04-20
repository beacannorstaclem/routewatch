import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import {
  archiveSnapshot,
  restoreArchive,
  pruneArchives,
  parseArchiveArgs,
} from './archive';

let tmpDir: string;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'archive-test-'));
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

function writeFile(name: string, content: string): string {
  const fp = path.join(tmpDir, name);
  fs.writeFileSync(fp, content);
  return fp;
}

describe('parseArchiveArgs', () => {
  it('parses compress flag', () => {
    expect(parseArchiveArgs({ compress: false })).toEqual({ compress: false });
  });

  it('parses maxAge and maxCount', () => {
    expect(parseArchiveArgs({ 'max-age': 7, 'max-count': 5 })).toEqual({ maxAge: 7, maxCount: 5 });
  });

  it('ignores unknown keys', () => {
    expect(parseArchiveArgs({ foo: 'bar' })).toEqual({});
  });
});

describe('archiveSnapshot', () => {
  it('creates a gzip archive by default', async () => {
    const src = writeFile('snap.json', JSON.stringify({ endpoints: [] }));
    const archiveDir = path.join(tmpDir, 'archive');
    const result = await archiveSnapshot(src, archiveDir);
    expect(result).toMatch(/\.gz$/);
    expect(fs.existsSync(result)).toBe(true);
  });

  it('creates a plain copy when compress=false', async () => {
    const src = writeFile('snap.json', '{"endpoints":[]}');
    const archiveDir = path.join(tmpDir, 'archive');
    const result = await archiveSnapshot(src, archiveDir, { compress: false });
    expect(result).not.toMatch(/\.gz$/);
    expect(fs.existsSync(result)).toBe(true);
  });
});

describe('restoreArchive', () => {
  it('restores a gzip archive', async () => {
    const src = writeFile('snap.json', '{"endpoints":[]}');
    const archiveDir = path.join(tmpDir, 'archive');
    const archived = await archiveSnapshot(src, archiveDir);
    const destDir = path.join(tmpDir, 'restored');
    const restored = await restoreArchive(archived, destDir);
    expect(fs.existsSync(restored)).toBe(true);
    expect(JSON.parse(fs.readFileSync(restored, 'utf-8'))).toEqual({ endpoints: [] });
  });
});

describe('pruneArchives', () => {
  it('removes files exceeding maxCount', async () => {
    const archiveDir = path.join(tmpDir, 'archive');
    fs.mkdirSync(archiveDir);
    for (let i = 0; i < 5; i++) {
      fs.writeFileSync(path.join(archiveDir, `snap-${i}.json.gz`), '');
    }
    const removed = await pruneArchives(archiveDir, { maxCount: 3 });
    expect(removed.length).toBe(2);
    expect(fs.readdirSync(archiveDir).length).toBe(3);
  });
});
