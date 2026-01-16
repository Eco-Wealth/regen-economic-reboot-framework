import fs from 'node:fs';
import path from 'node:path';

export type Leaderboard = Record<string, number>;

export function loadLeaderboard(outDir: string): Leaderboard {
  const p = path.join(outDir, 'leaderboard.json');
  if (!fs.existsSync(p)) return {};
  try {
    const raw = fs.readFileSync(p, 'utf-8');
    return (JSON.parse(raw) as Leaderboard) ?? {};
  } catch {
    return {};
  }
}

export function saveLeaderboard(outDir: string, lb: Leaderboard) {
  const p = path.join(outDir, 'leaderboard.json');
  fs.writeFileSync(p, JSON.stringify(lb, null, 2));
}

export function increment(lb: Leaderboard, addr: string, by: number) {
  const key = addr.toLowerCase();
  lb[key] = (lb[key] ?? 0) + by;
}
