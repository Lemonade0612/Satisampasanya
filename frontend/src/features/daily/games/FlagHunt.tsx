import { useMemo, useState } from 'react';
import { CheckCheck, ChevronLeft, Video } from 'lucide-react';
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
      <div className="h-full flex flex-col bg-[#EAE4DC]">
        <div className="shrink-0 flex items-center gap-2.5 px-3 py-2 bg-white border-b border-[#E5E1DA]">
          <ChevronLeft size={22} aria-hidden className="text-[#3F4268]" />
          <span aria-hidden className="flex w-[38px] h-[38px] rounded-full bg-[#F59E0B] text-white text-[13px] font-extrabold items-center justify-center font-[BoonHome,sans-serif]">{r.scenario.contact.split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase()}</span>
          <span className="flex-1 min-w-0"><span className="block text-[15px] font-bold truncate font-[BoonHome,sans-serif]">{r.scenario.contact}</span><span className="block text-[12px] text-[#6B6E8F]">{L(lang, 'ຂໍ້ຄວາມ', 'message')}</span></span>
          <Video size={22} aria-hidden className="text-[#3F4268]" />
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto px-3 pt-3 pb-4 flex flex-col gap-1.5">
          <div className="flex items-center gap-2.5 px-3 py-2.5 mb-1.5 rounded-[14px] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
            <span className="flex-1 text-[15px] font-bold">{r.step.prompt[lang]}</span>
            <span className="flex gap-1" aria-hidden>{Array.from({ length: total }, (_, k) => <span key={k} className={`w-2.5 h-2.5 rounded-full ${k < found ? 'bg-[#DC2626]' : 'bg-[#E3E1F0]'}`} />)}</span>
            <span aria-live="polite" className="text-[15px] font-extrabold text-[#DC2626] font-[BoonHome,sans-serif] tabular-nums">{found}/{total}</span>
          </div>
          <span className="self-center px-2.5 py-1 mt-0.5 mb-1.5 rounded-lg bg-white text-[12px] text-[#6B6E8F]">{L(lang, 'ມື້ນີ້', 'Today')}</span>
          <p role="note" className="self-center max-w-[90%] px-3 py-2 mb-2 rounded-lg bg-[#FFF3C4] text-center text-[12px] leading-[1.5] text-[#6B5A1E]">{L(lang, 'ເບີນີ້ບໍ່ຢູ່ໃນລາຍຊື່ຕິດຕໍ່ຂອງເຈົ້າ', 'This number is not in your contacts')}</p>
          <div className="max-w-[86%] self-start pt-2 pr-2.5 pb-1.5 pl-3 rounded-[0_12px_12px_12px] bg-white shadow-[0_1px_1px_rgba(0,0,0,0.08)] text-[16px] leading-[1.75]">
            <p className="break-words">
              {segs.map((s, k) => {
                const hit = tapped.has(k), missedFlag = checked && s.flag && !hit, greyed = grey.has(k);
                const cls = hit ? 'bg-[#FCA5A5] text-[#7F1D1D] font-bold' : missedFlag ? 'outline outline-2 outline-[#DC2626] bg-[#FEE2E2]' : greyed ? 'text-[#9CA3AF] bg-[#F3F4F6] line-through' : '';
                return <span key={k} role="button" tabIndex={checked ? -1 : 0} aria-pressed={hit} onClick={() => tap(k)} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); tap(k); } }}
                  className={`rounded px-0.5 py-0.5 box-decoration-clone transition-colors ${checked ? '' : 'cursor-pointer'} ${cls}`}>{s.text[lang]}</span>;
              })}
            </p>
            <p className="mt-1 flex items-center justify-end gap-1 text-[11px] text-[#8A8DB0] font-[BoonHome,sans-serif]">09:41 <CheckCheck size={14} aria-hidden className="text-[#53BDEB]" /></p>
          </div>
          {grey.size > 0 && <p className="self-center mt-1.5 text-[13px] text-[#6B6E8F]">{L(lang, 'ຄຳທີ່ຂີດທັບ ແມ່ນບໍ່ແມ່ນທຸງແດງ', 'Struck-through words are not red flags')}</p>}
        </div>
        {!checked && <div className="shrink-0 px-3.5 pt-3 pb-4 bg-white border-t border-[#E5E1DA]">
          <button type="button" onClick={check} className="w-full min-h-[54px] rounded-2xl text-white text-[16px] font-bold flex items-center justify-center gap-2" style={{ background: 'linear-gradient(90deg, #5B21D1, #6E8EF0)', boxShadow: '0 5px 0 #3B0E91' }}>{L(lang, 'ກວດຄຳຕອບ', 'Check answers')}</button>
        </div>}
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
