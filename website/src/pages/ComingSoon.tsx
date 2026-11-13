import { Link } from "react-router-dom";
import { useI18n } from "../i18n";

// Temporary placeholder for pages that are still being rebuilt from the new designs.
export default function ComingSoon() {
  const { t } = useI18n();
  return (
    <section style={{ background: "var(--hero-bg)" }}>
      <div className="container" style={{ padding: "96px var(--gutter)", minHeight: "50vh" }}>
        <h1 style={{ fontSize: 40, letterSpacing: "-0.03em" }}>{t.comingSoon.title}</h1>
        <p style={{ color: "var(--body)" }}>{t.comingSoon.body}</p>
        <Link className="btn btn-primary" to="/">{t.comingSoon.back}</Link>
      </div>
    </section>
  );
}
