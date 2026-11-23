import { useState } from "react";
import { AlertOctagon, Clock, Hourglass, LockKeyhole, ChevronRight } from "lucide-react";
import { SLA_MS, localInfo } from "../../lib/localScreening";
import { ReasonChips } from "./ReasonChips";
import { ScreeningTimeline } from "./ScreeningTimeline";
import type { Lang, Post } from "../../types";

/** State banner for a post: screening progress, expert review (flagged), correction (false), or 48h auto-unlock (sla). Tap for the log. */
export function ScreeningBanner({ post, lang }: { post: Post; lang: Lang }) {
  const lo = lang === "lo";
  const [open, setOpen] = useState(false);
  const info = localInfo(post);
  if (!info) return null;
  const s = post.state;
  const hoursLeft = Math.max(0, Math.ceil((SLA_MS - (Date.now() - (post.createdAt ?? Date.now()))) / 3600000));
  const look = {
    screening: { box: "bg-white border-[#E0E1EB]", Icon: Hourglass, ic: "text-[#5B21D1]", title: lo ? "ກຳລັງກວດສອບໂດຍ AI" : "Under AI review", body: lo ? "ໂພສນີ້ຍັງບໍ່ສະແດງໃນຝີດ ຈົນກວ່າຈະກວດແລ້ວ." : "This post is not shown in the feed until the check finishes.", tone: "slate" as const },
    flagged: { box: "bg-amber-50 border-amber-200", Icon: Clock, ic: "text-amber-600", title: lo ? "ລໍຖ້າຜູ້ຊ່ຽວຊານກວດ" : "Waiting for expert review", body: lo ? "ໂພສນີ້ຖືກພັກໄວ້ ແລະ ປິດການມີສ່ວນຮ່ວມ." : "This post is on hold. Likes, comments and sharing are off.", tone: "amber" as const },
    false: { box: "bg-red-50 border-red-200", Icon: AlertOctagon, ic: "text-red-600", title: lo ? "ໂພສນີ້ອາດບໍ່ປອດໄພ" : "This post may be unsafe", body: lo ? "ລະບົບພົບສັນຍານອັນຕະລາຍ. ກະລຸນາຢ່າເຮັດຕາມ." : "Sati found warning signs. Please do not act on it.", tone: "red" as const },
    sla: { box: "bg-slate-50 border-slate-200", Icon: LockKeyhole, ic: "text-slate-500", title: lo ? "ປົດລັອກອັດຕະໂນມັດ" : "Auto-unlock after 48 hours", body: lo ? `ບໍ່ມີຜູ້ກວດພາຍໃນ 48 ຊົ່ວໂມງ. ເຫຼືອປະມານ ${hoursLeft} ຊົ່ວໂມງ.` : `No expert reviewed it in time. About ${hoursLeft}h left before it unlocks.`, tone: "slate" as const },
  }[s as "screening" | "flagged" | "false" | "sla"];
  if (!look) return null;
  const Icon = look.Icon;
  return (
    <div className={`mb-3 rounded-xl border p-3 ${look.box} font-[BoonHome,sans-serif]`}>
      <button type="button" onClick={() => setOpen(true)} className="w-full flex items-start gap-2.5 text-left min-h-11">
        <Icon size={18} aria-hidden className={`${look.ic} shrink-0 mt-0.5`} />
        <span className="flex-1 min-w-0">
          <span className="block text-[14px] font-bold text-[#14112B]">{look.title}</span>
          <span className="block text-[13px] text-[#3F4268] mt-0.5">{look.body}</span>
        </span>
        <span className="flex items-center text-[12px] font-bold text-[#5F6390] shrink-0 self-center">{lo ? "ບັນທຶກ" : "Log"}<ChevronRight size={16} aria-hidden /></span>
      </button>
      {s === "screening" && <div role="progressbar" aria-valuenow={info.progress} aria-valuemin={0} aria-valuemax={100} className="mt-2 h-1.5 rounded-full bg-[#E6E3F2] overflow-hidden"><i className="block h-full bg-[#5B21D1]" style={{ width: `${info.progress}%` }} /></div>}
      {s === "false" && (post.correction || post.correctionLo) && <p className="mt-2 text-[13px] text-red-800">{lo ? "ການແກ້ໄຂ: " : "Correction: "}{(lo ? post.correctionLo : post.correction) || post.correction || post.correctionLo}</p>}
      {s !== "screening" && <ReasonChips flags={info.flags} lang={lang} tone={look.tone} />}
      {open && <ScreeningTimeline info={info} lang={lang} onClose={() => setOpen(false)} />}
    </div>
  );
}
