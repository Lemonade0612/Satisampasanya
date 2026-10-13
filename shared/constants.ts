export const AI_SCREENING_CONFIG = {
  // Initial AI screening duration (30 minutes in ms)
  AI_SCREENING_DURATION: 30 * 60 * 1000,
  // Expert review SLA (48 hours in ms)
  EXPERT_REVIEW_SLA: 48 * 60 * 60 * 1000,
  // Check interval for timers (every 5 seconds)
  CHECK_INTERVAL: 5000,
  // Minimum content length for news posts
  MIN_CONTENT_LENGTH: 50,
  MAX_CONTENT_LENGTH: 2000,
  // Daily post limit
  DAILY_POST_LIMIT: 2,
} as const;

// ═══════════════════════════════════════════════════════════════════════════════
//  BILINGUAL TOPIC LABELS
// ═══════════════════════════════════════════════════════════════════════════════
export const TOPIC_LABELS: Record<string, { en: string; lo: string }> = {
  OffTopic: { en: 'OffTopic', lo: 'ນອກຫົວຂໍ້' },
  OnlineScam:    { en: "OnlineScam",    lo: "ການຫຼອກລວງອອນລາຍ" },
  Trafficking:   { en: "Trafficking",   lo: "ການຄ້າມະນຸດ" },
  DigitalSafety: { en: "DigitalSafety", lo: "ຄວາມປອດໄພດິຈິຕອລ" },
  JobScam:       { en: "JobScam",       lo: "ການຫຼອກລວງຊອກວຽກ" },
  CryptoScam:    { en: "CryptoScam",    lo: "ການຫຼອກລວງ Crypto" },
  BorderSafety:  { en: "BorderSafety",  lo: "ຄວາມປອດໄພຊາຍແດນ" },
  SocialMedia:   { en: "SocialMedia",   lo: "ສື່ສັງຄົມ" },
  PhishingAlert: { en: "PhishingAlert", lo: "ແຈ້ງເຕືອນ Phishing" },
  RomanceScam:   { en: "RomanceScam",   lo: "ການຫຼອກລວງຄວາມຮັກ" },
  DataPrivacy:   { en: "DataPrivacy",   lo: "ຄວາມເປັນສ່ວນຕົວ" },
};
