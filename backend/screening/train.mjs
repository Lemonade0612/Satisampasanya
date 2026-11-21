// npm run screen:train: trains on the TRAIN split of testdata/en.jsonl only; the holdout split is never read here.
import { readFileSync, writeFileSync } from 'node:fs';
import './vocab.mjs';
import { train } from './classifier.mjs';
const rows = readFileSync(new URL('./testdata/en.jsonl', import.meta.url), 'utf8').trim().split('\n').map(l => JSON.parse(l));
import { existsSync } from 'node:fs';
const genUrl = new URL('./testdata/generated/en.jsonl', import.meta.url);
// Graded generated/red-team rows with split=train join the training data. Dev, holdout and locked rows are never read.
const generated = existsSync(genUrl) ? readFileSync(genUrl, 'utf8').trim().split('\n').filter(Boolean).map(l => JSON.parse(l)).filter(r => r.split === 'train' && r.graded) : [];
const trainRows = [...rows.filter(r => r.split === 'train'), ...generated];
const model = train(trainRows);
writeFileSync(new URL('./model.json', import.meta.url), JSON.stringify(model));
console.log(`trained on ${trainRows.length} rows (holdout ${rows.length - trainRows.length} rows untouched)`);
