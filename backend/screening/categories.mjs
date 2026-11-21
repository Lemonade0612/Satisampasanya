// The 17 screening categories. B1: no exact 17-point list exists in the repo (searched docs, rules/, guidelines/, moderation and the
// untracked shared/screening/types.ts). These are the existing flag ids from that FlagId type, grouped to 17, plus the labels in
// shared/check-labels.mjs. Nothing here is a new policy category.
export const CATEGORIES = [
  'profanity', 'animal_insults', 'bullying', 'hate_speech', 'political_claims', 'sexual_content', 'dangerous_content', 'misinformation', 'off_topic',
  'money_ask', 'credential_request', 'job_abroad', 'trafficking_signs', 'romance_scam', 'authority_impersonation', 'emotional_manipulation', 'private_contact',
];
// Lures need context: the same words in a warning or a victim's question are not a lure, so those categories are damped there.
export const LURE = new Set(['money_ask', 'credential_request', 'job_abroad', 'trafficking_signs', 'romance_scam', 'authority_impersonation', 'emotional_manipulation', 'private_contact']);
// Rule weights are per category; severity decides whether a strong hit alone is red.
export const SEVERE = new Set(['trafficking_signs', 'dangerous_content', 'credential_request', 'hate_speech', 'sexual_content']);
// Mapping to the AI check's label list (shared/check-labels.mjs) so the local result can flow through the existing post-check path.
export const LABEL_OF = {
  profanity: 'profanity_only', animal_insults: 'harassment', bullying: 'harassment', hate_speech: 'harassment', political_claims: 'political_sarcasm',
  sexual_content: 'off_topic', dangerous_content: 'off_topic', misinformation: 'misinformation', off_topic: 'off_topic', money_ask: 'scam_risk',
  credential_request: 'phishing', job_abroad: 'scam_risk', trafficking_signs: 'trafficking_recruitment', romance_scam: 'scam_risk',
  authority_impersonation: 'impersonation', emotional_manipulation: 'fear_bait', private_contact: 'scam_risk',
};
