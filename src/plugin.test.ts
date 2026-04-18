import {
  registerPlugin,
  unregisterPlugin,
  listPlugins,
  runSnapshotPlugins,
  runDiffPlugins,
  clearPlugins,
  RouteWatchPlugin,
} from './plugin';
import { Endpoint } from './snapshot';
import { SnapshotDiff } from './diff';

const mockEndpoint: Endpoint = { method: 'GET', path: '/api/test', status: 200, responseTime: 50 };
const mockDiff: SnapshotDiff = { added: [], removed: [], changed: [] };

beforeEach(() => clearPlugins());

test('registers and lists plugins', () => {
  registerPlugin({ name: 'pluginA' });
  registerPlugin({ name: 'pluginB' });
  expect(listPlugins()).toEqual(['pluginA', 'pluginB']);
});

test('throws on duplicate plugin name', () => {
  registerPlugin({ name: 'dup' });
  expect(() => registerPlugin({ name: 'dup' })).toThrow('already registered');
});

test('unregisters plugin', () => {
  registerPlugin({ name: 'toRemove' });
  expect(unregisterPlugin('toRemove')).toBe(true);
  expect(listPlugins()).not.toContain('toRemove');
});

test('unregister returns false for unknown plugin', () => {
  expect(unregisterPlugin('ghost')).toBe(false);
});

test('runSnapshotPlugins calls onSnapshot hooks', async () => {
  const received: Endpoint[][] = [];
  const plugin: RouteWatchPlugin = {
    name: 'snapPlugin',
    onSnapshot: async (endpoints) => { received.push(endpoints); },
  };
  registerPlugin(plugin);
  await runSnapshotPlugins([mockEndpoint]);
  expect(received).toHaveLength(1);
  expect(received[0]).toEqual([mockEndpoint]);
});

test('runDiffPlugins calls onDiff hooks', async () => {
  const diffs: SnapshotDiff[] = [];
  const plugin: RouteWatchPlugin = {
    name: 'diffPlugin',
    onDiff: async (diff) => { diffs.push(diff); },
  };
  registerPlugin(plugin);
  await runDiffPlugins(mockDiff);
  expect(diffs).toHaveLength(1);
});

test('plugins without hooks are skipped silently', async () => {
  registerPlugin({ name: 'noHooks' });
  await expect(runSnapshotPlugins([mockEndpoint])).resolves.toBeUndefined();
  await expect(runDiffPlugins(mockDiff)).resolves.toBeUndefined();
});
