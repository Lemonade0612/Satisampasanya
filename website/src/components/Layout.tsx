import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import { useI18n } from "../i18n";

export default function Layout() {
  const { pathname, hash } = useLocation();
  const { t } = useI18n();

  useEffect(() => {
    const key = ({ "/": "home", "/about": "about", "/impact": "impact", "/help": "help", "/feedback": "feedback", "/policies": "policies" } as const)[pathname as "/"];
    document.title = t.titles[key ?? "notFound"];
  }, [pathname, t]);

  // Scroll to top on route change, or to the #anchor if there is one.
  useEffect(() => {
    if (hash) {
      const el = document.getElementById(hash.slice(1));
      if (el) {
        el.scrollIntoView();
        return;
      }
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);

  return (
    <>
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
