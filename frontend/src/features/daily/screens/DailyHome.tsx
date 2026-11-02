import { BarChart3, ShieldCheck, Swords, Flag, Shuffle, Link2, Zap, MessagesSquare, Play } from 'lucide-react';
import { Streak, LikeButton } from '../components/ui';
import { DT } from '../i18n';
import { getProgress } from '../lib/progress';
import { scenarioOfTheDay, weeklyLevel } from '../lib/scenarios';
import type { GameId, Lang } from '../types';

export type Launch = { game: GameId; scope: 'daily' | 'weekly' | 'all' };

const GAMES: { id: GameId; icon: typeof Flag; tint: string }[] = [
  { id: 'story', icon: MessagesSquare, tint: 'from-violet-500 to-indigo-500' },
  { id: 'flags', icon: Flag, tint: 'from-rose-500 to-orange-400' },
  { id: 'realorscam', icon: Shuffle, tint: 'from-emerald-500 to-teal-400' },
  { id: 'links', icon: Link2, tint: 'from-sky-500 to-blue-500' },
  { id: 'dash', icon: Zap, tint: 'from-amber-500 to-pink-500' },
];

export function DailyHome({ lang, onLaunch, onNav }: { lang: Lang; onLaunch: (l: Launch) => void; onNav: (p: 'stats' | 'admin') => void }) {
  const t = DT[lang];
  const p = getProgress();
  const today = scenarioOfTheDay();
  const level = weeklyLevel();
  const done = level.filter(s => p.completed.includes(s.id)).length;
  const boss = level.find(s => s.boss);
  return (
    <div className="h-full overflow-y-auto pb-6">
      <header className="daily-grad text-white px-4 pt-5 pb-6 rounded-b-[28px]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2"><ShieldCheck size={26} className="daily-float" /><h1 className="text-2xl font-bold font-display">{t.title}</h1></div>
          <div className="flex items-center gap-1 bg-white/95 rounded-full px-3 py-1"><Streak days={p.streak} /><span className="text-xs text-foreground font-lao">{t.streak}</span></div>
        </div>
        <p className="text-sm opacity-90 mt-1 font-lao">{t.subtitle}</p>
        {today && <button onClick={() => onLaunch({ game: 'story', scope: 'daily' })} className="daily-btn mt-4 w-full flex items-center gap-3 rounded-2xl bg-white text-foreground px-4 py-3 shadow-[0_4px_0_rgba(0,0,0,.15)] text-left">
          <span className="w-11 h-11 rounded-xl daily-grad text-white flex items-center justify-center"><Play size={22} fill="currentColor" /></span>
          <span className="flex-1"><span className="block text-xs text-muted-foreground font-lao">{t.daily_session}</span><span className="block font-bold font-lao">{today.title[lang]}</span></span>
        </button>}
      </header>

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
        {boss && <p className="text-xs text-muted-foreground mt-2 font-lao">⚔️ {t.boss}: {boss.title[lang]} · {t.verified_by} {boss.verifiedBy}</p>}
      </section>

      <section className="px-4 mt-6">
        <h2 className="font-bold mb-2 font-lao">{t.games}</h2>
        <div className="grid gap-3">
          {GAMES.map(({ id, icon: Icon, tint }, i) => (
            <div key={id} className="daily-in flex items-center gap-3 rounded-2xl border border-border bg-card p-3" style={{ animationDelay: `${i * 0.05}s` }}>
              <button onClick={() => onLaunch({ game: id, scope: 'all' })} className="flex-1 flex items-center gap-3 text-left min-h-12">
                <span className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${tint} text-white flex items-center justify-center shrink-0`}><Icon size={24} /></span>
                <span className="min-w-0"><span className="block font-bold font-lao">{t[`g_${id}`]}</span><span className="block text-xs text-muted-foreground font-lao">{t[`g_${id}_d`]}{p.best[id] ? ` · 🏆 ${p.best[id]}` : ''}</span></span>
              </button>
              <LikeButton id={id} lang={lang} compact />
            </div>
          ))}
        </div>
      </section>

      <div className="px-4 mt-6 grid grid-cols-2 gap-3">
        <button onClick={() => onNav('stats')} className="daily-btn rounded-2xl bg-muted flex items-center justify-center gap-2 font-semibold"><BarChart3 size={18} />{t.stats}</button>
        <button onClick={() => onNav('admin')} className="daily-btn rounded-2xl bg-muted flex items-center justify-center gap-2 font-semibold"><ShieldCheck size={18} />{t.admin}</button>
      </div>
    </div>
  );
}
