import { createPortal } from "react-dom";
import { X, CircleCheck, CircleAlert, Circle } from "lucide-react";
import type { ScreeningInfo } from "../../lib/localScreening";
import type { Lang } from "../../types";

/** The screening log as a bottom sheet: one line per step the engine ran. */
export function ScreeningTimeline({ info, lang, onClose }: { info: ScreeningInfo; lang: Lang; onClose: () => void }) {
  const lo = lang === "lo";
  const t0 = info.logs[0]?.time ?? 0;
  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/30" onClick={onClose}>
      <section role="dialog" aria-modal="true" aria-label={lo ? "ບັນທຶກການກວດສອບ" : "Screening log"} onClick={(e) => e.stopPropagation()} className="w-full max-w-md rounded-t-[24px] bg-white text-[#14112B] p-4 pb-[max(16px,env(safe-area-inset-bottom))] font-[BoonHome,sans-serif]">
        <header className="flex items-center justify-between">
          <h2 className="text-[17px] font-bold">{lo ? "ບັນທຶກການກວດສອບ" : "Screening log"}</h2>
          <button type="button" aria-label={lo ? "ປິດ" : "Close"} onClick={onClose} className="min-h-11 min-w-11 flex items-center justify-center text-[#5F6390]"><X size={20} aria-hidden /></button>
        </header>
        <p className="text-[13px] text-[#5F6390]">{lo ? "ຄະແນນຄວາມສ່ຽງ" : "Risk score"} {info.score}/100</p>
        <ol className="mt-3 border-l-2 border-[#ECECF4] ml-2 space-y-4">
          {info.logs.map((l, i) => {
            const Icon = l.severity === "high" ? CircleAlert : l.severity ? CircleAlert : i === info.logs.length - 1 ? CircleCheck : Circle;
            const color = l.severity === "high" ? "text-red-600" : l.severity ? "text-amber-600" : "text-[#8B8FB0]";
            return (
              <li key={l.stage} className="relative pl-5">
                <span className={`absolute -left-[11px] top-0 bg-white ${color}`}><Icon size={20} aria-hidden /></span>
                <p className="text-[14px] leading-snug">{lo ? l.message_lo : l.message_en}</p>
                <p className="text-[11px] text-[#8B8FB0]">+{((l.time - t0) / 1000).toFixed(1)}s</p>
              </li>
            );
          })}
        </ol>
      </section>
    </div>,
    document.body,
  );
}
