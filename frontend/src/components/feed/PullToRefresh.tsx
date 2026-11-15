import { useRef, useState, type RefObject } from "react";
import logoImage from "/images/sati-mark.png";
import { tick } from "../../lib/haptics";

export const PULL_THRESHOLD = 70;
// Touch pull-to-refresh for a scroll container: a Sati-logo spinner follows the finger, a haptic tick fires when the
// threshold is passed, and release past it refreshes. Mouse users get the reload button instead.
export function usePullToRefresh(scroller: RefObject<HTMLElement | null>, onRefresh: () => void | Promise<void>, busy: boolean) {
  const [pull, setPull] = useState(0);
  const start = useRef<number | null>(null), armed = useRef(false);
  const bind = {
    onTouchStart: (e: React.TouchEvent) => { start.current = (scroller.current?.scrollTop ?? 1) <= 0 ? e.touches[0].clientY : null; armed.current = false; },
    onTouchMove: (e: React.TouchEvent) => {
      if (start.current === null) return;
      if ((scroller.current?.scrollTop ?? 1) > 0) { start.current = null; setPull(0); return; }
      const d = Math.max(0, (e.touches[0].clientY - start.current) * 0.5);
      setPull(Math.min(d, 110));
      if (d >= PULL_THRESHOLD && !armed.current) { armed.current = true; tick(); } else if (d < PULL_THRESHOLD) armed.current = false;
    },
    onTouchEnd: () => { if (start.current !== null && pull >= PULL_THRESHOLD) void onRefresh(); start.current = null; setPull(0); },
    onTouchCancel: () => { start.current = null; setPull(0); },
  };
  const shown = busy ? PULL_THRESHOLD * 0.7 : pull;
  const node = <div aria-hidden={!busy} role={busy ? "status" : undefined} aria-label={busy ? "Refreshing" : undefined} className="pointer-events-none absolute left-0 right-0 top-0 z-20 flex justify-center"
    style={{ transform: `translateY(${shown - 44}px)`, opacity: Math.min(1, shown / 40), transition: pull ? "none" : "transform .2s, opacity .2s" }}>
    <span className="mt-1 w-10 h-10 rounded-full bg-background shadow-[var(--shadow-soft)] border border-border flex items-center justify-center">
      <img src={logoImage} alt="" className={`w-6 h-6 object-contain ${busy ? "animate-spin motion-reduce:animate-none" : ""}`} style={busy ? undefined : { transform: `rotate(${pull * 3}deg)` }} />
    </span>
  </div>;
  return { bind, node };
}
