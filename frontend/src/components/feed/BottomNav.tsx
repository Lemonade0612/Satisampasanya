import { T } from "../../lib/translations";
import { Home, Search, Plus, Bell, User } from "lucide-react";
import type { ActiveView, Lang } from "../../types";

export function BottomNav({ active, onChange, lang, alertCount, onOpenAlerts, onCompose }: { 
  active: ActiveView; 
  onChange: (v: ActiveView) => void; 
  lang: Lang; 
  alertCount: number;
  onOpenAlerts: () => void;
  onCompose: () => void;
}) {
  const t = T[lang];

  return (
    <nav className="shrink-0 h-16 bg-background/80 backdrop-blur-md border-t border-border flex items-center justify-around px-2">
      <button onClick={() => onChange("feed")} className={`flex flex-col items-center gap-0.5 min-w-0 flex-1 min-h-11 px-1 py-1.5 rounded-xl transition-colors ${active === "feed" ? "text-primary" : "text-muted-foreground"}`}>
        <div className="relative">
          <Home size={20} />
          {alertCount > 0 && active !== "feed" && (
            <span className="absolute -top-1 -right-1.5 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">{alertCount}</span>
          )}
        </div>
        <span className="text-[10px] font-medium">{t.nav_home}</span>
      </button>

      <button onClick={() => onChange("explore")} className={`flex flex-col items-center gap-0.5 min-w-0 flex-1 min-h-11 px-1 py-1.5 rounded-xl transition-colors ${active === "explore" ? "text-primary" : "text-muted-foreground"}`}>
        <Search size={20} />
        <span className="text-[10px] font-medium">{t.nav_explore}</span>
      </button>

      <button aria-label={t.compose_post} onClick={onCompose} className="w-12 h-12 -mt-3 rounded-full text-white flex items-center justify-center active:scale-95 transition-transform"
        style={{ background: "linear-gradient(135deg,#5B21D1,#84ADEF)", boxShadow: "0 4px 16px rgba(91,33,209,0.4)" }}>
        <Plus size={22} strokeWidth={2.5} />
      </button>

      <button onClick={onOpenAlerts} className="flex flex-col items-center gap-0.5 min-w-0 flex-1 min-h-11 px-1 py-1.5 rounded-xl transition-colors text-muted-foreground hover:text-primary">
        <div className="relative">
          <Bell size={20} />
          {alertCount > 0 && (
            <span className="absolute -top-1 -right-1.5 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">{alertCount}</span>
          )}
        </div>
        <span className="text-[10px] font-medium">{t.nav_alerts}</span>
      </button>

      <button onClick={() => onChange("profile")} className={`flex flex-col items-center gap-0.5 min-w-0 flex-1 min-h-11 px-1 py-1.5 rounded-xl transition-colors ${active === "profile" ? "text-primary" : "text-muted-foreground"}`}>
        <User size={20} />
        <span className="text-[10px] font-medium">{t.nav_profile}</span>
      </button>
    </nav>
  );
}
