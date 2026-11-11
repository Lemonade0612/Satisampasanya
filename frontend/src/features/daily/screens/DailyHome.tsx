import { useState , type ReactNode } from 'react';
import { SHOW_EXPERT_PANEL } from '../../../../../shared/flags.mjs';
import { BarChart3, Swords, Flag, Shuffle, Link2, Zap, MessagesSquare, Play, Search, PhoneCall, BellRing, Trophy, X, ChevronDown, Clock, CheckCircle2 } from 'lucide-react';
import { BandSheet, bandLabel } from '../../../components/shared/BandSheet';
import { TIERS } from '../lib/age';
import { useBand, useHasBand, type Band } from '../../../lib/band';
import { Streak, LikeButton } from '../components/ui';
import { BaitFeed } from '../../kids/BaitFeed';
import { DT } from '../i18n';
import { currentStreak, getProgress, playedToday } from '../lib/progress';
import { laoDayNumber } from '../lib/storage';
import { NUDGE_KEY, load, save, scoped, today as todayKey } from '../lib/storage';
import { scenarioOfTheDay, weeklyLevel } from '../lib/scenarios';
import type { GameId, Lang } from '../types';

export type Launch = { game: GameId; scope: 'daily' | 'weekly' | 'all' };

export const GAMES: { id: GameId; icon: typeof Flag; tint: string }[] = [
  { id: 'call', icon: PhoneCall, tint: 'from-blue-500 to-indigo-600' },
  { id: 'detective', icon: Search, tint: 'from-fuchsia-500 to-purple-600' },
  { id: 'story', icon: MessagesSquare, tint: 'from-violet-500 to-indigo-500' },
  { id: 'flags', icon: Flag, tint: 'from-rose-500 to-orange-400' },
  { id: 'realorscam', icon: Shuffle, tint: 'from-emerald-500 to-teal-400' },
  { id: 'links', icon: Link2, tint: 'from-sky-500 to-blue-500' },
  { id: 'dash', icon: Zap, tint: 'from-amber-500 to-pink-500' },
];

// "Today for you": a short, band-specific pick so nobody faces seven equal choices.
// The order rotates by date + band (deterministic), so a different game leads each day.
const PICKS: Record<Band, GameId[]> = {
  kids: ['realorscam', 'links', 'dash'],
  youth: ['story', 'detective', 'call'],
  adult: ['call', 'realorscam', 'story'],
  elder: [], // Elders use Simple mode; with it off they still have every game under "All games".
};
export function picksForToday(band: Band, day = laoDayNumber()) {
  const list = PICKS[band];
  if (!list.length) return [];
  const shift = (day + Object.keys(PICKS).indexOf(band)) % list.length;
  return [...list.slice(shift), ...list.slice(0, shift)];
}

export function DailyHome({ lang, onLaunch, onNav, header, footer }: { lang: Lang; onLaunch: (l: Launch) => void; onNav: (p: 'progress') => void; header?: ReactNode; footer?: ReactNode }) {
  const t = DT[lang];
  const p = getProgress();
  // One band for the whole app; switching it re-renders today's session and the week right away.
  const band = useBand();
  const chosen = useHasBand();
  const today = scenarioOfTheDay(band);
  const level = weeklyLevel(band);
  const done = level.filter(s => p.completed.includes(s.id)).length;
  const boss = level.find(s => s.boss);
  // Daily reminder: shows until today's session is played or the player dismisses it.
  const [nudge, setNudge] = useState(() => p.lastDay !== todayKey() && load<string>(scoped(NUDGE_KEY), '') !== todayKey());
  const hideNudge = () => { save(scoped(NUDGE_KEY), todayKey()); setNudge(false); };
  const age: Band | null = chosen ? band : null;
  const [ageOpen, setAgeOpen] = useState(() => !chosen);
  const AgeIcon = TIERS[band].icon;
  return (
    <div className="h-full overflow-y-auto pb-6">
      <header className="daily-grad text-white px-4 pt-5 pb-6 rounded-b-[28px]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2"><span className="w-9 h-9 rounded-xl bg-white flex items-center justify-center"><img src="/brand-mark.svg" alt="" className="w-7 h-7" /></span><h1 className="text-2xl font-bold font-display leading-tight">{t.title}</h1></div>
          <div className="flex items-center gap-2">{header}<div className="flex items-center gap-1 bg-white/95 rounded-full px-3 py-1"><Streak days={currentStreak(p)} /><span className="text-xs text-foreground font-lao whitespace-nowrap">{t.streak}</span></div></div>
        </div>
        <div className="flex items-center justify-between gap-2 mt-1">
          <p className="text-sm opacity-90 font-lao">{t.subtitle}</p>
          <button onClick={() => setAgeOpen(true)} className="shrink-0 flex items-center gap-1.5 rounded-full bg-white/20 hover:bg-white/30 px-3 min-h-9 text-sm font-bold font-lao">
            <AgeIcon size={16} />{age ? bandLabel(age, lang) : t.age_title}<ChevronDown size={14} />
          </button>
        </div>
        {today && <button onClick={() => onLaunch({ game: 'story', scope: 'daily' })} className="daily-btn mt-4 w-full flex items-center gap-3 rounded-2xl bg-white text-foreground px-4 py-3 shadow-[0_4px_0_rgba(0,0,0,.15)] text-left">
          <span className="w-11 h-11 rounded-xl daily-grad text-white flex items-center justify-center"><Play size={22} fill="currentColor" /></span>
          <span className="flex-1"><span className="block text-xs text-muted-foreground font-lao">{t.daily_session}</span><span className="block font-bold font-lao">{today.title[lang]}</span></span>
        </button>}
        {band === 'kids' && <p className="mt-3 text-sm font-semibold opacity-95 font-lao">{t.tell_adult}</p>}
      </header>

      {nudge && today && <div role="status" className="daily-pop mx-4 -mt-3 relative z-10 rounded-2xl bg-card border border-border shadow-lg p-3 flex items-center gap-3">
        <span className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0"><BellRing size={20} /></span>
        <span className="flex-1 min-w-0 text-sm font-lao">
          <span className="block font-bold">{t.nudge_title}</span>
          <span className="block text-muted-foreground">{p.streak ? t.nudge_streak.replace('{n}', String(p.streak)) : t.nudge_body}</span>
        </span>
        <button onClick={() => { hideNudge(); onLaunch({ game: 'story', scope: 'daily' }); }} className="rounded-xl daily-grad text-white font-bold px-3 min-h-10 text-sm">{t.play}</button>
        <button onClick={hideNudge} aria-label="Close" className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground"><X size={16} /></button>
      </div>}

      {/* Kids (often guests with no feed) get the bait-post simulator right on the Daily home. */}
      {band === 'kids' && <div className="mt-2 px-1"><BaitFeed lang={lang} /></div>}

      <section className="px-4 mt-5">
        <div className="flex items-center justify-between mb-2"><h2 className="font-bold font-lao">{t.weekly_level}</h2><span className="text-sm text-muted-foreground">{done}/{level.length}</span></div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {level.map((s, i) => (
            <div key={s.id} title={s.title[lang]} className={`shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-bold border-4 ${p.completed.includes(s.id) ? 'bg-green-500 text-white border-green-300' : s.boss ? 'bg-amber-400 text-white border-amber-200' : 'bg-muted border-border'}`}>
              {s.boss ? <Swords size={20} /> : i + 1}
            </div>
          ))}
        </div>
        <button onClick={() => onLaunch({ game: 'story', scope: 'weekly' })} className="daily-btn mt-3 w-full rounded-2xl daily-grad text-white font-bold shadow-[0_4px_0_#3B0FA0]">{done ? t.continue : t.start} · {t.weekly_level}</button>
        {boss && <p className="text-xs text-muted-foreground mt-2 font-lao"><Swords size={12} className="inline -mt-0.5 mr-1" />{t.boss}: {boss.title[lang]}{SHOW_EXPERT_PANEL && boss.verifiedBy ? ` · ${t.verified_by} ${boss.verifiedBy}` : ''}</p>}
      </section>

      <section className="px-4 mt-6">
        {picksForToday(band).length > 0 && <h2 className="font-bold mb-2 font-lao">{t.today_for_you}</h2>}
        <div className="grid gap-3">
          {picksForToday(band).map((id, i) => {
            const { icon: Icon, tint } = GAMES.find(g => g.id === id)!;
            const played = playedToday(id, p), big = band === 'elder';
            // Adults/elders: calm solid colours with strong contrast; only the top pick is a filled button.
            const calm = band === 'adult' || band === 'elder', lead = i === 0 && !played;
            return (
              <div key={id} className={`daily-in rounded-3xl bg-card shadow-sm ${calm ? 'border' : 'border-2'} ${big ? 'p-5' : 'p-4'} ${played ? 'border-green-400' : calm && lead ? 'border-[#4B1FB8]/40' : 'border-border'}`} style={{ animationDelay: `${i * 0.05}s` }}>
                <div className="flex items-center gap-3">
                  <span className={`${big ? 'w-16 h-16' : 'w-14 h-14'} rounded-2xl ${calm ? 'bg-[#EEE9FB] text-[#4B1FB8]' : `bg-gradient-to-br ${tint} text-white`} flex items-center justify-center shrink-0`}><Icon size={big ? 32 : 28} /></span>
                  <span className="min-w-0 flex-1">
                    <span className={`block font-bold font-lao ${big ? 'text-xl' : 'text-lg'}`}>{t[`g_${id}`]}</span>
                    <span className={`block font-lao ${calm ? 'text-slate-600' : 'text-muted-foreground'} ${big ? 'text-base' : 'text-sm'}`}>{t[`g_${id}_d`]}</span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                      <Clock size={12} />{t.minutes}
                      {played && <span className="ml-2 inline-flex items-center gap-1 font-bold text-green-700 font-lao"><CheckCircle2 size={13} />{t.done_today}</span>}
                    </span>
                  </span>
                </div>
                <button onClick={() => onLaunch({ game: id, scope: 'all' })}
                  className={`daily-btn mt-3 w-full rounded-2xl font-bold font-lao ${big ? 'min-h-14 text-lg' : 'min-h-12'} ${played ? 'bg-muted text-foreground' : calm ? (lead ? 'daily-solid text-white' : 'bg-[#EEE9FB] text-[#3B1696] hover:bg-[#E2DAF8]') : 'daily-grad text-white shadow-[0_4px_0_#3B0FA0]'}`}>
                  {played ? t.play_again : t.play}
                </button>
              </div>
            );
          })}
        </div>
        {/* Everything else stays one tap away, collapsed. */}
        <details className="mt-3 rounded-2xl border border-border bg-card group">
          <summary className="flex items-center justify-between px-4 min-h-12 font-semibold font-lao cursor-pointer list-none">
            {t.all_games} ({GAMES.length})<ChevronDown size={18} className="transition-transform group-open:rotate-180" />
          </summary>
          <div className="grid gap-3 p-3 pt-0">
            {GAMES.map(({ id, icon: Icon, tint }) => (
              <div key={id} className="flex items-center gap-3 rounded-2xl border border-border bg-background p-3">
                <button onClick={() => onLaunch({ game: id, scope: 'all' })} className="flex-1 flex items-center gap-3 text-left min-h-12">
                  <span className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${tint} text-white flex items-center justify-center shrink-0`}><Icon size={24} /></span>
                  <span className="min-w-0"><span className="block font-bold font-lao">{t[`g_${id}`]}</span><span className="block text-xs text-muted-foreground font-lao">{t[`g_${id}_d`]}{p.best[id] ? <> · <Trophy size={11} className="inline -mt-0.5 text-amber-500" /> {p.best[id]}</> : null}</span>{playedToday(id, p) && <span className="inline-flex items-center gap-1 text-xs font-bold text-green-700 font-lao"><CheckCircle2 size={13} />{t.done_today}</span>}</span>
                </button>
                <LikeButton id={id} lang={lang} compact />
              </div>
            ))}
          </div>
        </details>
      </section>

      <div className="px-4 mt-6">
        <button onClick={() => onNav('progress')} className="daily-btn w-full rounded-2xl bg-muted flex items-center justify-center gap-2 font-semibold font-lao"><BarChart3 size={18} />{t.my_progress}</button>
      </div>
      {footer}
      {ageOpen && <BandSheet lang={lang} onClose={age ? () => setAgeOpen(false) : undefined} onSaved={() => setAgeOpen(false)} />}
    </div>
  );
}
