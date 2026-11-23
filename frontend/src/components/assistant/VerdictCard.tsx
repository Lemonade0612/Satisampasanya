import { PhoneCall, CircleCheck, TriangleAlert, OctagonAlert, CircleHelp, Info } from 'lucide-react';
import { ALWAYS_SHOWN, FEATURED_ROTATION } from '../../../../shared/emergency-hotlines.mjs';
import type { Lang } from '../../types';
import type { Level, Signal, VerifyResult } from '../../lib/verify';

const BADGE: Record<Level, { Icon: typeof CircleCheck; en: string; lo: string; cls: string; border: string; fg: string }> = {
  green: { Icon: CircleCheck, en: 'Safe', lo: 'ປອດໄພ', cls: 'bg-[#F0FDF4] text-[#15803D]', border: '#BBF7D0', fg: '#15803D' },
  yellow: { Icon: TriangleAlert, en: 'Check first', lo: 'ກວດກ່ອນ', cls: 'bg-[#FFFBEB] text-[#B45309]', border: '#FDE68A', fg: '#B45309' },
  red: { Icon: OctagonAlert, en: 'Warning', lo: 'ເຕືອນ', cls: 'bg-[#FEF2F2] text-[#DC2626]', border: '#FECACA', fg: '#DC2626' },
  unknown: { Icon: CircleHelp, en: "Can't tell", lo: 'ບອກບໍ່ໄດ້', cls: 'bg-[#F3F4F8] text-[#5F6390]', border: '#E6E6F0', fg: '#5F6390' },
};

// iMAC is the first featured line; 1362 is always shown.
const IMAC = FEATURED_ROTATION[0];

export function VerdictCard({ checks, lang, pending }: { checks: VerifyResult; lang: Lang; pending?: boolean }) {
  const lo = lang === 'lo', b = BADGE[checks.level];
  const h = (en: string, loText: string) => (lo ? loText : en);
  return (
    <>
    <section aria-label={h('Safety check result', 'ຜົນການກວດຄວາມປອດໄພ')} className="p-3.5 rounded-2xl bg-white border" style={{ borderColor: b.border }}>
      <span className={`inline-flex items-center gap-1.5 h-[26px] px-2.5 mb-2.5 rounded-full text-[12px] font-bold ${b.cls}`}><span className="w-[7px] h-[7px] rounded-full" style={{ background: b.fg }} />{lo ? b.lo : b.en}</span>
      <p className="mb-2.5 text-[14px] leading-[1.6]">{lo ? checks.confidenceReason.lo : checks.confidenceReason.en}</p>
      {checks.signals.length > 0 && <>
        <p className="mb-1.5 text-[12px] font-bold text-[#5F6390]">{h('Signs found', 'ສັນຍານທີ່ພົບ')}</p>
        {checks.signals.map((sg, i) => <p key={i} className="flex gap-2 mb-1.5 text-[13px] leading-[1.5]"><span className="shrink-0 w-1.5 h-1.5 mt-[7px] rounded-full" style={{ background: b.fg }} /><span className="sr-only">{sg.result}</span>{lo ? sg.detail_lo : sg.detail_en}</p>)}
        {pending && <p className="flex gap-2 mb-1.5 text-[13px] text-[#5F6390]"><Info size={14} aria-hidden className="mt-1 shrink-0" />{h('Checking Google Safe Browsing and domain age…', 'ກຳລັງກວດ Google Safe Browsing ແລະ ອາຍຸໂດເມນ…')}</p>}
      </>}
      {checks.signals.length === 0 && <p className="text-[13px] leading-[1.5]">{h('We found no link, phone number or known scam wording to check.', 'ເຮົາບໍ່ພົບລິ້ງ, ເບີໂທ ຫຼື ຄຳທີ່ຮູ້ວ່າເປັນການຫຼອກລວງໃຫ້ກວດ.')}</p>}
      <p className="mt-3 mb-1.5 text-[12px] font-bold text-[#5F6390]">{h('What to do', 'ຄວນເຮັດແນວໃດ')}</p>
      <p className="text-[13px] leading-[1.55]">{(lo ? checks.actions.lo : checks.actions.en).join(' ')}</p>
    </section>
    {(checks.level === 'red' || checks.level === 'yellow' || checks.showHotlines) && <div className="flex flex-wrap gap-2 mt-2.5"><a href="tel:1533" className="flex items-center gap-1.5 h-9 px-3 rounded-[10px] bg-[#14112B] text-white text-[13px] font-bold"><PhoneCall size={14} aria-hidden />{h('Report 1533', 'ລາຍງານ 1533')}</a></div>}
    {checks.showHotlines && <div role="group" aria-label={h('Hotlines', 'ສາຍດ່ວນ')} className="grid gap-2 mt-2.5">
      {[ALWAYS_SHOWN, IMAC].map(l => <a key={l.id} href={`tel:${l.tel}`} className="flex items-center gap-3 rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-3.5 min-h-12 py-2 text-[13px]">
        <PhoneCall size={18} aria-hidden className="text-[#DC2626] shrink-0" /><span className="flex-1 font-bold leading-tight">{l.name[lang]}</span><span className="text-[15px] font-bold tabular-nums font-[BoonHome,sans-serif]">{l.number}</span></a>)}
    </div>}
    </>
  );
}
