import { checkElderMessage, type ElderVerdict } from '../../lib/elderCheck';
import { hasSession, request } from '../../lib/api';

// Check for elders: the real AI check (signed in, online) plus the on-phone screen; the more careful answer wins.
// Offline, as a guest or on any error, the on-phone screen alone answers. The words shown are always the fixed,
// pre-recorded Lao lines for the verdict (text.ts VERDICT), so the result is short, Lao-only and can be read aloud.
export type ElderCheck = { verdict: ElderVerdict; source: 'ai' | 'phone' };
const RANK: ElderVerdict[] = ['safe', 'caution', 'scam'];
const fromAi = (c: { risk?: string; verdict?: string }): ElderVerdict =>
  c.risk === 'high' ? 'scam' : c.risk === 'medium' || c.verdict === 'needs_expert' || c.verdict === 'caution' ? 'caution' : 'safe';

export async function screenForElder(text: string): Promise<ElderCheck> {
  const phone = checkElderMessage(text);
  if (!hasSession() || (typeof navigator !== 'undefined' && navigator.onLine === false)) return { verdict: phone, source: 'phone' };
  try {
    const r = await request<{ check?: { risk?: string; verdict?: string } }>('/assistant', 'POST', { text, kind: 'text', mode: 'check', band: 'elder' }, 25000);
    if (!r.check) return { verdict: phone, source: 'phone' };
    const ai = fromAi(r.check);
    return { verdict: RANK[Math.max(RANK.indexOf(ai), RANK.indexOf(phone))], source: 'ai' };
  } catch { return { verdict: phone, source: 'phone' }; }
}
