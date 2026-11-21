import { liveScenarios, BANDS } from './scenarios.mjs';

// Deterministic daily pick: the same band and date always give the same scenarios, on every server, with no cron or stored state.
const laosDate = (now = Date.now()) => new Date(now + 7 * 3600000).toISOString().slice(0, 10);
function hash(text) { let h = 2166136261; for (const c of text) { h ^= c.codePointAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }
function rng(seed) { let a = seed; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
export function dailyPick(scenarios, band, date, count = 3) {
  const list = [...scenarios].sort((a, b) => String(a.id).localeCompare(String(b.id)));
  const next = rng(hash(`${date}|${band}`));
  for (let i = list.length - 1; i > 0; i--) { const j = Math.floor(next() * (i + 1)); [list[i], list[j]] = [list[j], list[i]]; }
  return list.slice(0, Math.max(0, Math.min(count, list.length)));
}
export function dailyRoutes({ req, res, path, url, db, send, band }) {
  if (req.method !== 'GET' || path !== '/api/scenarios/daily') return false;
  if (!BANDS.includes(band)) throw Object.assign(new Error('Choose a valid age band.'), { status: 400 });
  const dateParam = url.searchParams.get('date'), date = dateParam ?? laosDate();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(date))) throw Object.assign(new Error('Use a date like 2026-11-22.'), { status: 400 });
  const count = Number(url.searchParams.get('count') || 3);
  if (!Number.isInteger(count) || count < 1 || count > 10) throw Object.assign(new Error('count must be 1 to 10.'), { status: 400 });
  send(res, 200, { date, band, scenarios: dailyPick(liveScenarios(db, band), band, date, count) });
  return true;
}
