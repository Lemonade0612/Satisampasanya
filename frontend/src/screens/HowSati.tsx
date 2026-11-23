import { useState } from "react";
import { ArrowLeft, ChevronDown, ShieldCheck, ThumbsDown, ThumbsUp } from "lucide-react";
const logoImage = "/brand-mark.svg";
import { api } from "../lib/api";
import type { Lang } from "../types";

// How Sati checks (design: HowSati.html). All copy is the approved Lao/English text; the vote still posts to the feedback API.
const T = {
  lo: {
    back: "ກັບໄປ Sati", title: "Sati AI ກວດແນວໃດ?",
    intro: "ຜູ້ຊ່ວຍຄວາມປອດໄພ ຊ່ວຍເຈົ້າຕັດສິນ ລິ້ງ, ເບີໂທ ແລະ ຂໍ້ຄວາມ. ເຈົ້າຈະໄດ້ຮັບສີຄຳຕັດສິນ, ເຫດຜົນ ແລະ ສິ່ງທີ່ຄວນເຮັດຕໍ່.",
    covers: ["ການຫຼອກລວງ", "ການຄ້າມະນຸດ", "ວຽກປອມ", "ທຶນການສຶກສາປອມ", "ໂປສເຕີ ແລະ ຮູບ", "OTP / Phishing", "ຄວາມປອດໄພດິຈິຕອລ"],
    flowTitle: "ການກວດ 1 ຄັ້ງ ເຮັດວຽກແນວໃດ", pointsTitle: "ຈຸດກວດທຸກໂພສ",
    pointsSub: "ທຸກໂພສໃນຊຸມຊົນ ຜ່ານ 17 ຈຸດນີ້ ກ່ອນສະແດງ. ສີແດງ = ກັ້ນ, ສີເຫຼືອງ = ຄວາມສ່ຽງ, ສີຂຽວ = ເພີ່ມຄວາມໜ້າເຊື່ອຖື.",
    fixedTitle: "ການກວດແບບຕາຍຕົວ", fixedSub: "ເຮັດກ່ອນໃຊ້ AI ທຸກຄັ້ງ. ແຕະເພື່ອເບິ່ງລາຍລະອຽດ.",
    labelsTitle: "ສິ່ງທີ່ AI ຊອກຫາ", labelsSub: "14 ປະເພດ. ໂພສ 1 ອັນ ອາດມີຫຼາຍປະເພດ.",
    verdictTitle: "ສີຄຳຕັດສິນ", guardTitle: "ວິທີທີ່ເຮົາກັນຄວາມຜິດພາດ", limitsTitle: "ສິ່ງທີ່ Sati ເຮັດບໍ່ໄດ້",
    learnTitle: "ຊ່ວຍ Sati ຮຽນຮູ້", learnText: "ຄຳຕັດສິນຜິດບໍ? ກົດບອກເຮົາ. ທີມງານກວດທຸກລາຍງານ ແລະ ເພີ່ມເຂົ້າຊຸດທົດສອບ ເພື່ອໃຫ້ Sati ກວດໄດ້ຖືກຕ້ອງຂຶ້ນ.",
    right: "ຖືກຕ້ອງ", wrong: "ຜິດ / ບໍ່ແນ່ໃຈ", thanks: "ຂອບໃຈ! ທີມງານຈະກວດຄຳຕັດສິນນີ້.",
    h1533: "ລາຍງານການສໍ້ໂກງອອນລາຍ · 24 ຊມ", h1191: "ຕຳຫຼວດ · ສຸກເສີນ",
  },
  en: {
    back: "Back to Sati", title: "How Sati AI checks things",
    intro: "The Safety Assistant helps you judge links, phone numbers and messages. You get a colour verdict, the reasons behind it, and what to do next.",
    covers: ["Scams", "Trafficking", "Fake jobs", "Fake scholarships", "Posters & images", "OTP / Phishing", "Digital safety"],
    flowTitle: "How one check works", pointsTitle: "checkpoints on every post",
    pointsSub: "Every community post passes these 17 points before it shows. Red = blocked, amber = risk, green = builds trust.",
    fixedTitle: "Fixed checks", fixedSub: "Run before any AI is used. Tap to see details.",
    labelsTitle: "What the AI looks for", labelsSub: "14 categories. One post can have several.",
    verdictTitle: "Colour verdicts", guardTitle: "How we prevent mistakes", limitsTitle: "What Sati cannot do",
    learnTitle: "Help Sati learn", learnText: "Was a verdict wrong? Tell us. The team reviews every report and adds it to the test set so Sati gets more accurate.",
    right: "Correct", wrong: "Wrong / unsure", thanks: "Thank you! The team will review this verdict.",
    h1533: "Report online fraud · 24h", h1191: "Police · emergency",
  },
};
const FLOW = {
  lo: [["ອ່ານ", "ແຍກລິ້ງ, ເບີໂທ ແລະ ພາສາ (ລາວ ຫຼື ອັງກິດ) ອອກຈາກຂໍ້ຄວາມ."], ["ກວດແບບຕາຍຕົວ", "ກວດລິ້ງ, ອາຍຸໂດເມນ, ເບີໂທ ແລະ ຄຳທີ່ໃຊ້ຫຼອກລວງ ໂດຍບໍ່ໃຊ້ AI."], ["AI ວິເຄາະ", "ເບິ່ງຈຸດປະສົງຂອງຜູ້ຂຽນກ່ອນ. ການຖາມວ່າ “ຂໍ້ສະເໜີນີ້ປອດໄພບໍ?” ບໍ່ແມ່ນການໂຄສະນາ."], ["ຄຳຕັດສິນ + ຫຼັກຖານ", "ໃຫ້ສີ, ເຫດຜົນສູງສຸດ 3 ຂໍ້ ທີ່ອ້າງຄຳເວົ້າຈາກຂໍ້ຄວາມຂອງເຈົ້າ, ແລະ ສິ່ງທີ່ຄວນເຮັດ."], ["ຜູ້ກວດ", "ກໍລະນີສ່ຽງ ຫຼື ບໍ່ແນ່ນອນ ສົ່ງໃຫ້ຜູ້ກວດ ພາຍໃນ 48 ຊົ່ວໂມງ."]],
  en: [["Read", "Pull out links, phone numbers and the language (Lao or English)."], ["Fixed checks", "Check links, domain age, phone numbers and scam wording, without AI."], ["AI analysis", "Decide the author’s purpose first. Asking “is this offer safe?” is not promoting it."], ["Verdict + evidence", "A colour, up to 3 reasons that quote your own text, and what to do next."], ["Human review", "Risky or uncertain cases go to a reviewer within 48 hours."]],
};
const STEP_BG = ["#EDE7FB", "#DCEBFE", "#F3E8FF", "#DCFCE7", "#FEF3C7"], STEP_FG = ["#5B21D1", "#2563EB", "#7E22CE", "#15803D", "#B45309"];
const CHECKS = {
  lo: [
    ["link", "URL", "#EDE7FB", "#5B21D1", "ລິ້ງ", "ອ່ານໂດເມນແທ້, ທຽບກັບລາຍຊື່ເວັບທາງການ, ແລະ ຊອກຫາເວັບປອມ: ຕົວອັກສອນສັບປ່ຽນ, ຄຳເພີ່ມເຊັ່ນ -login ຫຼື -verify, ຕົວອັກສອນເຊື່ອງ (xn--), ທີ່ຢູ່ເປັນຕົວເລກ, ນາມສະກຸນສ່ຽງ (.xyz, .ru), http ແທນ https, ແລະ ລິ້ງຫຍໍ້.", "bcel-one-login.xyz → ຊື່ທະນາຄານ + -login + .xyz"],
    ["gsb", "G", "#DCEBFE", "#2563EB", "Google Safe Browsing", "ທຽບລິ້ງກັບລາຍຊື່ເວັບອັນຕະລາຍຂອງ Google. ຖ້າກວດບໍ່ໄດ້ ເຮົາຈະບອກ.", "ບໍ່ພົບໃນລາຍຊື່ ≠ ປອດໄພແນ່ນອນ"],
    ["age", "90d", "#FEF3C7", "#B45309", "ອາຍຸໂດເມນ", "ໂດເມນໃໝ່ຫຼາຍ (ຕ່ຳກວ່າ 90 ມື້) ແມ່ນສັນຍານເຕືອນ. ກວດຜ່ານ RDAP; ຂ້າມໄປຖ້າກວດບໍ່ໄດ້.", "ລົງທະບຽນ 6 ມື້ກ່ອນ → ສົງໄສ"],
    ["phone", "+856", "#DCFCE7", "#15803D", "ເບີໂທ", "ກວດຮູບແບບເບີລາວ (+856, 020, 030), ທຽບກັບລາຍຊື່ສາຍດ່ວນຂອງ Sati, ແລະ ໝາຍເບີຕ່າງປະເທດໃນປະກາດຮັບສະໝັກວຽກ.", "“ຕິດຕໍ່ +855…” ໃນປະກາດວຽກລາວ → ກວດກ່ອນ"],
    ["words", "Aa", "#FFE4E6", "#BE123C", "ຄຳເວົ້າ", "ຊອກຫາຮູບແບບການຫຼອກລວງ: “ວີຊາຟຣີ”, ຈ່າຍຄ່າທຳນຽມກ່ອນ, ມີຄົນເກັບໜັງສືຜ່ານແດນ, ບໍ່ຕ້ອງມີປະສົບການ, ເລັ່ງດ່ວນ, ຕິດຕໍ່ທາງ WhatsApp/Telegram ເທົ່ານັ້ນ.", "“ເງິນເດືອນ 2,000$ ບໍ່ຕ້ອງມີປະສົບການ ອອກເດີນທາງມື້ອື່ນ”"],
  ],
  en: [
    ["link", "URL", "#EDE7FB", "#5B21D1", "Links", "Read the real domain, compare it with official sites, and look for look-alikes: swapped letters, extra words like -login or -verify, hidden characters (xn--), number addresses, risky endings (.xyz, .ru), http instead of https, and link shorteners.", "bcel-one-login.xyz → bank name + -login + .xyz"],
    ["gsb", "G", "#DCEBFE", "#2563EB", "Google Safe Browsing", "The link is compared with Google’s list of known dangerous sites. If this check is not available, we say so.", "Not on the list ≠ guaranteed safe"],
    ["age", "90d", "#FEF3C7", "#B45309", "Domain age", "Very new domains (under 90 days) are a warning sign. Looked up through RDAP; skipped if it fails.", "Registered 6 days ago → suspicious"],
    ["phone", "+856", "#DCFCE7", "#15803D", "Phone numbers", "Check the Lao format (+856, 020, 030), compare with Sati’s hotline list, and flag foreign numbers in job offers.", "“Contact +855…” in a Lao job ad → check first"],
    ["words", "Aa", "#FFE4E6", "#BE123C", "Wording", "Known scam patterns: “free visa”, fees paid first, someone keeping your passport, no experience needed, urgency, contact only via WhatsApp/Telegram.", "“$2,000/month, no experience, leave tomorrow”"],
  ],
};
const RED = "#DC2626", AMBER = "#D97706", GREEN = "#16A34A";
const LABELS = {
  lo: [["ຄວາມສ່ຽງຫຼອກລວງ", RED], ["ຊັກຊວນຄ້າມະນຸດ", RED], ["Phishing / OTP", RED], ["ປອມຕົວ", RED], ["ຂໍ້ມູນເທັດ", RED], ["ປຸກປັ່ນໃຫ້ຢ້ານ", RED], ["ຂົ່ມເຫັງ", AMBER], ["ໂທດຜູ້ເຄາະຮ້າຍ", AMBER], ["ຄຳຫຍາບ", AMBER], ["ນອກຫົວຂໍ້", AMBER], ["ສຽດສີການເມືອງ", AMBER], ["ຕະຫຼົກສຽດສີ (ອະນຸຍາດ)", GREEN], ["ຄຳແນະນຳປອດໄພ", GREEN], ["ຂ່າວ", GREEN]],
  en: [["Scam risk", RED], ["Trafficking recruitment", RED], ["Phishing / OTP", RED], ["Impersonation", RED], ["Misinformation", RED], ["Fear bait", RED], ["Harassment", AMBER], ["Victim blaming", AMBER], ["Profanity only", AMBER], ["Off-topic", AMBER], ["Political sarcasm", AMBER], ["Satire (allowed)", GREEN], ["Safety tip", GREEN], ["News", GREEN]],
};

const VERDICTS = {
  lo: [["ປອດໄພ", "#15803D", "#F0FDF4", "ຄຳແນະນຳ, ຂ່າວ ຫຼື ຄຳຖາມກ່ຽວກັບຄວາມປອດໄພ. ບໍ່ພົບສັນຍານອັນຕະລາຍ."], ["ກວດກ່ອນ", "#B45309", "#FFFBEB", "ຂົ່ມເຫັງ, ໂທດຜູ້ເຄາະຮ້າຍ, ຄຳຫຍາບ ຫຼື ນອກຫົວຂໍ້. Sati ແນະນຳວິທີແກ້ໄຂ."], ["ເຕືອນ · ສົ່ງຜູ້ກວດ", "#DC2626", "#FEF2F2", "ຄວາມສ່ຽງກາງ ຫາ ສູງ: ຫຼອກລວງ, ຊັກຊວນຄ້າມະນຸດ, phishing, ປຸກປັ່ນ ຫຼື ຂໍ້ມູນເທັດ."]],
  en: [["Safe", "#15803D", "#F0FDF4", "Safety tips, news or genuine safety questions. No danger signals found."], ["Check first", "#B45309", "#FFFBEB", "Harassment, victim blaming, profanity or off-topic. Sati suggests an edit."], ["Warning · expert review", "#DC2626", "#FEF2F2", "Medium to high risk: scams, trafficking recruitment, phishing, fear bait or misinformation."]],
};
const GUARDS = {
  lo: ["ທຸກເຫດຜົນຕ້ອງອ້າງຄຳເວົ້າແທ້ຈາກຂໍ້ຄວາມຂອງເຈົ້າ (ບໍ່ເກີນ 8 ຄຳ). ບໍ່ມີຫຼັກຖານ = ບໍ່ມີຄຳເຕືອນ.", "ຖ້າຄຳຕອບຂອງ AI ບໍ່ຜ່ານການກວດ ຈະລອງໃໝ່ 1 ຄັ້ງ. ບໍ່ເຄີຍໃຊ້ຄຳຕັດສິນສຳເລັດຮູບແທນ.", "ເບີໂທທຸກເບີໃນຄຳຕອບ ຕ້ອງຢູ່ໃນລາຍຊື່ສາຍດ່ວນທີ່ກວດແລ້ວ. AI ສ້າງເບີເອງບໍ່ໄດ້.", "ຂຽນລາວ ໄດ້ຄຳຕອບເປັນລາວ. ກວດວ່າຄຳຕອບບໍ່ປົນພາສາ.", "ຂໍ້ຄວາມທີ່ເຈົ້າວາງ ຖືກຖືວ່າເປັນເນື້ອຫາ ບໍ່ແມ່ນຄຳສັ່ງ, ເພື່ອບໍ່ໃຫ້ຂໍ້ຄວາມຫຼອກລວງ ສັ່ງ AI ໃຫ້ຕອບວ່າ “ປອດໄພ”."],
  en: ["Every reason must quote your own text (8 words max). No evidence = no warning.", "If the AI’s answer fails validation, it retries once. A preset verdict is never used instead.", "Every phone number in an answer must be on the verified hotline list. The AI cannot invent numbers.", "Write in Lao, get Lao back. Answers are checked so languages don’t mix.", "What you paste is treated as content, never instructions, so a scam message shouldn’t be able to make the AI say “safe”."],
};
const LIMITS = {
  lo: ["Sati ອາດຜິດພາດ, ໂດຍສະເພາະກັບການຫຼອກລວງແບບໃໝ່.", "ບໍ່ສາມາດຢືນຢັນຕົວຕົນຂອງຄົນ ຫຼື ບໍລິສັດໄດ້.", "ບໍ່ແມ່ນຄຳປຶກສາທາງກົດໝາຍ ແລະ ບໍ່ແທນຕຳຫຼວດ.", "ຢ່າສົ່ງລະຫັດຜ່ານ, OTP ຫຼື ເລກບັນຊີ ໃຫ້ Sati."],
  en: ["Sati can make mistakes, especially with brand-new scams.", "It cannot verify who a person or company really is.", "It is not legal advice and does not replace the police.", "Never send passwords, OTPs or account numbers to Sati."],
};
const POINTS = {
  lo: [["ເນື້ອຫາບໍ່ເໝາະສົມ", RED, "#FEF2F2", ["ເນື້ອຫາອັນຕະລາຍ (ກັ້ນທັນທີ)", "ຄຳຫຍາບ", "ເນື້ອຫາທາງເພດ", "ດ່າວ່າເປັນສັດ", "ອະຄະຕິ ແລະ ການກີດກັນ", "ຂົ່ມເຫັງ ແລະ ລັງແກ", "ນອກຫົວຂໍ້"]], ["ສັນຍານຄວາມສ່ຽງ", "#B45309", "#FFFBEB", ["ສັນຍານການຫຼອກລວງ", "ສັນຍານການຄ້າມະນຸດ", "ຂໍ້ມູນເທັດ"]], ["ຄວາມໜ້າເຊື່ອຖື", "#15803D", "#F0FDF4", ["ຕົວຊີ້ບອກຄວາມໜ້າເຊື່ອຖື", "ກ່າວເຖິງອົງການ ຫຼື ລັດ", "ລິ້ງແຫຼ່ງທີ່ມາ", "ຫຼັກຖານຮູບພາບ", "ແທັກກົງກັບເນື້ອຫາ", "ຂຽນສອງພາສາ", "ຄວາມຍາວພຽງພໍ"]]],
  en: [["Not allowed", RED, "#FEF2F2", ["Dangerous content (blocked now)", "Profanity", "Sexual content", "Animal insults", "Bias & discrimination", "Bullying & harassment", "Off-topic"]], ["Risk signals", "#B45309", "#FFFBEB", ["Scam indicators", "Trafficking indicators", "Misinformation"]], ["Trust signals", "#15803D", "#F0FDF4", ["Credibility markers", "Organisation or government named", "Source link", "Visual evidence", "Tag matches content", "Bilingual", "Enough detail"]]],
};

export function HowSati({ lang: appLang, onBack }: { lang: Lang; onBack: () => void }) {
  const [lang, setLang] = useState<Lang>(appLang), [open, setOpen] = useState<string | null>("link"), [voted, setVoted] = useState<"up" | "down" | null>(null), [err, setErr] = useState("");
  const t = T[lang];
  const vote = async (v: "up" | "down") => { setVoted(v); setErr(""); try { await api.satiFeedback(v, "how-sati", lang); } catch (e) { setErr((e as Error).message); } };
  let n = 0;
  const h2 = "mb-0 text-[18px] font-bold";
  return <article className="min-h-full bg-white text-[#14112B] pb-[env(safe-area-inset-bottom)]">
    <header className="sticky top-0 z-20 flex items-center gap-2 px-3 py-2 bg-white border-b border-[#ECECF4]">
      <button type="button" aria-label={t.back} onClick={onBack} className="w-11 h-11 flex items-center justify-center"><ArrowLeft size={22} aria-hidden /></button>
      <span className="flex-1 text-[15px] font-bold">{t.back}</span>
      <div role="radiogroup" className="flex p-[3px] rounded-full border border-[#E6E6F0]">
        {(["lo", "en"] as const).map(l => <button key={l} type="button" role="radio" aria-checked={lang === l} onClick={() => setLang(l)} className={`h-8 min-w-11 px-2.5 rounded-full text-[13px] font-bold ${lang === l ? "bg-[#5B21D1] text-white" : "bg-transparent text-[#14112B]"}`}>{l === "lo" ? "ລາວ" : "EN"}</button>)}
      </div>
    </header>

    <section className="px-5 pt-[22px] pb-5 bg-gradient-to-b from-[#F3F0FC] to-white">
      <img src={logoImage} alt="" aria-hidden className="w-11 h-11 mb-2.5 object-contain" />
      <h1 className="mb-2 text-[26px] leading-[1.3] font-bold">{t.title}</h1>
      <p className="mb-3.5 text-[14px] leading-[1.65] text-[#3F4268]">{t.intro}</p>
      <div className="flex flex-wrap gap-1.5">{t.covers.map(c => <span key={c} className="px-2.5 py-1 rounded-full bg-white border border-[#E4DBFB] text-[#5B21D1] text-[12px] font-semibold">{c}</span>)}</div>
    </section>

    <section className="px-5 pt-2 pb-1"><h2 className={`${h2} mb-3.5`}>{t.flowTitle}</h2>
      {FLOW[lang].map(([title, text], i) => <div key={i} className="flex gap-3.5">
        <div className="flex flex-col items-center"><span className="flex shrink-0 w-8 h-8 rounded-full items-center justify-center text-[13px] font-extrabold font-[BoonHome,sans-serif]" style={{ background: STEP_BG[i], color: STEP_FG[i] }}>{i + 1}</span>{i < 4 && <span className="flex-1 w-0.5 min-h-[18px] my-1 bg-[#ECECF4]" />}</div>
        <div className="pb-4"><p className="mt-[5px] mb-0.5 text-[15px] font-bold">{title}</p><p className="text-[13px] leading-[1.6] text-[#5F6390]">{text}</p></div>
      </div>)}
    </section>

    <section className="px-5 pt-2 pb-1"><h2 className={`${h2} mb-1`}>{t.fixedTitle}</h2><p className="mb-3 text-[13px] text-[#5F6390]">{t.fixedSub}</p>
      <div className="rounded-[18px] border border-[#ECECF4] overflow-hidden">
        {CHECKS[lang].map(([id, badge, bg, fg, title, text, example]) => { const on = open === id; return <div key={id} className="border-b border-[#F1F1F6] last:border-b-0">
          <button type="button" aria-expanded={on} onClick={() => setOpen(on ? null : id)} className="flex w-full items-center gap-3 min-h-14 px-3.5 bg-white text-left">
            <span className="flex shrink-0 w-[34px] h-[34px] rounded-[10px] items-center justify-center text-[12px] font-extrabold font-[BoonHome,sans-serif]" style={{ background: bg, color: fg }}>{badge}</span>
            <span className="flex-1 text-[14px] font-bold">{title}</span>
            <ChevronDown size={18} aria-hidden className="text-[#8A8DB0]" style={{ transform: on ? "rotate(180deg)" : "none" }} />
          </button>
          {on && <div className="pl-[60px] pr-3.5 pb-3.5 text-[13px] leading-[1.6] text-[#3F4268]">{text}<p className="mt-2 px-2.5 py-2 rounded-[10px] bg-[#F6F7FC] text-[12px] text-[#5F6390] font-[BoonHome,sans-serif]">{example}</p></div>}
        </div>; })}
      </div>
    </section>

    <section className="px-5 pt-[22px] pb-1">
      <div className="flex items-baseline gap-2 mb-1"><span className="text-[30px] font-extrabold text-[#5B21D1] leading-none font-[BoonHome,sans-serif]">17</span><h2 className={h2}>{t.pointsTitle}</h2></div>
      <p className="mb-3.5 text-[13px] leading-[1.55] text-[#5F6390]">{t.pointsSub}</p>
      {POINTS[lang].map(([title, fg, bg, items]) => <div key={title as string} className="mb-3.5">
        <p className="flex items-center gap-1.5 mb-2 text-[13px] font-bold" style={{ color: fg as string }}><span className="w-2 h-2 rounded-full" style={{ background: fg as string }} />{title as string}</p>
        <div className="grid grid-cols-2 gap-1.5">{(items as string[]).map(it => { n += 1; return <div key={it} className="flex items-center gap-2 min-h-11 py-1.5 pr-2.5 pl-1.5 rounded-xl" style={{ background: bg as string }}>
          <span className="flex shrink-0 w-[26px] h-[26px] rounded-lg bg-white items-center justify-center text-[12px] font-extrabold font-[BoonHome,sans-serif]" style={{ color: fg as string }}>{n}</span>
          <span className="text-[12px] font-semibold leading-[1.35]">{it}</span></div>; })}</div>
      </div>)}
    </section>

    <section className="px-5 pt-[22px] pb-1"><h2 className={`${h2} mb-1`}>{t.labelsTitle}</h2><p className="mb-3 text-[13px] text-[#5F6390]">{t.labelsSub}</p>
      <div className="flex flex-wrap gap-1.5">{LABELS[lang].map(([label, c]) => <span key={label} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[10px] bg-[#F6F7FC] text-[12px] font-semibold"><span className="w-[7px] h-[7px] rounded-full" style={{ background: c }} />{label}</span>)}</div>
    </section>

    <section className="px-5 pt-[22px] pb-1"><h2 className={`${h2} mb-3`}>{t.verdictTitle}</h2>
      <div className="flex flex-col gap-2">{VERDICTS[lang].map(([label, fg, bg, text]) => <div key={label} className="flex gap-3 p-3 rounded-[14px]" style={{ background: bg }}>
        <span className="shrink-0 w-2.5 h-2.5 mt-1.5 rounded-full" style={{ background: fg }} />
        <span><span className="block text-[14px] font-bold" style={{ color: fg }}>{label}</span><span className="block text-[13px] leading-[1.55] text-[#3F4268]">{text}</span></span></div>)}</div>
    </section>

    <section className="px-5 pt-[22px] pb-1"><h2 className={`${h2} mb-3`}>{t.guardTitle}</h2>
      {GUARDS[lang].map(g => <p key={g} className="flex gap-2.5 mb-2.5 text-[13px] leading-[1.6] text-[#3F4268]"><ShieldCheck size={18} aria-hidden className="shrink-0 mt-0.5 text-[#16A34A]" />{g}</p>)}
    </section>

    <section className="mx-5 mt-3.5 p-4 rounded-[18px] bg-[#FFFBEB] border border-[#FDE68A]"><h2 className="mb-2 text-[16px] font-bold">{t.limitsTitle}</h2>
      {LIMITS[lang].map(l => <p key={l} className="flex gap-2 mb-1.5 text-[13px] leading-[1.55] text-[#5C3D0A]"><span className="shrink-0 w-[5px] h-[5px] mt-2 rounded-full bg-[#D97706]" />{l}</p>)}
    </section>

    <section className="mx-5 mt-3.5 p-4 rounded-[18px] bg-[#F3F0FC]"><h2 className="mb-1.5 text-[16px] font-bold">{t.learnTitle}</h2><p className="mb-3 text-[13px] leading-[1.6] text-[#3F4268]">{t.learnText}</p>
      <div className="flex gap-2">
        <button type="button" onClick={() => void vote("up")} aria-pressed={voted === "up"} className="flex flex-1 items-center justify-center gap-1.5 h-[42px] rounded-xl border text-[#15803D] text-[13px] font-bold" style={{ borderColor: voted === "up" ? "#16A34A" : "#E6E6F0", background: voted === "up" ? "#DCFCE7" : "#fff" }}><ThumbsUp size={16} aria-hidden />{t.right}</button>
        <button type="button" onClick={() => void vote("down")} aria-pressed={voted === "down"} className="flex flex-1 items-center justify-center gap-1.5 h-[42px] rounded-xl border text-[#B91C1C] text-[13px] font-bold" style={{ borderColor: voted === "down" ? "#DC2626" : "#E6E6F0", background: voted === "down" ? "#FEE2E2" : "#fff" }}><ThumbsDown size={16} aria-hidden />{t.wrong}</button>
      </div>
      {voted && <p role="status" className="mt-2.5 text-[12px] font-bold text-[#5B21D1]">{t.thanks}</p>}
      {err && <p role="alert" className="mt-2 text-[12px] text-[#DC2626]">{err}</p>}
    </section>

    <section className="flex gap-2 mx-5 mt-3.5 mb-7">
      <a href="tel:1533" className="flex flex-1 flex-col p-3 rounded-[14px] border border-[#ECECF4]"><span className="text-[20px] font-extrabold text-[#E11D48] font-[BoonHome,sans-serif]">1533</span><span className="text-[12px] text-[#5F6390]">{t.h1533}</span></a>
      <a href="tel:1191" className="flex flex-1 flex-col p-3 rounded-[14px] border border-[#ECECF4]"><span className="text-[20px] font-extrabold text-[#E11D48] font-[BoonHome,sans-serif]">1191</span><span className="text-[12px] text-[#5F6390]">{t.h1191}</span></a>
    </section>
  </article>;
}
