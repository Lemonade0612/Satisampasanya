import { Link } from "react-router-dom";
import { useI18n } from "../i18n";
import PhoneMockup from "../components/PhoneMockup";
import { APP_LINKS } from "../data/links";
import { HOME_STATS } from "../data/stats";
import styles from "./Home.module.css";

const FEATURE_ICONS = [
  <svg key="a" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6018EE" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h10" /></svg>,
  <svg key="b" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1F6FD1" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><rect x="3" y="6" width="18" height="12" rx="4" /><path d="M8 12h3M9.5 10.5v3M15 11h.01M17 13h.01" /></svg>,
  <svg key="c" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6018EE" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M21 12a8 8 0 01-11.6 7.1L4 20l1-4.6A8 8 0 1121 12z" /></svg>,
];
const FEATURE_TINT = ["#eee8ff", "#e3f0ff", "#eee8ff"];
const FEATURE_COLOR = ["var(--purple)", "#1f6fd1", "var(--purple)"];

export default function Home() {
  const { t } = useI18n();
  const h = t.home;

  return (
    <>
      <section className={styles.hero}>
        <div className={`container ${styles.heroGrid}`}>
          <div className={styles.heroText}>
            <span className={styles.badge}>
              <span className="dot" style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--purple)" }} />
              {h.badge}
            </span>
            <h1 className={styles.h1}>
              {h.h1a}
              <br />
              <span style={{ color: "var(--purple)" }}>{h.h1b}</span>{" "}
              <span style={{ color: "var(--accent-text)" }}>{h.h1c}</span>
            </h1>
            <p className={`lo ${styles.tagline}`}>{h.tagline}</p>
            <p className={styles.lead}>{h.lead}</p>
            <div className={styles.row}>
              <a className="btn btn-primary" style={{ minHeight: 54 }} href={APP_LINKS.download}>{h.download}</a>
              <Link className="btn btn-light" style={{ minHeight: 54 }} to="/about">{h.story}</Link>
            </div>
            <div className={styles.row}>
              <a className={styles.store} href={APP_LINKS.appStore}>
                <span style={{ fontSize: 10 }}>{h.appStoreSmall}</span>
                <span style={{ fontWeight: 700, fontSize: 16 }}>{h.appStore}</span>
              </a>
              <a className={styles.store} href={APP_LINKS.googlePlay}>
                <span style={{ fontSize: 10 }}>{h.playSmall}</span>
                <span style={{ fontWeight: 700, fontSize: 16 }}>{h.play}</span>
              </a>
            </div>
          </div>
          <PhoneMockup />
        </div>
      </section>

      <section id="features" className={styles.section}>
        <div className="container">
          <p className="eyebrow">{h.featuresEyebrow}</p>
          <h2 className={styles.h2} style={{ maxWidth: 680 }}>{h.featuresTitle}</h2>
          <div className={styles.grid3}>
            {h.features.map((f, i) => (
              <div key={f.kicker} data-reveal className={`tilt ${styles.feature}`}>
                <div className={styles.icon} style={{ background: FEATURE_TINT[i] }}>{FEATURE_ICONS[i]}</div>
                <p className={styles.kicker} style={{ color: FEATURE_COLOR[i] }}>{f.kicker}</p>
                <h3>{f.title}</h3>
                <p className={styles.body}>{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.lav}`}>
        <div className="container">
          <p className="eyebrow">{h.agesEyebrow}</p>
          <h2 className={styles.h2}>{h.agesTitle}</h2>
          <div className={styles.grid4}>
            {h.ages.map((a, i) => (
              <div key={a.name} data-reveal className={`tilt ${styles.age} ${i === 1 ? styles.ageHot : ""}`}>
                <h3>{a.name}</h3>
                <p className={styles.band}>{a.band}</p>
                <p className={styles.ageBody}>{a.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className={`container ${styles.stats}`}>
          {h.statLabels.map((label, i) => (
            <div key={label} data-reveal>
              <div className={styles.statNum} style={{ color: i % 2 ? "var(--accent-text)" : "var(--purple)" }}>
                {HOME_STATS[i]}
              </div>
              <div style={{ fontWeight: 700 }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.ctaWrap}>
        <div className={`container`}>
          <div className={styles.cta}>
            <h2>{h.ctaTitle}</h2>
            <p className="lo">{h.ctaLao}</p>
            <div className={styles.ctaRow}>
              <Link className="btn" style={{ minHeight: 54, background: "#fff", color: "var(--purple)", padding: "0 28px" }} to="/impact">{h.ctaImpact}</Link>
              <Link className="btn" style={{ minHeight: 54, border: "1px solid rgba(255,255,255,.6)", color: "#fff", fontWeight: 600, padding: "0 28px" }} to="/feedback">{h.ctaFeedback}</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
