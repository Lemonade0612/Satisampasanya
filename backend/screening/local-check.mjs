import { screenText, toCheckResult } from './screen.mjs';
import { readSafetyConfig } from '../safety/model.mjs';

const LAO = /[຀-໿]/gu, LETTER = /\p{L}/gu;
export const laoShare = text => { const lao = (text.match(LAO) || []).length, all = (text.match(LETTER) || []).length; return all ? lao / all : 0; };
const SEVERITY = { approved: 0, caution: 1, needs_expert: 2 }, RISK = { low: 0, medium: 1, high: 2 };
const severity = r => SEVERITY[r.verdict] * 3 + RISK[r.risk];
export const localScreenEnabled = () => process.env.LOCAL_SCREEN !== 'off';

// A real AI provider is configured (not the canned mock and not offline).
export const aiAvailable = () => { const c = readSafetyConfig(); return c.provider !== 'mock' && !!c.key; };

// Local-first check with the same result shape as checkContent():
//  - mostly Lao text: the existing AI path only (Lao screening is unchanged);
//  - local RED goes straight to experts with no AI call;
//  - local GREEN or YELLOW asks the AI whenever a provider is configured, and the stricter verdict wins;
//  - no provider (offline, or AI_PROVIDER=mock): the local result stands, and a green is marked `unverified`;
//  - if the AI call fails, the local result stands (green is marked `unverified`).
export async function localFirstCheck(text, { llm, onProgress = () => {}, ai = aiAvailable() } = {}) {
  const share = laoShare(text);
  if (share >= 0.5 || !localScreenEnabled()) return llm(text, { onProgress });
  onProgress('read'); onProgress('patterns');
  const local = screenText(text), localResult = toCheckResult(local, text);
  if (local.status === 'red') return localResult;
  const standing = () => (local.status === 'green' ? { ...localResult, unverified: true } : localResult);
  if (!ai) return standing();
  try {
    const verdict = await llm(text, { onProgress });
    return severity(verdict) >= severity(localResult) ? verdict : localResult;
  } catch (error) {
    if (share === 0) return standing(); // AI trouble must not block an English post the local screen already judged
    if (local.status === 'yellow') return localResult;
    throw error;
  }
}
