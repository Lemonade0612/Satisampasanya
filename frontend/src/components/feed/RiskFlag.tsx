import { useState } from "react";
import { CircleCheck, TriangleAlert, OctagonAlert, Flag, X, Phone } from "lucide-react";
import { request } from "../../lib/api";
import type { Lang, Post } from "../../types";

export type RiskLevel = "green" | "yellow" | "red";
export const riskLevel = (post: Post): RiskLevel | undefined => post.risk_level;

// Neutral label + small grey icon; words and icon carry the meaning, never colour. // REVIEW-LO
const LOOK = {
  green: { Icon: CircleCheck, en: "Verified", lo: "ຢືນຢັນແລ້ວ" },
  yellow: { Icon: TriangleAlert, en: "Check first", lo: "ກວດກ່ອນ" },
  red: { Icon: OctagonAlert, en: "Warning", lo: "ຄຳເຕືອນ" },
} as const;

export function RiskBadge({ post, lang }: { post: Post; lang: Lang }) {
  const level = riskLevel(post);
  if (!level || post.example) return null;
  const look = LOOK[level], lo = lang === "lo";
  return (
    <p className="mt-2">
      <span className="inline-flex items-center gap-1.5 text-sm text-text-muted">
        <look.Icon size={14} strokeWidth={1.5} aria-hidden />{look[lang]}
        {level === "green" && post.verified_source && <span>· {post.verified_source}</span>}
        <span className="sr-only">{lo ? "ລະດັບຄວາມສ່ຽງ" : "Risk level"}: {look[lang]}</span>
      </span>
    </p>
  );
}

const reasonsOf = (post: Post, lang: Lang) => (post.risk_reasons ?? []).map(r => r[lang] || r.en);

// Yellow: check first. A 3-step tip, plus the two places to ask.
export function YellowBanner({ post, lang }: { post: Post; lang: Lang }) {
  if (riskLevel(post) !== "yellow") return null;
  const lo = lang === "lo", reasons = reasonsOf(post, lang);
  const steps = lo ? ["ຖາມຄົນທີ່ໄວ້ໃຈ ກ່ອນຕອບຮັບ.", "ຊອກຫາຊື່ບໍລິສັດ ແລະ ທີ່ຢູ່ແທ້ ແລະ ກວດຢ່າງເປັນທາງການ.", "ຢ່າຈ່າຍເງິນ ຫຼື ສົ່ງເອກະສານສ່ວນຕົວກ່ອນກວດສອບ."]
    : ["Ask someone you trust before replying.", "Look up the real company name and address, and check them officially.", "Never pay or send ID documents before you have checked."];
  return (
    <div role="note" className="mt-3 rounded-xl border border-border bg-surface p-3 text-text">
      <p className="flex items-center gap-2 text-sm font-bold"><TriangleAlert size={16} aria-hidden />{lo ? "ກວດສອບກ່ອນສະໝັກ" : "Check before you apply"}</p>
      {reasons.length > 0 && <ul className="mt-1 list-disc pl-5 text-[13px]">{reasons.map(r => <li key={r}>{r}</li>)}</ul>}
      <ol className="mt-2 list-decimal pl-5 text-[13px]">{steps.map(s => <li key={s}>{s}</li>)}</ol>
      <p className="mt-2 flex items-center gap-1.5 text-[13px] font-bold"><Phone size={14} aria-hidden />{lo ? "ຖາມໄດ້ທີ່: ສາຍດ່ວນ 1362 ຫຼື iMAC" : "Ask: hotline 1362 or iMAC"}</p>
    </div>
  );
}

// Red posts reach the feed only when an admin publishes them as a warning example.
export function RedOverlay({ post, lang }: { post: Post; lang: Lang }) {
  if (riskLevel(post) !== "red") return null;
  const lo = lang === "lo", reasons = reasonsOf(post, lang);
  return (
    <div role="alert" className="mt-3 rounded-xl border border-border bg-surface p-3 text-text">
      <p className="flex items-center gap-2 text-sm font-bold"><OctagonAlert size={18} aria-hidden />{lo ? "ອາດເປັນການຫຼອກລວງ: ຢ່າຕິດຕໍ່" : "Likely scam: do not contact"}</p>
      {reasons.length > 0 && <><p className="mt-2 text-[13px] font-bold">{lo ? "ເປັນຫຍັງຈຶ່ງອັນຕະລາຍ:" : "Why it is dangerous:"}</p><ul className="list-disc pl-5 text-[13px]">{reasons.map(r => <li key={r}>{r}</li>)}</ul></>}
    </div>
  );
}

const REASONS: { id: string; en: string; lo: string }[] = [
  { id: "scam", en: "Scam", lo: "ການຫຼອກລວງ" }, { id: "trafficking", en: "Trafficking", lo: "ການຄ້າມະນຸດ" },
  { id: "fake_job", en: "Fake job", lo: "ວຽກປອມ" }, { id: "inappropriate", en: "Inappropriate", lo: "ບໍ່ເໝາະສົມ" }, { id: "off_topic", en: "Off-topic", lo: "ນອກຫົວຂໍ້" },
]; // REVIEW-LO

export function ReportButton({ post, lang }: { post: Post; lang: Lang }) {
  const [open, setOpen] = useState(false), [done, setDone] = useState(!!post.reported), [error, setError] = useState(""), [busy, setBusy] = useState(false);
  const lo = lang === "lo";
  const send = async (reason: string) => {
    setBusy(true); setError("");
    try { await request<Post>(`/posts/${post.id}/report`, "POST", { reason }); setDone(true); setOpen(false); }
    catch (e) { setError((e as Error).message); } finally { setBusy(false); }
  };
  return (
    <>
      <button type="button" disabled={done} onClick={() => setOpen(true)} className="min-h-[58px] flex flex-col items-center justify-center gap-1 text-[13px] leading-tight text-text-2 disabled:opacity-60">
        <Flag size={22} aria-hidden />{done ? (lo ? "ລາຍງານແລ້ວ" : "Reported") : (lo ? "ລາຍງານ" : "Report")}
      </button>
      {open && (
        <div className="phone-modal fixed inset-0 z-50 flex flex-col bg-background" role="dialog" aria-modal="true" aria-label={lo ? "ລາຍງານ" : "Report"}>
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <button type="button" aria-label={lo ? "ປິດ" : "Close"} onClick={() => setOpen(false)} className="min-h-11 min-w-11 flex items-center justify-center"><X size={20} aria-hidden /></button>
            <span className="text-sm font-semibold">{lo ? "ລາຍງານ / Report" : "Report / ລາຍງານ"}</span><span className="w-11" />
          </div>
          <div className="p-4 flex flex-col gap-2">
            <p className="text-sm text-text-muted">{lo ? "ໂພສນີ້ມີບັນຫາຫຍັງ?" : "What is wrong with this post?"}</p>
            {error && <p role="alert" className="text-sm text-danger">{error}</p>}
            {REASONS.map(r => <button key={r.id} type="button" disabled={busy} onClick={() => void send(r.id)} className="min-h-12 rounded-xl border border-border px-4 text-left text-[15px] font-bold disabled:opacity-60">{r[lang]}</button>)}
          </div>
        </div>
      )}
    </>
  );
}
