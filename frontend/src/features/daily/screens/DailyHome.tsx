import { useEffect, useRef, useState, type ReactNode } from 'react';
import { SHOW_EXPERT_PANEL } from '../../../../../shared/flags.mjs';
import { BarChart3, Swords, Flag, Shuffle, Link2, Zap, MessagesSquare, Play, Search, PhoneCall, BellRing, X, ChevronDown, Clock, Bell, Check, Crown, Flame, Heart, Lock, UserPlus, type LucideIcon } from 'lucide-react';
import { BandSheet, bandLabel } from '../../../components/shared/BandSheet';
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

  const MiniCrown = <Crown size={20} aria-hidden style={{ transform: 'rotate(-45deg)' }} />;
  return (
    <div className="h-full overflow-y-auto scrollbar-hide pb-6 bg-[#F7F7FA] text-[#14112B] font-lao">
      {/* A. Header */}
      <header className="text-white px-4 pt-3.5 pb-14 rounded-b-[26px]" style={{ background: 'linear-gradient(140deg, #4A16B5 0%, #5B21D1 45%, #6E8EF0 100%)' }}>
        <div className="flex items-center gap-2.5">
          <span className="w-9 h-9 rounded-[11px] bg-white flex items-center justify-center shrink-0"><img src="/brand-mark.svg" alt="" className="w-[22px] h-[22px]" /></span>
          <h1 className="flex-1 min-w-0 text-[18px] font-extrabold whitespace-nowrap" style={{ fontFamily: 'Inter, BoonHome, sans-serif' }}>{lo ? 'Sati ປະຈຳວັນ' : 'Sati Daily'}{/* REVIEW-LO */}</h1>
          {header}
          <button onClick={() => setAgeOpen(true)} aria-label={`${t.age_title} ${age ? bandLabel(age, lang) : ''}`} className="shrink-0 relative flex items-center gap-1 h-[30px] rounded-full bg-white/20 px-2.5 text-[12px] font-bold before:absolute before:-inset-y-2 before:inset-x-0 before:content-['']">
            <span className="max-w-[84px] truncate">{age ? bandLabel(age, lang).replace(/\s*\d.*$/, '') : t.age_title}</span><ChevronDown size={12} aria-hidden />
          </button>
          <span className="shrink-0 flex items-center gap-1 h-[30px] rounded-full bg-white text-[#14112B] px-2.5 text-[12px] font-semibold">
            <Flame size={13} className="text-[#F97316]" fill="#F97316" aria-hidden /><b className="text-[#F97316]" style={{ fontFamily: 'Inter, BoonHome, sans-serif' }}>{streak}</b> {lo ? 'ມື້' : 'days'}
          </span>
        </div>
        <div className="flex items-center gap-2.5 mt-3 text-[12px]">
          <span className="font-bold whitespace-nowrap">{lo ? 'ລະດັບ' : 'Level'} {lvl.level} · {LEVEL_TITLES[lang][Math.min(lvl.level - 1, 4)]}</span>
          <span className="flex-1 h-1.5 rounded-full bg-white/[.22]" role="progressbar" aria-valuemin={0} aria-valuemax={lvl.need} aria-valuenow={lvl.xp}><span className="block h-1.5 rounded-full bg-[#FDBA4D]" style={{ width: `${Math.min(100, (lvl.xp / lvl.need) * 100)}%` }} /></span>
          <span className="opacity-90 whitespace-nowrap" style={{ fontFamily: 'Inter, BoonHome, sans-serif' }}>{lvl.xp}/{lvl.need} XP</span>
        </div>
        {band === 'kids' && <p className="mt-3 text-sm font-semibold opacity-95">{t.tell_adult}</p>}
      </header>

      {/* B. Today's mission */}
      {today && <section className="mx-4 -mt-[42px] p-4 rounded-[22px] text-white shadow-[0_12px_26px_rgba(37,99,235,.28)]" style={{ background: 'linear-gradient(140deg, #1D4ED8 0%, #2563EB 45%, #60A5FA 100%)' }}>
        <p className="mb-1 text-[12px] font-bold text-[#DBEAFE]">{lo ? 'ພາລະກິດມື້ນີ້ · 2 ນາທີ' : "Today's mission · 2 min"} · <span className="text-[#FDE68A]">+{MISSION_XP} XP</span></p>
        <h2 className="mb-3 text-[19px] leading-[1.35] font-bold">{today.title[lang]}</h2>
        {mission
          ? <button onClick={() => onLaunch({ game: 'story', scope: 'daily' })} className="w-full flex items-center justify-center gap-2 min-h-12 rounded-[14px] bg-[#22C55E] text-white text-[15px] font-bold" style={{ boxShadow: '0 4px 0 #15803D' }}><Check size={18} aria-hidden />{lo ? 'ສຳເລັດແລ້ວ' : 'Done'} · +{MISSION_XP} XP</button>
          : <button onClick={() => { hideNudge(); onLaunch({ game: 'story', scope: 'daily' }); }} className="w-full flex items-center justify-center gap-2 min-h-12 rounded-[14px] bg-white text-[#1D4ED8] text-[15px] font-bold" style={{ boxShadow: '0 4px 0 #1E3A8A' }}><Play size={14} fill="currentColor" aria-hidden />{lo ? 'ເລີ່ມພາລະກິດ' : 'Start mission'}</button>}
      </section>}

      {/* C. Reminder */}
      {nudge && today && !mission && <div role="status" className="daily-pop mx-4 mt-3 flex items-center gap-3 rounded-[18px] bg-white border border-[#ECECF4] shadow-[0_4px_14px_rgba(20,17,43,.05)] py-3 pr-2.5 pl-3">
        <span aria-hidden className="w-10 h-10 rounded-xl bg-[#FEF3C7] text-[#D97706] flex items-center justify-center shrink-0"><BellRing size={20} /></span>
        <span className="flex-1 min-w-0">
          <span className="block text-[14px] font-bold">{lo ? 'ສິ່ງທ້າທາຍມື້ນີ້ພ້ອມແລ້ວ' : t.nudge_title}</span>
          <span className="block text-[12px] text-[#5F6390]">{lo ? '2 ນາທີ ເພື່ອຝຶກສະຕິຈັບການຫຼອກລວງ' : t.nudge_body}</span>
          <button type="button" aria-pressed={remind} onClick={() => void toggleRemind()} className="mt-1 min-h-8 inline-flex items-center gap-1 text-[12px] font-bold text-[#5B21D1]"><Bell size={13} aria-hidden />{remind ? (lo ? 'ຕັ້ງເຕືອນແລ້ວ 19:00' : 'Reminder on · 19:00') : (lo ? 'ເຕືອນຂ້ອຍ' : 'Remind me')}</button>
          {remindMsg && <span role="alert" className="block text-[12px] text-red-600">{remindMsg}</span>}
        </span>
        <button onClick={hideNudge} aria-label={lo ? 'ປິດ' : 'Close'} className="shrink-0 w-9 h-9 rounded-full bg-[#F3F4F8] text-[#5F6390] flex items-center justify-center"><X size={16} /></button>
      </div>}

      {band === 'kids' && <div className="mt-2 px-1"><BaitFeed lang={lang} /></div>}

      {/* D. Weekly path */}
      <section className="mx-4 mt-[22px]">
        <div className="flex items-baseline justify-between mb-3"><h3 className="text-[17px] font-bold">{lo ? 'ເສັ້ນທາງອາທິດນີ້' : "This week's path"}</h3><span className="text-[13px] text-[#5F6390]" style={{ fontFamily: 'Inter, BoonHome, sans-serif' }}>{weekDone} / 7</span></div>
        <ol ref={pathRef} aria-label={lo ? 'ເສັ້ນທາງອາທິດນີ້' : "This week's path"} className="relative flex justify-between items-center px-1">
          <span aria-hidden className="absolute left-6 right-6 top-1/2 h-1 -mt-0.5 rounded-full bg-[#E3E1F0]" />
          <span aria-hidden className="absolute left-6 top-1/2 h-1 -mt-0.5 rounded-full bg-[#5B21D1]" style={{ width: `${Math.min(90, (weekDone / 6) * 90)}%` }} />
          {week.map(d => { const isCur = d.i === dow && !d.done, last = d.i === 6;
            const state = d.done ? (lo ? 'ສຳເລັດ' : 'done') : isCur ? (lo ? 'ມື້ນີ້' : 'today') : (lo ? 'ລັອກ' : 'locked');
            const node = last
              ? <span className="relative flex w-11 h-11 rounded-[14px] text-white items-center justify-center rotate-45" style={{ background: 'linear-gradient(135deg, #F97316, #E11D48)' }}>{MiniCrown}</span>
              : d.done ? <span className="relative flex w-9 h-9 rounded-full bg-[#5B21D1] text-white items-center justify-center"><Check size={16} aria-hidden /></span>
              : isCur ? <span className="relative flex w-11 h-11 box-border rounded-full border-[3px] border-[#5B21D1] bg-white text-[#5B21D1] font-extrabold items-center justify-center" style={{ fontFamily: 'Inter, BoonHome, sans-serif' }}>{d.i + 1}</span>
              : <span className="relative flex w-9 h-9 box-border rounded-full bg-white border-2 border-[#E3E1F0] text-[#8A8DB0] text-[14px] font-bold items-center justify-center" style={{ fontFamily: 'Inter, BoonHome, sans-serif' }}>{d.i + 1}</span>;
            return <li key={d.i} aria-current={isCur ? 'step' : undefined} aria-label={`${DAY_LABEL[d.i]}: ${state}`} {...(isCur ? { 'data-cur': true } : {})}>{node}</li>; })}
        </ol>
        <button onClick={() => onLaunch({ game: 'story', scope: 'weekly' })} className="w-full mt-4 flex items-center justify-center gap-2 min-h-[52px] rounded-2xl text-white text-[16px] font-bold" style={{ background: 'linear-gradient(90deg, #5B21D1, #6E8EF0)', boxShadow: '0 5px 0 #3B0E91' }}>
          {lo ? 'ເລີ່ມ' : 'Start'} · {lo ? 'ດ່ານທີ' : 'Level'} {current < 0 ? level.length : current + 1}
        </button>
        {boss && <p className="mt-3 flex items-center gap-1.5 text-[13px] text-[#5F6390]">
          <Swords size={15} aria-hidden className="shrink-0" /><span className="rounded-md bg-[#FFE4E6] text-[#BE123C] px-2 py-0.5 text-[11px] font-extrabold" style={{ fontFamily: 'Inter, BoonHome, sans-serif' }}>{lo ? 'ດ່ານບອສ' : 'BOSS'}</span>
          <span className="truncate">{lo ? 'ວັນອາທິດ' : 'Sunday'}: {boss.title[lang]}{SHOW_EXPERT_PANEL && boss.verifiedBy ? ` · ${t.verified_by} ${boss.verifiedBy}` : ''}</span>
        </p>}
      </section>

      {/* E. Games */}
      <section className="mt-[26px]" aria-labelledby="featured">
        <div className="flex items-baseline justify-between px-4 mb-2.5"><h3 id="featured" className="text-[17px] font-bold">{lo ? 'ເກມແນະນຳ' : 'Featured games'}</h3>
          <button type="button" onClick={() => setSheet({ kind: 'all' })} className="min-h-8 text-[13px] font-bold text-[#5B21D1]">{lo ? `ເກມທັງໝົດ (${GAMES.length})` : `All games (${GAMES.length})`}</button></div>
        <ul className="flex gap-3 overflow-x-auto scrollbar-hide px-4 pb-1.5">
          {featured.map(({ id, icon: Icon, tint }, i) => <li key={id} className="shrink-0 w-[230px] p-3.5 rounded-[22px] bg-white border border-[#ECECF4] shadow-[0_2px_8px_rgba(20,17,43,.04)]">
            <div aria-hidden className={`relative overflow-hidden h-24 -mx-0.5 -mt-0.5 mb-3 rounded-2xl bg-gradient-to-br ${tint} text-white flex items-center justify-center`}>
              <span className="absolute -right-5 -bottom-[30px] w-[110px] h-[110px] rounded-full bg-white/15" />
              <Icon size={40} />
              <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full bg-white/90 text-[#14112B] text-[11px] font-bold">{i === 0 ? (lo ? 'ແນະນຳ' : 'Pick') : (lo ? 'ມາແຮງ' : 'Hot')}</span>
            </div>
            <p className="mb-0.5 text-[16px] font-bold">{t[`g_${id}`]}</p>
            <p className="mb-3 text-[12px] leading-[1.45] text-[#5F6390]">{t[`g_${id}_d`]}</p>
            <div className="flex gap-2">
              <button type="button" onClick={() => onLaunch({ game: id, scope: 'all' })} className="flex-1 h-10 rounded-xl bg-[#5B21D1] text-white text-[14px] font-bold" style={{ boxShadow: '0 3px 0 #3B0E91' }}>{lo ? 'ຫຼິ້ນ' : 'Play'}</button>
              <button type="button" onClick={() => setSheet({ kind: 'learn', id })} className="flex-1 h-10 rounded-xl border border-[#E6E6F0] bg-white text-[#14112B] text-[13px] font-semibold">{lo ? 'ຮຽນຮູ້ເພີ່ມ' : 'Learn more'}</button>
            </div>
          </li>)}
        </ul>
      </section>

      {/* F. Badges */}
      <section className="mx-4 mt-6">
        <div className="flex items-baseline justify-between mb-3"><h3 className="text-[17px] font-bold">{lo ? 'ເຫຼຽນຂອງຂ້ອຍ' : 'My badges'}</h3>
          <button onClick={() => onNav('progress')} className="min-h-8 text-[13px] font-bold text-[#5B21D1]">{lo ? 'ຄວາມຄືບໜ້າ ›' : 'Progress ›'}</button></div>
        <div className="grid grid-cols-4 gap-2">
          {badges.map(({ icon: Icon, label, on, tint }) => <div key={label} className="text-center">
            <span className={`flex w-14 h-14 mx-auto mb-1.5 rounded-[18px] items-center justify-center ${on ? `bg-gradient-to-br ${tint} text-white` : 'bg-[#ECECF4] text-[#A3A6C2]'}`}>{on ? <Icon size={24} aria-hidden /> : <Lock size={22} aria-hidden />}</span>
            <span className={`text-[11px] ${on ? 'font-semibold' : 'text-[#8A8DB0]'}`}>{label}</span>
          </div>)}
        </div>
      </section>

      {/* G. Progress */}
      <button onClick={() => onNav('progress')} className="flex items-center justify-center gap-2 w-[calc(100%-32px)] min-h-[52px] mx-4 mt-5 rounded-2xl bg-[#EEF0FA] text-[#14112B] text-[15px] font-bold"><BarChart3 size={18} aria-hidden />{lo ? 'ຄວາມຄືບໜ້າຂອງຂ້ອຍ' : t.my_progress}</button>
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
