import { useEffect, useState } from 'react';
import { Search, Volume2, VolumeX, MessageCircle, Phone, Mail, Smartphone, CheckCircle2, XCircle, Flag, ShieldCheck, ThumbsUp, HelpCircle } from 'lucide-react';
import { DashAvatar } from '../components/DashAvatar';
import { PERSONAS, type Case, type Persona } from '../data/detectiveCases';
import { TopBar, haptic } from '../components/ui';
import { DT, FLAG_LABEL } from '../i18n';
import { track } from '../lib/analytics';
import { speak as say0, stopSpeaking } from '../lib/speech';
import type { FlagCategory, Lang } from '../types';
import type { GameResult } from './StoryGame';

type Stage = 'look' | 'act' | 'debrief';
const CHANNEL = { sms: Smartphone, chat: MessageCircle, call: Phone, email: Mail };
const shuffle = <T,>(a: T[]) => a.map(v => [Math.random(), v] as const).sort((x, y) => x[0] - y[0]).map(([, v]) => v);

// Scenario game: pick a character, then for each case inspect the
// message for clues, decide scam or safe, choose what to do, and read the debrief.
export function ScamDetective({ lang, onExit, onFinish }: { lang: Lang; onExit: () => void; onFinish: (r: GameResult) => void }) {
  const t = DT[lang];
  const [persona, setPersona] = useState<Persona | null>(null);
  const [ci, setCi] = useState(0);
  const [stage, setStage] = useState<Stage>('look');
  const [opened, setOpened] = useState<number[]>([]);
  const [verdict, setVerdict] = useState<boolean | null>(null);
  const [action, setAction] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [right, setRight] = useState(0);
  const [missed, setMissed] = useState<FlagCategory[]>([]);
  const [voice, setVoice] = useState(false);

  const c: Case | undefined = persona?.cases[ci];
  const clues = c ? c.parts.map((p, i) => (p.clue ? i : -1)).filter(i => i >= 0) : [];
  const say = (text: string) => { if (voice) say0(text, lang, undefined, 0.9); };

  useEffect(() => stopSpeaking, []);
  useEffect(() => { if (c && stage === 'look') say(`${c.situation[lang]} ${c.parts.map(p => p.text[lang]).join('')}`); }, [c, stage, voice]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!persona || !c) return (
    <div className="flex flex-col h-full">
      <TopBar onBack={onExit} lang={lang}><span className="font-bold font-lao">{t.g_detective}</span></TopBar>
      <div className="flex-1 overflow-y-auto p-4 grid gap-4 content-start font-lao">
        <div className="rounded-3xl daily-grad text-white p-4 flex items-center gap-3">
          <span className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center"><Search size={30} /></span>
          <p className="flex-1 text-sm leading-relaxed">{t.det_intro}</p>
        </div>
        <h3 className="font-bold">{t.det_pick}</h3>
        <div className="grid grid-cols-2 gap-3">
          {PERSONAS.map((p, i) => (
            <button key={p.id} onClick={() => { setPersona({ ...p, cases: shuffle(p.cases) }); track({ type: 'session_start', mode: `detective:${p.id}` }); }}
              className="daily-in daily-btn rounded-3xl border-2 border-border bg-card p-3 text-left grid gap-1 hover:border-primary" style={{ animationDelay: `${i * 0.05}s` }}>
              <span className="w-14 h-14 rounded-2xl bg-primary/10 flex items-end justify-center overflow-hidden"><DashAvatar a={p.avatar} size={38} pose="stand" /></span>
              <span className="font-bold">{p.name[lang]}, {p.age}</span>
              <span className="text-xs text-muted-foreground leading-snug">{p.who[lang]}</span>
              <span className="text-[11px] text-primary font-semibold">{p.cases.length} {t.det_cases}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const decide = (saysScam: boolean) => {
    const ok = saysScam === c.isScam;
    setVerdict(saysScam); haptic(ok);
    if (ok) { setScore(s => s + 100 + opened.length * 10); setRight(r => r + 1); }
    else if (c.isScam) setMissed(m => [...m, ...c.parts.flatMap(p => (p.clue?.flag ? [p.clue.flag] : []))]);
    track({ type: 'choice_made', scenarioId: `detective-${c.id}`, scamType: c.isScam ? 'scam' : 'safe', step: 'verdict', correct: ok });
    setStage('act');
    say(ok ? t.det_right : t.det_wrong);
  };
  const choose = (i: number) => {
    setAction(i); haptic(c.actions[i].best);
    if (c.actions[i].best) setScore(s => s + 50);
    track({ type: 'choice_made', scenarioId: `detective-${c.id}`, scamType: c.isScam ? 'scam' : 'safe', step: 'action', correct: c.actions[i].best });
    setStage('debrief');
    say(`${c.actions[i].why[lang]} ${c.lesson[lang]}`);
  };
  const next = () => {
    if (ci + 1 >= persona.cases.length) return onFinish({ score: right, total: persona.cases.length, missed, failed: false, scenarioIds: [] });
    setCi(ci + 1); setStage('look'); setOpened([]); setVerdict(null); setAction(null);
  };

  const Icon = CHANNEL[c.channel];
  const correct = verdict === c.isScam;
  return (
    <div className="flex flex-col h-full">
      <TopBar onBack={onExit} lang={lang}>
        <span className="font-bold font-lao truncate">{persona.name[lang]} · {t.det_case} {ci + 1}/{persona.cases.length}</span>
        <span className="flex items-center gap-2">
          <span className="font-bold tabular-nums flex items-center gap-1"><Search size={16} className="text-primary" />{score}</span>
          <button onClick={() => { setVoice(v => !v); if (voice) stopSpeaking(); }} aria-pressed={voice} aria-label={t.det_voice}
            className={`w-11 h-11 rounded-full flex items-center justify-center ${voice ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>{voice ? <Volume2 size={18} /> : <VolumeX size={18} />}</button>
        </span>
      </TopBar>
      <div className="flex-1 overflow-y-auto p-4 grid gap-4 content-start font-lao">
        <div className="flex gap-1">{persona.cases.map((_, i) => <span key={i} className={`h-1.5 flex-1 rounded-full ${i < ci ? 'bg-primary' : i === ci ? 'bg-primary/50' : 'bg-muted'}`} />)}</div>
        <p className="text-sm text-muted-foreground leading-relaxed">{c.situation[lang]}</p>

        <div className={`rounded-3xl border-2 bg-card shadow-sm overflow-hidden ${stage === 'debrief' ? (c.isScam ? 'border-red-300' : 'border-emerald-300') : 'border-border'}`}>
          <div className="flex items-center gap-2 px-4 py-2.5 bg-muted/60 border-b border-border">
            <span className="w-8 h-8 rounded-full bg-primary/15 text-primary flex items-center justify-center"><Icon size={16} /></span>
            <span className="font-semibold text-sm truncate flex-1">{c.sender[lang]}</span>
            {stage === 'debrief' && <span className={`daily-pop rounded-full px-2 py-0.5 text-xs font-bold text-white ${c.isScam ? 'bg-red-500' : 'bg-emerald-500'}`}>{c.isScam ? t.scam : t.safe}</span>}
          </div>
          <p className="p-4 text-[17px] leading-loose">
            {c.parts.map((p, i) => {
              if (!p.clue) return <span key={i}>{p.text[lang]}</span>;
              const open = opened.includes(i) || stage === 'debrief';
              const tone = !open ? 'bg-amber-100 dark:bg-amber-900/40 border-b-2 border-dashed border-amber-500' : p.clue.flag ? 'bg-red-100 dark:bg-red-900/40 text-red-900 dark:text-red-100' : 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-900 dark:text-emerald-100';
              return <button key={i} disabled={stage !== 'look'} onClick={() => { if (!opened.includes(i)) { setOpened([...opened, i]); haptic(true); say(p.clue!.note[lang]); } }}
                className={`daily-flag inline text-left ${tone}`}>{p.text[lang]}</button>;
            })}
          </p>
        </div>

        {stage === 'look' && <p className="text-sm flex items-center gap-2 text-muted-foreground"><Search size={16} className="text-amber-500 shrink-0" />{t.det_tap} · {opened.length}/{clues.length}</p>}
        {opened.length > 0 && stage === 'look' && <div className="grid gap-2">
          {opened.map(i => { const cl = c.parts[i].clue!; return (
            <div key={i} className={`daily-in rounded-2xl p-3 text-sm flex gap-2 ${cl.flag ? 'bg-red-50 dark:bg-red-950/40' : 'bg-emerald-50 dark:bg-emerald-950/40'}`}>
              <span className="shrink-0 mt-0.5">{cl.flag ? <Flag size={16} className="text-red-600" /> : <ShieldCheck size={16} className="text-emerald-600" />}</span>
              <span><b>{cl.flag ? FLAG_LABEL[cl.flag][lang] : t.det_safe_sign}</b> · {cl.note[lang]}</span>
            </div>); })}
        </div>}

        {stage === 'look' && <div className="grid gap-2">
          <p className="font-bold">{t.det_verdict}</p>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => decide(true)} className="daily-btn rounded-2xl bg-red-500 text-white font-bold text-lg shadow-[0_4px_0_#B91C1C] flex items-center justify-center gap-2"><Flag size={20} />{t.scam}</button>
            <button onClick={() => decide(false)} className="daily-btn rounded-2xl bg-emerald-500 text-white font-bold text-lg shadow-[0_4px_0_#047857] flex items-center justify-center gap-2"><ShieldCheck size={20} />{t.safe}</button>
          </div>
        </div>}

        {stage !== 'look' && <div className={`daily-pop rounded-2xl p-3 flex gap-2 items-start ${correct ? 'bg-emerald-50 dark:bg-emerald-950/40' : 'bg-amber-50 dark:bg-amber-950/40'}`}>
          {correct ? <CheckCircle2 className="text-emerald-600 shrink-0" /> : <XCircle className="text-amber-600 shrink-0" />}
          <p className="text-sm"><b>{correct ? t.det_right : t.det_wrong}</b> {c.isScam ? t.det_was_scam : t.det_was_safe}</p>
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
          <div className="daily-in rounded-2xl daily-grad text-white p-4" style={{ animationDelay: '.1s' }}>
            <p className="text-xs uppercase tracking-wide opacity-80">{t.det_lesson}</p>
            <p className="font-bold mt-1 leading-snug">{c.lesson[lang]}</p>
          </div>
          <button onClick={next} className="daily-btn rounded-2xl bg-foreground text-background font-bold">{ci + 1 >= persona.cases.length ? t.det_close : `${t.next} →`}</button>
        </div>}
      </div>
    </div>
  );
}
