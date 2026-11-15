import { useEffect, useRef, useState, type ReactNode } from 'react';
import { SHOW_EXPERT_PANEL } from '../../../../../shared/flags.mjs';
import { BarChart3, Swords, Flag, Shuffle, Link2, Zap, MessagesSquare, Play, Search, PhoneCall, BellRing, X, ChevronDown, Clock, Info, Bell, ChevronRight, Check, Crown, Flame, Target, Heart, Lock, UserPlus, type LucideIcon } from 'lucide-react';
import { BandSheet, bandLabel } from '../../../components/shared/BandSheet';
import { TIERS } from '../lib/age';
import { useBand, useHasBand, type Band } from '../../../lib/band';
import { BaitFeed } from '../../kids/BaitFeed';
import { DT } from '../i18n';
import { currentStreak, getLike, getProgress, levelInfo, missionDone, toggleLike, GAME_XP, MISSION_XP } from '../lib/progress';
import { laoDay, laoDayNumber } from '../lib/storage';
import { GAME_INFO } from '../data/gameInfo';
import { clearReminder, reminderOn, setReminder } from '../lib/reminder';
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
  const [remind, setRemind] = useState(reminderOn), [remindMsg, setRemindMsg] = useState('');
  const toggleRemind = async () => { if (remind) { await clearReminder(); setRemind(false); setRemindMsg(''); return; } const r = await setReminder(lang); if (r === 'set') { setRemind(true); setRemindMsg(''); } else setRemindMsg(r === 'denied' ? (lo ? 'ເປີດການແຈ້ງເຕືອນໃນການຕັ້ງຄ່າກ່ອນ' : 'Allow notifications in Settings first') : (lo ? 'ອຸປະກອນນີ້ບໍ່ຮອງຮັບການແຈ້ງເຕືອນ' : 'Notifications are not supported here')); };
  const hideNudge = () => { save(scoped(NUDGE_KEY), todayKey()); setNudge(false); };
  const age: Band | null = chosen ? band : null;
  const [ageOpen, setAgeOpen] = useState(() => !chosen);
  const AgeIcon = TIERS[band].icon;
  const rec = picksForToday(band)[0] ?? 'call';
  const games = [GAMES.find(g => g.id === rec)!, ...GAMES.filter(g => g.id !== rec)];
  // Mon-Sun path: a day is done when its mission was finished, today pulses, everything else is locked.
  const todayDate = laoDay(), dow = (new Date(`${todayDate}T12:00:00Z`).getUTCDay() + 6) % 7;
  const week = Array.from({ length: 7 }, (_, i) => ({ i, date: laoDay(i - dow), done: (p.missionDays || []).includes(laoDay(i - dow)) || (i === dow && mission) }));
  const weekDone = week.filter(d => d.done).length;
  const DAY_LABEL = lo ? ['ຈ', 'ອ', 'ພ', 'ພຫ', 'ສ', 'ສ', 'ອາ'] : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const [sheet, setSheet] = useState<null | { kind: 'all' } | { kind: 'learn'; id: GameId }>(null);
  const featured = (() => { const picks = picksForToday(band); const ids = [...picks, ...GAMES.map(g => g.id).filter(id => !picks.includes(id))].slice(0, 3); return ids.map(id => GAMES.find(g => g.id === id)!); })();
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
          <button type="button" aria-pressed={remind} onClick={() => void toggleRemind()} className="mt-1.5 min-h-11 inline-flex items-center gap-1.5 rounded-full bg-[#EDE9FE] px-3.5 text-[13px] font-bold text-[#3B0E91]"><Bell size={14} aria-hidden />{remind ? (lo ? 'ຕັ້ງເຕືອນແລ້ວ 19:00' : 'Reminder on · 19:00') : (lo ? 'ເຕືອນຂ້ອຍ' : 'Remind me')}</button>
          {remindMsg && <span role="alert" className="block text-[12px] text-red-600">{remindMsg}</span>}
        </span>
        <button onClick={hideNudge} aria-label={lo ? 'ປິດ' : 'Close'} className="w-11 h-11 -mr-1 shrink-0 flex items-center justify-center"><span className="w-8 h-8 rounded-full bg-[#F3F4F8] dark:bg-muted text-muted-foreground flex items-center justify-center"><X size={16} /></span></button>
      </div>}

      {band === 'kids' && <div className="mt-2 px-1"><BaitFeed lang={lang} /></div>}

      {/* D. Weekly path */}
      <section className="px-4 mt-6">
        <div className="flex items-center justify-between mb-3"><h2 className="font-bold">{lo ? 'ເສັ້ນທາງອາທິດນີ້' : "This week's path"}</h2><span className="text-sm font-semibold text-muted-foreground">{weekDone} / 7</span></div>
        <div>
          <ol ref={pathRef} aria-label={lo ? 'ເສັ້ນທາງອາທິດນີ້' : "This week's path"} className="flex items-start justify-between gap-1 py-2">
            {week.map(d => { const isCur = d.i === dow && !d.done, future = d.i > dow, boss = d.i === 6;
              const state = d.done ? (lo ? 'ສຳເລັດ' : 'done') : isCur ? (lo ? 'ມື້ນີ້' : 'today') : (lo ? 'ລັອກ' : 'locked');
              const node = d.done ? <span className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center shadow-[0_4px_10px_rgba(91,33,209,.3)]"><Check size={20} strokeWidth={3} aria-hidden /></span>
                : isCur ? <span className="relative w-12 h-12 flex items-center justify-center"><span aria-hidden className="absolute inset-0 rounded-full bg-primary/25 animate-ping motion-reduce:animate-none" /><span className="relative w-10 h-10 rounded-full bg-white border-4 border-primary text-primary flex items-center justify-center">{boss ? <Crown size={18} aria-hidden /> : <Play size={14} fill="currentColor" aria-hidden />}</span></span>
                : <span className="w-10 h-10 rounded-full bg-white dark:bg-background border-2 border-[#E6E6F0] dark:border-border text-[#A3A6BA] flex items-center justify-center">{boss ? <Crown size={17} aria-hidden /> : <Lock size={15} aria-hidden />}</span>;
              return <li key={d.i} aria-current={isCur ? 'step' : undefined} className="flex-1 min-w-0 flex flex-col items-center gap-1"><span className="h-12 flex items-center">{node}</span><span className={`text-[12px] font-bold ${isCur ? 'text-primary' : 'text-muted-foreground'}`}>{DAY_LABEL[d.i]}</span><span className="sr-only">{state}</span>{future && <span className="sr-only">{lo ? 'ຍັງບໍ່ເຖິງ' : 'not yet'}</span>}</li>; })}
          </ol>
          <button onClick={() => onLaunch({ game: 'story', scope: 'weekly' })} className={`${btn3d} mt-4 text-white`} style={{ background: 'linear-gradient(90deg, #5B21D1, #6E8EF0)', boxShadow: '0 5px 0 #3B0E91' }}>
            <Play size={18} fill="currentColor" aria-hidden />{lo ? 'ເລີ່ມ' : 'Start'} · {lo ? 'ດ່ານທີ' : 'Level'} {current < 0 ? level.length : current + 1}
          </button>
          {boss && <p className="flex items-center gap-1.5 text-xs text-muted-foreground mt-3">
            <Swords size={16} aria-hidden className="text-muted-foreground shrink-0" /><span className="rounded-md bg-rose-100 text-rose-600 font-extrabold px-1.5 py-0.5 text-[11px]">{lo ? "ບອສ" : "BOSS"}</span>
            <span className="truncate">{lo ? 'ວັນອາທິດ' : 'Sunday'}: {boss.title[lang]}{SHOW_EXPERT_PANEL && boss.verifiedBy ? ` · ${t.verified_by} ${boss.verifiedBy}` : ''}</span>
          </p>}
        </div>
      </section>

      {/* E. Games */}
      <section className="mt-6" aria-labelledby="featured">
        <div className="flex items-center justify-between mb-3 px-4"><h2 id="featured" className="font-bold">{lo ? 'ເກມເດັ່ນມື້ນີ້' : 'Featured games'}</h2></div>
        <ul className="flex gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-hide px-4 pb-2">
          {featured.map(({ id, icon: Icon, tint, glow }, i) => <li key={id} className="snap-start shrink-0 w-[78%] max-w-[300px] rounded-[20px] bg-background border border-[#ECECF4] dark:border-border flex flex-col">
            <button type="button" onClick={() => onLaunch({ game: id, scope: 'all' })} className="text-left p-4 flex-1 min-h-11 flex flex-col items-start justify-start">
              <span aria-hidden className={`w-11 h-11 rounded-xl bg-gradient-to-br ${tint} text-white flex items-center justify-center`} style={{ boxShadow: `0 6px 14px ${glow}` }}><Icon size={22} /></span>
              <span className="mt-3 flex items-center gap-1.5 flex-wrap"><span className="font-bold leading-snug">{t[`g_${id}`]}</span>{i === 0 && <span className="rounded-md bg-amber-100 text-amber-700 text-[11px] font-bold px-1.5 py-0.5">{lo ? 'ແນະນຳ' : 'Pick'}</span>}</span>
              <span className="block text-sm text-muted-foreground leading-snug mt-0.5">{t[`g_${id}_d`]}</span>
              <span className="mt-2 flex items-center gap-1 text-[12px] font-semibold text-muted-foreground"><Clock size={12} aria-hidden />{GAME_INFO[id].minutes} {lo ? 'ນາທີ' : 'min'} · +{GAME_XP} XP</span>
            </button>
            <button type="button" onClick={() => setSheet({ kind: 'learn', id })} className="min-h-11 border-t border-[#ECECF4] dark:border-border flex items-center justify-center gap-1.5 text-sm font-bold text-primary"><Info size={15} aria-hidden />{lo ? 'ຮຽນຮູ້ເພີ່ມ' : 'Learn more'}</button>
          </li>)}
        </ul>
        <div className="px-4 mt-3"><button type="button" onClick={() => setSheet({ kind: 'all' })} className={`${btn3d} bg-white dark:bg-background border-2 border-[#E6E6F0] dark:border-border text-foreground`}>{lo ? `ເກມທັງໝົດ (${GAMES.length})` : `All games (${GAMES.length})`}<ChevronRight size={18} aria-hidden /></button></div>
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
      {sheet && <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/45" onClick={() => setSheet(null)}>
        <div role="dialog" aria-modal="true" aria-label={sheet.kind === 'all' ? (lo ? 'ເກມທັງໝົດ' : 'All games') : t[`g_${sheet.id}`]} onClick={e => e.stopPropagation()} className="daily-slide-up w-full max-w-[480px] max-h-[85dvh] overflow-y-auto rounded-t-3xl bg-background px-4 pt-3 pb-[calc(20px+env(safe-area-inset-bottom))]">
          <span aria-hidden className="mx-auto mb-2 block h-1 w-10 rounded-full bg-border" />
          <div className="flex items-center justify-between"><h2 className="text-[1.25rem] font-extrabold">{sheet.kind === 'all' ? (lo ? `ເກມທັງໝົດ (${GAMES.length})` : `All games (${GAMES.length})`) : t[`g_${sheet.id}`]}</h2><button type="button" aria-label={lo ? 'ປິດ' : 'Close'} onClick={() => setSheet(null)} className="min-h-11 min-w-11 flex items-center justify-center"><X size={22} aria-hidden /></button></div>
          {sheet.kind === 'all' ? <ul className="mt-2 grid gap-2">{GAMES.map(({ id, icon: Icon, tint }) => <li key={id} className="flex items-center gap-2 rounded-2xl border border-[#ECECF4] dark:border-border">
            <button type="button" onClick={() => { setSheet(null); onLaunch({ game: id, scope: 'all' }); }} className="flex-1 min-w-0 flex items-center gap-3 p-3 min-h-14 text-left"><span aria-hidden className={`w-10 h-10 shrink-0 rounded-xl bg-gradient-to-br ${tint} text-white flex items-center justify-center`}><Icon size={20} /></span><span className="min-w-0"><span className="block font-bold truncate">{t[`g_${id}`]}</span><span className="block text-[12px] text-muted-foreground">{GAME_INFO[id].minutes} {lo ? 'ນາທີ' : 'min'} · +{GAME_XP} XP</span></span></button>
            <button type="button" onClick={() => { const r = toggleLike(id); setFavs(f => ({ ...f, [id]: r.liked })); }} aria-pressed={favs[id]} aria-label={lo ? 'ເກມທີ່ມັກ' : 'Favourite'} className="w-11 h-11 mr-1 flex items-center justify-center"><Heart size={18} fill={favs[id] ? 'currentColor' : 'none'} className={favs[id] ? 'text-[#E11D48]' : 'text-[#A3A6BA]'} /></button>
          </li>)}</ul>
          : <div className="mt-2"><p className="text-sm text-muted-foreground">{t[`g_${sheet.id}_d`]}</p>
              <h3 className="mt-4 font-bold">{lo ? 'ສິ່ງທີ່ຈະໄດ້ຮຽນ' : 'What you learn'}</h3>
              <ul className="mt-2 grid gap-2 list-disc pl-5 text-[1.0625rem] leading-relaxed marker:text-primary">{GAME_INFO[sheet.id].learn.map((x, i) => <li key={i}>{x[lang]}</li>)}</ul>
              <p className="mt-4 flex items-center gap-3 text-sm font-bold"><span className="rounded-full bg-muted px-3 py-1.5 flex items-center gap-1"><Clock size={14} aria-hidden />{GAME_INFO[sheet.id].minutes} {lo ? 'ນາທີ' : 'min'}</span><span className="rounded-full bg-[#EDE9FE] text-[#3B0E91] px-3 py-1.5">+{GAME_XP} XP</span></p>
              <button type="button" onClick={() => { const id = sheet.id; setSheet(null); onLaunch({ game: id, scope: 'all' }); }} className={`${btn3d} mt-4 text-white`} style={{ background: '#5B21D1', boxShadow: '0 5px 0 #3B0E91' }}><Play size={18} fill="currentColor" aria-hidden />{lo ? 'ຫຼິ້ນ' : 'Play'}</button></div>}
        </div></div>}
      {ageOpen && <BandSheet lang={lang} onClose={age ? () => setAgeOpen(false) : undefined} onSaved={() => setAgeOpen(false)} />}
    </div>
  );
}
