import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

const TINTS = {
  purple: "bg-tint-purple-bg text-tint-purple-fg", blue: "bg-tint-blue-bg text-tint-blue-fg",
  orange: "bg-tint-orange-bg text-tint-orange-fg", green: "bg-tint-green-bg text-tint-green-fg",
} as const;
export type Tint = keyof typeof TINTS;
export const tintClass = (t: Tint) => TINTS[t];

// 28px rounded-square tinted icon + bold title, with an optional right-hand slot.
export function SectionTitle({ icon: Icon, tint, children, aside }: { icon: LucideIcon; tint: Tint; children: ReactNode; aside?: ReactNode }) {
  return <div className="flex items-center gap-2.5 min-h-7">
    <span aria-hidden className={`w-7 h-7 shrink-0 rounded-lg flex items-center justify-center ${TINTS[tint]}`}><Icon size={16} /></span>
    <h3 className="flex-1 min-w-0 font-bold text-base leading-snug text-text">{children}</h3>
    {aside}
  </div>;
}
