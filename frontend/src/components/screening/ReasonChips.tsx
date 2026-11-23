import { FLAG_LABELS, PRIVACY, issuesOf, maskMatch, type FlagHit, type FlagId } from "../../lib/localScreening";
import type { Lang } from "../../types";

const MASKED = new Set<FlagId>(["profanity", "animal_insults", "bullying", "hate_speech", "sexual_content"]);
const shown = (f: FlagHit) => f.matches.slice(0, 3).map((m) => (MASKED.has(f.id) || PRIVACY.has(f.id) ? maskMatch(m) : m));

/** "Flagged because:" chips, one per flag, with the label in the app language, the count, and masked matches. */
export function ReasonChips({ flags, lang, tone = "amber" }: { flags: FlagHit[]; lang: Lang; tone?: "amber" | "red" | "slate" }) {
  const lo = lang === "lo";
  const issues = issuesOf(flags);
  if (!issues.length) return null;
  const ring = { amber: "border-amber-200 text-amber-800", red: "border-red-200 text-red-800", slate: "border-slate-300 text-slate-700" }[tone];
  return (
    <div className="mt-2">
      <p className="text-[12px] font-bold text-[#5F6390]">{lo ? "ເຫດຜົນທີ່ຖືກກວດສອບ:" : "Flagged because:"}</p>
      <ul className="mt-1.5 flex flex-wrap gap-1.5 font-[BoonHome,sans-serif]">
        {issues.map((f) => {
          const l = FLAG_LABELS[f.id];
          const masked = shown(f);
          return (
            <li key={f.id} className={`rounded-full bg-white border px-2.5 py-1 text-[12px] leading-tight ${ring}`}>
              <span className="font-bold">{l[lang]}</span>
              {f.count > 1 && <span className="font-bold"> ×{f.count}</span>}
              {masked.length > 0 && <span className="opacity-80"> · {masked.join(", ")}</span>}
            </li>
          );
        })}
      </ul>
      <p className="mt-2 text-[12px] text-[#5F6390]">{lo ? "ກະລຸນາເພີ່ມແຫຼ່ງຂໍ້ມູນທີ່ເຊື່ອຖືໄດ້ ຫຼື ແກ້ໄຂເນື້ອຫາ" : "Add credible sources or edit content"}</p>
    </div>
  );
}
