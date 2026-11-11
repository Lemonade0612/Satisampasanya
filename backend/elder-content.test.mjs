// Elder mode content: shape, pure Lao script (no Thai letters, no English words except OTP/SMS), slogan present.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const load = f => JSON.parse(readFileSync(new URL(`../frontend/src/features/elder/data/${f}`, import.meta.url)));
const videos = load('videos.json'), tips = load('tips.json');
const THAI = /[฀-๿]/u;
const latinOk = s => (s.match(/[A-Za-z]+/g) || []).every(w => ['OTP', 'SMS'].includes(w));
const lao = s => typeof s === 'string' && s.trim() && !THAI.test(s) && latinOk(s);

test('7 videos with two answers, a valid correct index and the slogan last', () => {
  assert.equal(videos.length, 7);
  for (const v of videos) {
    assert.ok([v.titleLo, v.question, v.explainLo, ...v.captions, ...v.answers].every(lao), v.id);
    assert.equal(v.answers.length, 2); assert.ok([0, 1].includes(v.correctIndex));
    assert.equal(v.captions.at(-1), 'ກວດກ່ອນ ເຊື່ອ'); assert.ok(v.durationSec > 0);
  }
});
test('8 tips with three steps each', () => {
  assert.equal(tips.length, 8);
  for (const t of tips) { assert.equal(t.steps.length, 3); assert.ok([t.headlineLo, ...t.steps].every(lao), t.id); }
});
