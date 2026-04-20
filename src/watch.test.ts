import { startWatch, WatchHandle } from './watch';
import * as fetch from './fetch';
import * as storage from './storage';
import * as snapshot from './snapshot';
import * as diff from './diff';
import * as report from './report';

jest.useFakeTimers();

const mockEndpoint = { method: 'GET', path: '/health', status: 200, responseTime: 42 };
const mockSnapshot = { label: 'test', timestamp: '2024-01-01T00:00:00.000Z', endpoints: [mockEndpoint] };
const mockDiff = { added: [], removed: [], changed: [{ key: 'GET /health', before: mockEndpoint, after: { ...mockEndpoint, status: 503 } }] };

beforeEach(() => {
  jest.spyOn(fetch, 'fetchEndpoint').mockResolvedValue({ url: '/health', status: 200, responseTime: 42, headers: {}, body: '' });
  jest.spyOn(storage, 'loadSnapshot').mockResolvedValue(mockSnapshot as any);
  jest.spyOn(storage, 'saveSnapshot').mockResolvedValue();
  jest.spyOn(snapshot, 'createSnapshotFile').mockReturnValue(mockSnapshot as any);
  jest.spyOn(diff, 'diffSnapshots').mockReturnValue(mockDiff as any);
  jest.spyOn(diff, 'isEmptyDiff').mockReturnValue(false);
  jest.spyOn(report, 'formatReport').mockReturnValue('DIFF REPORT');
});

afterEach(() => jest.clearAllMocks());

test('startWatch calls poll immediately and sets interval', async () => {
  const onDiff = jest.fn();
  const handle: WatchHandle = startWatch({ url: 'http://localhost/health', interval: 30, onDiff });
  await Promise.resolve();
  expect(fetch.fetchEndpoint).toHaveBeenCalledTimes(1);
  handle.stop();
});

test('onDiff is called when diff is not empty', async () => {
  const onDiff = jest.fn();
  const handle = startWatch({ url: 'http://localhost/health', interval: 30, onDiff });
  await Promise.resolve();
  await Promise.resolve();
  expect(onDiff).toHaveBeenCalledWith('DIFF REPORT');
  handle.stop();
});

test('onDiff is not called when diff is empty', async () => {
  jest.spyOn(diff, 'isEmptyDiff').mockReturnValue(true);
  const onDiff = jest.fn();
  const handle = startWatch({ url: 'http://localhost/health', interval: 30, onDiff });
  await Promise.resolve();
  await Promise.resolve();
  expect(onDiff).not.toHaveBeenCalled();
  handle.stop();
});

test('onError is called on fetch failure', async () => {
  (fetch.fetchEndpoint as jest.Mock).mockRejectedValue(new Error('network error'));
  const onError = jest.fn();
  const handle = startWatch({ url: 'http://localhost/health', interval: 30, onError });
  await Promise.resolve();
  await Promise.resolve();
  expect(onError).toHaveBeenCalledWith(expect.any(Error));
  handle.stop();
});

test('stop clears the interval', () => {
  const handle = startWatch({ url: 'http://localhost/health', interval: 5 });
  handle.stop();
  jest.advanceTimersByTime(10000);
  expect(fetch.fetchEndpoint).toHaveBeenCalledTimes(1);
});
