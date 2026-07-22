import { COLORS } from "@/satisampasanya_app/lib/constants";
import type { LeafState } from "@/satisampasanya_app/types";

export function LeafMark({ state, size = 16 }: { state: LeafState; size?: number }) {
  if (state === "none") return null;
  const fill = state === "verified" || state === "featured" ? COLORS.success : "#A5B4FC";
  return (
    <span className="inline-flex items-center gap-0.5 shrink-0">
      <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
        <path d="M10 2C6.5 4 3.5 7.5 3.5 11.5c0 2 .75 3.8 2 5.1C6.8 18 8.3 18.9 10 19.3c1.7-.4 3.2-1.3 4.5-2.7 1.25-1.3 2-3.1 2-5.1C16.5 7.5 13.5 4 10 2z" fill={fill} />
        {(state === "verified" || state === "featured") && (
          <path d="M7.5 10l2 2 3-3.5" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        )}
        {state === "pending" && (
          <path d="M10 7v3.5M10 12.5v.5" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
        )}
      </svg>
      {state === "featured" && (
        <svg width={size - 3} height={size - 3} viewBox="0 0 20 20" fill={COLORS.warning}>
          <path d="M10 2l2.4 5.1H18l-4.5 3.3 1.7 5.2L10 13l-5.2 2.6 1.7-5.2L2 7.1h5.6z" />
        </svg>
      )}
    </span>
  );
}
