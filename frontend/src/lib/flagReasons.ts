import type { Lang, Post } from "../types";
import { moderate } from "./moderation";
import { checkLabel } from "./scamTypes";

// Plain names for every moderation flag, so a flagged post can say exactly what was found. // REVIEW-LO
export const FLAG_NOTE: Record<string, { lo: string; en: string }> = {
  profanity: { lo: "ມີຄຳຫຍາບ ຫຼື ຄຳດູໝິ່ນ", en: "Bad words or insults" },
  adult_content: { lo: "ເນື້ອຫາຜູ້ໃຫຍ່", en: "Adult content" },
  gambling: { lo: "ການພະນັນ / ຄາສິໂນ", en: "Gambling or casino" },
  crypto_get_rich: { lo: "ຄຣິບໂຕ ຫຼື ລວຍໄວ", en: "Crypto or get-rich-quick" },
  political_satire: { lo: "ເຍາະເຍ້ຍ ຫຼື ເສຍດສີຜູ້ນຳ", en: "Mocking public figures" },
  partisan: { lo: "ເນື້ອຫາການເມືອງຝ່າຍໃດຝ່າຍໜຶ່ງ", en: "Takes a political side" },
  travel_promo: { lo: "ໂຄສະນາທ່ອງທ່ຽວ", en: "Travel advert" },
  shopping_ad: { lo: "ໂຄສະນາຂາຍເຄື່ອງ", en: "Shopping advert" },
  off_topic: { lo: "ນອກຫົວຂໍ້ຄວາມປອດໄພ", en: "Not about staying safe" },
  free_visa_flight_fees: { lo: "ອ້າງວ່າ “ຟຣີ” ວີຊາ / ປີ້ຍົນ / ຄ່າຮຽນ", en: "Claims “free” visa, flights or fees" },
  upfront_fee: { lo: "ຂໍເງິນມັດຈຳ ຫຼື ຄ່າທຳນຽມກ່ອນ", en: "Asks for a deposit or fee first" },
  passport_holding: { lo: "ຂໍເກັບໜັງສືຜ່ານແດນ", en: "Asks to hold your passport" },
  unrealistic_pay: { lo: "ເງິນເດືອນສູງຜິດປົກກະຕິ", en: "Pay looks too high" },
  whatsapp_telegram_only: { lo: "ຕິດຕໍ່ຜ່ານ WhatsApp / Telegram ເທົ່ານັ້ນ", en: "WhatsApp or Telegram contact only" },
  no_company_address: { lo: "ບໍ່ມີທີ່ຢູ່ບໍລິສັດ", en: "No company address" },
  targets_minors: { lo: "ຮັບຜູ້ທີ່ອາຍຸຕ່ຳກວ່າ 18 ປີ", en: "Takes applicants under 18" },
  involves_children: { lo: "ກ່ຽວກັບເດັກ", en: "Involves children" },
};

// Why a post was flagged: the AI check's labels plus what the shared moderation rules find in its text. Frontend only for now.
export function flagReasons(post: Post, lang: Lang): string[] {
  const out = new Set<string>();
  for (const l of post.check?.labels ?? []) if (!["safe_tip", "news"].includes(l)) out.add(checkLabel(l, lang));
  const text = [post.content, post.contentLo].filter(Boolean).join("\n");
  // Rule flags that mean the same as an AI label use the AI label's wording, so a reason never shows twice.
  const SAME: Record<string, string> = { off_topic: "off_topic", profanity: "profanity_only", political_satire: "satire", partisan: "political_sarcasm" };
  if (text) for (const f of moderate({ text, tags: post.tags } as never).flags) { if (SAME[f]) out.add(checkLabel(SAME[f], lang)); else if (FLAG_NOTE[f]) out.add(FLAG_NOTE[f][lang]); }
  return [...out].slice(0, 6);
}
