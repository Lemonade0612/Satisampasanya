import { useEffect, useRef, useSyncExternalStore } from "react";
import { CircleCheck, TriangleAlert, OctagonAlert, Hourglass, CircleHelp, X } from "lucide-react";
import type { Lang, Post } from "../../types";
import { postRisk } from "../../lib/scamTypes";

// One status per post. Words and an icon carry the meaning as well as the colour.
export type Status = "safe" | "check" | "warn" | "pending";

export const statusOf = (post: Post): Status => {
  if (post.state === "flagged" || post.state === "sla") return "pending";
  if (post.risk_level) return ({ green: "safe", yellow: "check", red: "warn" } as const)[post.risk_level];
  const v = post.check?.verdict;
  if (v) return v === "approved" ? "safe" : "check";
  const r = postRisk(post);
  return r === "red" ? "warn" : r === "yellow" ? "check" : r === "green" ? "safe" : "pending";
};

export const STATUS = {
  safe: { Icon: CircleCheck, cls: "bg-[#DCFCE7] text-[#15803D]", dot: "#16A34A", lo: "ປອດໄພ", en: "Safe", loWhy: "ກວດແລ້ວ ບໍ່ພົບຄວາມສ່ຽງ.", enWhy: "Checked, no risk found." },
  check: { Icon: TriangleAlert, cls: "bg-[#FEF3C7] text-[#B45309]", dot: "#B45309", lo: "ກວດກ່ອນ", en: "Check first", loWhy: "ມີສັນຍານບາງຢ່າງ. ກວດສອບກ່ອນເຊື່ອ.", enWhy: "Some signs. Verify before you trust it." },
  warn: { Icon: OctagonAlert, cls: "bg-[#FEE2E2] text-[#B91C1C]", dot: "#DC2626", lo: "ເຕືອນ", en: "Warning", loWhy: "ມີສັນຍານການຫຼອກລວງ ຫຼື ການຄ້າມະນຸດ.", enWhy: "Signs of a scam or trafficking." },
  pending: { Icon: Hourglass, cls: "bg-[#EEF0F5] text-[#5F6390]", dot: "#8B90B0", lo: "ລໍຖ້າກວດ", en: "Awaiting review", loWhy: "ລໍຖ້າການກວດສອບ, ສູງສຸດ 48 ຊົ່ວໂມງ.", enWhy: "Waiting for review, up to 48 hours." },
} as const;

// A tiny store so any status pill can open the single sheet mounted by the feed.
let open = false; const subs = new Set<() => void>();
const set = (v: boolean) => { open = v; subs.forEach(f => f()); };
export const openColorCode = () => set(true);
const useOpen = () => useSyncExternalStore(f => { subs.add(f); return () => { subs.delete(f); }; }, () => open);

export function StatusPill({ post, lang }: { post: Post; lang: Lang }) {
  if (post.example) return null;
  const s = STATUS[statusOf(post)];
  return <button type="button" onClick={openColorCode} aria-haspopup="dialog" aria-label={`${lang === "lo" ? "ສະຖານະ" : "Status"}: ${s[lang]}. ${lang === "lo" ? "ເບິ່ງຄວາມໝາຍ" : "What this means"}`}
    className={"relative inline-flex items-center gap-1.5 h-7 rounded-full px-2.5 text-[13px] font-bold before:absolute before:-inset-y-2 before:-inset-x-1 before:content-[''] "+s.cls}>
    <s.Icon size={14} strokeWidth={2} aria-hidden />{s[lang]}
  </button>;
}

export function ColorCodeButton({ lang }: { lang: Lang }) {
  return <button type="button" onClick={openColorCode} className="min-h-11 inline-flex items-center gap-1.5 px-2 text-[13px] font-bold text-text-muted">
    <CircleHelp size={16} strokeWidth={2} aria-hidden />{lang === "lo" ? "ລະຫັດສີ" : "Colour code"}
  </button>;
}

export function ColorCodeSheet({ lang }: { lang: Lang }) {
  const isOpen = useOpen(), ref = useRef<HTMLDivElement>(null), lo = lang === "lo";
  useEffect(() => {
    if (!isOpen) return;
    const back = document.activeElement as HTMLElement | null;
    ref.current?.focus();
    const key = (e: KeyboardEvent) => { if (e.key === "Escape") set(false); };
    document.addEventListener("keydown", key);
    return () => { document.removeEventListener("keydown", key); back?.focus?.(); };
  }, [isOpen]);
  if (!isOpen) return null;
  return <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/40" onClick={() => set(false)}>
    <div ref={ref} tabIndex={-1} role="dialog" aria-modal="true" aria-label={lo ? "ລະຫັດສີ" : "Colour code"} onClick={e => e.stopPropagation()}
      className="w-full max-w-[480px] max-h-[85dvh] overflow-y-auto rounded-t-3xl bg-background px-5 pt-3 pb-[calc(20px+env(safe-area-inset-bottom))] outline-none shadow-[0_-8px_30px_rgba(20,17,43,.18)]">
      <span aria-hidden className="mx-auto mb-3 block h-1 w-10 rounded-full bg-border" />
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-text">{lo ? "ລະຫັດສີ" : "Colour code"}</h2>
        <button type="button" aria-label={lo ? "ປິດ" : "Close"} onClick={() => set(false)} className="min-h-11 min-w-11 -mr-2 flex items-center justify-center rounded-full text-text-2"><X size={22} aria-hidden /></button>
      </div>
      <p className="mt-1 text-[15px] text-text-muted">{lo ? "Sati ກວດທຸກໂພສ ແລະ ໃສ່ສະຖານະໃຫ້." : "Sati checks every post and gives it a status."}</p>
      <ul className="mt-4 flex flex-col gap-3">
        {(["safe", "check", "warn", "pending"] as const).map(k => { const s = STATUS[k]; return <li key={k} className="flex items-start gap-3">
          <span className={`inline-flex items-center gap-1.5 h-8 shrink-0 rounded-full px-3 text-sm font-bold ${s.cls}`}><s.Icon size={16} aria-hidden />{s[lang]}</span>
          <span className="pt-1 text-[16px] leading-relaxed text-text">{lo ? s.loWhy : s.enWhy}</span>
        </li>; })}
      </ul>
      <button type="button" onClick={() => set(false)} className="mt-5 w-full min-h-[52px] rounded-2xl bg-primary text-primary-foreground text-base font-bold shadow-[0_5px_0_#3B0E91] active:translate-y-[3px] active:shadow-[0_2px_0_#3B0E91]">{lo ? "ເຂົ້າໃຈແລ້ວ" : "Got it"}</button>
    </div>
  </div>;
}
