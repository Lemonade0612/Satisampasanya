import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useI18n } from "../i18n";
import { APP_LINKS } from "../data/links";
import styles from "./Header.module.css";

export default function Header() {
  const { t, toggle } = useI18n();
  const [open, setOpen] = useState(false);
  const { pathname, hash } = useLocation();

  useEffect(() => setOpen(false), [pathname, hash]);

  const link = ({ isActive }: { isActive: boolean }) => (isActive ? `${styles.link} ${styles.active}` : styles.link);

  return (
    <header className={styles.header}>
      <div className={`container ${styles.bar}`}>
        <Link to="/" className={styles.brand}>
          <span className={styles.logo}>
            <img src="/images/logo.png" alt={t.logoAlt} width={76} height={76} />
          </span>
          <span className={styles.name}>{t.brand}</span>
        </Link>

        <nav id="main-nav" aria-label={t.nav.mainNav} className={`${styles.nav} ${open ? styles.open : ""}`}>
          <NavLink to="/" end className={link}>{t.nav.home}</NavLink>
          <NavLink to="/about" className={link}>{t.nav.about}</NavLink>
          <Link to="/#features" className={styles.link}>{t.nav.app}</Link>
          <NavLink to="/impact" className={link}>{t.nav.impact}</NavLink>
          <NavLink to="/help" className={link}>{t.nav.help}</NavLink>
          <NavLink to="/feedback" className={link}>{t.nav.feedback}</NavLink>
        </nav>

        <div className={styles.actions}>
          <button type="button" className={styles.lang} onClick={toggle} aria-label={t.nav.langToggleLabel}>
            {t.nav.langToggle}
          </button>
          <a className={`btn btn-primary ${styles.cta}`} href={APP_LINKS.download}>{t.nav.getApp}</a>
          <button
            type="button"
            className={styles.burger}
            aria-label={open ? t.nav.menuClose : t.nav.menuOpen}
            aria-expanded={open}
            aria-controls="main-nav"
            onClick={() => setOpen((o) => !o)}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
              {open ? <path d="M5 5l14 14M19 5L5 19" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
