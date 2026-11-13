import { useI18n } from "../i18n";
import styles from "./About.module.css";

const PHOTOS = ["/images/phoumiphon.png", "/images/kanlaya.png"];

export default function About() {
  const { t } = useI18n();
  const a = t.about;
  return (
    <>
      <section className="page-hero">
        <div className={`container ${styles.heroGrid}`}>
          <div>
            <p className="crumb">{a.crumb}</p>
            <h1 className="h1-page" style={{ fontSize: undefined }}>
              {a.h1a}
              <br />
              {a.h1b}
              <span style={{ color: "var(--purple)" }}>{a.h1c}</span>
              {a.h1d}
            </h1>
            <p className="lao-line" style={{ margin: "22px 0 16px" }}>{a.lao}</p>
            <p className="lead" style={{ maxWidth: 540 }}>{a.lead}</p>
          </div>
          <div className={styles.scene}>
            <div className={styles.logoCube}>
              <img src="/images/logo.png" alt={a.logoAlt} width={280} height={280} />
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className={`container ${styles.storyGrid}`}>
          <div>
            <p className="eyebrow">{a.storyEyebrow}</p>
            <h2 className="h2">{a.storyTitle}</h2>
          </div>
          <div>
            {a.story.map((s) => (
              <div key={s.k} data-reveal className={styles.storyRow}>
                <span className={styles.storyKey}>{s.k}</span>
                <p>{s.v}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-lav">
        <div className={`container ${styles.vmGrid}`}>
          <div data-reveal className={`tilt ${styles.vision}`}>
            <p className="eyebrow">{a.visionEyebrow}</p>
            <p className={styles.visionText}>{a.vision}</p>
          </div>
          <div className={styles.missions}>
            <p className="eyebrow" style={{ marginBottom: 4 }}>{a.missionEyebrow}</p>
            {a.mission.map((m, i) => (
              <div key={m.t} data-reveal className={`tilt ${styles.mission}`}>
                <span className={styles.missionNum}>{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <p style={{ fontWeight: 700, marginBottom: 4 }}>{m.t}</p>
                  <p className={styles.small}>{m.b}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container" style={{ textAlign: "center" }}>
          <p className="eyebrow">{a.coreEyebrow}</p>
          <h2 className="h2" style={{ marginBottom: 48 }}>{a.coreTitle}</h2>
          <div className="grid-3" style={{ textAlign: "left" }}>
            {a.core.map((c) => (
              <div key={c.t} data-reveal className={`tilt ${styles.core}`}>
                <h3>{c.t}</h3>
                <p className="lo" style={{ color: "var(--purple)", fontWeight: 600, margin: "6px 0 10px" }}>{c.lao}</p>
                <p className={styles.coreBody}>{c.b}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-lav">
        <div className="container">
          <p className="eyebrow">{a.teamEyebrow}</p>
          <h2 className="h2" style={{ marginBottom: 40 }}>{a.teamTitle}</h2>
          <div className={styles.team}>
            {a.team.map((m, i) => (
              <div key={m.name} data-reveal className={`tilt ${styles.member}`}>
                <img
                  src={PHOTOS[i]}
                  alt={m.name}
                  loading="lazy"
                  decoding="async"
                  width={600}
                  height={800}
                />
                <div className={styles.memberText}>
                  <p className={styles.memberName}>{m.name}</p>
                  <p className={styles.memberRole}>{m.role}</p>
                  <p className={styles.small}>{m.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
