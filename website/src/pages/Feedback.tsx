import { useRef, useState, type DragEvent, type FormEvent } from "react";
import { useI18n } from "../i18n";
import { en } from "../i18n/en";
import { CONTACT_EMAIL } from "../data/links";
import { FACEBOOK_LINKS } from "../data/placeholders";
import { submitNetlify } from "../lib/netlifyForm";
import RichEditor, { MAX_CHARS } from "../components/RichEditor";
import BookingWidget from "../components/BookingWidget";
import Icon, { FacebookIcon, type IconName } from "../components/Icon";
import sh from "../styles/Shared.module.css";
import s from "./Feedback.module.css";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_FILES = 5;
const fmtSize = (n: number) => (n > 1048576 ? `${(n / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`);
const kindOf = (f: File) => (f.type.startsWith("image/") ? "IMG" : f.type.startsWith("video/") ? "VID" : f.name.split(".").pop()?.slice(0, 4).toUpperCase() || "FILE");
type Errors = Partial<Record<"topic" | "msg" | "email" | "consent" | "files" | "send", string>>;

export default function Feedback() {
  const { t } = useI18n();
  const f = t.feedback;
  const [topic, setTopic] = useState(0);
  const [name, setName] = useState("");
  const [age, setAge] = useState(0);
  const [email, setEmail] = useState("");
  const [html, setHtml] = useState("");
  const [text, setText] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [consent, setConsent] = useState(false);
  const [errs, setErrs] = useState<Errors>({});
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");
  const [drag, setDrag] = useState(false);
  const [editorKey, setEditorKey] = useState(0);
  const input = useRef<HTMLInputElement>(null);

  const addFiles = (list: FileList | null) => {
    if (!list) return;
    const next = [...files, ...Array.from(list)];
    setFiles(next.slice(0, MAX_FILES));
    setErrs((e) => ({ ...e, files: next.length > MAX_FILES ? f.eFiles : undefined }));
    if (input.current) input.current.value = "";
  };
  const onDrop = (e: DragEvent) => { e.preventDefault(); setDrag(false); addFiles(e.dataTransfer.files); };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const er: Errors = {};
    if (!text.trim()) er.msg = f.eMsg;
    else if (text.length > MAX_CHARS) er.msg = f.eMsgLong;
    if (email.trim() && !EMAIL_RE.test(email.trim())) er.email = f.eEmail;
    if (!consent) er.consent = f.eConsent;
    setErrs(er);
    if (Object.keys(er).length) {
      (document.querySelector("[data-err]") as HTMLElement | null)?.scrollIntoView({ block: "center" });
      return;
    }
    setStatus("sending");
    try {
      await submitNetlify("feedback", {
        topic: en.feedback.topics[topic], name: name.trim(), ageBand: en.feedback.ages[age],
        email: email.trim(), message: html, messageText: text, consent: "yes",
      }, files);
      setStatus("done");
    } catch {
      setStatus("idle");
      setErrs({ send: f.eSend });
    }
  };
  const reset = () => {
    setTopic(0); setName(""); setAge(0); setEmail(""); setHtml(""); setText(""); setFiles([]); setConsent(false);
    setErrs({}); setStatus("idle"); setEditorKey((k) => k + 1);
  };

  const ways: { icon: IconName | "fb"; k: string; v: string; href?: string }[] = [
    { icon: "mail", k: f.wayEmail, v: CONTACT_EMAIL, href: `mailto:${CONTACT_EMAIL}` },
    { icon: "fb", k: f.wayFb, v: FACEBOOK_LINKS.sati.label, href: FACEBOOK_LINKS.sati.url },
    { icon: "phoneMock", k: f.wayApp, v: f.wayAppVal },
    { icon: "pin", k: f.wayBased, v: f.wayBasedVal },
  ];

  return (
    <>
      <section className={sh.hero}>
        <div className={`container ${sh.heroGrid}`}>
          <div className="rise">
            <p className={sh.crumb}>{f.crumb}</p>
            <h1 className={sh.h1}>{f.h1a}<br /><span className={sh.purple}>{f.h1b}</span></h1>
            <p className={sh.tag}>{f.tagline}</p>
            <p className={sh.lead}>{f.lead}</p>
          </div>
          <div className={sh.scene}>
            <div className={`${s.rate} ${sh.float}`}>
              <p>{f.rate}</p>
              <div className={s.stars} aria-hidden="true">
                {["#6018ee", "#6018ee", "#6018ee", "#7abbff", "#dcd8f0"].map((c, i) => (
                  <svg key={i} width="34" height="34" viewBox="0 0 24 24" fill={c} style={{ animationDelay: `${i * 0.12}s` }}><path d="M12 2l3 6.5 7 .8-5.2 4.8 1.5 7L12 17.5 5.7 21l1.5-7L2 9.3l7-.8z" /></svg>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={sh.sec} style={{ paddingTop: 48 }}>
        <div className={`container ${s.layout}`}>
          {status === "done" ? (
            <div className={s.form} role="status">
              <h2 className={s.fh}>{f.okTitle}</h2>
              <p className={s.fs}>{f.okBody}</p>
              <button type="button" className="btn btn-primary" onClick={reset}>{f.again}</button>
            </div>
          ) : (
            <form className={s.form} name="feedback" onSubmit={submit} noValidate>
              <h2 className={s.fh}>{f.formTitle}</h2>
              <p className={s.fs}>{f.formSub}</p>
              <input type="text" name="bot-field" tabIndex={-1} autoComplete="off" className="sr-only" aria-hidden="true" />

              <fieldset className={s.topics}>
                <legend>{f.topicQ}</legend>
                <div>
                  {f.topics.map((tp, i) => (
                    <label key={tp} className={topic === i ? s.topicOn : ""}>
                      <input type="radio" name="topic" checked={topic === i} onChange={() => setTopic(i)} />{tp}
                    </label>
                  ))}
                </div>
              </fieldset>

              <div className={s.two}>
                <label className={s.field}>{f.name}
                  <input value={name} onChange={(e) => setName(e.target.value)} placeholder={f.namePh} autoComplete="name" />
                </label>
                <label className={s.field}>{f.age}
                  <select value={age} onChange={(e) => setAge(Number(e.target.value))}>
                    {f.ages.map((a, i) => <option key={a} value={i}>{a}</option>)}
                  </select>
                </label>
              </div>
              <label className={s.field}>{f.email}
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" aria-invalid={!!errs.email} {...(errs.email ? { "data-err": "" } : {})} />
                {errs.email && <em role="alert">{errs.email}</em>}
              </label>

              <div className={s.field}>
                <label htmlFor="msg">{f.msg}</label>
                <RichEditor key={editorKey} invalid={!!errs.msg} onChange={(h, tx) => { setHtml(h); setText(tx); if (tx.trim()) setErrs((e) => ({ ...e, msg: undefined })); }}
                  labels={{ bold: f.bold, italic: f.italic, underline: f.underline, bullets: f.bullets, numbers: f.numbers, link: f.link, linkPrompt: f.linkPrompt, placeholder: f.msgPh, label: f.msg }} />
                {errs.msg && <em role="alert" data-err="">{errs.msg}</em>}
              </div>

              <div className={s.field}>
                <span>{f.attach}</span>
                <label className={`${s.drop} ${drag ? s.dragging : ""}`} onDragOver={(e) => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)} onDrop={onDrop}>
                  <span className={s.dropIc}><Icon name="plus" size={24} /></span>
                  <span className={s.dropT}>{f.drop} <u>{f.browse}</u></span>
                  <span className={s.dropH}>{f.dropHint}</span>
                  <input ref={input} type="file" multiple className="sr-only" onChange={(e) => addFiles(e.target.files)} />
                </label>
                {errs.files && <em role="alert">{errs.files}</em>}
                {files.length > 0 && (
                  <ul className={s.files}>
                    {files.map((fl, i) => (
                      <li key={`${fl.name}-${i}`}>
                        <span className={s.kind}>{kindOf(fl)}</span>
                        <span className={s.fname}>{fl.name} · {fmtSize(fl.size)}</span>
                        <button type="button" aria-label={`${f.remove}: ${fl.name}`} onClick={() => setFiles(files.filter((_, j) => j !== i))}><Icon name="close" size={16} /></button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <label className={s.consent}>
                <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} aria-invalid={!!errs.consent} />
                <span>{f.consent}</span>
              </label>
              {errs.consent && <em className={s.err} role="alert" data-err="">{errs.consent}</em>}
              {errs.send && <em className={s.err} role="alert">{errs.send}</em>}
              <button className="btn btn-primary" style={{ minHeight: 52, padding: "0 28px", fontSize: 16 }} type="submit" disabled={status === "sending"}>
                {status === "sending" ? f.sending : f.send}
              </button>
            </form>
          )}

          <aside className={s.aside}>
            <div className={`${s.contact} tilt`}>
              <span className={s.ball} />
              <p className={s.ceye}>{f.contactEyebrow}</p>
              <h3>{f.contactTitle}</h3>
              <div className={s.ways}>
                {ways.map((w) => {
                  const body = (
                    <>
                      <span className={s.wic}>{w.icon === "fb" ? <FacebookIcon size={22} /> : <Icon name={w.icon} />}</span>
                      <span><small>{w.k}</small><b>{w.v}</b></span>
                    </>
                  );
                  return w.href ? <a key={w.k} className={s.way} href={w.href}>{body}</a> : <div key={w.k} className={s.way}>{body}</div>;
                })}
              </div>
            </div>
            <div className={s.sos}>
              <div className={s.sosHead}>
                <span className={s.sosIc}><Icon name="warning" size={22} /></span>
                <b>{f.dangerTitle}</b>
              </div>
              <p>{f.dangerBody}</p>
              <div className={s.calls}>
                <a href="tel:1191" className={s.c1}><b>1191</b><span>{f.police}</span></a>
                <a href="tel:1362" className={s.c2}><b>1362</b><span>{f.womenKids}</span></a>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <BookingWidget />
    </>
  );
}
