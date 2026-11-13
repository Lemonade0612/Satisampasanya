import { Link } from "react-router-dom";
import { useI18n } from "../i18n";
import { APP_LINKS } from "../data/links";
import { HOME_STATS, STREAK_DAYS } from "../data/placeholders";
import { TRAFFICKING_STATS_2024 } from "../data/officialDocs";
import PhoneMockup from "../components/PhoneMockup";
import Icon, { type IconName } from "../components/Icon";
import s from "./Home.module.css";

const FEATURE_ICONS: IconName[] = ["list", "gamepad", "chat"];
const DETECT_ICONS: IconName[] = ["lines", "briefcase", "link", "flag"];
const PROTECT_ICONS: IconName[] = ["phoneMock", "eyeOff", "pin", "userCheck"];
const FLOW_ICONS: IconName[] = ["plus", "search", "userCheck", "shieldCheck"];
const ACTION_ICONS: IconName[] = ["search", "share", "flag"];

export default function Home() {
  const { t } = useI18n();
  const h = t.home;

  return (
    <>
      {/* Hero */}
      <section className={s.hero}>
        <div className={`container ${s.heroGrid}`}>
          <div className={`${s.heroText} rise`}>
            <span className={s.badge}><span className={s.dot} />{h.badge}</span>
            <h1 className={s.h1}>
              {h.h1a}<br /><span className={s.purple}>{h.h1b}</span> <span className={s.blue}>{h.h1c}</span>
            </h1>
            <p className={s.lead}>{h.lead}</p>
            <div className={s.heroBtns}>
              <a className="btn btn-primary" href={APP_LINKS.download}>{h.download}</a>
              <Link className="btn btn-light" to="/about">{h.story}</Link>
            </div>
            <div className={s.stores}>
              <a href={APP_LINKS.appStore}><small>{t.footer.appStoreSmall}</small><b>{t.footer.appStore}</b></a>
              <a href={APP_LINKS.googlePlay}><small>{t.footer.playSmall}</small><b>{t.footer.play}</b></a>
            </div>
          </div>
          <div className={s.scene} aria-hidden="false">
            <div className={s.stage}>
              <svg className={s.hex} viewBox="0 0 100 100" aria-hidden="true"><polygon points="50,3 91,26.5 91,73.5 50,97 9,73.5 9,26.5" fill="none" stroke="#7abbff" strokeWidth=".6" strokeDasharray="2 2" /></svg>
              <div className={s.float}><PhoneMockup label={h.phoneAlt} /></div>
              <div className={`${s.chip} ${s.chipA}`}>{h.chipVerified} <span className={s.green}>{h.chipVerifiedTime}</span></div>
              <div className={`${s.chip} ${s.chipB}`}>{h.chipStreak} {STREAK_DAYS} {h.chipStreakUnit}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Inside the app */}
      <section id="app" className={s.section}>
        <div className="container">
          <p className="eyebrow">{h.featuresEyebrow}</p>
          <h2 className={s.h2Big}>{h.featuresTitle}</h2>
          <div className={s.grid3}>
            {h.features.map((f, i) => (
              <article key={f.kicker} className={`${s.feature} tilt rise`} style={{ animationDelay: `${i * 0.08}s` }}>
                <span className={`${s.ficon} ${i === 1 ? s.ficonBlue : ""}`}><Icon name={FEATURE_ICONS[i]} /></span>
                <p className={`${s.kicker} ${i === 1 ? s.kickerBlue : ""}`}>{f.kicker}</p>
                <h3>{f.title}</h3>
                <p>{f.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Age bands */}
      <section className={`${s.section} ${s.lav}`}>
        <div className="container">
          <div className={s.center}>
            <p className="eyebrow">{h.agesEyebrow}</p>
            <h2 className={s.h2Hero}>
              <span className={s.grad}>{h.agesTitleA}</span> {h.agesTitleB}<br />{h.agesTitleC}
            </h2>
          </div>
          <div className={s.ages}>
            <AgeCard className={s.band} icon="face" tint="#fff6e9" color="#d97706" {...h.kids} />
            <div className={`${s.band} ${s.youth}`}>
              <span className={s.d1} /><span className={s.d2} /><span className={s.d3} /><span className={s.d4} />
              <span className={s.coreTag}>{h.core}</span>
              <span className={`${s.bicon} ${s.bigIcon}`}><Icon name="bolt" size={30} /></span>
              <h3>{h.youth.name}</h3>
              <p className={s.bandTxt}>{h.youth.band}</p>
              <p className={s.youthBody}>{h.youth.body}</p>
              <div className={s.chips}>{h.youth.chips.map((c) => <span key={c}>{c}</span>)}</div>
            </div>
            <AgeCard className={s.band} icon="shieldCheck" tint="#eaf4ff" color="#1f6fd1" {...h.adults} />
            <AgeCard className={s.band} icon="home" tint="#f3eeff" color="#7c3aed" {...h.elders} />
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className={s.section}>
        <div className={`container ${s.stats}`}>
          {HOME_STATS.map((v, i) => (
            <div key={i}>
              <div className={`${s.statNum} ${i % 2 ? s.blueNum : ""}`}>{v}</div>
              <div className={s.statLbl}>{h.statLabels[i]}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Safety & privacy */}
      <section className={`${s.section} ${s.lav}`}>
        <div className="container">
          <div className={s.center}>
            <p className="eyebrow">{h.safetyEyebrow}</p>
            <h2 className={s.h2Safety}>{h.safetyTitle}</h2>
            <p className={s.sub}>{h.safetySub}</p>
          </div>
          <div className={s.panels}>
            <Panel dark icon="search" data={h.detect} icons={DETECT_ICONS} />
            <Panel icon="lock" data={h.protect} icons={PROTECT_ICONS} />
          </div>
          <ol className={s.flow}>
            {h.flow.map((f, i) => (
              <li key={f.t} className={s.step}>
                <div className={s.stepTop}><span className={s.stepIc}><Icon name={FLOW_ICONS[i]} /></span><span className={s.stepNo}>{i + 1}</span></div>
                <p className={s.stepT}>{f.t}</p>
                <p className={s.stepS}>{f.s}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Impact CTA */}
      <section className={s.ctaWrap}>
        <div className={`container`}>
          <div className={s.cta}>
            <span className={s.c1} /><span className={s.c2} /><span className={s.c3} />
            <div className={s.ctaText}>
              <p className={s.ctaEyebrow}>{h.ctaEyebrow}</p>
              <h2>{h.ctaTitleA}<br />{h.ctaTitleB}</h2>
              <p className={s.ctaBody}>{h.ctaBody}</p>
              <div className={s.ctaBtns}>
                <Link className={`btn ${s.ctaWhite}`} to="/impact">{h.ctaImpact} <Icon name="arrow" size={18} strokeWidth={2.4} /></Link>
                <Link className={`btn ${s.ctaGhost}`} to="/feedback">{h.ctaFeedback}</Link>
              </div>
              <div className={s.actions}>
                {h.actions.map((a, i) => (
                  <div key={a.t}><span><Icon name={ACTION_ICONS[i]} size={20} /></span><div><b>{a.t}</b><small>{a.s}</small></div></div>
                ))}
              </div>
            </div>
            <div className={s.statsCard}>
              <div className={s.statsHead}><b>{h.statsTitle}</b><span>2024</span></div>
              <div className={s.statsRow}>
                <div style={{ background: "#fff1f2" }}><b style={{ color: "#e11d48" }}>{TRAFFICKING_STATS_2024.cases}</b><span>{h.statsCases}</span></div>
                <div style={{ background: "#f5f3ff" }}><b style={{ color: "#5b21d6" }}>{TRAFFICKING_STATS_2024.victims}</b><span>{h.statsVictims}</span></div>
                <div style={{ background: "#fffbeb" }}><b style={{ color: "#b45309" }}>{TRAFFICKING_STATS_2024.under18}</b><span>{h.statsUnder18}</span></div>
              </div>
              <p>{h.statsSource}</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function AgeCard({ className, icon, tint, color, name, band, body }: { className: string; icon: IconName; tint: string; color: string; name: string; band: string; body: string }) {
  return (
    <div className={className}>
      <span className={s.bicon} style={{ background: tint, color }}><Icon name={icon} size={26} /></span>
      <h3>{name}</h3>
      <p className={s.bandMeta}>{band}</p>
      <p className={s.bandBody}>{body}</p>
    </div>
  );
}

function Panel({ dark, icon, data, icons }: { dark?: boolean; icon: IconName; data: { tag: string; title: string; rows: { t: string; s: string }[] }; icons: IconName[] }) {
  return (
    <div className={`${s.panel} ${dark ? s.panelDark : s.panelPurple}`}>
      <span className={s.panelGlow} />
      <div className={s.panelHead}>
        <span className={s.panelIc}><Icon name={icon} size={30} /></span>
        <div><span className={s.tag}>{data.tag}</span><h3>{data.title}</h3></div>
      </div>
      <ul className={s.rows}>
        {data.rows.map((r, i) => (
          <li key={r.t} className={s.prow}>
            <span className={s.pic}><Icon name={icons[i]} /></span>
            <span><b>{r.t}</b><small>{r.s}</small></span>
          </li>
        ))}
      </ul>
    </div>
  );
}
