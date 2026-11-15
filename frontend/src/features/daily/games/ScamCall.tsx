import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ChevronRight, Grid3x3, Lightbulb, MicOff, Phone, PhoneOff, ShieldAlert, ShieldCheck, ShieldQuestion, ThumbsUp, Volume2, Wallet, UserRound } from 'lucide-react';
import { Burst, Combo, Countdown } from '../components/juice';
import { getAge, tier, type AgeTier } from '../lib/age';
import { filterByBand } from '../../../lib/band';
import { CT, DAYS, SIGNS, planDay, type Call, type Day, type Move } from '../data/scamCalls';
import { Backdrop } from '../components/Backdrop';
import { SCENES, sceneOf } from '../data/callScenes';
import { GameShell, MAX_LIVES } from '../components/GameShell';
import { FeedbackSheet } from '../components/FeedbackSheet';
import { DashAvatar } from '../components/DashAvatar';
import { haptic } from '../components/ui';
import { DT } from '../i18n';
import { track } from '../lib/analytics';
import { load, save } from '../lib/storage';
import { hasVoice, playClip, speak, stopSpeaking } from '../lib/speech';
import { duck, sfx, startRing, stopRing, useMusic } from '../lib/sound';
import type { FlagCategory, Lang } from '../types';
import type { GameResult } from './StoryGame';

type Stage = 'pick' | 'intro' | 'ring' | 'call' | 'result' | 'end';
const LINE_MS = 2200;
// XP for a right choice: declining a scam is the safest move (+30), checking first +20, trusting a real caller +10.
const gainFor = (c: Call, m: Move) => (!c.real && m === 'hangup' ? 30 : m === 'check' ? 20 : 10);
const MOVE_ICON = { trust: ThumbsUp, check: ShieldQuestion, hangup: PhoneOff };

const money = (n: number, lang: Lang) => `${n.toLocaleString('en-US')} ${CT[lang].kip}`;
// The day closest to the player's own age is suggested first.
const FOR_AGE: Record<AgeTier, string[]> = { kids: ['ton'], youth: ['noy', 'dara'], adult: ['khamla', 'souk'], elder: ['bounmy'] };
// A day written for one band only (as in content/call/<band>.json) is suggested to that band too.
const forMe = (d: Day, age: AgeTier) => FOR_AGE[age].includes(d.id) || (d.bands?.length === 1 && d.bands[0] === age);
const shuffle = <T,>(a: T[]) => a.map(v => [Math.random(), v] as const).sort((x, y) => x[0] - y[0]).map(([, v]) => v);

// Pick a character's day, then take a handful of calls, each real or scam. The player reads what the hero knows,
// listens to the call, then picks trust / check / hang up. Being too suspicious of real calls also costs.
export function ScamCall({ lang, onExit, onFinish }: { lang: Lang; onExit: () => void; onFinish: (r: GameResult) => void }) {
  const t = CT[lang];
  const [cfg] = useState(tier);
  const [hero, setHero] = useState<Day>(DAYS[0]);
  const [day, setDay] = useState<Call[]>(() => planDay(DAYS[0], cfg.calls));
  const [combo, setCombo] = useState(0);
  const [late, setLate] = useState(false);
  const [openSign, setOpenSign] = useState<string | null>(null);
  const [ci, setCi] = useState(0);
  const [stage, setStage] = useState<Stage>('pick');
  const [line, setLine] = useState(0);
  const [move, setMove] = useState<Move | null>(null);
  const [balance, setBalance] = useState(DAYS[0].balance);
  const [right, setRight] = useState(0);
  const [missed, setMissed] = useState<FlagCategory[]>([]);
  const [xp, setXp] = useState(0);
  const [lost, setLost] = useState(0);
  const [secs, setSecs] = useState(0);
  const [voice, setVoice] = useState(() => load<boolean>('sati-call-voice', true) || cfg.voice);
  const c: Call = day[ci];
  const who = hero.hero.name[lang];
  const begin = (d: Day) => { setHero(d); setDay(planDay(d, cfg.calls)); setBalance(d.balance); setCi(0); setLine(0); setRight(0); setMissed([]); setXp(0); setLost(0); setCombo(0); setMove(null); setStage('intro'); track({ type: 'session_start', mode: `call:${d.id}` }); };
  const moves = useMemo(() => shuffle<Move>(['trust', 'check', 'hangup']), [ci]);
  const heard = stage === 'call' && line >= c.lines.length - 1;
  useEffect(() => { if (stage !== 'call') return; setSecs(0); const id = setInterval(() => setSecs(v => v + 1), 1000); return () => clearInterval(id); }, [stage, ci]);

  const [mute, setMute] = useState(false); // voice on, but neither a recording nor a device voice could play
  useEffect(() => stopSpeaking, []);
  // Sound design: a dark heartbeat before and under the call (music ducked so the caller stays clear),
  // the phone ringing, then the ticking quiz loop while the player decides.
  useMusic(stage === 'intro' || (stage === 'call' && !heard) ? 'suspense' : stage === 'call' ? 'tense' : null);
  useEffect(() => { duck(stage === 'call' && !heard); }, [stage, heard]);
  useEffect(() => { if (stage !== 'ring') return; startRing(); return stopRing; }, [stage, ci]);
  useEffect(() => { if (stage === 'end') sfx(right / day.length >= 0.7 ? 'win' : 'lose'); }, [stage]); // eslint-disable-line react-hooks/exhaustive-deps
  // With the voice on, each line plays our recorded voice-over (scripts/gen-call-voices.mjs) and the next line
  // waits for it to finish. No recording: the device voice; no device voice either: a reading timer.
  useEffect(() => {
    if (stage !== 'call') return;
    const last = line >= c.lines.length - 1;
    let id = 0, alive = true, stop = () => {};
    const advance = () => { if (alive && !last) id = window.setTimeout(() => setLine(l => l + 1), 450); };
    const timer = () => { if (!last) id = window.setTimeout(() => setLine(l => l + 1), LINE_MS); };
    if (voice) stop = playClip(`/audio/calls/${lang}/${c.id}-${line}.mp3`, advance, () => {
      if (!alive) return;
      if (hasVoice(lang)) speak(c.lines[line][lang], lang, advance); else { setMute(true); timer(); }
    });
    else timer();
    return () => { alive = false; clearTimeout(id); stop(); stopSpeaking(); };
  }, [stage, line, voice]); // eslint-disable-line react-hooks/exhaustive-deps

  const choose = (m: Move, timedOut = false) => {
    stopSpeaking();
    if (m === 'hangup') sfx('hangup');
    const ok = c.real ? m !== 'hangup' : m !== 'trust';
    setMove(m); haptic(ok); setLate(timedOut); setOpenSign(null);
    setCombo(n => ok ? n + 1 : 0);
    track({ type: 'choice_made', scenarioId: `call-${c.id}`, scamType: c.real ? 'safe' : 'scam', step: m, correct: ok, scam: !c.real });
    if (ok) { setRight(r => r + 1); setXp(x => x + gainFor(c, m)); }
    if (!c.real && m === 'trust') { setBalance(b => b - c.stake); setLost(n => n + 1); setMissed(x => [...x, ...c.flags]); }
    setStage('result');
  };
  const next = () => {
    if (ci + 1 >= day.length) return setStage('end');
    setCi(ci + 1); setLine(0); setMove(null); setLate(false); setStage('ring');
  };

  const hour = parseInt(c.time);
  const verdict = move && (c.real ? (move === 'hangup' ? 'missed' : move === 'trust' ? 'good' : 'careful') : (move === 'trust' ? 'lost' : move === 'check' ? 'good' : 'careful'));
  const scene = sceneOf(hero.id), img = scene?.image;
  const lo = lang === 'lo', L = (a: string, b: string) => (lo ? a : b);
  const lives = Math.max(0, MAX_LIVES - lost);
  const inCall = stage === 'ring' || stage === 'call' || stage === 'result';
  const mmss = `${String(Math.floor(secs / 60)).padStart(2, '0')}:${String(secs % 60).padStart(2, '0')}`;
  const numberNote = c.saved ? t.in_contacts : c.number.startsWith('+856') ? L('ເບີທີ່ບໍ່ຮູ້ຈັກ', 'Unknown number') : L('ເບີຕ່າງປະເທດ', 'Foreign number');
  const safeEnd = lost === 0;
  const Backdrop2 = () => img
    ? <img src={img} alt="" aria-hidden className="absolute inset-0 w-full h-full object-cover scale-125 blur-md brightness-[.38]" />
    : <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-[#2B3165] to-[#0F0B2A]" />;
  const roundBtn = 'w-14 h-14 rounded-full flex items-center justify-center';

  const header = <div className="shrink-0 flex items-center gap-2 px-3 py-2 bg-background border-b border-border">
    <button type="button" onClick={stage === 'intro' ? () => setStage('pick') : onExit} aria-label={DT[lang].back} className="w-11 h-11 rounded-full flex items-center justify-center hover:bg-muted"><ArrowLeft size={20} /></button>
    <span className="flex-1 font-bold truncate">{DT[lang].g_call}</span>
    {stage !== 'pick' && <span className="flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-sm font-semibold tabular-nums"><Wallet size={15} className="text-primary" />{money(balance, lang)}</span>}
  </div>;

  const body = (<>
    {stage === 'pick' && <div className="h-full overflow-y-auto p-4 grid gap-4 content-start">
      <h2 className="text-[1.375rem] font-extrabold">{L('ເລືອກເລື່ອງ', 'Pick a story')}</h2>
      {SCENES.filter(sc => filterByBand([sc.day], getAge()).length).concat(SCENES.filter(sc => !filterByBand([sc.day], getAge()).length)).map(sc => (
        <button key={sc.id} type="button" onClick={() => begin(sc.day)} className="text-left rounded-3xl bg-white border border-[#E6E6F0] shadow-sm overflow-hidden active:scale-[.99]">
          <img src={sc.image} alt="" className="w-full h-40 object-cover" loading="lazy" />
          <span className="block p-4">
            <span className="block text-[1.125rem] font-extrabold">{sc.day.hero.name[lang]}, {sc.day.hero.age}</span>
            <span className="block text-[1rem] text-[#5F6390]">{sc.day.who[lang]}</span>
            <span className="mt-2 inline-block rounded-full bg-[#FEE2E2] px-3 py-1 text-[13px] font-bold text-[#B91C1C]">{sc.scam[lang]}</span>
          </span>
        </button>))}
      <h3 className="mt-2 text-[1rem] font-bold text-[#5F6390]">{L('ເລື່ອງອື່ນໆ', 'More stories')}</h3>
      <div className="grid gap-3">
        {filterByBand(DAYS, getAge()).sort((a, b) => Number(forMe(b, getAge())) - Number(forMe(a, getAge()))).map(d => (
          <button key={d.id} type="button" onClick={() => begin(d)} className="flex items-center gap-3 rounded-3xl border-2 border-border bg-card p-2 pr-3 text-left hover:border-primary">
            <span className="relative w-24 h-20 shrink-0 rounded-2xl overflow-hidden"><DayScene day={d} lang={lang} hour={10} thumb /></span>
            <span className="flex-1 min-w-0 grid gap-0.5"><span className="font-bold">{d.hero.name[lang]}, {d.hero.age}</span><span className="text-sm text-muted-foreground leading-snug">{d.who[lang]}</span></span>
            <ChevronRight size={20} className="text-muted-foreground shrink-0" />
          </button>))}
      </div>
    </div>}

    {stage === 'intro' && <div className="h-full overflow-y-auto p-4 grid gap-4 content-start">
      {img ? <img src={img} alt="" className="w-full rounded-3xl object-cover shadow-md" /> : <DayScene day={hero} lang={lang} hour={8} />}
      <div className="rounded-3xl border border-border bg-card p-4 grid gap-2">
        <h2 className="text-[1.375rem] font-extrabold">{t.intro_title.replace('{n}', who)}</h2>
        <p className="text-[1.0625rem] leading-relaxed">{hero.intro[lang].replace('{n}', String(day.length))} {t.intro_q}</p>
        <p className="flex items-center gap-2 rounded-2xl bg-[#EDE9FE] px-3 py-2 font-bold text-[#3B0E91]"><Wallet size={18} aria-hidden />{L('ເງິນໃນກະເປົາ', 'In the wallet')}: {money(balance, lang)}</p>
        <p className="text-sm text-muted-foreground flex gap-2"><Lightbulb size={16} className="text-amber-500 shrink-0 mt-0.5" />{t.intro_tip}</p>
      </div>
      <button type="button" onClick={() => setStage('ring')} className="min-h-14 rounded-2xl bg-[#5B21D1] text-white text-[1.125rem] font-bold shadow-[0_5px_0_#3B0E91] active:translate-y-[3px] active:shadow-[0_2px_0_#3B0E91]">{t.start}</button>
    </div>}

    {inCall && <div className="relative h-full overflow-hidden text-white">
      <Backdrop2 />
      {stage === 'ring' ? <div className="relative h-full flex flex-col items-center justify-between px-6 pt-10 pb-12">
        <div className="text-center grid gap-2 justify-items-center">
          <p className="text-[14px] font-bold uppercase tracking-wider text-white/70">{L('ສາຍເຂົ້າ', 'Incoming call')}</p>
          <p className="text-[2.25rem] leading-tight font-extrabold tabular-nums break-all">{c.number}</p>
          <p className="text-[1.125rem] text-white/90">{c.caller[lang]}</p>
          <span className={`rounded-full px-3 py-1 text-[14px] font-bold ${c.saved ? 'bg-emerald-400/25 text-emerald-100' : 'bg-amber-400/25 text-amber-100'}`}>{numberNote}</span>
          <p className="mt-3 max-w-[320px] rounded-2xl bg-black/35 px-4 py-3 text-[1rem] leading-relaxed">{c.note[lang]}</p>
        </div>
        <span aria-hidden className="relative w-28 h-28 flex items-center justify-center"><span className="absolute inset-0 rounded-full bg-white/15 animate-ping motion-reduce:animate-none" /><span className="relative w-24 h-24 rounded-full bg-white/20 flex items-center justify-center"><UserRound size={44} /></span></span>
        <div className="flex w-full max-w-[320px] items-center justify-between">
          <button type="button" onClick={() => choose('hangup')} className="grid justify-items-center gap-2 text-[1rem] font-bold"><span className="w-[72px] h-[72px] rounded-full bg-[#DC2626] flex items-center justify-center shadow-[0_5px_0_#991B1B]"><PhoneOff size={30} aria-hidden /></span>{L('ປະຕິເສດ', 'Decline')}</button>
          <button type="button" onClick={() => { setStage('call'); haptic(true); }} className="grid justify-items-center gap-2 text-[1rem] font-bold"><span className="w-[72px] h-[72px] rounded-full bg-[#16A34A] flex items-center justify-center shadow-[0_5px_0_#14532D] call-ring"><Phone size={30} aria-hidden /></span>{L('ຮັບສາຍ', 'Answer')}</button>
        </div>
      </div> : <div className="relative h-full overflow-y-auto px-5 pt-6 pb-8 flex flex-col gap-4">
        <div className="text-center"><p className="text-[1.25rem] font-bold">{c.caller[lang]}</p><p className="text-[1rem] tabular-nums text-white/75">{c.number} · {mmss}</p><p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-black/40 px-3 py-1 text-[14px] font-bold tabular-nums"><Wallet size={14} aria-hidden />{money(balance, lang)}</p></div>
        <div className="rounded-3xl bg-white/95 text-[#14112B] p-5 shadow-xl min-h-[8rem]" aria-live="polite">
          <p className="text-[13px] font-bold uppercase tracking-wide text-[#5F6390]">{c.caller[lang]}</p>
          <p key={line} className="daily-in mt-1 text-[1.25rem] leading-[1.6] font-bold">{c.lines[Math.min(line, c.lines.length - 1)][lang]}</p>
          {!heard && <p className="mt-2 text-xs text-[#5F6390] animate-pulse motion-reduce:animate-none">{t.listen}</p>}
          {voice && mute && <p className="mt-1 text-xs text-[#B45309]">{t.no_voice}</p>}
        </div>
        <div aria-hidden className="flex justify-center gap-6 text-[12px] text-white/80">
          {[[MicOff, L('ປິດສຽງ', 'Mute')], [Grid3x3, L('ປຸ່ມເບີ', 'Keypad')], [Volume2, L('ລຳໂພງ', 'Speaker')]].map(([I, n], k) => { const Icon = I as typeof Phone; return <span key={k} className="grid justify-items-center gap-1"><span className={`${roundBtn} bg-white/15`}><Icon size={22} /></span>{n as string}</span>; })}
        </div>
        {heard && <div className="grid gap-2.5 mt-auto">
          <div className="flex items-center justify-between gap-2"><p className="font-bold text-[1.0625rem]">{t.decide.replace('{n}', who)}</p><Combo n={combo} label={DT[lang].combo} /></div>
          {cfg.callSec > 0 && <Countdown key={c.id} seconds={cfg.callSec} onDone={() => choose(c.real ? 'hangup' : 'trust', true)} label={DT[lang].time_up} />}
          {moves.map(m => { const Icon = MOVE_ICON[m]; return <button key={m} type="button" onClick={() => choose(m)} className="daily-in flex items-center gap-3 rounded-2xl bg-white text-[#14112B] px-4 py-3 min-h-14 text-left text-[1.0625rem] font-bold shadow-[0_4px_0_rgba(0,0,0,.35)] active:translate-y-[2px]"><Icon size={22} className="text-[#5B21D1] shrink-0" aria-hidden />{c.moves[m][lang]}</button>; })}
        </div>}
      </div>}
    </div>}

    {stage === 'end' && <div className="h-full overflow-y-auto p-4 grid gap-4 content-start">
      <div className="relative">
        {img ? <img src={img} alt="" className="w-full rounded-3xl object-cover shadow-md" /> : <DayScene day={hero} lang={lang} hour={20} />}
        <span className={`absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[1.125rem] font-extrabold text-white shadow-lg ${safeEnd ? 'bg-[#16A34A]' : 'bg-[#DC2626]'}`}>{safeEnd ? <ShieldCheck size={20} aria-hidden /> : <ShieldAlert size={20} aria-hidden />}{safeEnd ? L('ປອດໄພ', 'Safe') : L('ຖືກຫຼອກ', 'Scammed')}</span>
      </div>
      <div className="daily-pop rounded-3xl border border-border bg-card p-5 grid gap-3 text-center">
        <h2 className="text-[1.5rem] font-extrabold">{t.day_done}</h2>
        {right === day.length && <div className="relative h-0"><Burst count={30} /></div>}
        <p className="text-4xl font-extrabold text-primary tabular-nums">{right}/{day.length}</p>
        <p className="text-sm text-muted-foreground">{t.calls_ok}</p>
        <p className="flex items-center justify-center gap-2 font-semibold"><Wallet size={18} className="text-primary" />{t.balance}: {money(balance, lang)}</p>
      </div>
      <button type="button" onClick={() => onFinish({ score: right, total: day.length, missed, failed: false, scenarioIds: [] })} className="min-h-14 rounded-2xl bg-[#5B21D1] text-white text-[1.125rem] font-bold shadow-[0_5px_0_#3B0E91] active:translate-y-[3px]">{t.finish}</button>
      <div className="grid grid-cols-2 gap-3">
        <button type="button" onClick={() => begin(hero)} className="min-h-12 rounded-2xl border-2 border-border bg-white font-bold">{L('ຫຼິ້ນອີກ', 'Play again')}</button>
        <button type="button" onClick={() => setStage('pick')} className="min-h-12 rounded-2xl border-2 border-border bg-white font-bold">{L('ເລືອກເລື່ອງອື່ນ', 'Pick another story')}</button>
      </div>
    </div>}
  </>);

  return (
    <div className="flex flex-col h-full font-lao">
      {inCall
        ? <GameShell lang={lang} name={DT[lang].g_call} index={ci} total={day.length} lives={lives} xp={xp} dark onExit={onExit} midGame>{body}</GameShell>
        : <>{header}<div className="flex-1 min-h-0">{body}</div></>}
      {stage === 'result' && move && <FeedbackSheet lang={lang} ok={verdict === 'good' || verdict === 'careful'}
        title={verdict === 'lost' ? t.lost : verdict === 'missed' ? t.missed : undefined}
        subtitle={c.real ? t.was_real : t.was_scam}
        gain={verdict === 'lost' ? (c.stake ? `−${money(c.stake, lang)}` : L('−1 ໂລ່', '−1 shield')) : verdict === 'missed' ? L('−1 ໂລ່', '−1 shield') : `+${gainFor(c, move)} XP`}
        explanation={c.outcome[move][lang]}
        items={c.signs.map(id => { const sg = SIGNS.find(x => x.id === id)!; return { ok: !!sg.good, text: sg.name[lang], reason: sg.body[lang] }; })}
        tip={c.remember[lang]} nextLabel={ci + 1 >= day.length ? t.finish : t.next_call} onNext={next} />}
    </div>
  );
}

// The hero's place for the day: Souk's stall, or the character's room from Scam Detective.
function DayScene(p: { day: Day; hour: number; lang: Lang; ringing?: boolean; onPhone?: () => void; talking?: boolean; compact?: boolean; thumb?: boolean }) {
  const { day, hour, ringing, onPhone, lang, talking, compact, thumb } = p;
  const room = day.room;
  if (room === 'stall') return <Stall {...p} />;
  return (
    <div className={`relative ${thumb ? 'h-full' : compact ? 'h-44' : 'h-52'} ${thumb ? '' : 'rounded-3xl shadow-md'} overflow-hidden`}>
      <Backdrop room={room} night={hour >= 18} />
      <div className="absolute" style={{ left: thumb ? '50%' : '58%', bottom: thumb ? '2%' : compact ? '30%' : '6%', transform: thumb ? 'translateX(-50%)' : undefined }}>
        <div className={talking ? 'call-talk' : ''}><DashAvatar a={day.hero.avatar} size={thumb ? 44 : 72} pose="stand" /></div>
        {talking && <span className="absolute -top-3 -right-7 w-9 h-9 rounded-full bg-white text-emerald-600 shadow flex items-center justify-center juice-glow"><Phone size={16} /></span>}
      </div>
      {onPhone && <button onClick={onPhone} aria-label={lang === 'lo' ? 'ຮັບສາຍ' : 'Answer phone'} disabled={!ringing}
        className={`absolute w-12 h-12 rounded-2xl bg-white text-primary border-2 border-primary flex items-center justify-center ${ringing ? 'call-ring' : ''}`} style={{ left: '30%', bottom: '14%' }}><Phone size={20} /></button>}
      {!onPhone && !thumb && <span className="absolute left-3 top-3 rounded-full bg-white/90 dark:bg-black/60 px-3 py-1 text-xs font-semibold flex items-center gap-1"><UserRound size={13} />{day.hero.name[lang]}, {day.hero.age}</span>}
    </div>
  );
}

// Souk's noodle stall, drawn in SVG. Sky follows the hour; the phone on the counter rings when a call comes in.
function Stall({ day, hour, ringing, onPhone, lang, talking, compact, thumb }: { day: Day; hour: number; ringing?: boolean; onPhone?: () => void; lang: Lang; talking?: boolean; compact?: boolean; thumb?: boolean }) {
  const night = hour >= 18, dawn = hour < 9;
  const sky = night ? ['#2B3165', '#4B4F8A'] : dawn ? ['#FBC99A', '#FFF1DB'] : ['#8CCBF2', '#E6F5FF'];
  return (
    <div className={`relative ${thumb ? 'h-full' : compact ? 'h-44' : 'h-52'} ${thumb ? '' : 'rounded-3xl shadow-md'} overflow-hidden`} style={{ background: `linear-gradient(${sky[0]},${sky[1]})` }}>
      <svg viewBox="0 0 400 210" preserveAspectRatio="xMidYMax slice" className="absolute inset-0 w-full h-full" aria-hidden>
        {night ? <circle cx="330" cy="40" r="16" fill="#FFF4D6" /> : <circle cx="330" cy="46" r="22" fill="#FFE08A" opacity=".9" />}
        <path d="M0 150 L40 110 L70 125 L110 90 L150 120 L200 100 L250 125 L300 95 L340 118 L400 105 V210 H0Z" fill={night ? '#3A3F6E' : '#B9D3C2'} />
        <rect x="0" y="170" width="400" height="40" fill={night ? '#2A2D45' : '#9AA3AE'} />
        <rect x="60" y="78" width="250" height="96" fill={night ? '#5C4A3A' : '#E8D3B0'} />
        {Array.from({ length: 10 }, (_, i) => <path key={i} d={`M${50 + i * 27} 60 h27 v22 a13.5 9 0 0 1 -27 0z`} fill={i % 2 ? '#FFFFFF' : '#D9480F'} />)}
        <rect x="50" y="56" width="270" height="6" rx="3" fill="#8A3B12" />
        <rect x="80" y="92" width="96" height="30" rx="4" fill="#FFF7E6" stroke="#8A3B12" strokeWidth="2" />
        <text x="128" y="112" textAnchor="middle" fontSize="13" fontWeight="700" fill="#8A3B12">ເຝີ ສຸກ</text>
        <rect x="70" y="140" width="230" height="34" rx="4" fill="#7A4E2D" />
        <rect x="70" y="138" width="230" height="6" rx="3" fill="#9C6B43" />
        <rect x="200" y="112" width="44" height="28" rx="6" fill="#B8BDC6" stroke="#6B7280" strokeWidth="2" />
        {!night && [0, 1, 2].map(i => <path key={i} d={`M${212 + i * 10} 108 q-5 -8 0 -16 q5 -8 0 -16`} stroke="#fff" strokeOpacity=".7" strokeWidth="2.5" fill="none" className="daily-float" style={{ animationDelay: `${i * 0.3}s` }} />)}
        {night && <circle cx="120" cy="66" r="40" fill="#FFE7A8" opacity=".18" />}
      </svg>
      <div className="absolute" style={{ left: '62%', bottom: compact ? '34%' : '17%' }}>
        <div className={talking ? 'call-talk' : ''}><DashAvatar a={day.hero.avatar} size={thumb ? 40 : 58} pose="stand" /></div>
        {talking && <span className="absolute -top-3 -right-7 w-9 h-9 rounded-full bg-white text-emerald-600 shadow flex items-center justify-center juice-glow"><Phone size={16} /></span>}
      </div>
      {onPhone && <button onClick={onPhone} aria-label={lang === 'lo' ? 'ຮັບສາຍ' : 'Answer phone'} disabled={!ringing}
        className={`absolute w-12 h-12 rounded-2xl bg-white text-primary border-2 border-primary flex items-center justify-center ${ringing ? 'call-ring' : ''}`} style={{ left: '24%', bottom: '19%' }}><Phone size={20} /></button>}
      {!onPhone && !thumb && <span className="absolute left-3 top-3 rounded-full bg-white/90 dark:bg-black/60 px-3 py-1 text-xs font-semibold flex items-center gap-1"><UserRound size={13} />{day.hero.name[lang]}, {day.hero.age}</span>}
    </div>
  );
}
