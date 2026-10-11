import { api, request } from "../lib/api";
import logoImage from "/images/Satisampasanya_Logo_app.png";
import { T } from "../lib/translations";
import { useState } from "react";
import { LangToggle, FormInput } from "../components/shared/Controls";
import { SatiIllustration, SatiLogo } from "../components/shared/Brand";
import { ArrowLeft, EyeOff, Eye, Check } from "lucide-react";
import type { Lang, CurrentUser, AuthView } from "../types";

export function AuthScreen({ lang, onLangToggle, onLogin }: { lang: Lang; onLangToggle: () => void; onLogin: (u: CurrentUser) => void; }) {
  const t = T[lang];
  const [busy, setBusy] = useState(false);
  const [authError, setAuthError] = useState("");
  const [resetToken, setResetToken] = useState(new URLSearchParams(window.location.search).get('reset') || '');
  const [resetPassword, setResetPassword] = useState('');
  const feedback = <>{authError && <p role="alert" className="text-sm text-red-600 mb-3">{authError}</p>}{busy && <p role="status" className="text-sm text-muted-foreground mb-3">{lang === 'lo' ? 'ກຳລັງດຳເນີນການ…' : 'Please wait…'}</p>}</>;
  const [view, setView] = useState<AuthView>(new URLSearchParams(window.location.search).has("reset") ? "forgot" : "welcome");
  const [loginEmail, setLoginEmail] = useState(""); const [loginPw, setLoginPw] = useState(""); const [showLoginPw, setShowLoginPw] = useState(false); const [loginErrors, setLoginErrors] = useState<Record<string,string>>({});
  const [regName, setRegName] = useState(""); const [regEmail, setRegEmail] = useState(""); const [regPw, setRegPw] = useState(""); const [regConfirm, setRegConfirm] = useState(""); const [showRegPw, setShowRegPw] = useState(false); const [showConfirmPw, setShowConfirmPw] = useState(false); const [regErrors, setRegErrors] = useState<Record<string,string>>({});
  const [forgotEmail, setForgotEmail] = useState(""); const [forgotError, setForgotError] = useState(""); const [resetSent, setResetSent] = useState(false);
  const isValidEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

  const handleLogin = async () => {
    if (busy) return;
    const errs: Record<string,string> = {};
    if (!loginEmail) errs.email = t.err_required; else if (!isValidEmail(loginEmail)) errs.email = t.err_email;
    if (!loginPw) errs.pw = t.err_required;
    setLoginErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setBusy(true); setAuthError('');
    try { onLogin(await api.authenticate('login', {email: loginEmail, password: loginPw})); }
    catch (e) { setAuthError((e as Error).message); } finally { setBusy(false); }
  };
  const handleRegister = async () => {
    if (busy) return;
    const errs: Record<string,string> = {};
    if (!regName.trim()) errs.name = t.err_required;
    if (!regEmail) errs.email = t.err_required; else if (!isValidEmail(regEmail)) errs.email = t.err_email;
    if (!regPw) errs.pw = t.err_required; else if (regPw.length < 8) errs.pw = t.err_pw_short;
    if (!regConfirm) errs.confirm = t.err_required; else if (regConfirm !== regPw) errs.confirm = t.err_pw_match;
    setRegErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setBusy(true); setAuthError('');
    try { onLogin(await api.authenticate('register', {name: regName.trim(), email: regEmail, password: regPw})); }
    catch (e) { setAuthError((e as Error).message); } finally { setBusy(false); }
  };
  const handleForgot = async () => {
    if (busy) return;
    if (!forgotEmail) { setForgotError(t.err_required); return; }
    if (!isValidEmail(forgotEmail)) { setForgotError(t.err_email); return; }
    setForgotError(''); setBusy(true); setAuthError('');
    try { await request('/auth/forgot', 'POST', {email: forgotEmail}); setResetSent(true); }
    catch(e) { setAuthError((e as Error).message); } finally { setBusy(false); }
  };

  if (view === "welcome") return (
    <div className="h-full flex flex-col bg-background">
      <div className="flex justify-end px-5 pt-3"><div className="flex items-center gap-3"><SatiLogo size={28} /><LangToggle lang={lang} onToggle={onLangToggle} /></div></div>
      <div className="flex-1 flex items-center justify-center px-8"><SatiIllustration /></div>
      <div className="bg-background rounded-t-3xl px-7 pt-7 pb-8 shadow-[0_-8px_32px_rgba(91,33,209,0.08)] border-t border-border">
        <div className="flex items-center gap-2 mb-3">
          <img src={logoImage} alt="Sati Logo" className="w-8 h-8 rounded-lg object-contain" />
          <span className="font-display font-bold text-base" style={{ letterSpacing:"-0.02em" }}>{t.app_short}</span>
        </div>
        <h1 className="font-display font-bold mb-3 whitespace-pre-line leading-tight text-foreground" style={{ fontSize:"clamp(24px,7vw,30px)", letterSpacing:"-0.02em" }}>{t.welcome_title}</h1>
        <p className="text-sm text-muted-foreground leading-relaxed mb-7 font-lao">{t.welcome_sub}</p>
        <div className="flex gap-3">
          <button onClick={() => setView("login")} className="flex-1 bg-primary text-white font-semibold py-3.5 rounded-2xl text-sm active:scale-[0.98] transition-transform font-lao" style={{ boxShadow:"0 4px 14px rgba(91,33,209,0.35)" }}>{t.btn_login}</button>
          <button onClick={() => setView("register")} className="flex-1 border-2 border-primary text-primary font-semibold py-3.5 rounded-2xl text-sm active:scale-[0.98] transition-transform font-lao">{t.btn_register}</button>
        </div>
      </div>
    </div>
  );

  if (view === "login") return (
    <div className="h-full flex flex-col bg-background overflow-y-auto scrollbar-hide">
      <div className="px-5 pt-3 pb-6 bg-background">
        <div className="flex items-center justify-between mb-5">
          <button onClick={() => setView("welcome")} className="p-2 -ml-2"><ArrowLeft size={20} strokeWidth={1.75} /></button>
          <div className="flex items-center gap-3"><SatiLogo size={28} /><LangToggle lang={lang} onToggle={onLangToggle} /></div>
        </div>
        <h2 className="font-display font-bold text-2xl mb-1 font-lao" style={{ letterSpacing:"-0.02em" }}>{t.login_title}</h2>
        <p className="text-sm text-muted-foreground font-semibold font-lao">{t.login_sub}</p>
      </div>
      <div className="flex-1 px-5 pt-6 pb-4">{feedback}
        <FormInput value={loginEmail} onChange={(v) => { setLoginEmail(v); setLoginErrors(e => ({...e,email:""})); }} placeholder={t.field_email} type="email" error={loginErrors.email} />
        <FormInput value={loginPw} onChange={(v) => { setLoginPw(v); setLoginErrors(e => ({...e,pw:""})); }} placeholder={t.field_password} type={showLoginPw?"text":"password"} error={loginErrors.pw}
          right={<button onClick={() => setShowLoginPw(v => !v)} className="text-muted-foreground/60 p-0.5 ml-1">{showLoginPw ? <EyeOff size={16} /> : <Eye size={16} />}</button>} />
        <div className="flex justify-end mb-5"><button onClick={() => setView("forgot")} className="text-xs font-semibold text-primary font-lao">{t.forgot_link}</button></div>
        <button onClick={handleLogin} disabled={busy} className="w-full bg-primary text-white font-semibold py-3.5 rounded-2xl text-sm mb-2 active:scale-[0.98] transition-transform font-lao" style={{ boxShadow:"0 4px 14px rgba(91,33,209,0.35)" }}>{t.btn_signin}</button>
        <div className="mt-4 text-center">
          <button onClick={() => setView("register")} className="text-sm text-muted-foreground font-lao">{t.create_account} <span className="text-primary font-semibold">{t.btn_register}</span></button>
        </div>
      </div>
    </div>
  );

  if (view === "register") return (
    <div className="h-full flex flex-col bg-background overflow-y-auto scrollbar-hide">
      <div className="px-5 pt-3 pb-6 bg-background">
        <div className="flex items-center justify-between mb-5">
          <button onClick={() => setView("welcome")} className="p-2 -ml-2"><ArrowLeft size={20} strokeWidth={1.75} /></button>
          <div className="flex items-center gap-3"><SatiLogo size={28} /><LangToggle lang={lang} onToggle={onLangToggle} /></div>
        </div>
        <h2 className="font-display font-bold text-2xl mb-1 font-lao" style={{ letterSpacing:"-0.02em" }}>{t.register_title}</h2>
        <p className="text-sm text-muted-foreground font-semibold font-lao">{t.register_sub}</p>
      </div>
      <div className="flex-1 px-5 pt-6 pb-4">{feedback}
        <FormInput value={regName} onChange={(v) => { setRegName(v); setRegErrors(e=>({...e,name:""})); }} placeholder={t.field_name} error={regErrors.name} />
        <FormInput value={regEmail} onChange={(v) => { setRegEmail(v); setRegErrors(e=>({...e,email:""})); }} placeholder={t.field_email} type="email" error={regErrors.email} />
        <FormInput value={regPw} onChange={(v) => { setRegPw(v); setRegErrors(e=>({...e,pw:""})); }} placeholder={t.field_password} type={showRegPw?"text":"password"} error={regErrors.pw}
          right={<button onClick={() => setShowRegPw(v=>!v)} className="text-muted-foreground/60 p-0.5 ml-1">{showRegPw?<EyeOff size={16}/>:<Eye size={16}/>}</button>} />
        <FormInput value={regConfirm} onChange={(v) => { setRegConfirm(v); setRegErrors(e=>({...e,confirm:""})); }} placeholder={t.field_confirm} type={showConfirmPw?"text":"password"} error={regErrors.confirm}
          right={<button onClick={() => setShowConfirmPw(v=>!v)} className="text-muted-foreground/60 p-0.5 ml-1">{showConfirmPw?<EyeOff size={16}/>:<Eye size={16}/>}</button>} />
        <button onClick={handleRegister} disabled={busy} className="w-full bg-primary text-white font-semibold py-3.5 rounded-2xl text-sm mt-2 mb-2 active:scale-[0.98] transition-transform font-lao" style={{ boxShadow:"0 4px 14px rgba(91,33,209,0.35)" }}>{t.btn_signup}</button>
        <div className="mt-4 text-center">
          <button onClick={() => setView("login")} className="text-sm text-muted-foreground font-lao">{t.have_account} <span className="text-primary font-semibold">{t.btn_signin}</span></button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="px-5 pt-3 pb-6 bg-background">
        <div className="flex items-center justify-between mb-5">
          <button onClick={() => setView("login")} className="p-2 -ml-2"><ArrowLeft size={20} strokeWidth={1.75} /></button>
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
          <button onClick={() => setView("login")} className="text-sm text-muted-foreground font-lao">{t.back_signin}</button>
        </div>
      </div>
  );
}
