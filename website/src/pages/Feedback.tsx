import { useState, type FormEvent } from "react";
import { useI18n } from "../i18n";
import BookingWidget from "../components/BookingWidget";
import { CONTACT_EMAIL } from "../data/links";
import { EMERGENCY } from "../data/contacts";
import { EMAIL_RE, submitNetlifyForm } from "../lib/netlifyForm";
import styles from "./Feedback.module.css";

const STAR_COLORS = ["#6018EE", "#6018EE", "#6018EE", "#7ABBFF", "#DCD8F0"];
type Status = "idle" | "sending" | "done" | "error";

export default function Feedback() {
  const { t } = useI18n();
  const f = t.feedback;
  const fm = f.form;

  const [topic, setTopic] = useState("");
  const [name, setName] = useState("");
  const [age, setAge] = useState(fm.ages[0]);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<{ topic?: string; message?: string; email?: string }>({});
  const [status, setStatus] = useState<Status>("idle");

  const police = EMERGENCY.find((c) => c.id === "police")!;
  const trafficking = EMERGENCY.find((c) => c.id === "trafficking")!;

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const bot = (e.currentTarget.elements.namedItem("bot-field") as HTMLInputElement | null)?.value;
    const next: typeof errors = {};
    if (!topic) next.topic = fm.errTopic;
    if (!message.trim()) next.message = fm.errMsg;
    if (email.trim() && !EMAIL_RE.test(email.trim())) next.email = fm.errEmail;
    setErrors(next);
    if (Object.keys(next).length) return;

    setStatus("sending");
    try {
      await submitNetlifyForm("feedback", {
        "bot-field": bot ?? "",
        topic,
        name: name.trim(),
        age,
        email: email.trim(),
        message: message.trim(),
        consent: consent ? "yes" : "no",
      });
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  function again() {
    setTopic("");
    setName("");
    setEmail("");
    setMessage("");
    setConsent(false);
    setErrors({});
    setStatus("idle");
  }

  return (
    <>
      <section className="page-hero">
        <div className={`container ${styles.heroGrid}`}>
          <div>
            <p className="crumb">{f.crumb}</p>
            <h1 className="h1-page" style={{ marginBottom: 20 }}>
              {f.h1a}
              <br />
              <span style={{ color: "var(--purple)" }}>{f.h1b}</span>
            </h1>
            <p className="lao-line" style={{ marginBottom: 12 }}>{f.lao}</p>
            <p className="lead">{f.lead}</p>
          </div>
          <div className={styles.scene} aria-hidden="true">
            <div className={styles.starCard}>
              <p>{f.starsTitle}</p>
              <div className={styles.stars}>
                {STAR_COLORS.map((c, i) => (
                  <svg key={i} width="34" height="34" viewBox="0 0 24 24" fill={c} style={{ animationDelay: `${i * 120}ms` }}>
                    <path d="M12 2l3 6.5 7 .8-5.2 4.8 1.5 7L12 17.5 5.7 21l1.5-7L2 9.3l7-.8z" />
                  </svg>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className={`container ${styles.mainGrid}`}>
          {status === "done" ? (
            <div className={styles.success} role="status">
              <h2>{fm.okTitle}</h2>
              <p>{fm.okBody}</p>
              <button type="button" className="btn btn-primary" onClick={again}>{fm.again}</button>
            </div>
          ) : (
            <form className={styles.form} onSubmit={onSubmit} noValidate name="feedback">
              <h2>{fm.title}</h2>
              <p className={styles.sub}>{fm.sub}</p>

              <fieldset className={styles.fieldset} aria-describedby={errors.topic ? "fb-topic-err" : undefined}>
                <legend>{fm.topicLabel}</legend>
                <div className={styles.topics}>
                  {fm.topics.map((tp, i) => (
                    <span key={tp}>
                      <input
                        type="radio"
                        name="topic"
                        id={`t${i}`}
                        value={tp}
                        checked={topic === tp}
                        onChange={() => setTopic(tp)}
                      />
                      <label htmlFor={`t${i}`}>{tp}</label>
                    </span>
                  ))}
                </div>
                {errors.topic && <p id="fb-topic-err" className={styles.err}>{errors.topic}</p>}
              </fieldset>

              {/* honeypot for bots */}
              <input type="text" name="bot-field" tabIndex={-1} autoComplete="off" className="sr-only" aria-hidden="true" />

              <div className={styles.two}>
                <label className={styles.field}>
                  {fm.name}
                  <input type="text" name="name" value={name} onChange={(e) => setName(e.target.value)} placeholder={fm.namePh} autoComplete="name" />
                </label>
                <label className={styles.field}>
                  {fm.age}
                  <select name="age" value={age} onChange={(e) => setAge(e.target.value)}>
                    {fm.ages.map((a) => <option key={a}>{a}</option>)}
                  </select>
                </label>
              </div>

              <label className={styles.field}>
                {fm.email}
                <input
                  type="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={fm.emailPh}
                  autoComplete="email"
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? "fb-email-err" : undefined}
                />
              </label>
              {errors.email && <p id="fb-email-err" className={styles.err}>{errors.email}</p>}

              <label className={styles.field}>
                {fm.msg}
                <textarea
                  name="message"
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={fm.msgPh}
                  aria-required="true"
                  aria-invalid={!!errors.message}
                  aria-describedby={errors.message ? "fb-msg-err" : undefined}
                />
              </label>
              {errors.message && <p id="fb-msg-err" className={styles.err}>{errors.message}</p>}

              <label className={styles.consent}>
                <input type="checkbox" name="consent" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
                <span>{fm.consent}</span>
              </label>

              {status === "error" && (
                <p className={styles.err} role="alert">
                  {fm.errSend} <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
                </p>
              )}

              <button type="submit" className={`btn btn-primary ${styles.submit}`} disabled={status === "sending"}>
                {status === "sending" ? fm.sending : fm.submit}
              </button>
            </form>
          )}

          <aside className={styles.aside}>
            <div className={`tilt ${styles.reach}`}>
              <h3>{f.other.title}</h3>
              <p className={styles.k}>{f.other.emailL}</p>
              <p><a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a></p>
              <p className={styles.k}>{f.other.inAppL}</p>
              <p>{f.other.inApp}</p>
              <p className={styles.k}>{f.other.basedL}</p>
              <p>{f.other.based}</p>
            </div>
            <div className={styles.danger}>
              <p style={{ fontWeight: 800, marginBottom: 6 }}>{f.danger.title}</p>
              <p>
                {f.danger.a}
                <a href={police.tel}><b>{police.number}</b></a>
                {f.danger.b}
                <a href={trafficking.tel}><b>{trafficking.number}</b></a>.
              </p>
            </div>
          </aside>
        </div>
      </section>

      <section className="section section-lav">
        <div className="container">
          <p className="eyebrow">{f.booking.eyebrow}</p>
          <h2 className="h2" style={{ marginBottom: 12 }}>{f.booking.title}</h2>
          <p className="lead" style={{ marginBottom: 36, maxWidth: 640, fontSize: 17 }}>{f.booking.lead}</p>
          <BookingWidget />
          <p className={styles.bookNote}>{f.booking.note}</p>
        </div>
      </section>
    </>
  );
}
