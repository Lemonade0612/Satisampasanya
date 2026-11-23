import type { FlagHit, ScreeningState } from "./types";

/** One expert decision that differs from the engine. Saved by the admin app, read by scripts/eval.ts. */
export interface OverrideExample { text: string; ai_state: string; expert_state: string; flags: FlagHit[]; at: number }

/** Expert review states (admin app) mapped onto engine states. Anything the expert calls a scam, false or rejected is unsafe. */
export function expertToEngineState(s: string): Exclude<ScreeningState, "screening" | "sla" | "confirmed"> {
  return s === "clean" ? "clean" : s === "flagged" ? "flagged" : s === "blocked" ? "blocked" : "false";
}

/** Returns null when the expert agrees with the engine. */
export function makeOverride(text: string, ai_state: string, expertState: string, flags: FlagHit[], at = Date.now()): OverrideExample | null {
  const expert_state = expertToEngineState(expertState);
  return ai_state === expert_state ? null : { text, ai_state, expert_state, flags, at };
}
