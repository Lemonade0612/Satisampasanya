import { useEffect, useSyncExternalStore } from 'react';
import data from '../data/scenarios.json';
import { BAND_SESSIONS } from '../data/bandSessions';
import { API_BASE } from '../../../lib/api';
import { laoDayNumber } from './storage';
import { filterByBand, forBand, getBand, type Band } from '../../../lib/band';
import type { Scenario } from '../types';

// Only the shipped, expert-reviewed data decides what is playable. Approval is a staff action and
// must never come from this device: an earlier build kept approvals and AI drafts in localStorage,
// so anyone could verify a scenario for themselves. Those leftover keys are cleared and ignored.
try { localStorage.removeItem('sati-daily-review'); localStorage.removeItem('sati-daily-drafts'); } catch { /* storage unavailable */ }

export const allScenarios = (): Scenario[] => [...(data.scenarios as Scenario[]), ...BAND_SESSIONS];

// Live scenarios published by reviewers, per band. The server only ever sends live ones for the band asked for,
// plus the ids of built-in scenarios reviewers have retired.
// Unreachable or slow server: nothing is stored and players get the bundled set, so the games always work offline.
const live: Partial<Record<Band, Scenario[]>> = {};
let retired = new Set<string>();
const loading = new Set<Band>();
const subs = new Set<() => void>();
let version = 0;
export async function loadLiveScenarios(band: Band) {
  if (live[band] || loading.has(band)) return;
  loading.add(band);
  const stop = new AbortController(), timer = setTimeout(() => stop.abort(), 8000);
  try {
    const res = await fetch(`${API_BASE}/scenarios?band=${band}`, { signal: stop.signal });
    const body = res.ok ? await res.json() as { scenarios?: unknown; retired?: unknown } : null;
    if (body && Array.isArray(body.scenarios)) {
      live[band] = body.scenarios as Scenario[];
      if (Array.isArray(body.retired)) retired = new Set(body.retired.filter((id): id is string => typeof id === 'string'));
      version++; subs.forEach(fn => fn());
    }
  } catch { /* offline: bundled scenarios only */ } finally { clearTimeout(timer); loading.delete(band); }
}
// Fetches the band's live list when the band changes and re-renders once it arrives.
export function useLiveScenarios(band: Band) {
  useEffect(() => { void loadLiveScenarios(band); }, [band]);
  return useSyncExternalStore(fn => { subs.add(fn); return () => { subs.delete(fn); }; }, () => version);
}

// Players only get verified sessions for their band, with the Kids text swapped in where one exists.
// A live server scenario replaces a bundled one with the same id; retired bundled ids are hidden.
export function playable(band: Band = getBand()) {
  const fromServer = live[band] ?? [];
  const ids = new Set(fromServer.map(s => s.id));
  const pool = [...allScenarios().filter(s => s.status === 'verified' && !ids.has(s.id) && !retired.has(s.id)), ...fromServer];
  return filterByBand(pool, band).map(s => withPlainTitle(forBand(s, band)));
}
// The UI adds the boss label itself, so a title that already starts with one (older data, or a scenario
// published from the server) would show it twice: "ດ່ານບອສ: ດ່ານບອສ: …".
const BOSS_PREFIX = /^\s*(?:boss|ດ່ານບອສ|ບອສ)\s*[:：·-]\s*/i;
export const plainTitle = (title: string) => title.replace(BOSS_PREFIX, '');
const withPlainTitle = (s: Scenario): Scenario =>
  BOSS_PREFIX.test(s.title.en) || BOSS_PREFIX.test(s.title.lo) ? { ...s, title: { en: plainTitle(s.title.en), lo: plainTitle(s.title.lo) } } : s;
// The week is recomputed from the band, so switching bands swaps the level. Progress is kept per
// scenario id, so the streak and anything already finished stay intact.
export const weeklyLevel = (band: Band = getBand()) => {
  const list = playable(band);
  return [...list.filter(s => !s.boss), ...list.filter(s => s.boss)];
};
// Same session all day (and after a refresh): the day number picks from the band's pool in a fixed order.
export function scenarioOfTheDay(band: Band = getBand()): Scenario | undefined {
  const list = playable(band).filter(s => !s.boss).sort((a, b) => a.id.localeCompare(b.id));
  return list.length ? list[laoDayNumber() % list.length] : undefined;
}
export const weekId = data.week;
