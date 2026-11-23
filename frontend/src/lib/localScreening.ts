import { screenPost, type FlagHit, type FlagId, type ScreenResult, type ScreeningInfo, type ScreeningLogEntry, type Severity } from "../../../shared/screening";
import type { Lang, Post } from "../types";

export { screenPost };
export type { FlagHit, FlagId, ScreenResult, ScreeningInfo };

// REVIEW-LO: Lao labels need a native speaker's check.
export const FLAG_LABELS: Record<FlagId, { en: string; lo: string; tip_en?: string; tip_lo?: string }> = {
  profanity: { en: "Bad words", lo: "ຄຳຫຍາບ" },
  animal_insults: { en: "Animal insults", lo: "ດູຖູກດ້ວຍຊື່ສັດ" },
  bullying: { en: "Bullying", lo: "ການຂົ່ມເຫັງ" },
  hate_speech: { en: "Hate speech", lo: "ຄຳເວົ້າສະແດງຄວາມກຽດຊັງ" },
  political_claims: { en: "Political claims", lo: "ຂໍ້ອ້າງທາງການເມືອງ" },
  very_short_content: { en: "Too short", lo: "ສັ້ນເກີນໄປ" },
  off_topic: { en: "Off topic", lo: "ນອກຫົວຂໍ້" },
  dangerous_content: { en: "Dangerous content", lo: "ເນື້ອຫາອັນຕະລາຍ" },
  sexual_content: { en: "Sexual content", lo: "ເນື້ອຫາທາງເພດ" },
  misinformation: { en: "Unproven claim", lo: "ຂໍ້ອ້າງທີ່ບໍ່ມີຫຼັກຖານ" },
  free_offer: { en: "Free offer", lo: "ສະເໜີຂອງຟຣີ" },
  urgency: { en: "Pressure to act fast", lo: "ເລັ່ງລັດໃຫ້ຕັດສິນໃຈ" },
  private_contact: { en: "Private chat only", lo: "ຕິດຕໍ່ສ່ວນຕົວເທົ່ານັ້ນ" },
  qr_only: { en: "QR code only", lo: "ໃຫ້ສະແກນ QR ເທົ່ານັ້ນ" },
  authority_name: { en: "Official name, no official link", lo: "ອ້າງຊື່ທາງການ ແຕ່ບໍ່ມີລິ້ງທາງການ" },
  job_abroad: { en: "Job abroad offer", lo: "ຊວນໄປເຮັດວຽກຕ່າງປະເທດ" },
  money_ask: { en: "Asks for money", lo: "ຂໍເງິນ / ມັດຈຳ" },
  emotional_manipulation: { en: "Shock or fear wording", lo: "ໃຊ້ຄຳຕົກໃຈ / ຂູ່" },
  credential_request: { en: "Asks for ID or password", lo: "ຂໍລະຫັດ ຫຼື ບັນຊີ" },
  job_offer: { en: "Job or earning pitch", lo: "ຊວນເຮັດວຽກ / ຫາເງິນ" },
  romance_scam: { en: "Romance or parcel scam pattern", lo: "ຮູບແບບຫຼອກລວງຄວາມຮັກ / ພັດສະດຸ" },
  trafficking_signs: { en: "Trafficking warning signs", lo: "ສັນຍານການຄ້າມະນຸດ" },
  suspicious_link: { en: "Suspicious link", lo: "ລິ້ງໜ້າສົງໄສ" },
  source_link_provided: { en: "Source link provided", lo: "ມີລິ້ງແຫຼ່ງຂໍ້ມູນ" },
  phone: { en: "Phone number", lo: "ເບີໂທລະສັບ", tip_en: "Remove the phone number", tip_lo: "ລຶບເບີໂທລະສັບອອກ" },
  email: { en: "Email address", lo: "ອີເມວ", tip_en: "Remove the email address", tip_lo: "ລຶບອີເມວອອກ" },
  passport_no: { en: "Passport number", lo: "ເລກໜັງສືຜ່ານແດນ", tip_en: "Remove the passport number", tip_lo: "ລຶບເລກໜັງສືຜ່ານແດນອອກ" },
  id_card: { en: "ID or family book number", lo: "ເລກບັດປະຈຳຕົວ / ສຳມະໂນຄົວ", tip_en: "Remove the ID number", tip_lo: "ລຶບເລກບັດອອກ" },
  bank_account: { en: "Bank account", lo: "ເລກບັນຊີທະນາຄານ", tip_en: "Remove the bank account", tip_lo: "ລຶບເລກບັນຊີອອກ" },
  location_sharing: { en: "Location or address", lo: "ສະຖານທີ່ / ທີ່ຢູ່", tip_en: "Remove the location or address", tip_lo: "ລຶບສະຖານທີ່ ຫຼື ທີ່ຢູ່ອອກ" },
  hotline_present: { en: "Hotline number", lo: "ມີເບີສາຍດ່ວນ" },
  bilingual_content: { en: "Lao and English", lo: "ສອງພາສາ" },
  visual_evidence: { en: "Photo evidence", lo: "ມີຮູບຫຼັກຖານ" },
  tag_relevance: { en: "Tag matches", lo: "ແທັກກົງກັບເນື້ອຫາ" },
};

export const POSITIVE = new Set<FlagId>(["source_link_provided", "hotline_present", "bilingual_content", "visual_evidence", "tag_relevance"]);
export const PRIVACY = new Set<FlagId>(["phone", "email", "passport_no", "id_card", "bank_account", "location_sharing"]);
export const issuesOf = (flags: FlagHit[]) => flags.filter((f) => !POSITIVE.has(f.id));

/** Mask what was found so the page never repeats a phone number or a swear word in full. Links stay readable. */
export function maskMatch(m: string): string {
  const s = m.trim();
  if (/^https?:\/\//i.test(s) || /^[\w-]+(\.[\w-]+)+\//.test(s) || /^www\./i.test(s) || /^[\w-]+(\.[a-z]{2,})+$/i.test(s) && !s.includes("@")) return s;
  const at = s.indexOf("@");
  if (at > 0 && /[\w-]+\.[\w.]+$/.test(s)) return `${s[0]}***${s.slice(at)}`;
  const digits = (s.match(/\d/g) ?? []).length;
  if (digits >= 7) {
    let n = 0;
    return s.replace(/\d/g, (d) => { n++; return n <= 3 || n > digits - 4 ? d : "*"; });
  }
  if (digits >= 5) { let n = 0; return s.replace(/\d/g, (d) => (++n <= 2 ? d : "*")); }
  if (/[\d.]{4,}/.test(s) && /,/.test(s)) return s.replace(/\d(?=[\d.]*\d{2}\b)/g, "*"); // GPS
  const chars = Array.from(s);
  return chars.length <= 1 ? "*" : `${chars[0]}***`;
}

export const STEPS = [
  { id: "normalize", en: "Cleaning the text", lo: "ປັບຂໍ້ຄວາມໃຫ້ເປັນມາດຕະຖານ", flags: [] as FlagId[] },
  { id: "content", en: "Checking the content", lo: "ກວດເນື້ອຫາ", flags: ["profanity", "animal_insults", "bullying", "hate_speech", "political_claims", "very_short_content", "off_topic", "dangerous_content", "sexual_content", "misinformation"] as FlagId[] },
  { id: "lures", en: "Checking for scam and recruitment lures", lo: "ກວດສັນຍານການຫຼອກລວງ", flags: ["free_offer", "urgency", "private_contact", "qr_only", "authority_name", "job_abroad", "money_ask", "emotional_manipulation", "credential_request", "romance_scam", "job_offer", "trafficking_signs"] as FlagId[] },
  { id: "links", en: "Checking links", lo: "ກວດລິ້ງ", flags: ["suspicious_link", "source_link_provided"] as FlagId[] },
  { id: "privacy", en: "Checking for personal info and location", lo: "ກວດຂໍ້ມູນສ່ວນຕົວ ແລະ ສະຖານທີ່", flags: ["phone", "email", "passport_no", "id_card", "bank_account", "location_sharing"] as FlagId[] },
];

const sev = (n: number): Severity => (n >= 60 ? "high" : n >= 30 ? "medium" : "low");

/** One timeline entry per engine step, built from what the engine really found. */
export function buildLogs(result: ScreenResult, start = Date.now(), gap = 500): ScreeningLogEntry[] {
  const logs: ScreeningLogEntry[] = STEPS.map((st, i) => {
    const hits = result.flags.filter((f) => st.flags.includes(f.id) && !POSITIVE.has(f.id));
    const names = (l: Lang) => hits.map((h) => FLAG_LABELS[h.id][l]).join(", ");
    const none = st.id === "normalize" || hits.length === 0;
    return {
      stage: st.id,
      time: start + i * gap,
      message_en: st.id === "normalize" ? "Text cleaned (spacing, look-alike letters, Lao spelling)." : none ? `${st.en}: nothing found.` : `${st.en}: ${names("en")}.`,
      message_lo: st.id === "normalize" ? "ປັບຂໍ້ຄວາມແລ້ວ (ຍະຫວ່າງ, ຕົວອັກສອນຄ້າຍກັນ, ການສະກົດລາວ)." : none ? `${st.lo}: ບໍ່ພົບບັນຫາ.` : `${st.lo}: ${names("lo")}.`,
      severity: none ? undefined : hits.some((h) => PRIVACY.has(h.id)) ? "high" : sev(hits.length * 25),
    };
  });
  const label = { clean: ["Result: approved to show.", "ຜົນ: ອະນຸຍາດໃຫ້ສະແດງ."], flagged: ["Result: held for expert review.", "ຜົນ: ພັກໄວ້ໃຫ້ຜູ້ຊ່ຽວຊານກວດ."], false: ["Result: marked as unsafe.", "ຜົນ: ໝາຍວ່າບໍ່ປອດໄພ."], blocked: ["Result: cannot be published until personal info is removed.", "ຜົນ: ເຜີຍແຜ່ບໍ່ໄດ້ ຈົນກວ່າຈະລຶບຂໍ້ມູນສ່ວນຕົວ."] }[result.state];
  logs.push({ stage: "decision", time: start + STEPS.length * gap, message_en: `${label[0]} Score ${result.score}.`, message_lo: `${label[1]} ຄະແນນ ${result.score}.`, severity: result.severity });
  return logs;
}

export function makeScreeningInfo(result: ScreenResult, start = Date.now()): ScreeningInfo {
  return { progress: 100, flags: result.flags, severity: result.severity, score: result.score, logs: buildLogs(result, start) };
}

export const FROZEN_STATES = new Set(["screening", "flagged", "false", "blocked"]);
/** Posts that are being screened, flagged, or marked unsafe cannot be liked, commented on, reposted or shared. */
export const isFrozen = (p: Pick<Post, "state" | "frozen">) => !!p.frozen || FROZEN_STATES.has(p.state);

/** Local screening for a post: the stored one, or computed from its text when the server only set a state. */
export function localInfo(p: Post): ScreeningInfo | undefined {
  if (p.localScreening) return p.localScreening;
  const text = [p.content, p.contentLo].filter(Boolean).join("\n");
  if (!text) return undefined;
  const r = screenPost(text, p.link ?? p.sourceUrl, { hasImage: !!p.image || !!p.media?.length, tags: p.tags });
  return makeScreeningInfo(r, p.createdAt ?? Date.now());
}

export const SLA_MS = 48 * 3600 * 1000;
