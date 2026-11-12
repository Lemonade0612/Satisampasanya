import { useState } from 'react';
import { MessageSquareText, ShieldCheck, X } from 'lucide-react';
import { AgeGrid } from '../../features/daily/components/AgePicker';
import { GuardianNote } from './BandSheet';
import { api, ApiError } from '../../lib/api';
import { getBand, hasBand } from '../../lib/band';
import type { Band, CurrentUser, Lang } from '../../types';

// The simplest sign-up: age group and a nickname. A 4-digit PIN is optional, except for Kids, where it is the
// parent lock (the same rule as the password on a full account). No email, no password to remember.
const TEXT = {
  en: {
    title: 'Join in 10 seconds', sub: 'No email needed.', band: 'Who will use Sati?', name: 'Nickname', namePh: 'e.g. Noy',
    pin: '4-digit PIN (optional)', pinKids: '4-digit parent PIN', pinNote: 'With a PIN you can sign in on another phone.',
    pinKidsNote: 'A parent or guardian needs this PIN to leave Kids mode.', join: 'Join Sati', joining: 'Joining…',
    codeTitle: 'You are in!', codeNote: 'Your sign-in code. Write it down to sign in on another phone with your PIN.',
    codeNoPin: 'You stay signed in on this phone. Add a PIN later if you want to sign in elsewhere.', ok: 'Start',
    errName: 'Type a nickname.', errPin: 'The PIN must be 4 numbers.', errKids: 'Kids need a 4-digit parent PIN.', offline: 'Cannot reach Sati right now. Try again when you are online.',
  },
  lo: {
    title: 'ເຂົ້າຮ່ວມໃນ 10 ວິນາທີ', sub: 'ບໍ່ຕ້ອງໃຊ້ອີເມວ.', band: 'ໃຜຈະໃຊ້ Sati?', name: 'ຊື່ຫຼິ້ນ', namePh: 'ເຊັ່ນ: ນ້ອຍ', // REVIEW-LO
    pin: 'ລະຫັດ PIN 4 ໂຕ (ບໍ່ບັງຄັບ)', pinKids: 'ລະຫັດ PIN 4 ໂຕ ຂອງພໍ່ແມ່', pinNote: 'ມີ PIN ແລ້ວ ເຂົ້າໃຊ້ໃນໂທລະສັບອື່ນໄດ້.', // REVIEW-LO
    pinKidsNote: 'ພໍ່ແມ່ ຫຼື ຜູ້ປົກຄອງ ຕ້ອງໃຊ້ PIN ນີ້ ເພື່ອອອກຈາກໂໝດເດັກ.', join: 'ເຂົ້າຮ່ວມ Sati', joining: 'ກຳລັງເຂົ້າຮ່ວມ…', // REVIEW-LO
    codeTitle: 'ເຂົ້າຮ່ວມແລ້ວ!', codeNote: 'ລະຫັດເຂົ້າໃຊ້ຂອງທ່ານ. ຈົດໄວ້ ເພື່ອເຂົ້າໃຊ້ໃນໂທລະສັບອື່ນພ້ອມ PIN.', // REVIEW-LO
    codeNoPin: 'ທ່ານຈະເຂົ້າສູ່ລະບົບຢູ່ໃນໂທລະສັບນີ້ຕະຫຼອດ.', ok: 'ເລີ່ມ', // REVIEW-LO
    errName: 'ພິມຊື່ຫຼິ້ນ.', errPin: 'PIN ຕ້ອງເປັນຕົວເລກ 4 ໂຕ.', errKids: 'ເດັກຕ້ອງມີ PIN 4 ໂຕ ຂອງພໍ່ແມ່.', offline: 'ເຊື່ອມຕໍ່ Sati ບໍ່ໄດ້ຕອນນີ້. ລອງໃໝ່ເມື່ອມີອິນເຕີເນັດ.', // REVIEW-LO
  },
};

export function QuickSignup({ lang, onDone, startedAt }: { lang: Lang; onDone: (user: CurrentUser) => void; startedAt?: number }) {
  const t = TEXT[lang];
  const [band, setBand] = useState<Band | null>(hasBand() ? getBand() : null);
  const [name, setName] = useState(''), [pin, setPin] = useState('');
  const [busy, setBusy] = useState(false), [error, setError] = useState('');
  const [done, setDone] = useState<{ user: CurrentUser; code: string; pin: boolean } | null>(null);
  const [opened] = useState(() => startedAt ?? Date.now());
  const kids = band === 'kids';
  const submit = async () => {
    if (!band) return;
    if (!name.trim()) return setError(t.errName);
    if (pin && !/^\d{4}$/.test(pin)) return setError(t.errPin);
    if (kids && !pin) return setError(t.errKids);
    setBusy(true); setError('');
    try {
      const value = await api.quick({ name: name.trim(), ageBand: band, pin: pin || undefined });
      window.dispatchEvent(new CustomEvent('sati-signup', { detail: { ms: Date.now() - opened, band, pin: value.pin } }));
      setDone(value);
    } catch (e) {
      const status = e instanceof ApiError ? e.status : -1;
      setError(status === 0 || status >= 500 ? t.offline : (e as Error).message);
    } finally { setBusy(false); }
  };
  if (done) return (
    <div className="grid gap-3 font-lao text-center">
      <h3 className="font-extrabold text-xl">{t.codeTitle}</h3>
      {done.pin ? <>
        <p className="text-sm text-muted-foreground">{t.codeNote}</p>
        <p className="text-2xl font-black tracking-wider text-primary select-all" aria-label={done.code.split('').join(' ')}>{done.code}</p>
      </> : <p className="text-sm text-muted-foreground">{t.codeNoPin}</p>}
      <button onClick={() => onDone(done.user)} className="w-full rounded-2xl bg-primary text-white font-semibold min-h-14 text-base">{t.ok}</button>
    </div>
  );
  return (
    <form className="grid gap-3 font-lao" onSubmit={e => { e.preventDefault(); void submit(); }}>
      <div><h3 className="font-extrabold text-xl">{t.title}</h3><p className="text-sm text-muted-foreground">{t.sub}</p></div>
      <p className="text-sm font-semibold">{t.band}</p>
      <AgeGrid lang={lang} value={band} onPick={b => { setBand(b); setError(''); }} />
      {kids && <GuardianNote lang={lang} account />}
      {band && <>
        <label className="grid gap-1 text-sm font-semibold">{t.name}
          <input value={name} maxLength={40} autoComplete="nickname" placeholder={t.namePh} onChange={e => { setName(e.target.value); setError(''); }}
            className="min-h-14 rounded-2xl border-2 border-border bg-card px-4 text-lg" />
        </label>
        <label className="grid gap-1 text-sm font-semibold">{kids ? t.pinKids : t.pin}
          <input value={pin} inputMode="numeric" pattern="\d{4}" maxLength={4} autoComplete="new-password" type="password"
            onChange={e => { setPin(e.target.value.replace(/\D/g, '').slice(0, 4)); setError(''); }}
            className="min-h-14 rounded-2xl border-2 border-border bg-card px-4 text-2xl tracking-[0.5em] text-center" />
          <span className="text-xs font-normal text-muted-foreground">{kids ? t.pinKidsNote : t.pinNote}</span>
        </label>
      </>}
      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
      <button disabled={!band || busy} className="w-full rounded-2xl bg-primary text-white font-semibold min-h-14 text-base disabled:opacity-50">{busy ? t.joining : t.join}</button>
    </form>
  );
}

// Shown when a guest tries to post, comment, react or follow: says why an account is needed, then the quick form.
export type SignupReason = 'post' | 'comment' | 'react' | 'follow' | 'profile' | 'assistant';
const WHY = {
  en: {
    post: 'Posting needs a nickname so others know who shared the warning, and so Sati can check every post before it goes live.',
    comment: 'Comments need a nickname so the community stays friendly and no one hides behind a blank name.',
    react: 'Reactions are saved to your nickname, so each person counts only once.',
    follow: 'Following needs a nickname so Sati can remember who you follow.',
    profile: 'Make a nickname to save your progress and join the community.',
    assistant: 'Ask Sati needs a nickname so the free daily questions are shared fairly.',
    browse: 'Keep looking around', email: 'Use email and password instead',
  },
  lo: {
    post: 'ການໂພສຕ້ອງມີຊື່ຫຼິ້ນ ເພື່ອໃຫ້ຄົນອື່ນຮູ້ວ່າໃຜແຈ້ງເຕືອນ ແລະ Sati ກວດທຸກໂພສກ່ອນເຜີຍແຜ່.', // REVIEW-LO
    comment: 'ການສະແດງຄຳເຫັນຕ້ອງມີຊື່ຫຼິ້ນ ເພື່ອໃຫ້ຊຸມຊົນເປັນມິດ.', // REVIEW-LO
    react: 'ການກົດຖືກໃຈຈະບັນທຶກກັບຊື່ຫຼິ້ນຂອງທ່ານ ເພື່ອນັບຄົນລະເທື່ອດຽວ.', // REVIEW-LO
    follow: 'ການຕິດຕາມຕ້ອງມີຊື່ຫຼິ້ນ ເພື່ອໃຫ້ Sati ຈື່ວ່າທ່ານຕິດຕາມໃຜ.', // REVIEW-LO
    profile: 'ສ້າງຊື່ຫຼິ້ນ ເພື່ອບັນທຶກຄວາມຄືບໜ້າ ແລະ ເຂົ້າຮ່ວມຊຸມຊົນ.', // REVIEW-LO
    assistant: 'ຖາມ Sati ຕ້ອງມີຊື່ຫຼິ້ນ ເພື່ອແບ່ງຄຳຖາມຟຣີປະຈຳວັນໃຫ້ທຸກຄົນຢ່າງຍຸດຕິທຳ.', // REVIEW-LO
    browse: 'ເບິ່ງຕໍ່ກ່ອນ', email: 'ໃຊ້ອີເມວ ແລະ ລະຫັດຜ່ານແທນ', // REVIEW-LO
  },
};
export function SignupPrompt({ lang, reason, onClose, onDone, onEmail }: { lang: Lang; reason: SignupReason; onClose: () => void; onDone: (u: CurrentUser) => void; onEmail: () => void }) {
  const w = WHY[lang];
  const Icon = reason === 'profile' ? ShieldCheck : MessageSquareText;
  return (
    <div className="fixed inset-0 z-[70] mx-auto max-w-md flex items-end bg-black/45 daily-fade" onClick={onClose}>
      <div role="dialog" aria-modal="true" onClick={e => e.stopPropagation()}
        className="daily-in w-full rounded-t-3xl bg-background p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] grid gap-3 font-lao max-h-[92%] overflow-y-auto">
        <div className="flex items-start gap-3">
          <Icon size={22} className="text-primary shrink-0 mt-0.5" />
          <p className="flex-1 text-sm">{w[reason]}</p>
          <button onClick={onClose} aria-label={lang === 'lo' ? 'ປິດ' : 'Close'} className="w-11 h-11 shrink-0 rounded-full bg-muted flex items-center justify-center"><X size={18} /></button>
        </div>
        <QuickSignup lang={lang} onDone={onDone} />
        <button onClick={onClose} className="min-h-12 text-sm font-semibold text-muted-foreground underline">{w.browse}</button>
        <button onClick={onEmail} className="min-h-11 text-xs text-muted-foreground">{w.email}</button>
      </div>
    </div>
  );
}
