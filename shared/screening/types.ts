export type ScreeningState = "screening" | "clean" | "flagged" | "false" | "sla" | "confirmed" | "blocked";
export type Severity = "low" | "medium" | "high";

export type FlagId =
  // content
  | "profanity" | "animal_insults" | "bullying" | "hate_speech" | "political_claims" | "very_short_content" | "off_topic"
  | "dangerous_content" | "sexual_content" | "misinformation"
  // lures
  | "free_offer" | "urgency" | "private_contact" | "qr_only" | "authority_name" | "job_abroad" | "money_ask"
  | "emotional_manipulation" | "credential_request" | "romance_scam" | "job_offer" | "trafficking_signs"
  // links
  | "suspicious_link" | "source_link_provided"
  // privacy
  | "phone" | "email" | "passport_no" | "id_card" | "bank_account" | "location_sharing"
  // positive evidence
  | "hotline_present" | "bilingual_content" | "visual_evidence" | "tag_relevance";

/** The exact words/links that triggered a flag. */
export interface FlagHit { id: FlagId; count: number; matches: string[] }

export interface ScreeningLogEntry { stage: string; time: number; message_en: string; message_lo: string; severity?: Severity }

/** Stored on a Post as `localScreening` (Post.screening is already used by the server-side AI check). */
export interface ScreeningInfo {
  progress: number;
  flags: FlagHit[];
  severity: Severity;
  score: number;
  logs: ScreeningLogEntry[];
}

export interface ScreenMeta { hasImage?: boolean; tags?: string[]; contentLo?: string }

export interface ScreenResult {
  state: Exclude<ScreeningState, "screening" | "sla" | "confirmed">;
  severity: Severity;
  score: number;
  flags: FlagHit[];
  /** True when the text read as a warning/advice post and lure words were not counted. */
  adviceContext: boolean;
}

export const PRIVACY_FLAGS: FlagId[] = ["phone", "email", "passport_no", "id_card", "bank_account", "location_sharing"];
export const LURE_SIGNALS: FlagId[] = ["free_offer", "urgency", "private_contact", "qr_only", "authority_name", "credential_request", "romance_scam", "job_offer"];
export const POSITIVE_FLAGS: FlagId[] = ["source_link_provided", "hotline_present", "bilingual_content", "visual_evidence", "tag_relevance"];
