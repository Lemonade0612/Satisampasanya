import { useI18n } from "../i18n";

// Temporary stand-in until the page is built (after Home is approved).
export default function ComingSoon({ name }: { name: string }) {
  const { t } = useI18n();
  return (
    <section className="container" style={{ padding: "120px 32px", minHeight: "50vh" }}>
      <p className="eyebrow">{name}</p>
      <h1 style={{ fontSize: 44 }}>{t.soon.title}</h1>
      <p style={{ color: "var(--body)", marginTop: 12 }}>{t.soon.body}</p>
    </section>
  );
}
