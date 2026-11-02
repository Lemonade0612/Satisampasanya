import { useEffect, useRef, useState } from 'react';
import { Pause, Play, Pencil, Trophy, MapPin, Heart } from 'lucide-react';
import mini from '../data/minigames.json';
import { STOPS, MODES, type ModeId } from '../data/dashJourney';
import { DashAvatar } from '../components/DashAvatar';
import { TopBar, haptic } from '../components/ui';
import { ASEAN, EXTRAS, HAIRS, OUTFITS, SKINS, addScore, board, flagOf, getPlayer, savePlayer, type Player } from '../lib/dashPlayer';
import { DT } from '../i18n';
import { track } from '../lib/analytics';
import { load, save } from '../lib/storage';
import type { FlagCategory, Lang, QuickCard } from '../types';
import type { GameResult } from './StoryGame';

type Item = { id: string; icon: string; label: { en: string; lo: string }; tip: { en: string; lo: string }; flag?: FlagCategory };
type Thing = { x: number; item: Item; good: boolean; air: boolean; done: boolean };
type Phase = 'setup' | 'lobby' | 'run' | 'gate' | 'over';

const hazards = mini.dashHazards as Item[];
const pickups = mini.dashPickups as Item[];
const cards = mini.quickfire as QuickCard[];
const GRAVITY = 0.0028, JUMP = 0.95, PLAYER_X = 18, STOP_LEN = 350, PX = 7;
const pick = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];

const fresh = (mode: ModeId) => ({
  y: 0, vy: 0, jumps: 0, things: [] as Thing[], dist: 0, stopDist: 0, stop: 0, lap: 1, hearts: MODES[mode].hearts as number,
  bonus: 0, nextAt: 40, step: 0, missed: [] as FlagCategory[], seen: [] as string[],
});

// Runner across Laos, north to south and looping: jump scam traps, grab safe habits, answer a scam check at every stop.
export function ScamDash({ lang, onExit, onFinish }: { lang: Lang; onExit: () => void; onFinish: (r: GameResult) => void }) {
  const t = DT[lang];
  const [player, setPlayer] = useState<Player | null>(getPlayer);
  const [phase, setPhase] = useState<Phase>(player ? 'lobby' : 'setup');
  const [mode, setMode] = useState<ModeId>(() => load<ModeId>('sati-dash-mode', 'normal'));
  const [paused, setPaused] = useState(false);
  const [toast, setToast] = useState<{ item: Item; good: boolean; n: number } | null>(null);
  const [card, setCard] = useState<QuickCard | null>(null);
  const [answer, setAnswer] = useState<boolean | null>(null);
  const [, force] = useState(0);
  const s = useRef(fresh(mode));
  const g = s.current;
  const score = Math.floor(g.dist) + g.bonus;

  const jump = () => {
    if (phase !== 'run' || paused) return;
    if (g.jumps < 2) { g.vy = JUMP * (g.jumps ? 0.8 : 1); g.jumps++; navigator.vibrate?.(8); }
  };

  const finishRun = () => {
    if (player) addScore(player, Math.floor(g.dist) + g.bonus);
    setPhase('over');
  };

  useEffect(() => {
    if (phase !== 'run' || paused) return;
    const key = (e: KeyboardEvent) => { if (e.code === 'Space' || e.code === 'ArrowUp') { e.preventDefault(); jump(); } };
    window.addEventListener('keydown', key);
    let raf = 0, last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(40, now - last); last = now;
      const speed = MODES[mode].speed * (1 + 0.15 * (g.lap - 1));
      g.vy -= GRAVITY * dt; g.y = Math.max(0, g.y + g.vy * dt * 0.06);
      if (g.y === 0) { g.vy = 0; g.jumps = 0; }
      g.dist += speed * dt; g.stopDist += speed * dt; g.step += dt * 0.02;
      if (g.dist > g.nextAt && g.stopDist < STOP_LEN - 40) {
        const good = Math.random() < 0.3;
        g.things.push({ x: 105, good, air: good && Math.random() < 0.5, item: pick(good ? pickups : hazards), done: false });
        g.nextAt = g.dist + 30 + Math.random() * 35;
      }
      for (const o of g.things) {
        o.x -= speed * dt * 1.6;
        if (o.done || Math.abs(o.x - PLAYER_X) > 5) continue;
        if (o.good && (o.air ? g.y > 4 : g.y < 4)) {
          o.done = true; g.bonus += 50; haptic(true); setToast({ item: o.item, good: true, n: Date.now() });
        } else if (!o.good && g.y < 3.5) {
          o.done = true; g.hearts--; haptic(false); setToast({ item: o.item, good: false, n: Date.now() });
          if (o.item.flag) g.missed.push(o.item.flag);
          track({ type: 'flag_missed', scenarioId: 'dash', flag: o.item.id });
          if (g.hearts <= 0) { finishRun(); return; }
        }
      }
      g.things = g.things.filter(o => o.x > -10);
      if (g.stopDist >= STOP_LEN) {
        g.stop = (g.stop + 1) % STOPS.length;
        if (g.stop === 0) g.lap++;
        g.stopDist = 0; g.things = [];
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
  }, [phase, paused, mode]); // eslint-disable-line react-hooks/exhaustive-deps

  const start = () => { s.current = fresh(mode); save('sati-dash-mode', mode); setToast(null); setPaused(false); setPhase('run'); };

  const answerGate = (saysScam: boolean) => {
    if (!card || answer !== null) return;
    const ok = saysScam === card.isScam;
    setAnswer(saysScam); haptic(ok);
    track({ type: 'choice_made', scenarioId: `dash-${card.id}`, scamType: card.scamType, step: card.id, correct: ok });
    if (ok) { g.bonus += 300; g.hearts = Math.min(MODES[mode].hearts, g.hearts + 1); }
  };

  if (phase === 'setup' || !player) return (
    <PlayerSetup lang={lang} initial={player} onExit={player ? () => setPhase('lobby') : onExit}
      onSave={p => { savePlayer(p); setPlayer(p); setPhase('lobby'); }} />
  );

  if (phase === 'lobby') return (
    <div className="flex flex-col h-full">
      <TopBar onBack={onExit} lang={lang}><span className="font-bold font-lao">{t.g_dash}</span></TopBar>
      <div className="flex-1 overflow-y-auto p-4 grid gap-4 content-start">
        <div className="relative rounded-3xl overflow-hidden text-white p-4 flex items-center gap-3" style={{ background: `linear-gradient(90deg,rgba(59,15,160,.85),rgba(59,15,160,.2)),url(${STOPS[0].img}) center/cover` }}>
          <div className="daily-float bg-white/90 rounded-2xl p-1"><DashAvatar a={player.avatar} size={56} /></div>
          <div className="flex-1 min-w-0">
            <p className="text-xl font-bold truncate">{flagOf(player.country)} {player.name}</p>
            <p className="text-sm opacity-90 font-lao">{t.dash_route}</p>
          </div>
          <button onClick={() => setPhase('setup')} aria-label={t.dash_edit} className="w-11 h-11 rounded-full bg-white/20 flex items-center justify-center"><Pencil size={18} /></button>
        </div>

        <div className="flex items-center gap-1 overflow-x-auto pb-1">
          {STOPS.map((st, i) => (
            <div key={st.id} className="shrink-0 w-20 text-center">
              <div className="h-14 rounded-xl bg-cover bg-center border-2 border-white shadow" style={{ backgroundImage: `url(${st.img})` }} />
              <p className="text-[11px] leading-tight mt-1 font-lao">{i + 1}. {st.name[lang]}</p>
            </div>
          ))}
          <span className="shrink-0 text-2xl px-1">🔁</span>
        </div>

        <div>
          <h3 className="font-bold mb-2 font-lao">{t.dash_mode}</h3>
          <div className="grid grid-cols-3 gap-2">
            {(Object.keys(MODES) as ModeId[]).map(m => (
              <button key={m} onClick={() => setMode(m)} aria-pressed={mode === m}
                className={`daily-btn rounded-2xl border-2 p-2 text-center ${mode === m ? 'border-primary bg-primary/10' : 'border-border bg-card'}`}>
                <span className="block text-2xl">{MODES[m].icon}</span>
                <span className="block font-bold font-lao">{t[`mode_${m}`]}</span>
                <span className="block text-[11px] text-muted-foreground font-lao leading-tight">{t[`mode_${m}_d`]}</span>
              </button>
            ))}
          </div>
        </div>

        <button onClick={start} className="daily-btn rounded-2xl daily-grad text-white text-lg font-bold shadow-[0_4px_0_#3B0FA0] flex items-center justify-center gap-2"><Play size={20} fill="currentColor" />{t.dash_go}</button>
        <Ranking lang={lang} />
      </div>
    </div>
  );

  if (phase === 'over') {
    const { players, countries } = board();
    const rank = players.findIndex(e => e.me && e.score === score && e.name === player.name) + 1;
    const cRank = countries.findIndex(c => c.code === player.country) + 1;
    return (
      <div className="flex flex-col h-full">
        <TopBar onBack={onExit} lang={lang}><span className="font-bold font-lao">{t.dash_over}</span></TopBar>
        <div className="flex-1 overflow-y-auto p-4 grid gap-4 content-start">
          <div className="daily-pop text-center">
            <div className="inline-block daily-float"><DashAvatar a={player.avatar} size={72} /></div>
            <p className="text-4xl font-bold text-primary tabular-nums">{score}</p>
            <p className="text-sm text-muted-foreground font-lao">{t.dash_lap} {g.lap} · {STOPS[g.stop].name[lang]}</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-muted p-3 text-center"><p className="text-xs text-muted-foreground font-lao">{t.dash_your_rank}</p><p className="text-2xl font-bold">#{rank || '–'}</p></div>
            <div className="rounded-2xl bg-muted p-3 text-center"><p className="text-xs text-muted-foreground font-lao">{flagOf(player.country)} {t.rank_countries}</p><p className="text-2xl font-bold">#{cRank}</p></div>
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

  const stop = STOPS[g.stop];
  return (
    <div className="flex flex-col h-full select-none">
      <TopBar onBack={onExit} lang={lang}>
        <span className="font-bold tabular-nums">🏆 {score}</span>
        <span className="flex items-center gap-0.5" aria-label={`${g.hearts}`}>
          {Array.from({ length: MODES[mode].hearts }, (_, i) => <Heart key={i} size={18} className={i < g.hearts ? 'text-rose-500' : 'text-muted-foreground/30'} fill="currentColor" />)}
        </span>
        <button onClick={() => setPaused(p => !p)} aria-label={paused ? t.dash_resume : t.dash_pause} className="w-11 h-11 rounded-full bg-muted flex items-center justify-center">{paused ? <Play size={18} /> : <Pause size={18} />}</button>
      </TopBar>

      <div onPointerDown={jump} className="relative flex-1 overflow-hidden touch-none cursor-pointer bg-sky-200">
        <div key={stop.id} className="daily-in absolute inset-0" style={{ backgroundImage: `url(${stop.img})`, backgroundSize: 'auto 100%', backgroundRepeat: 'repeat-x', backgroundPositionX: `${-g.stopDist * 3}px` }} />
        <div className="absolute top-2 inset-x-2 flex items-center gap-2 rounded-full bg-white/85 dark:bg-black/60 px-3 py-1.5 text-xs font-lao shadow">
          <MapPin size={14} className="text-primary shrink-0" />
          <span className="font-bold truncate">{stop.name[lang]}</span>
          <div className="flex-1 h-2 rounded-full bg-black/10 overflow-hidden"><div className="h-full daily-grad" style={{ width: `${(g.stopDist / STOP_LEN) * 100}%` }} /></div>
          <span className="font-bold whitespace-nowrap">{t.dash_lap} {g.lap}</span>
        </div>
        <div className="absolute inset-x-0 bottom-0 h-[16%] bg-stone-600 border-t-4 border-amber-300">
          <div className="absolute top-1/2 inset-x-0 h-1" style={{ backgroundImage: 'repeating-linear-gradient(90deg,#fff 0 24px,transparent 24px 48px)', backgroundPositionX: `${-g.dist * 8}px` }} />
        </div>
        <div className="absolute bottom-[15%] drop-shadow-lg" style={{ left: `${PLAYER_X - 6}%`, transform: `translateY(${-g.y * PX}px) rotate(${g.y > 0 ? -8 : 0}deg)` }}>
          <DashAvatar a={player.avatar} size={52} step={g.y > 0 ? 0 : g.step} />
        </div>
        {g.things.map((o, k) => (
          <div key={k} className={`absolute flex flex-col items-center transition-opacity ${o.done ? 'opacity-0' : ''}`}
            style={{ left: `${o.x - 4}%`, bottom: `calc(16% + ${o.air ? 7 * PX + 10 : 0}px)` }}>
            <span className={`w-12 h-12 rounded-full flex items-center justify-center text-3xl shadow-lg ${o.good ? 'bg-emerald-100 ring-4 ring-emerald-400 daily-float' : 'bg-white ring-4 ring-red-500'}`}>{o.item.icon}</span>
            {!o.good && <span className="mt-0.5 rounded bg-red-600 text-white text-[10px] px-1 font-lao whitespace-nowrap">{o.item.label[lang]}</span>}
          </div>
        ))}
        {g.dist === 0 && !paused && <div className="absolute inset-x-4 top-14 rounded-2xl bg-white/90 dark:bg-black/70 p-3 text-center font-lao shadow">
          <p className="font-bold">👆 {t.dash_tap}</p><p className="text-sm">{t.dash_jump2}</p>
          <p className="text-xs mt-1">🛡️ {t.dash_got} = +50 · 🚩 = −❤️</p>
        </div>}
        {toast && <div key={toast.n} className={`daily-pop absolute top-12 inset-x-3 rounded-2xl bg-card border-2 p-3 text-sm font-lao shadow ${toast.good ? 'border-emerald-400' : 'border-red-400'}`}>
          <b>{toast.good ? `✅ ${t.dash_got}:` : t.dash_hit} {toast.item.icon} {toast.item.label[lang]}</b> · {toast.item.tip[lang]}
        </div>}
        {paused && <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-3 p-6">
          <button onPointerDown={e => e.stopPropagation()} onClick={() => setPaused(false)} className="daily-btn w-full max-w-xs rounded-2xl daily-grad text-white font-bold">{t.dash_resume}</button>
          <button onPointerDown={e => e.stopPropagation()} onClick={() => { setPaused(false); finishRun(); }} className="daily-btn w-full max-w-xs rounded-2xl bg-white text-foreground font-semibold">{t.dash_end_run}</button>
        </div>}
        {phase === 'gate' && card && <div onPointerDown={e => e.stopPropagation()} className="absolute inset-0 bg-black/55 flex items-end sm:items-center justify-center p-3">
          <div className="daily-pop w-full max-w-sm rounded-3xl bg-card p-4 grid gap-3 font-lao">
            <div className="h-24 -mx-4 -mt-4 rounded-t-3xl bg-cover bg-center flex items-end p-3" style={{ backgroundImage: `linear-gradient(transparent,rgba(0,0,0,.6)),url(${stop.img})` }}>
              <p className="text-white font-bold">📍 {t.dash_arrived} {stop.name[lang]}!</p>
            </div>
            <p className="text-sm bg-amber-50 dark:bg-amber-950/40 rounded-xl p-2">💡 {stop.fact[lang]}</p>
            <p className="font-bold">🕵️ {t.dash_gate}: {t.dash_gate_q}</p>
            <div className="rounded-2xl bg-muted p-3"><p className="text-xs text-muted-foreground">{card.sender}</p><p>{card.text[lang]}</p></div>
            {answer === null
              ? <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => answerGate(true)} className="daily-btn rounded-2xl bg-red-500 text-white font-bold text-lg">🚩 {t.scam}</button>
                  <button onClick={() => answerGate(false)} className="daily-btn rounded-2xl bg-emerald-500 text-white font-bold text-lg">✅ {t.safe}</button>
                </div>
              : <>
                  <p className={`daily-in rounded-xl p-2 text-sm ${answer === card.isScam ? 'bg-emerald-50 dark:bg-emerald-950/40' : 'bg-red-50 dark:bg-red-950/40'}`}>
                    <b>{answer === card.isScam ? `🎉 ${t.dash_gate_ok}` : `🤔 ${t.dash_gate_bad}`}</b> {card.why[lang]}
                  </p>
                  <button onClick={() => { setToast(null); setPhase('run'); }} className="daily-btn rounded-2xl daily-grad text-white font-bold">{t.dash_continue} →</button>
                </>}
          </div>
        </div>}
      </div>
    </div>
  );
}

function PlayerSetup({ lang, initial, onSave, onExit }: { lang: Lang; initial: Player | null; onSave: (p: Player) => void; onExit: () => void }) {
  const t = DT[lang];
  const [p, setP] = useState<Player>(initial ?? { name: '', country: 'LA', avatar: { skin: 1, hair: 0, outfit: 0, extra: 0 } });
  const set = (k: keyof Player['avatar'], v: number) => setP({ ...p, avatar: { ...p.avatar, [k]: v } });
  const swatch = (on: boolean) => `w-11 h-11 rounded-full border-4 ${on ? 'border-primary scale-110' : 'border-transparent'} transition-transform`;
  return (
    <div className="flex flex-col h-full">
      <TopBar onBack={onExit} lang={lang}><span className="font-bold font-lao">{t.dash_create}</span></TopBar>
      <div className="flex-1 overflow-y-auto p-4 grid gap-4 content-start font-lao">
        <div className="mx-auto rounded-3xl daily-grad p-3"><div key={JSON.stringify(p.avatar)} className="daily-pop"><DashAvatar a={p.avatar} size={96} /></div></div>
        <label className="grid gap-1"><span className="font-bold">{t.dash_name}</span>
          <input value={p.name} maxLength={16} onChange={e => setP({ ...p, name: e.target.value })} className="rounded-2xl border-2 border-border bg-card px-4 min-h-12 text-lg" />
        </label>
        <div><p className="font-bold mb-1">{t.dash_country}</p>
          <div className="grid grid-cols-4 gap-2">
            {ASEAN.map(c => (
              <button key={c.code} onClick={() => setP({ ...p, country: c.code })} aria-pressed={p.country === c.code}
                className={`rounded-2xl border-2 p-1 min-h-14 ${p.country === c.code ? 'border-primary bg-primary/10' : 'border-border'}`}>
                <span className="block text-2xl">{c.flag}</span><span className="block text-[10px] leading-tight">{c.name[lang]}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="grid gap-3"><p className="font-bold">{t.dash_look}</p>
          <div className="flex gap-2">{SKINS.map((c, i) => <button key={c} aria-label={`skin ${i + 1}`} onClick={() => set('skin', i)} className={swatch(p.avatar.skin === i)} style={{ background: c }} />)}</div>
          <div className="flex gap-2">{Array.from({ length: HAIRS }, (_, i) => <button key={i} aria-label={`hair ${i + 1}`} onClick={() => set('hair', i)} className={`rounded-2xl border-2 ${p.avatar.hair === i ? 'border-primary bg-primary/10' : 'border-border'}`}><DashAvatar a={{ ...p.avatar, hair: i, extra: 0 }} size={40} /></button>)}</div>
          <div className="flex gap-2 flex-wrap">{OUTFITS.map((c, i) => <button key={c} aria-label={`outfit ${i + 1}`} onClick={() => set('outfit', i)} className={swatch(p.avatar.outfit === i)} style={{ background: c }} />)}</div>
          <div className="flex gap-2">{EXTRAS.map((e, i) => <button key={i} aria-label={`extra ${i + 1}`} onClick={() => set('extra', i)} className={`w-12 h-12 rounded-2xl border-2 text-2xl ${p.avatar.extra === i ? 'border-primary bg-primary/10' : 'border-border'}`}>{e || '—'}</button>)}</div>
        </div>
        <button disabled={!p.name.trim()} onClick={() => onSave({ ...p, name: p.name.trim() })} className="daily-btn rounded-2xl daily-grad text-white font-bold disabled:opacity-40 shadow-[0_4px_0_#3B0FA0]">{t.dash_save}</button>
      </div>
    </div>
  );
}

function Ranking({ lang }: { lang: Lang }) {
  const t = DT[lang];
  const [tab, setTab] = useState<'players' | 'countries'>('countries');
  const { players, countries } = board();
  const medal = (i: number) => ['🥇', '🥈', '🥉'][i] ?? `${i + 1}`;
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
                <span className="w-7 text-center font-bold">{medal(i)}</span><span className="text-xl">{c.flag}</span>
                <span className="flex-1">{c.name[lang]}</span><span className="font-bold tabular-nums">{c.score}</span>
              </li>))
          : players.slice(0, 15).map((e, i) => (
              <li key={i} className={`flex items-center gap-2 rounded-xl px-2 py-1.5 ${e.me ? 'bg-primary/15 font-bold' : 'odd:bg-muted/50'}`}>
                <span className="w-7 text-center font-bold">{medal(i)}</span>
                {e.avatar ? <DashAvatar a={e.avatar} size={22} /> : <span className="text-xl">{flagOf(e.country)}</span>}
                <span className="flex-1 truncate">{e.name}{e.me ? ` (${t.you})` : ''} {e.avatar && flagOf(e.country)}</span>
                <span className="tabular-nums">{e.score}</span>
              </li>))}
      </ol>
    </section>
  );
}
