import { readFileSync } from 'node:fs';
import { RULES } from './rules.mjs';
import { setVocabulary, normalize } from './normalize.mjs';

// Words for typo repair: every word that appears in the rules, plus the words of the TRAINING split of the test data (never holdout).
export function buildVocabulary(trainTexts = null) {
  const words = new Set();
  for (const list of Object.values(RULES)) for (const [rx] of list) for (const w of rx.source.match(/[a-z]{4,}/g) || []) words.add(w);
  const texts = trainTexts ?? (() => { try { return readFileSync(new URL('./testdata/en.jsonl', import.meta.url), 'utf8').trim().split('\n').map(l => JSON.parse(l)).filter(r => r.split === 'train' && !r.transform).map(r => r.text); } catch { return []; } })();
  for (const t of texts) for (const w of normalize(t).match(/[a-z]{4,}/g) || []) words.add(w);
  setVocabulary(words); return words;
}
buildVocabulary();
