import { LIKES_KEY, PROGRESS_KEY, laoDay, load, save, scoped, today } from './storage';
import type { GameId } from '../types';

type Progress = { streak: number; lastDay: string | null; best: Record<string, number>; completed: string[]; played?: number; doneDay?: string; doneGames?: string[]; xp?: number; missionDay?: string };
export const getProgress = () => load<Progress>(scoped(PROGRESS_KEY), { streak: 0, lastDay: null, best: {}, completed: [] });

// The streak shown today: still alive if the last session was today or yesterday, otherwise broken.
export function currentStreak(p: Progress = getProgress()) {
  return p.lastDay === today() || p.lastDay === laoDay(-1) ? p.streak : 0;
}

// Streak counts days with at least one finished session; missing a day resets it.
export function finishSession(game: GameId | string, score: number, scenarioIds: string[] = [], opts: { xp?: number; mission?: boolean } = {}) {
  const p = getProgress();
  const d = today();
  if (p.lastDay !== d) {
    p.streak = p.lastDay === laoDay(-1) ? p.streak + 1 : 1;
    p.lastDay = d;
  }
  p.played = (p.played || 0) + 1;
  // Which games were finished today, for the "Done today" mark on the home cards.
  if (p.doneDay !== d) { p.doneDay = d; p.doneGames = []; }
  p.doneGames = Array.from(new Set([...(p.doneGames || []), String(game)]));
  p.best[game] = Math.max(p.best[game] || 0, score);
  p.completed = Array.from(new Set([...p.completed, ...scenarioIds]));
  // XP: every finished game earns some; today's mission earns more, once a day.
  const mission = !!opts.mission && p.missionDay !== d;
  if (mission) p.missionDay = d;
  p.xp = (p.xp || 0) + (mission ? MISSION_XP : opts.xp ?? GAME_XP);
  save(scoped(PROGRESS_KEY), p);
  return p;
}

// Likes are this player's own choice only. No count is shown: there is no shared like data behind it,
// and invented numbers would look like other people's activity.
type Likes = Record<string, boolean>;
const readLikes = () => { const all = load<Record<string, unknown>>(scoped(LIKES_KEY), {}); return Object.fromEntries(Object.entries(all).map(([k, v]) => [k, typeof v === 'object' && v ? !!(v as { liked?: boolean }).liked : !!v])) as Likes; };
export const getLike = (id: string) => ({ liked: !!readLikes()[id] });
export function toggleLike(id: string) {
  const all = readLikes();
  all[id] = !all[id]; save(scoped(LIKES_KEY), all);
  return { liked: all[id] };
}

export const playedToday = (game: string, p: Progress = getProgress()) => p.doneDay === today() && !!p.doneGames?.includes(game);

export const GAME_XP = 20, MISSION_XP = 30, XP_PER_LEVEL = 200;
export const missionDone = (p: Progress = getProgress()) => p.missionDay === today();
export function levelInfo(p: Progress = getProgress()) {
  const xp = p.xp || 0;
  return { level: Math.floor(xp / XP_PER_LEVEL) + 1, xp: xp % XP_PER_LEVEL, need: XP_PER_LEVEL };
}
