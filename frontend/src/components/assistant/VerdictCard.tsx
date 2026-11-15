import { PhoneCall } from 'lucide-react';
import { ALWAYS_SHOWN, FEATURED_ROTATION } from '../../../../shared/emergency-hotlines.mjs';
import type { Lang } from '../../types';
import type { Level, Signal, VerifyResult } from '../../lib/verify';

const BADGE: Record<Level, { icon: string; en: string; lo: string; cls: string }> = {
  green: { icon: '🟢', en: 'Looks safe', lo: 'ເບິ່ງຄືວ່າປອດໄພ', cls: 'bg-emerald-50 border-emerald-500 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100' },
  yellow: { icon: '🟡', en: 'Be careful', lo: 'ຄວນລະວັງ', cls: 'bg-amber-50 border-amber-500 text-amber-900 dark:bg-amber-950/40 dark:text-amber-100' },
  red: { icon: '🔴', en: 'Likely scam', lo: 'ອາດເປັນການຫຼອກລວງ', cls: 'bg-red-50 border-red-500 text-red-900 dark:bg-red-950/40 dark:text-red-100' },
  unknown: { icon: '⚪', en: "Can't tell", lo: 'ບອກບໍ່ໄດ້', cls: 'bg-slate-50 border-slate-400 text-slate-900 dark:bg-slate-900/60 dark:text-slate-100' },
};
const ICON: Record<Signal['result'], string> = { pass: '✅', warn: '⚠️', fail: '❌', skip: '⚠️' };
const CONF = { low: { en: 'Low', lo: 'ຕ່ຳ' }, medium: { en: 'Medium', lo: 'ກາງ' }, high: { en: 'High', lo: 'ສູງ' } };

// iMAC is the first featured line; 1362 is always shown.
const IMAC = FEATURED_ROTATION[0];

export function VerdictCard({ checks, lang, pending }: { checks: VerifyResult; lang: Lang; pending?: boolean }) {
  const lo = lang === 'lo', b = BADGE[checks.level];
  const h = (en: string, loText: string) => (lo ? loText : en);
  return (
    <section aria-label={h('Safety check result', 'ຜົນການກວດຄວາມປອດໄພ')} className="rounded-3xl border bg-card shadow-sm overflow-hidden font-lao text-[18px] leading-[1.6]">
      <div className={`border-b-4 px-4 py-3 ${b.cls}`}>
        <p className="text-2xl font-extrabold flex items-center gap-2"><span aria-hidden>{b.icon}</span>{lo ? b.lo : b.en}</p>
        <p className="mt-1 text-[17px]"><span className="font-bold">{h('Confidence', 'ຄວາມໝັ້ນໃຈ')}: {lo ? CONF[checks.confidence].lo : CONF[checks.confidence].en}</span> · {lo ? checks.confidenceReason.lo : checks.confidenceReason.en}</p>
      </div>
      <div className="px-4 py-3 grid gap-4">
        {checks.signals.length > 0 && <div>
          <h3 className="font-extrabold mb-1">{h('What we checked', 'ສິ່ງທີ່ເຮົາກວດ')}</h3>
          <ul className="grid gap-1.5">{checks.signals.map((s, i) => <li key={i} className="flex gap-2"><span aria-hidden className="shrink-0">{ICON[s.result]}</span><span>{lo ? s.detail_lo : s.detail_en}</span></li>)}
            {pending && <li className="flex gap-2 text-muted-foreground"><span aria-hidden>⏳</span><span>{h('Checking Google Safe Browsing and domain age…', 'ກຳລັງກວດ Google Safe Browsing ແລະ ອາຍຸໂດເມນ…')}</span></li>}</ul>
        </div>}
        {checks.signals.length === 0 && <p>{h('We found no link, phone number or known scam wording to check.', 'ເຮົາບໍ່ພົບລິ້ງ, ເບີໂທ ຫຼື ຄຳທີ່ຮູ້ວ່າເປັນການຫຼອກລວງໃຫ້ກວດ.')}</p>}
        <div>
          <h3 className="font-extrabold mb-1">{h('What to do now', 'ຄວນເຮັດຫຍັງດຽວນີ້')}</h3>
          <ol className="list-decimal pl-6 grid gap-1">{(lo ? checks.actions.lo : checks.actions.en).map((a, i) => <li key={i}>{a}</li>)}</ol>
        </div>
        {checks.showHotlines && <div role="group" aria-label={h('Hotlines', 'ສາຍດ່ວນ')} className="grid gap-2">
          {[ALWAYS_SHOWN, IMAC].map(l => <a key={l.id} href={`tel:${l.tel}`} className="flex items-center gap-3 rounded-2xl border-2 border-red-500 bg-red-50 dark:bg-red-950/30 px-4 min-h-14 py-2">
            <PhoneCall size={22} aria-hidden className="text-red-600 shrink-0" />
            <span className="flex-1 font-bold leading-tight">{l.name[lang]}</span><span className="text-xl font-extrabold tabular-nums">{l.number}</span></a>)}
        </div>}
      </div>
    </section>
  );
}
