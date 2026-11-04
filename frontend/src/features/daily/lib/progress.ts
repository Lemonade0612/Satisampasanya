import { load, save, today } from './storage';
import type { GameId } from '../types';

type Progress = { streak: number; lastDay: string | null; best: Record<string, number>; completed: string[] };
const KEY = 'sati-daily-progress';

export const getProgress = () => load<Progress>(KEY, { streak: 0, lastDay: null, best: {}, completed: [] });

// Streak counts days with at least one finished session; missing a day resets it.
export function finishSession(game: GameId | string, score: number, scenarioIds: string[] = []) {
  const p = getProgress();
  const d = today();
  if (p.lastDay !== d) {
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    p.streak = p.lastDay === yesterday ? p.streak + 1 : 1;
    p.lastDay = d;
  }
  p.best[game] = Math.max(p.best[game] || 0, score);
  p.completed = Array.from(new Set([...p.completed, ...scenarioIds]));
  save(KEY, p);
  return p;
}

const LIKES = 'sati-daily-likes';
type Likes = Record<string, { liked: boolean; count: number }>;
// Seed counts so the demo doesn't start at zero; the user's own like adds on top.
const SEED: Record<string, number> = { story: 128, flags: 96, realorscam: 154, links: 71, dash: 203 };
export function getLike(id: string) {
  const all = load<Likes>(LIKES, {});
  return all[id] ?? { liked: false, count: SEED[id] ?? 0 };
}
export function toggleLike(id: string) {
  const all = load<Likes>(LIKES, {});
  const cur = all[id] ?? { liked: false, count: SEED[id] ?? 0 };
  const next = { liked: !cur.liked, count: cur.count + (cur.liked ? -1 : 1) };
  all[id] = next; save(LIKES, all);
  return next;
}
