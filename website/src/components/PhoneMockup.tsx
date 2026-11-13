import Icon from "./Icon";
import styles from "./PhoneMockup.module.css";

// Illustration of the real app's feed. Always Lao in both site languages (it copies the app).
export default function PhoneMockup({ label }: { label: string }) {
  return (
    <div className={`${styles.phone} lo`} role="img" aria-label={label}>
      <div className={styles.screen}>
        <div className={styles.notch}><span /></div>
        <div className={styles.top}>
          <span className={styles.mark}><img src="/images/logo.png" alt="" width={44} height={44} loading="lazy" /></span>
          <span className={styles.sep} />
          <span className={styles.pill}>ໄວໜຸ່ມ <Icon name="chevron" size={10} strokeWidth={1.9} /></span>
          <span className={styles.grow} />
          <span className={styles.bell}><Icon name="bell" size={18} strokeWidth={1.9} /><i>3</i></span>
          <Icon name="globe" size={18} strokeWidth={1.9} />
        </div>
        <div className={styles.tabs}>
          <span className={styles.tabOn}>ສຳລັບທ່ານ</span><span>ຕິດຕາມ</span><span>ຫຼ້າສຸດ</span><span>ຍອດນິຍົມ</span>
        </div>
        <div className={styles.feed}>
          <div className={styles.post}>
            <div className={styles.who}>
              <span className={styles.av} style={{ background: "#E8590C" }}>ນ</span>
              <div><b>ນ້ອຍ ພົມມະຈັນ</b><small>2 ຊົ່ວໂມງກ່ອນ · #ວຽກເຮັດງານທຳ</small></div>
            </div>
            <p className={styles.txt}>ມີຄົນສົ່ງຂໍ້ຄວາມມາບອກວ່າ ມີວຽກຢູ່ຕ່າງປະເທດ ເງິນເດືອນສູງ ບໍ່ຕ້ອງມີປະສົບການ ແທ້ບໍ?</p>
            <div className={styles.warn}>
              <div className={styles.warnHead}>
                <span className={styles.warnIc}><Icon name="warning" size={14} strokeWidth={2.2} /></span>
                <div><b>ອາດເປັນການຫຼອກລວງ</b><small>Sati ກວດສອບໂພສນີ້ແລ້ວ</small></div>
              </div>
              <div className={styles.tags}><span>ວຽກປອມ</span><span>ເງິນເດືອນເກີນຈິງ</span></div>
              <div className={styles.why}>ເບິ່ງວ່າເປັນຫຍັງ ›</div>
            </div>
            <div className={styles.counts}><span>24 ຄົນມັກ</span><span>8 ຄຳເຫັນ · 5 ແບ່ງປັນ</span></div>
            <div className={styles.acts}>
              <span><Icon name="heart" size={14} strokeWidth={1.9} />ມັກ</span>
              <span><Icon name="chat" size={14} strokeWidth={1.9} />ຄຳເຫັນ</span>
              <span><Icon name="shield" size={14} strokeWidth={1.9} />ເຕືອນ</span>
              <span><Icon name="share" size={14} strokeWidth={1.9} />ແບ່ງປັນ</span>
            </div>
          </div>
          <div className={styles.post}>
            <div className={styles.who}>
              <span className={styles.av} style={{ background: "#1971C2" }}>ມ</span>
              <div><b>ມີນາ</b><small>5 ຊົ່ວໂມງກ່ອນ · #ການສຶກສາ</small></div>
            </div>
            <p className={styles.txt}>ກວດກ່ອນສະໝັກທຶນ: ເບິ່ງເວັບໄຊທາງການຂອງມະຫາວິທະຍາໄລສະເໝີ</p>
            <p className={styles.ok}><Icon name="shieldCheck" size={15} strokeWidth={2.2} />Sati: ຄຳແນະນຳທີ່ປອດໄພ</p>
          </div>
        </div>
        <div className={styles.nav}>
          <span className={styles.navOn}><Icon name="home" size={19} strokeWidth={2.6} />ໜ້າຫຼັກ</span>
          <span><Icon name="search" size={19} strokeWidth={1.9} />ຄົ້ນຫາ</span>
          <span className={styles.navAdd}><i><Icon name="plus" size={20} strokeWidth={2.6} /></i>ໂພສ</span>
          <span><Icon name="gamepad" size={19} strokeWidth={1.9} />ເກມ</span>
          <span><Icon name="user" size={19} strokeWidth={1.9} />ຂ້ອຍ</span>
        </div>
      </div>
    </div>
  );
}
