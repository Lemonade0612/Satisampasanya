import { useMemo, useState } from 'react';
import { Check, CheckCheck, Phone } from 'lucide-react';
import { haptic } from '../components/ui';
import { GameShell, MAX_LIVES } from '../components/GameShell';
import { FeedbackSheet } from '../components/FeedbackSheet';
import { FLAG_LABEL } from '../i18n';
import { track } from '../lib/analytics';
import { useMusic } from '../lib/sound';
import type { FlagCategory, FlagStep, Lang, Scenario } from '../types';
import type { GameResult } from './StoryGame';

// Red-flag hunt: one scam message in a WhatsApp-style chat per round. The text reads naturally; the red-flag phrases are
// ordinary-looking inline spans until tapped. Rounds are the `flags` steps of the scenarios (data/scenarios.json, live scenarios, band sessions).
type Round = { scenario: Scenario; step: FlagStep };
const L = (lang: Lang, lo: string, en: string) => (lang === 'lo' ? lo : en);
const XP_PER_FLAG = 5, XP_BONUS = 5;

export function FlagHunt({ lang, scenarios, onExit, onFinish }: { lang: Lang; scenarios: Scenario[]; onExit: () => void; onFinish: (r: GameResult) => void }) {
  const rounds = useMemo<Round[]>(() => scenarios.flatMap(scenario => scenario.steps.filter((s): s is FlagStep => s.kind === 'flags').map(step => ({ scenario, step }))), [scenarios]);
  const [i, setI] = useState(0);
  const [tapped, setTapped] = useState<Set<number>>(new Set());
  const [grey, setGrey] = useState<Set<number>>(new Set());
  const [checked, setChecked] = useState(false);
  const [lives, setLives] = useState(MAX_LIVES);
  const [xp, setXp] = useState(0);
  const [score, setScore] = useState(0);
  const [missed, setMissed] = useState<FlagCategory[]>([]);
  const [gain, setGain] = useState(0);
  useMusic('mystery');
  const r = rounds[i];
  if (!r) return null;
  const segs = r.step.segments;
  const flagIdx = segs.map((s, k) => (s.flag ? k : -1)).filter(k => k >= 0);
  const found = flagIdx.filter(k => tapped.has(k)).length, total = flagIdx.length;
  const miss = flagIdx.filter(k => !tapped.has(k));
  const allFound = miss.length === 0;
  const last = i + 1 >= rounds.length || (checked && !allFound && lives <= 1);

  const tap = (k: number) => {
    if (checked || tapped.has(k) || grey.has(k)) return;
    if (segs[k].flag) { setTapped(new Set(tapped).add(k)); haptic(true); } else { setGrey(new Set(grey).add(k)); haptic(false); }
  };
  const check = () => {
    const earned = found * XP_PER_FLAG + (allFound ? XP_BONUS : 0);
    setGain(earned); setChecked(true); setXp(x => x + earned); setScore(s => s + found * 50);
    miss.forEach(k => track({ type: 'flag_missed', scenarioId: r.scenario.id, flag: segs[k].flag! }));
    if (!allFound) { setLives(v => v - 1); setMissed(m => [...m, ...miss.map(k => segs[k].flag!)]); }
    haptic(allFound);
  };
  const next = () => {
    const failed = !allFound && lives <= 0 ;
    if (i + 1 >= rounds.length || failed) return onFinish({ score, total: rounds.length, missed, failed, scenarioIds: rounds.slice(0, i + 1).map(x => x.scenario.id), lessons: [...new Set(rounds.slice(0, i + 1).map(x => x.scenario.explanation[lang]))].slice(0, 3) });
    setI(i + 1); setTapped(new Set()); setGrey(new Set()); setChecked(false);
  };

  return (
    <GameShell lang={lang} name={L(lang, 'ຊອກສັນຍານອັນຕະລາຍ', 'Red-flag hunt')} index={i} total={rounds.length} lives={lives} xp={xp} onExit={onExit} midGame>
      <div className="h-full overflow-y-auto bg-[#ECE5DD] p-3 grid content-start gap-3">
        <div className="flex items-center gap-3 rounded-xl bg-[#075E54] text-white px-3 py-2">
          <span aria-hidden className="w-9 h-9 rounded-full bg-white/25 flex items-center justify-center"><Phone size={18} /></span>
          <span className="min-w-0"><span className="block font-bold truncate">{r.scenario.contact}</span><span className="block text-[12px] text-white/80">{L(lang, 'ຂໍ້ຄວາມ', 'message')}</span></span>
        </div>
        <p role="note" className="mx-auto max-w-[92%] rounded-lg bg-[#FFF4C2] px-3 py-2 text-center text-[13px] leading-snug text-[#5B4B00]">{L(lang, 'ເບີນີ້ບໍ່ຢູ່ໃນລາຍຊື່ຂອງທ່ານ. ຢ່າຮີບເຊື່ອ.', 'This number is not in your contacts. Do not trust it yet.')}</p>
        <h1 className="px-1 text-[1.125rem] font-bold text-[#14112B] leading-snug">{r.step.prompt[lang]}</h1>
        <div className="max-w-[94%] rounded-2xl rounded-tl-sm bg-white px-3.5 pt-3 pb-1.5 shadow-sm">
          <p className="text-[1.125rem] leading-[1.9] text-[#14112B] break-words">
            {segs.map((s, k) => {
              const hit = tapped.has(k), missedFlag = checked && s.flag && !hit, greyed = grey.has(k);
              const cls = hit ? 'bg-[#FCA5A5] text-[#7F1D1D] font-bold' : missedFlag ? 'outline outline-2 outline-[#DC2626] bg-[#FEE2E2]' : greyed ? 'text-[#9CA3AF] bg-[#F3F4F6]' : '';
              return <span key={k} role="button" tabIndex={checked ? -1 : 0} aria-pressed={hit} onClick={() => tap(k)} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); tap(k); } }}
                className={`rounded px-0.5 py-0.5 box-decoration-clone transition-colors ${checked ? '' : 'cursor-pointer'} ${cls}`}>{s.text[lang]}</span>;
            })}
          </p>
          <p className="mt-1 flex items-center justify-end gap-1 text-[12px] text-[#6B7280]">10:42 <CheckCheck size={14} aria-hidden className="text-[#53BDEB]" /></p>
        </div>
        <div className="flex items-center justify-between gap-3 rounded-2xl bg-white p-3">
          <span aria-live="polite" className="flex items-center gap-2 text-[1rem] font-extrabold tabular-nums text-[#14112B]">{found}/{total}
            <span className="flex gap-1.5" aria-hidden>{Array.from({ length: total }, (_, k) => <span key={k} className={`w-3 h-3 rounded-full ${k < found ? 'bg-[#DC2626]' : 'bg-[#D1D5DB]'}`} />)}</span></span>
          <span className="text-[13px] text-[#5F6390]">{L(lang, 'ແຕະຄຳທີ່ໜ້າສົງໄສ', 'Tap the suspicious words')}</span>
        </div>
        {!checked && <button type="button" onClick={check} className="w-full min-h-14 rounded-2xl bg-[#5B21D1] text-white text-[1.125rem] font-bold shadow-[0_5px_0_#3B0E91] active:translate-y-[3px] active:shadow-[0_2px_0_#3B0E91] flex items-center justify-center gap-2"><Check size={20} aria-hidden />{L(lang, 'ກວດຄຳຕອບ', 'Check answers')}</button>}
      </div>
      {checked && <FeedbackSheet lang={lang} ok={allFound}
        title={allFound ? L(lang, 'ເກັ່ງຫຼາຍ!', 'Well spotted!') : L(lang, `ພົບ ${found} ຈາກ ${total}`, `Found ${found} of ${total}`)}
        subtitle={L(lang, `ສັນຍານອັນຕະລາຍທັງ ${total} ຢ່າງ`, `All ${total} red flags`)}
        gain={allFound ? `+${gain} XP` : L(lang, '−1 ໂລ່', '−1 shield')} gainTone={allFound ? 'good' : 'bad'}
        explanation={r.scenario.explanation[lang]}
        items={flagIdx.map(k => ({ ok: tapped.has(k), text: segs[k].text[lang], reason: FLAG_LABEL[segs[k].flag!][lang] }))}
        tip={L(lang, 'ຄວາມເລັ່ງດ່ວນ, ເງິນລ່ວງໜ້າ ແລະ ຄວາມລັບ ແມ່ນສັນຍານຂອງການຫຼອກລວງ.', 'Urgency, upfront money and secrecy are classic scam signs.')}
        nextLabel={last ? L(lang, 'ເບິ່ງຜົນ', 'See results') : L(lang, 'ຕໍ່ໄປ', 'Next')} onNext={next} />}
    </GameShell>
  );
}
