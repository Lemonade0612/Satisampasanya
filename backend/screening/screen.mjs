import './vocab.mjs';
import { ruleScores } from './rules.mjs';
import { classify } from './classifier.mjs';
import { CATEGORIES, LURE, LABEL_OF, SEVERE } from './categories.mjs';

// Local screening: rules + classifier, no network. Output: { categories[], score, status: green|yellow|red, reasons[], scores }.
export const RED = 0.8, YELLOW = 0.45;
const noisyOr = (a, b) => 1 - (1 - a) * (1 - b);
export function screenText(text, { model } = {}) {
  const input = String(text ?? '');
  const { scores: rules, safeContext } = ruleScores(input);
  const clf = classify(input, model);
  const scores = {}, reasons = [];
  for (const cat of CATEGORIES) {
    let rule = rules[cat].score, learned = clf[cat] >= 0.5 ? (0.5 + (clf[cat] - 0.5) * 0.9) * 0.8 : 0;
    // A warning, a news report or a victim's question quotes lure words without offering them: damp the lure categories only.
    if (safeContext && (LURE.has(cat) || cat === 'misinformation')) { rule *= 0.35; learned *= 0.5; }
    scores[cat] = Math.round(noisyOr(rule, learned) * 1000) / 1000;
  }
  const categories = CATEGORIES.filter(c => scores[c] >= YELLOW).sort((a, b) => scores[b] - scores[a]);
  const score = categories.length ? scores[categories[0]] : Math.max(0, ...Object.values(scores));
  const status = score >= RED ? 'red' : score >= YELLOW ? 'yellow' : 'green';
  for (const c of categories) reasons.push({ category: c, score: scores[c], evidence: rules[c].hits[0] || null, source: rules[c].score >= YELLOW * 0.7 ? 'rule' : 'classifier' });
  return { categories, score, status, reasons, scores, safeContext };
}
const STRICT = { green: 0, yellow: 1, red: 2 };
const FROM_AI = { approved: 'green', caution: 'yellow', needs_expert: 'red' };
export const stricter = (a, b) => (STRICT[a] >= STRICT[b] ? a : b);

// The LLM is asked unless the local result is red (red goes straight to experts). When both answer, the stricter verdict wins. Never throws on AI trouble.
export async function screenWithAI(text, { llm, model } = {}) {
  const local = screenText(text, { model });
  if (local.status === 'red' || !llm) return { ...local, ai: null, finalStatus: local.status };
  try {
    const ai = await llm(text), aiStatus = FROM_AI[ai?.verdict] ?? 'yellow';
    const status = stricter(local.status, aiStatus);
    const labels = ai?.labels ?? [];
    return { ...local, status, ai: { verdict: ai?.verdict ?? null, status: aiStatus, labels }, finalStatus: status, reasons: [...local.reasons, ...(aiStatus !== 'green' ? [{ category: null, source: 'ai', evidence: ai?.summary ?? null }] : [])] };
  } catch { return { ...local, ai: { error: true }, finalStatus: local.status, reasons: [...local.reasons, { category: null, source: 'ai_unavailable', evidence: null }] }; }
}
const firstWords = text => (/^\s*(\S+\s+){0,7}\S+/.exec(text) || [''])[0].trim();
const SUMMARY = {
  green: 'No safety concerns found by the on-device check.',
  yellow: 'This post may need a closer look before it is shown.',
  red: 'This post looks harmful and needs expert review.',
};
// Shape of backend/safety/checker.mjs checkContent() so the result can flow through the existing post-check path.
export function toCheckResult(result, text) {
  const status = result.finalStatus ?? result.status;
  const labels = [...new Set(result.categories.map(c => LABEL_OF[c]))];
  const onTopic = !result.categories.includes('off_topic') || result.categories.length > 1;
  const severe = result.categories.some(c => SEVERE.has(c));
  if (status === 'green') return { verdict: 'approved', risk: 'low', labels: [], on_topic: true, reasons: [], suggested_edit: '', summary: SUMMARY.green, language: 'en', checkedAt: Date.now(), local: true };
  const ev = firstWords(text);
  const reasons = ev ? [{ text: `Matches the "${result.categories[0] ?? 'safety'}" pattern.`, evidence: ev }] : [];
  return { verdict: status === 'red' ? 'needs_expert' : 'caution', risk: status === 'red' ? (severe ? 'high' : 'medium') : 'medium', labels: labels.length ? labels : ['scam_risk'], on_topic: onTopic, reasons, suggested_edit: status === 'yellow' ? 'Check the facts and remove anything that asks readers for money, codes or private contact.' : '', summary: SUMMARY[status], language: 'en', checkedAt: Date.now(), local: true };
}
