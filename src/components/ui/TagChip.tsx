import { TOPIC_LABELS } from "@/satisampasanya_app/lib/constants";
import type { Lang } from "@/satisampasanya_app/types";

export function TagChip({ tag, lang, small }: { tag: string; lang: Lang; small?: boolean }) {
  const label = TOPIC_LABELS[tag];
  const base = `font-medium text-indigo-600 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800`;
  if (!label) return (
    <span className={`${base} rounded-full ${small ? "text-[10px] px-2 py-0.5" : "text-[11px] px-2.5 py-0.5"}`}>#{tag}</span>
  );
  return (
    <span className={`inline-flex flex-col ${base} rounded-xl ${small ? "px-2 py-0.5" : "px-2.5 py-1"}`}>
      <span className={small ? "text-[9px] leading-tight" : "text-[10px] leading-tight"}>#{lang === "lo" ? label.lo : label.en}</span>
      {!small && <span className="text-[8px] text-indigo-400 dark:text-indigo-500 leading-tight">{lang === "lo" ? label.en : label.lo}</span>}
    </span>
  );
}
