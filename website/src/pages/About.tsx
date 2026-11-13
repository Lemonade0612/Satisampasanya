import { useEffect, useRef, useState } from "react";
import { useI18n } from "../i18n";
import { ROADMAP, type RoadmapStatus } from "../data/placeholders";
import Icon from "../components/Icon";
import sh from "../styles/Shared.module.css";
import s from "./About.module.css";

const ARC = "M -20 840 L 120 810 C 225 785 225 765 330 745 C 435 722 435 690 540 665 C 645 638 645 605 750 575 C 855 540 855 510 960 470 L 1040 432";
const LINES = [[350, 460], [350, 395], [350, 315], [350, 225], [350, 120]];
const DOTS = [803, 738, 658, 568, 463];
const STARS = [[65,30],[79,30],[67,17],[73,30],[83,9],[31,28],[73,18],[88,22],[31,6],[65,12],[26,5],[76,28]];

export default function About() {
  const { t, lang } = useI18n();
  const a = t.about;
  const deskRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const el = deskRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setScale(Math.min(1, el.clientWidth / 1240) || 1));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const badge = (st: RoadmapStatus) => {
    const label = st === "done" ? a.done : st === "now" ? a.now : a.next;
    return <span className={`${s.badge} ${s[st]}`}>{label}</span>;
  };
  const Card = ({ i, style }: { i: number; style?: React.CSSProperties }) => {
    const m = ROADMAP[i];
    return (
      <article className={`${s.card} tilt rise`} style={{ ...style, animationDelay: `${i * 0.1}s` }}>
        <div className={s.photo}>
          {m.photo ? <img src={m.photo} alt="" loading="lazy" /> : <><Icon name="search" size={22} />{a.addPhoto}</>}
        </div>
        <div className={s.cardBody}>
          <div className={s.cardTop}><span className={s.date}>{m.date[lang]}</span>{badge(m.status)}</div>
          <p className={s.cardT}>{m.title[lang]}</p>
          <p className={s.cardS}>{m.line[lang]}</p>
        </div>
      </article>
    );
  };

  return (
    <>
      <section className={sh.hero}>
        <div className={`container ${sh.heroGrid}`}>
          <div className="rise">
            <p className={sh.crumb}>{a.crumb}</p>
            <h1 className={sh.h1}>{a.h1a}<br />{a.h1b}<span className={sh.purple}>{a.h1c}</span>{a.h1d}</h1>
            <p className={sh.tag}>{a.tagline}</p>
            <p className={sh.lead}>{a.lead}</p>
          </div>
          <div className={sh.scene}>
            <div className={`${s.logoCard} ${sh.float}`}><img src="/images/logo.png" alt={a.logoAlt} width={280} height={280} /></div>
          </div>
        </div>
      </section>

      {/* Roadmap */}
      <section className={s.roadWrap}>
        <div className="container">
          <div className={s.road}>
            <div className={s.roadStars} aria-hidden="true">
              {STARS.map(([l, tp], i) => <span key={i} style={{ left: `${l}%`, top: `${tp}%`, animationDelay: `${i * 0.25}s` }} />)}
            </div>
            <div className={s.roadHead}>
              <div>
                <p className="eyebrow">{a.roadmapEyebrow}</p>
                <h2 className={sh.h2} style={{ marginBottom: 0 }}>{a.roadmapTitle}</h2>
              </div>
              <p className={s.roadLead}>{a.roadmapLead}</p>
            </div>

            {/* Desktop: ascending path with rocket tower */}
            <div className={s.deskScroll} ref={deskRef} style={{ height: 900 * scale }}>
              <div className={s.stage} style={{ transform: `scale(${scale})` }}>
                <svg width="1240" height="900" viewBox="0 0 1240 900" className={s.abs} aria-hidden="true">
                  <ellipse cx="560" cy="1100" rx="1100" ry="260" fill="#fff" opacity=".75" />
                  <path className={s.arc} d={ARC} fill="none" stroke="#6018EE" strokeWidth="2.5" strokeDasharray="3 9" strokeLinecap="round" />
                </svg>
                {ROADMAP.map((m, i) => (
                  <div key={i}>
                    <Card i={i} style={{ position: "absolute", left: 22 + i * 210, top: 60, width: 196 }} />
                    <div className={s.vline} style={{ left: 119 + i * 210, top: LINES[i][0], height: LINES[i][1] }} />
                    <div className={`${s.vdot} ${m.status === "next" ? s.vdotNext : ""}`} style={{ left: 113 + i * 210, top: DOTS[i] }} />
                  </div>
                ))}
                <div className={s.tower}>
                  <Tower />
                  <div className={s.tminus}>{a.tMinus}</div>
                </div>
              </div>
            </div>

            {/* Phone/tablet: vertical timeline, rocket at the end */}
            <ol className={s.timeline}>
              {ROADMAP.map((m, i) => (
                <li key={i} className={s.tItem}>
                  <span className={`${s.tDot} ${m.status === "next" ? s.vdotNext : ""}`} />
                  <Card i={i} />
                </li>
              ))}
              <li className={s.tRocket}>
                <span className={s.tDot} />
                <div className={s.miniRocket}>
                  <svg width="64" height="110" viewBox="150 30 80 320" aria-hidden="true">
                    <path d="M190 40 C200 52 206 66 206 84 V330 H174 V84 C174 66 180 52 190 40Z" fill="#fff" stroke="#6018EE" strokeWidth="5" />
                    <path d="M174 300 L160 336 H174Z M206 300 L220 336 H206Z" fill="#6018EE" />
                    <circle cx="190" cy="110" r="9" fill="#7ABBFF" stroke="#6018EE" strokeWidth="3" />
                    <path className={s.flame} d="M176 330 Q190 420 204 330Z" fill="#7ABBFF" />
                  </svg>
                  <span>{a.tMinus}</span>
                </div>
              </li>
            </ol>
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section className={`${sh.sec} ${sh.lav}`}>
        <div className="container">
          <div className={sh.center}>
            <p className="eyebrow">{a.compareEyebrow}</p>
            <h2 className={sh.h2}>{a.compareTitle}</h2>
            <p className={sh.sub}>{a.compareLead}</p>
          </div>
          <div className={s.cmp}>
            <div>
              <p className={s.cmpLabel}>{a.today}</p>
              <div className={`${s.post} ${s.postL}`}>
                <PostHead a={a} />
                <p className={s.postTxt}>{a.postText}</p>
                <div className={s.banner}>{a.banner}</div>
                <div className={s.engage}><span>{a.likes}</span><span>{a.comments}</span><span>{a.shares}</span></div>
                <p className={s.nowarn}>{a.noWarning}</p>
              </div>
            </div>
            <div className={s.arrow}><span><Icon name="arrow" size={26} strokeWidth={2.4} /></span></div>
            <div>
              <p className={`${s.cmpLabel} ${s.cmpSati}`}>{a.onSati}</p>
              <div className={`${s.post} ${s.postR}`}>
                <PostHead a={a} />
                <p className={s.postTxt}>{a.postText}</p>
                <div className={s.verdict}><b>{a.verdict}</b><small>{a.checks}</small></div>
                {a.flags.map((f) => <div key={f} className={s.flag}><i />{f}</div>)}
                <div className={s.foot}><span className={s.okv}>{a.verified}</span><span className={s.callh}>{a.callHelp}</span></div>
              </div>
            </div>
          </div>
          <div className={s.stats}>
            {a.stats.map((st) => (
              <div key={st.n}><div className={s.statN}>{st.n}</div><p>{st.l}</p></div>
            ))}
          </div>
        </div>
      </section>

      {/* Who we are */}
      <section className={s.who}>
        <div className={`container ${s.whoIn}`}>
          <p className="eyebrow">{a.whoEyebrow}</p>
          <p className={s.w1}>{a.who1}<br />{a.who2a}<span className={sh.purple}>{a.who2b}</span>{a.who2c}</p>
          <p className={s.w2}>{a.who3a}<span className={s.grad}>{a.who3b}</span>{a.who3c}</p>
          <p className={s.w3}><b>{a.whoBrand}</b>{a.whoText}</p>
          <div className={s.team}>
            {[["/images/phoumiphon.png", a.team[0]], ["/images/kanlaya.png", a.team[1]]].map(([src, m]) => {
              const p = m as { name: string; role: string };
              return (
                <figure key={p.name} className={`${s.member} rise`}>
                  <div className={s.ring}><img src={src as string} alt={p.name} loading="lazy" width={286} height={286} /></div>
                  <figcaption><b>{p.name}</b><span>{p.role}</span></figcaption>
                </figure>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}

function PostHead({ a }: { a: { sponsored: string; agency: string } }) {
  return (
    <div className={s.postHead}>
      <span className={s.avatar}>G</span>
      <div><b>{a.agency}</b><small>{a.sponsored}</small></div>
    </div>
  );
}

function Tower() {
  return (
    <svg width="340" height="470" viewBox="0 0 340 470" aria-hidden="true">
      <defs><linearGradient id="fl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff" /><stop offset=".4" stopColor="#7ABBFF" /><stop offset="1" stopColor="#6018EE" stopOpacity="0" /></linearGradient></defs>
      <g stroke="#6018EE" strokeOpacity=".55" strokeWidth="2" fill="none">
        <rect x="70" y="40" width="44" height="380" />
        <path d="M70 40 L114 80 M114 40 L70 80 M70 80 L114 120 M114 80 L70 120 M70 120 L114 160 M114 120 L70 160 M70 160 L114 200 M114 160 L70 200 M70 200 L114 240 M114 200 L70 240 M70 240 L114 280 M114 240 L70 280 M70 280 L114 320 M114 280 L70 320 M70 320 L114 360 M114 320 L70 360 M70 360 L114 400 M114 360 L70 400" />
        <path d="M92 40 V10 M60 40 H124 M114 70 H200 M114 82 H200 M140 70 L130 82 M160 70 L150 82 M180 70 L170 82 M114 250 H170" />
      </g>
      <g className={s.shake}>
        <path d="M190 40 C200 52 206 66 206 84 V330 H174 V84 C174 66 180 52 190 40Z" fill="#fff" stroke="#6018EE" strokeWidth="3" />
        <path d="M174 300 L160 336 H174Z M206 300 L220 336 H206Z" fill="#6018EE" />
        <rect x="174" y="200" width="32" height="6" fill="#DCD8F0" />
        <circle cx="190" cy="110" r="7" fill="#7ABBFF" stroke="#6018EE" strokeWidth="2" />
        <path className={s.fla} d="M176 330 Q190 420 204 330Z" fill="url(#fl)" />
      </g>
      <g className={s.puff} fill="#fff"><circle cx="120" cy="420" r="40" /><circle cx="170" cy="405" r="46" /><circle cx="230" cy="420" r="42" /><circle cx="280" cy="432" r="34" /><circle cx="70" cy="438" r="30" /></g>
      <g className={s.puff} fill="#EEE8FF" style={{ animationDelay: ".6s" }}><circle cx="150" cy="440" r="34" /><circle cx="215" cy="446" r="30" /></g>
      <rect x="0" y="456" width="340" height="14" rx="4" fill="#DCD8F0" />
    </svg>
  );
}
