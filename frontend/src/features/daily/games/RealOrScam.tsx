import { useState } from 'react';
import { Camera, Flag, Flashlight, Lock, ShieldCheck, Signal, Wifi, BatteryFull } from 'lucide-react';
import logoImage from '/images/sati-mark.png';
import mini from '../data/minigames.json';
import { haptic } from '../components/ui';
import { Burst, Countdown } from '../components/juice';
import { Highlight } from '../components/feedback';
import { GameShell, MAX_LIVES } from '../components/GameShell';
import { FeedbackSheet } from '../components/FeedbackSheet';
import { STREAK_CONFETTI, shuffle } from '../../../../../shared/game-config.mjs';
import { track } from '../lib/analytics';
import { getAge, tier } from '../lib/age';
import { filterByBand } from '../../../lib/band';
import { sfx, useMusic } from '../lib/sound';
import type { Lang, QuickCard } from '../types';
import type { GameResult } from './StoryGame';

// Rounds: data/minigames.json → quickfire (lo + en). Order is shuffled every game.
const all = mini.quickfire as QuickCard[];
const SECONDS = 10, XP_RIGHT = 10;
const L = (lang: Lang, lo: string, en: string) => (lang === 'lo' ? lo : en);
const HUE = ['#2563EB', '#16A34A', '#B45309', '#5B21D1', '#DC2626', '#0891B2'];
const hueOf = (s: string) => HUE[[...s].reduce((a, c) => a + c.charCodeAt(0), 0) % HUE.length];

// A phone lock screen over a plain white page with a faint Sati watermark. Each message arrives as a notification,
// with an older one stacked behind it. Running out of the 10 seconds counts as wrong.
export function RealOrScam({ lang, onExit, onFinish }: { lang: Lang; onExit: () => void; onFinish: (r: GameResult) => void }) {
  const [cfg] = useState(tier);
  const [cards] = useState(() => shuffle(filterByBand(all, getAge())).slice(0, cfg.quick) as QuickCard[]);
  const [i, setI] = useState(0);
  const [answer, setAnswer] = useState<boolean | null>(null);
  const [late, setLate] = useState(false);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(MAX_LIVES);
  const [xp, setXp] = useState(0);
  const [combo, setCombo] = useState(0);
  const [seen, setSeen] = useState<{ why: string; ok: boolean }[]>([]);
  const card = cards[i], older = cards[i - 1];
  useMusic('tense');
  const right = answer !== null && !late && answer === card.isScam;

  const pick = (saysScam: boolean | null) => {
    if (answer !== null) return;
    const ok = saysScam === card.isScam;
    setAnswer(saysScam ?? !card.isScam); setLate(saysScam === null); haptic(ok);
    track({ type: 'choice_made', scenarioId: `quick-${card.id}`, scamType: card.scamType, step: card.id, correct: ok, scam: card.isScam });
    setSeen(l => [...l, { why: card.why[lang], ok }]);
    if (ok) { setScore(s => s + 100 + combo * 25); setXp(x => x + XP_RIGHT); setCombo(n => n + 1); } else { setLives(v => v - 1); setCombo(0); }
  };
  const lessons = () => [...new Set([...seen.filter(x => !x.ok), ...seen.filter(x => x.ok)].map(x => x.why))].slice(0, 3);
  const last = lives <= 0 || i + 1 >= cards.length;
  const next = () => {
    if (last) return onFinish({ score, total: cards.length, missed: [], failed: lives <= 0, scenarioIds: [], lessons: lessons() });
    setI(i + 1); setAnswer(null); setLate(false); sfx('whoosh');
  };
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, '0'), mm = String(now.getMinutes()).padStart(2, '0');
  const date = now.toLocaleDateString(lang === 'lo' ? 'lo-LA' : 'en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
  const ring = answer === null ? '' : right ? 'ring-4 ring-[#16A34A]' : 'ring-4 ring-[#DC2626] daily-shake';

  const Notif = ({ c, stacked }: { c: QuickCard; stacked?: boolean }) => <div className={`rounded-2xl p-3 shadow-md flex gap-3 ${stacked ? 'bg-white/80 scale-[.94]' : 'bg-white'}`}>
    <span aria-hidden className="w-10 h-10 shrink-0 rounded-[10px] flex items-center justify-center text-white font-extrabold text-lg" style={{ background: hueOf(c.sender) }}>{c.sender.trim()[0]?.toUpperCase() ?? '?'}</span>
    <span className="min-w-0 flex-1">
      <span className="flex items-baseline justify-between gap-2 text-[13px] text-[#5F6390]"><span className="truncate font-bold text-[#14112B]">{c.sender}</span><span className="shrink-0">{L(lang, 'ດຽວນີ້', 'now')}</span></span>
      <span className="block text-[1.0625rem] leading-relaxed text-[#14112B] break-words">{!stacked && answer !== null && c.isScam ? <Highlight text={c.text[lang]} part={c.redFlag?.[lang]} /> : stacked ? <span className="line-clamp-1">{c.text[lang]}</span> : c.text[lang]}</span>
    </span>
  </div>;

  return (
    <GameShell lang={lang} name={L(lang, 'ຈິງ ຫຼື ຫຼອກ?', 'Real or scam?')} index={i} total={cards.length} lives={lives} xp={xp} onExit={onExit} midGame>
      <div className="relative h-full overflow-y-auto bg-white">
        <img src={logoImage} alt="" aria-hidden className="pointer-events-none absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 w-[70%] max-w-[300px] opacity-[.15]" />
        <div className="relative p-4 grid gap-4 content-start">
          <div className="rounded-[36px] border-[6px] border-[#14112B] bg-gradient-to-b from-[#4C3D8F] to-[#1E1B4B] text-white px-4 pt-3 pb-4 shadow-xl">
            <div className="flex items-center justify-between text-[12px] font-bold"><span>{hh}:{mm}</span><span className="flex items-center gap-1.5" aria-hidden><Signal size={13} /><Wifi size={13} /><BatteryFull size={16} /></span></div>
            <div className="mt-2 flex flex-col items-center"><Lock size={18} aria-hidden /><p className="mt-1 text-[14px] text-white/85">{date}</p><p className="text-[4rem] leading-none font-extrabold tabular-nums tracking-tight">{hh}:{mm}</p></div>
            <div key={card.id} className="juice-slide relative mt-4 grid">
              {older && <div aria-hidden className="-mb-[52px] mx-3 relative z-0"><Notif c={older} stacked /></div>}
              <div className={`relative z-10 rounded-2xl ${ring}`}>{right && combo >= STREAK_CONFETTI && <Burst />}<Notif c={card} /></div>
            </div>
            <div className="mt-5 flex items-center justify-between px-1">
              <span aria-hidden className="w-11 h-11 rounded-full bg-black/35 flex items-center justify-center"><Flashlight size={20} /></span>
              <span aria-hidden className="w-11 h-11 rounded-full bg-black/35 flex items-center justify-center"><Camera size={20} /></span>
            </div>
            <span aria-hidden className="mx-auto mt-3 block h-1.5 w-28 rounded-full bg-white/70" />
          </div>
          {answer === null && cfg.quickSec > 0 && <Countdown key={card.id} seconds={SECONDS} onDone={() => pick(null)} label={L(lang, 'ໝົດເວລາ', "Time's up")} />}
          {answer === null && <div className="grid grid-cols-2 gap-3">
            <button type="button" onClick={() => pick(true)} className="rounded-2xl bg-[#DC2626] text-white font-bold text-[1.25rem] shadow-[0_5px_0_#991B1B] min-h-[68px] flex items-center justify-center gap-2 active:translate-y-[3px] active:shadow-[0_2px_0_#991B1B]"><Flag size={22} aria-hidden />{L(lang, 'ຫຼອກລວງ', 'Scam')}</button>
            <button type="button" onClick={() => pick(false)} className="rounded-2xl bg-[#16A34A] text-white font-bold text-[1.25rem] shadow-[0_5px_0_#14532D] min-h-[68px] flex items-center justify-center gap-2 active:translate-y-[3px] active:shadow-[0_2px_0_#14532D]"><ShieldCheck size={22} aria-hidden />{L(lang, 'ປອດໄພ', 'Safe')}</button>
          </div>}
        </div>
      </div>
      {answer !== null && <FeedbackSheet lang={lang} ok={right} late={late}
        subtitle={card.isScam ? L(lang, 'ຂໍ້ຄວາມນີ້ແມ່ນການຫຼອກລວງ', 'This message is a scam') : L(lang, 'ຂໍ້ຄວາມນີ້ປອດໄພ', 'This message is safe')}
        gain={right ? `+${XP_RIGHT} XP` : L(lang, '−1 ໂລ່', '−1 shield')} explanation={card.why[lang]}
        items={card.isScam && card.redFlag ? [{ ok: false, text: card.redFlag[lang], reason: L(lang, 'ສັນຍານອັນຕະລາຍ', 'Red flag') }] : undefined}
        tip={L(lang, 'ຢຸດກ່ອນ ແລ້ວກວດຜູ້ສົ່ງ ກ່ອນກົດ ຫຼື ຕອບ.', 'Pause and check the sender before you tap or reply.')}
        nextLabel={last ? L(lang, 'ເບິ່ງຜົນ', 'See results') : L(lang, 'ຕໍ່ໄປ', 'Next')} onNext={next} />}
    </GameShell>
  );
}
