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
  safe: { Icon: CircleCheck, cls: "bg-[#ECFDF5] text-[#15803D]", dot: "#15803D", lo: "ປອດໄພ", en: "Safe", loWhy: "ກວດແລ້ວ ບໍ່ພົບສັນຍານອັນຕະລາຍ. ຂໍ້ມູນ ຫຼື ຄຳແນະນຳທີ່ເຊື່ອຖືໄດ້.", loDo: "ອ່ານ ແລະ ແບ່ງປັນໄດ້", enDo: "Fine to read and share", tint: "#F0FDF4", enWhy: "Checked, no risk found." },
  check: { Icon: TriangleAlert, cls: "bg-[#FFFBEB] text-[#B45309]", dot: "#B45309", lo: "ກວດກ່ອນ", en: "Check first", loWhy: "ມີບາງຈຸດໜ້າສົງໄສ ຫຼື ຂໍ້ມູນບໍ່ຄົບ.", loDo: "ຢ່າໂອນເງິນ ຫຼື ສົ່ງເອກະສານ ຈົນກວ່າຈະກວດ", enDo: "Do not send money or documents until checked", tint: "#FFFBEB", enWhy: "Some signs. Verify before you trust it." },
  warn: { Icon: OctagonAlert, cls: "bg-[#FEF2F2] text-[#DC2626]", dot: "#DC2626", lo: "ເຕືອນ", en: "Warning", loWhy: "ພົບຮູບແບບການຫຼອກລວງ ຫຼື ອັນຕະລາຍຢ່າງຊັດເຈນ.", loDo: "ຢ່າຕອບ ຢ່າກົດລິ້ງ · ລາຍງານ 1533", enDo: "Do not reply or click links · report to 1533", tint: "#FEF2F2", enWhy: "Signs of a scam or trafficking." },
  pending: { Icon: Hourglass, cls: "bg-[#F3F4F8] text-[#5F6390]", dot: "#5F6390", lo: "ລໍຖ້າກວດ", en: "Awaiting review", loWhy: "ໂພສໃໝ່ ກຳລັງລໍຖ້າຜູ້ກວດ (ພາຍໃນ 48 ຊົ່ວໂມງ).", loDo: "ລະວັງໄວ້ກ່ອນ", enDo: "Be careful for now", tint: "#F3F4F8", enWhy: "Waiting for review, up to 48 hours." },
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
    className={"relative inline-flex items-center gap-[5px] h-7 rounded-full px-2.5 text-[12px] font-bold before:absolute before:-inset-y-2 before:-inset-x-1 before:content-[''] "+s.cls}>
    <span aria-hidden className="w-[7px] h-[7px] rounded-full" style={{ background: s.dot }} />{s[lang]}
  </button>;
}

export function ColorCodeButton({ lang }: { lang: Lang }) {
  return <button type="button" onClick={openColorCode} className="h-9 inline-flex items-center gap-1 px-0.5 text-[15px] font-bold text-[#5B21D1]">
    <CircleHelp size={18} strokeWidth={2} aria-hidden />{lang === "lo" ? "ລະຫັດສີ" : "Colour code"}
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
  return <div className="fixed inset-0 z-[70] flex items-end justify-center bg-[rgba(20,17,43,0.45)]" onClick={() => set(false)}>
    <div ref={ref} tabIndex={-1} role="dialog" aria-modal="true" aria-label={lo ? "ລະຫັດສີ" : "Colour code"} onClick={e => e.stopPropagation()}
      className="w-full max-w-[480px] max-h-[85dvh] overflow-y-auto rounded-t-[26px] bg-white px-5 pt-2.5 pb-[calc(24px+env(safe-area-inset-bottom))] outline-none">
      <span aria-hidden className="mx-auto mb-2.5 block h-[5px] w-10 rounded-full bg-[#E0E1EB]" />
      <div className="flex items-center mb-1">
        <h2 className="flex-1 text-[20px] font-bold">{lo ? "ລະຫັດສີ ໝາຍຄວາມວ່າແນວໃດ?" : "What do the colours mean?"}</h2>
        <button type="button" aria-label={lo ? "ປິດ" : "Close"} onClick={() => set(false)} className="flex w-9 h-9 items-center justify-center rounded-full bg-[#F3F4F8] text-[#5F6390]"><X size={16} aria-hidden /></button>
      </div>
      <p className="mb-4 text-[13px] leading-[1.55] text-[#5F6390]">{lo ? "ທຸກໂພສຖືກກວດໂດຍ Sati AI ແລະ ຜູ້ກວດ. ສີບອກວ່າປອດໄພພຽງໃດ." : "Every post is checked by Sati AI and reviewers. The colour shows how safe it is."}</p>
      <ul className="flex flex-col gap-2.5">
        {(["safe", "check", "warn", "pending"] as const).map(k => { const s = STATUS[k]; return <li key={k} className="flex gap-3 p-3 rounded-2xl" style={{ background: s.tint }}>
          <span className="flex shrink-0 w-9 h-9 rounded-full bg-white items-center justify-center"><span className="w-3 h-3 rounded-full" style={{ background: s.dot }} /></span>
          <span className="flex-1">
            <span className="block text-[15px] font-bold" style={{ color: s.dot }}>{s[lang]}</span>
            <span className="block my-0.5 mb-1 text-[13px] leading-[1.5] text-[#3F4268]">{lo ? s.loWhy : s.enWhy}</span>
            <span className="block text-[12px] font-bold text-[#14112B]">→ {lo ? s.loDo : s.enDo}</span>
          </span>
        </li>; })}
      </ul>
      <h3 className="mt-5 mb-1 text-[16px] font-bold">{lo ? "ເຫດຜົນທີ່ໂພສຖືກໝາຍ" : "Why a post gets flagged"}</h3>
      <p className="mb-3 text-[13px] leading-[1.55] text-[#5F6390]">{lo ? "ໂພສຕ້ອງກ່ຽວກັບການຫຼອກລວງ, ການຄ້າມະນຸດ, ການເດີນທາງ ແລະ ວຽກຢ່າງປອດໄພ, ເງິນ ແລະ ອອນລາຍ. ອັນນີ້ຈະຖືກໝາຍ ແລະ ອາດບໍ່ສະແດງ:" : "Posts must be about scams, trafficking, safe migration, jobs and study, money and online safety. These get a note and may be held back:"}</p>
      <ul className="flex flex-col gap-2 mb-1">
        {([
          ["warn", "ການຫຼອກລວງ / ຫຼອກຄ້າມະນຸດ", "Scam or trafficking", "ເງິນເດືອນສູງຜິດປົກກະຕິ, “ຟຣີວີຊາ/ປີ້ຍົນ”, ເກັບໜັງສືຜ່ານແດນ, ຕິດຕໍ່ຜ່ານ WhatsApp ເທົ່ານັ້ນ.", "Big pay, “free visa/flights”, passport held, WhatsApp-only contact."],
          ["check", "ນອກຫົວຂໍ້", "Off topic", "ບໍ່ກ່ຽວກັບຄວາມປອດໄພ. ໂຄສະນາທ່ອງທ່ຽວ, ຂາຍເຄື່ອງ, ພະນັນ, ຄຣິບໂຕລວຍໄວ.", "Not about staying safe. Travel or shop ads, gambling, get-rich crypto."],
          ["check", "ຄຳຫຍາບ / ດູໝິ່ນ", "Bad words or insults", "ຄຳຫຍາບ ຫຼື ດູໝິ່ນ ທັງພາສາລາວ ແລະ ອັງກິດ.", "Profanity or insults in Lao or English."],
          ["check", "ການເມືອງ / ເສຍດສີ", "Politics or satire", "ເຍາະເຍ້ຍ ຫຼື ເສຍດສີຜູ້ນຳ, ເນື້ອຫາຝ່າຍໃດຝ່າຍໜຶ່ງ.", "Mocking public figures, taking a side."],
          ["pending", "ວຽກ / ຮຽນຕໍ່ / ເດັກ", "Jobs, study abroad, children", "ຕ້ອງໃຫ້ຄົນກວດກ່ອນສະແດງ.", "A person checks these before they are shown."],
        ] as const).map(([k, tl, te, dl, de]) => { const s = STATUS[k]; return <li key={te} className="flex gap-3 p-2.5 rounded-xl" style={{ background: s.tint }}>
          <span aria-hidden className="mt-1.5 w-2.5 h-2.5 shrink-0 rounded-full" style={{ background: s.dot }} />
          <span className="flex-1"><span className="block text-[14px] font-bold">{lo ? tl : te}</span><span className="block text-[12.5px] leading-[1.5] text-[#3F4268]">{lo ? dl : de}</span></span>
        </li>; })}
      </ul>
      <button type="button" onClick={() => set(false)} className="w-full min-h-[50px] mt-4 rounded-[14px] bg-[#14112B] text-white text-[15px] font-bold">{lo ? "ເຂົ້າໃຈແລ້ວ" : "Got it"}</button>
    </div>
  </div>;
}
