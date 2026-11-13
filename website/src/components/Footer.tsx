import { Link } from "react-router-dom";
import { useI18n } from "../i18n";
import { APP_LINKS, CONTACT_EMAIL, FACEBOOK_URL, POLICE, SCAM_LINE } from "../data/links";
import Icon, { FacebookIcon } from "./Icon";
import styles from "./Footer.module.css";

export default function Footer() {
  const { t } = useI18n();
  const f = t.footer;
  return (
    <footer className={styles.footer}>
      <div className={styles.glow} aria-hidden="true" />
      <div className={`container ${styles.inner}`}>
        <div className={styles.cta}>
          <div>
            <p className={styles.ctaTitle}>{f.ctaTitle}</p>
            <p className={styles.ctaSub}>{f.ctaSub}</p>
          </div>
          <div className={styles.stores}>
            <a href={APP_LINKS.appStore}><small>{f.appStoreSmall}</small><b>{f.appStore}</b></a>
            <a href={APP_LINKS.googlePlay}><small>{f.playSmall}</small><b>{f.play}</b></a>
          </div>
        </div>

        <div className={styles.cols}>
          <div className={styles.about}>
            <div className={styles.brand}>
              <span className={styles.logo}><img src="/images/logo.png" alt="" width={80} height={80} loading="lazy" /></span>
              <span>{t.brand}</span>
            </div>
            <p className={styles.blurb}>{f.blurb}</p>
            <div className={styles.social}>
              <a href={FACEBOOK_URL} aria-label={f.facebook}><FacebookIcon /></a>
              <a href={`mailto:${CONTACT_EMAIL}`} aria-label={f.email}><Icon name="mail" size={18} /></a>
            </div>
          </div>
          <div>
            <p className={styles.h}>{f.colSati}</p>
            <Link to="/about">{f.about}</Link>
            <Link to="/impact">{f.impact}</Link>
            <Link to="/#app">{f.app}</Link>
          </div>
          <div>
            <p className={styles.h}>{f.colHelp}</p>
            <Link to="/help#hotlines">{f.hotlines}</Link>
            <Link to="/help#docs">{f.documents}</Link>
            <Link to="/feedback">{f.feedback}</Link>
          </div>
          <div className={styles.danger}>
            <p className={styles.h}>{f.colDanger}</p>
            <a className={styles.sos} href={POLICE.tel}>
              <span className={styles.ring}><Icon name="phone" size={20} /></span>
              <span><small>{f.police}</small><b>{POLICE.number}</b></span>
            </a>
            <a className={styles.scam} href={SCAM_LINE.tel}><span>{f.scamLine}</span><span>{SCAM_LINE.number}</span></a>
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
