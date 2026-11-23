import type { FlagHit, FlagId, Severity } from "./types";

/** Points per flag. Tune with scripts/eval.ts. Positive evidence lowers the score. */
export const WEIGHTS: Record<FlagId, number> = {
  phone: 100, email: 100, passport_no: 100, id_card: 100, bank_account: 100, location_sharing: 100,
  profanity: 70, hate_speech: 80, dangerous_content: 90, sexual_content: 80, money_ask: 70, job_abroad: 70, trafficking_signs: 80,
  suspicious_link: 35, bullying: 30, animal_insults: 25, political_claims: 25, misinformation: 30, emotional_manipulation: 25,
  free_offer: 15, urgency: 15, private_contact: 15, qr_only: 15, credential_request: 25, romance_scam: 30, job_offer: 20, authority_name: 10,
  very_short_content: 10, off_topic: 10,
  source_link_provided: -20, hotline_present: -10, bilingual_content: -3, visual_evidence: -3, tag_relevance: -3,
};

export function score(flags: FlagHit[]): { score: number; severity: Severity } {
  let s = 0;
  for (const f of flags) s += WEIGHTS[f.id] ?? 0;
  s = Math.max(0, Math.min(100, s));
  return { score: s, severity: s >= 60 ? "high" : s >= 30 ? "medium" : "low" };
}
