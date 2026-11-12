import type { FlagCategory, ScamType, Scenario } from '../types';

export type ScamPattern = {
  scamType: ScamType;
  contact: string;
  hook: string;
  ask: string;
  flags: FlagCategory[];
};

// Stub for the AI drafting step. A live model call will replace the template later;
// the output is always 'draft' so a human verifier must approve it before anyone plays it.
export function generateDraftScenario(p: ScamPattern): Scenario {
  const id = `draft-${p.scamType}-${Date.now().toString(36)}`;
  const lo = (en: string) => ({ en, lo: `[ຮ່າງ] ${en}` });
  return {
    // AI drafts never reach Kids until a reviewer writes a gentle version and adds 'kids'.
    id, bands: ['youth', 'adult', 'elder'], scamType: p.scamType, status: 'draft', verifiedBy: null, verifiedAt: null,
    needsNativeReview: true, source: 'ai_draft', channel: 'messenger', contact: p.contact,
    title: lo(`AI draft: ${p.hook}`),
    intro: lo(`${p.contact} contacts you with an offer.`),
    steps: [{
      id: 's1', kind: 'chat',
      messages: [{ from: 'them', text: lo(`${p.hook} ${p.ask}`) }],
      prompt: lo('What do you do?'),
      choices: [
        { id: 'a', action: 'reply', correct: false, text: lo('Do what they ask'), consequence: lo('This is exactly what the scammer wanted.') },
        { id: 'b', action: 'verify', correct: true, text: lo('Stop and verify with someone you trust'), consequence: lo('Checking first keeps you safe.') },
      ],
    }],
    redFlags: p.flags,
    explanation: lo(`Watch for: ${p.flags.join(', ')}.`),
  };
}
