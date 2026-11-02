import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { TopBar } from '../components/ui';
import { DT, SCAM_LABEL } from '../i18n';
import { addDraft, allScenarios, review } from '../lib/scenarios';
import { generateDraftScenario } from '../lib/generateDraftScenario';
import type { Lang } from '../types';

const STATUS_STYLE = { verified: 'bg-green-100 text-green-800', draft: 'bg-amber-100 text-amber-800', rejected: 'bg-red-100 text-red-800' } as const;

export function AdminScreen({ lang, verifier, onBack }: { lang: Lang; verifier: string; onBack: () => void }) {
  const t = DT[lang];
  const [list, setList] = useState(allScenarios);
  const refresh = () => setList(allScenarios());
  return (
    <div className="flex flex-col h-full">
      <TopBar onBack={onBack} lang={lang}><h2 className="font-bold font-lao">{t.admin_title}</h2></TopBar>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <p className="text-xs text-muted-foreground font-lao">{t.drafts_note}</p>
        <button onClick={() => { addDraft(generateDraftScenario({ scamType: 'prize', contact: 'Free Data Promo', hook: 'Free 50GB data for students!', ask: 'Send your ID card photo to activate.', flags: ['too_good', 'personal_data'] })); refresh(); }}
          className="daily-btn w-full rounded-2xl border-2 border-dashed border-primary text-primary font-semibold flex items-center justify-center gap-2"><Sparkles size={18} />{t.generate}</button>
        {list.map(s => (
          <article key={s.id} className="daily-in rounded-2xl border border-border p-3 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="font-bold text-sm font-lao">{s.title[lang]}</span>
              <span className={`text-[11px] font-bold uppercase rounded-full px-2 py-0.5 ${STATUS_STYLE[s.status]}`}>{s.status}</span>
            </div>
            <p className="text-xs text-muted-foreground">{SCAM_LABEL[s.scamType][lang]} · {s.source === 'ai_draft' ? 'AI draft' : 'Expert'} {s.verifiedBy && `· ${t.verified_by} ${s.verifiedBy} (${s.verifiedAt})`}{s.needsNativeReview && ' · LO needs native review'}</p>
            {s.status !== 'verified' && <div className="grid grid-cols-2 gap-2">
              <button onClick={() => { review(s.id, true, verifier); refresh(); }} className="daily-btn rounded-xl bg-green-600 text-white font-semibold">{t.approve}</button>
              <button onClick={() => { review(s.id, false, verifier); refresh(); }} className="daily-btn rounded-xl bg-muted font-semibold">{t.reject}</button>
            </div>}
          </article>
        ))}
      </div>
    </div>
  );
}
