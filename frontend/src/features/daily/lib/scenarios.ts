import data from '../data/scenarios.json';
import { load, save } from './storage';
import type { Scenario } from '../types';

const KEY = 'sati-daily-review';
type Review = { status: Scenario['status']; verifiedBy: string | null; verifiedAt: string | null };
const EXTRA = 'sati-daily-drafts';

// Verifier decisions are stored as an overlay so the source JSON stays the reviewed baseline.
export function allScenarios(): Scenario[] {
  const reviews = load<Record<string, Review>>(KEY, {});
  const base = [...(data.scenarios as Scenario[]), ...load<Scenario[]>(EXTRA, [])];
  return base.map(s => reviews[s.id] ? { ...s, ...reviews[s.id] } : s);
}
export const playable = () => allScenarios().filter(s => s.status === 'verified');
export const weeklyLevel = () => {
  const list = playable();
  return [...list.filter(s => !s.boss), ...list.filter(s => s.boss)];
};
export function scenarioOfTheDay() {
  const list = playable().filter(s => !s.boss);
  return list[Math.floor(Date.now() / 86400000) % list.length];
}
export function review(id: string, approve: boolean, verifier: string) {
  const reviews = load<Record<string, Review>>(KEY, {});
  reviews[id] = { status: approve ? 'verified' : 'rejected', verifiedBy: approve ? verifier : null, verifiedAt: approve ? new Date().toISOString().slice(0, 10) : null };
  save(KEY, reviews);
}
export function addDraft(s: Scenario) { save(EXTRA, [...load<Scenario[]>(EXTRA, []), s]); }
export const weekId = data.week;
