import { useEffect, useMemo, useState } from "react";
import { CircleCheck, CircleAlert, ShieldAlert, Hourglass, Loader2, Check } from "lucide-react";
import { FLAG_LABELS, PRIVACY, STEPS, issuesOf, maskMatch, screenPost, type ScreenResult } from "../../lib/localScreening";
import type { Lang } from "../../types";

/** Runs the engine after a short pause in typing. Pure and local: nothing leaves the device. */
export function useLiveScreen(text: string, link: string | undefined, hasImage: boolean, tags: string[], delay = 350) {
  const [result, setResult] = useState<ScreenResult | null>(null);
  useEffect(() => {
    if (!text.trim()) { setResult(null); return; }
    const id = setTimeout(() => setResult(screenPost(text, link, { hasImage, tags })), delay);
    return () => clearTimeout(id);
  }, [text, link, hasImage, tags.join(","), delay]);
  return result;
}

/** Live list of what the check found while the person is still writing. */
export function PreCheck({ result, lang }: { result: ScreenResult | null; lang: Lang }) {
  const lo = lang === "lo";
  if (!result) return null;
  const issues = issuesOf(result.flags);
  const blocked = result.state === "blocked";
  const Icon = blocked ? ShieldAlert : issues.length ? CircleAlert : CircleCheck;
  const tone = blocked ? "border-red-200 bg-red-50 text-red-800" : result.state === "false" ? "border-red-200 bg-red-50 text-red-800" : issues.length ? "border-amber-200 bg-amber-50 text-amber-900" : "border-[#E0E1EB] bg-[#F7F7FA] text-[#3F4268]";
  const head = blocked ? (lo ? "ເຜີຍແຜ່ບໍ່ໄດ້: ມີຂໍ້ມູນສ່ວນຕົວ" : "Cannot publish: personal info found")
    : result.state === "false" ? (lo ? "ໂພສນີ້ຈະຖືກໝາຍວ່າບໍ່ປອດໄພ" : "This post would be marked unsafe")
    : result.state === "flagged" ? (lo ? "ໂພສນີ້ຈະຖືກສົ່ງໃຫ້ຜູ້ຊ່ຽວຊານກວດ" : "This post would go to expert review")
    : (lo ? "ບໍ່ພົບບັນຫາ" : "No problems found");
  return (
    <div role="status" aria-live="polite" className={`rounded-xl border p-3 text-[14px] ${tone} font-[BoonHome,sans-serif]`}>
      <p className="flex items-center gap-2 font-bold"><Icon size={18} aria-hidden />{head}</p>
      {issues.length > 0 && (
        <ul className="mt-2 space-y-1">
          {issues.map((f) => (
            <li key={f.id} className="leading-snug">
              <span className="font-bold">{FLAG_LABELS[f.id][lang]}</span>
              {f.matches.length > 0 && <span className="opacity-80"> · {f.matches.slice(0, 3).map((m) => (PRIVACY.has(f.id) || ["profanity", "animal_insults", "bullying", "hate_speech", "sexual_content"].includes(f.id) ? maskMatch(m) : m)).join(", ")}</span>}
              {PRIVACY.has(f.id) && <span className="block text-[13px]">{(lo ? FLAG_LABELS[f.id].tip_lo : FLAG_LABELS[f.id].tip_en) ?? ""}</span>}
            </li>
          ))}
        </ul>
      )}
      {!blocked && issues.length > 0 && <p className="mt-2 text-[13px]">{lo ? "ກະລຸນາເພີ່ມແຫຼ່ງຂໍ້ມູນທີ່ເຊື່ອຖືໄດ້ ຫຼື ແກ້ໄຂເນື້ອຫາ" : "Add credible sources or edit content"}</p>}
    </div>
  );
}

/** "Under AI review" bar: the five real engine steps, shown one after another over about 2.5 seconds. */
export function ReviewProgress({ lang, onDone, stepMs = 500 }: { lang: Lang; onDone: () => void; stepMs?: number }) {
  const lo = lang === "lo";
  const [i, setI] = useState(0);
  useEffect(() => {
    if (i >= STEPS.length) { const id = setTimeout(onDone, 150); return () => clearTimeout(id); }
    const id = setTimeout(() => setI((n) => n + 1), stepMs);
    return () => clearTimeout(id);
  }, [i]);
  const pct = Math.round((i / STEPS.length) * 100);
  const lines = useMemo(() => STEPS.map((s) => (lo ? s.lo : s.en)), [lo]);
  return (
    <div role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={lo ? "ກຳລັງກວດສອບ" : "Under AI review"} className="rounded-xl border border-[#E0E1EB] bg-white p-3 font-[BoonHome,sans-serif]">
      <div className="flex items-center justify-between text-[14px]"><b className="flex items-center gap-2"><Hourglass size={16} aria-hidden className="text-[#5B21D1]" />{lo ? "ກຳລັງກວດສອບ" : "Under AI review"}</b><span>{pct}%</span></div>
      <div className="h-1.5 rounded-full bg-[#E6E3F2] overflow-hidden my-2"><i className="block h-full bg-[#5B21D1] transition-[width] duration-300" style={{ width: `${pct}%` }} /></div>
      <ul className="space-y-1 text-[13px] text-[#3F4268]">
        {lines.map((l, k) => (
          <li key={l} className={`flex items-center gap-2 ${k > i ? "opacity-40" : ""}`}>
            {k < i ? <Check size={14} aria-hidden className="text-emerald-600" /> : k === i ? <Loader2 size={14} aria-hidden className="animate-spin text-[#5B21D1]" /> : <span className="w-3.5" />}{l}
          </li>
        ))}
      </ul>
    </div>
  );
}
