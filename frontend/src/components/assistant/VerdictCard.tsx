import { PhoneCall, CircleCheck, TriangleAlert, OctagonAlert, CircleHelp, X, Check, Info } from 'lucide-react';
import { ALWAYS_SHOWN, FEATURED_ROTATION } from '../../../../shared/emergency-hotlines.mjs';
import type { Lang } from '../../types';
import type { Level, Signal, VerifyResult } from '../../lib/verify';

const BADGE: Record<Level, { Icon: typeof CircleCheck; en: string; lo: string; cls: string }> = {
  green: { Icon: CircleCheck, en: 'Safe', lo: 'ປອດໄພ', cls: 'bg-[#DCFCE7] border-[#16A34A] text-[#14532D]' },
  yellow: { Icon: TriangleAlert, en: 'Check first', lo: 'ກວດກ່ອນ', cls: 'bg-[#FEF3C7] border-[#B45309] text-[#78350F]' },
  red: { Icon: OctagonAlert, en: 'Warning', lo: 'ເຕືອນ', cls: 'bg-[#FEE2E2] border-[#DC2626] text-[#7F1D1D]' },
  unknown: { Icon: CircleHelp, en: "Can't tell", lo: 'ບອກບໍ່ໄດ້', cls: 'bg-[#EEF0F5] border-[#8B90B0] text-[#14112B]' },
};
const ICON: Record<Signal['result'], { Icon: typeof Check; cls: string }> = { pass: { Icon: Check, cls: 'text-[#16A34A]' }, warn: { Icon: TriangleAlert, cls: 'text-[#B45309]' }, fail: { Icon: X, cls: 'text-[#DC2626]' }, skip: { Icon: Info, cls: 'text-[#5F6390]' } };
const CONF = { low: { en: 'Low', lo: 'ຕ່ຳ' }, medium: { en: 'Medium', lo: 'ກາງ' }, high: { en: 'High', lo: 'ສູງ' } };

// iMAC is the first featured line; 1362 is always shown.
const IMAC = FEATURED_ROTATION[0];

export function VerdictCard({ checks, lang, pending }: { checks: VerifyResult; lang: Lang; pending?: boolean }) {
  const lo = lang === 'lo', b = BADGE[checks.level];
  const h = (en: string, loText: string) => (lo ? loText : en);
  return (
    <section aria-label={h('Safety check result', 'ຜົນການກວດຄວາມປອດໄພ')} className="rounded-3xl border bg-card shadow-sm overflow-hidden font-lao text-[18px] leading-[1.6]">
      <div className={`border-b-4 px-4 py-3 ${b.cls}`}>
        <p className="text-2xl font-extrabold flex items-center gap-2"><b.Icon size={28} aria-hidden strokeWidth={2.2} />{lo ? b.lo : b.en}</p>
        <p className="mt-1 text-[17px]"><span className="font-bold">{h('Confidence', 'ຄວາມໝັ້ນໃຈ')}: {lo ? CONF[checks.confidence].lo : CONF[checks.confidence].en}</span> · {lo ? checks.confidenceReason.lo : checks.confidenceReason.en}</p>
      </div>
      <div className="px-4 py-3 grid gap-4">
        {checks.signals.length > 0 && <div>
          <h3 className="font-extrabold mb-1">{h('Signs found', 'ສັນຍານທີ່ພົບ')}</h3>
          <ul className="grid gap-1.5">{checks.signals.map((s, i) => <li key={i} className="flex gap-2"><span className={`shrink-0 mt-1 ${ICON[s.result].cls}`}><span className="sr-only">{s.result}</span>{(() => { const I = ICON[s.result].Icon; return <I size={18} aria-hidden strokeWidth={2.5} />; })()}</span><span>{lo ? s.detail_lo : s.detail_en}</span></li>)}
            {pending && <li className="flex gap-2 text-muted-foreground"><Info size={18} aria-hidden className="mt-1 shrink-0" /><span>{h('Checking Google Safe Browsing and domain age…', 'ກຳລັງກວດ Google Safe Browsing ແລະ ອາຍຸໂດເມນ…')}</span></li>}</ul>
        </div>}
        {checks.signals.length === 0 && <p>{h('We found no link, phone number or known scam wording to check.', 'ເຮົາບໍ່ພົບລິ້ງ, ເບີໂທ ຫຼື ຄຳທີ່ຮູ້ວ່າເປັນການຫຼອກລວງໃຫ້ກວດ.')}</p>}
        <div>
          <h3 className="font-extrabold mb-1">{h('What to do', 'ຄວນເຮັດຫຍັງ')}</h3>
          <ol className="list-decimal pl-6 grid gap-1">{(lo ? checks.actions.lo : checks.actions.en).map((a, i) => <li key={i}>{a}</li>)}</ol>
        </div>
        {(checks.level === 'red' || checks.level === 'yellow' || checks.showHotlines) && <a href="tel:1533" className="flex items-center justify-center gap-2 rounded-2xl bg-[#DC2626] text-white min-h-14 text-[1.125rem] font-bold shadow-[0_5px_0_#991B1B] active:translate-y-[3px] active:shadow-[0_2px_0_#991B1B]"><PhoneCall size={22} aria-hidden />{h('Report to 1533', 'ແຈ້ງ 1533')}</a>}
        {checks.showHotlines && <div role="group" aria-label={h('Hotlines', 'ສາຍດ່ວນ')} className="grid gap-2">
          {[ALWAYS_SHOWN, IMAC].map(l => <a key={l.id} href={`tel:${l.tel}`} className="flex items-center gap-3 rounded-2xl border-2 border-red-500 bg-red-50 dark:bg-red-950/30 px-4 min-h-14 py-2">
            <PhoneCall size={22} aria-hidden className="text-red-600 shrink-0" />
            <span className="flex-1 font-bold leading-tight">{l.name[lang]}</span><span className="text-xl font-extrabold tabular-nums">{l.number}</span></a>)}
        </div>}
      </div>
    </section>
  );
}
