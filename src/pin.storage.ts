import * as fs from 'fs';
import * as path from 'path';
import { PinEntry } from './pin';
import { getSnapshotsDir } from './storage';

export function getPinFilePath(): string {
  return path.join(getSnapshotsDir(), 'pins.json');
}

export function loadPins(): PinEntry[] {
  const filePath = getPinFilePath();
  if (!fs.existsSync(filePath)) return [];
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as PinEntry[];
  } catch {
    return [];
  }
}

export function savePins(pins: PinEntry[]): void {
  const filePath = getPinFilePath();
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filePath, JSON.stringify(pins, null, 2), 'utf-8');
}

export function addPin(entry: PinEntry): PinEntry[] {
  const pins = loadPins();
  const exists = pins.some((p) => p.key === entry.key);
  if (exists) {
    const updated = pins.map((p) => (p.key === entry.key ? entry : p));
    savePins(updated);
    return updated;
  }
  const updated = [...pins, entry];
  savePins(updated);
  return updated;
}

export function deletePin(key: string): PinEntry[] {
  const pins = loadPins();
  const updated = pins.filter((p) => p.key !== key);
  savePins(updated);
  return updated;
}

export function clearPins(): void {
  savePins([]);
}
