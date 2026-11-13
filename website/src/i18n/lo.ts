import type { Dict } from "./en";

// Lao copy. Lines taken from the designs are real Lao. Lines marked
// TODO-LO-REVIEW are AI drafts that a native speaker must check before launch.
export const lo: Dict = {
  brand: "Satisampasanya",
  logoAlt: "ໂລໂກ້ Sati",
  nav: {
    home: "ໜ້າຫຼັກ", // TODO-LO-REVIEW
    about: "ກ່ຽວກັບພວກເຮົາ", // TODO-LO-REVIEW
    app: "ແອັບ", // TODO-LO-REVIEW
    impact: "ຜົນກະທົບ",
    help: "ຂໍຄວາມຊ່ວຍເຫຼືອ", // TODO-LO-REVIEW
    feedback: "ຄຳຕິຊົມ", // TODO-LO-REVIEW
    getApp: "ດາວໂຫຼດແອັບ", // TODO-LO-REVIEW
    langSwitch: "ປ່ຽນພາສາ", // TODO-LO-REVIEW
    langEn: "ພາສາອັງກິດ", // TODO-LO-REVIEW
    langLo: "ພາສາລາວ", // TODO-LO-REVIEW
    menuOpen: "ເປີດເມນູ", // TODO-LO-REVIEW
    menuClose: "ປິດເມນູ", // TODO-LO-REVIEW
    mainNav: "ເມນູຫຼັກ", // TODO-LO-REVIEW
  },
  footer: {
    ctaTitle: "ກ້າວໜ້າການຫຼອກລວງຢູ່ສະເໝີ.", // TODO-LO-REVIEW
    ctaSub: "ມີສະຕິ ກ່ອນຄລິກ — ດາວໂຫຼດ Sati ຟຣີ",
    appStoreSmall: "Download on the",
    appStore: "App Store",
    playSmall: "Get it on",
    play: "Google Play",
    blurb: "ແພລດຟອມສອງພາສາຕ້ານການຫຼອກລວງ ແລະ ການຄ້າມະນຸດ ທີ່ເລີ່ມຕົ້ນໂດຍໄວໜຸ່ມລາວໃນນະຄອນຫຼວງວຽງຈັນ.", // TODO-LO-REVIEW
    colSati: "Sati",
    colHelp: "ຊ່ວຍເຫຼືອ", // TODO-LO-REVIEW
    colDanger: "ມີອັນຕະລາຍບໍ?", // TODO-LO-REVIEW
    about: "ກ່ຽວກັບພວກເຮົາ", // TODO-LO-REVIEW
    impact: "ຜົນກະທົບ",
    app: "ແອັບ", // TODO-LO-REVIEW
    hotlines: "ສາຍດ່ວນ",
    documents: "ເອກະສານ",
    feedback: "ຄຳຕິຊົມ", // TODO-LO-REVIEW
    police: "ຕຳຫຼວດ · 24/7",
    scamLine: "ສາຍດ່ວນສໍ້ໂກງ",
    facebook: "Facebook",
    email: "ອີເມລ", // TODO-LO-REVIEW
    rights: "© 2026 Satisampasanya · ນະຄອນຫຼວງວຽງຈັນ, ສປປ ລາວ", // TODO-LO-REVIEW
    privacy: "ນະໂຍບາຍຄວາມເປັນສ່ວນຕົວ",
    guidelines: "ກົດລະບຽບຊຸມຊົນ",
    terms: "ເງື່ອນໄຂການນຳໃຊ້",
  },
  home: {
    badge: "ເລີ່ມຕົ້ນໂດຍໄວໜຸ່ມລາວ ເພື່ອໄວໜຸ່ມລາວ", // TODO-LO-REVIEW
    h1a: "ມີສະຕິ ກ່ອນຄລິກ —",
    h1b: "ປອດໄພ",
    h1c: "ໄປນຳກັນ",
    lead: "Sati ແມ່ນແອັບສອງພາສາທີ່ຊ່ວຍໃຫ້ໄວໜຸ່ມໃນລາວຮູ້ເທົ່າທັນການຫຼອກລວງອອນລາຍ ແລະ ກັບດັກການຄ້າມະນຸດ ຜ່ານຟີດຊຸມຊົນທີ່ມີການກວດສອບ, ເກມປະຈຳວັນ, ຜູ້ຊ່ວຍ AI ດ້ານຄວາມປອດໄພ ແລະ ຂໍ້ມູນຊ່ວຍເຫຼືອຢ່າງເປັນທາງການໃນບ່ອນດຽວ.", // TODO-LO-REVIEW
    download: "ດາວໂຫຼດ Sati",
    story: "ເລື່ອງລາວຂອງພວກເຮົາ →", // TODO-LO-REVIEW
    chipVerified: "ຜູ້ຊ່ຽວຊານຢືນຢັນ", // TODO-LO-REVIEW
    chipVerifiedTime: "✓ 48 ຊົ່ວໂມງ",
    chipStreak: "Sati Daily · ຕໍ່ເນື່ອງ", // TODO-LO-REVIEW
    chipStreakUnit: "ວັນ",
    phoneAlt: "ພາບປະກອບໜ້າຟີດຂອງແອັບ Sati", // TODO-LO-REVIEW
    featuresEyebrow: "ພາຍໃນແອັບ", // TODO-LO-REVIEW
    featuresTitle: "ທຸກຢ່າງຈາກແອັບມືຖືຂອງພວກເຮົາ ສ້າງມາເພື່ອທຸກໄວ.", // TODO-LO-REVIEW
    features: [
      { kicker: "ຟີດຊຸມຊົນ", title: "ໂພສທີ່ຖືກກວດສອບ", body: "ແບ່ງປັນຂໍ້ສະເໜີທີ່ໜ້າສົງໄສ. Sati AI ກວດແຕ່ລະໂພສ ແລະ ຜູ້ຊ່ຽວຊານຢືນຢັນພາຍໃນ 48 ຊົ່ວໂມງ: ຂຽວ, ເຫຼືອງ ຫຼື ແດງ." }, // TODO-LO-REVIEW
      { kicker: "Sati Daily", title: "ເກມທີ່ມີສະຖານະການໃໝ່", body: "ເກມສັ້ນໆປະຈຳວັນສຳລັບເດັກ, ໄວໜຸ່ມ, ຜູ້ໃຫຍ່ ແລະ ຜູ້ສູງອາຍຸ — ຮຽນຮູ້ສັນຍານອັນຕະລາຍຜ່ານການຫຼິ້ນ." }, // TODO-LO-REVIEW
      { kicker: "ຜູ້ຊ່ວຍ AI", title: "ຖາມກ່ອນລົງມື", body: "ໄວໜຸ່ມ ແລະ ຜູ້ໃຫຍ່ສາມາດຖາມ Sati AI ວ່າຂໍ້ສະເໜີ, ລິ້ງ ຫຼື ຂໍ້ຄວາມປອດໄພບໍ — ເປັນພາສາລາວ ຫຼື ອັງກິດ." }, // TODO-LO-REVIEW
    ],
    agesEyebrow: "ໃຜກຳລັງຫຼິ້ນ?",
    agesTitleA: "ໄວໜຸ່ມ",
    agesTitleB: "ຄືຫົວໃຈ —",
    agesTitleC: "ຄອບຄົວ ຢູ່ອ້ອມຂ້າງ",
    core: "ຫຼັກ",
    kids: { name: "ເດັກນ້ອຍ", band: "6–14 · ພາສາລາວເປັນຫຼັກ", body: "ໂພສຫຼອກລວງຈຳລອງແບບໂຕ້ຕອບ ແລະ ເກມຝຶກ 3 ເກມ." }, // TODO-LO-REVIEW
    youth: {
      name: "ໄວໜຸ່ມ", // TODO-LO-REVIEW
      band: "15–24 · ຫົວໃຈຂອງ Sati", // TODO-LO-REVIEW
      body: "ການຫຼອກລວງເລື່ອງວຽກ, ເງິນ, ຄວາມຮັກ ແລະ ແຮງງານ — ມີ AI ແຊັດ ແລະ 5 ເກມປະຈຳວັນ.", // TODO-LO-REVIEW
      chips: ["AI ແຊັດ", "5 ເກມ", "ຟີດຊຸມຊົນ"], // TODO-LO-REVIEW
    },
    adults: { name: "ຜູ້ໃຫຍ່", band: "25–59 · ຜູ້ປົກປ້ອງ", body: "ຊ່ວຍພໍ່ແມ່ປົກປ້ອງໄວໜຸ່ມໃນບ້ານ." }, // TODO-LO-REVIEW
    elders: { name: "ຜູ້ສູງອາຍຸ", band: "60+ · ໂໝດງ່າຍ", body: "ຕົວໜັງສືໃຫຍ່, ປຸ່ມໜ້ອຍ: ເລື່ອງເງິນ, ຄວາມໄວ້ໃຈ ແລະ ພື້ນຖານອິນເຕີເນັດ." }, // TODO-LO-REVIEW
    statLabels: ["ຜູ້ໃຊ້ທີ່ເຄື່ອນໄຫວ", "ໂພສທີ່ກວດແລ້ວ", "ການຫຼອກລວງທີ່ຖືກແຈ້ງ", "ຜູ້ຊ່ຽວຊານຢືນຢັນ"], // TODO-LO-REVIEW
    safetyEyebrow: "ຄວາມປອດໄພ ແລະ ຄວາມເປັນສ່ວນຕົວ",
    safetyTitle: "Sati ປ້ອງກັນອັນຕະລາຍກ່ອນມັນເກີດຂຶ້ນແນວໃດ", // TODO-LO-REVIEW
    safetySub: "AI ຈັບຄວາມສ່ຽງ. ຄົນຍັງເປັນຜູ້ຄວບຄຸມ.", // TODO-LO-REVIEW
    detect: {
      tag: "ກວດຈັບ", // TODO-LO-REVIEW
      title: "ກວດຈັບຄວາມສ່ຽງດ້ວຍ AI",
      rows: [
        { t: "ຮູບແບບພາສາຫຼອກລວງ", s: "ຈັບຄຳທີ່ນັກຫຼອກລວງໃຊ້" }, // TODO-LO-REVIEW
        { t: "ປະໂຫຍກຊັກຊວນການຄ້າມະນຸດ", s: "ວຽກປອມ, ການເດີນທາງ ແລະ ກັບດັກໜີ້ສິນ" }, // TODO-LO-REVIEW
        { t: "ລິ້ງ ແລະ ເນື້ອຫາອັນຕະລາຍ", s: "ກວດ URL ແລະ ໝວດທີ່ມີຄວາມສ່ຽງ" }, // TODO-LO-REVIEW
        { t: "ແຈ້ງເຕືອນຄວາມສ່ຽງສູງ", s: "ສົ່ງກໍລະນີຮ້າຍແຮງໃຫ້ຜູ້ຊ່ຽວຊານ" }, // TODO-LO-REVIEW
      ],
    },
    protect: {
      tag: "ປົກປ້ອງ", // TODO-LO-REVIEW
      title: "ຄວາມເປັນສ່ວນຕົວ ແລະ ຄວາມປອດໄພ",
      rows: [
        { t: "ເບີໂທ ແລະ ບັດປະຈຳຕົວເປັນຄວາມລັບ", s: "ບໍ່ສະແດງຕໍ່ສາທາລະນະ" }, // TODO-LO-REVIEW
        { t: "ກິດຈະກຳບໍ່ເປີດເຜີຍຕົວຕົນ", s: "ການກະທຳຂອງເຈົ້າບໍ່ຖືກສະແດງໃນຟີດ" }, // TODO-LO-REVIEW
        { t: "ຂໍ້ມູນສະຖານທີ່ຈຳກັດ", s: "ສະຖານທີ່ອ່ອນໄຫວໄດ້ຮັບການປົກປ້ອງ" }, // TODO-LO-REVIEW
        { t: "ຄົນເປັນຜູ້ຕັດສິນສຸດທ້າຍ", s: "ຜູ້ຊ່ຽວຊານຢືນຢັນທຸກໂພສທີ່ຖືກແຈ້ງ" }, // TODO-LO-REVIEW
      ],
    },
    flow: [
      { t: "ມີຄົນໂພສ", s: "ຂໍ້ສະເໜີວຽກ, ລິ້ງ ຫຼື ຂໍ້ຄວາມ" }, // TODO-LO-REVIEW
      { t: "AI ກວດໃນບໍ່ເທົ່າໃດວິນາທີ", s: "ສະແກນ 17 ຈຸດຫາສັນຍານຫຼອກລວງ" }, // TODO-LO-REVIEW
      { t: "ຜູ້ຊ່ຽວຊານຢືນຢັນ", s: "ຄົນຕັດສິນພາຍໃນ 48 ຊົ່ວໂມງ" }, // TODO-LO-REVIEW
      { t: "ທຸກຄົນໄດ້ຮັບການເຕືອນ", s: "ຂຽວ, ເຫຼືອງ ຫຼື ແດງ ເທິງໂພສ" }, // TODO-LO-REVIEW
    ],
    ctaEyebrow: "ຜົນກະທົບ",
    ctaTitleA: "ເບິ່ງຕົວເລກ",
    ctaTitleB: "ແລະ ລົງມືເຮັດ",
    ctaBody: "ການຄ້າມະນຸດກຳລັງເກີດຂຶ້ນກັບໄວໜຸ່ມໃນລາວດຽວນີ້. ທຸກການກວດ, ທຸກການແບ່ງປັນ ແລະ ທຸກການລາຍງານ ຊ່ວຍຢຸດກໍລະນີຕໍ່ໄປ.", // TODO-LO-REVIEW
    ctaImpact: "ເບິ່ງຜົນກະທົບຂອງພວກເຮົາ", // TODO-LO-REVIEW
    ctaFeedback: "ໃຫ້ຄຳຕິຊົມ", // TODO-LO-REVIEW
    actions: [
      { t: "ກວດ", s: "ໂພສທີ່ໜ້າສົງໄສ" }, // TODO-LO-REVIEW
      { t: "ແບ່ງປັນ", s: "ກັບຄອບຄົວ" }, // TODO-LO-REVIEW
      { t: "ລາຍງານ", s: "ໄປທີ່ 1533 ຫຼື 1191" }, // TODO-LO-REVIEW
    ],
    statsTitle: "ການຄ້າມະນຸດໃນລາວ", // TODO-LO-REVIEW
    statsCases: "ຄະດີໃໝ່",
    statsVictims: "ຜູ້ຖືກເຄາະຮ້າຍ",
    statsUnder18: "ອາຍຸຕ່ຳກວ່າ 18 ປີ",
    statsSource: "ແຫຼ່ງຂໍ້ມູນ: ຄະນະກຳມະການແຫ່ງຊາດຕ້ານການຄ້າມະນຸດ, ມັງກອນ 2025", // TODO-LO-REVIEW
  },
  comingSoon: {
    title: "ໜ້ານີ້ກຳລັງຖືກສ້າງໃໝ່", // TODO-LO-REVIEW
    body: "ກະລຸນາກັບມາໃໝ່ໄວໆນີ້.", // TODO-LO-REVIEW
    back: "ກັບໄປໜ້າຫຼັກ", // TODO-LO-REVIEW
  },
};
