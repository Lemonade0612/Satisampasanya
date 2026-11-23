import { useMemo, useState } from 'react';
import { Flag, Lock, LockOpen, ShieldCheck, Check, X } from 'lucide-react';
import linkData from '../data/link-hunt.json';
import { haptic } from '../components/ui';
import { Burst } from '../components/juice';
import { GameShell, MAX_LIVES } from '../components/GameShell';
import { FeedbackSheet, type FeedbackItem } from '../components/FeedbackSheet';
import { track } from '../lib/analytics';
import { tier } from '../lib/age';
import { useMusic } from '../lib/sound';
import { STREAK_CONFETTI, pickLinkRounds, realDomain, shuffle } from '../../../../../shared/game-config.mjs';
import type { Lang } from '../types';
import type { GameResult } from './StoryGame';

// Rounds live in data/link-hunt.json: `links` are Real/Fake rounds, `choiceRounds` are multiple choice ("which link is real",
// "which part is fake"). Add rounds there; no code change needed. Order and options are shuffled every game.
export type HuntLink = { url: string; isReal: boolean; explanation_lo: string; explanation_en: string; redFlagPart: string };
export type ChoiceRound = { id: string; kind: 'which_real' | 'which_part'; url?: string; prompt_lo: string; prompt_en: string; options: string[]; answer: number; realPart: string; explanation_lo: string; explanation_en: string; tip_lo: string; tip_en: string };
type Round = { kind: 'binary'; link: HuntLink } | { kind: 'choice'; c: ChoiceRound; order: number[] };
const pool = linkData.links as HuntLink[];
const choices = (linkData as { choiceRounds?: ChoiceRound[] }).choiceRounds ?? [];
const XP_RIGHT = 10;
const L = (lang: Lang, lo: string, en: string) => (lang === 'lo' ? lo : en);

// Browser address-bar mock. `mark` colours one part of the link after the answer (green = real domain, red = the fake one).
function AddressBar({ url, mark, tone, state }: { url: string; mark?: string; tone?: 'good' | 'bad'; state?: 'idle' | 'good' | 'bad' }) {
  const at = mark ? url.indexOf(mark) : -1;
  const secure = url.startsWith('https://');
  const ring = state === 'good' ? 'border-[#16A34A] bg-[#F0FDF4]' : state === 'bad' ? 'border-[#DC2626] bg-[#FEF2F2]' : 'border-[#E6E6F0] bg-white';
  return <div className={`flex items-center gap-2 rounded-full border-2 px-3 min-h-12 ${ring}`}>
    {secure ? <Lock size={16} aria-hidden className="shrink-0 text-[#5F6390]" /> : <LockOpen size={16} aria-hidden className="shrink-0 text-[#B45309]" />}
    <span className="font-mono text-[1rem] leading-snug break-all select-text min-w-0">
      {at < 0 ? url : <>{url.slice(0, at)}<mark className={`rounded px-0.5 font-extrabold ${tone === 'good' ? 'bg-[#BBF7D0] text-[#14532D]' : 'bg-[#FECACA] text-[#7F1D1D]'}`}>{mark}</mark>{url.slice(at + mark!.length)}</>}
    </span>
  </div>;
}

function BrowserFrame({ children }: { children: React.ReactNode }) {
  return <div className="rounded-3xl bg-white border border-[#E6E6F0] shadow-sm overflow-hidden">
    <div className="flex items-center gap-1.5 bg-[#F1F1F6] px-4 py-2"><span aria-hidden className="w-2.5 h-2.5 rounded-full bg-[#F87171]" /><span aria-hidden className="w-2.5 h-2.5 rounded-full bg-[#FBBF24]" /><span aria-hidden className="w-2.5 h-2.5 rounded-full bg-[#4ADE80]" /></div>
    <div className="p-4 grid gap-3">{children}</div>
  </div>;
}

export function LinkDetective({ lang, onExit, onFinish }: { lang: Lang; onExit: () => void; onFinish: (r: GameResult) => void }) {
  const rounds = useMemo<Round[]>(() => {
    const bin = pickLinkRounds(pool, tier().quick).map((link: HuntLink): Round => ({ kind: 'binary', link }));
    const ch = shuffle(choices).slice(0, 2).map((c: ChoiceRound): Round => ({ kind: 'choice', c, order: shuffle(c.options.map((_, k) => k)) }));
    return shuffle([...bin, ...ch]);
  }, []);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | boolean | null>(null); // binary: true = "real"; choice: option index
  const [lives, setLives] = useState(MAX_LIVES);
  const [xp, setXp] = useState(0);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [seen, setSeen] = useState<{ why: string; ok: boolean }[]>([]);
  useMusic('mystery');
  const r = rounds[i];

  const result = (): { ok: boolean; why: string } | null => {
    if (picked === null) return null;
    if (r.kind === 'binary') return { ok: picked === r.link.isReal, why: L(lang, r.link.explanation_lo, r.link.explanation_en) };
    return { ok: r.c.options[picked as number] === r.c.options[r.c.answer], why: L(lang, r.c.explanation_lo, r.c.explanation_en) };
  };
  const res = result();
  const answer = (v: number | boolean) => {
    if (picked !== null) return;
    const ok = r.kind === 'binary' ? v === r.link.isReal : v === r.c.answer;
    setPicked(v); haptic(ok);
    const id = r.kind === 'binary' ? `link-${i}` : r.c.id;
    track({ type: 'choice_made', scenarioId: id, scamType: 'bank_phishing', step: r.kind === 'binary' ? r.link.url : r.c.prompt_en, correct: ok });
    setSeen(s => [...s, { why: r.kind === 'binary' ? L(lang, r.link.explanation_lo, r.link.explanation_en) : L(lang, r.c.explanation_lo, r.c.explanation_en), ok }]);
    if (ok) { setScore(s => s + 100 + combo * 25); setXp(x => x + XP_RIGHT); setCombo(n => n + 1); }
    else { setLives(v => v - 1); setCombo(0); track({ type: 'flag_missed', scenarioId: id, flag: 'suspicious_link' }); }
  };
  const lessons = () => [...new Set([...seen.filter(x => !x.ok), ...seen.filter(x => x.ok)].map(x => x.why))].slice(0, 3);
  const last = lives <= 0 || i + 1 >= rounds.length;
  const next = () => {
    if (last) return onFinish({ score, total: rounds.length, missed: seen.some(x => !x.ok) ? ['suspicious_link'] : [], failed: lives <= 0, scenarioIds: [], lessons: lessons() });
    setI(i + 1); setPicked(null);
  };

  // What to highlight in the address bar once the answer is in.
  const mark = r.kind === 'binary' ? { part: realDomain(r.link.url), tone: (r.link.isReal ? 'good' : 'bad') as 'good' | 'bad' } : r.kind === 'choice' && r.c.kind === 'which_part' ? { part: r.c.realPart, tone: 'bad' as const } : null;
  const items: FeedbackItem[] | undefined = r.kind === 'choice' && r.c.kind === 'which_real' && picked !== null
    ? [...(res && !res.ok ? [{ ok: false, text: <span className="font-mono break-all">{r.c.options[picked as number]}</span>, reason: L(lang, 'ອັນນີ້ບໍ່ແມ່ນ.', 'Not this one.') }] : []), { ok: true, text: <span className="font-mono break-all">{r.c.options[r.c.answer]}</span>, reason: L(lang, 'ອັນນີ້ແມ່ນຂອງແທ້.', 'This one is real.') }]
    : undefined;
  const tip = r.kind === 'choice' ? L(lang, r.c.tip_lo, r.c.tip_en) : L(lang, 'ອ່ານໂດເມນ: ສິ່ງທີ່ຢູ່ກ່ອນເຄື່ອງໝາຍ “/” ອັນທຳອິດ.', 'Read the domain: what sits before the first single “/”.');

  return (
    <GameShell lang={lang} name={L(lang, 'ນັກສືບລິ້ງ', 'Link Detective')} index={i} total={rounds.length} lives={lives} xp={xp} onExit={onExit} midGame>
      <div className="h-full overflow-y-auto px-4 pt-[18px] pb-4 grid gap-3.5 content-start">
        <h1 className="text-[21px] leading-[1.4] font-bold">{r.kind === 'binary' ? L(lang, 'ລິ້ງນີ້ແທ້ ຫຼື ປອມ?', 'Is this link real or fake?') : L(lang, r.c.prompt_lo, r.c.prompt_en)}</h1>
        <div key={i} className="daily-in relative">
          {res?.ok && combo >= STREAK_CONFETTI && <Burst />}
          {r.kind === 'binary' && <>
            <BrowserFrame><AddressBar url={r.link.url} mark={picked !== null ? mark!.part : undefined} tone={mark?.tone} /><div aria-hidden className="grid gap-2"><span className="h-3 w-2/3 rounded bg-[#ECECF4]" /><span className="h-3 w-full rounded bg-[#ECECF4]" /><span className="h-3 w-5/6 rounded bg-[#ECECF4]" /></div></BrowserFrame>
            {picked === null && <div className="mt-4 grid grid-cols-2 gap-3">
              <button type="button" onClick={() => answer(false)} className="rounded-2xl bg-[#E54848] text-white font-bold text-[17px] shadow-[0_5px_0_#A52A2A] min-h-14 flex items-center justify-center gap-2 active:translate-y-[3px] active:shadow-[0_2px_0_#A52A2A]"><Flag size={20} aria-hidden />{L(lang, 'ປອມ', 'Fake')}</button>
              <button type="button" onClick={() => answer(true)} className="rounded-2xl bg-[#3FA34D] text-white font-bold text-[17px] shadow-[0_5px_0_#2A6E34] min-h-14 flex items-center justify-center gap-2 active:translate-y-[3px] active:shadow-[0_2px_0_#2A6E34]"><ShieldCheck size={20} aria-hidden />{L(lang, 'ຂອງແທ້', 'Real')}</button>
            </div>}
          </>}
          {r.kind === 'choice' && r.c.kind === 'which_part' && <>
            <BrowserFrame><AddressBar url={r.c.url!} mark={picked !== null ? r.c.realPart : undefined} tone="bad" /></BrowserFrame>
            <div className="mt-4 grid gap-3">{r.order.map(k => <OptionButton key={k} label={r.c.options[k]} mono state={picked === null ? 'idle' : k === r.c.answer ? 'good' : picked === k ? 'bad' : 'dim'} onClick={() => answer(k)} />)}</div>
          </>}
          {r.kind === 'choice' && r.c.kind === 'which_real' &&
            <div className="grid gap-3">{r.order.map(k => <OptionButton key={k} label={r.c.options[k]} mono address state={picked === null ? 'idle' : k === r.c.answer ? 'good' : picked === k ? 'bad' : 'dim'} onClick={() => answer(k)} />)}</div>}
        </div>
      </div>
      {res && <FeedbackSheet lang={lang} ok={res.ok}
        subtitle={r.kind === 'binary' ? L(lang, r.link.isReal ? 'ລິ້ງນີ້ເປັນຂອງແທ້' : 'ລິ້ງນີ້ເປັນຂອງປອມ', r.link.isReal ? 'This link is real' : 'This link is fake') : undefined}
        gain={res.ok ? `+${XP_RIGHT} XP` : L(lang, '−1 ໂລ່', '−1 shield')} explanation={res.why} items={items} tip={tip}
        extra={r.kind === 'binary' ? <p className="mt-3 text-[1.0625rem] leading-relaxed"><span className="font-extrabold">{L(lang, 'ໂດເມນຈິງ: ', 'Real domain: ')}</span><span className="font-mono font-bold break-all">{realDomain(r.link.url)}</span></p> : undefined}
        nextLabel={last ? L(lang, 'ເບິ່ງຜົນ', 'See results') : L(lang, 'ຕໍ່ໄປ', 'Next')} onNext={next} />}
    </GameShell>
  );
}

function OptionButton({ label, mono, address, state, onClick }: { label: string; mono?: boolean; address?: boolean; state: 'idle' | 'good' | 'bad' | 'dim'; onClick: () => void }) {
  const tone = state === 'good' ? 'border-[#16A34A] bg-[#F0FDF4]' : state === 'bad' ? 'border-[#DC2626] bg-[#FEF2F2]' : state === 'dim' ? 'border-[#E6E6F0] bg-white opacity-60' : 'border-[#E6E6F0] bg-white';
  return <button type="button" disabled={state !== 'idle'} onClick={onClick} className={`w-full min-h-14 rounded-2xl border-2 px-4 py-3 flex items-center gap-3 text-left ${tone} ${state === 'idle' ? 'active:translate-y-[2px] shadow-[0_4px_0_#E6E6F0]' : ''}`}>
    {address && <Lock size={16} aria-hidden className="shrink-0 text-[#5F6390]" />}
    <span className={`flex-1 min-w-0 text-[1.0625rem] font-bold break-all ${mono ? 'font-mono' : ''}`}>{label}</span>
    {state === 'good' && <Check size={22} aria-hidden strokeWidth={3} className="shrink-0 text-[#16A34A]" />}
    {state === 'bad' && <X size={22} aria-hidden strokeWidth={3} className="shrink-0 text-[#DC2626]" />}
  </button>;
}
