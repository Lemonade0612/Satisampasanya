import { useState } from 'react';
import { TopBar } from '../components/ui';
import { DT, FLAG_LABEL, SCAM_LABEL } from '../i18n';
import { clearEvents, summarize } from '../lib/analytics';
import type { FlagCategory, Lang, ScamType } from '../types';

export function StatsScreen({ lang, onBack }: { lang: Lang; onBack: () => void }) {
  const t = DT[lang];
  const [s, setS] = useState(() => summarize());
  const label = (f: string) => FLAG_LABEL[f as FlagCategory]?.[lang] ?? f;
  const top = s.missedSorted[0];
  return (
    <div className="flex flex-col h-full">
      <TopBar onBack={onBack} lang={lang}><h2 className="font-bold">{t.stats}</h2></TopBar>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <p className="text-xs text-muted-foreground font-lao">{t.stats_title}</p>
        <div className="grid grid-cols-3 gap-2">
          <Tile k={t.completion} v={`${Math.round(s.completionRate * 100)}%`} sub={`${s.completes}/${s.starts}`} />
          <Tile k={t.sessions} v={String(s.sessions)} />
          <Tile k={t.events} v={String(s.total)} />
        </div>
        <section className="rounded-2xl border border-border p-3">
          <h3 className="font-bold mb-3 font-lao">{t.accuracy}</h3>
          {Object.keys(s.byType).length === 0 ? <p className="text-sm text-muted-foreground">{t.none}</p> :
            <div className="space-y-3">{Object.entries(s.byType).map(([type, r]) => {
              const pct = Math.round(r.right / r.total * 100);
              return <div key={type}>
                <div className="flex justify-between text-sm mb-1 font-lao"><span>{SCAM_LABEL[type as ScamType]?.[lang] ?? type}</span><span className="font-bold tabular-nums">{pct}% <span className="text-muted-foreground font-normal">({r.right}/{r.total})</span></span></div>
                <div className="h-2.5 rounded-full bg-muted overflow-hidden"><div className="h-full daily-grad" style={{ width: `${pct}%` }} /></div>
              </div>;
            })}</div>}
        </section>
        <section className="rounded-2xl border border-border p-3">
          <h3 className="font-bold mb-1 font-lao">{t.most_missed}</h3>
          {top ? <p className="text-xl font-bold text-red-600 font-lao">🚩 {label(top[0])} <span className="text-sm text-muted-foreground">×{top[1]}</span></p> : <p className="text-sm text-muted-foreground">{t.none}</p>}
          <ul className="mt-2 text-sm space-y-1">{s.missedSorted.slice(1, 5).map(([f, n]) => <li key={f} className="flex justify-between font-lao"><span>{label(f)}</span><span className="tabular-nums">×{n}</span></li>)}</ul>
        </section>
        <button onClick={() => { if (confirm(t.reset + '?')) { clearEvents(); setS(summarize()); } }} className="text-sm text-muted-foreground underline min-h-11">{t.reset}</button>
      </div>
    </div>
  );
}

function Tile({ k, v, sub }: { k: string; v: string; sub?: string }) {
  return <div className="rounded-2xl bg-muted p-3 text-center"><p className="text-[11px] text-muted-foreground font-lao leading-tight">{k}</p><p className="text-2xl font-bold text-primary tabular-nums">{v}</p>{sub && <p className="text-[11px] text-muted-foreground">{sub}</p>}</div>;
}
