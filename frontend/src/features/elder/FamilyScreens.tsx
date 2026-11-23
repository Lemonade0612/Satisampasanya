import { useState } from 'react';
import { Check, MessageCircle, Send, ShieldAlert } from 'lucide-react';
import { formatPhone, validateFamily } from '../../../../shared/family-tell.mjs';
import { getFamilyPhone } from '../../lib/simpleMode';
import { Header, MainButton, Page } from './ui';
import { ET, FT } from './text';
import { getFamilyName, markSetupSeen, saveFamily } from './family';

const field = 'w-full min-h-[4.5rem] rounded-[1.25rem] border-2 border-[#5B21D1] bg-white px-4 text-[1.3125rem] text-[#13112B]';

/** One screen: what the family calls you, and their WhatsApp number. Skippable on the first launch. */
export function FamilySetup({ first, onDone }: { first: boolean; onDone: () => void }) {
  const [name, setName] = useState(getFamilyName());
  const [phone, setPhone] = useState(getFamilyPhone() ? formatPhone(getFamilyPhone()) : '');
  const [error, setError] = useState(false);
  const save = () => {
    const v = validateFamily({ name, phone });
    if (!v.ok || !v.phone) { setError(true); return; }
    saveFamily(v.name, v.phone); onDone();
  };
  const skip = () => { markSetupSeen(); onDone(); };
  return (
    <Page header={<Header title={FT.setup_title} onBack={first ? undefined : onDone} listen={[FT.setup_intro, FT.name_label, FT.phone_label]} />}
      main={<div className="grid gap-3"><MainButton icon={<Check />} label={FT.save} onClick={save} />{first && <button type="button" onClick={skip} className="min-h-[4rem] text-[1.25rem] font-bold text-[#3B0FA0] underline">{FT.skip}</button>}</div>}>
      <p className="text-[1.25rem] leading-normal">{FT.setup_intro}</p>
      <label htmlFor="fam-name" className="text-[1.3125rem] font-bold">{FT.name_label}</label>
      <input id="fam-name" value={name} onChange={e => setName(e.target.value)} placeholder={FT.name_hint} maxLength={30} autoComplete="off" className={field} />
      <label htmlFor="fam-phone" className="text-[1.3125rem] font-bold">{FT.phone_label}</label>
      <input id="fam-phone" value={phone} onChange={e => { setPhone(e.target.value); setError(false); }} placeholder={FT.phone_hint} inputMode="tel" autoComplete="off"
        aria-invalid={error} aria-describedby={error ? 'fam-phone-err' : undefined} className={field} />
      {error && <p id="fam-phone-err" role="alert" className="text-[1.25rem] font-bold text-[#B91C1C]">{FT.phone_error}</p>}
    </Page>
  );
}

/** S·A·T·I: Stop and Ask are done once a result is on screen; Tell and Inform fill in as they are used. */
export function SatiRow({ told, informed }: { told: boolean; informed: boolean }) {
  const steps = [['S', FT.step_stop, true], ['A', FT.step_ask, true], ['T', FT.step_tell, told], ['I', FT.step_inform, informed]] as const;
  return (
    <ol aria-label={FT.steps_label} data-testid="sati-row" className="flex items-center justify-center gap-3">
      {steps.map(([letter, label, done]) => (
        <li key={letter} data-done={done} className="flex flex-col items-center gap-1">
          <span className={`w-12 h-12 rounded-full flex items-center justify-center text-[1.375rem] font-bold border-2 ${done ? 'bg-[#15803D] border-[#15803D] text-white' : 'bg-white border-[#5B21D1] text-[#5B21D1]'}`}>
            {done ? <Check size={26} aria-label={`${letter} ✓`} /> : letter}
          </span>
          <span className="text-[1rem] font-bold text-[#4B4870]">{label}</span>
        </li>
      ))}
    </ol>
  );
}

/** Demo mode: show exactly what would be sent, and send only when "ສົ່ງແທ້" is tapped. */
export function TellPreview({ text, onSend, onClose }: { text: string; onSend: () => void; onClose: () => void }) {
  return (
    <div role="dialog" aria-modal="true" aria-label={FT.preview_title} data-testid="tell-preview" className="elder absolute inset-0 z-50 bg-white flex flex-col">
      <Page header={<Header title={FT.preview_title} onBack={onClose} listen={[FT.preview_note]} />}
        main={<div className="grid gap-3"><MainButton icon={<Send />} label={FT.send_real} onClick={onSend} /><MainButton icon={<MessageCircle />} label={FT.close} onClick={onClose} kind="secondary" /></div>}>
        <p className="text-[1.125rem] font-bold text-[#B45309]">{FT.preview_note}</p>
        <p data-testid="tell-preview-text" className="rounded-[1.375rem] bg-[#DCF8C6] p-5 text-[1.4375rem] leading-normal break-words">{text}</p>
      </Page>
    </div>
  );
}

/** Inform: only the kind of message is shared (no name, no phone, no text). Saved on this phone only, nothing is sent anywhere. */
export function InformScreen({ category, stage, onSend, onDone }: { category: string; stage: 'confirm' | 'thanks'; onSend: () => void; onDone: () => void }) {
  if (stage === 'thanks') {
    return (
      <Page header={<Header title={FT.thanks} listen={[FT.thanks_line]} autoRead />} main={<MainButton icon={<Check />} label={ET.back} onClick={onDone} />}>
        <section data-testid="inform-thanks" className="rounded-[1.375rem] bg-[#15803D] text-white p-6 grid gap-2">
          <p className="text-[2.125rem] font-bold leading-tight">{FT.thanks}</p>
          <p className="text-[1.375rem] leading-normal">{FT.thanks_line}</p>
        </section>
      </Page>
    );
  }
  return (
    <Page header={<Header title={FT.inform_title} onBack={onDone} listen={[FT.inform_intro, FT.no_name, FT.no_phone]} />}
      main={<MainButton icon={<ShieldAlert />} label={FT.inform_send} onClick={onSend} />}>
      <p className="text-[1.25rem] leading-normal">{FT.inform_intro}</p>
      <ul className="grid gap-3 rounded-[1.375rem] bg-white border border-[#E4E2EE] p-4 text-[1.3125rem] font-bold">
        <li data-testid="inform-type">{FT.inform_type}: {FT.cat[category] ?? FT.cat.other}</li>
        <li className="flex items-center gap-3 text-[#B91C1C]"><span aria-hidden className="text-[1.75rem]">✗</span>{FT.no_name}</li>
        <li className="flex items-center gap-3 text-[#B91C1C]"><span aria-hidden className="text-[1.75rem]">✗</span>{FT.no_phone}</li>
      </ul>
    </Page>
  );
}
