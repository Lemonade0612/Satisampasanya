import { useEffect, useState } from "react";
import { useI18n } from "../i18n";
import { CONTACT_EMAIL } from "../data/links";
import { POLICY_LAST_UPDATED } from "../data/stats";
import styles from "./Policies.module.css";

const IDS = ["privacy", "guidelines", "terms", "children"] as const;
type Id = (typeof IDS)[number];

export default function Policies() {
  const { t } = useI18n();
  const p = t.policies;
  const [active, setActive] = useState<Id>("privacy");

  // Highlight the section being read (and the one in the URL hash).
  useEffect(() => {
    const fromHash = window.location.hash.slice(1) as Id;
    if (IDS.includes(fromHash)) setActive(fromHash);

    if (!("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) setActive(visible.target.id as Id);
      },
      { rootMargin: "-20% 0px -60% 0px" },
    );
    IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, []);

  return (
    <>
      <section className="page-hero">
        <div className="container" style={{ paddingTop: 80, paddingBottom: 72 }}>
          <p className="crumb">{p.crumb}</p>
          <h1 className="h1-page" style={{ marginBottom: 16 }}>
            {p.h1a} <span style={{ color: "var(--purple)" }}>{p.h1b}</span>
          </h1>
          <p className="lead" style={{ maxWidth: 640 }}>
            {p.lead} {POLICY_LAST_UPDATED}
          </p>
        </div>
      </section>

      <section>
        <div className={`container ${styles.layout}`}>
          <nav className={styles.side} aria-label={p.onThisPage}>
            {IDS.map((id, idx) => (
              <a
                key={id}
                href={`#${id}`}
                onClick={() => setActive(id)}
                aria-current={active === id ? "true" : undefined}
                className={active === id ? `${styles.sideLink} ${styles.on}` : styles.sideLink}
              >
                {p.nav[idx]}
              </a>
            ))}
            <p className={styles.q}>
              {p.questions} <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
            </p>
          </nav>

          <div className={styles.body}>
            <article id="privacy" className={`${styles.card} ${styles.outlined}`}>
              <h2>{p.privacy.title}</h2>
              <p className={`lo ${styles.lao}`}>{p.privacy.lao}</p>
              {p.privacy.blocks.map((b, idx) => (
                <div key={b.h}>
                  <h3>{b.h}</h3>
                  <p>
                    {b.p}
                    {idx === p.privacy.blocks.length - 1 && (
                      <>
                        {" "}
                        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
                      </>
                    )}
                  </p>
                </div>
              ))}
            </article>

            <article id="guidelines" data-reveal className={`${styles.card} ${styles.lavender}`}>
              <h2>{p.guidelines.title}</h2>
              <p className={`lo ${styles.lao}`}>{p.guidelines.lao}</p>
              <div className="grid-2" style={{ gap: 14 }}>
                <div className={styles.dd}>
                  <strong style={{ color: "var(--green)" }}>{p.guidelines.doH}</strong>
                  <p>{p.guidelines.doP}</p>
                </div>
                <div className={styles.dd}>
                  <strong style={{ color: "var(--red)" }}>{p.guidelines.dontH}</strong>
                  <p>{p.guidelines.dontP}</p>
                </div>
              </div>
              <p style={{ marginTop: 16 }}>{p.guidelines.foot}</p>
            </article>

            <article id="terms" data-reveal className={`${styles.card} ${styles.outlined}`}>
              <h2>{p.terms.title}</h2>
              <p className={`lo ${styles.lao}`}>{p.terms.lao}</p>
              <p style={{ marginBottom: 14 }}>{p.terms.p1}</p>
              <p>{p.terms.p2}</p>
            </article>

            <article id="children" data-reveal className={`${styles.card} ${styles.blue}`}>
              <h2>{p.kids.title}</h2>
              <p className={`lo ${styles.lao}`} style={{ color: "#1f6fd1" }}>{p.kids.lao}</p>
              <p>{p.kids.p}</p>
            </article>
          </div>
        </div>
      </section>
    </>
  );
}
