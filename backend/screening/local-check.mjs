import { screenText, toCheckResult } from './screen.mjs';
import { readSafetyConfig } from '../safety/model.mjs';

const LAO = /[຀-໿]/gu, LETTER = /\p{L}/gu;
export const laoShare = text => { const lao = (text.match(LAO) || []).length, all = (text.match(LETTER) || []).length; return all ? lao / all : 0; };
const SEVERITY = { approved: 0, caution: 1, needs_expert: 2 }, RISK = { low: 0, medium: 1, high: 2 };
const severity = r => SEVERITY[r.verdict] * 3 + RISK[r.risk];
export const localScreenEnabled = () => process.env.LOCAL_SCREEN !== 'off';

// A real AI provider is configured (not the canned mock and not offline).
export const aiAvailable = () => { const c = readSafetyConfig(); return c.provider !== 'mock' && !!c.key; };

export const DOWNGRADE_MIN_CONFIDENCE = 0.8;
export const screenStats = { downgrades: 0, unverified: 0, aiErrors: 0 };
const brief = text => (/^\s*(\S+\s+){0,7}\S+/.exec(text) || [''])[0].trim();

// Local-first check with the same result shape as checkContent():
//  - mostly Lao text: the existing AI path only (Lao screening is unchanged);
//  - local RED goes straight to experts with no AI call. The AI can never downgrade a red;
//  - local GREEN or YELLOW asks the AI whenever a provider is configured, and the stricter verdict wins, with ONE exception:
//    a local YELLOW becomes GREEN only if the AI says approved, risk low and confidence >= 0.8 (the downgrade is logged);
//  - no provider (offline, or AI_PROVIDER=mock): the local result stands and is marked `unverified` (green and yellow);
//  - an AI error never turns a post green: a local green becomes a held "caution" marked `unverified`, a local yellow stays yellow, unverified.
export async function localFirstCheck(text, { llm, onProgress = () => {}, ai = aiAvailable(), onDowngrade = () => {}, log = console.info } = {}) {
  const share = laoShare(text);
  if (share >= 0.5 || !localScreenEnabled()) return llm(text, { onProgress });
  onProgress('read'); onProgress('patterns');
  const local = screenText(text), localResult = toCheckResult(local, text);
  if (local.status === 'red') return localResult;
  const mark = r => { screenStats.unverified++; return { ...r, unverified: true }; };
  const standing = () => mark(localResult);
  if (!ai) return standing();
  let verdict;
  try { verdict = await llm(text, { onProgress }); } catch (error) {
    screenStats.aiErrors++;
    if (local.status === 'yellow') return standing();
    const held = toCheckResult({ ...local, status: 'yellow' }, text);
    return mark({ ...held, reasons: [{ text: 'The AI check was unavailable, so a person should look at this first.', evidence: brief(text) }].filter(r => r.evidence) });
  }
  if (local.status === 'yellow' && verdict.verdict === 'approved' && verdict.risk === 'low' && Number(verdict.confidence) >= DOWNGRADE_MIN_CONFIDENCE) {
    screenStats.downgrades++;
    const record = { from: 'yellow', to: 'green', categories: local.categories, localScore: local.score, aiVerdict: verdict.verdict, aiRisk: verdict.risk, aiConfidence: Number(verdict.confidence), aiSummary: verdict.summary, text };
    onDowngrade(record);
    log(`[screening] yellow->green by AI: categories=${local.categories.join(',') || '-'} localScore=${local.score} confidence=${record.aiConfidence} reason=${JSON.stringify(String(verdict.summary || '').slice(0, 120))}`);
    return { ...verdict, downgradedFromYellow: true };
  }
  return severity(verdict) >= severity(localResult) ? verdict : localResult;
}
