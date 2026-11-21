// Takes dev posts the screener misses and asks the AI for 5 evasive variants of each, grades them, and appends them to TRAIN.
//   node backend/screening/agents/redteam.mjs [--lang=en] [--limit=40]
// Source posts come from dev only (never locked). Variants go to train, so the next dev eval stays an honest test.
import { screenText } from '../screen.mjs';
import { loadSet } from '../eval.mjs';
import { DEFINITIONS } from './spec.mjs';
import { argOf, key, knownKeys, appendJsonl, generatedPath, realAsk } from './common.mjs';
import { gradeRow } from './grader.mjs';

const SCHEMA = { type: 'object', additionalProperties: false, required: ['variants'], properties: { variants: { type: 'array', items: { type: 'string' } } } };
export function findMisses(rows) { return rows.filter(r => r.labels.length && screenText(r.text).status === 'green'); }
export async function redteam({ rows = loadSet('dev'), limit = 40, ask = realAsk, grade = gradeRow, log = () => {} } = {}) {
  const misses = findMisses(rows).slice(0, limit), known = knownKeys(), out = [], weak = {};
  for (const m of misses) {
    const cat = m.labels[0]; weak[cat] = (weak[cat] || 0) + 1;
    const res = await ask(`You help harden a content-safety screener. Rewrite the given ${cat} post (${DEFINITIONS[cat]}) as exactly 5 different variants that keep the same harmful intent but change wording, slang, spelling, spacing, emoji, or hide key words. Return JSON only.`, { post: m.text }, SCHEMA);
    for (const v of (Array.isArray(res?.variants) ? res.variants : []).slice(0, 5)) {
      const k = key(v); if (typeof v !== 'string' || known.has(k)) continue;
      const row = { id: `rt-${m.id}-${out.length + 1}`, text: v.trim(), labels: [cat], split: 'train', lang: 'en', source: 'redteam', parent: m.id, graded: false };
      const g = await grade(row, ask); if (!g.keep) continue;
      known.add(k); out.push({ ...row, graded: true, graderConfidence: g.conf });
    }
    log(`${cat}: ${out.length} variants so far`);
  }
  return { misses: misses.length, variants: out, weakCategories: weak };
}
if (process.argv[1] && import.meta.url === new URL(process.argv[1], 'file:').href) {
  const r = await redteam({ limit: Number(argOf('limit', 40)), log: console.error });
  appendJsonl(generatedPath(argOf('lang', 'en')), r.variants);
  console.log(`dev misses: ${r.misses}, graded variants added to train: ${r.variants.length}`, r.weakCategories);
}
