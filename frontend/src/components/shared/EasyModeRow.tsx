import { Accessibility } from 'lucide-react';
import { setSimpleMode, useSimpleMode } from '../../lib/simpleMode';
import type { Lang } from '../../types';

// Settings row: Simple mode (big buttons, two screens). On by default for Elders; anyone can turn it on.
export function SimpleModeRow({ lang }: { lang: Lang }) {
  const on = useSimpleMode();
  const lo = lang === 'lo';
  return <button role="switch" aria-checked={on} onClick={() => setSimpleMode(!on)} className="w-full flex items-center gap-3 p-3 rounded-2xl border border-border text-left font-lao min-h-12">
    <span className="w-10 h-10 rounded-xl bg-secondary text-primary flex items-center justify-center shrink-0"><Accessibility size={20} /></span>
    <span className="flex-1"><span className="block font-semibold">{lo ? 'ໂໝດງ່າຍ' : 'Simple mode'}</span>{/* REVIEW-LO */}
      <span className="block text-xs text-muted-foreground">{lo ? 'ປຸ່ມໃຫຍ່ ກວດຂໍ້ຄວາມ ແລະ ໂທຫາລູກຫຼານ' : 'Big buttons: check a message, call family'}</span></span>{/* REVIEW-LO */}
    <span className={`w-12 h-7 rounded-full p-1 transition-colors ${on ? 'bg-primary' : 'bg-muted'}`}><span className={`block w-5 h-5 rounded-full bg-white shadow transition-transform ${on ? 'translate-x-5' : ''}`} /></span>
  </button>;
}
