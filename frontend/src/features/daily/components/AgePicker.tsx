import { DT } from '../i18n';
import { TIERS, TIER_IDS, type AgeTier } from '../lib/age';
import type { Lang } from '../types';

// Four big tiles; each says what changes so players know what they are choosing.
// Used inside components/shared/BandSheet.tsx and the sign-up age step.
export function AgeGrid({ lang, value, onPick }: { lang: Lang; value: AgeTier | null; onPick: (t: AgeTier) => void }) {
  const t = DT[lang];
  return (
    <div className="grid grid-cols-2 gap-3">
      {TIER_IDS.map((id, i) => {
        const c = TIERS[id], Icon = c.icon, on = value === id;
        return (
          <button key={id} type="button" onClick={() => onPick(id)} aria-pressed={on}
            className={`daily-in daily-btn relative rounded-3xl p-3 text-left grid gap-1 border-2 transition-colors ${on ? 'border-primary bg-primary/10' : 'border-border bg-card'}`} style={{ animationDelay: `${i * 0.05}s` }}>
            <span className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${c.tint} text-white flex items-center justify-center shadow`}><Icon size={24} /></span>
            <span className="font-extrabold text-lg leading-tight font-lao">{t[`age_${id}`]}</span>
            <span className="text-xs font-bold text-primary tabular-nums">{c.range}</span>
            <span className="text-xs text-muted-foreground leading-snug font-lao">{t[`age_${id}_d`]}</span>
          </button>
        );
      })}
    </div>
  );
}
