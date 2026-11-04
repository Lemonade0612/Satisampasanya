import { useState } from 'react';
import { CheckCircle2, Clock, Flag, ShieldCheck, XCircle } from 'lucide-react';
import mini from '../data/minigames.json';
import { TrustMeter, TopBar, haptic } from '../components/ui';
import { Burst, Combo, Countdown } from '../components/juice';
import { DT } from '../i18n';
import { track } from '../lib/analytics';
import { tier } from '../lib/age';
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
  const [cards] = useState(() => shuffle(all).slice(0, cfg.quick));
  const [i, setI] = useState(0);
  const [answer, setAnswer] = useState<boolean | null>(null);
  const [late, setLate] = useState(false);
  const [score, setScore] = useState(0);
  const [trust, setTrust] = useState(3);
  const [combo, setCombo] = useState(0);
  const card = cards[i];
  useMusic('tense');
  const right = answer !== null && !late && answer === card.isScam;

  const pick = (saysScam: boolean | null) => {
    if (answer !== null) return;
    const ok = saysScam === card.isScam;
    setAnswer(saysScam ?? !card.isScam); setLate(saysScam === null); haptic(ok);
    track({ type: 'choice_made', scenarioId: `quick-${card.id}`, scamType: card.scamType, step: card.id, correct: ok });
    if (ok) { setScore(s => s + 100 + combo * 25); setCombo(n => n + 1); } else { setTrust(v => v - 1); setCombo(0); }
  };
  const next = () => {
    if (trust <= 0 || i + 1 >= cards.length) return onFinish({ score, total: cards.length, missed: [], failed: trust <= 0, scenarioIds: [] });
    setI(i + 1); setAnswer(null); setLate(false); sfx('whoosh');
  };
  const hour = new Date().getHours();

  return (
    <div className="flex flex-col h-full">
      <TopBar onBack={onExit} lang={lang}><span className="font-bold tabular-nums">{i + 1}/{cards.length}</span><Combo n={combo} label={t.combo} /><TrustMeter trust={trust} /></TopBar>
      <div className="flex-1 overflow-y-auto p-4 grid gap-4 content-start">
        {/* A plain phone lock screen; each message slides in as a notification. */}
        <div className="relative rounded-[34px] p-3 pb-6 overflow-hidden shadow-xl border-[6px] border-slate-900 bg-slate-700 min-h-[19rem]">
          <div className="relative text-center text-white pt-2 pb-4">
            <p className="text-5xl font-extrabold tabular-nums tracking-tight">{String(hour).padStart(2, '0')}:{String((i * 7 + 12) % 60).padStart(2, '0')}</p>
          </div>
          <div key={card.id} className={`juice-slide relative rounded-2xl bg-white dark:bg-zinc-900 p-3 shadow-md ${answer === null ? '' : right ? 'ring-4 ring-emerald-400' : 'ring-4 ring-red-500 daily-shake'}`}>
            {right && <Burst />}
            <p className="text-xs font-bold text-muted-foreground mb-1 flex items-center justify-between"><span className="truncate">{card.sender}</span><span className="font-normal">now</span></p>
            <p className="text-[17px] font-lao leading-relaxed">{card.text[lang]}</p>
          </div>
        </div>

        {answer === null && cfg.quickSec > 0 && <Countdown key={card.id} seconds={cfg.quickSec} onDone={() => pick(null)} label={t.time_up} />}
        {answer === null
          ? <div className="grid grid-cols-2 gap-3">
              <button onClick={() => pick(true)} className="daily-btn rounded-2xl bg-red-500 text-white font-bold text-lg shadow-[0_4px_0_#991b1b] flex items-center justify-center gap-2"><Flag size={20} />{t.scam}</button>
              <button onClick={() => pick(false)} className="daily-btn rounded-2xl bg-green-600 text-white font-bold text-lg shadow-[0_4px_0_#14532d] flex items-center justify-center gap-2"><ShieldCheck size={20} />{t.safe}</button>
            </div>
          : <>
              <div className={`daily-pop rounded-2xl p-3 grid gap-1 font-lao ${right ? 'bg-emerald-50 dark:bg-emerald-950/40' : 'bg-red-50 dark:bg-red-950/40'}`}>
                <p className="font-extrabold flex items-center gap-2 text-lg">
                  {late ? <Clock size={22} className="text-red-600" /> : right ? <CheckCircle2 size={22} className="text-emerald-600" /> : <XCircle size={22} className="text-red-600" />}
                  {late ? t.time_up : right ? t.correct : t.wrong}
                  <span className={`ml-auto text-sm rounded-full px-2.5 py-0.5 text-white ${card.isScam ? 'bg-red-500' : 'bg-emerald-500'}`}>{card.isScam ? t.scam : t.safe}</span>
                </p>
                <p className="text-sm leading-relaxed">{card.why[lang]}</p>
              </div>
              <button onClick={next} className="daily-btn daily-in w-full rounded-2xl bg-primary text-primary-foreground font-bold shadow-[0_4px_0_#3B0FA0]">{t.next} →</button>
            </>}
      </div>
    </div>
  );
}
