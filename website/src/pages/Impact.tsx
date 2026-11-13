import { Link } from "react-router-dom";
import { useI18n } from "../i18n";
import { APP_LINKS } from "../data/links";
import { EMERGENCY, WOMENS_UNION } from "../data/contacts";
import {
  IMPACT_FLAGGED_RED,
  IMPACT_NUMBERS,
  IMPACT_VERIFIED_48H,
  PROBLEM_STATS,
} from "../data/stats";
import styles from "./Impact.module.css";

const NUM_BG = ["var(--lavender)", "#eef5ff", "var(--lavender)", "#eef5ff"];
const NUM_COLOR = ["var(--purple)", "#1f6fd1", "var(--purple)", "#1f6fd1"];

export default function Impact() {
  const { t } = useI18n();
  const i = t.impact;
  const trafficking = EMERGENCY.find((c) => c.id === "trafficking")!;

  return (
    <>
      <section className="page-hero">
        <div className={`container ${styles.heroGrid}`}>
          <div>
            <p className="crumb">{i.crumb}</p>
            <h1 className="h1-page">
              {i.h1a}
              <br />
              <span style={{ color: "var(--purple)" }}>{i.h1b}</span>
            </h1>
            <p className="lead" style={{ marginTop: 20, maxWidth: 520 }}>{i.lead}</p>
          </div>
          <div className={styles.scene}>
            <div className={`tilt ${styles.chart}`} role="img" aria-label={i.chartLabel}>
              <div className={styles.chartHead}>
                <span>{i.chartTitle}</span>
                <span style={{ color: "var(--green)" }}><span className="dot" aria-hidden="true">● </span>{i.live}</span>
              </div>
              <svg viewBox="0 0 300 90" className={styles.spark} aria-hidden="true">
                <path d="M0 75 C40 70 60 50 100 55 S160 30 200 35 S260 10 300 8" fill="none" stroke="#6018EE" strokeWidth="3" />
                <path d="M0 75 C40 70 60 50 100 55 S160 30 200 35 S260 10 300 8 V90 H0Z" fill="#7ABBFF" opacity=".18" />
              </svg>
              <div className={styles.miniGrid}>
                <div style={{ background: "var(--lavender)" }}>
                  <p>{i.flagged}</p>
                  <strong>{IMPACT_FLAGGED_RED}</strong>
                </div>
                <div style={{ background: "#eef5ff" }}>
                  <p>{i.verified}</p>
                  <strong>{IMPACT_VERIFIED_48H}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <p className="eyebrow">{i.numbersEyebrow}</p>
          <div className="grid-4" style={{ marginTop: 24 }}>
            {i.numbers.map((n, idx) => (
              <div key={n.label} data-reveal className={`tilt ${styles.numCard}`} style={{ background: NUM_BG[idx] }}>
                <div className={styles.num} style={{ color: NUM_COLOR[idx] }}>{IMPACT_NUMBERS[idx]}</div>
                <p style={{ fontWeight: 700, marginTop: 6 }}>{n.label}</p>
                <p className={styles.sub}>{n.sub}</p>
              </div>
            ))}
          </div>

          <p className="eyebrow" style={{ margin: "40px 0 16px" }}>{i.problemEyebrow}</p>
          <div className="grid-3" style={{ gap: 18 }}>
            {PROBLEM_STATS.map((s, idx) => (
              <div key={idx} data-reveal className={styles.problem}>
                <div className={styles.problemNum}>{s.value}</div>
                <p style={{ fontWeight: 700, margin: "6px 0 4px" }}>{s.measure}</p>
                <p className={styles.source}>{s.source}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-lav">
        <div className="container">
          <p className="eyebrow">{i.actionEyebrow}</p>
          <h2 className="h2" style={{ marginBottom: 40 }}>{i.actionTitle}</h2>
          <div className="grid-3">
            {i.actions.map((a, idx) => {
              const inner = (
                <>
                  <div className={styles.actionNum}>{String(idx + 1).padStart(2, "0")}</div>
                  <h3>{a.t}</h3>
                  <p>{a.b}</p>
                  <span>{a.cta}</span>
                </>
              );
              // TODO: point "Invite someone" at a real share/invite link.
              return idx === 2 ? (
                <Link key={a.t} data-reveal to="/help" className={`tilt ${styles.action}`}>{inner}</Link>
              ) : (
                <a key={a.t} data-reveal href={APP_LINKS.download} className={`tilt ${styles.action}`}>{inner}</a>
              );
            })}
          </div>
          <div className={`grid-2 ${styles.hotlines}`}>
            <a href={trafficking.tel} className={styles.hotline} style={{ background: "var(--purple)" }}>
              <span>{i.hotline1}</span>
              <strong>{trafficking.number}</strong>
            </a>
            <a href={WOMENS_UNION.tel} className={styles.hotline} style={{ background: "#2a6fc9" }}>
              <span>{i.hotline2}</span>
              <strong>{WOMENS_UNION.number}</strong>
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
