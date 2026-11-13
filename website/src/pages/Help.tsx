import { useState } from "react";
import { useI18n } from "../i18n";
import { EMERGENCY, LABOUR, TOURIST_POLICE, WOMENS_UNION } from "../data/contacts";
import { REPORTS, type ReportCategory } from "../data/reports";
import styles from "./Help.module.css";

type Filter = "all" | ReportCategory;
const FILTERS: Filter[] = ["all", "trafficking", "scams", "parents"];

const PhoneIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
    <path d="M22 16.9v3a2 2 0 01-2.2 2 19.8 19.8 0 01-8.6-3.1 19.5 19.5 0 01-6-6A19.8 19.8 0 012.1 4.2 2 2 0 014.1 2h3a2 2 0 012 1.7c.1 1 .4 1.9.7 2.8a2 2 0 01-.5 2.1L8 9.9a16 16 0 006 6l1.3-1.3a2 2 0 012.1-.4c.9.3 1.8.6 2.8.7a2 2 0 011.7 2z" />
  </svg>
);

export default function Help() {
  const { t } = useI18n();
  const h = t.help;
  const [filter, setFilter] = useState<Filter>("all");
  const shown = REPORTS.filter((r) => filter === "all" || r.category === filter);
  const police = EMERGENCY[0];

  return (
    <>
      <section className={styles.hero}>
        <div className={`container ${styles.heroGrid}`}>
          <div>
            <p className="crumb">{h.crumb}</p>
            <h1 className="h1-page" style={{ marginBottom: 18 }}>
              {h.h1a}
              <span style={{ color: "var(--sos)" }}>{h.h1b}</span>
              {h.h1c}
            </h1>
            <p className="lao-line" style={{ marginBottom: 14 }}>{h.lao}</p>
            <p className="lead" style={{ marginBottom: 26 }}>{h.lead}</p>
            <div className={styles.row}>
              <a className={`btn ${styles.callBtn} ${styles.sos}`} href={police.tel}>
                <PhoneIcon />
                {h.callPolice}
              </a>
              <a className="btn btn-light" style={{ minHeight: 56, padding: "0 24px" }} href="#docs">{h.readReports}</a>
            </div>
          </div>

          <div className={styles.scene} role="img" aria-label={h.mockLabel}>
            <div className={styles.sosBadge}>{h.sosBadge}</div>
            <div className={styles.phone} aria-hidden="true">
              <div className={styles.screen}>
                <p className={styles.mTitle}>{h.mockTitle}</p>
                <p className={`lo ${styles.mLao}`}>{h.mockLao}</p>
                <div className={`${styles.mRow} ${styles.mRed}`}><span>{h.contacts.police.name}</span><span>1191</span></div>
                <div className={styles.mRow}><span>{h.contacts.ambulance.name}</span><span>1195</span></div>
                <div className={styles.mRow}><span>{h.contacts.fire.name}</span><span>1190</span></div>
                <div className={`${styles.mRow} ${styles.mPurple}`}><span>Trafficking · police</span><span>1300</span></div>
                <p className={styles.mHead}>{h.mockReports}</p>
                <div className={styles.mDoc}>{h.mockReportItem}</div>
                <div className={styles.mDoc}>{h.mockReportItem}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <p className="eyebrow" style={{ color: "var(--sos)" }}>{h.emergencyEyebrow}</p>
          <h2 className="h2" style={{ marginBottom: 36 }}>{h.emergencyTitle}</h2>

          <div className="grid-4">
            {EMERGENCY.map((c) => (
              <a
                key={c.id}
                href={c.tel}
                data-reveal
                className={`tilt ${styles.big} ${styles[c.variant]} ${c.id === "police" ? styles.sos : ""}`}
              >
                <span className={styles.bigName}>{h.contacts[c.id].name}</span>
                <span className={`lo ${styles.bigLao}`}>{h.contacts[c.id].lao}</span>
                <span className={styles.bigNum}>{c.number}</span>
              </a>
            ))}
          </div>

          <div className={`grid-3 ${styles.more}`}>
            <div data-reveal className={`tilt ${styles.card} ${styles.cardLav}`}>
              <p className={styles.cardName}>{h.women.name}</p>
              <p className={`lo ${styles.cardLao}`}>{h.women.lao}</p>
              <p className={styles.cardNum} style={{ color: "var(--purple)" }}>{WOMENS_UNION.number}</p>
              <div className={styles.pills}>
                <a className={styles.pill} style={{ background: "var(--purple)", color: "#fff" }} href={WOMENS_UNION.tel}>{h.call}</a>
                <a className={styles.pill} style={{ color: "var(--green)" }} href={WOMENS_UNION.whatsapp} target="_blank" rel="noopener noreferrer">
                  {h.whatsapp} {WOMENS_UNION.whatsappLabel}
                </a>
                {/* TODO: real Facebook page in src/data/contacts.ts */}
                <a className={styles.pill} style={{ color: "#1260c8" }} href={WOMENS_UNION.facebook}>{h.facebook}</a>
              </div>
            </div>

            <div data-reveal className={`tilt ${styles.card} ${styles.cardBlue}`}>
              <p className={styles.cardName}>{h.labour.name}</p>
              <p className={`lo ${styles.cardLao}`}>{h.labour.lao}</p>
              <p className={styles.cardNum} style={{ color: "#1a5fb8" }}>{LABOUR.number}</p>
              <div className={styles.pills}>
                <a className={styles.pill} style={{ background: "#1a5fb8", color: "#fff" }} href={LABOUR.tel}>{h.call}</a>
                <a className={styles.pill} style={{ color: "#1260c8" }} href={LABOUR.facebook}>{h.facebook}</a>
              </div>
            </div>

            <div data-reveal className={`tilt ${styles.card} ${styles.cardLav}`}>
              <p className={styles.cardName}>{h.tourist.name}</p>
              <p className={`lo ${styles.cardLao}`}>{h.tourist.lao}</p>
              <p className={styles.cardNum} style={{ color: "var(--purple)" }}>{TOURIST_POLICE.number}</p>
              <div className={styles.pills}>
                <a className={styles.pill} style={{ background: "var(--purple)", color: "#fff" }} href={TOURIST_POLICE.tel}>{h.call}</a>
              </div>
            </div>
          </div>

          <p className={styles.verified}>{h.verifiedNote}</p>

          <div className={`grid-3 ${styles.steps}`}>
            {h.steps.map((s) => (
              <div key={s.t} data-reveal className={styles.step}>
                <p style={{ fontWeight: 800, marginBottom: 6 }}>{s.t}</p>
                <p style={{ color: "var(--body)" }}>{s.b}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="docs" className="section section-lav">
        <div className="container">
          <div className={styles.docsHead}>
            <div>
              <p className="eyebrow">{h.docsEyebrow}</p>
              <h2 className="h2">{h.docsTitle}</h2>
            </div>
            <div className={styles.chips} role="group" aria-label={h.filterLabel}>
              {FILTERS.map((f) => (
                <button
                  key={f}
                  type="button"
                  aria-pressed={filter === f}
                  className={filter === f ? `${styles.chip} ${styles.chipOn}` : styles.chip}
                  onClick={() => setFilter(f)}
                >
                  {h.filters[f]}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.docs} aria-live="polite">
            {shown.length === 0 && <p className={styles.empty}>{h.empty}</p>}
            {shown.map((r, i) => (
              <a key={`${r.category}-${i}`} href={r.url} className={`${styles.doc} ${styles.docIn}`} style={{ animationDelay: `${i * 60}ms` }}>
                <span className={`${styles.kind} ${i % 2 ? styles.kindBlue : ""}`}>{r.kind}</span>
                <span className={styles.docText}>
                  <span className={styles.docTitle}>{r.title}</span>
                  <span className={styles.docMeta}>{r.agency} · {r.year} · {r.language}</span>
                </span>
                <span className={styles.arrow}>{h.read}</span>
              </a>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
