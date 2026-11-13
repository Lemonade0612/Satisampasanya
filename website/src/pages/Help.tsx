import { useState } from "react";
import { useI18n } from "../i18n";
import { HOTLINES, type Hotline } from "../data/hotlines";
import { DOC_KIND_LABEL, OFFICIAL_DOCS, TRAFFICKING_STATS_2024, type DocKind } from "../data/officialDocs";
import { FACEBOOK_LINKS } from "../data/placeholders";
import Icon, { FacebookIcon } from "../components/Icon";
import sh from "../styles/Shared.module.css";
import s from "./Help.module.css";

const TONE: Record<Hotline["tone"], string> = {
  rose: "#e11d48", blue: "#2563eb", violet: "#7c3aed", amber: "#d97706", emerald: "#059669", sky: "#0ea5e9", slate: "#475467",
};
const colorOf = (h: Hotline) => (h.number === "1191" ? "#d92d20" : TONE[h.tone]);
const FB_FOR: Record<string, { label: string; url: string }> = { LaoCERT: FACEBOOK_LINKS.laocert, "1362": FACEBOOK_LINKS.womensUnion };
const KIND_STYLE: Record<DocKind, [string, string]> = { notice: ["#fff1f2", "#e11d48"], guide: ["#eff6ff", "#1d4ed8"], plan: ["#f5f3ff", "#6d28d9"] };
const MAPS = [
  ["office1", "Lao+Women%27s+Union+Counselling+and+Protection+Centre+Vientiane"],
  ["office2", "Ministry+of+Labour+and+Social+Welfare+Vientiane"],
  ["office3", "Tourist+Police+Vientiane"],
] as const;

export default function Help() {
  const { t, lang } = useI18n();
  const h = t.help;
  const [kind, setKind] = useState<"all" | DocKind>("all");
  const docs = OFFICIAL_DOCS.filter((d) => kind === "all" || d.kind === kind);
  const kinds: ("all" | DocKind)[] = ["all", "notice", "guide", "plan"];
  const phoneRows = [HOTLINES[0].items[0], HOTLINES[1].items[0], HOTLINES[1].items[1], HOTLINES[2].items[0], HOTLINES[2].items[1]];

  return (
    <>
      <section className={`${sh.hero} ${s.heroBg}`}>
        <div className={`container ${sh.heroGrid}`}>
          <div className="rise">
            <p className={sh.crumb}>{h.crumb}</p>
            <h1 className={sh.h1}>{h.h1a}<span className={s.red}>{h.h1b}</span>{h.h1c}</h1>
            <p className={sh.tag}>{h.tagline}</p>
            <p className={sh.lead} style={{ marginBottom: 26 }}>{h.lead}</p>
            <div className={s.heroBtns}>
              <a className={`btn ${s.sosBtn}`} href="tel:1191"><Icon name="phone" size={18} strokeWidth={2.2} />{h.callPolice}</a>
              <a className="btn btn-light" href="#docs">{h.readReports}</a>
            </div>
          </div>
          <div className={`${sh.scene} ${s.phoneScene}`}>
            <div className={s.phoneWrap}>
              <div className={s.sosChip}>{h.sos}</div>
              <div className={`${s.phone} lo`} aria-hidden="true">
                <div className={s.screen}>
                  <div className={s.notch}><span /></div>
                  <div className={s.mSearch}><Icon name="search" size={13} strokeWidth={2.2} />ຄົ້ນຫາ</div>
                  <div className={s.mTabs}><span>ສຳຫຼວດ</span><span className={s.mOn}>ສາຍດ່ວນ</span><span>ເອກະສານ</span></div>
                  <div className={s.mBody}>
                    <p>ການຫຼອກລວງ ແລະ ອອນລາຍ</p>
                    {phoneRows.map((r) => (
                      <div key={r.number} className={s.mRow}>
                        <span style={{ background: colorOf(r) }}>{r.number}</span>
                        <b>{r.name.lo}</b>
                        <i><Icon name="phone" size={13} strokeWidth={2.2} /></i>
                      </div>
                    ))}
                    <em>ຖ້າມີອັນຕະລາຍທັນທີ ໂທ 1191</em>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="hotlines" className={sh.sec}>
        <div className="container">
          <p className={s.hotEye}>{h.hotEyebrow}</p>
          <h2 className={sh.h2}>{h.hotTitle}</h2>
          <p className={sh.sub} style={{ marginBottom: 32 }}>{h.hotLead}</p>
          <div className={s.hotGrid}>
            <div className={s.groups}>
              {HOTLINES.map((g) => (
                <div key={g.title.en}>
                  <p className={s.groupT}>{g.title[lang]}</p>
                  <div className={s.list}>
                    {g.items.map((it) => {
                      const fb = FB_FOR[it.number];
                      const name = it.name[lang];
                      return (
                        <div key={it.number} className={s.row}>
                          <span className={s.badge} style={{ background: colorOf(it), fontSize: it.number.length > 5 ? 13 : 20, boxShadow: `0 10px 20px -12px ${colorOf(it)}` }}>{it.number}</span>
                          <div className={s.rowMain}>
                            <p className={s.rowT}>{name}</p>
                            {it.org && <p className={s.rowS}>{it.org[lang]}</p>}
                            {it.extra && <p className={s.rowS}>{it.extra[lang]}</p>}
                            {fb && <a className={s.fb} href={fb.url}><FacebookIcon size={16} />{fb.label}</a>}
                          </div>
                          <a className={s.call} href={`tel:${it.tel}`} aria-label={`${h.call}: ${name}`}><Icon name="phone" size={20} strokeWidth={2.2} /></a>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
              <div className={s.danger}>{h.danger}</div>
            </div>

            <div className={s.side}>
              <div className={s.map}>
                <div className={s.mapArt} aria-hidden="true">
                  <svg viewBox="0 0 400 200" preserveAspectRatio="none"><path d="M0 140 C80 120 140 160 220 130 S340 90 400 110" stroke="#7abbff" strokeWidth="18" fill="none" opacity=".5" /><path d="M60 0 L120 200 M260 0 L230 200 M0 70 H400" stroke="#fff" strokeWidth="8" /></svg>
                  <svg className={s.pin} width="40" height="48" viewBox="0 0 24 30"><path d="M12 29s-10-9.5-10-17a10 10 0 0120 0c0 7.5-10 17-10 17z" fill="#6018ee" /><circle cx="12" cy="12" r="4" fill="#fff" /></svg>
                </div>
                <div className={s.mapBody}>
                  <p className={s.mapT}>{h.offices}</p>
                  <p className={s.mapS}>{h.officesSub}</p>
                  {MAPS.map(([k, q]) => (
                    <a key={k} href={`https://www.google.com/maps/search/?api=1&query=${q}`} target="_blank" rel="noopener noreferrer"><span>{h[k]}</span><span>{h.map}</span></a>
                  ))}
                </div>
              </div>
              <div className={s.follow}>
                <p className={s.followT}>{h.follow}</p>
                <p className={s.followS}>{h.followSub}</p>
                <a href={FACEBOOK_LINKS.sati.url}><FacebookIcon size={16} />{FACEBOOK_LINKS.sati.label}</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={sh.sec} style={{ paddingTop: 0 }}>
        <div className="container">
          <div className={sh.g3}>
            {h.tips.map((tip) => (
              <div key={tip.t} className={s.tip}><p>{tip.t}</p><span>{tip.b}</span></div>
            ))}
          </div>
        </div>
      </section>

      <section id="docs" className={`${sh.sec} ${sh.lav}`}>
        <div className="container">
          <p className="eyebrow">{h.docsEyebrow}</p>
          <h2 className={sh.h2} style={{ marginBottom: 20 }}>{h.docsTitle}</h2>
          <div className={s.filters} role="group" aria-label={h.filterLabel}>
            {kinds.map((k) => (
              <button key={k} type="button" aria-pressed={kind === k} className={kind === k ? s.fOn : ""} onClick={() => setKind(k)}>
                {k === "all" ? h.all : DOC_KIND_LABEL[k][lang]}
              </button>
            ))}
          </div>
          <div className={s.docsGrid}>
            <div className={s.stats}>
              <span className={s.statsBall} />
              <p className={s.statsBadge}>{h.statsBadge}</p>
              <p className={s.statsT}>{h.statsTitle}</p>
              <div className={s.statsRow}>
                <div><b>{TRAFFICKING_STATS_2024.cases}</b><span>{t.home.statsCases}</span></div>
                <div><b>{TRAFFICKING_STATS_2024.victims}</b><span>{t.home.statsVictims}</span></div>
                <div className={s.white}><b>{TRAFFICKING_STATS_2024.under18}</b><span>{t.home.statsUnder18}</span></div>
              </div>
              <p className={s.statsSrc}>{t.home.statsSource}</p>
            </div>
            <ul className={s.docs} aria-live="polite">
              {docs.map((d) => (
                <li key={d.url}>
                  <a className={s.doc} href={d.url} target="_blank" rel="noopener noreferrer">
                    <span className={s.docIc} style={{ background: KIND_STYLE[d.kind][0], color: KIND_STYLE[d.kind][1] }}><Icon name="lines" size={22} /></span>
                    <span className={s.docMain}>
                      <span className={s.kind} style={{ background: KIND_STYLE[d.kind][0], color: KIND_STYLE[d.kind][1] }}>{DOC_KIND_LABEL[d.kind][lang]}</span>
                      <span className={`${s.docT} lo`}>{d.title}</span>
                      <span className={`${s.docS} lo`}>{d.source}</span>
                    </span>
                    <span className={s.open}>{h.open}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
