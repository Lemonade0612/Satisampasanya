// Instant, on-device checks for the Safety Assistant: the verdict card appears before the server or the AI answer.
import { verify, detect, makeScorer, type VerifyResult } from '../../../shared/verify.mjs';
import rules from '../../../rules/risk-rules.json';

const score = makeScorer(rules);
export type { VerifyResult, Signal, Level } from '../../../shared/verify.mjs';
export const verifyLocal = (text: string): VerifyResult => verify(text, { score });
export const hasEvidence = (text: string) => verifyLocal(text).hasEvidence;
export { detect };
