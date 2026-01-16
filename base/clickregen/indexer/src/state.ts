import fs from 'node:fs';
import path from 'node:path';

export type IndexerState = {
  lastProcessedBlock: string; // bigint serialized
};

export function loadState(outDir: string): IndexerState | null {
  const p = path.join(outDir, 'state.json');
  if (!fs.existsSync(p)) return null;
  try {
    const raw = fs.readFileSync(p, 'utf-8');
    return JSON.parse(raw) as IndexerState;
  } catch {
    return null;
  }
}

export function saveState(outDir: string, st: IndexerState) {
  const p = path.join(outDir, 'state.json');
  fs.writeFileSync(p, JSON.stringify(st, null, 2));
}
