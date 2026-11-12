import { useState } from 'react';
import { ShieldCheck, X } from 'lucide-react';
import { AgeGrid } from '../../features/daily/components/AgePicker';
import { TIERS } from '../../features/daily/lib/age';
import { DT } from '../../features/daily/i18n';
import { bandForBirthYear } from '../../../../shared/bands.mjs';
import { changeBand, getBand, leavingKidsNeedsPassword, useBandSavesToAccount, type Band } from '../../lib/band';
import { ApiError } from '../../lib/api';
import type { Lang } from '../../types';

const TEXT = {
  en: {
    byGroup: 'Choose a group', byYear: 'Enter birth year', year: 'Year of birth', pickYear: 'Choose a year',
    yearIs: (g: string) => `That is the ${g} group.`, yearNote: 'Only the group is kept. The year is not saved or sent.',
    guardianTitle: 'For parents and guardians',
    guardian: 'Kids mode shows only checked, gentle content. Children can read the feed and play games, but cannot post, comment or repost.',
    guardianAccount: 'To leave Kids mode later, the account password is needed.',
    guardianGuest: 'An adult can change this later in Settings.',
    password: 'Account password (parent or guardian)', passwordNote: 'Leaving Kids mode needs the account password.',
    save: 'Save', saving: 'Saving…', savedAccount: 'Saved to your account. Only the age group is kept, never your birthday.',
    savedPhone: 'Saved on this phone. Only the age group is kept, never your birthday.',
    wrongPassword: 'That password is not right. A parent or guardian needs to enter the account password.',
    tooMany: 'Too many wrong passwords. Try again in 15 minutes.', offline: 'Cannot reach Sati right now. Try again when you are online.',
  },
  lo: {
    byGroup: 'ເລືອກກຸ່ມ', byYear: 'ໃສ່ປີເກີດ', year: 'ປີເກີດ', pickYear: 'ເລືອກປີ',
    yearIs: (g: string) => `ແມ່ນກຸ່ມ ${g}.`, yearNote: 'ເກັບແຕ່ກຸ່ມອາຍຸ. ບໍ່ບັນທຶກ ແລະ ບໍ່ສົ່ງປີເກີດ.',
    guardianTitle: 'ສຳລັບພໍ່ແມ່ ແລະ ຜູ້ປົກຄອງ',
    guardian: 'ໂໝດເດັກສະແດງແຕ່ເນື້ອຫາທີ່ກວດແລ້ວ ແລະ ອ່ອນໂຍນ. ເດັກອ່ານໜ້າຂ່າວ ແລະ ຫຼິ້ນເກມໄດ້ ແຕ່ໂພສ, ສະແດງຄຳເຫັນ ຫຼື ແບ່ງປັນຄືນບໍ່ໄດ້.',
    guardianAccount: 'ຖ້າຈະອອກຈາກໂໝດເດັກພາຍຫຼັງ ຕ້ອງໃສ່ລະຫັດຜ່ານຂອງບັນຊີ.',
    guardianGuest: 'ຜູ້ໃຫຍ່ສາມາດປ່ຽນໄດ້ພາຍຫຼັງໃນການຕັ້ງຄ່າ.',
    password: 'ລະຫັດຜ່ານບັນຊີ (ພໍ່ແມ່ ຫຼື ຜູ້ປົກຄອງ)', passwordNote: 'ການອອກຈາກໂໝດເດັກ ຕ້ອງໃສ່ລະຫັດຜ່ານບັນຊີ.',
    save: 'ບັນທຶກ', saving: 'ກຳລັງບັນທຶກ…', savedAccount: 'ບັນທຶກໃນບັນຊີແລ້ວ. ເກັບແຕ່ກຸ່ມອາຍຸ, ບໍ່ເກັບວັນເກີດ.',
    savedPhone: 'ບັນທຶກໃນໂທລະສັບນີ້. ເກັບແຕ່ກຸ່ມອາຍຸ, ບໍ່ເກັບວັນເກີດ.',
    wrongPassword: 'ລະຫັດຜ່ານບໍ່ຖືກຕ້ອງ. ພໍ່ແມ່ ຫຼື ຜູ້ປົກຄອງ ຕ້ອງໃສ່ລະຫັດຜ່ານຂອງບັນຊີ.',
    tooMany: 'ໃສ່ລະຫັດຜິດຫຼາຍເທື່ອ. ລອງໃໝ່ໃນ 15 ນາທີ.', offline: 'ເຊື່ອມຕໍ່ Sati ບໍ່ໄດ້ຕອນນີ້. ລອງໃໝ່ເມື່ອມີອິນເຕີເນັດ.',
  },
};
export const bandText = (lang: Lang) => TEXT[lang];
export const bandLabel = (band: Band, lang: Lang) => `${DT[lang][`age_${band}`]} ${TIERS[band].range}`;

// Big tiles (easy for kids and elders) or a birth-year list. The year only lives in this component's state:
// it is turned into a group right here and never stored or sent.
export function BandChooser({ lang, value, onPick, account }: { lang: Lang; value: Band | null; onPick: (b: Band) => void; account: boolean }) {
  const t = TEXT[lang];
  const [mode, setMode] = useState<'group' | 'year'>('group');
  const [year, setYear] = useState('');
  const thisYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => thisYear - 4 - i);
  return (
    <div className="grid gap-3 font-lao">
      <div role="tablist" className="grid grid-cols-2 gap-1 rounded-2xl bg-muted p-1">
        {(['group', 'year'] as const).map(m => <button key={m} type="button" role="tab" aria-selected={mode === m} onClick={() => setMode(m)}
          className={`min-h-11 rounded-xl text-sm font-semibold ${mode === m ? 'bg-background shadow text-foreground' : 'text-muted-foreground'}`}>{m === 'group' ? t.byGroup : t.byYear}</button>)}
      </div>
      {mode === 'group' ? <AgeGrid lang={lang} value={value} onPick={onPick} /> : (
        <label className="grid gap-1 text-sm font-semibold">{t.year}
          <select value={year} onChange={e => { setYear(e.target.value); const b = bandForBirthYear(Number(e.target.value)); if (b) onPick(b); }}
            className="min-h-12 rounded-2xl border-2 border-border bg-card px-3 text-base">
            <option value="">{t.pickYear}</option>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          {year && value && <span className="text-primary">{t.yearIs(bandLabel(value, lang))}</span>}
          <span className="text-xs font-normal text-muted-foreground">{t.yearNote}</span>
        </label>
      )}
      {value === 'kids' && <GuardianNote lang={lang} account={account} />}
    </div>
  );
}

export function GuardianNote({ lang, account }: { lang: Lang; account: boolean }) {
  const t = TEXT[lang];
  return <div role="note" className="rounded-2xl border border-amber-300 bg-amber-50 dark:bg-amber-950/40 p-3 text-sm grid gap-1">
    <b className="flex items-center gap-2"><ShieldCheck size={18} className="text-amber-600 shrink-0" />{t.guardianTitle}</b>
    <span>{t.guardian} {account ? t.guardianAccount : t.guardianGuest}</span>
  </div>;
}

// The one place the band changes after sign-up: header chip, Settings, Daily and the one-time prompt after login.
// `onClose` omitted = a choice is required (first time).
export function BandSheet({ lang, onClose, onSaved }: { lang: Lang; onClose?: () => void; onSaved?: (b: Band) => void }) {
  const d = DT[lang], t = TEXT[lang];
  const account = useBandSavesToAccount();
  const [picked, setPicked] = useState<Band | null>(onClose ? getBand() : null);
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false), [error, setError] = useState('');
  const needsPassword = !!picked && leavingKidsNeedsPassword(picked);
  const save = async () => {
    if (!picked) return;
    setBusy(true); setError('');
    try { await changeBand(picked, needsPassword ? password : undefined); onSaved?.(picked); onClose?.(); }
    catch (e) {
      // Known refusals get a message in the chosen language; anything else shows the server's text.
      const status = e instanceof ApiError ? e.status : -1;
      setError(status === 403 ? t.wrongPassword : status === 429 ? t.tooMany : status === 0 || status >= 500 ? t.offline : (e as Error).message);
    } finally { setBusy(false); }
  };
  return (
    <div className="fixed inset-0 z-[70] mx-auto max-w-md flex items-end bg-black/45 daily-fade" onClick={onClose}>
      <form className="daily-in w-full rounded-t-3xl bg-background p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] grid gap-3 font-lao max-h-[92%] overflow-y-auto"
        role="dialog" aria-modal="true" aria-label={d.age_title} onClick={e => e.stopPropagation()} onSubmit={e => { e.preventDefault(); void save(); }}>
        <div className="flex items-start justify-between gap-2">
          <div><h3 className="font-extrabold text-xl">{d.age_title}</h3><p className="text-sm text-muted-foreground">{account ? t.savedAccount : t.savedPhone}</p></div>
          {onClose && <button type="button" onClick={onClose} aria-label="Close" className="w-10 h-10 shrink-0 rounded-full bg-muted flex items-center justify-center"><X size={18} /></button>}
        </div>
        <BandChooser lang={lang} value={picked} onPick={b => { setPicked(b); setError(''); }} account={account} />
        {needsPassword && <label className="grid gap-1 text-sm font-semibold">{t.password}
          <input type="password" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} className="min-h-12 rounded-2xl border-2 border-border bg-card px-3 text-base" />
          <span className="text-xs font-normal text-muted-foreground">{t.passwordNote}</span>
        </label>}
        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
        <button disabled={!picked || busy || (needsPassword && !password)} className="daily-btn w-full rounded-2xl bg-primary text-white font-semibold min-h-12 disabled:opacity-50">{busy ? t.saving : t.save}</button>
      </form>
    </div>
  );
}
