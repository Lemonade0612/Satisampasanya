import { useEffect, useState } from "react";
import { useI18n } from "../i18n";
import { CONTACT_EMAIL } from "../data/links";
import { POLICY_LAST_UPDATED } from "../data/placeholders";
import sh from "../styles/Shared.module.css";
import s from "./Policies.module.css";

const IDS = ["privacy", "guidelines", "terms", "children"] as const;

export default function Policies() {
  const { t } = useI18n();
  const p = t.policies;
  const [active, setActive] = useState<string>("privacy");
  const labels = [p.privacy.title, p.guidelines.title, p.terms.title, p.children.title];

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-20% 0px -65% 0px" },
    );
    IDS.forEach((id) => { const el = document.getElementById(id); if (el) io.observe(el); });
    return () => io.disconnect();
  }, []);

  return (
    <>
      <section className={sh.hero}>
        <div className="container" style={{ paddingTop: 56, paddingBottom: 56 }}>
          <p className={sh.crumb}>{p.crumb}</p>
          <h1 className={sh.h1}>{p.h1a}<span className={sh.purple}>{p.h1b}</span></h1>
          <p className={sh.lead}>{p.lead} {POLICY_LAST_UPDATED === "[DATE]" ? p.datePlaceholder : POLICY_LAST_UPDATED}</p>
        </div>
      </section>
      <section className={sh.sec} style={{ paddingTop: 40 }}>
        <div className={`container ${s.layout}`}>
          <nav className={s.nav} aria-label={p.navLabel}>
            {IDS.map((id, i) => (
              <a key={id} href={`#${id}`} className={active === id ? s.on : ""} aria-current={active === id ? "true" : undefined} onClick={() => setActive(id)}>{labels[i]}</a>
            ))}
            <p>{p.questions} <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a></p>
          </nav>
          <div className={s.body}>
            <article id="privacy" className={s.card}>
              <h2>{p.privacy.title}</h2>
              {p.privacy.sections.map((sec) => <div key={sec.h}><h3>{sec.h}</h3><p>{sec.p}</p></div>)}
            </article>
            <article id="guidelines" className={`${s.card} ${s.lavC}`}>
              <h2>{p.guidelines.title}</h2>
              <div className={s.dd}>
                <div><b className={s.do}>{p.guidelines.do}</b><p>{p.guidelines.doText}</p></div>
                <div><b className={s.dont}>{p.guidelines.dont}</b><p>{p.guidelines.dontText}</p></div>
              </div>
              <p>{p.guidelines.closing}</p>
            </article>
            <article id="terms" className={s.card}>
              <h2>{p.terms.title}</h2>
              <p>{p.terms.p1}</p><p>{p.terms.p2}</p>
            </article>
            <article id="children" className={`${s.card} ${s.blueC}`}>
              <h2>{p.children.title}</h2>
              <p>{p.children.p}</p>
            </article>
          </div>
        </div>
      </section>
    </>
  );
}
