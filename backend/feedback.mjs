import { randomUUID } from 'node:crypto';
import { makeLimiter } from './limit.mjs';

// Website feedback. Public (the marketing site has no sign-in), so it is rate limited per client and has a honeypot field.
const allow = makeLimiter(5, 3600000);
const fail = (message, status = 400) => { throw Object.assign(new Error(message), { status }); };
const str = (v, max, name, required = false) => {
  if (v === undefined || v === null || v === '') { if (required) fail(`${name} is required.`); return ''; }
  if (typeof v !== 'string') fail(`${name} must be text.`);
  const t = v.trim(); if (required && !t) fail(`${name} is required.`); if (t.length > max) fail(`${name} must be at most ${max} characters.`); return t;
};
export function validateFeedback(d) {
  if (!d || typeof d !== 'object' || Array.isArray(d)) fail('Send a JSON object.');
  const email = str(d.email, 254, 'Email');
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fail('Enter a valid email address.');
  const message = str(d.message, 2000, 'Message', true);
  if (message.length < 5) fail('Message must be at least 5 characters.');
  return { name: str(d.name, 80, 'Name'), email, message, page: str(d.page, 200, 'Page'), lang: d.lang === 'en' ? 'en' : 'lo' };
}
// Returns true when the request was handled.
export async function feedbackRoutes({ req, res, path, db, user, send, body, ip }) {
  if (req.method === 'POST' && path === '/api/feedback') {
    if (!allow(ip)) fail('Too many messages. Please try again later.', 429);
    const data = await body();
    if (typeof data.website === 'string' && data.website.trim()) { send(res, 202, { ok: true }); return true; } // honeypot: bots fill hidden fields
    const f = validateFeedback(data), id = randomUUID();
    db.prepare('INSERT INTO feedback(id,user_id,name,email,message,page,lang,created) VALUES (?,?,?,?,?,?,?,?)').run(id, user?.id ?? null, f.name, f.email, f.message, f.page, f.lang, Date.now());
    send(res, 201, { ok: true, id }); return true;
  }
  return false;
}
export const listFeedback = (db, limit = 200) => db.prepare('SELECT id,user_id AS userId,name,email,message,page,lang,created FROM feedback ORDER BY created DESC LIMIT ?').all(limit);
