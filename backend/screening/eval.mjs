// npm run screen:eval -- --set=dev|holdout|dev2|locked|blind [--mode=local|ai|full|all] [--matrix] [--misses] [--report] [--json]
//  local = rules + classifier only; ai = the AI check only; full = local + AI, stricter wins (the production path).
//  ai/full need a real provider (ANTHROPIC_API_KEY etc.); without one they print "not run".
// The locked set must never drive tuning: --misses is refused on it; --report prints at most 2 example misses for the 5 weakest categories (for the report only).
import { readFileSync, existsSync } from 'node:fs';
import { screenText } from './screen.mjs';
import { CATEGORIES } from './categories.mjs';
import { BLIND, BLIND_SAFE } from './testdata/blind.mjs';

const arg = (n, d) => (process.argv.find(a => a.startsWith(`--${n}=`)) || '').split('=')[1] ?? d;
const flag = n => process.argv.includes(`--${n}`);
const load = f => existsSync(new URL(f, import.meta.url)) ? readFileSync(new URL(f, import.meta.url), 'utf8').trim().split('\n').filter(Boolean).map(l => JSON.parse(l)) : [];
export function loadSet(name) {
  const en = load('./testdata/en.jsonl');
  if (name === 'holdout') return en.filter(r => r.split === 'holdout');
  if (name === 'dev2') return load('./testdata/dev2.jsonl');
  if (name === 'dev') return [...en.filter(r => r.split === 'holdout'), ...load('./testdata/dev2.jsonl'), ...load('./testdata/generated/en.jsonl').filter(r => r.split === 'dev')];
  if (name === 'locked') return load('./testdata/locked/en.jsonl');
  if (name === 'blind') return Object.entries(BLIND).flatMap(([cat, list]) => (Array.isArray(list) ? list : []).map((text, i) => ({ id: `${cat}-${i}`, text, labels: [cat] }))).concat(BLIND_SAFE.map((text, i) => ({ id: `safe-${i}`, text, labels: [] })));
  throw new Error('unknown set ' + name);
}
const pct = (a, b) => b ? Math.round(a / b * 1000) / 10 : null;

// Predict: returns { flagged, cats } for a row in the given mode.
async function predictor(mode) {
  if (mode === 'local') return async text => { const o = screenText(text); return { flagged: o.status !== 'green', cats: o.status === 'green' ? [] : o.categories }; };
  const { aiAvailable, localFirstCheck } = await import('./local-check.mjs');
  if (!aiAvailable()) return null;
  const { checkContent } = await import('../safety/checker.mjs');
  const llm = text => checkContent(text);
  if (mode === 'ai') return async text => { try { const r = await llm(text); return { flagged: r.verdict !== 'approved', cats: [], labels: r.labels || [] }; } catch { return { flagged: true, cats: [], error: true }; } };
  return async text => { try { const r = await localFirstCheck(text, { llm, ai: true }); return { flagged: r.verdict !== 'approved', cats: r.local ? screenText(text).categories : [], labels: r.labels || [] }; } catch { return { flagged: true, cats: [], error: true }; } };
}
async function pool(items, fn, n = 8) { const out = new Array(items.length); let i = 0; await Promise.all(Array.from({ length: n }, async () => { while (i < items.length) { const k = i++; out[k] = await fn(items[k]); } })); return out; }

export async function evaluate(set, mode) {
  const rows = loadSet(set), predict = await predictor(mode);
  if (!predict) return { mode, notRun: 'no AI provider configured (set AI_PROVIDER + key); ai/full modes need a real model' };
  const preds = await pool(rows, r => predict(r.text));
  const results = rows.map((r, i) => ({ r, p: preds[i] }));
  const harm = results.filter(x => x.r.labels.length), safe = results.filter(x => !x.r.labels.length);
  const caught = x => x.p.flagged;
  const table = {};
  for (const cat of CATEGORIES) {
    const pos = harm.filter(x => x.r.labels.includes(cat)), tp = pos.filter(caught).length, strict = pos.filter(x => caught(x) && (x.p.cats.length === 0 || x.p.cats.includes(cat))).length;
    table[cat] = { n: pos.length, recall: pct(tp, pos.length), strictRecall: mode === 'local' ? pct(strict, pos.length) : null };
  }
  const fp = safe.filter(caught), tp = harm.filter(caught);
  const top = x => !x.p.flagged ? '-' : (x.p.cats[0] || 'flagged');
  const cm = {}; for (const x of results) { const t = x.r.labels[0] || 'safe', p = top(x); (cm[t] ||= {})[p] = (cm[t][p] || 0) + 1; }
  return { mode, set, n: rows.length, harm: harm.length, safe: safe.length, recall: pct(tp.length, harm.length), fpRate: pct(fp.length, safe.length), fp: fp.length, table, cm, results, errors: results.filter(x => x.p.error).length };
}
const show = (res, { matrix, misses, report, set }) => {
  if (res.notRun) return console.log(`\n[${res.mode}] NOT RUN: ${res.notRun}`);
  console.log(`\n[${res.mode}] ${set}: ${res.n} items (${res.harm} harmful, ${res.safe} safe)${res.errors ? `, ${res.errors} AI errors counted as flagged` : ''}`);
  console.table(Object.fromEntries(Object.entries(res.table).map(([c, v]) => [c, { n: v.n, 'recall %': v.recall, ...(v.strictRecall != null ? { 'category-match %': v.strictRecall } : {}) }])));
  console.log(`Overall harmful recall ${res.recall}%  |  safe posts flagged ${res.fp}/${res.safe} = ${res.fpRate}%  (bars: recall >= 85, false positives <= 10)`);
  if (matrix) console.table(res.cm);
  if (misses) { for (const x of res.results.filter(x => x.r.labels.length && !x.p.flagged)) console.log('MISS', x.r.labels[0], '|', x.r.text.slice(0, 100)); for (const x of res.results.filter(x => !x.r.labels.length && x.p.flagged)) console.log('FP  ', '|', x.r.text.slice(0, 100), '=>', x.p.cats.join(',')); }
  if (report) { const weak = Object.entries(res.table).sort((a, b) => a[1].recall - b[1].recall).slice(0, 5); console.log('5 weakest categories (example misses, report only):'); for (const [c, v] of weak) { console.log(` - ${c}: ${v.recall}% of ${v.n}`); for (const x of res.results.filter(x => x.r.labels[0] === c && !x.p.flagged).slice(0, 2)) console.log(`     miss: ${x.r.text.slice(0, 110)}`); } }
};
if (process.argv[1] && import.meta.url === new URL(process.argv[1], 'file:').href) {
  const set = arg('set', 'holdout'), mode = arg('mode', 'local'), opts = { matrix: flag('matrix'), misses: flag('misses'), report: flag('report'), set };
  if (set === 'locked' && opts.misses) { console.error('--misses is refused on the locked set: it must not drive tuning. Use --report for the written report.'); process.exit(2); }
  const modes = mode === 'all' ? ['local', 'ai', 'full'] : [mode], out = [];
  for (const m of modes) { const r = await evaluate(set, m); show(r, opts); out.push({ mode: m, set, notRun: r.notRun, recall: r.recall, fpRate: r.fpRate, table: r.table }); }
  if (flag('json')) console.log(JSON.stringify(out));
}
