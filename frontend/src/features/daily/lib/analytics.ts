import { load, save } from './storage';

// Anonymous, local-only. No user id, name or message content is ever stored.
export type DailyEvent =
  | { type: 'session_start'; mode: string }
  | { type: 'scenario_start'; scenarioId: string; scamType: string }
  | { type: 'scenario_complete'; scenarioId: string; scamType: string; correct: number; total: number }
  | { type: 'choice_made'; scenarioId: string; scamType: string; step: string; correct: boolean }
  | { type: 'flag_missed'; scenarioId: string; flag: string }
  | { type: 'drop_off_step'; scenarioId: string; step: string };

type Logged = DailyEvent & { t: number };
const KEY = 'sati-daily-events';
const MAX = 5000;

export function track(event: DailyEvent) {
  const events = load<Logged[]>(KEY, []);
  events.push({ ...event, t: Date.now() });
  save(KEY, events.slice(-MAX));
}
export const readEvents = () => load<Logged[]>(KEY, []);
export const clearEvents = () => save(KEY, []);

export function summarize(events: Logged[] = readEvents()) {
  const starts = events.filter(e => e.type === 'scenario_start').length;
  const completes = events.filter(e => e.type === 'scenario_complete').length;
  const byType: Record<string, { right: number; total: number }> = {};
  const missed: Record<string, number> = {};
  for (const e of events) {
    if (e.type === 'choice_made') {
      const row = byType[e.scamType] ??= { right: 0, total: 0 };
      row.total++; if (e.correct) row.right++;
    }
    if (e.type === 'flag_missed') missed[e.flag] = (missed[e.flag] || 0) + 1;
  }
  const missedSorted = Object.entries(missed).sort((a, b) => b[1] - a[1]);
  return {
    sessions: events.filter(e => e.type === 'session_start').length,
    total: events.length,
    starts, completes,
    completionRate: starts ? completes / starts : 0,
    byType, missedSorted,
  };
}
