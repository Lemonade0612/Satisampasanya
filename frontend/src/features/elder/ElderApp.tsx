import { useEffect, useRef, useState } from 'react';
import { ChevronRight, ClipboardPaste, Gift, Heart, MessageSquareWarning, Pause, Phone, PhoneCall, Plane, Play, RotateCcw, ShieldCheck, Smartphone, TrendingUp, type LucideIcon } from 'lucide-react';
import { laoDayNumber } from '../daily/lib/storage';
import { hasLaoAudio, preloadSpeech, speakParts, stopAll } from '../daily/lib/useSpeak';
import { getFamilyPhone, setSimpleMode, telLink } from '../../lib/simpleMode';
import type { ElderVerdict } from '../../lib/elderCheck';
import { BottomBar, Header, MainButton, Page, Steps, useElderSpeak, type Tab } from './ui';
import { ET, VERDICT, VIDEOS, durationLabel, tipForDay, videosForDay, type ElderVideo } from './text';
import { screenForElder } from './screen';
import type { Lang } from '../../types';

// Elder mode: a separate, very simple shell. Five screens (Home, Video, Check, Result, Learn) and a 3-tab bar.
// No feed, posts, comments, follows, feedback or contacts. Lao only.
type Route =
  | { tab: 'home' } | { tab: 'home'; video: string }
  | { tab: 'check' } | { tab: 'check'; checking: true } | { tab: 'check'; verdict: ElderVerdict }
  | { tab: 'learn' };

const ICONS: Record<string, LucideIcon> = {
  'grandchild-call': PhoneCall, 'bank-otp': MessageSquareWarning, 'prize-fee': Gift, investment: TrendingUp,
  'romance-gift': Heart, 'job-abroad': Plane, 'how-to-sati': Smartphone,
};

// `lang` is accepted for the shell's signature; elder mode is Lao-first and shows Lao only.
export function ElderApp(_: { lang?: Lang }) {
  const [route, setRoute] = useState<Route>({ tab: 'home' });
  const [text, setText] = useState('');
  const day = laoDayNumber();
  useEffect(() => { preloadSpeech(); }, []);
  const go = (tab: Tab) => { stopAll(); setRoute({ tab } as Route); };

  const run = async () => {
    const msg = text.trim();
    setRoute({ tab: 'check', checking: true });
    const started = Date.now();
    const r = await screenForElder(msg);
    // Keep the progress screen up long enough to be read.
    await new Promise(res => setTimeout(res, Math.max(0, 1500 - (Date.now() - started))));
    setRoute({ tab: 'check', verdict: r.verdict });
  };

  if ('checking' in route) return <Checking />;

  return (
    <div className="elder h-full flex flex-col">
      {route.tab === 'home' && ('video' in route
        ? <VideoScreen key={route.video} video={VIDEOS.find(v => v.id === route.video)!} onBack={() => go('home')}
            onNext={() => { const i = VIDEOS.findIndex(v => v.id === route.video); setRoute({ tab: 'home', video: VIDEOS[(i + 1) % VIDEOS.length].id }); }} />
        : <Home day={day} onCheck={() => go('check')} onVideo={id => setRoute({ tab: 'home', video: id })} />)}
      {route.tab === 'check' && ('verdict' in route
        ? <Result verdict={route.verdict} onBack={() => go('check')} onAgain={() => { setText(''); go('check'); }} />
        : <Check text={text} setText={setText} onRun={run} />)}
      {route.tab === 'learn' && <Learn day={day} />}
      <BottomBar tab={route.tab} onTab={go} />
    </div>
  );
}

// ---------- 1. Home ----------
function Poster({ video, big }: { video: ElderVideo; big?: boolean }) {
  const Icon = ICONS[video.id] ?? Play;
  if (video.poster) return <img src={video.poster} alt="" className="absolute inset-0 w-full h-full object-cover" />;
  return <span className="absolute inset-0 bg-[#3B0FA0] flex items-center justify-center text-white/30" aria-hidden><Icon size={big ? 120 : 34} /></span>;
}

function Home({ day, onCheck, onVideo }: { day: number; onCheck: () => void; onVideo: (id: string) => void }) {
  const [first, second] = videosForDay(day);
  return (
    <Page header={<Header title={ET.hello} listen={[ET.odd_q, ET.odd_tap, ET.videos_today, first.titleLo, second.titleLo]} />}>
      <button type="button" onClick={onCheck} className="w-full min-h-[5.5rem] rounded-[1.375rem] bg-[#EEF2FF] p-4 flex items-center gap-4 text-left">
        <span className="shrink-0 w-[3.75rem] h-[3.75rem] rounded-full bg-[#5B21D1] text-white flex items-center justify-center" aria-hidden><ShieldCheck size={32} /></span>
        <span className="flex-1 min-w-0">
          <span className="block text-[1.3125rem] font-bold leading-snug">{ET.odd_q}</span>
          <span className="block text-[1.125rem] font-bold text-[#3B0FA0]">{ET.odd_tap}</span>
        </span>
        <ChevronRight size={32} className="shrink-0 text-[#3B0FA0]" aria-hidden />
      </button>
      <h2 className="text-[1.5rem] font-bold leading-snug mt-1">{ET.videos_today}</h2>
      <button type="button" onClick={() => onVideo(first.id)} className="w-full text-left grid gap-2" aria-label={`${ET.play}: ${first.titleLo}`}>
        <span className="relative block h-[11.875rem] rounded-[1.375rem] overflow-hidden">
          <Poster video={first} big />
          <span className="absolute inset-0 flex items-center justify-center"><span className="w-20 h-20 rounded-full bg-white text-[#3B0FA0] flex items-center justify-center"><Play size={40} fill="currentColor" aria-hidden /></span></span>
          <span className="absolute right-3 bottom-3 rounded-full bg-white text-[#13112B] px-3 py-1 text-[1.125rem] font-bold">{durationLabel(first.durationSec)}</span>
        </span>
        <span className="block text-[1.375rem] font-bold leading-snug">{first.titleLo}</span>
      </button>
      <button type="button" onClick={() => onVideo(second.id)} className="w-full min-h-[5.5rem] rounded-[1.375rem] bg-white border border-[#E4E2EE] p-3 flex items-center gap-4 text-left">
        <span className="shrink-0 w-16 h-16 rounded-[1.125rem] bg-[#3B0FA0] text-white flex items-center justify-center" aria-hidden><Play size={30} fill="currentColor" /></span>
        <span className="flex-1 min-w-0">
          <span className="block text-[1.3125rem] font-bold leading-snug">{second.titleLo}</span>
          <span className="block text-[1.125rem] text-[#4B4870]">{durationLabel(second.durationSec)}</span>
        </span>
      </button>
    </Page>
  );
}

// ---------- 2. Video player ----------
// Real video when `src` exists; until then a slideshow of the poster with caption lines read aloud in Lao.
type PlayState = 'idle' | 'playing' | 'paused' | 'ended';
function VideoScreen({ video, onBack, onNext }: { video: ElderVideo; onBack: () => void; onNext: () => void }) {
  const [state, setState] = useState<PlayState>('idle');
  const [line, setLine] = useState(0);
  const [answer, setAnswer] = useState<number | null>(null);
  const ref = useRef<HTMLVideoElement>(null);
  const caps = video.captions;

  useEffect(() => {
    if (video.src || state !== 'playing') return;
    let alive = true, t = 0;
    const next = () => { if (!alive) return; if (line + 1 < caps.length) setLine(line + 1); else setState('ended'); };
    if (hasLaoAudio([caps[line]])) speakParts([caps[line]], 'lo', 'elder', () => { t = window.setTimeout(next, 600); });
    else t = window.setTimeout(next, 4000);
    return () => { alive = false; clearTimeout(t); stopAll(); };
  }, [state, line, video.src]); // eslint-disable-line react-hooks/exhaustive-deps

  const play = () => { if (state === 'ended' || state === 'idle') setLine(0); setAnswer(null); setState('playing'); if (video.src) void ref.current?.play(); };
  const pause = () => { setState('paused'); ref.current?.pause(); };
  const replay = () => { setAnswer(null); setLine(0); setState('playing'); if (ref.current) { ref.current.currentTime = 0; void ref.current.play(); } };
  const onTime = () => { const v = ref.current; if (v?.duration) setLine(Math.min(caps.length - 1, Math.floor((v.currentTime / v.duration) * caps.length))); };
  const Icon = ICONS[video.id] ?? Play;
  const ended = state === 'ended';

  if (ended) return <VideoQuestion video={video} answer={answer} setAnswer={setAnswer} onBack={onBack} onReplay={replay} onNext={onNext} />;
  return (
    <Page header={<Header title={video.titleLo} onBack={onBack} listen={caps} />}
      main={state === 'playing' ? <MainButton icon={<Pause />} label={ET.pause} onClick={pause} kind="secondary" />
        : <MainButton icon={<Play />} label={state === 'paused' ? ET.resume : ET.play} onClick={play} />}>
      <div className="relative h-[25rem] max-h-[60vh] rounded-[1.375rem] overflow-hidden bg-[#3B0FA0]">
        {video.src
          ? <video ref={ref} src={video.src} poster={video.poster} playsInline onTimeUpdate={onTime} onEnded={() => setState('ended')} className="absolute inset-0 w-full h-full object-cover" />
          : video.poster ? <img src={video.poster} alt="" className={`absolute inset-0 w-full h-full object-cover ${state === 'playing' ? 'elder-zoom' : ''}`} />
          : <span className={`absolute inset-0 flex items-center justify-center text-white ${state === 'playing' ? 'elder-zoom' : ''}`} aria-hidden><Icon size={150} strokeWidth={1.5} /></span>}
        {state === 'idle' && (
          <button type="button" onClick={play} aria-label={ET.play} className="absolute inset-0 flex items-center justify-center">
            <span className="w-24 h-24 rounded-full bg-white text-[#3B0FA0] flex items-center justify-center"><Play size={48} fill="currentColor" aria-hidden /></span>
          </button>
        )}
        {state !== 'idle' && (
          <p key={line} className="elder-fade absolute left-3 right-3 bottom-3 bg-black text-white rounded-[0.75rem] px-3 py-2 text-[1.25rem] leading-normal text-center" aria-live="polite">{caps[line]}</p>
        )}
      </div>
      <p className="text-[1.125rem] text-[#4B4870] text-center">{line + 1} / {caps.length}</p>
    </Page>
  );
}

function VideoQuestion({ video, answer, setAnswer, onBack, onReplay, onNext }: {
  video: ElderVideo; answer: number | null; setAnswer: (i: number) => void; onBack: () => void; onReplay: () => void; onNext: () => void;
}) {
  const right = answer === video.correctIndex;
  const explain = useElderSpeak([ET.not_quite, video.explainLo]);
  useEffect(() => { if (answer !== null && !right) explain.play(); }, [answer]); // eslint-disable-line react-hooks/exhaustive-deps
  const answered = answer !== null;
  return (
    <Page header={<Header title={video.titleLo} onBack={onBack} listen={answered ? (right ? [ET.great, video.explainLo] : [ET.not_quite, video.explainLo]) : [ET.what_do, video.question, ...video.answers]} />}
      main={!answered ? undefined : right ? <MainButton icon={<ChevronRight />} label={ET.next_video} onClick={onNext} />
        : <MainButton icon={<RotateCcw />} label={ET.watch_again} onClick={onReplay} />}>
      <h2 className="text-[1.5rem] font-bold leading-snug">{ET.what_do}</h2>
      <p className="text-[1.3125rem] leading-normal">{video.question}</p>
      {/* Both answers look the same until tapped; only then the right one turns green. */}
      <div className="grid grid-cols-2 gap-3">
        {video.answers.map((a, i) => {
          const won = answered && right && i === answer;
          return (
            <button key={i} type="button" onClick={() => setAnswer(i)} disabled={answered} aria-pressed={answer === i}
              className={`min-h-[4.75rem] rounded-[1.25rem] px-3 py-2 text-[1.25rem] font-bold leading-snug border-2 ${won ? 'bg-[#15803D] border-[#15803D] text-white' : 'bg-white border-[#E4E2EE] text-[#13112B]'}`}>{a}</button>
          );
        })}
      </div>
      {answered && right && <p role="status" className="text-[1.75rem] font-bold text-[#15803D] text-center">{ET.great}</p>}
      {answered && !right && (
        <section role="status" className="rounded-[1.375rem] bg-white border border-[#E4E2EE] p-5">
          <p className="text-[1.5rem] font-bold leading-snug">{ET.not_quite}</p>
          <p className="text-[1.25rem] leading-normal mt-2">{video.explainLo}</p>
        </section>
      )}
      {answered && <p className="text-[1.3125rem] font-bold text-center text-[#3B0FA0]">{ET.slogan}</p>}
    </Page>
  );
}

// ---------- 3. Check ----------
function Check({ text, setText, onRun }: { text: string; setText: (s: string) => void; onRun: () => void }) {
  const box = useRef<HTMLTextAreaElement>(null);
  const paste = async () => {
    try { const s = await navigator.clipboard.readText(); if (s) setText(s); } catch { /* refused: long-press paste still works */ }
    box.current?.focus();
  };
  const run = () => { if (text.trim()) onRun(); else box.current?.focus(); };
  return (
    <Page header={<Header title={ET.check_title} listen={[ET.paste_here, ET.paste_help]} />}
      main={<MainButton icon={<ShieldCheck />} label={ET.run} onClick={run} />}>
      <label htmlFor="elder-msg" className="text-[1.3125rem] font-bold leading-snug">{ET.paste_here}</label>
      <textarea id="elder-msg" ref={box} value={text} onChange={e => setText(e.target.value)}
        className="w-full min-h-[12.5rem] rounded-[1.25rem] border-2 border-[#5B21D1] bg-white p-4 text-[1.3125rem] leading-normal text-[#13112B] resize-y" />
      <button type="button" onClick={paste} className="w-full min-h-[4.5rem] rounded-[1.25rem] bg-[#EEF2FF] text-[#3B0FA0] text-[1.3125rem] font-bold flex items-center justify-center gap-3">
        <ClipboardPaste size={30} aria-hidden />{ET.paste}
      </button>
      <p className="text-[1.125rem] text-[#4B4870] text-center leading-normal">{ET.paste_help}</p>
    </Page>
  );
}

function Checking() {
  return (
    <div className="elder h-full flex flex-col items-center justify-center gap-6 px-8" role="status" aria-live="polite">
      <span className="w-24 h-24 rounded-full bg-[#5B21D1] text-white flex items-center justify-center" aria-hidden><ShieldCheck size={52} /></span>
      <p className="text-[1.625rem] font-bold">{ET.checking}</p>
      <div className="w-full h-4 rounded-full bg-[#EEF2FF] overflow-hidden"><div className="elder-bar h-full rounded-full bg-[#5B21D1]" /></div>
    </div>
  );
}

// ---------- 4. Result ----------
function Result({ verdict, onBack, onAgain }: { verdict: ElderVerdict; onBack: () => void; onAgain: () => void }) {
  const v = VERDICT[verdict];
  const phone = getFamilyPhone();
  return (
    <Page header={<Header title={ET.result_title} onBack={onBack} autoRead listen={[v.word, v.line, ET.do_this, ...v.steps]} />}
>
      <section role="status" className="rounded-[1.375rem] p-[1.375rem] text-white" style={{ background: v.bg }}>
        <p className="flex items-center gap-3 text-[2.125rem] font-bold leading-tight"><ShieldCheck size={40} aria-hidden />{v.word}</p>
        <p className="text-[1.375rem] leading-normal mt-2">{v.line}</p>
      </section>
      <h2 className="text-[1.3125rem] font-bold">{ET.do_this}</h2>
      <section className="rounded-[1.375rem] bg-white border border-[#E4E2EE] p-4"><Steps steps={v.steps} /></section>
      {/* Two buttons scroll with the result, so the verdict stays visible at large text sizes. */}
      <div className="grid gap-3 mt-2"><MainButton icon={<Phone />} label={ET.call} href={phone ? telLink(phone) : 'tel:'} /><MainButton icon={<RotateCcw />} label={ET.again} onClick={onAgain} kind="secondary" /></div>
    </Page>
  );
}

// ---------- 5. Learn ----------
// Only the tip card: the games keep small text and timers for other bands, so they stay out of Simple mode.
function Learn({ day }: { day: number }) {
  const tip = tipForDay(day);
  return (
    <Page header={<Header title={ET.learn_title} listen={[ET.tip_label, tip.headlineLo, ...tip.steps, ET.slogan]} />}>
      <section className="rounded-[1.375rem] bg-white border border-[#E4E2EE] p-5 grid gap-3">
        <p className="text-[1.125rem] font-bold text-[#5B21D1]">{ET.tip_label}</p>
        <p className="text-[1.4375rem] font-bold leading-snug">{tip.headlineLo}</p>
        <Steps steps={tip.steps} />
        <p className="text-[1.25rem] font-bold text-[#3B0FA0]">{ET.slogan}</p>
      </section>
      <button type="button" onClick={() => { stopAll(); setSimpleMode(false); }} className="self-center min-h-[4.5rem] px-4 text-[1.125rem] font-bold text-[#3B0FA0] underline mt-2">{ET.full_app}</button>
    </Page>
  );
}
