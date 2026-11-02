import { T } from "../../lib/translations";
import { Home, Search, Plus, User, Gamepad2 } from "lucide-react";
import type { ActiveView, Lang } from "../../types";

// Five slots: Home, Explore, compose, Play, Profile. The assistant opens from a floating button instead.
export function BottomNav({ active, onChange, lang, onCompose }: {
  active: ActiveView;
  onChange: (v: ActiveView) => void;
  lang: Lang;
  onCompose: () => void;
}) {
  const t = T[lang];

  return (
    <nav className="shrink-0 min-h-20 bg-background/80 backdrop-blur-md border-t border-border flex items-center justify-around px-2 pb-[env(safe-area-inset-bottom)]">
      <button onClick={() => onChange("feed")} className={`flex flex-col items-center gap-0.5 min-w-0 flex-1 min-h-14 px-1 py-1.5 rounded-xl transition-colors ${active === "feed" ? "text-primary" : "text-muted-foreground"}`}>
        <div className="relative">
          <Home size={24} />

        </div>
        <span className="text-xs font-medium">{t.nav_home}</span>
      </button>

      <button onClick={() => onChange("explore")} className={`flex flex-col items-center gap-0.5 min-w-0 flex-1 min-h-14 px-1 py-1.5 rounded-xl transition-colors ${active === "explore" ? "text-primary" : "text-muted-foreground"}`}>
        <Search size={24} />
        <span className="text-xs font-medium">{t.nav_explore}</span>
      </button>

      <button aria-label={t.compose_post} onClick={onCompose} className="w-14 h-14 -mt-3 rounded-full text-white flex items-center justify-center active:scale-95 transition-transform"
        style={{ background: "linear-gradient(135deg,#5B21D1,#84ADEF)", boxShadow: "0 4px 16px rgba(91,33,209,0.4)" }}>
        <Plus size={26} strokeWidth={2.5} />
      </button>

      <button onClick={() => onChange("daily")} className={`flex flex-col items-center gap-0.5 min-w-0 flex-1 min-h-14 px-1 py-1.5 rounded-xl transition-colors ${active === "daily" ? "text-primary" : "text-muted-foreground"}`}>
        <Gamepad2 size={24} />
        <span className="text-xs font-medium">{lang === "lo" ? "ເກມ" : "Play"}</span>
      </button>

      <button onClick={() => onChange("profile")} className={`flex flex-col items-center gap-0.5 min-w-0 flex-1 min-h-14 px-1 py-1.5 rounded-xl transition-colors ${active === "profile" ? "text-primary" : "text-muted-foreground"}`}>
        <User size={24} />
        <span className="text-xs font-medium">{t.nav_profile}</span>
      </button>
    </nav>
  );
}
