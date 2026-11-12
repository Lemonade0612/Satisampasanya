import { api, request, ApiError } from "../lib/api";
import { T } from "../lib/translations";
import { useState } from "react";
import { LangToggle, FormInput } from "../components/shared/Controls";
import { AuthField, SignupSheet, primaryBtn, primaryShadow } from "../components/shared/SignupSheet";
import { DEFAULT_BAND, getBand, hasBand, setBand } from "../lib/band";
import { setTextSize } from "../lib/textSize";
import { SatiLogo } from "../components/shared/Brand";
import { ArrowLeft, ArrowRight, Check, ChevronRight, Gamepad2, ALargeSmall } from "lucide-react";
import type { Lang, CurrentUser, AuthView } from "../types";

// Server down or unreachable (or a proxy error page): play offline instead of showing an error.
const unreachable = (e: unknown) => e instanceof ApiError && (e.status === 0 || e.status >= 500);

export function AuthScreen({ lang, onLangToggle, onLogin, onGuest, onOffline }: { lang: Lang; onLangToggle: () => void; onLogin: (u: CurrentUser) => void; onGuest: () => void; onOffline: () => void; }) {
  const t = T[lang];
  const [busy, setBusy] = useState(false);
  const [authError, setAuthError] = useState("");
  const [resetToken, setResetToken] = useState(new URLSearchParams(window.location.search).get('reset') || '');
  const [resetPassword, setResetPassword] = useState('');
  const feedback = <>{authError && <p role="alert" className="text-sm text-red-600 mb-3">{authError}</p>}{busy && <p role="status" className="text-sm text-muted-foreground mb-3">{lang === 'lo' ? 'ກຳລັງດຳເນີນການ…' : 'Please wait…'}</p>}</>;
  const [view, setView] = useState<AuthView>(new URLSearchParams(window.location.search).has("reset") ? "forgot" : "welcome");
  const [loginEmail, setLoginEmail] = useState(""); const [loginPw, setLoginPw] = useState(""); const [showLoginPw, setShowLoginPw] = useState(false); const [loginErrors, setLoginErrors] = useState<Record<string,string>>({});
  const [signup, setSignup] = useState(false);
  const [easy, setEasy] = useState(() => getBand() === 'elder' && hasBand());
  const toggleEasy = (on: boolean) => { setEasy(on); setTextSize(on ? 'large' : 'normal'); setBand(on ? 'elder' : DEFAULT_BAND); };
  const [forgotEmail, setForgotEmail] = useState(""); const [forgotError, setForgotError] = useState(""); const [resetSent, setResetSent] = useState(false);
  const isValidEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

  const handleLogin = async () => {
    if (busy) return;
    const errs: Record<string,string> = {};
    // Quick accounts sign in with their code (sati-xxxxxx) and 4-digit PIN.
    const code = /^sati-[a-z0-9]{6}$/i.test(loginEmail.trim());
    if (!loginEmail) errs.email = t.err_required; else if (!code && !isValidEmail(loginEmail.trim())) errs.email = t.err_email;
    if (!loginPw) errs.pw = t.err_required;
    setLoginErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setBusy(true); setAuthError('');
    try { onLogin(await api.authenticate('login', {email: code ? loginEmail.trim().toLowerCase() : loginEmail.trim(), password: loginPw})); }
    catch (e) { if (unreachable(e)) onOffline(); else setAuthError((e as Error).message); } finally { setBusy(false); }
  };
  const handleForgot = async () => {
    if (busy) return;
    if (!forgotEmail) { setForgotError(t.err_required); return; }
    if (!isValidEmail(forgotEmail)) { setForgotError(t.err_email); return; }
    setForgotError(''); setBusy(true); setAuthError('');
    try { await request('/auth/forgot', 'POST', {email: forgotEmail}); setResetSent(true); }
    catch(e) { setAuthError((e as Error).message); } finally { setBusy(false); }
  };

  const lo = lang === 'lo';
  const sheet = signup && <SignupSheet lang={lang} initialBand={easy ? 'elder' : null} onClose={() => setSignup(false)} onLogin={onLogin} onOffline={onOffline} />;

  if (view === "welcome") return (
    <div className="h-full flex flex-col bg-background">
      <div className="flex items-center justify-between px-5 pt-3">
        <div className="flex items-center gap-2 min-w-0">
          <SatiLogo size={32} />
          <span className="font-display font-bold text-base text-foreground truncate font-lao" style={{ letterSpacing:"-0.02em" }}>ສະຕິຊໍາປະຊັນຍະ</span>
        </div>
        <LangToggle lang={lang} onToggle={onLangToggle} />
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide flex flex-col justify-center w-full max-w-md mx-auto">
        <div className={`shrink-0 min-h-[120px] flex items-center justify-center px-8 pt-2 ${easy ? "h-[180px]" : "h-[250px]"}`}><img src="/images/welcome-community.png" alt="" className="h-full w-auto max-w-full object-contain" /></div>
        <div className="px-6 pt-3 pb-5">
          <h1 className="font-display font-bold mb-2 whitespace-pre-line leading-tight text-foreground" style={{ fontSize:"clamp(24px,7vw,30px)", letterSpacing:"-0.02em" }}>{t.welcome_title}</h1>
          <p className="text-sm text-muted-foreground leading-relaxed mb-6 font-lao">{t.welcome_sub}</p>
          <button type="button" onClick={() => setSignup(true)} className={primaryBtn} style={primaryShadow}>{lo ? 'ເລີ່ມເລີຍ' : 'Get started'}<ArrowRight size={20} aria-hidden /></button>
          <div className="grid grid-cols-2 gap-3 mt-3">
            <button type="button" onClick={onGuest} className="text-left rounded-2xl border border-[#E6E6F0] dark:border-border bg-background p-3 min-h-11 active:scale-[0.98] transition-transform font-lao">
              <span aria-hidden className="w-9 h-9 rounded-xl bg-[#EDE7FB] text-[#5B21D1] flex items-center justify-center mb-2"><Gamepad2 size={20} /></span>
              <span className="block font-semibold text-sm text-foreground">{lo ? 'ລອງຫຼິ້ນເກມ' : 'Try the games'}</span>
              <span className="block text-xs text-muted-foreground leading-snug mt-0.5">{lo ? 'ຝຶກຈັບການຫຼອກລວງ ໂດຍບໍ່ຕ້ອງມີບັນຊີ' : 'Practise spotting scams, no account needed'}</span>
            </button>
            <button type="button" role="switch" aria-checked={easy} onClick={() => toggleEasy(!easy)}
              className={`text-left rounded-2xl border bg-background p-3 min-h-11 active:scale-[0.98] transition-all font-lao ${easy ? 'border-[#2563EB] ring-1 ring-[#2563EB]' : 'border-[#E6E6F0] dark:border-border'}`}>
              <span className="flex items-start justify-between mb-2">
                <span aria-hidden className="w-9 h-9 rounded-xl bg-[#DCEBFE] text-[#2563EB] flex items-center justify-center"><ALargeSmall size={20} /></span>
                <span aria-hidden className={`w-10 h-6 rounded-full p-0.5 transition-colors ${easy ? 'bg-[#2563EB]' : 'bg-[#D9DAE5]'}`}><span className={`block w-5 h-5 rounded-full bg-white shadow transition-transform ${easy ? 'translate-x-4' : ''}`} /></span>
              </span>
              <span className="block font-semibold text-sm text-foreground">{lo ? 'ໂໝດງ່າຍ' : 'Easy mode'}</span>
              <span className="block text-xs text-muted-foreground leading-snug mt-0.5">{lo ? 'ຕົວອັກສອນໃຫຍ່ ແລະ ໜ້າຈໍງ່າຍ ສຳລັບຜູ້ສູງອາຍຸ' : 'Bigger text and simpler screens for elders'}</span>
            </button>
          </div>
        </div>
        <div className="shrink-0 mx-6 border-t border-[#EEEEF4] dark:border-border pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] text-center">
        <button type="button" onClick={() => setView("login")} className="min-h-11 inline-flex items-center gap-1 text-sm text-muted-foreground font-lao">
          {lo ? 'ມີບັນຊີແລ້ວ?' : 'Already have an account?'} <span className="text-primary font-bold">{lo ? 'ເຂົ້າສູ່ລະບົບ' : 'Sign in'}</span><ChevronRight size={16} className="text-primary" aria-hidden />
        </button>
        </div>
      </div>
      {sheet}
    </div>
  ); // REVIEW-LO

  if (view === "login") return (
    <div className="h-full flex flex-col bg-background overflow-y-auto scrollbar-hide">
      <div className="flex items-center justify-between px-3 pt-2">
        <button type="button" aria-label={lo ? 'ກັບ' : 'Back'} onClick={() => setView("welcome")} className="min-h-11 min-w-11 flex items-center justify-center"><ArrowLeft size={22} strokeWidth={1.75} /></button>
        <SatiLogo size={32} className="mr-2" />
      </div>
      <div className="px-6 pt-4 pb-6">
        <h2 className="font-display font-bold text-[26px] leading-tight mb-1 font-lao" style={{ letterSpacing:"-0.02em" }}>{lo ? 'ຍິນດີຕ້ອນຮັບກັບມາ' : 'Welcome back'}</h2>
        <p className="text-sm text-muted-foreground font-lao">{lo ? 'ເຂົ້າສູ່ລະບົບເພື່ອເບິ່ງໂພສ ແລະ ແຈ້ງເຕືອນຂອງທ່ານ' : 'Sign in to see your posts and notifications'}</p>
      </div>
      <form onSubmit={e => {e.preventDefault();void handleLogin();}} className="flex-1 px-6 pb-4">{feedback}
        <AuthField label={lo ? 'ອີເມວ' : 'Email'} type="email" autoComplete="username" value={loginEmail} onChange={(v) => { setLoginEmail(v); setLoginErrors(e => ({...e,email:""})); }} error={loginErrors.email} />
        <AuthField label={lo ? 'ລະຫັດຜ່ານ' : 'Password'} autoComplete="current-password" value={loginPw} onChange={(v) => { setLoginPw(v); setLoginErrors(e => ({...e,pw:""})); }} error={loginErrors.pw}
          reveal={{ shown: showLoginPw, toggle: () => setShowLoginPw(v => !v), lang }}
          labelRight={<button type="button" onClick={() => setView("forgot")} className="min-h-11 -my-3 text-sm font-semibold text-primary font-lao">{t.forgot_link}</button>} />
        <button type="submit" disabled={busy} className={`${primaryBtn} mt-2`} style={primaryShadow}>{lo ? 'ເຂົ້າສູ່ລະບົບ' : 'Sign in'}</button>
      </form>
      <div className="px-6 pb-[calc(1rem+env(safe-area-inset-bottom))] text-center">
        <button type="button" onClick={() => setSignup(true)} className="min-h-11 text-sm text-muted-foreground font-lao">{lo ? 'ຍັງບໍ່ມີບັນຊີ?' : "Don't have an account?"} <span className="text-primary font-bold">{lo ? 'ສ້າງບັນຊີ' : 'Create account'}</span></button>
      </div>
      {sheet}
    </div>
  ); // REVIEW-LO

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="px-5 pt-3 pb-6 bg-background">
        <div className="flex items-center justify-between mb-5">
          <button type="button" onClick={() => setView("login")} className="p-2 -ml-2"><ArrowLeft size={20} strokeWidth={1.75} /></button>
          <div className="flex items-center gap-3"><SatiLogo size={28} /><LangToggle lang={lang} onToggle={onLangToggle} /></div>
        </div>
        <h2 className="font-display font-bold text-2xl mb-1 font-lao" style={{ letterSpacing:"-0.02em" }}>{t.forgot_title}</h2>
        <p className="text-sm text-muted-foreground font-lao">{t.forgot_sub}</p>
      </div>
      <div className="flex-1 px-5 pt-6">{feedback}
        {resetToken && <div className="mb-5 space-y-3"><FormInput value={resetPassword} onChange={setResetPassword} type="password" placeholder={lang === 'lo' ? 'ລະຫັດຜ່ານໃໝ່' : 'New password (8+ characters)'} /><button className="touch-target rounded-full bg-primary text-white px-4" disabled={busy || resetPassword.length < 8} onClick={async () => {setBusy(true);setAuthError('');try {await request('/auth/reset','POST',{token:resetToken,password:resetPassword});setResetToken('');window.history.replaceState({},'',window.location.pathname);setView('login');}catch(e){setAuthError((e as Error).message);}finally{setBusy(false);}}}>{lang === 'lo' ? 'ບັນທຶກ' : 'Save password'}</button></div>}
        {resetSent ? (
          <div className="rounded-2xl p-5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center mx-auto mb-3">
                <Check size={24} className="text-emerald-600 dark:text-emerald-400" />
              </div>
              <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300 font-lao">{lang === 'lo' ? 'ຖ້າມີບັນຊີນີ້ ລິ້ງປ່ຽນລະຫັດຈະສະແດງຢູ່ໃນ terminal ຂອງ backend. ຍັງບໍ່ໄດ້ຕັ້ງຄ່າອີເມລ.' : 'If this account exists, the reset link is in the backend terminal. Email delivery is not configured.'}</p>
            </div>
          ) : (
            <>
              <FormInput value={forgotEmail} onChange={(v) => { setForgotEmail(v); setForgotError(""); }} placeholder={t.field_email} type="email" error={forgotError} />
              <button onClick={handleForgot} disabled={busy} className="w-full bg-primary text-white font-semibold py-3.5 rounded-2xl text-sm mb-3 active:scale-[0.98] transition-transform font-lao" style={{ boxShadow:"0 4px 14px rgba(91,33,209,0.35)" }}>{t.btn_send_reset}</button>
            </>
          )}
        </div>
        <div className="px-5 pb-6 text-center">
          <button type="button" onClick={() => setView("login")} className="text-sm text-muted-foreground font-lao">{t.back_signin}</button>
        </div>
      </div>
  );
}
