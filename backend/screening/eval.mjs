// npm run screen:eval: per-category recall and precision, confusion matrix and false-positive rate on the HOLDOUT split only.
import { readFileSync } from 'node:fs';
import { screenText } from './screen.mjs';
import { CATEGORIES } from './categories.mjs';

const rows = readFileSync(new URL('./testdata/en.jsonl', import.meta.url), 'utf8').trim().split('\n').map(l => JSON.parse(l));
const hold = rows.filter(r => r.split === 'holdout');
const results = hold.map(r => ({ r, out: screenText(r.text) }));
const pct = (a, b) => b ? Math.round(a / b * 1000) / 10 : null;
const harm = results.filter(x => x.r.labels.length), safe = results.filter(x => !x.r.labels.length);
const table = {}; let failing = [];
for (const cat of CATEGORIES) {
  const pos = harm.filter(x => x.r.labels.includes(cat));
  const tp = pos.filter(x => x.out.status !== 'green' && x.out.categories.includes(cat)).length;
  const predicted = results.filter(x => x.out.status !== 'green' && x.out.categories.includes(cat)), correct = predicted.filter(x => x.r.labels.includes(cat)).length;
  const recall = pct(tp, pos.length), precision = pct(correct, predicted.length);
  table[cat] = { n: pos.length, recall: recall + '%', precision: (precision ?? '-') + '%', ok: recall >= 95 ? 'yes' : 'NO' };
  if (recall < 95) failing.push(cat);
}
const missed = harm.filter(x => !(x.out.status !== 'green' && x.out.categories.includes(x.r.labels[0])));
const fp = safe.filter(x => x.out.status !== 'green'), fpRate = pct(fp.length, safe.length);
const total = harm.length, caught = total - missed.length;
console.log(`Holdout: ${hold.length} examples (${harm.length} harmful, ${safe.length} safe). Training never saw them.`);
console.table(table);
console.log(`Overall recall ${pct(caught, total)}%  |  safe cases flagged (yellow or red): ${fp.length}/${safe.length} = ${fpRate}%  (target <= 10%)`);
// Confusion matrix: rows are the true category, columns the top predicted category ('-' = green).
const top = o => o.status === 'green' ? '-' : o.categories[0];
const cm = {}; for (const x of results) { const t = x.r.labels[0] || 'safe', p = top(x.out); (cm[t] ||= {})[p] = (cm[t][p] || 0) + 1; }
if (process.argv.includes('--matrix')) console.table(cm);
if (process.argv.includes('--misses')) { for (const x of missed) console.log('MISS', x.r.labels[0], x.r.tier, x.r.transform || '', '|', x.r.text.slice(0, 90), '=>', x.out.status, x.out.categories.join(',')); for (const x of fp) console.log('FP  ', x.r.tier, '|', x.r.text.slice(0, 90), '=>', x.out.status, x.out.categories.join(',')); }
console.log(failing.length ? `Below target: ${failing.join(', ')}` : 'All categories at or above the 95% recall target.');
if (process.argv.includes('--json')) console.log(JSON.stringify({ table, fpRate, overall: pct(caught, total), failing }));
