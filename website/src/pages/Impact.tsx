import { useState } from "react";
import { Link } from "react-router-dom";
import { useI18n } from "../i18n";
import { TRAFFICKING_STATS_2024 } from "../data/officialDocs";
import {
  IMPACT_FLAGGED_RED, IMPACT_NUMBERS, IMPACT_VERIFIED_48H, POSTS_BAR_HEIGHTS, POSTS_PER_MONTH,
  POST_RESULTS, POST_RESULTS_SHARE, POST_RESULTS_TOTAL,
} from "../data/placeholders";
import { APP_LINKS } from "../data/links";
import sh from "../styles/Shared.module.css";
import s from "./Impact.module.css";

const NUM_BG = [
  "linear-gradient(150deg,#6018ee,#7c3aed)", "linear-gradient(150deg,#1f6fd1,#4e9bf0)",
  "linear-gradient(150deg,#2f7fd6,#5aa9f5)", "linear-gradient(150deg,#3b2a9e,#6018ee)",
];
const ACT_GRAD = ["linear-gradient(135deg,#6018ee,#7abbff)", "linear-gradient(135deg,#1f6fd1,#7abbff)", "linear-gradient(135deg,#d92d20,#f97066)"];
const ACT_HREF = [APP_LINKS.download, APP_LINKS.download, "/help#hotlines"];

export default function Impact() {
  const { t } = useI18n();
  const m = t.impact;
  const [tab, setTab] = useState<"posts" | "results">("posts");
  const { green, yellow } = POST_RESULTS_SHARE;
  const donut = `conic-gradient(#12b76a 0 ${green}%, #f79009 ${green}% ${green + yellow}%, #d92d20 ${green + yellow}% 100%)`;
  const prob = [TRAFFICKING_STATS_2024.cases, TRAFFICKING_STATS_2024.victims, TRAFFICKING_STATS_2024.under18];
  const probStyle = [["#fff1f2", "#fecdd3", "#e11d48"], ["#f5f3ff", "#ddd6fe", "#6018ee"], ["#fffbeb", "#fde68a", "#b45309"]];

  return (
    <>
      <section className={sh.hero}>
        <div className={`container ${sh.heroGrid}`}>
          <div className="rise">
            <p className={sh.crumb}>{m.crumb}</p>
            <h1 className={sh.h1}>{m.h1a}<br /><span className={sh.purple}>{m.h1b}</span></h1>
            <p className={sh.lead}>{m.lead}</p>
          </div>
          <div className={sh.scene}>
            <div className={`${s.live} tilt`}>
              <div className={s.liveHead}><span>{m.liveTitle}</span><span className={s.liveDot}>{m.live}</span></div>
              <svg viewBox="0 0 300 90" className={s.spark} aria-hidden="true">
                <path d="M0 75 C40 70 60 50 100 55 S160 30 200 35 S260 10 300 8" fill="none" stroke="#6018ee" strokeWidth="3" />
                <path d="M0 75 C40 70 60 50 100 55 S160 30 200 35 S260 10 300 8 V90 H0Z" fill="#7abbff" opacity=".18" />
              </svg>
              <div className={s.liveGrid}>
                <div style={{ background: "#f6f4ff" }}><p>{m.flagged}</p><b style={{ color: "#d92d20" }}>{IMPACT_FLAGGED_RED}</b></div>
                <div style={{ background: "#eef5ff" }}><p>{m.verified}</p><b style={{ color: "#1f6fd1" }}>{IMPACT_VERIFIED_48H}</b></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={sh.sec}>
        <div className="container">
          <p className="eyebrow">{m.numbersEyebrow}</p>
          <div className={`${sh.g4} ${s.nums}`}>
            {m.numCards.map((c, i) => (
              <div key={c.t} className={`${s.num} tilt rise`} style={{ background: NUM_BG[i], animationDelay: `${i * 0.08}s` }}>
                <div className={s.numV}>{IMPACT_NUMBERS[i]}</div>
                <p className={s.numT}>{c.t}</p>
                <p className={s.numS}>{c.s}</p>
              </div>
            ))}
          </div>

          <div className={s.chart}>
            <div className={s.chartHead}>
              <div><p className={s.chartT}>{m.chartTitle}</p><p className={s.chartN}>{m.chartNote}</p></div>
              <div className={s.tabs} role="tablist" aria-label={m.chartTitle}>
                <button role="tab" id="tab-posts" aria-selected={tab === "posts"} aria-controls="panel-posts" className={tab === "posts" ? s.tabOn : ""} onClick={() => setTab("posts")}>{m.tabPosts}</button>
                <button role="tab" id="tab-results" aria-selected={tab === "results"} aria-controls="panel-results" className={tab === "results" ? s.tabOn : ""} onClick={() => setTab("results")}>{m.tabResults}</button>
              </div>
            </div>

            {tab === "posts" ? (
              <div role="tabpanel" id="panel-posts" aria-labelledby="tab-posts">
                <div className={s.bars}>
                  <div className={s.grid} aria-hidden="true">{[0, 1, 2, 3, 4].map((i) => <div key={i} />)}</div>
                  <div className={s.cols}>
                    {POSTS_BAR_HEIGHTS.map((h, i) => {
                      const last = i === POSTS_BAR_HEIGHTS.length - 1;
                      return (
                        <div key={i} className={s.col}>
                          <span className={`${s.bv} ${last ? s.bvOn : ""}`}>{POSTS_PER_MONTH[i]}</span>
                          <div className={`${s.bar} ${last ? s.barOn : ""}`} style={{ height: `${h}%`, animationDelay: `${i * 0.08}s` }} />
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className={s.months}>{m.months.map((mo, i) => <span key={mo} className={i === 5 ? s.moOn : ""}>{mo}</span>)}</div>
                <div className={s.legend}>
                  <span><i style={{ background: "linear-gradient(180deg,#9f7bff,#c9e2ff)" }} />{m.prevMonths}</span>
                  <span><i style={{ background: "#6018ee" }} />{m.thisMonth}</span>
                </div>
              </div>
            ) : (
              <div role="tabpanel" id="panel-results" aria-labelledby="tab-results" className={s.results}>
                <div className={s.donut} style={{ background: donut }} role="img" aria-label={`${POST_RESULTS_TOTAL} ${m.posts}`}>
                  <div><b>{POST_RESULTS_TOTAL}</b><span>{m.posts}</span></div>
                </div>
                <ul className={s.keys}>
                  <li><i style={{ background: "#12b76a" }} />{m.green}<b style={{ color: "#067647" }}>{POST_RESULTS.green}</b></li>
                  <li><i style={{ background: "#f79009" }} />{m.yellow}<b style={{ color: "#b54708" }}>{POST_RESULTS.yellow}</b></li>
                  <li><i style={{ background: "#d92d20" }} />{m.red}<b style={{ color: "#b42318" }}>{POST_RESULTS.red}</b></li>
                </ul>
              </div>
            )}
          </div>

          <p className="eyebrow" style={{ marginTop: 48 }}>{m.problemEyebrow}</p>
          <div className={sh.g3}>
            {prob.map((v, i) => (
              <div key={i} className={`${s.prob} tilt`} style={{ background: probStyle[i][0], borderColor: probStyle[i][1] }}>
                <div className={s.probV} style={{ color: probStyle[i][2] }}>{v}</div>
                <p>{m.problem[i]}</p>
              </div>
            ))}
          </div>
          <p className={s.src}>{m.source}</p>
        </div>
      </section>

      <section className={`${sh.sec} ${sh.lav}`}>
        <div className="container">
          <p className="eyebrow">{m.actionEyebrow}</p>
          <h2 className={sh.h2} style={{ marginBottom: 32 }}>{m.actionTitle}</h2>
          <div className={sh.g3}>
            {m.actions.map((a, i) => {
              const inner = (
                <>
                  <div className={s.actN} style={{ backgroundImage: ACT_GRAD[i] }}>0{i + 1}</div>
                  <h3>{a.t}</h3><p>{a.b}</p><span>{a.c}</span>
                </>
              );
              return ACT_HREF[i].startsWith("/") ? (
                <Link key={a.t} className={`${s.act} tilt`} to={ACT_HREF[i]}>{inner}</Link>
              ) : (
                <a key={a.t} className={`${s.act} tilt`} href={ACT_HREF[i]}>{inner}</a>
              );
            })}
          </div>
          <div className={s.hots}>
            <a href="tel:1533" style={{ background: "#6018ee" }}><span>{m.hot1}</span><b>1533</b></a>
            <a href="tel:1362" style={{ background: "#2f7fd6" }}><span>{m.hot2}</span><b>1362</b></a>
          </div>
        </div>
      </section>
    </>
  );
}
