import { useState } from 'react';
import { Flag, ShieldCheck } from 'lucide-react';
import mini from '../data/minigames.json';
import { TrustMeter, TopBar, haptic } from '../components/ui';
import { Burst, Combo, Countdown } from '../components/juice';
import { FeedbackCard, Highlight, ProgressBar } from '../components/feedback';
import { STREAK_CONFETTI } from '../../../../../shared/game-config.mjs';
import { DT } from '../i18n';
import { track } from '../lib/analytics';
import { getAge, tier } from '../lib/age';
import { filterByBand } from '../../../lib/band';
import { sfx, useMusic } from '../lib/sound';
import type { Lang, QuickCard } from '../types';
import type { GameResult } from './StoryGame';

const all = mini.quickfire as QuickCard[];
const shuffle = <T,>(a: T[]) => a.map(v => [Math.random(), v] as const).sort((x, y) => x[0] - y[0]).map(([, v]) => v);

// Messages arrive as notifications on a phone. Youth and adults race a timer; running out counts as wrong.
export function RealOrScam({ lang, onExit, onFinish }: { lang: Lang; onExit: () => void; onFinish: (r: GameResult) => void }) {
  const t = DT[lang];
  const [cfg] = useState(tier);
  // Fresh order every play so scam and safe cards never follow a pattern.
  const [cards] = useState(() => shuffle(filterByBand(all, getAge())).slice(0, cfg.quick));
  const [i, setI] = useState(0);
  const [answer, setAnswer] = useState<boolean | null>(null);
  const [late, setLate] = useState(false);
  const [score, setScore] = useState(0);
  const [trust, setTrust] = useState(3);
  const [combo, setCombo] = useState(0);
  const [seen, setSeen] = useState<{ why: string; ok: boolean }[]>([]);
  const card = cards[i];
  useMusic('tense');
  const right = answer !== null && !late && answer === card.isScam;

  const pick = (saysScam: boolean | null) => {
    if (answer !== null) return;
    const ok = saysScam === card.isScam;
    setAnswer(saysScam ?? !card.isScam); setLate(saysScam === null); haptic(ok);
    track({ type: 'choice_made', scenarioId: `quick-${card.id}`, scamType: card.scamType, step: card.id, correct: ok, scam: card.isScam });
    setSeen(l => [...l, { why: card.why[lang], ok }]);
    if (ok) { setScore(s => s + 100 + combo * 25); setCombo(n => n + 1); } else { setTrust(v => v - 1); setCombo(0); }
  };
  // The three lessons to take away: what you got wrong first, then what you got right.
  const lessons = () => [...new Set([...seen.filter(x => !x.ok), ...seen.filter(x => x.ok)].map(x => x.why))].slice(0, 3);
  const next = () => {
    if (trust <= 0 || i + 1 >= cards.length) return onFinish({ score, total: cards.length, missed: [], failed: trust <= 0, scenarioIds: [], lessons: lessons() });
    setI(i + 1); setAnswer(null); setLate(false); sfx('whoosh');
  };
  const hour = new Date().getHours();

  return (
    <div className="flex flex-col h-full">
      <TopBar onBack={onExit} lang={lang}><span className="font-bold tabular-nums">{i + 1}/{cards.length}</span><Combo n={combo} label={t.combo} /><span className="ml-auto font-extrabold tabular-nums text-primary" aria-label={t.score_label}>{score}</span><TrustMeter trust={trust} /></TopBar>
      <div className="flex-1 overflow-y-auto p-4 grid gap-4 content-start">
        <ProgressBar value={i + (answer === null ? 0 : 1)} max={cards.length} label={t.progress_label} />
        {/* A plain phone lock screen; each message slides in as a notification. */}
        <div className="relative rounded-[34px] p-4 pb-6 overflow-hidden shadow-xl border-[6px] border-slate-900 bg-slate-700 min-h-[19rem]">
          <div className="relative text-center text-white pt-2 pb-4">
            <p className="text-5xl font-extrabold tabular-nums tracking-tight">{String(hour).padStart(2, '0')}:{String((i * 7 + 12) % 60).padStart(2, '0')}</p>
          </div>
          <div key={card.id} className={`juice-slide relative rounded-2xl bg-white dark:bg-zinc-900 p-3 shadow-md ${answer === null ? '' : right ? 'ring-4 ring-emerald-400' : 'ring-4 ring-red-500 daily-shake'}`}>
            {right && combo >= STREAK_CONFETTI && <Burst />}
            <p className="text-xs font-bold text-muted-foreground mb-1 flex items-center justify-between"><span className="truncate">{card.sender}</span><span className="font-normal">{lang === "lo" ? "ດຽວນີ້" : "now"}</span></p>
            <p className="text-[19px] font-lao leading-relaxed">{answer !== null && card.isScam ? <Highlight text={card.text[lang]} part={card.redFlag?.[lang]} /> : card.text[lang]}</p>
          </div>
        </div>

        {answer === null && cfg.quickSec > 0 && <Countdown key={card.id} seconds={cfg.quickSec} onDone={() => pick(null)} label={t.time_up} />}
        {answer === null
          ? <div className="grid grid-cols-2 gap-3">
              <button onClick={() => pick(true)} className="daily-btn rounded-2xl bg-red-500 text-white font-bold text-lg shadow-[0_4px_0_#991b1b] min-h-16 flex items-center justify-center gap-2"><Flag size={20} />{t.scam}</button>
              <button onClick={() => pick(false)} className="daily-btn rounded-2xl bg-green-600 text-white font-bold text-lg shadow-[0_4px_0_#14532d] min-h-16 flex items-center justify-center gap-2"><ShieldCheck size={20} />{t.safe}</button>
            </div>
          : <FeedbackCard lang={lang} ok={right} late={late} why={card.why[lang]} onNext={next} last={trust <= 0 || i + 1 >= cards.length}
              flag={card.isScam && card.redFlag ? <Highlight text={card.redFlag[lang]} part={card.redFlag[lang]} /> : undefined}
              extra={<span className={`justify-self-start text-base font-bold rounded-full px-3 py-1 text-white ${card.isScam ? 'bg-red-600' : 'bg-emerald-600'}`}>{card.isScam ? t.scam : t.safe}</span>} />}
      </div>
    </div>
  );
}
