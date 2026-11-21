// Builds testdata/dev2.jsonl (tunable) and testdata/locked/en.jsonl (locked, built ONCE: refuses to overwrite).
// Run: node backend/screening/testdata/build-sets.mjs
import { writeFileSync, existsSync, readFileSync } from 'node:fs';
import { HARM2, SAFE2 } from './dev2.mjs';
import { HARM, SAFE } from './locked/source.mjs';
const here = p => new URL(p, import.meta.url);
const key = t => t.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
const existing = new Set(readFileSync(here('./en.jsonl'), 'utf8').trim().split('\n').map(l => key(JSON.parse(l).text)));
const rows = (h, s, prefix, split, extra) => { let n = 0; const seen = new Set(), out = [];
  const add = (text, labels) => { const k = key(text); if (seen.has(k) || existing.has(k)) return; seen.add(k); out.push({ id: `${prefix}-${String(++n).padStart(4, '0')}`, text, labels, split, ...extra }); };
  for (const [cat, list] of Object.entries(h)) for (const t of list) add(t, [cat]);
  for (const t of s) add(t, []);
  return out; };
const dev = rows(HARM2, SAFE2, 'dev2', 'dev', { author: 'claude-hand' });
writeFileSync(here('./dev2.jsonl'), dev.map(r => JSON.stringify(r)).join('\n') + '\n');
console.log('dev2.jsonl', dev.length);
if (existsSync(here('./locked/en.jsonl'))) console.log('locked/en.jsonl exists: not rebuilt (locked).');
else {
  const devKeys = new Set(dev.map(r => key(r.text))); for (const k of devKeys) existing.add(k);
  const locked = rows(HARM, SAFE, 'lk', 'locked', { author: 'claude-hand', review: 'pending' });
  writeFileSync(here('./locked/en.jsonl'), locked.map(r => JSON.stringify(r)).join('\n') + '\n');
  console.log('locked/en.jsonl', locked.length, 'harm', locked.filter(r => r.labels.length).length, 'safe', locked.filter(r => !r.labels.length).length);
}
