// npm run screen:train: trains on the TRAIN split of testdata/en.jsonl only; the holdout split is never read here.
import { readFileSync, writeFileSync } from 'node:fs';
import './vocab.mjs';
import { train } from './classifier.mjs';
const rows = readFileSync(new URL('./testdata/en.jsonl', import.meta.url), 'utf8').trim().split('\n').map(l => JSON.parse(l));
const trainRows = rows.filter(r => r.split === 'train');
const model = train(trainRows);
writeFileSync(new URL('./model.json', import.meta.url), JSON.stringify(model));
console.log(`trained on ${trainRows.length} rows (holdout ${rows.length - trainRows.length} rows untouched)`);
