import { Phone, PhoneCall } from 'lucide-react';
import { ALWAYS_SHOWN, ALL_NUMBERS, featuredAt, type EmergencyLine } from '../../../../shared/emergency-hotlines.mjs';
import type { Lang } from '../../types';

const call = (line: EmergencyLine, lang: Lang, big?: boolean) => (
  <a key={line.id} href={`tel:${line.tel}`} aria-label={`${lang === 'lo' ? 'ໂທ' : 'Call'} ${line.name[lang]} ${line.number}`}
    className={`flex items-center gap-3 rounded-2xl bg-background border-2 ${line.tone === 'rose' ? 'border-red-500' : 'border-blue-600'} px-4 ${big ? 'min-h-16 py-3' : 'min-h-12 py-2'} active:scale-[0.98] transition-transform`}>
    <PhoneCall size={big ? 26 : 20} aria-hidden className={line.tone === 'rose' ? 'text-red-600' : 'text-blue-600'} />
    <span className="flex-1 min-w-0"><span className="block font-bold text-text leading-tight">{line.name[lang]}</span>{big && <span className="block text-[13px] text-text-muted leading-snug">{line.note[lang]}</span>}</span>
    <span className={`font-extrabold tabular-nums ${big ? 'text-2xl' : 'text-lg'} text-text`}>{line.number}</span>
  </a>
);

// Emergency numbers card for the feed and the end of each game. 1362 is always on it; `n` picks the featured line (rotates).
// Every number is a tap-to-call link, and all numbers come from shared/emergency-hotlines.mjs.
export function HotlineCard({ lang, n = 0, title }: { lang: Lang; n?: number; title?: string }) {
  const featured = featuredAt(n);
  const rest = ALL_NUMBERS.filter(l => l.id !== ALWAYS_SHOWN.id && l.id !== featured.id);
  return (
    <section aria-label={lang === 'lo' ? 'ເບີສາຍດ່ວນສຸກເສີນ' : 'Emergency hotlines'} className="rounded-3xl border-4 border-red-500 bg-red-50 dark:bg-red-950/30 p-4 grid gap-3 font-lao">
      <h3 className="flex items-center gap-2 text-lg font-extrabold text-red-700 dark:text-red-300"><Phone size={22} aria-hidden />{title ?? (lang === 'lo' ? 'ຕ້ອງການຄວາມຊ່ວຍເຫຼືອ? ໂທໄດ້ເລີຍ' : 'Need help? Call now')}</h3>
      {call(ALWAYS_SHOWN, lang, true)}
      {call(featured, lang, true)}
      <div className="grid grid-cols-2 gap-2">{rest.map(l => call(l, lang))}</div>
    </section>
  );
}
