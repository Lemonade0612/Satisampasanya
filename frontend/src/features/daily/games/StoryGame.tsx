import { useEffect, useRef, useState } from 'react';
import { CheckCircle2, XCircle, Video, MessageCircle, Smartphone, Swords, Flag } from 'lucide-react';
import { Guide, TrustMeter, TopBar, haptic, type Mood } from '../components/ui';
import { DT, FLAG_LABEL } from '../i18n';
import { track } from '../lib/analytics';
import { useMusic } from '../lib/sound';
import type { ChatStep, Choice, FlagCategory, FlagStep, Lang, Scenario } from '../types';

export type GameResult = { score: number; total: number; missed: FlagCategory[]; failed: boolean; scenarioIds: string[] };

// Plays scenarios back to back with a shared trust meter. mode 'flags' keeps only tap-the-flag steps.
export function StoryGame({ lang, scenarios, mode, onExit, onFinish }: {
  lang: Lang; scenarios: Scenario[]; mode: 'full' | 'flags'; onExit: () => void; onFinish: (r: GameResult) => void;
}) {
  const t = DT[lang];
  const [si, setSi] = useState(0);
  const [stepIdx, setStepIdx] = useState(0);
  const [trust, setTrust] = useState(3);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const [missed, setMissed] = useState<FlagCategory[]>([]);
  const [mood, setMood] = useState<Mood>('idle');
  const [guide, setGuide] = useState<string>('');
  const correctInScenario = useRef(0);
  const live = useRef({ scenarioId: '', step: '', done: true });

  const scenario = scenarios[si];
  const steps = scenario ? scenario.steps.filter(s => mode === 'full' || s.kind === 'flags') : [];
  const step = steps[stepIdx];

  useEffect(() => {
    if (!scenario) return;
    track({ type: 'scenario_start', scenarioId: scenario.id, scamType: scenario.scamType });
    correctInScenario.current = 0;
    live.current = { scenarioId: scenario.id, step: steps[0]?.id ?? '', done: false };
    setGuide(scenario.intro[lang]); setMood('idle');
  }, [si]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { if (step) live.current.step = step.id; }, [step]);
  // Leaving mid-scenario is the drop-off signal for the pilot stats.
  useEffect(() => () => { const l = live.current; if (!l.done && l.scenarioId) track({ type: 'drop_off_step', scenarioId: l.scenarioId, step: l.step }); }, []);

  const finish = (finalScore: number, finalTotal: number, finalMissed: FlagCategory[], failed: boolean) => {
    live.current.done = true;
    onFinish({ score: finalScore, total: finalTotal, missed: finalMissed, failed, scenarioIds: scenarios.slice(0, si + 1).map(s => s.id) });
  };

  const advance = (nextScore: number, nextTotal: number, nextMissed: FlagCategory[], nextTrust: number) => {
    if (nextTrust <= 0) return finish(nextScore, nextTotal, nextMissed, true);
    if (stepIdx + 1 < steps.length) { setStepIdx(stepIdx + 1); return; }
    track({ type: 'scenario_complete', scenarioId: scenario.id, scamType: scenario.scamType, correct: correctInScenario.current, total: steps.length });
    live.current.done = true;
    if (si + 1 < scenarios.length) { setSi(si + 1); setStepIdx(0); return; }
    finish(nextScore, nextTotal, nextMissed, false);
  };

  useMusic('mystery');
  if (!scenario || !step) return null;
  const progress = (si + stepIdx / steps.length) / scenarios.length;
  const ChannelIcon = scenario.channel === 'video' ? Video : scenario.channel === 'sms' ? Smartphone : MessageCircle;

  return (
    <div className="flex flex-col h-full">
      <TopBar onBack={onExit} lang={lang}>
        <div className="flex-1 h-3 rounded-full bg-muted overflow-hidden"><div className="h-full daily-grad transition-all duration-500" style={{ width: `${progress * 100}%` }} /></div>
        <TrustMeter trust={trust} />
      </TopBar>
      <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4">
        {scenario.boss && <div className="daily-pop text-center text-xs font-bold uppercase tracking-wide text-white daily-grad rounded-full py-1.5 flex items-center justify-center gap-1.5"><Swords size={14} />{t.boss} · {t.boss_badge}</div>}
        <div className="flex items-center gap-2 text-sm text-muted-foreground"><ChannelIcon size={16} /><span className="font-semibold text-foreground">{scenario.contact}</span><span>· {scenario.title[lang]}</span></div>
        <Guide mood={mood} text={guide} />
        {step.kind === 'chat'
          ? <ChatView key={`${scenario.id}-${step.id}`} lang={lang} step={step} onChoose={c => {
              track({ type: 'choice_made', scenarioId: scenario.id, scamType: scenario.scamType, step: step.id, correct: c.correct });
              haptic(c.correct); setMood(c.correct ? 'happy' : 'sad'); setGuide(c.consequence[lang]);
              if (c.correct) correctInScenario.current++;
              const s = score + (c.correct ? 100 : 0), tt = total + 1, tr = trust - (c.correct ? 0 : 1);
              setScore(s); setTotal(tt); setTrust(tr);
              return () => advance(s, tt, missed, tr);
            }} />
          : <FlagView key={`${scenario.id}-${step.id}`} lang={lang} step={step} onDone={(found, miss) => {
              miss.forEach(flag => track({ type: 'flag_missed', scenarioId: scenario.id, flag }));
              const ok = miss.length === 0;
              if (ok) correctInScenario.current++;
              haptic(ok); setMood(ok ? 'happy' : 'sad'); setGuide(scenario.explanation[lang]);
              const s = score + found * 50, tt = total + 1, m = [...missed, ...miss];
              setScore(s); setTotal(tt); setMissed(m);
              return () => advance(s, tt, m, trust);
            }} />}
      </div>
    </div>
  );
}

function ChatView({ lang, step, onChoose }: { lang: Lang; step: ChatStep; onChoose: (c: Choice) => () => void }) {
  const t = DT[lang];
  const [picked, setPicked] = useState<Choice | null>(null);
  const [next, setNext] = useState<null | (() => void)>(null);
  return (
    <div className="space-y-3">
      <div className="rounded-3xl bg-muted/60 p-3 space-y-2">
        {step.messages.map((m, i) => (
          <div key={i} className="daily-bubble max-w-[85%] rounded-2xl rounded-tl-sm bg-card border border-border px-3 py-2 text-[15px] font-lao leading-relaxed" style={{ animationDelay: `${i * 0.25}s` }}>{m.text[lang]}</div>
        ))}
        {picked && <div className="daily-bubble ml-auto max-w-[85%] rounded-2xl rounded-tr-sm daily-grad text-white px-3 py-2 text-[15px] font-lao">{picked.text[lang]}</div>}
      </div>
      <p className="font-semibold font-lao">{step.prompt[lang]}</p>
      <div className="grid gap-2">
        {step.choices.map(c => {
          const state = !picked ? '' : c.id === picked.id ? (c.correct ? 'border-green-500 bg-green-50 dark:bg-green-950/40 daily-pop' : 'border-red-500 bg-red-50 dark:bg-red-950/40 daily-shake') : 'opacity-50';
          return (
            <button key={c.id} disabled={!!picked} onClick={() => { setPicked(c); const fn = onChoose(c); setNext(() => fn); }}
              className={`daily-btn text-left rounded-2xl border-2 border-border bg-card px-4 py-3 font-lao font-medium shadow-[0_3px_0_var(--border)] ${state}`}>
              <span className="inline-flex items-center gap-2">{picked?.id === c.id && (c.correct ? <CheckCircle2 size={18} className="text-green-600" /> : <XCircle size={18} className="text-red-600" />)}{c.text[lang]}</span>
            </button>
          );
        })}
      </div>
      {next && <button onClick={next} className="daily-btn daily-in w-full rounded-2xl daily-grad text-white font-bold">{picked?.correct ? t.correct : t.wrong} · {t.next} →</button>}
    </div>
  );
}

function FlagView({ lang, step, onDone }: { lang: Lang; step: FlagStep; onDone: (found: number, missed: FlagCategory[]) => () => void }) {
  const t = DT[lang];
  const [tapped, setTapped] = useState<Set<number>>(new Set());
  const [wrongTap, setWrongTap] = useState<number | null>(null);
  const [next, setNext] = useState<null | (() => void)>(null);
  const flagIdx = step.segments.map((s, i) => s.flag ? i : -1).filter(i => i >= 0);
  const found = flagIdx.filter(i => tapped.has(i)).length;
  const revealed = !!next;
  return (
    <div className="space-y-3">
      <p className="font-semibold font-lao">{step.prompt[lang]} <span className="text-primary">{found}/{flagIdx.length} {t.found}</span></p>
      <div className="rounded-3xl bg-card border-2 border-border p-4 text-[17px] leading-loose font-lao">
        {step.segments.map((s, i) => {
          const hit = tapped.has(i);
          const cls = hit ? 'bg-red-500 text-white daily-pop' : revealed && s.flag ? 'bg-amber-200 dark:bg-amber-800 underline decoration-wavy' : wrongTap === i ? 'daily-shake bg-muted' : 'hover:bg-primary/10';
          return <span key={i} role="button" tabIndex={0} onClick={() => {
            if (revealed || hit) return;
            if (s.flag) { setTapped(new Set(tapped).add(i)); haptic(true); } else { setWrongTap(i); haptic(false); setTimeout(() => setWrongTap(null), 400); }
          }} className={`daily-flag cursor-pointer ${cls}`}>{s.text[lang]}</span>;
        })}
      </div>
      {tapped.size > 0 && <div className="flex flex-wrap gap-1.5">{[...tapped].map(i => <span key={i} className="daily-pop text-xs font-semibold rounded-full bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-300 px-2.5 py-1 inline-flex items-center gap-1"><Flag size={12} />{FLAG_LABEL[step.segments[i].flag!][lang]}</span>)}</div>}
      {!revealed
        ? <button onClick={() => { const miss = flagIdx.filter(i => !tapped.has(i)).map(i => step.segments[i].flag!); setNext(() => onDone(found, miss)); }} className="daily-btn w-full rounded-2xl daily-grad text-white font-bold">{t.done}</button>
        : <button onClick={next} className="daily-btn daily-in w-full rounded-2xl daily-grad text-white font-bold">{t.next} →</button>}
    </div>
  );
}
