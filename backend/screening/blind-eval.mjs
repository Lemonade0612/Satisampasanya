// npm run screen:blind: single-shot check on blind.mjs (never used for tuning). Prints recall per category and the safe false-positive rate.
import { BLIND, BLIND_SAFE } from './testdata/blind.mjs';
import { screenText } from './screen.mjs';
const rows = []; let hit = 0, total = 0; const per = {};
for (const [cat, list] of Object.entries(BLIND)) for (const text of list) { const o = screenText(text), ok = o.status !== 'green' && o.categories.includes(cat); total++; if (ok) hit++; (per[cat] ||= { n: 0, hit: 0 }); per[cat].n++; per[cat].hit += ok; if (!ok && process.argv.includes('--misses')) console.log('MISS', cat, '|', text, '=>', o.status, o.categories.join(',')); }
const fp = BLIND_SAFE.filter(t => screenText(t).status !== 'green');
if (process.argv.includes('--misses')) for (const t of fp) console.log('FP  ', t, '=>', screenText(t).status, screenText(t).categories.join(','));
console.table(Object.fromEntries(Object.entries(per).map(([k, v]) => [k, { n: v.n, recall: Math.round(v.hit / v.n * 100) + '%' }])));
console.log(`Blind recall ${Math.round(hit / total * 1000) / 10}% (${hit}/${total}) | safe flagged ${fp.length}/${BLIND_SAFE.length} = ${Math.round(fp.length / BLIND_SAFE.length * 1000) / 10}%`);
