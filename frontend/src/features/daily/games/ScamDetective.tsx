import { useEffect, useState } from 'react';
import { Search, Volume2, VolumeX, MessageCircle, Phone, Mail, Smartphone, CheckCircle2, XCircle, Flag, ShieldCheck, ThumbsUp, HelpCircle, EyeOff } from 'lucide-react';
import { DashAvatar } from '../components/DashAvatar';
import { Backdrop, type Room } from '../components/Backdrop';
import { Burst, Combo } from '../components/juice';
import { PERSONAS, type Case, type Persona } from '../data/detectiveCases';
import { TopBar, haptic } from '../components/ui';
import { DT, FLAG_LABEL } from '../i18n';
import { track } from '../lib/analytics';
import { getAge, tier, type AgeTier } from '../lib/age';
import { filterByBand } from '../../../lib/band';
import { hasLaoAudio, speakParts, stopAll } from '../lib/useSpeak';
import { detectiveDebriefParts, detectiveLookParts } from '../lib/spoken';
import { duck, useMusic } from '../lib/sound';
import type { FlagCategory, Lang } from '../types';
import type { GameResult } from './StoryGame';

type Stage = 'look' | 'act' | 'debrief';
const CHANNEL = { sms: Smartphone, chat: MessageCircle, call: Phone, email: Mail };
const shuffle = <T,>(a: T[]) => a.map(v => [Math.random(), v] as const).sort((x, y) => x[0] - y[0]).map(([, v]) => v);
// Each character has a bigger pool of cases; a play draws this many so repeat plays feel fresh.
const CASES_PER_PLAY = 4;
// The persona closest to the player's own age is suggested first.
const FOR_AGE: Record<AgeTier, string[]> = { kids: ['kid'], youth: ['student', 'worker'], adult: ['parent'], elder: ['elder'] };

// Scenario game: pick a character, then for each case inspect the message for clues,
// decide scam or safe, choose what to do, and read the debrief.
// Kids and elders see the clues highlighted; youth and adults must find them, and wrong taps cost points.
export function ScamDetective({ lang, onExit, onFinish }: { lang: Lang; onExit: () => void; onFinish: (r: GameResult) => void }) {
  const t = DT[lang];
  const [cfg] = useState(tier);
  const [age] = useState(getAge);
  const hidden = cfg.hiddenClues;
  const [persona, setPersona] = useState<Persona | null>(null);
  const [ci, setCi] = useState(0);
  const [stage, setStage] = useState<Stage>('look');
  const [opened, setOpened] = useState<number[]>([]);
  const [miss, setMiss] = useState<{ i: number; n: number } | null>(null);
  const [verdict, setVerdict] = useState<boolean | null>(null);
  const [action, setAction] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [right, setRight] = useState(0);
  const [combo, setCombo] = useState(0);
  const [missed, setMissed] = useState<FlagCategory[]>([]);
  const [voice, setVoice] = useState(cfg.voice);

  const c: Case | undefined = persona?.cases[ci];
  const clues = c ? c.parts.map((p, i) => (p.clue ? i : -1)).filter(i => i >= 0) : [];
  const say = (parts: string[]) => { if (voice) speakParts(parts, lang, age); };

  useEffect(() => stopAll, []);
  useMusic(persona ? 'mystery' : null);
  // Quieter music while the case is read aloud.
  useEffect(() => { duck(voice); }, [voice]);
  useEffect(() => { if (c && stage === 'look') say(detectiveLookParts(c, lang)); }, [c, stage, voice]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!persona || !c) {
    const mine = FOR_AGE[age];
    const list = filterByBand(PERSONAS, age).sort((a, b) => Number(mine.includes(b.id)) - Number(mine.includes(a.id)));
    return (
      <div className="flex flex-col h-full">
        <TopBar onBack={onExit} lang={lang}><span className="font-bold font-lao">{t.g_detective}</span></TopBar>
        <div className="flex-1 overflow-y-auto p-4 grid gap-4 content-start font-lao">
          <div className="rounded-3xl border border-border bg-card p-4 flex items-center gap-3">
            <span className="w-14 h-14 shrink-0 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center"><Search size={28} /></span>
            <p className="flex-1 text-sm leading-relaxed">{hidden ? t.hidden_hint : t.det_intro}</p>
          </div>
          <h3 className="font-bold">{t.det_pick}</h3>
          <div className="grid grid-cols-2 gap-3">
            {list.map((p, i) => (
              <button key={p.id} onClick={() => { setPersona({ ...p, cases: shuffle(filterByBand(p.cases, age)).slice(0, CASES_PER_PLAY) }); track({ type: 'session_start', mode: `detective:${p.id}` }); }}
                className={`daily-in daily-btn rounded-3xl border-2 bg-card overflow-hidden text-left grid hover:border-primary ${mine.includes(p.id) ? 'border-primary' : 'border-border'}`} style={{ animationDelay: `${i * 0.05}s` }}>
                <span className="relative block h-24 overflow-hidden">
                  <Backdrop room={p.id as Room} />
                  <span className="absolute left-1/2 -translate-x-1/2 bottom-1"><DashAvatar a={p.avatar} size={52} pose="stand" /></span>
                  {mine.includes(p.id) && <span className="absolute top-2 left-2 rounded-full bg-primary text-primary-foreground px-2 py-0.5 text-[11px] font-bold">{t.for_you}</span>}
                </span>
                <span className="p-3 grid gap-0.5">
                  <span className="font-bold">{p.name[lang]}, {p.age}</span>
                  <span className="text-xs text-muted-foreground leading-snug">{p.who[lang]}</span>
                  <span className="text-[11px] text-primary font-semibold">{Math.min(CASES_PER_PLAY, filterByBand(p.cases, age).length)} {t.det_cases}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const tapPart = (i: number) => {
    if (stage !== 'look' || opened.includes(i)) return;
    const p = c.parts[i];
    if (!p.clue) {
      // Only reachable in hidden mode: a wrong guess shakes and costs a little.
      setMiss({ i, n: Date.now() }); setScore(s => Math.max(0, s - 10)); haptic(false);
      return;
    }
    setOpened([...opened, i]); setMiss(null); haptic(true); say([p.clue.note[lang]]);
  };
  const decide = (saysScam: boolean) => {
    const ok = saysScam === c.isScam;
    setVerdict(saysScam); haptic(ok);
    if (ok) { setScore(s => s + 100 + opened.length * (hidden ? 25 : 10) + combo * 20); setRight(r => r + 1); setCombo(n => n + 1); }
    else { setCombo(0); if (c.isScam) setMissed(m => [...m, ...c.parts.flatMap(p => (p.clue?.flag ? [p.clue.flag] : []))]); }
    track({ type: 'choice_made', scenarioId: `detective-${c.id}`, scamType: c.isScam ? 'scam' : 'safe', step: 'verdict', correct: ok, scam: c.isScam });
    setStage('act');
    say([ok ? t.det_right : t.det_wrong]);
  };
  const choose = (i: number) => {
    setAction(i); haptic(c.actions[i].best);
    if (c.actions[i].best) setScore(s => s + 50);
    track({ type: 'choice_made', scenarioId: `detective-${c.id}`, scamType: c.isScam ? 'scam' : 'safe', step: 'action', correct: c.actions[i].best });
    setStage('debrief');
    say(detectiveDebriefParts(c, i, lang));
  };
  const next = () => {
    if (ci + 1 >= persona.cases.length) return onFinish({ score: right, total: persona.cases.length, missed, failed: false, scenarioIds: [] });
    setCi(ci + 1); setStage('look'); setOpened([]); setVerdict(null); setAction(null); setMiss(null);
  };

  const Icon = CHANNEL[c.channel];
  const correct = verdict === c.isScam;
  const last = opened.length ? c.parts[opened[opened.length - 1]].clue! : null;
  return (
    <div className="flex flex-col h-full">
      <TopBar onBack={onExit} lang={lang}>
        <span className="font-bold font-lao truncate">{persona.name[lang]} · {t.det_case} {ci + 1}/{persona.cases.length}</span>
        <span className="flex items-center gap-2">
          <span className="font-bold tabular-nums flex items-center gap-1"><Search size={16} className="text-primary" />{score}</span>
          <button onClick={() => { setVoice(v => !v); if (voice) stopAll(); }} aria-pressed={voice} aria-label={t.det_voice}
            className={`w-11 h-11 rounded-full flex items-center justify-center ${voice ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>{voice ? <Volume2 size={18} /> : <VolumeX size={18} />}</button>
        </span>
      </TopBar>
      <div className="flex-1 overflow-y-auto p-4 grid gap-4 content-start font-lao">
        <div className="flex gap-1">{persona.cases.map((_, i) => <span key={i} className={`h-1.5 flex-1 rounded-full ${i < ci ? 'bg-primary' : i === ci ? 'bg-primary/50' : 'bg-muted'}`} />)}</div>
        {voice && lang === 'lo' && !hasLaoAudio(detectiveLookParts(c, lang)) && <p role="status" className="text-xs rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 px-3 py-2">{t.audio_coming}</p>}

        {/* The scene: where the persona is when the message arrives. */}
        <div key={c.id} className="daily-fade relative h-52 rounded-3xl overflow-hidden shadow-md">
          <Backdrop room={persona.id as Room} night={ci % 2 === 1} />
          <span className="absolute left-[8%] bottom-2"><DashAvatar a={persona.avatar} size={84} pose="stand" /></span>
          <span className="absolute left-[8%] bottom-[56%] ml-14 w-9 h-9 rounded-xl bg-white text-primary shadow flex items-center justify-center call-ring"><Icon size={18} /></span>
          <p className="absolute right-3 top-3 max-w-[62%] rounded-2xl rounded-tr-sm bg-white/95 dark:bg-black/70 px-3 py-2 text-sm leading-snug shadow">{c.situation[lang]}</p>
        </div>

        <div className={`rounded-3xl border-2 bg-card shadow-sm overflow-hidden ${stage === 'debrief' ? (c.isScam ? 'border-red-300' : 'border-emerald-300') : 'border-border'}`}>
          <div className="flex items-center gap-2 px-4 py-2.5 bg-muted/60 border-b border-border">
            <span className="w-8 h-8 rounded-full bg-primary/15 text-primary flex items-center justify-center"><Icon size={16} /></span>
            <span className="font-semibold text-sm truncate flex-1">{c.sender[lang]}</span>
            {stage === 'debrief' && <span className={`daily-pop rounded-full px-2 py-0.5 text-xs font-bold text-white ${c.isScam ? 'bg-red-500' : 'bg-emerald-500'}`}>{c.isScam ? t.scam : t.safe}</span>}
          </div>
          <p className="p-4 text-[17px] leading-loose">
            {c.parts.map((p, i) => {
              const open = opened.includes(i) || stage === 'debrief';
              const shaking = miss?.i === i;
              if (!p.clue && !hidden) return <span key={i}>{p.text[lang]}</span>;
              const tone = open && p.clue
                ? (p.clue.flag ? 'bg-red-100 dark:bg-red-900/40 text-red-900 dark:text-red-100' : 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-900 dark:text-emerald-100')
                : hidden ? `hover:bg-primary/10 ${shaking ? 'daily-shake bg-muted' : ''}` : 'bg-amber-100 dark:bg-amber-900/40 border-b-2 border-dashed border-amber-500';
              return <button key={shaking ? `${i}-${miss!.n}` : i} disabled={stage !== 'look'} onClick={() => tapPart(i)}
                className={`daily-flag inline text-left ${tone}`}>{p.text[lang]}</button>;
            })}
          </p>
        </div>

        {stage === 'look' && <p className="text-sm flex items-center gap-2 text-muted-foreground">{hidden ? <EyeOff size={16} className="text-primary shrink-0" /> : <Search size={16} className="text-amber-500 shrink-0" />}
          {miss ? <b key={miss.n} className="daily-shake text-red-600">−10 · {t.nothing_here}</b> : hidden ? t.hidden_hint : t.det_tap}<b className="ml-auto text-primary tabular-nums whitespace-nowrap">{opened.length}/{clues.length}</b></p>}
        {stage === 'look' && opened.length > 0 && <div className="grid gap-2">
          <div className="flex flex-wrap gap-1.5">
            {opened.map(i => { const cl = c.parts[i].clue!; return (
              <span key={i} className={`daily-pop inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${cl.flag ? 'bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-200' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-200'}`}>
                {cl.flag ? <Flag size={12} /> : <ShieldCheck size={12} />}{cl.flag ? FLAG_LABEL[cl.flag][lang] : t.det_safe_sign}</span>); })}
          </div>
          {last && <p key={opened.length} className="daily-in text-sm rounded-2xl bg-muted px-3 py-2">{last.note[lang]}</p>}
        </div>}

        {stage === 'look' && <div className="grid gap-2">
          <div className="flex items-center justify-between"><p className="font-bold">{t.det_verdict}</p><Combo n={combo} label={t.combo} /></div>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => decide(true)} className="daily-btn rounded-2xl bg-red-500 text-white font-bold text-lg shadow-[0_4px_0_#B91C1C] flex items-center justify-center gap-2"><Flag size={20} />{t.scam}</button>
            <button onClick={() => decide(false)} className="daily-btn rounded-2xl bg-emerald-500 text-white font-bold text-lg shadow-[0_4px_0_#047857] flex items-center justify-center gap-2"><ShieldCheck size={20} />{t.safe}</button>
          </div>
        </div>}

        {stage !== 'look' && <div className={`daily-pop relative rounded-2xl p-3 flex gap-2 items-center ${correct ? 'bg-emerald-50 dark:bg-emerald-950/40' : 'bg-amber-50 dark:bg-amber-950/40'}`}>
          {correct && stage === 'act' && <Burst />}
          {correct ? <CheckCircle2 size={28} className="text-emerald-600 shrink-0" /> : <XCircle size={28} className="text-amber-600 shrink-0" />}
          <p><b className="block text-lg leading-tight">{correct ? t.det_right : t.det_wrong}</b><span className="text-sm">{c.isScam ? t.det_was_scam : t.det_was_safe}</span></p>
        </div>}

        {stage === 'act' && <div className="grid gap-2">
          <p className="font-bold">{t.det_what.replace('{n}', persona.name[lang])}</p>
          {c.actions.map((a, i) => <button key={i} onClick={() => choose(i)} className="daily-in daily-btn rounded-2xl border-2 border-border bg-card px-4 text-left font-semibold hover:border-primary" style={{ animationDelay: `${i * 0.06}s` }}>{a.text[lang]}</button>)}
        </div>}

        {stage === 'debrief' && action !== null && <div className="grid gap-3">
          <div className={`daily-in rounded-2xl border-2 p-3 text-sm ${c.actions[action].best ? 'border-emerald-300' : 'border-amber-300'}`}>
            <p className="font-semibold flex items-center gap-2">{c.actions[action].best ? <ThumbsUp size={16} className="text-emerald-600 shrink-0" /> : <HelpCircle size={16} className="text-amber-600 shrink-0" />}{c.actions[action].text[lang]}</p>
            <p className="text-muted-foreground mt-1">{c.actions[action].why[lang]}</p>
            {!c.actions[action].best && <p className="mt-2 flex gap-2"><ShieldCheck size={16} className="text-emerald-600 shrink-0 mt-0.5" /><span><b>{t.det_better}:</b> {c.actions.find(a => a.best)?.text[lang]}</span></p>}
          </div>
          <div className="daily-in rounded-2xl bg-primary text-primary-foreground p-4" style={{ animationDelay: '.1s' }}>
            <p className="text-xs uppercase tracking-wide opacity-80">{t.det_lesson}</p>
            <p className="font-bold mt-1 leading-snug">{c.lesson[lang]}</p>
          </div>
          <button onClick={next} className="daily-btn rounded-2xl bg-foreground text-background font-bold">{ci + 1 >= persona.cases.length ? t.det_close : `${t.next} →`}</button>
        </div>}
      </div>
    </div>
  );
}
