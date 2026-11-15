import { useState } from "react";
import { ArrowLeft, Bot, CircleCheck, FilePenLine, Gavel, OctagonAlert, PhoneCall, ShieldAlert, Tags, ThumbsDown, ThumbsUp, TriangleAlert, Hourglass } from "lucide-react";
import logoImage from "/images/sati-mark.png";
import { SCREENING_CHECKS, type ScreeningCheck } from "../../../shared/ai-screening";
import { LABELS } from "../../../shared/check-labels.mjs";
import { checkLabel } from "../lib/scamTypes";
import { api } from "../lib/api";
import type { Lang } from "../types";

const GROUPS: { id: ScreeningCheck["group"]; lo: string; en: string; hintLo: string; hintEn: string; cls: string; Icon: typeof CircleCheck }[] = [
  { id: "block", lo: "ບລັອກ / ສົ່ງກວດ", en: "Block", hintLo: "ພົບແລ້ວ ໂພສຖືກບລັອກ ຫຼື ສົ່ງໃຫ້ຄົນກວດ", hintEn: "A hit blocks the post or sends it to a person", cls: "border-[#DC2626] bg-[#FEE2E2] text-[#7F1D1D]", Icon: OctagonAlert },
  { id: "caution", lo: "ລະວັງ", en: "Caution", hintLo: "ພົບແລ້ວ ຄະແນນຄວາມສ່ຽງເພີ່ມຂຶ້ນ", hintEn: "A hit raises the risk score", cls: "border-[#B45309] bg-[#FEF3C7] text-[#78350F]", Icon: TriangleAlert },
  { id: "boost", lo: "ເພີ່ມຄວາມໜ້າເຊື່ອຖື", en: "Boost", hintLo: "ພົບແລ້ວ ໂພສໜ້າເຊື່ອຖືຂຶ້ນ", hintEn: "A hit makes the post more trustworthy", cls: "border-[#16A34A] bg-[#DCFCE7] text-[#14532D]", Icon: CircleCheck },
];
const FLOW = [
  { Icon: FilePenLine, lo: "ສົ່ງໂພສ", en: "You submit", bLo: "ທ່ານຂຽນ ແລະ ກົດໂພສ.", bEn: "You write the post and tap Post." },
  { Icon: Bot, lo: "AI ກວດ", en: "AI check", bLo: "Sati ກວດ 17 ຈຸດ ແລະ ອ່ານຄວາມໝາຍ.", bEn: "Sati runs 17 checks and reads the meaning." },
  { Icon: Tags, lo: "ໃສ່ປ້າຍ", en: "Labels", bLo: "ໂພສໄດ້ປ້າຍ ເຊັ່ນ ສັນຍານຫຼອກລວງ ຫຼື ເຄັດລັບປອດໄພ.", bEn: "The post gets labels such as scam risk or safe tip." },
  { Icon: ShieldAlert, lo: "ຜົນສະຫຼຸບ", en: "Verdict", bLo: "ປອດໄພ, ກວດກ່ອນ ຫຼື ເຕືອນ.", bEn: "Safe, check first, or warning." },
  { Icon: Gavel, lo: "ຄົນກວດ", en: "Human review", bLo: "ໂພສທີ່ບໍ່ແນ່ໃຈໄປຫາຜູ້ກວດ ພາຍໃນ 48 ຊົ່ວໂມງ.", bEn: "Unsure posts go to a reviewer within 48 hours." },
];
const VERDICTS = [
  { Icon: CircleCheck, cls: "bg-[#DCFCE7] text-[#15803D]", lo: "ປອດໄພ", en: "Safe", bLo: "ກວດແລ້ວ ບໍ່ພົບຄວາມສ່ຽງ.", bEn: "Checked, no risk found." },
  { Icon: TriangleAlert, cls: "bg-[#FEF3C7] text-[#B45309]", lo: "ກວດກ່ອນ", en: "Check first", bLo: "ມີສັນຍານບາງຢ່າງ. ກວດສອບກ່ອນເຊື່ອ.", bEn: "Some signs. Verify before you trust it." },
  { Icon: OctagonAlert, cls: "bg-[#FEE2E2] text-[#B91C1C]", lo: "ເຕືອນ", en: "Warning", bLo: "ມີສັນຍານການຫຼອກລວງ ຫຼື ການຄ້າມະນຸດ.", bEn: "Signs of a scam or trafficking." },
  { Icon: Hourglass, cls: "bg-[#EEF0F5] text-[#5F6390]", lo: "ລໍຖ້າກວດ", en: "Awaiting review", bLo: "ລໍຖ້າຜູ້ກວດ, ສູງສຸດ 48 ຊົ່ວໂມງ.", bEn: "Waiting for a reviewer, up to 48 hours." },
];
const SAFE = [
  { lo: "ຄົນເປັນຜູ້ຕັດສິນສຸດທ້າຍ ໃນເລື່ອງທີ່ບໍ່ແນ່ໃຈ ແລະ ເລື່ອງອ່ອນໄຫວ.", en: "A person makes the final call on unsure and sensitive cases." },
  { lo: "ໂພສຂອງເດັກ ສະແດງແຕ່ທີ່ກວດແລ້ວ.", en: "Kids only see posts that were checked." },
  { lo: "ຜູ້ກວດບໍ່ເປີດເຜີຍຕົວຕົນ ແລະ ບັນທຶກສ່ວນຕົວບໍ່ອອກຈາກໜ້າທີ່ກວດ.", en: "Reviewers stay anonymous and their notes stay in the review workspace." },
  { lo: "ເຮົາສະແດງເຫດຜົນສະເໝີ ບໍ່ແມ່ນພຽງສີ.", en: "We always show the reason, not just a colour." },
];

// How Sati checks: five steps, the 17 checks (rendered from shared/ai-screening.ts), the 14 labels (shared/check-labels.mjs),
// what each verdict means, safeguards and limits, a "help Sati learn" vote and the hotlines.
export function HowSati({ lang: appLang, onBack }: { lang: Lang; onBack: () => void }) {
  const [lang, setLang] = useState<Lang>(appLang), [voted, setVoted] = useState<"up" | "down" | null>(null), [err, setErr] = useState("");
  const lo = lang === "lo", h = (l: string, e: string) => (lo ? l : e);
  const vote = async (v: "up" | "down") => { setVoted(v); setErr(""); try { await api.satiFeedback(v, "how-sati", lang); } catch (e) { setErr((e as Error).message); } };
  return <article className="min-h-full bg-[#F7F7FA] text-text font-lao pb-[calc(32px+env(safe-area-inset-bottom))]">
    <div className="sticky top-0 z-20 flex items-center gap-2 px-2 h-14 bg-background/95 backdrop-blur border-b border-border">
      <button type="button" aria-label={h("ກັບຄືນ", "Back")} onClick={onBack} className="min-h-11 min-w-11 flex items-center justify-center rounded-full"><ArrowLeft size={22} aria-hidden /></button>
      <p className="flex-1 font-bold text-[17px] truncate">{h("ວິທີ Sati ກວດ", "How Sati checks")}</p>
      <div role="group" aria-label="Language" className="flex rounded-full border border-border overflow-hidden text-sm font-bold">
        {(["lo", "en"] as const).map(l => <button key={l} type="button" aria-pressed={lang === l} onClick={() => setLang(l)} className={`min-h-9 px-3 ${lang === l ? "bg-primary text-primary-foreground" : "bg-background text-text"}`}>{l === "lo" ? "ລາວ" : "EN"}</button>)}
      </div>
    </div>
    <header className="px-4 pt-6 pb-4 text-center bg-gradient-to-b from-[#EDE9FE] to-[#F7F7FA]">
      <img src={logoImage} alt="" aria-hidden className="mx-auto w-16 h-16 object-contain" />
      <h1 className="mt-2 text-[1.625rem] leading-tight font-extrabold">{h("ວິທີ Sati ກວດໂພສ", "How Sati checks a post")}</h1>
      <p className="mt-2 text-[1.0625rem] leading-relaxed text-text-muted">{h("ກວດທຸກໂພສກ່ອນໃຜຈະເຫັນ ເພື່ອຊ່ວຍໃຫ້ທ່ານຮູ້ເທົ່າທັນການຫຼອກລວງ.", "Every post is checked so you can spot scams and trafficking early.")}</p>
    </header>

    <section className="px-4 mt-2" aria-labelledby="flow"><h2 id="flow" className="text-[1.25rem] font-extrabold">{h("5 ຂັ້ນຕອນ", "5 steps")}</h2>
      <ol className="mt-3 grid gap-3">{FLOW.map((s, i) => <li key={i} className="flex gap-3 rounded-2xl bg-white border border-[#E6E6F0] p-3.5">
        <span aria-hidden className="w-11 h-11 shrink-0 rounded-xl bg-[#EDE9FE] text-[#5B21D1] flex items-center justify-center"><s.Icon size={22} /></span>
        <span className="min-w-0"><span className="block text-[13px] font-bold text-text-muted">{h("ຂັ້ນ", "Step")} {i + 1}</span><span className="block text-[1.0625rem] font-extrabold">{h(s.lo, s.en)}</span><span className="block text-[1rem] leading-relaxed text-text-muted">{h(s.bLo, s.bEn)}</span></span></li>)}</ol></section>

    <section className="px-4 mt-8" aria-labelledby="checks"><h2 id="checks" className="text-[1.25rem] font-extrabold">{h(`${SCREENING_CHECKS.length} ຈຸດກວດທຸກໂພສ`, `${SCREENING_CHECKS.length} checks on every post`)}</h2>
      {GROUPS.map(g => { const items = SCREENING_CHECKS.filter(c => c.group === g.id); return <div key={g.id} className="mt-4">
        <p className={`inline-flex items-center gap-2 rounded-full border-2 px-3 py-1 text-[14px] font-extrabold ${g.cls}`}><g.Icon size={16} aria-hidden />{h(g.lo, g.en)} · {items.length}</p>
        <p className="mt-1 text-[14px] text-text-muted">{h(g.hintLo, g.hintEn)}</p>
        <ul className="mt-2 grid gap-2">{items.map(c => <li key={c.id} className="rounded-2xl bg-white border border-[#E6E6F0] px-4 py-3"><p className="text-[1.0625rem] font-bold"><span className="text-text-muted tabular-nums">{c.id}.</span> {h(c.lo, c.en)}</p><p className="text-[15px] leading-relaxed text-text-muted">{h(c.whyLo, c.whyEn)}</p></li>)}</ul></div>; })}</section>

    <section className="px-4 mt-8" aria-labelledby="labels"><h2 id="labels" className="text-[1.25rem] font-extrabold">{h(`${LABELS.length} ປ້າຍ`, `${LABELS.length} labels`)}</h2>
      <p className="mt-1 text-[15px] text-text-muted">{h("ປ້າຍທີ່ AI ສາມາດໃສ່ໃຫ້ໂພສ.", "The labels the AI can give a post.")}</p>
      <ul className="mt-3 flex flex-wrap gap-2">{LABELS.map(l => <li key={l} className="rounded-full bg-white border border-[#E6E6F0] px-3.5 py-1.5 text-[15px] font-bold">{checkLabel(l, lang)}</li>)}</ul></section>

    <section className="px-4 mt-8" aria-labelledby="verdicts"><h2 id="verdicts" className="text-[1.25rem] font-extrabold">{h("ຜົນສະຫຼຸບໝາຍເຖິງຫຍັງ", "What each verdict means")}</h2>
      <ul className="mt-3 grid gap-3">{VERDICTS.map(v => <li key={v.en} className="flex items-start gap-3"><span className={`inline-flex items-center gap-1.5 h-8 shrink-0 rounded-full px-3 text-sm font-bold ${v.cls}`}><v.Icon size={16} aria-hidden />{h(v.lo, v.en)}</span><span className="pt-1 text-[1.0625rem] leading-relaxed">{h(v.bLo, v.bEn)}</span></li>)}</ul></section>

    <section className="px-4 mt-8" aria-labelledby="safe"><h2 id="safe" className="text-[1.25rem] font-extrabold">{h("ການປົກປ້ອງ", "Safeguards")}</h2>
      <ul className="mt-3 grid gap-2 list-disc pl-5 text-[1.0625rem] leading-relaxed marker:text-primary">{SAFE.map((s, i) => <li key={i}>{h(s.lo, s.en)}</li>)}</ul></section>

    <section className="px-4 mt-8"><div className="rounded-2xl border-2 border-[#B45309] bg-[#FEF3C7] p-4 text-[#78350F]"><h2 className="flex items-center gap-2 text-[1.125rem] font-extrabold"><TriangleAlert size={20} aria-hidden />{h("ຂໍ້ຈຳກັດ", "Limits")}</h2>
      <p className="mt-1 text-[1.0625rem] leading-relaxed font-bold">{h("Sati ອາດຜິດໄດ້. ກວດສອບສະເໝີ.", "Sati can be wrong. Always verify.")}</p>
      <p className="mt-1 text-[1rem] leading-relaxed">{h("ຜົນກວດແມ່ນຕົວຊ່ວຍ ບໍ່ແມ່ນການຢືນຢັນຂໍ້ເທັດຈິງ. ຖ້າມີອັນຕະລາຍທັນທີ ໂທ 1191.", "A result is a helper, not proof. If someone is in danger now, call 1191.")}</p></div></section>

    <section className="px-4 mt-8" aria-labelledby="learn"><h2 id="learn" className="text-[1.25rem] font-extrabold">{h("ຊ່ວຍ Sati ຮຽນຮູ້", "Help Sati learn")}</h2>
      <p className="mt-1 text-[1rem] text-text-muted">{h("ໜ້ານີ້ເຂົ້າໃຈງ່າຍບໍ?", "Was this page clear?")}</p>
      <div className="mt-3 flex gap-3" role="group" aria-label={h("ຊ່ວຍ Sati ຮຽນຮູ້", "Help Sati learn")}>
        {([["up", ThumbsUp, "ເຂົ້າໃຈ", "Clear"], ["down", ThumbsDown, "ຍັງບໍ່ຊັດ", "Not clear"]] as const).map(([v, Icon, l, e]) => <button key={v} type="button" aria-pressed={voted === v} disabled={!!voted} onClick={() => void vote(v)}
          className={`flex-1 min-h-14 rounded-2xl border-2 font-bold text-[1.0625rem] flex items-center justify-center gap-2 ${voted === v ? "border-primary bg-[#EDE9FE] text-[#3B0E91]" : "border-[#E6E6F0] bg-white"} disabled:opacity-70`}><Icon size={22} aria-hidden />{h(l, e)}</button>)}</div>
      {voted && !err && <p role="status" className="mt-2 text-[1rem] font-bold text-[#15803D]">{h("ຂອບໃຈ!", "Thank you!")}</p>}
      {err && <p role="alert" className="mt-2 text-[15px] text-danger">{err}</p>}</section>

    <section className="px-4 mt-8" aria-labelledby="hot"><h2 id="hot" className="text-[1.25rem] font-extrabold">{h("ສາຍດ່ວນ", "Hotlines")}</h2>
      <div className="mt-3 grid gap-2">{[["1533", h("ສູນຕ້ານການສໍ້ໂກງອອນລາຍ · 24 ຊົ່ວໂມງ", "Anti-Online Fraud Centre · 24h")], ["1362", h("ສະຫະພັນແມ່ຍິງລາວ · 24/7", "Lao Women's Union · 24/7")], ["1191", h("ຕຳຫຼວດ · ສຸກເສີນ", "Police · emergency")]].map(([n, d]) => <a key={n} href={`tel:${n}`} className="flex items-center gap-3 rounded-2xl border-2 border-[#DC2626] bg-white px-4 min-h-14"><PhoneCall size={22} aria-hidden className="text-[#DC2626] shrink-0" /><span className="flex-1 text-[1rem] font-bold leading-tight">{d}</span><span className="text-[1.375rem] font-extrabold tabular-nums">{n}</span></a>)}</div></section>
  </article>;
}
