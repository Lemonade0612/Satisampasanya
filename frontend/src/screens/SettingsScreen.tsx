import { useState } from "react";
import { ArrowLeft, Check, ChevronRight, FileText, Info, Languages, Accessibility, LogOut, Palette, ShieldCheck, Type, Users } from "lucide-react";
import { SatiLogo } from "../components/shared/Brand";
import { bandLabel } from "../components/shared/BandSheet";
import { useBand } from "../lib/band";
import { setSimpleMode, useSimpleMode } from "../lib/simpleMode";
import { setTextSize, useTextSize, TEXT_SCALE, type TextSize } from "../lib/textSize";
import { PolicyBody, POLICY_TITLES, EFFECTIVE, type PolicyKind } from "../components/shared/PolicyText";
import type { Lang, ThemeMode } from "../types";

const VERSION = "1.0.0";

// Grey track; the selected segment is white with a shadow, purple text and a check.
export function Segmented<V extends string>({ value, options, onChange, label }: { value: V; options: { value: V; label: string }[]; onChange: (v: V) => void; label: string }) {
  return (
    <div role="radiogroup" aria-label={label} className="grid gap-1 rounded-xl bg-[#F3F4F8] dark:bg-[#262A34] p-1" style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}>
      {options.map(o => {
        const on = o.value === value;
        return <button key={o.value} type="button" role="radio" aria-checked={on} onClick={() => onChange(o.value)}
          className={`min-h-11 rounded-lg px-2 text-sm font-semibold flex items-center justify-center gap-1 transition-colors font-lao ${on ? "bg-background dark:bg-[#3E4452] text-primary dark:text-[#C4B5FD] shadow-sm" : "text-muted-foreground"}`}>
          {on && <Check size={14} aria-hidden className="shrink-0" />}<span className="truncate">{o.label}</span>
        </button>;
      })}
    </div>
  );
}

function Header({ title, onBack, lang }: { title: string; onBack: () => void; lang: Lang }) {
  return <header className="shrink-0 flex items-center gap-2 px-2 py-2 border-b border-border bg-background">
    <button type="button" onClick={onBack} aria-label={lang === "lo" ? "ກັບ" : "Back"} className="min-w-11 min-h-11 flex items-center justify-center"><ArrowLeft size={22} /></button>
    <SatiLogo size={28} />
    <h2 className="font-display font-bold text-lg font-lao">{title}</h2>
  </header>;
}

const Chip = ({ children }: { children: React.ReactNode }) =>
  <span aria-hidden className="w-9 h-9 rounded-xl bg-[#EDE7FB] dark:bg-primary/20 text-primary flex items-center justify-center shrink-0">{children}</span>;

const Section = ({ label, children }: { label: string; children: React.ReactNode }) =>
  <section className="mt-5">
    <h3 className="px-1 mb-2 text-xs font-semibold text-muted-foreground font-lao">{label}</h3>
    <div className="rounded-2xl border border-[#E6E6F0] dark:border-border bg-background divide-y divide-[#EEEEF4] dark:divide-border overflow-hidden">{children}</div>
  </section>;

export function SettingsScreen({ lang, onLangChange, themeMode, onThemeChange, onChangeBand, onLogout, onBack }: {
  lang: Lang; onLangChange: (l: Lang) => void; themeMode: ThemeMode; onThemeChange: (m: ThemeMode) => void;
  onChangeBand: () => void; onLogout?: () => void; onBack: () => void;
}) {
  const lo = lang === "lo";
  const band = useBand();
  const size = useTextSize();
  const simple = useSimpleMode();
  const [legal, setLegal] = useState<null | PolicyKind>(null);
  if (legal) return <LegalPage lang={lang} kind={legal} onBack={() => setLegal(null)} />;

  return (
    <div className="h-full flex flex-col bg-background font-lao">
      <Header title={lo ? "ການຕັ້ງຄ່າ" : "Settings"} onBack={onBack} lang={lang} />
      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide px-4 pb-8">
        <Section label={lo ? "ທົ່ວໄປ" : "General"}>
          <div className="p-4 grid gap-3">
            <div className="flex items-center gap-3"><Chip><Languages size={18} /></Chip><span className="font-semibold">{lo ? "ພາສາ" : "Language"}</span></div>
            <Segmented label={lo ? "ພາສາ" : "Language"} value={lang} onChange={onLangChange} options={[{ value: "lo", label: "ລາວ" }, { value: "en", label: "English" }]} />
          </div>
          <button type="button" onClick={onChangeBand} className="w-full min-h-[60px] flex items-center gap-3 px-4 py-2 text-left">
            <Chip><Users size={18} /></Chip>
            <span className="flex-1 font-semibold">{lo ? "ກຸ່ມອາຍຸ" : "Age group"}</span>
            <span className="text-sm text-muted-foreground">{bandLabel(band, lang)}</span>
            <ChevronRight size={18} className="text-muted-foreground" aria-hidden />
          </button>
        </Section>

        <Section label={lo ? "ການສະແດງຜົນ" : "Display"}>
          <div className="p-4 grid gap-3">
            <div className="flex items-center gap-3"><Chip><Type size={18} /></Chip><span className="font-semibold">{lo ? "ຂະໜາດຕົວອັກສອນ" : "Text size"}</span></div>
            <Segmented<TextSize> label={lo ? "ຂະໜາດຕົວອັກສອນ" : "Text size"} value={size} onChange={setTextSize}
              options={[{ value: "normal", label: lo ? "ປົກກະຕິ" : "Normal" }, { value: "large", label: lo ? "ໃຫຍ່" : "Large" }, { value: "xlarge", label: lo ? "ໃຫຍ່ຫຼາຍ" : "Extra large" }]} />
            <p aria-live="polite" className="rounded-xl bg-[#FAFAFD] dark:bg-muted/40 border border-[#EEEEF4] dark:border-border px-3 py-2 text-base">
              {lo ? "ຕົວຢ່າງ: ຢ່າກົດລິ້ງທີ່ບໍ່ຮູ້ຈັກ." : "Preview: don't tap links you don't know."} <span className="text-muted-foreground text-sm">({TEXT_SCALE[size]}×)</span>
            </p>
          </div>
          <div className="p-4 grid gap-3">
            <div className="flex items-center gap-3"><Chip><Palette size={18} /></Chip><span className="font-semibold">{lo ? "ຮູບແບບສີ" : "Theme"}</span></div>
            <Segmented<ThemeMode> label={lo ? "ຮູບແບບສີ" : "Theme"} value={themeMode} onChange={onThemeChange}
              options={[{ value: "light", label: lo ? "ແຈ້ງ" : "Light" }, { value: "dark", label: lo ? "ມືດ" : "Dark" }, { value: "system", label: lo ? "ອັດຕະໂນມັດ" : "Auto" }]} />
          </div>
          <button type="button" role="switch" aria-checked={simple} onClick={() => setSimpleMode(!simple)} className="w-full min-h-[60px] flex items-center gap-3 px-4 py-2 text-left">
            <Chip><Accessibility size={18} /></Chip>
            <span className="flex-1 font-semibold">{lo ? "ໂໝດງ່າຍ" : "Simple mode"}</span>
            <span aria-hidden className={`w-12 h-7 rounded-full p-1 transition-colors ${simple ? "bg-primary" : "bg-[#D9DAE5] dark:bg-muted"}`}><span className={`block w-5 h-5 rounded-full bg-white shadow transition-transform ${simple ? "translate-x-5" : ""}`} /></span>
          </button>
        </Section>

        <Section label={lo ? "ກ່ຽວກັບ" : "About"}>
          <button type="button" onClick={() => setLegal("privacy")} className="w-full min-h-[56px] flex items-center gap-3 px-4 py-2 text-left">
            <Chip><ShieldCheck size={18} /></Chip><span className="flex-1 font-semibold">{lo ? "ນະໂຍບາຍຄວາມເປັນສ່ວນຕົວ" : "Privacy policy"}</span><ChevronRight size={18} className="text-muted-foreground" aria-hidden />
          </button>
          <button type="button" onClick={() => setLegal("guidelines")} className="w-full min-h-[56px] flex items-center gap-3 px-4 py-2 text-left">
            <Chip><Users size={18} /></Chip><span className="flex-1 font-semibold">{lo ? "ກົດລະບຽບຊຸມຊົນ" : "Community Guidelines"}</span><ChevronRight size={18} className="text-muted-foreground" aria-hidden />
          </button>
          <button type="button" onClick={() => setLegal("terms")} className="w-full min-h-[56px] flex items-center gap-3 px-4 py-2 text-left">
            <Chip><FileText size={18} /></Chip><span className="flex-1 font-semibold">{lo ? "ເງື່ອນໄຂການນຳໃຊ້" : "Terms of use"}</span><ChevronRight size={18} className="text-muted-foreground" aria-hidden />
          </button>
          <div className="min-h-[56px] flex items-center gap-3 px-4 py-2">
            <Chip><Info size={18} /></Chip><span className="flex-1 font-semibold">{lo ? "ເວີຊັນ" : "Version"}</span><span className="text-sm text-muted-foreground">{VERSION}</span>
          </div>
        </Section>

        {onLogout && <button type="button" onClick={onLogout} className="mt-6 w-full min-h-12 rounded-2xl border border-red-300 text-red-600 font-semibold flex items-center justify-center gap-2">
          <LogOut size={18} aria-hidden />{lo ? "ອອກຈາກລະບົບ" : "Sign out"}
        </button>}
      </div>
    </div>
  );
}

export function LegalPage({ lang, kind, onBack }: { lang: Lang; kind: PolicyKind; onBack: () => void }) {
  return (
    <div className="h-full flex flex-col bg-background font-lao">
      <Header title={POLICY_TITLES[kind][lang]} onBack={onBack} lang={lang} />
      <div className="flex-1 min-h-0 overflow-y-auto px-5 py-4">
        <p className="text-xs font-semibold text-muted-foreground mb-4">{EFFECTIVE[lang]}</p>
        <PolicyBody kind={kind} lang={lang} />
      </div>
    </div>
  );
}
