import { Home, Search, Plus, User, Gamepad2 } from "lucide-react";
import type { ReactNode } from "react";
import type { ActiveView, Lang } from "../../types";

// Five slots: Home, Explore, compose, Play, Profile. No onCompose (Kids are read-only) leaves the centre slot empty.
export function BottomNav({ active, onChange, lang, onCompose, dailyDot = false }: {
  active: ActiveView; onChange: (v: ActiveView) => void; lang: Lang; onCompose?: () => void; dailyDot?: boolean;
}) {
  const lo = lang === "lo";
  const item = (view: ActiveView, icon: (on: boolean) => ReactNode, label: string) => {
    const on = active === view;
    return (
      <button type="button" aria-current={on ? "page" : undefined} onClick={() => onChange(view)}
        className={`flex-1 min-w-0 min-h-11 flex flex-col items-center justify-center gap-1 ${on ? "text-text font-bold" : "text-text-muted font-bold"}`}>
        {icon(on)}<span className="text-xs leading-tight">{label}</span>
      </button>
    );
  };
  return (
    <nav className="shrink-0 relative z-40 h-[calc(76px+env(safe-area-inset-bottom))] pb-[env(safe-area-inset-bottom)] bg-background border-t border-border flex items-stretch">
      {item("feed", on => <Home size={26} strokeWidth={on ? 2.6 : 1.8} aria-hidden />, lo ? "ໜ້າຫຼັກ" : "Home")}
      {item("explore", on => <Search size={26} strokeWidth={on ? 2.6 : 1.8} aria-hidden />, lo ? "ຄົ້ນຫາ" : "Explore")}
      {onCompose ? (
        <button type="button" onClick={onCompose} className="flex-1 min-w-0 flex flex-col items-center justify-start text-text font-bold active:scale-95 transition-transform">
          <span aria-hidden className="-mt-8 w-[64px] h-[64px] rounded-full border-4 border-background bg-primary text-primary-foreground shadow-[var(--shadow-soft)] flex items-center justify-center"><Plus size={34} strokeWidth={2.5} /></span>
          <span className="mt-1 text-[15px] leading-tight">{lo ? "ໂພສ" : "Post"}</span>
        </button>
      ) : <span className="flex-1" />}
      {item("daily", on => <span className="relative"><Gamepad2 size={26} strokeWidth={on ? 2.6 : 1.8} aria-hidden />{dailyDot && <span role="img" aria-label={lo ? "ເກມມື້ນີ້ຍັງບໍ່ໄດ້ຫຼິ້ນ" : "Today's game not played yet"} className="badge-pop absolute -top-0.5 -right-1 w-2.5 h-2.5 rounded-full bg-danger ring-2 ring-background" />}</span>, lo ? "ເກມ" : "Play")}
      {item("profile", on => <User size={26} strokeWidth={on ? 2.6 : 1.8} aria-hidden />, lo ? "ຂ້ອຍ" : "Me")}
    </nav>
  );
}
