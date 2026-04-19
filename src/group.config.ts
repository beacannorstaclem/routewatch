import { isGroupField, type GroupField } from './group';
import { readFileSync } from 'fs';

export interface GroupConfig {
  field: GroupField;
}

export function parseGroupConfig(raw: unknown): GroupConfig {
  if (typeof raw !== 'object' || raw === null) {
    throw new Error('Invalid group config');
  }
  const obj = raw as Record<string, unknown>;
  const field = obj['field'];
  if (typeof field !== 'string' || !isGroupField(field)) {
    throw new Error(`Invalid group field: ${field}`);
  }
  return { field };
}

export function loadGroupConfig(filePath: string): GroupConfig {
  const raw = JSON.parse(readFileSync(filePath, 'utf-8'));
  const group = (raw as Record<string, unknown>)['group'];
  return parseGroupConfig(group ?? raw);
}
