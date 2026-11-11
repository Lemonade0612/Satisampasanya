import { useEffect, useState, type ReactNode } from 'react';
import { ArrowLeft, ArrowRight, ClipboardPaste, GraduationCap, Phone, ShieldCheck, Volume2, VolumeX } from 'lucide-react';
import { SatiLogo } from '../../components/shared/Brand';
import { useBand } from '../../lib/band';
import { checkElderMessage, type ElderVerdict } from '../../lib/elderCheck';
import { familyPhoneAsked, getFamilyPhone, saveFamilyPhone, setSimpleMode, telLink } from '../../lib/simpleMode';
import { laoDayNumber } from '../daily/lib/storage';
import { useSpeak } from '../daily/lib/useSpeak';
import { ET, VERDICT, tipForToday } from './text';
import type { Lang, Post } from '../../types';

// Simple mode: replaces the whole app shell with two screens, home and check result (plus the paste step).
// Rules: body text >= 20px, touch targets >= 60px, contrast >= 4.5:1, icon + text always, max 3 actions per screen.
type Screen = { name: 'home' } | { name: 'paste' } | { name: 'practice' } | { name: 'result'; text: string; verdict: ElderVerdict };

// `examples`: the elder seed posts, used as practice messages one at a time.
export function ElderApp({ lang, examples = [] }: { lang: Lang; examples?: Post[] }) {
  const [screen, setScreen] = useState<Screen>({ name: 'home' });
  const [askPhone, setAskPhone] = useState(false);
  const callFamily = () => {
    const phone = getFamilyPhone();
    if (phone) location.href = telLink(phone);
    else if (!familyPhoneAsked()) setAskPhone(true);
    else location.href = 'tel:'; // no number saved: open the dialler
  };
  return (
    <div className="h-full overflow-y-auto bg-background text-foreground font-lao text-[20px]">
      {screen.name === 'home' && <Home lang={lang} onCheck={() => setScreen({ name: 'paste' })} onCall={callFamily} />}
      {screen.name === 'paste' && <Paste lang={lang} onBack={() => setScreen({ name: 'home' })} onCheck={text => setScreen({ name: 'result', text, verdict: checkElderMessage(text) })} onPractice={examples.length ? () => setScreen({ name: 'practice' }) : undefined} />}
      {screen.name === 'practice' && <Practice lang={lang} posts={examples} onBack={() => setScreen({ name: 'paste' })} />}
      {screen.name === 'result' && <Result lang={lang} text={screen.text} verdict={screen.verdict} onBack={() => setScreen({ name: 'home' })} onCall={callFamily} />}
      {askPhone && <PhoneSheet lang={lang} onClose={() => setAskPhone(false)} />}
    </div>
  );
}

function ListenButton({ parts, lang, auto = false }: { parts: string[]; lang: Lang; auto?: boolean }) {
  const t = ET[lang];
  const s = useSpeak(parts, lang, useBand());
  const key = parts.join('|');
  useEffect(() => { if (auto && s.status === 'ready') s.play(); }, [key, auto, s.status === 'ready']); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <button type="button" onClick={() => (s.speaking ? s.stop() : s.play())} disabled={s.status !== 'ready'} aria-pressed={s.speaking}
      className="shrink-0 flex flex-col items-center gap-1 disabled:opacity-50">
      <span className="w-[60px] h-[60px] rounded-full bg-[#EEF2FF] text-[#3B0FA0] flex items-center justify-center">{s.speaking ? <VolumeX size={28} /> : <Volume2 size={28} />}</span>
      <span className="text-base font-bold text-[#3B0FA0]">{s.speaking ? t.stop : t.listen}</span>
    </button>
  );
}

function Home({ lang, onCheck, onCall }: { lang: Lang; onCheck: () => void; onCall: () => void }) {
  const t = ET[lang];
  const tip = tipForToday(laoDayNumber())[lang];
  return (
    <div className="min-h-full flex flex-col gap-5 px-5 pt-6 pb-6">
      <header className="flex items-center gap-3">
        <SatiLogo size={44} />
        <h1 className="flex-1 text-[30px] font-bold leading-tight">{t.hello}</h1>
        <ListenButton lang={lang} parts={[t.hello, t.tip_label, tip]} />
      </header>
      {/* Solid primary under the text; the brand gradient only lightens at the far corner, so white stays readable. */}
      <section className="rounded-[26px] p-6 text-white" style={{ background: 'linear-gradient(135deg, #5B21D1 0%, #5B21D1 55%, #93C5FD 140%)' }}>
        <p className="text-lg font-semibold opacity-95">{t.tip_label}</p>
        <p className="text-[24px] font-bold leading-snug mt-1">{tip}</p>
      </section>
      <BigButton onClick={onCheck} icon={<ShieldCheck size={44} />} title={t.check} sub={t.check_sub} primary />
      <BigButton onClick={onCall} icon={<Phone size={44} />} title={t.call} sub={t.call_sub} />
      <button onClick={() => setSimpleMode(false)} className="mt-auto self-center min-h-[60px] px-4 text-lg font-semibold text-[#3B0FA0] underline">{t.full_app}</button>
    </div>
  );
}

function BigButton({ onClick, icon, title, sub, primary = false }: { onClick: () => void; icon: ReactNode; title: string; sub: string; primary?: boolean }) {
  return (
    <button onClick={onClick}
      className={`w-full h-32 rounded-[26px] px-6 flex items-center gap-5 text-left active:scale-[.98] transition-transform ${primary ? 'bg-[#5B21D1] text-white shadow-[0_6px_0_#3B0FA0]' : 'bg-[#EEF2FF] text-[#3B0FA0]'}`}>
      <span className="shrink-0">{icon}</span>
      <span><span className="block text-[28px] font-bold leading-tight">{title}</span><span className="block text-[20px] font-semibold mt-1">{sub}</span></span>
    </button>
  );
}

function TopBar({ lang, title, onBack }: { lang: Lang; title: string; onBack: () => void }) {
  return (
    <header className="flex items-center gap-3">
      <button onClick={onBack} className="shrink-0 flex flex-col items-center gap-1">
        <span className="w-[60px] h-[60px] rounded-full bg-[#EEF2FF] text-[#3B0FA0] flex items-center justify-center"><ArrowLeft size={30} /></span>
        <span className="text-base font-bold text-[#3B0FA0]">{ET[lang].back}</span>
      </button>
      <h1 className="flex-1 text-[28px] font-bold leading-tight">{title}</h1>
      <SatiLogo size={44} />
    </header>
  );
}

function Paste({ lang, onBack, onCheck, onPractice }: { lang: Lang; onBack: () => void; onCheck: (text: string) => void; onPractice?: () => void }) {
  const t = ET[lang];
  const [text, setText] = useState('');
  const canPaste = typeof navigator !== 'undefined' && !!navigator.clipboard?.readText;
  const paste = async () => { try { setText(await navigator.clipboard.readText()); } catch { /* permission refused: the field still accepts a long-press paste */ } };
  return (
    <div className="min-h-full flex flex-col gap-5 px-5 pt-6 pb-6">
      <TopBar lang={lang} title={t.check} onBack={onBack} />
      <label className="grid gap-2">
        <span className="text-[22px] font-bold">{t.paste_title}</span>
        <textarea value={text} onChange={e => setText(e.target.value)} rows={6} placeholder={t.paste_hint}
          className="w-full rounded-[20px] border-2 border-[#C7D2FE] bg-[#F7F8FF] p-4 text-[20px] leading-relaxed outline-none focus:border-[#5B21D1]" />
      </label>
      {/* Max 3 actions: back + (paste, practice) while empty, back + check once there is text. */}
      {!text.trim() && canPaste && <button onClick={paste} className="min-h-[60px] rounded-[20px] bg-[#EEF2FF] text-[#3B0FA0] text-[22px] font-bold flex items-center justify-center gap-3"><ClipboardPaste size={28} />{t.paste}</button>}
      {!text.trim() && onPractice && <button onClick={onPractice} className="min-h-[60px] rounded-[20px] border-2 border-[#C7D2FE] text-[#3B0FA0] text-[22px] font-bold flex items-center justify-center gap-3"><GraduationCap size={28} />{t.practice}</button>}
      {!!text.trim() && <button onClick={() => text.trim() && onCheck(text.trim())} disabled={!text.trim()}
        className="min-h-[84px] rounded-[26px] bg-[#5B21D1] text-white text-[26px] font-bold flex items-center justify-center gap-3 disabled:bg-[#C4B5FD] disabled:text-[#3B0FA0]">
        <ShieldCheck size={32} />{t.run}
      </button>}
    </div>
  );
}

function Result({ lang, text, verdict, onBack, onCall }: { lang: Lang; text: string; verdict: ElderVerdict; onBack: () => void; onCall: () => void }) {
  const t = ET[lang];
  const v = VERDICT[verdict];
  const [title, line] = v[lang];
  return (
    <div className="min-h-full flex flex-col gap-5 px-5 pt-6 pb-6">
      <TopBar lang={lang} title={t.result_title} onBack={onBack} />
      <section className="rounded-[20px] bg-[#F7F8FF] border border-[#E0E7FF] p-4">
        <p className="text-base font-semibold text-[#4B5563]">{t.your_message}</p>
        <p className="text-[20px] leading-relaxed mt-1 line-clamp-5 break-words">{text}</p>
      </section>
      <section role="status" className="rounded-[26px] p-6 text-white" style={{ background: v.bg }}>
        <p className="text-[36px] font-bold leading-tight">{title}</p>
        <p className="text-[24px] font-semibold leading-snug mt-2">{line}</p>
        <div className="mt-4"><ListenButtonOnColor parts={[title, line]} lang={lang} /></div>
      </section>
      <button onClick={onCall} className="mt-auto min-h-[84px] rounded-[26px] bg-[#5B21D1] text-white text-[26px] font-bold flex items-center justify-center gap-3 shadow-[0_6px_0_#3B0FA0]">
        <Phone size={32} />{t.call}
      </button>
    </div>
  );
}

// The result is read aloud as soon as it appears; this button replays or stops it.
function ListenButtonOnColor({ parts, lang }: { parts: string[]; lang: Lang }) {
  const t = ET[lang];
  const s = useSpeak(parts, lang, useBand());
  const key = parts.join('|');
  useEffect(() => { if (s.status === 'ready') s.play(); }, [key, s.status === 'ready']); // eslint-disable-line react-hooks/exhaustive-deps
  if (s.status !== 'ready') return null;
  return (
    <button onClick={() => (s.speaking ? s.stop() : s.play())} className="min-h-[60px] rounded-full bg-white/95 px-5 text-[20px] font-bold flex items-center gap-2 text-[#1F2937]">
      {s.speaking ? <VolumeX size={26} /> : <Volume2 size={26} />}{s.speaking ? t.stop : t.listen}
    </button>
  );
}

function PhoneSheet({ lang, onClose }: { lang: Lang; onClose: () => void }) {
  const t = ET[lang];
  const [phone, setPhone] = useState('');
  const save = () => { saveFamilyPhone(phone.trim()); onClose(); location.href = phone.trim() ? telLink(phone) : 'tel:'; };
  const skip = () => { saveFamilyPhone(''); onClose(); location.href = 'tel:'; };
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end" role="dialog" aria-modal="true" aria-label={t.phone_title}>
      <div className="w-full max-w-md mx-auto bg-background rounded-t-[28px] p-6 grid gap-4 font-lao">
        <h2 className="text-[26px] font-bold">{t.phone_title}</h2>
        <p className="text-[20px]">{t.phone_hint}</p>
        <input type="tel" inputMode="tel" autoComplete="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="020 ..."
          className="min-h-[64px] rounded-[20px] border-2 border-[#C7D2FE] bg-[#F7F8FF] px-4 text-[24px] outline-none focus:border-[#5B21D1]" />
        <button onClick={save} disabled={!phone.trim()} className="min-h-[72px] rounded-[26px] bg-[#5B21D1] text-white text-[24px] font-bold flex items-center justify-center gap-3 disabled:bg-[#C4B5FD] disabled:text-[#3B0FA0]"><Phone size={28} />{t.save}</button>
        <button onClick={skip} className="min-h-[60px] text-[20px] font-semibold text-[#3B0FA0] underline">{t.skip}</button>
      </div>
    </div>
  );
}

// Practice: one example message at a time. Read it (or listen), then check it to see the verdict in words.
const RISK: Record<'red' | 'yellow' | 'green', ElderVerdict> = { red: 'scam', yellow: 'caution', green: 'safe' };
function Practice({ lang, posts, onBack }: { lang: Lang; posts: Post[]; onBack: () => void }) {
  const t = ET[lang];
  const [i, setI] = useState(0);
  const [shown, setShown] = useState(false);
  const post = posts[i % posts.length];
  const text = lang === 'lo' ? post.contentLo || post.content : post.translationText || post.content;
  const verdict = RISK[post.exampleStatus ?? 'yellow'];
  const [title, line] = VERDICT[verdict][lang];
  return (
    <div className="min-h-full flex flex-col gap-5 px-5 pt-6 pb-6">
      <TopBar lang={lang} title={t.practice} onBack={onBack} />
      <section className="rounded-[26px] bg-[#F7F8FF] border border-[#E0E7FF] p-5 grid gap-4">
        <p className="text-base font-bold text-[#3B0FA0]">{t.example} {i % posts.length + 1}/{posts.length}</p>
        <p className="text-[22px] leading-relaxed break-words">{text}</p>
        <ListenButtonOnColor key={`${post.id}-${shown}`} parts={shown ? [title, line] : [text]} lang={lang} />
        {shown && <div role="status" className="rounded-[20px] p-4 text-white" style={{ background: VERDICT[verdict].bg }}>
          <p className="text-[28px] font-bold leading-tight">{title}</p>
          <p className="text-[20px] font-semibold mt-1">{line}</p>
        </div>}
      </section>
      <button onClick={() => { if (shown) { setI(i + 1); setShown(false); } else setShown(true); }}
        className="mt-auto min-h-[84px] rounded-[26px] bg-[#5B21D1] text-white text-[26px] font-bold flex items-center justify-center gap-3 shadow-[0_6px_0_#3B0FA0]">
        {shown ? <><ArrowRight size={32} />{t.next}</> : <><ShieldCheck size={32} />{t.reveal}</>}
      </button>
    </div>
  );
}
