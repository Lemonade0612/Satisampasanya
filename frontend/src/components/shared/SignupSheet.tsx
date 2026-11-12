import { useState } from "react";
import { ArrowLeft, Eye, EyeOff, X } from "lucide-react";
import { api, ApiError } from "../../lib/api";
import { T } from "../../lib/translations";
import { GuardianNote } from "./BandSheet";
import { LegalPage } from "../../screens/SettingsScreen";
import type { PolicyKind } from "./PolicyText";
import type { Band, CurrentUser, Lang } from "../../types";

const unreachable = (e: unknown) => e instanceof ApiError && (e.status === 0 || e.status >= 500);
const isValidEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

// Labelled auth field: 52px, rounded-14, soft fill, purple focus ring.
export function AuthField({ label, value, onChange, type = "text", placeholder, error, autoComplete, labelRight, reveal }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string; error?: string;
  autoComplete?: string; labelRight?: React.ReactNode; reveal?: { shown: boolean; toggle: () => void; lang: Lang };
}) {
  const id = `f-${label.replace(/\s+/g, "-")}`;
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-1.5">
        <label htmlFor={id} className="text-sm font-semibold text-foreground font-lao">{label}</label>
        {labelRight}
      </div>
      <div className={`flex items-center h-[52px] rounded-[14px] border bg-[#FAFAFD] dark:bg-muted/40 px-4 transition-shadow ${error ? "border-red-400" : "border-[#E6E6F0] dark:border-border focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/15"}`}>
        <input id={id} value={value} onChange={e => onChange(e.target.value)} type={reveal ? (reveal.shown ? "text" : "password") : type}
          placeholder={placeholder} autoComplete={autoComplete} aria-invalid={!!error}
          className="flex-1 min-w-0 bg-transparent text-base outline-none text-foreground placeholder:text-muted-foreground/60 font-lao" />
        {reveal && <button type="button" onClick={reveal.toggle} aria-label={reveal.lang === "lo" ? (reveal.shown ? "ເຊື່ອງລະຫັດ" : "ສະແດງລະຫັດ") : (reveal.shown ? "Hide password" : "Show password")}
          className="-mr-3 min-w-11 min-h-11 flex items-center justify-center text-muted-foreground">{reveal.shown ? <EyeOff size={18} /> : <Eye size={18} />}</button>}
      </div>
      {error && <p role="alert" className="text-xs text-red-600 mt-1 ml-1">{error}</p>}
    </div>
  );
}

export const primaryBtn = "w-full h-14 bg-primary text-white font-semibold rounded-2xl text-base active:scale-[0.98] transition-transform font-lao disabled:opacity-50 flex items-center justify-center gap-2";
export const primaryShadow = { boxShadow: "0 6px 18px rgba(91,33,209,0.28)" };

const BANDS: { id: Band; lo: string; en: string; range: string; dLo: string; dEn: string }[] = [
  { id: "kids", lo: "ເດັກນ້ອຍ", en: "Kids", range: "6–14", dLo: "ເບິ່ງແຕ່ໂພສທີ່ກວດແລ້ວ", dEn: "Only checked posts" },
  { id: "youth", lo: "ໄວໜຸ່ມ", en: "Youth", range: "15–24", dLo: "ຊຸມຊົນ, ເກມ ແລະ ຖາມ Sati", dEn: "Community, games and Ask Sati" },
  { id: "adult", lo: "ຜູ້ໃຫຍ່", en: "Adults", range: "25–59", dLo: "ປົກປ້ອງຕົນເອງ ແລະ ຄອບຄົວ", dEn: "Protect yourself and your family" },
  { id: "elder", lo: "ຜູ້ສູງອາຍຸ", en: "Elders", range: "60+", dLo: "ຕົວໃຫຍ່ ໃຊ້ງ່າຍ", dEn: "Big text, easy to use" },
]; // REVIEW-LO

// Two-step sign-up in a bottom sheet: account details, then who uses it. Only the age group is sent.
export function SignupSheet({ lang, initialBand, onClose, onLogin, onOffline }: {
  lang: Lang; initialBand?: Band | null; onClose: () => void; onLogin: (u: CurrentUser) => void; onOffline: () => void;
}) {
  const t = T[lang], lo = lang === "lo";
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState(""), [email, setEmail] = useState(""), [pw, setPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [band, setBand] = useState<Band | null>(initialBand ?? null);
  const [busy, setBusy] = useState(false), [error, setError] = useState("");
  const [legal, setLegal] = useState<null | PolicyKind>(null);

  if (legal) return <div className="fixed inset-0 z-[80] mx-auto max-w-md bg-background"><LegalPage lang={lang} kind={legal} onBack={() => setLegal(null)} /></div>;

  const next = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = t.err_required;
    if (!email) errs.email = t.err_required; else if (!isValidEmail(email.trim())) errs.email = t.err_email;
    if (!pw) errs.pw = t.err_required; else if (pw.length < 8) errs.pw = t.err_pw_short;
    setErrors(errs);
    if (!Object.keys(errs).length) setStep(2);
  };
  const submit = async () => {
    if (busy || !band) return;
    setBusy(true); setError("");
    try { onLogin(await api.authenticate("register", { name: name.trim(), email: email.trim(), password: pw, ageBand: band })); }
    catch (e) { if (unreachable(e)) onOffline(); else { setError((e as Error).message); setStep(1); } }
    finally { setBusy(false); }
  };

  return (
    <div className="fixed inset-0 z-[70] mx-auto max-w-md flex items-end bg-black/50 daily-fade" onClick={onClose}>
      <form role="dialog" aria-modal="true" aria-label={lo ? "ສ້າງບັນຊີ" : "Create account"} onClick={e => e.stopPropagation()}
        onSubmit={e => { e.preventDefault(); if (step === 1) next(); else void submit(); }}
        className="daily-in w-full bg-background rounded-t-[26px] px-5 pt-2 pb-[calc(1.25rem+env(safe-area-inset-bottom))] max-h-[92%] overflow-y-auto font-lao">
        <div aria-hidden className="mx-auto mb-3 w-10 h-1.5 rounded-full bg-[#E6E6F0]" />
        <div className="flex items-start gap-2 mb-5">
          {step === 2 && <button type="button" onClick={() => setStep(1)} aria-label={lo ? "ກັບ" : "Back"} className="-ml-2 min-w-11 min-h-11 flex items-center justify-center"><ArrowLeft size={20} /></button>}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-primary">{step}/2</p>
            <h2 className="font-display font-bold text-[22px] leading-tight">{step === 1 ? (lo ? "ສ້າງບັນຊີ" : "Create account") : (lo ? "ໃຜຈະໃຊ້ບັນຊີນີ້?" : "Who will use this account?")}</h2>
            <p className="text-sm text-muted-foreground mt-0.5">{step === 1 ? (lo ? "ໃຊ້ເວລາບໍ່ເຖິງ 1 ນາທີ" : "Takes less than a minute")
              : (lo ? "ເນື້ອຫາຈະປັບໃຫ້ເໝາະກັບກຸ່ມອາຍຸ. ເກັບແຕ່ກຸ່ມອາຍຸ, ບໍ່ເກັບວັນເກີດ." : "Content fits the age group. Only the group is saved, never a birthday.")}</p>
          </div>
          <button type="button" onClick={onClose} aria-label={lo ? "ປິດ" : "Close"} className="-mr-1 w-11 h-11 shrink-0 rounded-full bg-[#F3F4F8] dark:bg-muted flex items-center justify-center text-[#4B4F73] dark:text-muted-foreground"><X size={18} /></button>
        </div>
        {error && <p role="alert" className="text-sm text-red-600 mb-3">{error}</p>}
        {step === 1 ? <>
          <AuthField label={lo ? "ຊື່" : "Name"} value={name} onChange={v => { setName(v); setErrors(e => ({ ...e, name: "" })); }} autoComplete="name" error={errors.name} />
          <AuthField label={lo ? "ອີເມວ" : "Email"} type="email" value={email} onChange={v => { setEmail(v); setErrors(e => ({ ...e, email: "" })); }} autoComplete="email" error={errors.email} />
          <AuthField label={lo ? "ລະຫັດຜ່ານ" : "Password"} value={pw} onChange={v => { setPw(v); setErrors(e => ({ ...e, pw: "" })); }} autoComplete="new-password"
            placeholder={lo ? "ຢ່າງໜ້ອຍ 8 ຕົວອັກສອນ" : "At least 8 characters"} error={errors.pw} reveal={{ shown: showPw, toggle: () => setShowPw(v => !v), lang }} />
          <button type="submit" className={`${primaryBtn} mt-2`} style={primaryShadow}>{lo ? "ຕໍ່ໄປ" : "Next"}</button>
        </> : <>
          <div role="radiogroup" className="grid gap-2.5">
            {BANDS.map(b => {
              const on = band === b.id;
              return <button key={b.id} type="button" role="radio" aria-checked={on} onClick={() => setBand(b.id)}
                className={`min-h-[64px] w-full flex items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-colors ${on ? "border-primary bg-[#F4F0FD] dark:bg-primary/15" : "border-[#E6E6F0] dark:border-border bg-background"}`}>
                <span className="flex-1 min-w-0"><span className="block font-semibold text-foreground">{lo ? b.lo : b.en} <span className="text-muted-foreground font-normal">{b.range}</span></span>
                  <span className="block text-sm text-muted-foreground">{lo ? b.dLo : b.dEn}</span></span>
                <span aria-hidden className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${on ? "border-primary" : "border-[#C9C9D6]"}`}>{on && <span className="w-2.5 h-2.5 rounded-full bg-primary" />}</span>
              </button>;
            })}
          </div>
          {band === "kids" && <div className="mt-3"><GuardianNote lang={lang} account /></div>}
          <p className="text-xs text-muted-foreground leading-relaxed text-center mt-4 mb-3 font-lao">
            {lo ? "ການສ້າງບັນຊີ ໝາຍຄວາມວ່າທ່ານຍອມຮັບ " : "By signing up, you agree to the "}
            <button type="button" onClick={() => setLegal("terms")} className="text-primary font-semibold underline min-h-6">{lo ? "ເງື່ອນໄຂການນຳໃຊ້" : "Terms of Use"}</button>
            {", "}
            <button type="button" onClick={() => setLegal("privacy")} className="text-primary font-semibold underline min-h-6">{lo ? "ນະໂຍບາຍຄວາມເປັນສ່ວນຕົວ" : "Privacy Policy"}</button>
            {lo ? " ແລະ " : " and "}
            <button type="button" onClick={() => setLegal("guidelines")} className="text-primary font-semibold underline min-h-6">{lo ? "ກົດລະບຽບຊຸມຊົນ" : "Community Guidelines"}</button>
            {lo ? ". ເດັກອາຍຸຕ່ຳກວ່າ 15 ປີ ຕ້ອງມີຜູ້ປົກຄອງຍິນຍອມ." : ". Under 15? A parent or guardian must agree for you."}
          </p>{/* REVIEW-LO */}
          <button type="submit" disabled={busy || !band} className={primaryBtn} style={primaryShadow}>{busy ? (lo ? "ກຳລັງດຳເນີນການ…" : "Please wait…") : (lo ? "ສ້າງບັນຊີ" : "Create account")}</button>
        </>}
      </form>
    </div>
  );
}
