import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, BadgeCheck, ChevronRight, CheckCircle2, Clock, Lightbulb, NotebookPen, Phone, PhoneOff, ShieldAlert, ShieldQuestion, Star, ThumbsUp, Volume2, VolumeX, Wallet, XCircle, UserRound } from 'lucide-react';
import { Burst, Combo, Countdown } from '../components/juice';
import { getAge, tier, type AgeTier } from '../lib/age';
import { CT, DAYS, SIGNS, planDay, type Call, type Day, type Move } from '../data/scamCalls';
import { Backdrop } from '../components/Backdrop';
import { DashAvatar } from '../components/DashAvatar';
import { SoundToggle, haptic } from '../components/ui';
import { DT } from '../i18n';
import { track } from '../lib/analytics';
import { load, save } from '../lib/storage';
import { hasVoice, playClip, speak, stopSpeaking } from '../lib/speech';
import { duck, sfx, startRing, stopRing, useMusic } from '../lib/sound';
import type { FlagCategory, Lang } from '../types';
import type { GameResult } from './StoryGame';

type Stage = 'pick' | 'intro' | 'ring' | 'call' | 'result' | 'end';
const LINE_MS = 2200;
const MOVE_ICON = { trust: ThumbsUp, check: ShieldQuestion, hangup: PhoneOff };

const money = (n: number, lang: Lang) => `${n.toLocaleString('en-US')} ${CT[lang].kip}`;
// The day closest to the player's own age is suggested first.
const FOR_AGE: Record<AgeTier, string[]> = { kid: ['ton'], youth: ['noy', 'dara'], adult: ['khamla', 'souk'], elder: ['bounmy'] };
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
  const [voice, setVoice] = useState(() => load<boolean>('sati-call-voice', true) || cfg.voice);
  const c: Call = day[ci];
  const who = hero.hero.name[lang];
  const begin = (d: Day) => { setHero(d); setDay(planDay(d, cfg.calls)); setBalance(d.balance); setStage('intro'); track({ type: 'session_start', mode: `call:${d.id}` }); };
  const moves = useMemo(() => shuffle<Move>(['trust', 'check', 'hangup']), [ci]);
  const heard = stage === 'call' && line >= c.lines.length - 1;

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
    track({ type: 'choice_made', scenarioId: `call-${c.id}`, scamType: c.real ? 'safe' : 'scam', step: m, correct: ok });
    if (ok) setRight(r => r + 1);
    if (!c.real && m === 'trust') { setBalance(b => b - c.stake); setMissed(x => [...x, ...c.flags]); }
    setStage('result');
  };
  const next = () => {
    if (ci + 1 >= day.length) return setStage('end');
    setCi(ci + 1); setLine(0); setMove(null); setLate(false); setStage('ring');
  };

  const hour = parseInt(c.time);
  const verdict = move && (c.real ? (move === 'hangup' ? 'missed' : move === 'trust' ? 'good' : 'careful') : (move === 'trust' ? 'lost' : move === 'check' ? 'good' : 'careful'));
  return (
    <div className="flex flex-col h-full font-lao">
      <div className="shrink-0 flex items-center gap-2 px-3 py-2 bg-background border-b border-border">
        <button onClick={stage === 'intro' ? () => setStage('pick') : onExit} aria-label={DT[lang].back} className="w-11 h-11 rounded-full flex items-center justify-center hover:bg-muted"><ArrowLeft size={22} /></button>
        <img src="/brand-mark.svg" alt="" className="w-7 h-7" />
        <span className="flex-1 font-bold truncate">{DT[lang].g_call}</span>
        {stage !== 'pick' && <span className="flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-sm font-semibold tabular-nums"><Wallet size={15} className="text-primary" />{money(balance, lang)}</span>}
        <button onClick={() => { setVoice(v => { save('sati-call-voice', !v); return !v; }); stopSpeaking(); }} aria-pressed={voice} aria-label={DT[lang].det_voice}
          className="w-11 h-11 rounded-full bg-muted flex items-center justify-center">{voice ? <Volume2 size={18} /> : <VolumeX size={18} />}</button>
        <SoundToggle lang={lang} />
      </div>
      {stage !== 'pick' && stage !== 'intro' && stage !== 'end' && <div className="shrink-0 flex gap-1 px-4 pt-2">{day.map((_, i) => <span key={i} className={`h-1.5 flex-1 rounded-full ${i < ci ? 'bg-primary' : i === ci ? 'bg-primary/50' : 'bg-muted'}`} />)}</div>}

      <div className="flex-1 overflow-y-auto p-4 grid gap-4 content-start">
        {stage === 'pick' && <>
          <h2 className="text-xl font-extrabold">{t.pick}</h2>
          <div className="grid gap-3">
            {[...DAYS].sort((a, b) => Number(FOR_AGE[getAge()].includes(b.id)) - Number(FOR_AGE[getAge()].includes(a.id))).map((d, i) => { const mine = FOR_AGE[getAge()].includes(d.id); return (
              <button key={d.id} onClick={() => begin(d)} style={{ animationDelay: `${i * 0.05}s` }}
                className={`daily-in daily-btn flex items-center gap-3 rounded-3xl border-2 bg-card p-2 pr-3 text-left hover:border-primary ${mine ? 'border-primary' : 'border-border'}`}>
                <span className="relative w-24 h-20 shrink-0 rounded-2xl overflow-hidden">
                  <DayScene day={d} lang={lang} hour={10} thumb />
                </span>
                <span className="flex-1 min-w-0 grid gap-0.5">
                  {mine && <span className="justify-self-start rounded-full bg-primary/10 text-primary px-2 py-0.5 text-[11px] font-bold">{DT[lang].for_you}</span>}
                  <span className="font-bold">{d.hero.name[lang]}, {d.hero.age}</span>
                  <span className="text-sm text-muted-foreground leading-snug">{d.who[lang]}</span>
                  <span className="text-xs font-semibold text-primary">{Math.min(cfg.calls, new Set(d.calls.map(x => x.time)).size)} {t.calls_n}</span>
                </span>
                <ChevronRight size={20} className="text-muted-foreground shrink-0" />
              </button>); })}
          </div>
        </>}

        {stage === 'intro' && <>
          <DayScene day={hero} lang={lang} hour={8} />
          <div className="rounded-3xl border border-border bg-card p-4 grid gap-2">
            <h2 className="text-xl font-extrabold">{t.intro_title.replace('{n}', who)}</h2>
            <p className="leading-relaxed">{hero.intro[lang].replace('{n}', String(day.length))} {t.intro_q}</p>
            <p className="text-sm text-muted-foreground flex gap-2"><Lightbulb size={16} className="text-amber-500 shrink-0 mt-0.5" />{t.intro_tip}</p>
            {cfg.callSec > 0 && <p className="text-sm font-semibold text-red-600 flex gap-2"><Clock size={16} className="shrink-0 mt-0.5" />{t.timer_note}</p>}
          </div>
          <button onClick={() => setStage('ring')} className="daily-btn rounded-2xl daily-grad text-white font-bold shadow-[0_4px_0_#3B0FA0]">{t.start}</button>
        </>}

        {stage === 'ring' && <>
          <DayScene day={hero} lang={lang} hour={hour} ringing onPhone={() => { setStage('call'); haptic(true); }} />
          <div className="daily-in flex items-center gap-2 text-sm text-muted-foreground"><Clock size={16} />{c.time} · {c.place[lang]}</div>
          <div className="daily-in rounded-3xl border-2 border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800 p-4 grid gap-1">
            <p className="flex items-center gap-2 font-semibold text-amber-800 dark:text-amber-200"><NotebookPen size={16} />{t.knows.replace('{n}', who)}</p>
            <p className="leading-relaxed">{c.note[lang]}</p>
          </div>
          <button onClick={() => { setStage('call'); haptic(true); }} className="daily-btn rounded-2xl bg-emerald-500 text-white font-bold flex items-center justify-center gap-2 shadow-[0_4px_0_#047857]"><Phone size={20} />{t.answer}</button>
        </>}

        {(stage === 'call' || stage === 'result') && <>
          {stage === 'call' && <DayScene day={hero} lang={lang} hour={hour} talking compact />}
          <div className={`rounded-[28px] bg-gradient-to-b from-slate-800 to-slate-900 text-white p-4 grid gap-3 shadow-lg ${stage === 'call' ? '-mt-14 relative z-10 mx-2' : ''}`}>
            <div className="flex items-center gap-3">
              <span className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center"><Phone size={22} /></span>
              <span className="flex-1 min-w-0">
                <span className="block font-bold text-lg leading-tight truncate">{c.caller[lang]}</span>
                <span className="block text-sm text-white/60 tabular-nums">{c.number}</span>
              </span>
            </div>
            {/* Sati's caller-ID badge: only says whether the number is saved, never whether it is safe. */}
            <span className={`inline-flex items-center gap-1.5 justify-self-start rounded-full px-2.5 py-1 text-xs font-semibold ${c.saved ? 'bg-emerald-400/20 text-emerald-200' : 'bg-white/10 text-white/80'}`}>
              <img src="/brand-mark.svg" alt="" className="w-4 h-4" />{c.saved ? t.in_contacts : t.not_contacts}
            </span>
            <div className="grid gap-2">
              {c.lines.slice(0, stage === 'result' ? c.lines.length : line + 1).map((x, i) => (
                <p key={i} className="daily-in rounded-2xl rounded-tl-sm bg-white/10 px-3 py-2 leading-relaxed">{x[lang]}</p>
              ))}
              {stage === 'call' && !heard && <p className="text-xs text-white/50 animate-pulse">{t.listen}</p>}
              {voice && mute && <p className="text-xs text-amber-200">{t.no_voice}</p>}
            </div>
          </div>

          {heard && <div className="grid gap-2">
            <div className="flex items-center justify-between gap-2"><p className="font-bold">{t.decide.replace('{n}', who)}</p><Combo n={combo} label={DT[lang].combo} /></div>
            {cfg.callSec > 0 && <Countdown key={c.id} seconds={cfg.callSec} onDone={() => choose(c.real ? 'hangup' : 'trust', true)} label={DT[lang].time_up} />}
            {moves.map((m, i) => { const Icon = MOVE_ICON[m]; return (
              <button key={m} onClick={() => choose(m)} className="daily-in daily-btn flex items-center gap-3 rounded-2xl border-2 border-border bg-card px-4 text-left font-semibold hover:border-primary" style={{ animationDelay: `${i * 0.06}s` }}>
                <Icon size={20} className="text-primary shrink-0" />{c.moves[m][lang]}
              </button>); })}
          </div>}

          {stage === 'result' && move && <div className="grid gap-3">
            <div className={`daily-pop relative rounded-2xl p-4 grid gap-1 ${verdict === 'lost' || verdict === 'missed' ? 'bg-red-50 dark:bg-red-950/40' : 'bg-emerald-50 dark:bg-emerald-950/40'}`}>
              {(verdict === 'good' || verdict === 'careful') && !late && <Burst />}
              {late && <p className="text-xs font-extrabold uppercase tracking-wide text-red-600 flex items-center gap-1"><Clock size={14} />{DT[lang].time_up}</p>}
              <p className="flex items-center gap-2 font-extrabold text-lg">
                {verdict === 'lost' || verdict === 'missed' ? <XCircle size={24} className="text-red-600 shrink-0" /> : <CheckCircle2 size={24} className="text-emerald-600 shrink-0" />}
                {verdict === 'lost' ? (c.stake ? `${t.lost} −${money(c.stake, lang)}` : t.unsafe) : t[verdict as 'good' | 'careful' | 'missed']}
              </p>
              <p className="text-sm font-semibold text-muted-foreground">{c.real ? t.was_real : t.was_scam}</p>
              <p className="text-sm leading-relaxed">{c.outcome[move][lang]}</p>
            </div>
            {/* Signs as tappable chips: the name is enough at a glance, the detail is one tap away. */}
            <div className="grid gap-2">
              <p className="text-sm font-semibold text-muted-foreground">{t.signs}</p>
              <div className="flex flex-wrap gap-2">
                {c.signs.map((id, i) => { const s = SIGNS.find(x => x.id === id)!; const Icon = s.icon; const on = openSign === id; return (
                  <button key={id} onClick={() => setOpenSign(on ? null : id)} aria-expanded={on} style={{ animationDelay: `${i * 0.08}s` }}
                    className={`daily-pop inline-flex items-center gap-1.5 rounded-full pl-1.5 pr-3 min-h-10 text-sm font-bold border-2 ${s.good ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-200' : 'bg-red-50 border-red-200 text-red-800 dark:bg-red-950/40 dark:border-red-800 dark:text-red-200'}`}>
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center ${s.good ? 'bg-emerald-500' : 'bg-red-500'} text-white`}><Icon size={15} /></span>{s.name[lang]}
                  </button>); })}
              </div>
              {openSign && <p className="daily-in text-sm rounded-xl bg-muted p-3">{SIGNS.find(x => x.id === openSign)!.body[lang]}</p>}
            </div>
            <div className="rounded-2xl daily-grad text-white p-4">
              <p className="text-xs uppercase tracking-wide opacity-80 flex items-center gap-1"><Lightbulb size={14} />{t.remember}</p>
              <p className="font-semibold mt-1 leading-snug">{c.remember[lang]}</p>
            </div>
            <button onClick={next} className="daily-btn rounded-2xl bg-foreground text-background font-bold">{ci + 1 >= day.length ? t.finish : t.next_call}</button>
          </div>}
        </>}

        {stage === 'end' && <>
          <DayScene day={hero} lang={lang} hour={20} />
          <div className="daily-pop rounded-3xl border border-border bg-card p-5 grid gap-3 text-center">
            <h2 className="text-2xl font-extrabold">{t.day_done}</h2>
            <div className="flex justify-center gap-2">{[1, 2, 3].map(k => { const on = right / day.length >= [0.4, 0.7, 1][k - 1]; return <Star key={k} size={44} className={`juice-star ${on ? 'text-amber-400' : 'text-muted-foreground/25'}`} fill="currentColor" style={{ animationDelay: `${0.15 + k * 0.18}s` }} />; })}</div>
            {right === day.length && <div className="relative h-0"><Burst count={30} /></div>}
            <p className="text-4xl font-extrabold text-primary tabular-nums">{right}/{day.length}</p>
            <p className="text-sm text-muted-foreground">{t.calls_ok}</p>
            <p className="flex items-center justify-center gap-2 font-semibold"><Wallet size={18} className="text-primary" />{t.balance}: {money(balance, lang)}</p>
            <div className="flex justify-center gap-1.5">
              {day.map(x => <span key={x.id} title={x.caller[lang]} className={`w-9 h-9 rounded-full flex items-center justify-center ${x.real ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>{x.real ? <BadgeCheck size={18} /> : <ShieldAlert size={18} />}</span>)}
            </div>
          </div>
          <button onClick={() => onFinish({ score: right, total: day.length, missed, failed: false, scenarioIds: [] })} className="daily-btn rounded-2xl daily-grad text-white font-bold shadow-[0_4px_0_#3B0FA0]">{DT[lang].done}</button>
        </>}
      </div>
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
      {onPhone && <button onClick={onPhone} aria-label="Answer phone" disabled={!ringing}
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
      {onPhone && <button onClick={onPhone} aria-label="Answer phone" disabled={!ringing}
        className={`absolute w-12 h-12 rounded-2xl bg-white text-primary border-2 border-primary flex items-center justify-center ${ringing ? 'call-ring' : ''}`} style={{ left: '24%', bottom: '19%' }}><Phone size={20} /></button>}
      {!onPhone && !thumb && <span className="absolute left-3 top-3 rounded-full bg-white/90 dark:bg-black/60 px-3 py-1 text-xs font-semibold flex items-center gap-1"><UserRound size={13} />{day.hero.name[lang]}, {day.hero.age}</span>}
    </div>
  );
}
