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
      <button type="button" aria-current={on ? "page" : undefined} onClick={() => onChange(view)} aria-label={label}
        className={`min-w-0 h-12 mx-auto w-14 flex items-center justify-center rounded-full transition-colors ${on ? "bg-[#EFE8FD] text-[#5B21D1]" : "text-[#4B4E78]"}`}>
        {icon(on)}
      </button>
    );
  };
  return (
    <div data-app-nav className="shrink-0 relative z-40 px-3 pt-1 pb-[calc(10px+env(safe-area-inset-bottom))] bg-white"><nav className="h-[62px] rounded-full bg-white border border-[#ECECF4] shadow-[0_6px_20px_rgba(20,17,43,0.12)] grid grid-cols-5 items-center px-1.5">
      {item("feed", () => <Home size={26} strokeWidth={2} aria-hidden />, lo ? "ໜ້າຫຼັກ" : "Home")}
      {item("explore", () => <Search size={26} strokeWidth={2} aria-hidden />, lo ? "ຄົ້ນຫາ" : "Explore")}
      {onCompose ? (
        <button type="button" onClick={onCompose} aria-label={lo ? "ໂພສ" : "Post"} className="min-w-0 h-12 flex items-center justify-center active:scale-95 transition-transform">
          <span aria-hidden className="flex w-12 h-12 rounded-full text-white items-center justify-center bg-[#5B21D1] shadow-[0_4px_12px_rgba(91,33,209,0.35)]"><Plus size={26} strokeWidth={2.5} /></span>
        </button>
      ) : <span />}
      {item("daily", () => <span className="relative"><Gamepad2 size={26} strokeWidth={2} aria-hidden />{dailyDot && <span role="img" aria-label={lo ? "ເກມມື້ນີ້ຍັງບໍ່ໄດ້ຫຼິ້ນ" : "Today's game not played yet"} className="badge-pop absolute -top-0.5 -right-1 w-2.5 h-2.5 rounded-full bg-danger ring-2 ring-background" />}</span>, lo ? "ເກມ" : "Play")}
      {item("profile", () => <User size={26} strokeWidth={2} aria-hidden />, lo ? "ຂ້ອຍ" : "Me")}
    </nav></div>
  );
}
