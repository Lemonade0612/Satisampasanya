import { useMemo, useState, type FormEvent } from "react";
import { useI18n } from "../i18n";
import { AVAILABILITY, BOOKING_MONTH, BOOKING_YEAR } from "../data/booking";
import { CONTACT_EMAIL } from "../data/links";
import { EMAIL_RE, submitNetlifyForm } from "../lib/netlifyForm";
import styles from "./BookingWidget.module.css";

// TODO: replace this whole widget with a real Calendly inline embed
// (<div class="calendly-inline-widget" data-url="https://calendly.com/…">).

const iso = (day: number) =>
  `${BOOKING_YEAR}-${String(BOOKING_MONTH + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

type Status = "idle" | "sending" | "done" | "error";

export default function BookingWidget() {
  const { t, lang } = useI18n();
  const b = t.feedback.booking;
  const [date, setDate] = useState<string | null>(null);
  const [slot, setSlot] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});
  const [status, setStatus] = useState<Status>("idle");

  // Monday-first month grid: leading blanks + each day of the month.
  const cells = useMemo(() => {
    const first = new Date(BOOKING_YEAR, BOOKING_MONTH, 1).getDay(); // 0 = Sun
    const lead = (first + 6) % 7;
    const days = new Date(BOOKING_YEAR, BOOKING_MONTH + 1, 0).getDate();
    return [...Array<null>(lead).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)];
  }, []);

  const locale = lang === "lo" ? "lo-LA" : "en-US";
  const prettyDate = (d: string) =>
    new Date(`${d}T00:00:00`).toLocaleDateString(locale, { month: "short", day: "numeric", year: "numeric" });

  const slots = date ? AVAILABILITY[date] ?? [] : [];

  function pickDate(d: string) {
    setDate(d);
    setSlot(null);
    setStatus("idle");
  }

  async function confirm(e: FormEvent) {
    e.preventDefault();
    const next: typeof errors = {};
    if (!name.trim()) next.name = b.errName;
    if (!EMAIL_RE.test(email.trim())) next.email = b.errEmail;
    setErrors(next);
    if (Object.keys(next).length || !date || !slot) return;

    setStatus("sending");
    try {
      await submitNetlifyForm("booking", { date, time: slot, name: name.trim(), email: email.trim(), notes: notes.trim() });
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  function reset() {
    setDate(null);
    setSlot(null);
    setName("");
    setEmail("");
    setNotes("");
    setErrors({});
    setStatus("idle");
  }

  return (
    <div className={styles.widget}>
      {/* Panel 1 — event info */}
      <div className={styles.info}>
        <img src="/images/logo.png" alt="" width={56} height={56} loading="lazy" />
        <p className={styles.team}>{b.team}</p>
        <h3>{b.event}</h3>
        <p>{b.duration}</p>
        <p>{b.where}</p>
        <p className="lo">{b.langs}</p>
      </div>

      {/* Panel 2 — calendar */}
      <div className={styles.cal}>
        <p className={styles.calTitle}>
          {b.selectDate} · {b.month}
        </p>
        <div className={styles.dow} aria-hidden="true">
          {b.days.map((d) => <span key={d}>{d}</span>)}
        </div>
        <div className={styles.days} role="group" aria-label={b.selectDate}>
          {cells.map((d, i) => {
            if (d === null) return <span key={`b${i}`} />;
            const key = iso(d);
            const available = key in AVAILABILITY;
            if (!available) return <span key={key} className={styles.off}>{d}</span>;
            return (
              <button
                key={key}
                type="button"
                className={date === key ? `${styles.day} ${styles.dayOn}` : styles.day}
                aria-pressed={date === key}
                aria-label={prettyDate(key)}
                onClick={() => pickDate(key)}
              >
                {d}
              </button>
            );
          })}
        </div>
        <p className={styles.tz}>{b.tz}</p>
      </div>

      {/* Panel 3 — time slots → confirm step */}
      <div className={styles.panel} aria-live="polite">
        {!date && <p className={styles.hint}>{b.hint}</p>}

        {date && !slot && status !== "done" && (
          <div key={date}>
            <p className={styles.panelHead}>{prettyDate(date)}</p>
            {slots.map((s, i) => (
              <button
                key={s}
                type="button"
                className={styles.slot}
                style={{ animationDelay: `${i * 60}ms` }}
                onClick={() => setSlot(s)}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {date && slot && status !== "done" && (
          <form className={styles.confirm} onSubmit={confirm} noValidate>
            <p className={styles.panelHead}>{b.confirmTitle}</p>
            <p className={styles.chosen}>{prettyDate(date)} · {slot}</p>
            {/* honeypot */}
            <input type="text" name="bot-field" tabIndex={-1} autoComplete="off" className="sr-only" aria-hidden="true" />

            <label>
              {b.name}
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? "bk-name-err" : undefined}
              />
            </label>
            {errors.name && <p id="bk-name-err" className={styles.err}>{errors.name}</p>}

            <label>
              {b.email}
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "bk-email-err" : undefined}
              />
            </label>
            {errors.email && <p id="bk-email-err" className={styles.err}>{errors.email}</p>}

            <label>
              {b.notes}
              <textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
            </label>

            {status === "error" && (
              <p className={styles.err} role="alert">
                {b.errSend} <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
              </p>
            )}

            <button type="submit" className={`btn btn-primary ${styles.confirmBtn}`} disabled={status === "sending"}>
              {status === "sending" ? b.confirming : b.confirm}
            </button>
            <button type="button" className={styles.back} onClick={() => setSlot(null)}>{b.back}</button>
          </form>
        )}

        {status === "done" && date && slot && (
          <div className={styles.done} role="status">
            <p className={styles.panelHead}>{b.okTitle}</p>
            <p className={styles.chosen}>{prettyDate(date)} · {slot}</p>
            <p>{b.okBody}</p>
            <button type="button" className={styles.back} onClick={reset}>{b.another}</button>
          </div>
        )}
      </div>
    </div>
  );
}
