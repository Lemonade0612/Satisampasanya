// Builds en.jsonl from templates.mjs, deterministically (seeded). Run: node backend/screening/testdata/gen.mjs
import { writeFileSync } from 'node:fs';
import { HARM, SAFE } from './templates.mjs';

let seed = 20261122;
const rnd = () => { seed = (seed + 0x6D2B79F5) >>> 0; let t = seed; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const pick = list => list[Math.floor(rnd() * list.length)];
const expand = t => t.replace(/\{([^{}]+)\}/g, (_, g) => pick(g.split('|')));

const LEET = { a: '4', e: '3', i: '1', o: '0', s: '5', t: '7' };
const HOMO = { a: 'а', e: 'е', o: 'о', p: 'р', c: 'с', y: 'у', x: 'х', i: 'і' };
const LAO = ['ລະວັງ', 'ຟຣີ ຟຣີ', 'ດ່ວນ', 'ສະບາຍດີ', 'ຂອບໃຈ', 'ທັກມາເລີຍ', 'ເງິນດີ', 'ໂອເຄ'];
const EMOJI = ['🔥', '💰', '📢', '‼️', '😍', '👇', '✅', '🚨'];
const wordsOf = t => t.split(/(\s+)/);
const alphaWords = t => wordsOf(t).map((w, i) => [w, i]).filter(([w]) => /^[A-Za-z]{4,}$/.test(w)).map(([, i]) => i);
const mapWords = (t, fn, n = 2) => { const parts = wordsOf(t), idx = alphaWords(t); for (let k = 0; k < n && idx.length; k++) { const j = idx.splice(Math.floor(rnd() * idx.length), 1)[0]; parts[j] = fn(parts[j]); } return parts.join(''); };
const TRANSFORMS = {
  leet: t => mapWords(t, w => [...w].map(c => LEET[c.toLowerCase()] && rnd() < 0.7 ? LEET[c.toLowerCase()] : c).join(''), 3),
  spaced: t => mapWords(t, w => [...w].join(' '), 2),
  dotted: t => mapWords(t, w => [...w].join('.'), 1),
  homoglyph: t => mapWords(t, w => [...w].map(c => HOMO[c.toLowerCase()] && rnd() < 0.7 ? HOMO[c.toLowerCase()] : c).join(''), 3),
  zerowidth: t => mapWords(t, w => [...w].join('​'), 3),
  caps: t => t.toUpperCase() + '!!!',
  emoji: t => `${pick(EMOJI)} ${t} ${pick(EMOJI)}${pick(EMOJI)}`,
  typos: t => mapWords(t, w => w.length > 4 ? w.slice(0, 2) + w.slice(3) : w, 3),
  repeat: t => mapWords(t, w => w + w.slice(-1).repeat(3), 2),
  mixedLao: t => rnd() < 0.5 ? `${pick(LAO)} ${t}` : `${t} ${pick(LAO)}`,
  masked: t => mapWords(t, w => w.slice(0, 1) + '*' + w.slice(2), 2),
};
const NAMES = Object.keys(TRANSFORMS);
const HOLDOUT_INDEX = new Set([4, 9, 14, 19]); // 4 of 20 templates (20%) per category are never trained on

const rows = []; let n = 0;
const add = (text, labels, tier, group, holdout, transform) => rows.push({ id: `en-${String(++n).padStart(4, '0')}`, text, labels, tier, group, split: holdout ? 'holdout' : 'train', ...(transform ? { transform } : {}) });
for (const [cat, tiers] of Object.entries(HARM)) {
  const all = [...tiers.obvious.map(t => ['obvious', t]), ...tiers.subtle.map(t => ['subtle', t])];
  const base = all.map(([tier, t], i) => ({ tier, text: expand(t), group: `${cat}-${i}`, holdout: HOLDOUT_INDEX.has(i) }));
  for (const b of base) add(b.text, [cat], b.tier, b.group, b.holdout);
  // 30 disguised copies, spread so every template group gets at least one, including the held-out ones.
  for (let k = 0; k < 30; k++) {
    const b = base[k % base.length], tf = NAMES[(k * 3 + cat.length) % NAMES.length];
    add(TRANSFORMS[tf](b.text), [cat], 'disguised', b.group, b.holdout, tf);
  }
}
// Safe cases: the hand-written list plus evasion-style variants of ordinary posts (so a trick alone is never treated as a harm).
const ORDINARY = ['Good morning everyone, have a great day', 'Selling nothing, just sharing a photo of the sunset at the Mekong', 'Study group for the exam meets at 3 pm in the library', 'We are hiring a waiter at our family restaurant in Luang Prabang, apply in person with your CV', 'Thanks for all the birthday wishes, I am so happy', 'The library is open on Saturdays from 9 to 4', 'Does anyone have notes from the biology class?', 'Community clean-up at the riverside this Sunday morning, bring gloves', 'Tips for a safe trip: keep copies of your passport in a separate bag', 'Please be kind in the comments, we are all learning', 'Job opening: nurse assistant at the district hospital, apply at the hospital office with your documents', 'Lao New Year celebration photos from our village', 'How can I improve my English for a scholarship interview?', 'I am looking for a roommate near the university, contact me by email', 'Never click unknown links. Instead, go to the official website yourself'];
SAFE.forEach((t, i) => add(t, [], 'safe', `safe-${i}`, i % 5 === 4));
ORDINARY.forEach((t, i) => add(t, [], 'safe', `safe-o${i}`, i % 5 === 4));
ORDINARY.forEach((t, i) => { const tf = ['caps', 'emoji', 'typos', 'mixedLao', 'repeat'][i % 5]; add(TRANSFORMS[tf](t), [], 'safe', `safe-o${i}`, i % 5 === 4, tf); });
SAFE.forEach((t, i) => { if (i % 2 === 0) { const tf = ['caps', 'emoji', 'mixedLao'][i % 3]; add(TRANSFORMS[tf](t), [], 'safe', `safe-${i}`, i % 5 === 4, tf); } });
writeFileSync(new URL('./en.jsonl', import.meta.url), rows.map(r => JSON.stringify(r)).join('\n') + '\n');
const cnt = {}; for (const r of rows) { const k = r.labels[0] || 'safe'; cnt[k] = cnt[k] || { train: 0, holdout: 0 }; cnt[k][r.split]++; }
console.log(rows.length, 'rows'); console.table(cnt);
