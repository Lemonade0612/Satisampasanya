import { screenText, toCheckResult } from './screen.mjs';

const LAO = /[຀-໿]/gu, LETTER = /\p{L}/gu;
export const laoShare = text => { const lao = (text.match(LAO) || []).length, all = (text.match(LETTER) || []).length; return all ? lao / all : 0; };
const SEVERITY = { approved: 0, caution: 1, needs_expert: 2 }, RISK = { low: 0, medium: 1, high: 2 };
const severity = r => SEVERITY[r.verdict] * 3 + RISK[r.risk];
export const localScreenEnabled = () => process.env.LOCAL_SCREEN !== 'off';

// Local-first check with the same result shape as checkContent():
//  - mostly Lao text: the existing AI path only (Lao screening is unchanged);
//  - otherwise the local screen runs first: green is approved without any AI call, red goes to experts without one,
//    yellow asks the AI (checkContent), and the stricter verdict wins. If the AI fails, the local yellow stands.
//  - text with some Lao words: red is final, anything else also goes through the AI path and the stricter result wins.
export async function localFirstCheck(text, { llm, onProgress = () => {} } = {}) {
  const share = laoShare(text);
  if (share >= 0.5 || !localScreenEnabled()) return llm(text, { onProgress });
  onProgress('read'); onProgress('patterns');
  const local = screenText(text), localResult = toCheckResult(local, text);
  if (local.status === 'red') return localResult;
  if (local.status === 'green' && share === 0) return localResult;
  try {
    const ai = await llm(text, { onProgress });
    return severity(ai) >= severity(localResult) ? ai : localResult;
  } catch (error) {
    if (local.status === 'yellow') return localResult; // AI trouble must not block a post the local screen already marked for review
    throw error;
  }
}
