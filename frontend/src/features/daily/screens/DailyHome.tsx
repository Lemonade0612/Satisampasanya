import { useEffect, useRef, useState, type ReactNode } from 'react';
import { SHOW_EXPERT_PANEL } from '../../../../../shared/flags.mjs';
import { BarChart3, Swords, Flag, Shuffle, Link2, Zap, MessagesSquare, Play, Search, PhoneCall, BellRing, X, ChevronDown, ChevronRight, Check, Crown, Flame, Target, Heart, Lock, UserPlus, type LucideIcon } from 'lucide-react';
import { BandSheet, bandLabel } from '../../../components/shared/BandSheet';
import { TIERS } from '../lib/age';
import { useBand, useHasBand, type Band } from '../../../lib/band';
import { BaitFeed } from '../../kids/BaitFeed';
import { DT } from '../i18n';
import { currentStreak, getLike, getProgress, levelInfo, missionDone, toggleLike, GAME_XP, MISSION_XP } from '../lib/progress';
import { laoDayNumber } from '../lib/storage';
import { NUDGE_KEY, load, save, scoped, today as todayKey } from '../lib/storage';
import { scenarioOfTheDay, weeklyLevel } from '../lib/scenarios';
import type { GameId, Lang } from '../types';

export type Launch = { game: GameId; scope: 'daily' | 'weekly' | 'all' };

// `glow` matches each tint so the icon square casts a soft coloured shadow.
export const GAMES: { id: GameId; icon: typeof Flag; tint: string; glow: string }[] = [
  { id: 'call', icon: PhoneCall, tint: 'from-blue-500 to-indigo-600', glow: 'rgba(79,70,229,.35)' },
  { id: 'detective', icon: Search, tint: 'from-fuchsia-500 to-purple-600', glow: 'rgba(192,38,211,.35)' },
  { id: 'story', icon: MessagesSquare, tint: 'from-violet-500 to-indigo-500', glow: 'rgba(124,58,237,.35)' },
  { id: 'flags', icon: Flag, tint: 'from-rose-500 to-orange-400', glow: 'rgba(244,63,94,.35)' },
  { id: 'realorscam', icon: Shuffle, tint: 'from-emerald-500 to-teal-400', glow: 'rgba(16,185,129,.35)' },
  { id: 'links', icon: Link2, tint: 'from-sky-500 to-blue-500', glow: 'rgba(14,165,233,.35)' },
  { id: 'dash', icon: Zap, tint: 'from-amber-500 to-pink-500', glow: 'rgba(245,158,11,.35)' },
];

// "Today for you": a short, band-specific pick. The order rotates by date + band (deterministic).
const PICKS: Record<Band, GameId[]> = {
  kids: ['realorscam', 'links', 'dash'],
  youth: ['story', 'detective', 'call'],
  adult: ['call', 'realorscam', 'story'],
  elder: [],
};
export function picksForToday(band: Band, day = laoDayNumber()) {
  const list = PICKS[band];
  if (!list.length) return [];
  const shift = (day + Object.keys(PICKS).indexOf(band)) % list.length;
  return [...list.slice(shift), ...list.slice(0, shift)];
}

const LEVEL_TITLES = { lo: ['ນັກສືບມືໃໝ່', 'ນັກສືບຝຶກຫັດ', 'ນັກສືບຕົວຈິງ', 'ນັກສືບຊຳນານ', 'ຜູ້ພິທັກສະຕິ'], en: ['Rookie detective', 'Trainee detective', 'Detective', 'Expert detective', 'Sati guardian'] }; // REVIEW-LO

// 3D push button: solid edge underneath via box-shadow.
const btn3d = 'daily-btn w-full rounded-2xl font-bold font-lao flex items-center justify-center gap-2 min-h-[52px] active:translate-y-[2px]';

export function DailyHome({ lang, onLaunch, onNav, header, footer }: { lang: Lang; onLaunch: (l: Launch) => void; onNav: (p: 'progress') => void; header?: ReactNode; footer?: ReactNode }) {
  const t = DT[lang], lo = lang === 'lo';
  const p = getProgress();
  const band = useBand();
  const chosen = useHasBand();
  const today = scenarioOfTheDay(band);
  const level = weeklyLevel(band);
  const done = level.filter(s => p.completed.includes(s.id)).length;
  const current = level.findIndex(s => !p.completed.includes(s.id));
  const boss = level.find(s => s.boss);
  const bossBeaten = !!boss && p.completed.includes(boss.id);
  const streak = currentStreak(p);
  const lvl = levelInfo(p);
  const mission = missionDone(p);
  const [nudge, setNudge] = useState(() => p.lastDay !== todayKey() && load<string>(scoped(NUDGE_KEY), '') !== todayKey());
  const hideNudge = () => { save(scoped(NUDGE_KEY), todayKey()); setNudge(false); };
  const age: Band | null = chosen ? band : null;
  const [ageOpen, setAgeOpen] = useState(() => !chosen);
  const AgeIcon = TIERS[band].icon;
  const rec = picksForToday(band)[0] ?? 'call';
  const games = [GAMES.find(g => g.id === rec)!, ...GAMES.filter(g => g.id !== rec)];
  const pathRef = useRef<HTMLOListElement>(null);
  // Keep the current level in view when the path is longer than the screen.
  useEffect(() => { const el = pathRef.current, cur = el?.querySelector<HTMLElement>('[data-cur]'); if (el && cur) el.scrollLeft = cur.offsetLeft - el.clientWidth / 2 + cur.clientWidth / 2; }, [current, band]);
  const [favs, setFavs] = useState<Record<string, boolean>>(() => Object.fromEntries(GAMES.map(g => [g.id, getLike(g.id).liked])));

  const badges: { icon: LucideIcon; label: string; on: boolean; tint: string }[] = [
    { icon: Flame, label: lo ? '5 ມື້ຕິດ' : '5-day streak', on: p.streak >= 5, tint: 'from-orange-400 to-rose-500' },
    { icon: Search, label: lo ? 'ນັກສືບ' : 'Detective', on: !!p.best.detective, tint: 'from-fuchsia-500 to-purple-600' },
    { icon: Crown, label: lo ? 'ຊະນະບອສ' : 'Beat the Boss', on: bossBeaten, tint: 'from-amber-400 to-orange-500' },
    { icon: UserPlus, label: lo ? 'ຊວນໝູ່' : 'Invite a friend', on: false, tint: 'from-sky-400 to-blue-600' },
  ]; // REVIEW-LO

  return (
    <div className="h-full overflow-y-auto pb-6 bg-[#F7F7FB] dark:bg-background font-lao">
      {/* A. Header */}
      <header className="text-white px-4 pt-4 pb-[60px] rounded-b-[28px]" style={{ background: 'linear-gradient(140deg, #4A16B5, #5B21D1 55%, #6E8EF0)' }}>
        <div className="flex items-center gap-2.5">
          <span className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shrink-0"><img src="/brand-mark.svg" alt="" className="w-7 h-7" /></span>
          <span className="flex-1 min-w-0">
            <h1 className="text-xl font-extrabold leading-tight" style={{ fontFamily: 'Inter, sans-serif' }}>Sati Daily</h1>
            <span className="block text-xs opacity-90 truncate">{lo ? 'ຈັບການຫຼອກລວງ ກ່ອນມັນຈັບເຈົ້າ' : t.subtitle}</span>
          </span>
          {header}
          <button onClick={() => setAgeOpen(true)} aria-label={`${t.age_title} ${age ? bandLabel(age, lang) : ''}`} className="shrink-0 flex items-center gap-1 rounded-full bg-white/20 hover:bg-white/30 px-2.5 min-h-11 text-xs font-bold">
            <AgeIcon size={15} aria-hidden /><span className="max-w-[84px] truncate">{age ? bandLabel(age, lang) : t.age_title}</span><ChevronDown size={13} aria-hidden />
          </button>
          <span className="shrink-0 flex items-center gap-1 rounded-full bg-white text-foreground px-2.5 min-h-9 text-sm font-bold">
            <Flame size={16} className="text-orange-500" fill="currentColor" aria-hidden />{streak} {lo ? 'ມື້ຕິດ' : 'days'}
          </span>
        </div>
        <div className="flex items-center gap-3 mt-4">
          <span className="w-12 h-12 rounded-full bg-white/10 border-2 border-white/50 flex items-center justify-center text-lg font-extrabold shrink-0">{lvl.level}</span>
          <span className="flex-1 min-w-0">
            <span className="flex items-baseline justify-between gap-2 text-sm"><b className="truncate">{LEVEL_TITLES[lang][Math.min(lvl.level - 1, 4)]}</b><span className="opacity-90 shrink-0">{lvl.xp} / {lvl.need} XP</span></span>
            <span className="mt-1.5 block h-2 rounded-full bg-white/25 overflow-hidden" role="progressbar" aria-valuemin={0} aria-valuemax={lvl.need} aria-valuenow={lvl.xp}>
              <span className="block h-full rounded-full bg-[#FDBA4D]" style={{ width: `${(lvl.xp / lvl.need) * 100}%` }} />
            </span>
          </span>
        </div>
        {band === 'kids' && <p className="mt-3 text-sm font-semibold opacity-95">{t.tell_adult}</p>}
      </header>

      {/* B. Today's mission */}
      {today && <section className="relative mx-4 -mt-11 rounded-3xl p-5 text-white overflow-hidden shadow-[0_10px_24px_rgba(37,99,235,.3)]" style={{ background: 'linear-gradient(140deg, #1D4ED8, #2563EB 50%, #60A5FA)' }}>
        <span aria-hidden className="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-white/15" />
        <p className="relative flex items-center gap-1.5 text-sm font-semibold opacity-95"><Target size={16} aria-hidden />{lo ? 'ພາລະກິດມື້ນີ້' : "Today's mission"}</p>
        <h2 className="relative mt-1 text-xl font-bold leading-snug">{today.title[lang]}</h2>
        <div className="relative flex flex-wrap gap-2 mt-3 text-xs font-bold">
          <span className="rounded-full bg-white/20 px-2.5 py-1">{lo ? '2 ນາທີ' : '2 min'}</span>
          <span className="rounded-full bg-white text-amber-600 px-2.5 py-1">+{MISSION_XP} XP</span>
          <span className="rounded-full bg-white/20 px-2.5 py-1">{lo ? 'ເລື່ອງຈິງ' : 'Real story'}</span>
        </div>
        {mission
          ? <button onClick={() => onLaunch({ game: 'story', scope: 'daily' })} className={`${btn3d} relative mt-4 bg-[#22C55E] text-white`} style={{ boxShadow: '0 4px 0 #15803D' }}><Check size={20} aria-hidden />{lo ? 'ສຳເລັດແລ້ວ' : 'Done'} · +{MISSION_XP} XP</button>
          : <button onClick={() => { hideNudge(); onLaunch({ game: 'story', scope: 'daily' }); }} className={`${btn3d} relative mt-4 bg-white text-[#1D4ED8]`} style={{ boxShadow: '0 4px 0 #1E3A8A' }}><Play size={18} fill="currentColor" aria-hidden />{lo ? 'ເລີ່ມພາລະກິດ' : 'Start mission'}</button>}
      </section>}

      {/* C. Reminder */}
      {nudge && today && !mission && <div role="status" className="daily-pop mx-4 mt-4 rounded-2xl bg-background shadow-[0_4px_16px_rgba(30,27,75,.06)] p-3 flex items-center gap-3">
        <span aria-hidden className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0"><BellRing size={20} /></span>
        <span className="flex-1 min-w-0 text-sm">
          <span className="block font-bold">{lo ? 'ສິ່ງທ້າທາຍມື້ນີ້ພ້ອມແລ້ວ' : t.nudge_title}</span>
          <span className="block text-muted-foreground">{lo ? '2 ນາທີ ເພື່ອຝຶກສະຕິຈັບການຫຼອກລວງ' : t.nudge_body}</span>
        </span>
        <button onClick={hideNudge} aria-label={lo ? 'ປິດ' : 'Close'} className="w-11 h-11 -mr-1 shrink-0 flex items-center justify-center"><span className="w-8 h-8 rounded-full bg-[#F3F4F8] dark:bg-muted text-muted-foreground flex items-center justify-center"><X size={16} /></span></button>
      </div>}

      {band === 'kids' && <div className="mt-2 px-1"><BaitFeed lang={lang} /></div>}

      {/* D. Weekly path */}
      <section className="px-4 mt-6">
        <div className="flex items-center justify-between mb-3"><h2 className="font-bold">{lo ? 'ເສັ້ນທາງອາທິດນີ້' : "This week's path"}</h2><span className="text-sm font-semibold text-muted-foreground">{done} / {level.length}</span></div>
        <div>
          <ol ref={pathRef} className="flex items-center overflow-x-auto scrollbar-hide -mx-4 px-4 py-2 snap-x">
            {level.map((s, i) => {
              const isDone = p.completed.includes(s.id), isCur = i === current;
              const line = i > 0 && <span aria-hidden className={`w-5 h-1.5 shrink-0 rounded-full ${i <= (current < 0 ? level.length : current) ? 'bg-primary' : 'bg-[#E6E6F0] dark:bg-muted'}`} />;
              const node = s.boss
                ? <span className={`w-[47px] h-[47px] m-1.5 rotate-45 rounded-[16px] bg-gradient-to-br from-orange-400 to-rose-500 flex items-center justify-center shadow-[0_6px_14px_rgba(244,63,94,.35)] ${isCur ? 'ring-4 ring-primary/30' : ''}`}><Crown size={23} className="-rotate-45 text-white" aria-label={t.boss} /></span>
                : isDone ? <span className="w-[50px] h-[50px] rounded-full bg-primary text-white flex items-center justify-center shadow-[0_4px_10px_rgba(91,33,209,.3)]"><Check size={22} strokeWidth={3} aria-label={`${i + 1} ✓`} /></span>
                : isCur ? <span className="relative w-[61px] h-[61px] flex items-center justify-center">
                    <span aria-hidden className="absolute inset-0 rounded-full bg-primary/20 animate-pulse" />
                    <span className="relative w-[50px] h-[50px] rounded-full bg-white border-4 border-primary text-primary text-xl font-extrabold flex items-center justify-center">{i + 1}</span>
                  </span>
                : <span className="w-[50px] h-[50px] rounded-full bg-white dark:bg-background border-2 border-[#E6E6F0] dark:border-border text-muted-foreground text-lg font-bold flex items-center justify-center">{i + 1}</span>;
              return <li key={s.id} data-cur={isCur || undefined} title={s.title[lang]} className="flex items-center shrink-0 snap-center">{line}{node}</li>;
            })}
          </ol>
          <button onClick={() => onLaunch({ game: 'story', scope: 'weekly' })} className={`${btn3d} mt-4 text-white`} style={{ background: 'linear-gradient(90deg, #5B21D1, #6E8EF0)', boxShadow: '0 5px 0 #3B0E91' }}>
            <Play size={18} fill="currentColor" aria-hidden />{lo ? 'ເລີ່ມ' : 'Start'} · {lo ? 'ດ່ານທີ' : 'Level'} {current < 0 ? level.length : current + 1}
          </button>
          {boss && <p className="flex items-center gap-1.5 text-xs text-muted-foreground mt-3">
            <Swords size={16} aria-hidden className="text-muted-foreground shrink-0" /><span className="rounded-md bg-rose-100 text-rose-600 font-extrabold px-1.5 py-0.5 text-[11px]">BOSS</span>
            <span className="truncate">{lo ? 'ວັນອາທິດ' : 'Sunday'}: {boss.title[lang]}{SHOW_EXPERT_PANEL && boss.verifiedBy ? ` · ${t.verified_by} ${boss.verifiedBy}` : ''}</span>
          </p>}
        </div>
      </section>

      {/* E. Games */}
      <section className="px-4 mt-6">
        <div className="flex items-center justify-between mb-3"><h2 className="font-bold">{lo ? 'ເລືອກເກມ' : 'Choose a game'}</h2><span className="text-sm font-semibold text-muted-foreground">{GAMES.length} {lo ? 'ເກມ' : 'games'}</span></div>
        <div className="grid grid-cols-2 gap-3">
          {games.map(({ id, icon: Icon, tint, glow }, i) => {
            const first = i === 0, fav = favs[id];
            return <div key={id} className={`relative rounded-[20px] bg-background ${first ? 'col-span-2 border-2 border-primary' : 'border border-[#ECECF4] dark:border-border'}`}>
              <button onClick={() => onLaunch({ game: id, scope: 'all' })} className="w-full h-full text-left p-4 pr-12 min-h-11">
                <span aria-hidden className={`w-11 h-11 rounded-xl bg-gradient-to-br ${tint} text-white flex items-center justify-center`} style={{ boxShadow: `0 6px 14px ${glow}` }}><Icon size={22} /></span>
                <span className="mt-3 flex items-center gap-1.5 flex-wrap"><span className="font-bold leading-snug">{t[`g_${id}`]}</span>{first && <span className="rounded-md bg-amber-100 text-amber-700 text-[11px] font-bold px-1.5 py-0.5">{lo ? 'ມາແຮງ' : 'Hot'}</span>}</span>
                <span className="block text-xs text-muted-foreground leading-snug mt-0.5">{t[`g_${id}_d`]}</span>
                <span className="block text-[11px] font-semibold text-muted-foreground mt-2">{lo ? '2 ນາທີ' : '2 min'} · +{GAME_XP} XP</span>
              </button>
              <button onClick={() => { const r = toggleLike(id); setFavs(f => ({ ...f, [id]: r.liked })); }} aria-pressed={fav} aria-label={lo ? 'ເກມທີ່ມັກ' : 'Favourite'}
                className="absolute top-1.5 right-1.5 w-11 h-11 flex items-center justify-center">
                <span className={`w-9 h-9 rounded-full flex items-center justify-center ${fav ? 'bg-rose-50 text-[#E11D48]' : 'bg-[#F3F4F8] dark:bg-muted text-[#A3A6BA]'}`}><Heart size={18} fill={fav ? 'currentColor' : 'none'} /></span>
              </button>
            </div>;
          })}
        </div>
      </section>

      {/* F. Badges */}
      <section className="px-4 mt-6">
        <div className="flex items-center justify-between mb-3"><h2 className="font-bold">{lo ? 'ເຫຼຽນຂອງຂ້ອຍ' : 'My badges'}</h2>
          <button onClick={() => onNav('progress')} className="min-h-11 flex items-center text-sm font-semibold text-primary">{lo ? 'ຄວາມຄືບໜ້າ' : 'Progress'}<ChevronRight size={16} aria-hidden /></button></div>
        <div className="grid grid-cols-4 gap-2">
          {badges.map(({ icon: Icon, label, on, tint }) => <div key={label} className="flex flex-col items-center text-center gap-1.5">
            <span className={`w-14 h-14 rounded-[18px] flex items-center justify-center ${on ? `bg-gradient-to-br ${tint} text-white shadow-md` : 'bg-[#ECECF4] dark:bg-muted text-[#A3A6BA]'}`}>{on ? <Icon size={24} aria-hidden /> : <Lock size={20} aria-hidden />}</span>
            <span className={`text-[11px] leading-tight ${on ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>{label}</span>
          </div>)}
        </div>
      </section>

      {/* G. Progress */}
      <div className="px-4 mt-6">
        <button onClick={() => onNav('progress')} className="daily-btn w-full rounded-2xl bg-[#EEF0FA] dark:bg-muted text-primary flex items-center justify-center gap-2 font-semibold"><BarChart3 size={18} aria-hidden />{lo ? 'ຄວາມຄືບໜ້າຂອງຂ້ອຍ' : t.my_progress}</button>
      </div>
      {footer}
      {ageOpen && <BandSheet lang={lang} onClose={age ? () => setAgeOpen(false) : undefined} onSaved={() => setAgeOpen(false)} />}
    </div>
  );
}
