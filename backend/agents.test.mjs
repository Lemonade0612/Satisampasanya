import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generate, buildPrompt } from './screening/agents/generator.mjs';
import { gradeRow } from './screening/agents/grader.mjs';
import { redteam, findMisses } from './screening/agents/redteam.mjs';
import { realAsk, key } from './screening/agents/common.mjs';
import { CATEGORIES } from './screening/categories.mjs';
import { loadSet } from './screening/eval.mjs';
import { readFileSync } from 'node:fs';

test('agents: the generator refuses the locked split and the mock provider', async () => {
  await assert.rejects(generate({ split: 'locked', ask: async () => ({ posts: [] }) }), /never writes to the locked/);
  const old = process.env.AI_PROVIDER; process.env.AI_PROVIDER = 'mock';
  try { await assert.rejects(realAsk('s', {}, {}), /No AI provider/); } finally { old === undefined ? delete process.env.AI_PROVIDER : process.env.AI_PROVIDER = old; }
});
test('agents: generator covers every category, dedupes against known data and within itself', async () => {
  let n = 0; const known = loadSet('holdout')[0].text;
  const ask = async (system, user) => ({ posts: [known, `unique post number ${++n} about something`, `unique post number ${n} about something`, 'short'] });
  const rows = await generate({ split: 'train', per: 1, seed: 3, ask, batch: 4 });
  assert.ok(!rows.some(r => key(r.text) === key(known)), 'known text is dropped');
  assert.equal(new Set(rows.map(r => key(r.text))).size, rows.length, 'no duplicates');
  for (const c of CATEGORIES) assert.ok(rows.some(r => r.labels[0] === c), 'category ' + c);
  assert.ok(rows.some(r => !r.labels.length), 'safe rows exist');
  assert.ok(rows.every(r => r.split === 'train' && r.graded === false));
});
test('agents: prompts mention the category definition and requested styles', () => {
  const p = buildPrompt({ category: 'money_ask', styles: ['emoji', 'typos'], n: 5, lang: 'en' });
  assert.match(p.user.task, /money_ask/); assert.match(p.user.task, /emoji/);
  assert.match(buildPrompt({ kind: 'a news report', styles: [], n: 3, lang: 'lo' }).system, /Lao/);
});
test('agents: the grader drops disagreement, low confidence and garbage', async () => {
  const row = { text: 'x', labels: ['money_ask'] };
  assert.equal((await gradeRow(row, async () => ({ categories: ['money_ask'], confidence: 0.9 }))).keep, true);
  assert.equal((await gradeRow(row, async () => ({ categories: ['bullying'], confidence: 0.9 }))).keep, false);
  assert.equal((await gradeRow(row, async () => ({ categories: ['money_ask'], confidence: 0.4 }))).keep, false);
  assert.equal((await gradeRow(row, async () => ({ nonsense: 1 }))).keep, false);
  assert.equal((await gradeRow({ text: 'x', labels: [] }, async () => ({ categories: [], confidence: 0.9 }))).keep, true);
  assert.equal((await gradeRow({ text: 'x', labels: [] }, async () => ({ categories: ['money_ask'], confidence: 0.9 }))).keep, false);
});
test('agents: redteam only reads dev misses and writes graded train variants', async () => {
  const rows = [{ id: 'a', text: 'completely harmless sounding sentence', labels: ['bullying'] }, { id: 'b', text: 'Good morning', labels: [] }];
  assert.deepEqual(findMisses(rows).map(r => r.id), ['a']);
  const ask = async () => ({ variants: ['v one aaa', 'v two bbb', 'v three ccc', 'v four ddd', 'v five eee', 'v six fff'] });
  const out = await redteam({ rows, ask, grade: async () => ({ keep: true, conf: 0.9 }) });
  assert.equal(out.variants.length, 5); assert.ok(out.variants.every(v => v.split === 'train' && v.parent === 'a' && v.graded));
});
test('locked set: exists, is large enough, has review flags, and does not overlap training or dev text', () => {
  const rd = f => readFileSync(new URL(f, import.meta.url), 'utf8').trim().split('\n').map(l => JSON.parse(l));
  const locked = rd('./screening/testdata/locked/en.jsonl'), seen = new Set([...rd('./screening/testdata/en.jsonl'), ...rd('./screening/testdata/dev2.jsonl')].map(r => key(r.text)));
  assert.ok(locked.length >= 300);
  for (const c of CATEGORIES) assert.ok(locked.filter(r => r.labels[0] === c).length >= 10, c);
  assert.ok(locked.filter(r => !r.labels.length).length >= 100);
  assert.ok(locked.every(r => r.review === 'pending' && r.split === 'locked'));
  assert.ok(!locked.some(r => seen.has(key(r.text))), 'no overlap');
});
