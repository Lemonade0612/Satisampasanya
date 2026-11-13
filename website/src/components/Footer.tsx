import { Link } from "react-router-dom";
import { useI18n } from "../i18n";
import { CONTACT_EMAIL } from "../data/links";
import styles from "./Footer.module.css";

export default function Footer() {
  const { t } = useI18n();
  const f = t.footer;
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.grid}>
          <div>
            <p className={styles.brand}>SATISAMPASANYA</p>
            <p className={styles.blurb}>{f.blurb}</p>
          </div>
          <div>
            <p className={styles.head}>{f.sati}</p>
            <Link to="/about">{t.nav.about}</Link>
            <Link to="/impact">{t.nav.impact}</Link>
          </div>
          <div>
            <p className={styles.head}>{f.app}</p>
            <Link to="/#features">{f.features}</Link>
            <Link to="/help">{t.nav.help}</Link>
          </div>
          <div>
            <p className={styles.head}>{f.connect}</p>
            <Link to="/feedback">{t.nav.feedback}</Link>
            <a href={`mailto:${CONTACT_EMAIL}`}>{f.emailUs}</a>
          </div>
        </div>
        <div className={styles.bottom}>
          <span>{f.rights}</span>
          <span className={styles.legal}>
            <Link to="/policies#privacy">{f.privacy}</Link>
            <Link to="/policies#guidelines">{f.guidelines}</Link>
            <Link to="/policies#terms">{f.terms}</Link>
          </span>
        </div>
      </div>
    </footer>
  );
}
