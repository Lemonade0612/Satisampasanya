import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, CirclePlus, Image as ImageIcon, Phone, ThumbsUp, Video } from 'lucide-react';
import storyData from '../data/story-chat.json';
import { haptic } from '../components/ui';
import { GameShell, MAX_LIVES } from '../components/GameShell';
import { FeedbackSheet } from '../components/FeedbackSheet';
import { shuffle } from '../../../../../shared/game-config.mjs';
import { track } from '../lib/analytics';
import { useMusic } from '../lib/sound';
import type { ChatStep, Lang, Scenario } from '../types';
import type { GameResult } from './StoryGame';

// Realistic Messenger thread. Each round: a typing indicator, then the messages one by one (grouped bubbles, avatar on the last
// bubble of a group), then quick replies above a fake composer. The player's reply gets a "Seen" receipt.
// Rounds: data/story-chat.json (the escalating job → fee → secrecy → pickup story) or the chat steps of today's scenarios.
type Msg = { from: 'them' | 'me'; text: string };
type Round = { id: string; messages: string[]; prompt: string; choices: { id: string; text: string; correct: boolean; consequence: string }[]; scenarioId: string; contact: string; request: boolean; explanation: string };
const L = (lang: Lang, lo: string, en: string) => (lang === 'lo' ? lo : en);
const XP_RIGHT = 10;
const reduce = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
const wait = (ms: number) => new Promise<void>(r => setTimeout(r, reduce() ? Math.min(ms, 80) : ms));

function buildRounds(lang: Lang, scenarios: Scenario[], featured: boolean): Round[] {
  if (featured) return storyData.rounds.map(r => ({ id: r.id, scenarioId: storyData.id, contact: storyData.contact, request: true, explanation: storyData.explanation[lang],
    messages: r.messages.map(m => m[lang]), prompt: r.prompt[lang], choices: shuffle(r.choices).map(c => ({ id: c.id, correct: c.correct, text: c.text[lang], consequence: c.consequence[lang] })) }));
  return scenarios.flatMap(s => s.steps.filter((x): x is ChatStep => x.kind === 'chat').map(step => ({ id: `${s.id}-${step.id}`, scenarioId: s.id, contact: s.contact, request: true, explanation: s.explanation[lang],
    messages: step.messages.filter(m => m.from !== 'me').map(m => m.text[lang]), prompt: step.prompt[lang], choices: shuffle(step.choices).map(c => ({ id: c.id, correct: c.correct, text: c.text[lang], consequence: c.consequence[lang] })) })));
}

export function StoryChat({ lang, scenarios, featured, onExit, onFinish }: { lang: Lang; scenarios: Scenario[]; featured: boolean; onExit: () => void; onFinish: (r: GameResult) => void }) {
  const rounds = useMemo(() => buildRounds(lang, scenarios, featured), [lang, scenarios, featured]);
  const [i, setI] = useState(0);
  const [thread, setThread] = useState<Msg[]>([]);
  const [typing, setTyping] = useState(false);
  const [ready, setReady] = useState(false);          // quick replies visible
  const [picked, setPicked] = useState<number | null>(null);
  const [seen, setSeen] = useState(false);
  const [lives, setLives] = useState(MAX_LIVES);
  const [xp, setXp] = useState(0);
  const [score, setScore] = useState(0);
  const [lessons, setLessons] = useState<string[]>([]);
  const end = useRef<HTMLDivElement>(null);
  const r = rounds[i];
  useMusic('mystery');

  useEffect(() => {
    if (!r) return;
    let live = true;
    (async () => {
      setReady(false); setPicked(null); setSeen(false);
      for (const text of r.messages) {
        setTyping(true); await wait(900); if (!live) return;
        setTyping(false); setThread(t => [...t, { from: 'them', text }]); await wait(450); if (!live) return;
      }
      setReady(true);
    })();
    return () => { live = false; };
  }, [i]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { end.current?.scrollIntoView({ behavior: reduce() ? 'auto' : 'smooth', block: 'end' }); }, [thread, typing, ready, picked]);

  if (!r) return null;
  const choice = picked === null ? null : r.choices[picked];
  const last = i + 1 >= rounds.length || (!!choice && !choice.correct && lives <= 1);
  const choose = (k: number) => {
    if (picked !== null) return;
    const c = r.choices[k];
    setPicked(k); setThread(t => [...t, { from: 'me', text: c.text }]); haptic(c.correct);
    track({ type: 'choice_made', scenarioId: r.scenarioId, scamType: 'overseas_recruitment', step: r.id, correct: c.correct });
    if (c.correct) { setScore(s => s + 100); setXp(x => x + XP_RIGHT); } else setLives(v => v - 1);
    setLessons(l => [...l, c.consequence]);
    setTimeout(() => setSeen(true), reduce() ? 0 : 700);
  };
  const next = () => {
    if (last) return onFinish({ score, total: rounds.length, missed: [], failed: lives <= 0, scenarioIds: [...new Set(rounds.slice(0, i + 1).map(x => x.scenarioId))], lessons: [...new Set([...lessons, r.explanation])].slice(0, 3) });
    setI(i + 1);
  };

  return (
    <GameShell lang={lang} name={L(lang, 'ແຊັດສະຕໍລີ', 'Story chat')} index={i} total={rounds.length} lives={lives} xp={xp} onExit={onExit} midGame>
      <div className="h-full flex flex-col bg-white">
        <div className="shrink-0 flex items-center gap-2 border-b border-[#E6E6F0] px-3 py-2">
          <ChevronLeft size={22} aria-hidden className="text-[#5B21D1]" />
          <Avatar name={r.contact} size={36} />
          <div className="min-w-0 flex-1"><p className="truncate font-bold text-[#14112B]">{r.contact}</p><p className="text-[12px] text-[#5F6390]">{L(lang, 'ຄຳຂໍຂໍ້ຄວາມ', 'Message request')}</p></div>
          <Phone size={20} aria-hidden className="text-[#5B21D1]" /><Video size={22} aria-hidden className="text-[#5B21D1]" />
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto px-3 py-3">
          <div className="text-center mb-3.5">
            <span className="inline-flex w-16 h-16 rounded-full text-white text-[20px] font-extrabold items-center justify-center font-[BoonHome,sans-serif]" style={{ background: 'linear-gradient(135deg, #F59E0B, #EF4444)' }}>{r.contact.split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase()}</span>
            <p className="mt-1.5 mb-0.5 text-[17px] font-bold font-[BoonHome,sans-serif]">{r.contact}</p>
            {r.request && <p className="text-[13px] leading-[1.5] text-[#6B6E8F]">{L(lang, 'ທ່ານບໍ່ແມ່ນໝູ່ກັນໃນເຟສບຸກ', 'You are not friends on Facebook')}<br />{L(lang, 'ບໍ່ມີໝູ່ຮ່ວມກັນ · ບັນຊີສ້າງເມື່ອ 2 ອາທິດກ່ອນ', 'No mutual friends · Account created 2 weeks ago')}</p>}
          </div>
          <div className="flex flex-col gap-0.5">
            {thread.map((m, k) => {
              const nextSame = thread[k + 1]?.from === m.from, prevSame = thread[k - 1]?.from === m.from;
              const mine = m.from === 'me';
              return <div key={k} className={`daily-bubble flex items-end gap-2 ${mine ? 'justify-end' : 'justify-start'} ${prevSame ? '' : 'mt-2'}`}>
                {!mine && (nextSame ? <span className="w-7 shrink-0" /> : <Avatar name={r.contact} size={28} />)}
                <p className={`max-w-[74%] px-[13px] py-[9px] text-[16px] leading-[1.5] break-words ${mine ? 'bg-[#5B21D1] text-white rounded-[18px] rounded-br-md' : 'bg-[#F0F0F5] text-[#14112B] rounded-[18px] rounded-bl-md'}`}>{m.text}</p>
              </div>;
            })}
            {typing && <div className="flex items-end gap-2 mt-2" role="status" aria-label={L(lang, 'ກຳລັງພິມ', 'typing')}><Avatar name={r.contact} size={28} />
              <span className="bg-[#F0F0F5] rounded-[18px] rounded-bl-md px-4 py-3 flex gap-1" aria-hidden>{[0, 1, 2].map(d => <span key={d} className="w-2 h-2 rounded-full bg-[#8E8EA8] animate-bounce motion-reduce:animate-none" style={{ animationDelay: `${d * 0.15}s` }} />)}</span></div>}
            {seen && <p className="mt-1 text-right text-[12px] text-[#5F6390]">{L(lang, 'ເຫັນແລ້ວ', 'Seen')}</p>}
          </div>
          <div ref={end} />
        </div>
        <div className="shrink-0 border-t border-[#E6E6F0] bg-white px-3 pt-2 pb-[max(10px,env(safe-area-inset-bottom))]">
          {ready && picked === null && <div className="daily-in mb-2">
            <p className="mb-2 text-[13px] font-bold text-[#5F6390]">{r.prompt}</p>
            <div className="flex flex-col gap-2">{r.choices.map((c, k) => <button key={c.id} type="button" onClick={() => choose(k)} className="w-full min-h-12 rounded-2xl border-2 border-[#0084FF] bg-white px-4 py-2 text-left text-[1.0625rem] font-bold text-[#5B21D1] active:bg-[#E7F3FF]">{c.text}</button>)}</div>
          </div>}
          <div aria-hidden className="flex items-center gap-2.5 pt-1"><CirclePlus size={22} className="text-[#5B21D1]" /><ImageIcon size={22} className="text-[#5B21D1]" /><span className="flex-1 h-[38px] rounded-full bg-[#F0F0F5] px-3.5 text-[15px] leading-[38px] text-[#8A8DB0]">Aa</span><ThumbsUp size={22} className="text-[#5B21D1]" /></div>
        </div>
      </div>
      {choice && <FeedbackSheet lang={lang} ok={choice.correct} gain={choice.correct ? `+${XP_RIGHT} XP` : L(lang, '−1 ໂລ່', '−1 shield')} explanation={choice.consequence}
        tip={L(lang, 'ຖ້າຮູ້ສຶກບໍ່ປອດໄພ: ຢຸດ, ເກັບແຊັດ, ບອກຜູ້ໃຫຍ່ທີ່ໄວ້ໃຈ ແລະ ໂທ 1533 ຫຼື 1362.', 'If it feels unsafe: stop, keep the chat, tell a trusted adult and call 1533 or 1362.')}
        nextLabel={last ? L(lang, 'ເບິ່ງຜົນ', 'See results') : L(lang, 'ຕໍ່ໄປ', 'Next')} onNext={next} />}
    </GameShell>
  );
}

function Avatar({ name, size }: { name: string; size: number }) {
  return <span aria-hidden className="shrink-0 rounded-full bg-gradient-to-br from-[#F472B6] to-[#8B5CF6] text-white font-extrabold flex items-center justify-center" style={{ width: size, height: size, fontSize: size * 0.42 }}>{name.trim()[0]?.toUpperCase()}</span>;
}
