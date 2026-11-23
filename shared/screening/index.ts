import { detect } from "./detectors";
import { score } from "./scorer";
import { LURE_SIGNALS, PRIVACY_FLAGS, type FlagId, type ScreenMeta, type ScreenResult } from "./types";

export * from "./types";
export { detect, extractLinks } from "./detectors";
export { score, WEIGHTS } from "./scorer";
export { canon, makeDoc, latinTokens } from "./normalize";

const FALSE_FLAGS: FlagId[] = ["profanity", "money_ask", "job_abroad", "hate_speech", "trafficking_signs", "dangerous_content", "sexual_content"];
const FLAGGED_FLAGS: FlagId[] = ["animal_insults", "bullying", "political_claims", "suspicious_link", "very_short_content", "off_topic", "emotional_manipulation", "misinformation", "romance_scam"];

/** Pure, offline, deterministic. No randomness. */
export function screenPost(text: string, link?: string, meta?: ScreenMeta): ScreenResult {
  const { flags, adviceContext } = detect(text, link, meta);
  const has = (ids: FlagId[]) => flags.some((f) => ids.includes(f.id));
  const lures = flags.filter((f) => LURE_SIGNALS.includes(f.id)).length;
  const state: ScreenResult["state"] = has(PRIVACY_FLAGS) ? "blocked" : has(FALSE_FLAGS) ? "false" : lures >= 2 || has(FLAGGED_FLAGS) ? "flagged" : "clean";
  const { score: s, severity } = score(flags);
  return { state, severity, score: s, flags, adviceContext };
}
