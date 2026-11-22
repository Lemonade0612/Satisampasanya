// Second AI pass: re-labels every ungraded generated row independently and keeps only rows where the grader agrees and is confident.
//   node backend/screening/agents/grader.mjs [--lang=en] [--min=0.75]
import { CATEGORIES } from '../categories.mjs';
import { DEFINITIONS } from './spec.mjs';
import { argOf, readJsonl, generatedPath, rejectedPath, realAsk } from './common.mjs';
import { writeFileSync } from 'node:fs';

const SCHEMA = { type: 'object', additionalProperties: false, required: ['categories', 'confidence'], properties: { categories: { type: 'array', items: { type: 'string', enum: CATEGORIES } }, confidence: { type: 'number' } } };
const SYSTEM = `You are a strict, independent reviewer for a youth anti-scam platform's content safety labels. Given one post, return the harm categories that clearly apply (empty list if the post is safe: warnings, news, questions from victims, bank notices, ordinary chat and legitimate job ads are SAFE). Definitions: ${Object.entries(DEFINITIONS).map(([k, v]) => `${k} = ${v}`).join('; ')}. Give confidence 0-1 in your judgement. Return JSON only.`;
export async function gradeRow(row, ask = realAsk, min = 0.75) {
  const res = await ask(SYSTEM, { post: row.text }, SCHEMA);
  const cats = Array.isArray(res?.categories) ? res.categories.filter(c => CATEGORIES.includes(c)) : null, conf = Number(res?.confidence);
  if (!cats || !Number.isFinite(conf)) return { keep: false, why: 'unusable grader answer' };
  if (conf < min) return { keep: false, why: `low confidence ${conf}` };
  const agree = row.labels.length ? cats.includes(row.labels[0]) : cats.length === 0;
  return agree ? { keep: true, conf, graderCategories: cats } : { keep: false, why: `grader said [${cats.join(',')}]`, conf };
}
const BATCH_SCHEMA = { type: 'object', additionalProperties: false, required: ['results'], properties: { results: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['index', 'categories', 'confidence'], properties: { index: { type: 'integer' }, categories: { type: 'array', items: { type: 'string', enum: CATEGORIES } }, confidence: { type: 'number' } } } } } };
// Grades up to 10 rows per request (saves quota). Returns one verdict per row, in order.
export async function gradeBatch(batch, ask = realAsk, min = 0.75) {
  const res = await ask(SYSTEM + ' You get a list of posts; answer one result per post with the same index.', { posts: batch.map((r, i) => ({ index: i, post: r.text })) }, BATCH_SCHEMA);
  const by = new Map((Array.isArray(res?.results) ? res.results : []).map(x => [x.index, x]));
  return batch.map((r, i) => { const x = by.get(i), cats = Array.isArray(x?.categories) ? x.categories.filter(c => CATEGORIES.includes(c)) : null, conf = Number(x?.confidence);
    if (!cats || !Number.isFinite(conf)) return { keep: false, why: 'unusable grader answer' };
    if (conf < min) return { keep: false, why: `low confidence ${conf}`, conf };
    const agree = r.labels.length ? cats.includes(r.labels[0]) : cats.length === 0;
    return agree ? { keep: true, conf, graderCategories: cats } : { keep: false, why: `grader said [${cats.join(',')}]`, conf }; });
}
export async function gradeAll({ lang = 'en', min = 0.75, ask = realAsk, log = () => {} } = {}) {
  const rows = readJsonl(generatedPath(lang)), kept = [], rejected = [];
  const todo = rows.filter(r => !r.graded); kept.push(...rows.filter(r => r.graded));
  for (let i = 0; i < todo.length; i += 10) {
    const chunk = todo.slice(i, i + 10);
    try { (await gradeBatch(chunk, ask, min)).forEach((g, k) => (g.keep ? kept : rejected).push(g.keep ? { ...chunk[k], graded: true, graderConfidence: g.conf } : { ...chunk[k], rejectedBecause: g.why })); }
    catch (e) { if (/No AI provider/.test(e.message)) throw e; kept.push(...chunk); log(`grader batch failed (${e.message}); rows stay ungraded`); } // ungraded rows are ignored by training and evals
    log(`graded ${Math.min(i + 10, todo.length)}/${todo.length}`);
  }
  log(`kept ${kept.length}, rejected ${rejected.length}`);
  return { kept, rejected };
}
if (process.argv[1] && import.meta.url === new URL(process.argv[1], 'file:').href) {
  const lang = argOf('lang', 'en'), { kept, rejected } = await gradeAll({ lang, min: Number(argOf('min', 0.75)), log: console.log });
  writeFileSync(generatedPath(lang), kept.map(r => JSON.stringify(r)).join('\n') + (kept.length ? '\n' : ''));
  const prev = readJsonl(rejectedPath(lang)); writeFileSync(rejectedPath(lang), [...prev, ...rejected].map(r => JSON.stringify(r)).join('\n') + '\n');
}
