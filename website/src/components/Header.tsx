import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useI18n } from "../i18n";
import { APP_LINKS } from "../data/links";
import Icon from "./Icon";
import styles from "./Header.module.css";

export default function Header() {
  const { t, lang, setLang } = useI18n();
  const [open, setOpen] = useState(false);
  const { pathname, hash } = useLocation();

  useEffect(() => setOpen(false), [pathname, hash]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const cls = ({ isActive }: { isActive: boolean }) => (isActive ? `${styles.link} ${styles.active}` : styles.link);

  return (
    <header className={styles.header}>
      <div className={`container ${styles.bar}`}>
        <Link to="/" className={styles.brand}>
          <span className={styles.logo}>
            <img src="/images/logo.png" alt={t.logoAlt} width={76} height={76} />
          </span>
          <span className={styles.name}>{t.brand}</span>
        </Link>

        {open && <div className={styles.scrim} onClick={() => setOpen(false)} aria-hidden="true" />}
        <nav id="main-nav" aria-label={t.nav.mainNav} className={`${styles.nav} ${open ? styles.open : ""}`}>
          <NavLink to="/" end className={cls}>{t.nav.home}</NavLink>
          <NavLink to="/about" className={cls}>{t.nav.about}</NavLink>
          <Link to="/#app" className={styles.link}>{t.nav.app}</Link>
          <NavLink to="/impact" className={cls}>{t.nav.impact}</NavLink>
          <NavLink to="/help" className={cls}>{t.nav.help}</NavLink>
          <NavLink to="/feedback" className={cls}>{t.nav.feedback}</NavLink>
        </nav>

        <div className={styles.actions}>
          <div className={styles.lang} role="group" aria-label={t.nav.langSwitch}>
            <button type="button" aria-pressed={lang === "en"} aria-label={`EN ${t.nav.langEn}`} lang="en" onClick={() => setLang("en")}>EN</button>
            <button type="button" aria-pressed={lang === "lo"} aria-label={`ລາວ ${t.nav.langLo}`} lang="lo" className="lo" onClick={() => setLang("lo")}>ລາວ</button>
          </div>
          <a className={`btn btn-primary ${styles.cta}`} href={APP_LINKS.download}>{t.nav.getApp}</a>
          <button type="button" className={styles.burger} aria-label={open ? t.nav.menuClose : t.nav.menuOpen} aria-expanded={open} aria-controls="main-nav" onClick={() => setOpen((o) => !o)}>
            <Icon name={open ? "close" : "menu"} />
          </button>
        </div>
      </div>
    </header>
  );
}
