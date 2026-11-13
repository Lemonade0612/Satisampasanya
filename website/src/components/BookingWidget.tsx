import { useState, type FormEvent } from "react";
import { useI18n } from "../i18n";
import { AVAILABILITY, BOOKING_MONTH, BOOKING_YEAR } from "../data/booking";
import { submitForm } from "../lib/submitForm";
import Icon from "./Icon";
import styles from "./BookingWidget.module.css";

// TODO: replace this widget with a real Calendly embed (see data/booking.ts).
const DAYS = new Date(BOOKING_YEAR, BOOKING_MONTH + 1, 0).getDate();
const OFFSET = (new Date(BOOKING_YEAR, BOOKING_MONTH, 1).getDay() + 6) % 7; // Monday-first
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function BookingWidget() {
  const { t } = useI18n();
  const b = t.booking;
  const [day, setDay] = useState<number | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [err, setErr] = useState<{ name?: string; email?: string; send?: string }>({});
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");
  const step = status === "done" ? 4 : time ? 3 : day ? 2 : 1;

  const pad = (n: number) => String(n).padStart(2, "0");
  const iso = (d: number) => `${BOOKING_YEAR}-${pad(BOOKING_MONTH + 1)}-${pad(d)}`;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const er: typeof err = {};
    if (!name.trim()) er.name = b.eName;
    if (!EMAIL_RE.test(email.trim())) er.email = b.eEmail;
    setErr(er);
    if (er.name || er.email || !day || !time) return;
    setStatus("sending");
    try {
      await submitForm("booking", { date: iso(day), time, name: name.trim(), email: email.trim() });
      setStatus("done");
    } catch {
      setStatus("idle");
      setErr({ send: b.eSend });
    }
  };

  return (
    <section id="book" className={styles.section}>
      <div className="container">
        <div className={styles.head}>
          <div><p className="eyebrow">{b.eyebrow}</p><h2>{b.title}</h2></div>
          <p>{b.lead}</p>
        </div>
        <ol className={styles.steps}>
          {b.steps.map((s, i) => (
            <li key={s} className={step > i ? styles.stepOn : ""}><b>{i + 1}</b>{s}</li>
          ))}
        </ol>

        <div className={styles.card}>
          <div className={styles.info}>
            <span className={styles.logo}><img src="/images/logo.png" alt="" width={88} height={88} loading="lazy" /></span>
            <p className={styles.team}>{b.team}</p>
            <h3>{b.cardTitle}</h3>
            <ul>
              <li><span><Icon name="bell" size={16} /></span>{b.min}</li>
              <li><span><Icon name="globe" size={16} /></span>{b.zoom}</li>
              <li><span><Icon name="pin" size={16} /></span>{b.loc}</li>
              <li><span>ລ</span>{b.langs}</li>
            </ul>
          </div>

          <div className={styles.cal}>
            <div className={styles.calHead}>
              <p>{b.monthName} {BOOKING_YEAR}</p>
              <div>
                <button type="button" aria-label={b.prev} disabled><Icon name="chevron" size={18} style={{ transform: "rotate(90deg)" }} /></button>
                <button type="button" aria-label={b.next} disabled><Icon name="chevron" size={18} style={{ transform: "rotate(-90deg)" }} /></button>
              </div>
            </div>
            <div className={styles.dow}>{b.dayNames.map((d) => <span key={d}>{d}</span>)}</div>
            <div className={styles.days} role="group" aria-label={`${b.monthName} ${BOOKING_YEAR}`}>
              {Array.from({ length: OFFSET }, (_, i) => <span key={`o${i}`} />)}
              {Array.from({ length: DAYS }, (_, i) => {
                const d = i + 1;
                const ok = !!AVAILABILITY[d];
                if (!ok) return <span key={d} className={styles.off}>{d}</span>;
                return (
                  <button key={d} type="button" aria-pressed={day === d} className={`${styles.day} ${day === d ? styles.sel : ""}`}
                    onClick={() => { setDay(d); setTime(null); setStatus("idle"); }}>
                    {d}<i />
                  </button>
                );
              })}
            </div>
            <div className={styles.legend}><span><i />{b.avail}</span><span>{b.tz}</span></div>
          </div>

          <div className={styles.panel} aria-live="polite">
            {!day && (
              <div className={styles.hint}><span><Icon name="bell" size={18} /></span><p>{b.pick}</p></div>
            )}
            {day && !time && (
              <div>
                <p className={styles.k}>{b.selected}</p>
                <p className={styles.sd}>{b.monthShort} {day}, {BOOKING_YEAR}</p>
                {AVAILABILITY[day].map((tm) => (
                  <button key={tm} type="button" className={styles.slot} onClick={() => setTime(tm)}>{tm}</button>
                ))}
                <p className={styles.note}>{b.tap}</p>
              </div>
            )}
            {day && time && status !== "done" && (
              <form onSubmit={submit} noValidate>
                <p className={styles.k}>{b.confirmTitle}</p>
                <p className={styles.sd}>{b.monthShort} {day}, {BOOKING_YEAR} · {time}</p>
                <input type="text" name="_honey" tabIndex={-1} autoComplete="off" className="sr-only" aria-hidden="true" />
                <label className={styles.f}>{b.name}
                  <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" aria-invalid={!!err.name} />
                  {err.name && <em role="alert">{err.name}</em>}
                </label>
                <label className={styles.f}>{b.email}
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" aria-invalid={!!err.email} />
                  {err.email && <em role="alert">{err.email}</em>}
                </label>
                {err.send && <em role="alert" className={styles.sendErr}>{err.send}</em>}
                <button type="submit" className={`btn btn-primary ${styles.go}`} disabled={status === "sending"}>{b.confirm}</button>
                <button type="button" className={styles.link} onClick={() => setTime(null)}>{b.change}</button>
              </form>
            )}
            {status === "done" && (
              <div className={styles.ok}><b>{b.okTitle}</b><p>{b.okBody}</p></div>
            )}
          </div>
        </div>
        <p className={styles.example}>{b.example}</p>
      </div>
    </section>
  );
}
