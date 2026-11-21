import { randomUUID } from 'node:crypto';
import { makeLimiter } from './limit.mjs';
import { BANDS } from './scenarios.mjs';

// Anonymous scam-check counts. Only a category, a verdict, an age band and a time are stored: no message text, no user id, no IP.
export const CATEGORIES = ['fake_job', 'prize', 'bank_phishing', 'overseas_recruitment', 'investment', 'game_item', 'stranger', 'romance', 'loan', 'impersonation', 'family_emergency', 'safety_basics', 'other'];
export const VERDICTS = ['green', 'yellow', 'red'];
const allow = makeLimiter(30, 600000);
const MIN_PUBLIC = 3; // a category is shown publicly only when at least this many reports share it, so a trend never points at one person
const DAY = 86400000;
const fail = (message, status = 400) => { throw Object.assign(new Error(message), { status }); };
const laosDay = t => new Date(t + 7 * 3600000).toISOString().slice(0, 10);

export function validateReport(d, now = Date.now()) {
  if (!d || typeof d !== 'object' || Array.isArray(d)) fail('Send a JSON object.');
  const extra = Object.keys(d).filter(k => !['category', 'verdict', 'band', 'createdAt'].includes(k));
  if (extra.length) fail('Only category, verdict, band and createdAt are accepted.'); // no free text can slip in
  if (!CATEGORIES.includes(d.category)) fail('Unknown category.');
  if (!VERDICTS.includes(d.verdict)) fail('Verdict must be green, yellow or red.');
  if (!BANDS.includes(d.band)) fail('Choose a valid age band.');
  let created = now;
  if (d.createdAt !== undefined) { const t = typeof d.createdAt === 'number' ? d.createdAt : Date.parse(d.createdAt); if (!Number.isFinite(t)) fail('Invalid createdAt.'); if (Math.abs(t - now) <= DAY) created = t; } // clients can be late or off by a clock; far dates are replaced by server time
  return { category: d.category, verdict: d.verdict, band: d.band, created };
}
const tally = (db, sql, ...args) => db.prepare(sql).all(...args);
export function trend(db, { band, days = 7, now = Date.now() } = {}) {
  const from = now - days * DAY, prev = from - days * DAY, filter = band ? ' AND band=?' : '', extra = band ? [band] : [];
  const cur = db.prepare(`SELECT category,COUNT(*) count FROM scam_reports WHERE created>=?${filter} GROUP BY category ORDER BY count DESC,category`).all(from, ...extra);
  const total = cur.reduce((n, r) => n + r.count, 0);
  const before = db.prepare(`SELECT COUNT(*) n FROM scam_reports WHERE created>=? AND created<?${filter}`).get(prev, from, ...extra).n;
  const perDay = new Map(db.prepare(`SELECT created FROM scam_reports WHERE created>=?${filter}`).all(from, ...extra).map(r => laosDay(r.created)).reduce((m, d) => m.set(d, (m.get(d) || 0) + 1), new Map()));
  const daily = Array.from({ length: days }, (_, i) => { const d = laosDay(now - (days - 1 - i) * DAY); return { date: d, count: perDay.get(d) || 0 }; });
  return { band: band || null, days, total, previousTotal: before, changePct: before ? Math.round((total - before) / before * 100) : null, top: cur.filter(r => r.count >= MIN_PUBLIC).slice(0, 5), daily };
}
export function reportStats(db) {
  return {
    total: db.prepare('SELECT COUNT(*) n FROM scam_reports').get().n,
    byCategory: tally(db, 'SELECT category,COUNT(*) count FROM scam_reports GROUP BY category ORDER BY count DESC,category'),
    byVerdict: tally(db, 'SELECT verdict,COUNT(*) count FROM scam_reports GROUP BY verdict ORDER BY verdict'),
    byBand: tally(db, 'SELECT band,COUNT(*) count FROM scam_reports GROUP BY band ORDER BY band'),
    last7Days: trend(db, { days: 7 }),
  };
}
export async function reportRoutes({ req, res, path, url, db, send, body, ip }) {
  if (req.method === 'POST' && path === '/api/reports') {
    if (!allow(ip)) fail('Too many reports. Please try again later.', 429);
    const r = validateReport(await body());
    db.prepare('INSERT INTO scam_reports(id,category,verdict,band,created) VALUES (?,?,?,?,?)').run(randomUUID(), r.category, r.verdict, r.band, r.created);
    send(res, 201, { ok: true }); return true;
  }
  if (req.method === 'GET' && path === '/api/reports/trend') {
    const band = url.searchParams.get('band') || undefined; if (band && !BANDS.includes(band)) fail('Choose a valid age band.');
    const days = Number(url.searchParams.get('days') || 7); if (!Number.isInteger(days) || days < 1 || days > 30) fail('days must be 1 to 30.');
    send(res, 200, trend(db, { band, days })); return true;
  }
  return false;
}
