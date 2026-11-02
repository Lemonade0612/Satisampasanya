import { useState } from 'react';
import mini from '../data/minigames.json';
import { Guide, TrustMeter, TopBar, haptic, type Mood } from '../components/ui';
import { DT } from '../i18n';
import { track } from '../lib/analytics';
import type { Lang, QuickCard } from '../types';
import type { GameResult } from './StoryGame';

const cards = mini.quickfire as QuickCard[];

export function RealOrScam({ lang, onExit, onFinish }: { lang: Lang; onExit: () => void; onFinish: (r: GameResult) => void }) {
  const t = DT[lang];
  const [i, setI] = useState(0);
  const [answer, setAnswer] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [trust, setTrust] = useState(3);
  const card = cards[i];
  const right = answer !== null && answer === card.isScam;
  const mood: Mood = answer === null ? 'idle' : right ? 'happy' : 'sad';

  const pick = (saysScam: boolean) => {
    if (answer !== null) return;
    const ok = saysScam === card.isScam;
    setAnswer(saysScam); haptic(ok);
    track({ type: 'choice_made', scenarioId: `quick-${card.id}`, scamType: card.scamType, step: card.id, correct: ok });
    if (ok) setScore(s => s + 100); else setTrust(v => v - 1);
  };
  const next = () => {
    if (trust <= 0 || i + 1 >= cards.length) return onFinish({ score, total: cards.length, missed: [], failed: trust <= 0, scenarioIds: [] });
    setI(i + 1); setAnswer(null);
  };

  return (
    <div className="flex flex-col h-full">
      <TopBar onBack={onExit} lang={lang}><span className="font-bold">{i + 1}/{cards.length}</span><TrustMeter trust={trust} /></TopBar>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <Guide mood={mood} text={answer === null ? t.g_realorscam : `${right ? t.correct : t.wrong} ${card.why[lang]}`} />
        <div key={card.id} className={`daily-in rounded-3xl border-2 p-4 bg-card shadow-sm ${answer === null ? 'border-border' : right ? 'border-green-500' : 'border-red-500 daily-shake'}`}>
          <p className="text-xs text-muted-foreground mb-2">{card.sender}</p>
          <p className="text-[17px] font-lao leading-relaxed">{card.text[lang]}</p>
          {answer !== null && <p className="daily-pop mt-3 text-sm font-bold">{card.isScam ? `🚩 ${t.scam}` : `✅ ${t.safe}`}</p>}
        </div>
        {answer === null
          ? <div className="grid grid-cols-2 gap-3">
              <button onClick={() => pick(true)} className="daily-btn rounded-2xl bg-red-500 text-white font-bold text-lg shadow-[0_4px_0_#991b1b]">🚩 {t.scam}</button>
              <button onClick={() => pick(false)} className="daily-btn rounded-2xl bg-green-600 text-white font-bold text-lg shadow-[0_4px_0_#14532d]">✅ {t.safe}</button>
            </div>
          : <button onClick={next} className="daily-btn daily-in w-full rounded-2xl daily-grad text-white font-bold">{t.next} →</button>}
      </div>
    </div>
  );
}
