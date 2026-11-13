import { useI18n } from "../i18n";
import { STREAK_DAYS } from "../data/stats";
import styles from "./PhoneMockup.module.css";

// Illustrative app feed. The Lao post below is sample content from the design.
export default function PhoneMockup() {
  const { t } = useI18n();
  const p = t.home.phone;
  return (
    <div className={styles.scene} role="img" aria-label={p.mock}>
      <div className={styles.stage}>
        <svg className={styles.hex} viewBox="0 0 100 100" aria-hidden="true">
          <polygon
            points="50,3 91,26.5 91,73.5 50,97 9,73.5 9,26.5"
            fill="none"
            stroke="#7ABBFF"
            strokeWidth=".6"
            strokeDasharray="2 2"
          />
        </svg>

        <div className={styles.phone} aria-hidden="true">
          <div className={styles.screen}>
            <div className={styles.top}>
              <span className={styles.logo}>Sati</span>
              <span className={`lo ${styles.langTag}`}>ລາວ · EN</span>
            </div>
            <div className={styles.chips}>
              <span className={styles.chipOn}>{p.forYou}</span>
              <span className={styles.chip}>#jobs</span>
              <span className={styles.chip}>#money</span>
            </div>

            <div className={styles.post}>
              <div className={styles.meta}>
                <span>Noy · #money</span>
                <span style={{ color: "var(--yellow)" }}>{p.yellow}</span>
              </div>
              <p>{p.post1}</p>
              <div className={styles.track}>
                <div className={styles.fill} />
              </div>
            </div>

            <div className={styles.post}>
              <div className={styles.meta}>
                <span>Keo · #jobs</span>
                <span style={{ color: "var(--red)" }}>{p.red}</span>
              </div>
              <p className="lo" style={{ lineHeight: 1.5 }}>
                ວຽກຕ່າງປະເທດ ເງິນເດືອນສູງ ບໍ່ຕ້ອງມີປະສົບການ
              </p>
            </div>

            <div className={styles.post}>
              <div className={styles.meta}>
                <span>Mina · #study</span>
                <span style={{ color: "var(--green)" }}>{p.green}</span>
              </div>
              <p>{p.post3}</p>
            </div>

            <div className={styles.tabs}>
              {p.tabs.map((tab, i) => (
                <span key={tab} style={i === 0 ? { color: "var(--purple)" } : undefined}>
                  {tab}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className={`${styles.badge} ${styles.badgeA}`}>
          <div className={styles.badgeBox}>
            {t.home.badgeVerified} <span style={{ color: "var(--green)" }}>{t.home.badgeVerifiedTime}</span>
          </div>
        </div>
        <div className={`${styles.badge} ${styles.badgeB}`}>
          <div className={`${styles.badgeBox} ${styles.badgePurple}`}>
            {t.home.badgeStreak} {STREAK_DAYS} {t.home.badgeStreakUnit}
          </div>
        </div>
      </div>
    </div>
  );
}
