import { UserRound } from 'lucide-react';
import { QuickSignup } from '../components/shared/QuickSignup';
import { bandLabel } from '../components/shared/BandSheet';
import { useBand } from '../lib/band';
import type { CurrentUser, Lang } from '../types';

// Profile tab for a guest: change age group, make a nickname, or sign in with an existing account.
export function GuestProfile({ lang, onDone, onEmail, onChangeBand }: { lang: Lang; onDone: (u: CurrentUser) => void; onEmail: () => void; onChangeBand: () => void }) {
  const band = useBand();
  const lo = lang === 'lo';
  return (
    <div className="h-full overflow-y-auto scrollbar-hide p-5 grid gap-5 content-start font-lao">
      <div className="flex items-center gap-3">
        <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center"><UserRound size={28} className="text-muted-foreground" /></div>
        <div><p className="font-bold text-lg">{lo ? 'ແຂກ' : 'Guest'}</p>
          <button onClick={onChangeBand} className="text-sm text-primary font-semibold min-h-11">{bandLabel(band, lang)} · {lo ? 'ປ່ຽນ' : 'Change'}</button></div>
      </div>
      <div className="rounded-3xl border border-border bg-card p-4"><QuickSignup lang={lang} onDone={onDone} /></div>
      <button onClick={onEmail} className="min-h-12 text-sm font-semibold text-muted-foreground underline">{lo ? 'ມີບັນຊີແລ້ວ? ເຂົ້າສູ່ລະບົບ' : 'Already have an account? Sign in'}</button>
    </div>
  );
}
