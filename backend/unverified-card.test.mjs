import test from 'node:test';
import assert from 'node:assert/strict';
import {applyRisk, reconcileUnverified} from './riskScore.mjs';

// BUG-10: with no AI configured the only check is the on-phone (local) one. The card must not say "Check first"
// and "No safety concerns" together.
const localGreen = () => ({verdict: 'approved', risk: 'low', labels: [], summary: 'No safety concerns found by the on-device check.', local: true, unverified: true});
const post = content => { const p = {content, contentLanguage: 'en', check: localGreen(), flagReason: localGreen().summary, flagReasonLo: localGreen().summary, screening: {note: localGreen().summary, noteLo: localGreen().summary}}; applyRisk(p); return p; };

test('BUG-10: a yellow badge never sits next to "No safety concerns" when the check was unverified', () => {
  const p = post('Anyone know a safe way to check a job offer in Thailand? They asked me to pay a fee first.');
  assert.notEqual(p.risk_level, 'green', 'the rules still rate it yellow or red: the stricter signal wins');
  reconcileUnverified(p);
  for (const text of [p.flagReason, p.flagReasonLo, p.check.summary, p.screening.note, p.screening.noteLo]) assert.doesNotMatch(text, /No safety concerns/);
  assert.ok(p.flagReason.length > 0 && p.flagReasonLo.length > 0);
  assert.equal(p.risk_level === 'green', false, 'the badge is not lowered');
});

test('BUG-10: green stays green with the local sentence, and a verified (AI) check is left alone', () => {
  const g = post('mom i will be home late, save me some food');
  assert.equal(g.risk_level, 'green'); reconcileUnverified(g);
  assert.match(g.flagReason, /No safety concerns/);
  const ai = post('Anyone know a safe way to check a job offer in Thailand? They asked me to pay a fee first.');
  ai.check = {...ai.check, unverified: false, local: false, summary: 'The AI found no concerns.'}; ai.flagReason = 'The AI found no concerns.';
  reconcileUnverified(ai);
  assert.equal(ai.flagReason, 'The AI found no concerns.');
});
