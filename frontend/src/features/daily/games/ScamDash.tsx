import { useEffect, useRef, useState } from 'react';
import { Pause, Play, Pencil, Trophy, MapPin, Heart, ArrowUp, ArrowDown, Repeat, ChevronDown, X, KeyRound, Link2, Banknote, Stamp, Timer, Gift, EyeOff, ShieldCheck, PhoneCall, Users, Lock, Turtle, Rabbit, Zap, Medal, Lightbulb, Search, CheckCircle2, XCircle, Hand, Flag, type LucideIcon } from 'lucide-react';
import mini from '../data/minigames.json';
import { MODES, factFor, routeFor, type ModeId, type Stop } from '../data/dashJourney';
import { DashAvatar } from '../components/DashAvatar';
import { DashScene, GROUND, Landmark } from '../components/DashScene';
import { TopBar, haptic } from '../components/ui';
import { ASEAN, EXTRAS, HAIRS, HAIR_COLORS, OUTFITS, PRESETS, SKINS, addScore, board, flagOf, getPlayer, savePlayer, type Player } from '../lib/dashPlayer';
import { DT } from '../i18n';
import { track } from '../lib/analytics';
import { load, save } from '../lib/storage';
import type { FlagCategory, Lang, QuickCard } from '../types';
import type { GameResult } from './StoryGame';

type Item = { id: string; label: { en: string; lo: string }; tip: { en: string; lo: string }; flag?: FlagCategory };
type Thing = { x: number; item: Item; good: boolean; air: boolean; done: boolean };
type Phase = 'setup' | 'lobby' | 'run' | 'gate' | 'over';

const hazards = mini.dashHazards as Item[];
const pickups = mini.dashPickups as Item[];
const cards = mini.quickfire as QuickCard[];
// Physics in px and ms. Ground traps need a jump; air pop-ups float at head height and need a duck.
const GRAVITY = 0.0034, JUMP = 0.95, FAST_FALL = -1.3, DUCK_MS = 560, PLAYER_X = 22, STOP_LEN = 350, HIT_X = 6;
// Air traps float just above a crouched runner (~55px) and below a standing one (~90px).
const AIR_TRAP = 60, AIR_PICK = 118, BASE = GROUND * 0.5, RUNNER = 72;
const ITEM_ICON: Record<string, LucideIcon> = { otp: KeyRound, link: Link2, fee: Banknote, passport: Stamp, rush: Timer, prize: Gift, secret: EyeOff, verify: ShieldCheck, call: PhoneCall, family: Users, lock: Lock };
const MODE_ICON: Record<ModeId, LucideIcon> = { easy: Turtle, normal: Rabbit, fast: Zap };
const ItemIcon = ({ id, size }: { id: string; size: number }) => { const I = ITEM_ICON[id] ?? Flag; return <I size={size} />; };
const pick = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];

const fresh = (mode: ModeId) => ({
  y: 0, vy: 0, jumps: 0, duck: 0, hurt: 0, things: [] as Thing[], dist: 0, stopDist: 0, stop: 0, lap: 1, hearts: MODES[mode].hearts as number,
  bonus: 0, nextAt: 40, step: 0, missed: [] as FlagCategory[], seen: [] as string[],
});

// Runner across an ASEAN country, north to south and looping: jump scam traps, duck scam pop-ups,
// grab safe habits, and answer a scam check at every landmark.
export function ScamDash({ lang, onExit, onFinish }: { lang: Lang; onExit: () => void; onFinish: (r: GameResult) => void }) {
  const t = DT[lang];
  const [player, setPlayer] = useState<Player | null>(getPlayer);
  const [phase, setPhase] = useState<Phase>(player ? 'lobby' : 'setup');
  const [mode, setMode] = useState<ModeId>(() => load<ModeId>('sati-dash-mode', 'normal'));
  const [routeCode, setRouteCode] = useState<string>(() => load<string>('sati-dash-route', player?.country ?? 'LA'));
  const [paused, setPaused] = useState(false);
  const [sheet, setSheet] = useState<'route' | 'mode' | null>(null);
  const [toast, setToast] = useState<{ item: Item; good: boolean; n: number } | null>(null);
  const [card, setCard] = useState<QuickCard | null>(null);
  const [answer, setAnswer] = useState<boolean | null>(null);
  const [banner, setBanner] = useState<string | null>(null);
  const [, force] = useState(0);
  const s = useRef(fresh(mode));
  const swipe = useRef<{ y: number; done: boolean } | null>(null);
  const g = s.current;
  const route = routeFor(routeCode);
  const score = Math.floor(g.dist) + g.bonus;
  const live = phase === 'run' && !paused;

  const jump = () => {
    if (!live) return;
    if (g.jumps < 2) { g.vy = JUMP * (g.jumps ? 0.82 : 1); g.jumps++; g.duck = 0; navigator.vibrate?.(8); }
  };
  const duck = () => {
    if (!live) return;
    g.duck = DUCK_MS;
    if (g.y > 0) g.vy = FAST_FALL;
  };

  const finishRun = () => {
    if (player) addScore(player, Math.floor(g.dist) + g.bonus);
    setPhase('over');
  };

  useEffect(() => {
    if (!banner) return;
    const id = setTimeout(() => setBanner(null), 2600);
    return () => clearTimeout(id);
  }, [banner]);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 2400);
    return () => clearTimeout(id);
  }, [toast]);

  useEffect(() => {
    if (!live) return;
    const key = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') { e.preventDefault(); if (!e.repeat) jump(); }
      if (e.code === 'ArrowDown') { e.preventDefault(); duck(); }
    };
    window.addEventListener('keydown', key);
    let raf = 0, last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(40, now - last); last = now;
      const speed = MODES[mode].speed * (1 + 0.15 * (g.lap - 1));
      g.vy -= GRAVITY * dt; g.y = Math.max(0, g.y + g.vy * dt);
      if (g.y === 0) { g.vy = 0; g.jumps = 0; }
      g.duck = Math.max(0, g.duck - dt); g.hurt = Math.max(0, g.hurt - dt);
      g.dist += speed * dt; g.stopDist += speed * dt; g.step += dt * 0.6 * speed;
      if (g.dist > g.nextAt && g.stopDist < STOP_LEN - 40) {
        const good = Math.random() < 0.3;
        // Air pop-ups only after the first stretch, so new players learn the jump first.
        const air = good ? Math.random() < 0.5 : g.dist > 80 && Math.random() < 0.35;
        g.things.push({ x: 110, good, air, item: pick(good ? pickups : hazards), done: false });
        g.nextAt = g.dist + 32 + Math.random() * 34;
      }
      const ducking = g.duck > 0 && g.y < 10;
      for (const o of g.things) {
        o.x -= speed * dt * 1.6;
        if (o.done || Math.abs(o.x - PLAYER_X) > HIT_X) continue;
        const touching = o.good ? (o.air ? g.y > 60 : g.y < 50) : (o.air ? !ducking && g.y < AIR_TRAP + 50 : g.y < 38);
        if (!touching) continue;
        o.done = true;
        if (o.good) { g.bonus += 50; haptic(true); setToast({ item: o.item, good: true, n: Date.now() }); continue; }
        g.hearts--; g.hurt = 700; haptic(false); setToast({ item: o.item, good: false, n: Date.now() });
        if (o.item.flag) g.missed.push(o.item.flag);
        track({ type: 'flag_missed', scenarioId: 'dash', flag: o.item.id });
        if (g.hearts <= 0) { finishRun(); return; }
      }
      g.things = g.things.filter(o => o.x > -12);
      if (g.stopDist >= STOP_LEN) {
        const unseen = cards.filter(c => !g.seen.includes(c.id));
        const c = pick(unseen.length ? unseen : cards);
        g.seen.push(c.id); setCard(c); setAnswer(null); setPhase('gate');
        return;
      }
      force(n => n + 1);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('keydown', key); };
  }, [live, mode]); // eslint-disable-line react-hooks/exhaustive-deps

  const start = () => {
    s.current = fresh(mode); save('sati-dash-mode', mode); save('sati-dash-route', routeCode);
    setToast(null); setPaused(false); setPhase('run');
  };

  // Leaving the gate moves to the next landmark; after the last one the route loops, faster.
  const nextStop = () => {
    g.stop = (g.stop + 1) % route.length;
    if (g.stop === 0) { g.lap++; setBanner(t.dash_new_round.replace('{n}', String(g.lap))); }
    g.stopDist = 0; g.things = []; g.nextAt = g.dist + 20;
    setToast(null); setPhase('run');
  };

  const answerGate = (saysScam: boolean) => {
    if (!card || answer !== null) return;
    const ok = saysScam === card.isScam;
    setAnswer(saysScam); haptic(ok);
    track({ type: 'choice_made', scenarioId: `dash-${card.id}`, scamType: card.scamType, step: card.id, correct: ok });
    if (ok) { g.bonus += 300; g.hearts = Math.min(MODES[mode].hearts, g.hearts + 1); }
  };

  if (phase === 'setup' || !player) return (
    <PlayerSetup lang={lang} initial={player} onExit={player ? () => setPhase('lobby') : onExit}
      onSave={p => { savePlayer(p); setPlayer(p); if (!player) setRouteCode(p.country); setPhase('lobby'); }} />
  );

  const countryName = ASEAN.find(c => c.code === routeCode)?.name[lang] ?? '';

  if (phase === 'lobby') return (
    <div className="flex flex-col h-full">
      <TopBar onBack={onExit} lang={lang}><span className="font-bold font-lao">{t.g_dash}</span></TopBar>
      <div className="flex-1 overflow-y-auto p-4 grid gap-5 content-start font-lao">
        <div className="relative h-44 rounded-3xl overflow-hidden shadow-md">
          <DashScene scene={route[0].scene} kind={route[0].kind} dist={0} progress={0.5} />
          <div className="absolute left-4" style={{ bottom: `${BASE}%` }}><DashAvatar a={player.avatar} size={60} pose="stand" /></div>
          <button onClick={() => setPhase('setup')} aria-label={t.dash_edit} className="absolute top-3 right-3 w-11 h-11 rounded-full bg-white/90 dark:bg-black/60 shadow flex items-center justify-center"><Pencil size={18} /></button>
        </div>
        <div className="-mt-2">
          <p className="text-lg font-bold truncate">{flagOf(player.country)} {player.name}</p>
          <p className="text-sm text-muted-foreground leading-snug">{t.dash_route.replace('{c}', countryName)}</p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button onClick={() => setSheet('route')} className="flex items-center gap-2 rounded-2xl border-2 border-border bg-card px-3 min-h-14 text-left">
            <span className="text-2xl">{flagOf(routeCode)}</span>
            <span className="flex-1 min-w-0"><span className="block text-[11px] text-muted-foreground">{t.dash_pick}</span><span className="block font-bold truncate">{countryName}</span></span>
            <ChevronDown size={18} className="text-muted-foreground shrink-0" />
          </button>
          <button onClick={() => setSheet('mode')} className="flex items-center gap-2 rounded-2xl border-2 border-border bg-card px-3 min-h-14 text-left">
            <span className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">{(() => { const I = MODE_ICON[mode]; return <I size={20} />; })()}</span>
            <span className="flex-1 min-w-0"><span className="block text-[11px] text-muted-foreground">{t.dash_mode}</span><span className="block font-bold truncate">{t[`mode_${mode}`]}</span></span>
            <ChevronDown size={18} className="text-muted-foreground shrink-0" />
          </button>
        </div>

        <ol className="flex gap-2 overflow-x-auto -mx-4 px-4 pb-1 min-h-[7.5rem]">
          {route.map((st, i) => <StopCard key={st.id} stop={st} n={i + 1} lang={lang} />)}
          <li className="shrink-0 w-16 flex flex-col items-center justify-center text-muted-foreground text-xs gap-1"><Repeat size={22} />{t.dash_lap} 2</li>
        </ol>

        <button onClick={start} className="daily-btn rounded-2xl daily-grad text-white text-lg font-bold shadow-[0_4px_0_#3B0FA0] flex items-center justify-center gap-2"><Play size={20} fill="currentColor" />{t.dash_go}</button>
        <Ranking lang={lang} />
      </div>
      {sheet && <Sheet title={sheet === 'route' ? t.dash_pick : t.dash_mode} onClose={() => setSheet(null)}>
        {sheet === 'route'
          ? <div className="grid grid-cols-3 gap-2">
              {ASEAN.map(c => (
                <button key={c.code} onClick={() => { setRouteCode(c.code); setSheet(null); }} aria-pressed={routeCode === c.code}
                  className={`rounded-2xl border-2 p-2 min-h-16 ${routeCode === c.code ? 'border-primary bg-primary/10 font-bold' : 'border-border bg-card'}`}>
                  <span className="block text-2xl">{c.flag}</span><span className="block text-xs leading-tight">{c.name[lang]}</span>
                  <span className="flex items-center justify-center gap-0.5 text-[10px] text-muted-foreground">{routeFor(c.code).length}<MapPin size={10} /></span>
                </button>
              ))}
            </div>
          : <div className="grid gap-2">
              {(Object.keys(MODES) as ModeId[]).map(m => (
                <button key={m} onClick={() => { setMode(m); setSheet(null); }} aria-pressed={mode === m}
                  className={`flex items-center gap-3 rounded-2xl border-2 px-3 min-h-16 text-left ${mode === m ? 'border-primary bg-primary/10' : 'border-border bg-card'}`}>
                  <span className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center">{(() => { const I = MODE_ICON[m]; return <I size={24} />; })()}</span>
                  <span className="flex-1"><span className="block font-bold">{t[`mode_${m}`]}</span><span className="block text-xs text-muted-foreground">{t[`mode_${m}_d`]}</span></span>
                </button>
              ))}
            </div>}
      </Sheet>}
    </div>
  );

  if (phase === 'over') {
    const { players, countries } = board();
    const rank = players.findIndex(e => e.me && e.score === score && e.name === player.name) + 1;
    const cRank = countries.findIndex(c => c.code === player.country) + 1;
    const at = route[g.stop];
    return (
      <div className="flex flex-col h-full">
        <TopBar onBack={onExit} lang={lang}><span className="font-bold font-lao">{t.dash_over}</span></TopBar>
        <div className="flex-1 overflow-y-auto p-4 grid gap-4 content-start font-lao">
          <div className="daily-pop relative h-48 rounded-3xl overflow-hidden shadow-md">
            <DashScene scene={at.scene} kind={at.kind} dist={0} progress={0.45} />
            <div className="absolute left-5" style={{ bottom: `${BASE}%` }}><DashAvatar a={player.avatar} size={64} pose="jump" /></div>
            <div className="absolute top-3 right-3 rounded-2xl bg-white/90 dark:bg-black/60 px-4 py-2 text-right shadow">
              <p className="text-3xl font-bold text-primary tabular-nums leading-none">{score}</p>
              <p className="text-xs text-muted-foreground mt-1">{t.dash_lap} {g.lap} · {at.name[lang]}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-muted p-3 text-center"><p className="text-xs text-muted-foreground">{t.dash_your_rank}</p><p className="text-2xl font-bold">#{rank || '–'}</p></div>
            <div className="rounded-2xl bg-muted p-3 text-center"><p className="text-xs text-muted-foreground">{flagOf(player.country)} {t.rank_countries}</p><p className="text-2xl font-bold">#{cRank}</p></div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={start} className="daily-btn rounded-2xl daily-grad text-white font-bold shadow-[0_4px_0_#3B0FA0]">{t.play_again}</button>
            <button onClick={() => onFinish({ score, total: 0, missed: g.missed, failed: g.hearts <= 0, scenarioIds: [] })} className="daily-btn rounded-2xl bg-muted font-semibold">{t.dash_done}</button>
          </div>
          <Ranking lang={lang} />
        </div>
      </div>
    );
  }

  const stop = route[g.stop];
  const pose = g.duck > 0 && g.y < 10 ? 'duck' : g.y > 0 ? 'jump' : 'run';
  const onDown = (e: React.PointerEvent) => { swipe.current = { y: e.clientY, done: false }; };
  const onMove = (e: React.PointerEvent) => {
    const sw = swipe.current;
    if (!sw || sw.done) return;
    const dy = e.clientY - sw.y;
    if (dy > 28) { sw.done = true; duck(); } else if (dy < -28) { sw.done = true; jump(); }
  };
  const onUp = () => { if (swipe.current && !swipe.current.done) jump(); swipe.current = null; };

  // The run covers the whole app (bottom nav included) so the game gets the full screen.
  return (
    <div className="fixed inset-0 z-50 mx-auto w-full max-w-md flex flex-col bg-background select-none pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
      <TopBar onBack={onExit} lang={lang}>
        <span className="font-bold tabular-nums flex items-center gap-1"><Trophy size={18} className="text-amber-500" />{score}</span>
        <span className={`flex items-center gap-0.5 ${g.hurt ? 'daily-shake' : ''}`} aria-label={`${g.hearts}`}>
          {Array.from({ length: MODES[mode].hearts }, (_, i) => <Heart key={i} size={20} className={i < g.hearts ? 'text-rose-500' : 'text-muted-foreground/30'} fill="currentColor" />)}
        </span>
        <button onClick={() => setPaused(p => !p)} aria-label={paused ? t.dash_resume : t.dash_pause} className="w-11 h-11 rounded-full bg-muted flex items-center justify-center">{paused ? <Play size={18} /> : <Pause size={18} />}</button>
      </TopBar>

      <div onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={() => { swipe.current = null; }}
        className="relative flex-1 overflow-hidden touch-none cursor-pointer">
        <div key={`${routeCode}-${stop.id}`} className="daily-fade absolute inset-0">
          <DashScene scene={stop.scene} kind={stop.kind} dist={g.dist} progress={g.stopDist / STOP_LEN} />
        </div>
        {g.hurt > 0 && <div className="absolute inset-0 pointer-events-none bg-red-500/15" />}

        <div className="absolute top-2 inset-x-2 flex items-center gap-2 rounded-full bg-white/90 dark:bg-black/60 backdrop-blur px-3 py-1.5 text-xs font-lao shadow">
          <MapPin size={14} className="text-primary shrink-0" />
          <span className="font-bold truncate max-w-[45%]">{stop.name[lang]}</span>
          <div className="flex-1 h-2 rounded-full bg-black/10 overflow-hidden"><div className="h-full daily-grad" style={{ width: `${(g.stopDist / STOP_LEN) * 100}%` }} /></div>
          <span className="font-bold whitespace-nowrap">{t.dash_stop} {g.stop + 1}/{route.length}{g.lap > 1 ? ` · ${t.dash_lap} ${g.lap}` : ''}</span>
        </div>

        {g.things.map((o, k) => (
          <div key={k} className={`absolute -translate-x-1/2 flex flex-col items-center transition-[opacity,transform] duration-200 ${o.done ? 'opacity-0 scale-150' : ''}`}
            style={{ left: `${o.x}%`, bottom: `calc(${BASE}% + ${o.air ? (o.good ? AIR_PICK : AIR_TRAP) : 0}px)` }}>
            {o.good
              ? <span className="daily-float w-10 h-10 rounded-full flex items-center justify-center text-emerald-700 bg-gradient-to-b from-emerald-50 to-emerald-200 ring-[3px] ring-emerald-400 shadow-[0_0_16px_rgba(52,211,153,.8)]"><ItemIcon id={o.item.id} size={20} /></span>
              : o.air
                // Flying pop-up: looks like a phone notification hovering at head height.
                ? <span className="dash-hover flex items-center gap-1.5 rounded-xl bg-white pl-1 pr-2 py-1 shadow-lg ring-2 ring-red-500">
                    <span className="w-7 h-7 rounded-lg bg-red-100 text-red-600 flex items-center justify-center"><ItemIcon id={o.item.id} size={16} /></span>
                    <span className="text-[11px] font-bold text-red-600 font-lao whitespace-nowrap">{o.item.label[lang]}</span>
                  </span>
                // Ground trap: a roadside sign on two legs, knee-to-waist high next to the runner.
                : <span className="flex flex-col items-center">
                    <span className="flex items-center gap-1 rounded-lg bg-white px-1.5 py-1 shadow-md ring-2 ring-red-500">
                      <span className="text-red-600"><ItemIcon id={o.item.id} size={15} /></span>
                      <span className="text-[10px] font-bold text-red-700 font-lao whitespace-nowrap">{o.item.label[lang]}</span>
                    </span>
                    <span className="flex gap-5 -mt-px"><span className="w-1 h-4 rounded-b bg-zinc-600" /><span className="w-1 h-4 rounded-b bg-zinc-600" /></span>
                  </span>}
          </div>
        ))}

        <div className="absolute -translate-x-1/2 pointer-events-none" style={{ left: `${PLAYER_X}%`, bottom: `${BASE}%` }}>
          <div className="absolute left-1/2 -translate-x-1/2 -bottom-1 h-2.5 rounded-full bg-black/30 blur-[1px]" style={{ width: `${54 - Math.min(g.y, 120) / 5}px` }} />
          <div className={g.hurt && Math.floor(g.hurt / 100) % 2 ? 'opacity-40' : ''} style={{ transform: `translateY(${-g.y}px)${pose === 'duck' ? ' scaleY(.82)' : ''}`, transformOrigin: 'bottom' }}>
            <DashAvatar a={player.avatar} size={RUNNER} step={g.step} pose={pose} />
          </div>
        </div>

        {g.dist === 0 && !paused && phase === 'run' && <div className="daily-in absolute inset-x-4 top-14 rounded-2xl bg-white/95 dark:bg-black/75 p-3 text-center font-lao shadow-lg grid gap-1">
          <p className="font-bold flex items-center justify-center gap-1.5"><Hand size={16} className="text-primary" />{t.dash_tap}</p><p className="text-sm">{t.dash_jump2}</p>
          <p className="text-xs text-muted-foreground flex items-center justify-center gap-3">
            <span className="flex items-center gap-1"><ShieldCheck size={14} className="text-emerald-600" />{t.dash_legend_good} +50</span>
            <span className="flex items-center gap-1"><Flag size={14} className="text-red-600" />{t.dash_legend_trap} −1<Heart size={12} className="text-rose-500" fill="currentColor" /></span>
          </p>
        </div>}
        {toast && <div key={toast.n} className={`daily-pop absolute top-12 inset-x-3 rounded-2xl bg-card/95 backdrop-blur border-2 p-3 text-sm font-lao shadow-lg ${toast.good ? 'border-emerald-400' : 'border-red-400'}`}>
          <b className="inline-flex items-center gap-1 align-middle"><span className={toast.good ? 'text-emerald-600' : 'text-red-600'}><ItemIcon id={toast.item.id} size={16} /></span>{toast.good ? t.dash_got : t.dash_hit}: {toast.item.label[lang]}</b> · {toast.item.tip[lang]}
        </div>}
        {banner && <div className="daily-pop absolute inset-x-6 top-24 rounded-2xl daily-grad text-white text-center font-bold p-3 shadow-lg font-lao flex items-center justify-center gap-2"><Repeat size={18} />{banner}</div>}
        {paused && <div onPointerDown={e => e.stopPropagation()} onPointerUp={e => e.stopPropagation()} className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-3 p-6">
          <button onClick={() => setPaused(false)} className="daily-btn w-full max-w-xs rounded-2xl daily-grad text-white font-bold">{t.dash_resume}</button>
          <button onClick={() => { setPaused(false); finishRun(); }} className="daily-btn w-full max-w-xs rounded-2xl bg-white text-foreground font-semibold">{t.dash_end_run}</button>
        </div>}
        {phase === 'gate' && card && <div onPointerDown={e => e.stopPropagation()} onPointerUp={e => e.stopPropagation()} className="absolute inset-0 bg-black/55 flex items-end sm:items-center justify-center p-3">
          <div className="daily-pop w-full max-w-sm rounded-3xl bg-card p-4 grid gap-3 font-lao max-h-full overflow-y-auto">
            <div className="relative h-32 -mx-4 -mt-4 rounded-t-3xl overflow-hidden" style={{ background: `linear-gradient(${stop.scene.sky[0]},${stop.scene.sky[1]})` }}>
              <div className="absolute left-1/2 -translate-x-1/2 bottom-0 h-full aspect-square"><Landmark kind={stop.kind} /></div>
              <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/60 to-transparent"><p className="text-white font-bold flex items-center gap-1"><MapPin size={16} />{t.dash_arrived} {stop.name[lang]}!</p></div>
            </div>
            <p className="text-sm bg-amber-50 dark:bg-amber-950/40 rounded-xl p-2 flex gap-2"><Lightbulb size={16} className="text-amber-500 shrink-0 mt-0.5" /><span>{factFor(stop, g.stop + g.lap)[lang]}</span></p>
            <p className="font-bold flex items-center gap-1.5"><Search size={16} className="text-primary" />{t.dash_gate}: {t.dash_gate_q}</p>
            <div className="rounded-2xl bg-muted p-3"><p className="text-xs text-muted-foreground">{card.sender}</p><p>{card.text[lang]}</p></div>
            {answer === null
              ? <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => answerGate(true)} className="daily-btn rounded-2xl bg-red-500 text-white font-bold text-lg flex items-center justify-center gap-2"><Flag size={18} />{t.scam}</button>
                  <button onClick={() => answerGate(false)} className="daily-btn rounded-2xl bg-emerald-500 text-white font-bold text-lg flex items-center justify-center gap-2"><ShieldCheck size={18} />{t.safe}</button>
                </div>
              : <>
                  <p className={`daily-in rounded-xl p-2 text-sm ${answer === card.isScam ? 'bg-emerald-50 dark:bg-emerald-950/40' : 'bg-red-50 dark:bg-red-950/40'}`}>
                    <b className="inline-flex items-center gap-1 align-middle">{answer === card.isScam ? <CheckCircle2 size={16} className="text-emerald-600" /> : <XCircle size={16} className="text-red-600" />}{answer === card.isScam ? t.dash_gate_ok : t.dash_gate_bad}</b> {card.why[lang]}
                  </p>
                  <button onClick={nextStop} className="daily-btn rounded-2xl daily-grad text-white font-bold">{t.dash_continue} →</button>
                </>}
          </div>
        </div>}
      </div>

      <div className="shrink-0 grid grid-cols-2 gap-3 p-3 bg-background border-t border-border font-lao">
        <button onPointerDown={e => { e.preventDefault(); duck(); }} className="daily-btn rounded-2xl bg-muted font-bold text-lg flex items-center justify-center gap-2 active:bg-primary/15"><ArrowDown size={22} />{t.dash_duck}</button>
        <button onPointerDown={e => { e.preventDefault(); jump(); }} className="daily-btn rounded-2xl daily-grad text-white font-bold text-lg flex items-center justify-center gap-2 shadow-[0_4px_0_#3B0FA0]"><ArrowUp size={22} />{t.dash_jump}</button>
      </div>
    </div>
  );
}

// Small bottom sheet so pickers stay hidden until asked for.
function Sheet({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 mx-auto max-w-md flex items-end bg-black/40 daily-fade" onClick={onClose}>
      <div className="daily-in w-full rounded-t-3xl bg-background p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] grid gap-3 font-lao max-h-[80%] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between"><h3 className="font-bold text-lg">{title}</h3>
          <button onClick={onClose} aria-label="Close" className="w-10 h-10 rounded-full bg-muted flex items-center justify-center"><X size={18} /></button></div>
        {children}
      </div>
    </div>
  );
}

function StopCard({ stop, n, lang }: { stop: Stop; n: number; lang: Lang }) {
  return (
    <li className="shrink-0 w-28">
      <div className="relative h-20 rounded-2xl overflow-hidden border border-border" style={{ background: `linear-gradient(${stop.scene.sky[0]},${stop.scene.sky[1]})` }}>
        <div className="absolute inset-x-0 bottom-0 h-3" style={{ background: stop.scene.grass }} />
        <div className="absolute left-1/2 -translate-x-1/2 bottom-1 h-[90%] aspect-square"><Landmark kind={stop.kind} /></div>
        <span className="absolute top-1 left-1 w-5 h-5 rounded-full bg-white/90 text-[11px] font-bold flex items-center justify-center shadow">{n}</span>
      </div>
      <p className="text-[11px] leading-tight mt-1 line-clamp-2">{stop.name[lang]}</p>
    </li>
  );
}

function PlayerSetup({ lang, initial, onSave, onExit }: { lang: Lang; initial: Player | null; onSave: (p: Player) => void; onExit: () => void }) {
  const t = DT[lang];
  const [p, setP] = useState<Player>(initial ?? { name: '', country: 'LA', avatar: { skin: 1, hair: 0, outfit: 0, extra: 0 } });
  const set = (k: keyof Player['avatar'], v: number) => setP({ ...p, avatar: { ...p.avatar, [k]: v } });
  const swatch = (on: boolean) => `shrink-0 w-11 h-11 rounded-full ring-offset-2 ring-offset-background transition-transform ${on ? 'ring-4 ring-primary scale-105' : 'ring-1 ring-border'}`;
  const tile = (on: boolean) => `w-14 h-14 rounded-2xl border-2 flex items-center justify-center ${on ? 'border-primary bg-primary/10' : 'border-border bg-card'}`;
  const route = routeFor(p.country);
  return (
    <div className="flex flex-col h-full">
      <TopBar onBack={onExit} lang={lang}><span className="font-bold font-lao">{t.dash_create}</span></TopBar>
      <div className="flex-1 overflow-y-auto p-4 grid gap-5 content-start font-lao">
        <div className="relative h-44 rounded-3xl overflow-hidden shadow-md">
          <DashScene scene={route[0].scene} kind={route[0].kind} dist={0} progress={0.5} />
          <div key={JSON.stringify(p.avatar)} className="daily-pop absolute left-1/2 -translate-x-1/2" style={{ bottom: `${BASE}%` }}><DashAvatar a={p.avatar} size={80} pose="stand" /></div>
        </div>
        <label className="grid gap-1.5"><span className="font-bold">{t.dash_name}</span>
          <input value={p.name} maxLength={16} onChange={e => setP({ ...p, name: e.target.value })} className="rounded-2xl border-2 border-border bg-card px-4 min-h-12 text-lg focus:border-primary outline-none" />
        </label>
        <div className="grid gap-1.5"><p className="font-bold">{t.dash_country}</p>
          <div className="grid grid-cols-4 gap-2">
            {ASEAN.map(c => (
              <button key={c.code} onClick={() => setP({ ...p, country: c.code })} aria-pressed={p.country === c.code}
                className={`rounded-2xl border-2 p-1 min-h-16 ${p.country === c.code ? 'border-primary bg-primary/10' : 'border-border bg-card'}`}>
                <span className="block text-2xl">{c.flag}</span><span className="block text-[11px] leading-tight">{c.name[lang]}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="grid gap-2"><p className="font-bold">{t.dash_char}</p>
          <div className="flex gap-2 overflow-x-auto -mx-4 px-4 pb-1 min-h-[4.5rem]">{PRESETS.map((a, i) => <button key={i} aria-label={`runner ${i + 1}`} onClick={() => setP({ ...p, avatar: a })} className={`${tile(JSON.stringify(p.avatar) === JSON.stringify(a))} shrink-0 w-16 h-16 items-end overflow-hidden`}><DashAvatar a={a} size={44} pose="stand" /></button>)}</div>
        </div>
        <div className="grid gap-3"><p className="font-bold">{t.dash_look}</p>
          <Row label={t.dash_skin}>{SKINS.map((c, i) => <button key={c} aria-label={`skin ${i + 1}`} onClick={() => set('skin', i)} className={swatch(p.avatar.skin === i)} style={{ background: c }} />)}</Row>
          <Row label={t.dash_hair}>{Array.from({ length: HAIRS }, (_, i) => <button key={i} aria-label={`hair ${i + 1}`} onClick={() => set('hair', i)} className={`${tile(p.avatar.hair === i)} shrink-0 items-end overflow-hidden`}><DashAvatar a={{ ...p.avatar, hair: i, extra: 0 }} size={38} pose="stand" /></button>)}</Row>
          <Row label={t.dash_hair_c}>{HAIR_COLORS.map((c, i) => <button key={c} aria-label={`hair colour ${i + 1}`} onClick={() => set('hairColor', i)} className={swatch((p.avatar.hairColor ?? 0) === i)} style={{ background: c }} />)}</Row>
          <Row label={t.dash_outfit}>{OUTFITS.map((c, i) => <button key={c} aria-label={`outfit ${i + 1}`} onClick={() => set('outfit', i)} className={swatch(p.avatar.outfit === i)} style={{ background: c }} />)}</Row>
          <Row label={t.dash_extra}>{Array.from({ length: EXTRAS }, (_, i) => <button key={i} aria-label={`extra ${i + 1}`} onClick={() => set('extra', i)} className={`${tile(p.avatar.extra === i)} shrink-0 items-end overflow-hidden`}>{i ? <DashAvatar a={{ ...p.avatar, extra: i }} size={38} pose="stand" /> : <X size={18} className="self-center text-muted-foreground" />}</button>)}</Row>
        </div>
        <button disabled={!p.name.trim()} onClick={() => onSave({ ...p, name: p.name.trim() })} className="daily-btn rounded-2xl daily-grad text-white font-bold disabled:opacity-40 shadow-[0_4px_0_#3B0FA0]">{t.dash_save}</button>
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="grid gap-1"><span className="text-xs text-muted-foreground">{label}</span><div className="flex gap-2.5 overflow-x-auto -mx-4 px-5 py-1.5">{children}</div></div>;
}

function Ranking({ lang }: { lang: Lang }) {
  const t = DT[lang];
  const [tab, setTab] = useState<'players' | 'countries'>('countries');
  const { players, countries } = board();
  const medal = (i: number) => i < 3 ? <Medal size={18} className={['text-amber-500', 'text-slate-400', 'text-orange-700'][i]} /> : i + 1;
  return (
    <section className="rounded-3xl border border-border bg-card p-3 font-lao">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-bold flex items-center gap-1"><Trophy size={18} className="text-amber-500" />{t.dash_rank}</h3>
        <div className="flex rounded-full bg-muted p-0.5 text-xs">
          {(['countries', 'players'] as const).map(k => <button key={k} onClick={() => setTab(k)} className={`rounded-full px-3 min-h-9 ${tab === k ? 'bg-card shadow font-bold' : ''}`}>{t[`rank_${k}`]}</button>)}
        </div>
      </div>
      <ol className="grid gap-1">
        {tab === 'countries'
          ? countries.map((c, i) => (
              <li key={c.code} className="flex items-center gap-2 rounded-xl px-2 py-1.5 odd:bg-muted/50">
                <span className="w-7 flex justify-center font-bold">{medal(i)}</span><span className="text-xl">{c.flag}</span>
                <span className="flex-1">{c.name[lang]}</span><span className="font-bold tabular-nums">{c.score}</span>
              </li>))
          : players.slice(0, 15).map((e, i) => (
              <li key={i} className={`flex items-center gap-2 rounded-xl px-2 py-1.5 ${e.me ? 'bg-primary/15 font-bold' : 'odd:bg-muted/50'}`}>
                <span className="w-7 flex justify-center font-bold">{medal(i)}</span>
                {e.avatar ? <DashAvatar a={e.avatar} size={22} pose="stand" /> : <span className="text-xl">{flagOf(e.country)}</span>}
                <span className="flex-1 truncate">{e.name}{e.me ? ` (${t.you})` : ''} {e.avatar && flagOf(e.country)}</span>
                <span className="tabular-nums">{e.score}</span>
              </li>))}
      </ol>
    </section>
  );
}
