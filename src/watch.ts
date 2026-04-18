import { fetchEndpoint } from './fetch';
import { probeResultToEndpoint } from './probe';
import { loadSnapshot, saveSnapshot } from './storage';
import { createSnapshotFile } from './snapshot';
import { diffSnapshots, isEmptyDiff } from './diff';
import { formatReport } from './report';

export interface WatchOptions {
  url: string;
  interval: number; // seconds
  label?: string;
  onDiff?: (report: string) => void;
  onError?: (err: Error) => void;
}

export interface WatchHandle {
  stop: () => void;
}

export function startWatch(options: WatchOptions): WatchHandle {
  const { url, interval, label, onDiff, onError } = options;

  async function poll(): Promise<void> {
    try {
      const result = await fetchEndpoint(url);
      const endpoint = probeResultToEndpoint(result);
      const snapshot = createSnapshotFile(label ?? url, [endpoint]);

      const previous = await loadSnapshot(label ?? url).catch(() => null);
      await saveSnapshot(label ?? url, snapshot);

      if (previous) {
        const diff = diffSnapshots(previous, snapshot);
        if (!isEmptyDiff(diff) && onDiff) {
          onDiff(formatReport(diff));
        }
      }
    } catch (err) {
      if (onError) onError(err as Error);
    }
  }

  poll();
  const timer = setInterval(poll, interval * 1000);

  return {
    stop: () => clearInterval(timer),
  };
}
