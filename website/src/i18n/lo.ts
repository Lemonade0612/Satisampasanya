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
    appStoreSmall: "ດາວໂຫຼດຈາກ", // TODO-LO-REVIEW
    appStore: "App Store",
    playSmall: "ຮັບໄດ້ທີ່", // TODO-LO-REVIEW
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
  // TODO-LO-REVIEW: every line below that has no design source is an AI draft.
  about: {
    crumb: "ໜ້າຫຼັກ / ກ່ຽວກັບພວກເຮົາ", // TODO-LO-REVIEW
    h1a: "ແນວຄິດທີ່ເລີ່ມຕົ້ນ", // TODO-LO-REVIEW
    h1b: "ຈາກ",
    h1c: "ໄວໜຸ່ມລາວ",
    h1d: ".",
    tagline: "ສະຕິສຳປະຊັນຍະ — ມີສະຕິ ແລະ ຮູ້ຕົວຢູ່ສະເໝີ",
    lead: "ສະຕິສຳປະຊັນຍະ ໝາຍເຖິງ ການມີສະຕິ ແລະ ຮູ້ຕົວຢ່າງຊັດເຈນ. ພວກເຮົາເຫັນໝູ່ເພື່ອນຖືກດຶງເຂົ້າສູ່ຂໍ້ສະເໜີວຽກປອມ ແລະ ກັບດັກອອນລາຍ — ຈຶ່ງສ້າງບ່ອນທີ່ໄວໜຸ່ມຢຸດຄິດ, ກວດສອບ ແລະ ເບິ່ງແຍງກັນ.", // TODO-LO-REVIEW
    logoAlt: "ໂລໂກ້ Satisampasanya",
    roadmapEyebrow: "ເສັ້ນທາງຂອງ ສະຕິ",
    roadmapTitle: "ແຜນທີ່ເສັ້ນທາງຂອງ Sati", // TODO-LO-REVIEW
    roadmapLead: "ຫ້າຂັ້ນຕອນຈາກແນວຄິດນັກສຶກສາສູ່ການເປີດໂຕ — ແລະ ຂັ້ນຕໍ່ໄປກຳລັງລໍຖ້າ.", // TODO-LO-REVIEW
    addPhoto: "ເພີ່ມຮູບ", // TODO-LO-REVIEW
    done: "ສຳເລັດ", // TODO-LO-REVIEW
    now: "ຕອນນີ້", // TODO-LO-REVIEW
    next: "ຕໍ່ໄປ", // TODO-LO-REVIEW
    tMinus: "ກ່ອນເປີດ: ເປົ້າໝາຍຕໍ່ໄປ", // TODO-LO-REVIEW
    compareEyebrow: "ເປັນຫຍັງ Sati", // TODO-LO-REVIEW
    compareTitle: "ໂພສດຽວກັນ. ສອງຜົນລັບທີ່ແຕກຕ່າງ.", // TODO-LO-REVIEW
    compareLead: "ປະກາດວຽກຕ່າງປະເທດປອມ ທີ່ເຫັນໃນໂຊຊຽວມີເດຍທຸກມື້ນີ້ — ແລະ ທີ່ເຫັນໃນ Sati.", // TODO-LO-REVIEW
    today: "ໂຊຊຽວມີເດຍທຸກມື້ນີ້", // TODO-LO-REVIEW
    onSati: "ໃນ Sati",
    agency: "ບໍລິສັດຈັດຫາງານທົ່ວໂລກ", // TODO-LO-REVIEW
    sponsored: "ໂຄສະນາ · 2 ຊມ.", // TODO-LO-REVIEW
    postText: "ຮັບສະໝັກດ່ວນ! ວຽກຕ່າງປະເທດ ເງິນເດືອນ 15,000,000 ກີບ/ເດືອນ ບໍ່ຕ້ອງມີປະສົບການ",
    banner: "$$$ ເຮັດວຽກຕ່າງປະເທດ", // TODO-LO-REVIEW
    likes: "♥ 2.4K",
    comments: "1.1K ຄຳເຫັນ", // TODO-LO-REVIEW
    shares: "↗ 860 ແບ່ງປັນ", // TODO-LO-REVIEW
    noWarning: "ບໍ່ມີການເຕືອນ. ລະບົບຍັງສົ່ງມັນໄປຫາຄົນຫຼາຍຂຶ້ນ.", // TODO-LO-REVIEW
    verdict: "ແດງ · ອາດເປັນການຫຼອກລວງຄ້າມະນຸດ", // TODO-LO-REVIEW
    checks: "ກວດແລ້ວ 17/17 ຈຸດ", // TODO-LO-REVIEW
    flags: ["ເງິນເດືອນສູງເກີນຈິງ ທັງທີ່ບໍ່ມີປະສົບການ", "ກົດດັນໃຫ້ຟ້າວ — “ທີ່ນັ່ງຈຳກັດ”", "ຂໍໃຫ້ຍ້າຍໄປຄຸຍສ່ວນຕົວ", "ບໍລິສັດບໍ່ຢູ່ໃນທະບຽນທາງການ"], // TODO-LO-REVIEW
    verified: "✓ ຜູ້ຊ່ຽວຊານຢືນຢັນ · 6 ຊມ.", // TODO-LO-REVIEW
    callHelp: "ໂທ 1300 ເພື່ອຂໍຄວາມຊ່ວຍເຫຼືອ →", // TODO-LO-REVIEW
    stats: [
      { n: "17", l: "ກວດສອບຈາກ AI 17 ຈຸດ" },
      { n: "48h", l: "ຢືນຢັນຈາກຜູ້ຊ່ຽວຊານ ພາຍໃນ 48 ຊົ່ວໂມງ" },
      { n: "3", l: "ລິ້ງປອມ, ເບີໂທ, ບັນຊີມ້າ" },
    ],
    whoEyebrow: "ພວກເຮົາແມ່ນໃຜ", // TODO-LO-REVIEW
    who1: "ພວກເຮົາເຫັນບັນຫາ. ພວກເຮົາຮູ້ສຶກເຖິງຄວາມເສຍຫາຍ.", // TODO-LO-REVIEW
    who2a: "ແຕ່ມີສຽງຂອງໄວໜຸ່ມຈັກຄົນທີ່ ", // TODO-LO-REVIEW
    who2b: "ບໍ່ມີຄົນໄດ້ຍິນ ແລະ ສູນຫາຍ", // TODO-LO-REVIEW
    who2c: "?",
    who3a: "ຖ້າໄວໜຸ່ມມີເຄື່ອງມືທີ່ຈະ ", // TODO-LO-REVIEW
    who3b: "ນຳທາງ", // TODO-LO-REVIEW
    who3c: "ແດ່?", // TODO-LO-REVIEW
    whoBrand: "Satisampasanya",
    whoText: " ປ່ຽນຄວາມຮູ້ເທົ່າທັນເປັນການກະທຳ ແລະ ສຽງຂອງໄວໜຸ່ມເປັນການປ່ຽນແປງ. ພວກເຮົາແມ່ນໄວໜຸ່ມທີ່ຮູ້ຈັກບັນຫາຂອງໄວໜຸ່ມ — ເພາະພວກເຮົາໃຊ້ຊີວິດຢູ່ກັບມັນ. ຮ່ວມກັນສ້າງມື້ອື່ນທີ່ປອດໄພກວ່າ, ຄັ້ງລະຊຸມຊົນ.", // TODO-LO-REVIEW
    team: [
      { name: "Phoumiphon Keomisy (Lemon)", role: "ຜູ້ຮ່ວມອອກແບບ · AI, ຄວາມເປັນສ່ວນຕົວ ແລະ ຜະລິດຕະພັນ" }, // TODO-LO-REVIEW
      { name: "Kanlaya Xaiyaphet", role: "ຜູ້ຮ່ວມນຳສະເໜີ · ບັນຫາ ແລະ ນະໂຍບາຍ" }, // TODO-LO-REVIEW
    ],
  },
  impact: {
    crumb: "ໜ້າຫຼັກ / ຜົນກະທົບ", // TODO-LO-REVIEW
    h1a: "ເບິ່ງຕົວເລກ.",
    h1b: "ລົງມືເຮັດ.",
    lead: "ຕົວເລກຈິງຈາກແອັບ Sati ແລະ ແຫຼ່ງທາງການ — ພ້ອມສິ່ງງ່າຍໆທີ່ເຈົ້າເຮັດໄດ້ມື້ນີ້.", // TODO-LO-REVIEW
    liveTitle: "ໂພສທີ່ກວດແລ້ວ · ສົດ", // TODO-LO-REVIEW
    live: "● ສົດ", // TODO-LO-REVIEW
    flagged: "ຖືກແຈ້ງສີແດງ", // TODO-LO-REVIEW
    verified: "ຢືນຢັນພາຍໃນ 48 ຊມ.", // TODO-LO-REVIEW
    numbersEyebrow: "Sati ໃນຕົວເລກ", // TODO-LO-REVIEW
    numCards: [
      { t: "ຜູ້ໃຊ້ທີ່ລົງທະບຽນ", s: "ຄົບ 4 ກຸ່ມອາຍຸ" }, // TODO-LO-REVIEW
      { t: "ໂພສທີ່ AI ກວດແລ້ວ", s: "ນັບຕັ້ງແຕ່ເປີດໂຕ" }, // TODO-LO-REVIEW
      { t: "ເກມທີ່ຫຼິ້ນແລ້ວ", s: "Sati Daily" }, // TODO-LO-REVIEW
      { t: "ຜູ້ຊ່ຽວຊານທີ່ຢືນຢັນ", s: "ສຳຮອງ 48 ຊົ່ວໂມງ" }, // TODO-LO-REVIEW
    ],
    chartTitle: "Sati ໃນການເຮັດວຽກ", // TODO-LO-REVIEW
    chartNote: "ຂໍ້ມູນຕົວຢ່າງ, ໃຫ້ປ່ຽນເປັນຕົວເລກຈິງ", // TODO-LO-REVIEW
    tabPosts: "ໂພສຕໍ່ເດືອນ", // TODO-LO-REVIEW
    tabResults: "ຜົນການກວດໂພສ", // TODO-LO-REVIEW
    prevMonths: "ເດືອນກ່ອນ", // TODO-LO-REVIEW
    thisMonth: "ເດືອນນີ້", // TODO-LO-REVIEW
    months: ["ມ.ຖ.", "ກ.ລ.", "ສ.ຫ.", "ກ.ຍ.", "ຕ.ລ.", "ພ.ຈ."], // TODO-LO-REVIEW
    posts: "ໂພສ",
    green: "ຂຽວ · ປອດໄພ", // TODO-LO-REVIEW
    yellow: "ເຫຼືອງ · ລະວັງ", // TODO-LO-REVIEW
    red: "ແດງ · ຫຼອກລວງ", // TODO-LO-REVIEW
    problemEyebrow: "ບັນຫາໃນລາວ · 2024", // TODO-LO-REVIEW
    problem: ["ຄະດີໃໝ່", "ຜູ້ຖືກເຄາະຮ້າຍ", "ອາຍຸຕ່ຳກວ່າ 18 ປີ"],
    source: "ແຫຼ່ງຂໍ້ມູນ: ຄະນະກຳມະການແຫ່ງຊາດຕ້ານການຄ້າມະນຸດ, ມັງກອນ 2025", // TODO-LO-REVIEW
    actionEyebrow: "ລົງມືເຮັດ", // TODO-LO-REVIEW
    actionTitle: "ສາມຢ່າງທີ່ເຈົ້າເຮັດໄດ້ມື້ນີ້", // TODO-LO-REVIEW
    actions: [
      { t: "ກວດກ່ອນເຊື່ອ", b: "ໂພສຂໍ້ສະເໜີທີ່ໜ້າສົງໄສໃນ Sati ແລ້ວຮັບຜົນ ຂຽວ, ເຫຼືອງ ຫຼື ແດງ.", c: "ເປີດແອັບ →" }, // TODO-LO-REVIEW
      { t: "ແບ່ງປັນກັບຄອບຄົວ", b: "ເຊີນນ້ອງ, ພໍ່ແມ່ ຫຼື ພໍ່ເຖົ້າແມ່ເຖົ້າ — ມີໂໝດສຳລັບທຸກຄົນ.", c: "ເຊີນໃຜຜູ້ໜຶ່ງ →" }, // TODO-LO-REVIEW
      { t: "ລາຍງານ ແລະ ຂໍຄວາມຊ່ວຍເຫຼືອ", b: "ໂທສາຍດ່ວນທາງການ ຖ້າເຈົ້າ ຫຼື ຄົນທີ່ເຈົ້າຮູ້ຈັກມີຄວາມສ່ຽງ.", c: "ເບິ່ງສາຍດ່ວນ →" }, // TODO-LO-REVIEW
    ],
    hot1: "ສູນຕ້ານການສໍ້ໂກງອອນລາຍ · ລາຍງານການຫຼອກລວງ", // TODO-LO-REVIEW
    hot2: "ສະຫະພັນແມ່ຍິງລາວ · 24/7", // TODO-LO-REVIEW
  },
  help: {
    crumb: "ໜ້າຫຼັກ / ຂໍຄວາມຊ່ວຍເຫຼືອ", // TODO-LO-REVIEW
    h1a: "ຄວາມຊ່ວຍເຫຼືອ ຢູ່ຫ່າງພຽງ ", // TODO-LO-REVIEW
    h1b: "ການໂທຄັ້ງດຽວ",
    h1c: ".", // TODO-LO-REVIEW
    tagline: "ເບີໂທສຸກເສີນ ແລະ ເອກະສານທາງການ",
    lead: "ເບີສຸກເສີນ ແລະ ລາຍງານທາງການຊຸດດຽວກັນກັບແທັບສຳຫຼວດໃນແອັບ Sati — ໂທຟຣີ, ອ່ານຟຣີ.", // TODO-LO-REVIEW
    callPolice: "ໂທຕຳຫຼວດ 1191", // TODO-LO-REVIEW
    readReports: "ອ່ານລາຍງານ →", // TODO-LO-REVIEW
    sos: "● SOS · ແຕະເພື່ອໂທ", // TODO-LO-REVIEW
    hotEyebrow: "ສາຍດ່ວນ",
    hotTitle: "ບັນທຶກເບີເຫຼົ່ານີ້ໄວ້", // TODO-LO-REVIEW
    hotLead: "ລາຍການດຽວກັບແທັບສາຍດ່ວນໃນແອັບ Sati. ແຕະປຸ່ມສີຂຽວເພື່ອໂທ.", // TODO-LO-REVIEW
    call: "ໂທ", // TODO-LO-REVIEW
    danger: "ຖ້າມີອັນຕະລາຍທັນທີ ໂທ 1191",
    offices: "ສຳນັກງານໃນນະຄອນຫຼວງວຽງຈັນ", // TODO-LO-REVIEW
    officesSub: "ຂໍຄວາມຊ່ວຍເຫຼືອດ້ວຍຕົນເອງ", // TODO-LO-REVIEW
    office1: "ສູນໃຫ້ຄຳປຶກສາ ສະຫະພັນແມ່ຍິງລາວ", // TODO-LO-REVIEW
    office2: "ກະຊວງແຮງງານ ແລະ ສະຫວັດດີການສັງຄົມ", // TODO-LO-REVIEW
    office3: "ຕຳຫຼວດທ່ອງທ່ຽວ, ວຽງຈັນ", // TODO-LO-REVIEW
    map: "ແຜນທີ່ ↗", // TODO-LO-REVIEW
    follow: "ຕິດຕາມ Sati", // TODO-LO-REVIEW
    followSub: "ແຈ້ງເຕືອນການຫຼອກລວງທຸກມື້ ເປັນພາສາລາວ ແລະ ອັງກິດ", // TODO-LO-REVIEW
    tips: [
      { t: "1 · ຢູ່ໃນບ່ອນປອດໄພ", b: "ຢ່າໄປພົບໃຜຄົນດຽວຈາກຂໍ້ສະເໜີອອນລາຍ." }, // TODO-LO-REVIEW
      { t: "2 · ເກັບຫຼັກຖານ", b: "ຖ່າຍພາບໜ້າຈໍຂໍ້ຄວາມ, ໂປຣໄຟລ໌ ແລະ ການຂໍໂອນເງິນ." }, // TODO-LO-REVIEW
      { t: "3 · ບອກຄົນທີ່ເຈົ້າໄວ້ໃຈ", b: "ພໍ່ແມ່, ຄູ ຫຼື ໝູ່ — ແລ້ວໂທສາຍດ່ວນ." }, // TODO-LO-REVIEW
    ],
    docsEyebrow: "ເອກະສານ",
    docsTitle: "ລາຍງານ ແລະ ຄູ່ມື", // TODO-LO-REVIEW
    filterLabel: "ກັ່ນຕອງເອກະສານ", // TODO-LO-REVIEW
    all: "ທັງໝົດ", // TODO-LO-REVIEW
    statsBadge: "ຕົວເລກຈາກລັດ · ປີ 2024",
    statsTitle: "ການຄ້າມະນຸດໃນລາວ", // TODO-LO-REVIEW
    open: "ເປີດ ↗", // TODO-LO-REVIEW
    mockSearch: "ຄົ້ນຫາ",
  },
  feedback: {
    crumb: "ໜ້າຫຼັກ / ຄຳຕິຊົມ", // TODO-LO-REVIEW
    h1a: "ຊ່ວຍພວກເຮົາເຮັດ", // TODO-LO-REVIEW
    h1b: "Sati ໃຫ້ດີຂຶ້ນ.", // TODO-LO-REVIEW
    tagline: "ຄຳຄິດເຫັນຂອງເຈົ້າ ມີຄວາມໝາຍສຳລັບພວກເຮົາ",
    lead: "ພົບບັກ, ການຫຼອກລວງທີ່ພວກເຮົາພາດ ຫຼື ໄອເດຍເກມໃໝ່? ບອກພວກເຮົາ — ທຸກຂໍ້ຄວາມຖືກອ່ານໂດຍທີມ.", // TODO-LO-REVIEW
    rate: "ມື້ນີ້ Sati ເປັນແນວໃດ?", // TODO-LO-REVIEW
    formTitle: "ສົ່ງຄຳຕິຊົມ", // TODO-LO-REVIEW
    formSub: "ພາສາລາວ ຫຼື ອັງກິດ — ແລ້ວແຕ່ເຈົ້າ.", // TODO-LO-REVIEW
    topicQ: "ກ່ຽວກັບເລື່ອງຫຍັງ? *", // TODO-LO-REVIEW
    topics: ["ໄອເດຍ", "ບັກ", "ການຫຼອກລວງທີ່ພາດ", "ເກມ", "ອື່ນໆ"], // TODO-LO-REVIEW
    name: "ຊື່ (ບໍ່ບັງຄັບ)", // TODO-LO-REVIEW
    namePh: "ຊື່ຂອງເຈົ້າ", // TODO-LO-REVIEW
    age: "ກຸ່ມອາຍຸ", // TODO-LO-REVIEW
    ages: ["ໄວໜຸ່ມ 15–24", "ເດັກນ້ອຍ 6–14", "ຜູ້ໃຫຍ່ 25–59", "ຜູ້ສູງອາຍຸ 60+"], // TODO-LO-REVIEW
    email: "ອີເມລ (ບໍ່ບັງຄັບ, ຖ້າຢາກໃຫ້ຕອບກັບ)", // TODO-LO-REVIEW
    msg: "ຂໍ້ຄວາມຂອງເຈົ້າ *", // TODO-LO-REVIEW
    msgPh: "ບອກພວກເຮົາວ່າເກີດຫຍັງຂຶ້ນ ຫຼື ຢາກເຫັນຫຍັງ… ໃຊ້ແຖບເຄື່ອງມືສຳລັບຕົວໜາ, ລາຍການ ຫຼື ລິ້ງ.", // TODO-LO-REVIEW
    bold: "ຕົວໜາ", // TODO-LO-REVIEW
    italic: "ຕົວອຽງ", // TODO-LO-REVIEW
    underline: "ຂີດກ້ອງ", // TODO-LO-REVIEW
    bullets: "ລາຍການຫົວຂໍ້ຍ່ອຍ", // TODO-LO-REVIEW
    numbers: "ລາຍການລຽງເລກ", // TODO-LO-REVIEW
    link: "ລິ້ງ", // TODO-LO-REVIEW
    linkPrompt: "ທີ່ຢູ່ລິ້ງ (https://…)", // TODO-LO-REVIEW
    attach: "ໄຟລ໌ແນບ (ບໍ່ບັງຄັບ)", // TODO-LO-REVIEW
    drop: "ລາກໄຟລ໌ມາວາງບ່ອນນີ້ ຫຼື", // TODO-LO-REVIEW
    browse: "ເລືອກໄຟລ໌", // TODO-LO-REVIEW
    dropHint: "ຮູບ, ວິດີໂອ, ພາບໜ້າຈໍ, PDF ຫຼື ໄຟລ໌ໃດກໍໄດ້ · ສູງສຸດ 5 ໄຟລ໌", // TODO-LO-REVIEW
    remove: "ລຶບ", // TODO-LO-REVIEW
    consent: "ຂ້ອຍຍອມຮັບໃຫ້ Sati ນຳຄຳຕິຊົມນີ້ໄປປັບປຸງແອັບ. ພວກເຮົາບໍ່ແບ່ງປັນຂໍ້ມູນຂອງເຈົ້າ.", // TODO-LO-REVIEW
    send: "ສົ່ງຄຳຕິຊົມ →", // TODO-LO-REVIEW
    sending: "ກຳລັງສົ່ງ…", // TODO-LO-REVIEW
    okTitle: "ຂອບໃຈ!", // TODO-LO-REVIEW
    okBody: "ສົ່ງຄຳຕິຊົມຂອງເຈົ້າແລ້ວ. ທຸກຂໍ້ຄວາມຖືກອ່ານໂດຍທີມ.", // TODO-LO-REVIEW
    again: "ສົ່ງອີກອັນ", // TODO-LO-REVIEW
    eTopic: "ກະລຸນາເລືອກຫົວຂໍ້.", // TODO-LO-REVIEW
    eMsg: "ກະລຸນາຂຽນຂໍ້ຄວາມ.", // TODO-LO-REVIEW
    eMsgLong: "ຂໍ້ຄວາມຍາວເກີນໄປ (ສູງສຸດ 2000 ຕົວອັກສອນ).", // TODO-LO-REVIEW
    eEmail: "ກະລຸນາໃສ່ອີເມລທີ່ຖືກຕ້ອງ.", // TODO-LO-REVIEW
    eConsent: "ກະລຸນາຕິກຊ່ອງເພື່ອຍອມຮັບ.", // TODO-LO-REVIEW
    eFiles: "ແນບໄດ້ສູງສຸດ 5 ໄຟລ໌.", // TODO-LO-REVIEW
    eSend: "ສົ່ງບໍ່ໄດ້. ກະລຸນາລອງໃໝ່.", // TODO-LO-REVIEW
    contactEyebrow: "ຕິດຕໍ່", // TODO-LO-REVIEW
    contactTitle: "ຊ່ອງທາງອື່ນໃນການຕິດຕໍ່",
    wayEmail: "ອີເມລ", // TODO-LO-REVIEW
    wayFb: "Facebook",
    wayApp: "ໃນແອັບ", // TODO-LO-REVIEW
    wayAppVal: "ໂປຣໄຟລ໌ → ສົ່ງຄຳຕິຊົມ", // TODO-LO-REVIEW
    wayBased: "ຕັ້ງຢູ່", // TODO-LO-REVIEW
    wayBasedVal: "ນະຄອນຫຼວງວຽງຈັນ, ສປປ ລາວ", // TODO-LO-REVIEW
    dangerTitle: "ມີອັນຕະລາຍທັນທີບໍ?",
    dangerBody: "ຢ່າລໍຖ້າຄຳຕອບຂອງພວກເຮົາ. ໂທດຽວນີ້:", // TODO-LO-REVIEW
    police: "ຕຳຫຼວດ",
    womenKids: "ແມ່ຍິງ ແລະ ເດັກ", // TODO-LO-REVIEW
  },
  booking: {
    eyebrow: "ຈອງການພົບ", // TODO-LO-REVIEW
    title: "ເຊີນ Sati ມາໂຮງຮຽນ ຫຼື ຊຸມຊົນຂອງເຈົ້າ", // TODO-LO-REVIEW
    lead: "ຈອງການບັນຍາຍສ້າງຄວາມຮູ້ ຫຼື ການໂທຮັບຄຳຕິຊົມກັບທີມຟຣີ. ເລືອກວັນ ແລ້ວເລືອກເວລາ.", // TODO-LO-REVIEW
    steps: ["ເລືອກວັນ", "ເລືອກເວລາ", "ຢືນຢັນດ້ວຍອີເມລ"], // TODO-LO-REVIEW
    team: "ທີມ Satisampasanya", // TODO-LO-REVIEW
    cardTitle: "ການບັນຍາຍສ້າງຄວາມຮູ້ ຫຼື ການໂທຮັບຄຳຕິຊົມ", // TODO-LO-REVIEW
    min: "45 ນາທີ", // TODO-LO-REVIEW
    zoom: "Zoom ຫຼື ພົບໜ້າ", // TODO-LO-REVIEW
    loc: "ນະຄອນຫຼວງວຽງຈັນ, ສປປ ລາວ", // TODO-LO-REVIEW
    langs: "ລາວ / English",
    monthName: "ພະຈິກ", // TODO-LO-REVIEW
    monthShort: "ພ.ຈ.", // TODO-LO-REVIEW
    dayNames: ["ຈັນ", "ອັງ", "ພຸດ", "ພະ", "ສຸກ", "ເສົາ", "ອາທິດ"], // TODO-LO-REVIEW
    prev: "ເດືອນກ່ອນ", // TODO-LO-REVIEW
    next: "ເດືອນຕໍ່ໄປ", // TODO-LO-REVIEW
    avail: "ວ່າງ", // TODO-LO-REVIEW
    tz: "ເວລາອິນດູຈີນ (GMT+7)", // TODO-LO-REVIEW
    pick: "ເລືອກວັນທີ່ວ່າງເພື່ອເບິ່ງເວລາ.", // TODO-LO-REVIEW
    selected: "ທີ່ເລືອກ", // TODO-LO-REVIEW
    tap: "ແຕະເວລາ ແລ້ວຢືນຢັນດ້ວຍຊື່ ແລະ ອີເມລຂອງເຈົ້າ.", // TODO-LO-REVIEW
    confirmTitle: "ຢືນຢັນການຈອງ", // TODO-LO-REVIEW
    name: "ຊື່ຂອງເຈົ້າ", // TODO-LO-REVIEW
    email: "ອີເມລຂອງເຈົ້າ", // TODO-LO-REVIEW
    confirm: "ຢືນຢັນການຈອງ", // TODO-LO-REVIEW
    change: "ປ່ຽນເວລາ", // TODO-LO-REVIEW
    okTitle: "ສົ່ງຄຳຂໍແລ້ວ!", // TODO-LO-REVIEW
    okBody: "ພວກເຮົາຈະສົ່ງອີເມລເພື່ອຢືນຢັນ.", // TODO-LO-REVIEW
    eName: "ກະລຸນາໃສ່ຊື່.", // TODO-LO-REVIEW
    eEmail: "ກະລຸນາໃສ່ອີເມລທີ່ຖືກຕ້ອງ.", // TODO-LO-REVIEW
    eSend: "ສົ່ງບໍ່ໄດ້. ກະລຸນາລອງໃໝ່.", // TODO-LO-REVIEW
    example: "ຕາຕະລາງຕົວຢ່າງ, ຈະເຊື່ອມກັບປະຕິທິນຈິງ.", // TODO-LO-REVIEW
  },
  policies: {
    crumb: "ໜ້າຫຼັກ / ນະໂຍບາຍ", // TODO-LO-REVIEW
    h1a: "ນະໂຍບາຍ ແລະ ", // TODO-LO-REVIEW
    h1b: "ແນວທາງ", // TODO-LO-REVIEW
    lead: "Sati ປົກປ້ອງເຈົ້າແນວໃດ, ພວກເຮົາເຮັດຫຍັງກັບຂໍ້ມູນຂອງເຈົ້າ ແລະ ກົດທີ່ທຸກຄົນຍອມຮັບ. ອັບເດດຫຼ້າສຸດ:", // TODO-LO-REVIEW
    navLabel: "ຫົວຂໍ້ນະໂຍບາຍ", // TODO-LO-REVIEW
    datePlaceholder: "[ວັນທີ]", // TODO-LO-REVIEW
    questions: "ມີຄຳຖາມບໍ?", // TODO-LO-REVIEW
    privacy: {
      title: "ນະໂຍບາຍຄວາມເປັນສ່ວນຕົວ",
      sections: [
        { h: "ສິ່ງທີ່ພວກເຮົາເກັບ", p: "ຊື່ທີ່ສະແດງ, ກຸ່ມອາຍຸ, ພາສາທີ່ເລືອກ, ໂພສ ແລະ ຂໍ້ຄວາມທີ່ເຈົ້າແບ່ງປັນ ແລະ ຂໍ້ມູນການໃຊ້ງານພື້ນຖານທີ່ຈຳເປັນເພື່ອໃຫ້ແອັບເຮັດວຽກ." }, // TODO-LO-REVIEW
        { h: "ພວກເຮົາໃຊ້ມັນແນວໃດ", p: "ເພື່ອກວດໂພສຫາການຫຼອກລວງ ແລະ ເນື້ອຫາອັນຕະລາຍ, ສະແດງເນື້ອຫາທີ່ເໝາະກັບກຸ່ມອາຍຸ, ປັບປຸງເກມ ແລະ ຕອບຄຳຖາມຜ່ານ Sati AI." }, // TODO-LO-REVIEW
        { h: "ສິ່ງທີ່ພວກເຮົາບໍ່ເຮັດເດັດຂາດ", p: "ພວກເຮົາບໍ່ຂາຍຂໍ້ມູນ ຫຼື ແບ່ງປັນກັບຜູ້ໂຄສະນາ. ໂພສສາທາລະນະສະແດງສະເພາະຊື່ທີ່ສະແດງຂອງເຈົ້າ." }, // TODO-LO-REVIEW
        { h: "ທາງເລືອກຂອງເຈົ້າ", p: "ເຈົ້າສາມາດແກ້ໄຂ ຫຼື ລຶບໂພສ ແລະ ຂໍໃຫ້ລຶບບັນຊີໂດຍສົ່ງອີເມລຫາ satisampasanya@gmail.com." }, // TODO-LO-REVIEW
      ],
    },
    guidelines: {
      title: "ກົດລະບຽບຊຸມຊົນ",
      do: "ຄວນ", // TODO-LO-REVIEW
      doText: "ແບ່ງປັນຂໍ້ສະເໜີທີ່ໜ້າສົງໄສ, ຖາມຄຳຖາມ, ເຕືອນຄົນອື່ນ ແລະ ມີນ້ຳໃຈ.", // TODO-LO-REVIEW
      dont: "ບໍ່ຄວນ", // TODO-LO-REVIEW
      dontText: "ຂົ່ມເຫັງ, ໃຊ້ຄຳຫຍາບ, ໂພສເລື່ອງນອກຫົວຂໍ້ ຫຼື ການເມືອງ, ຫຼື ເປີດເຜີຍຂໍ້ມູນສ່ວນຕົວຂອງຜູ້ອື່ນ.", // TODO-LO-REVIEW
      closing: "ໂພສຖືກກວດໂດຍ Sati AI ແລະ ຜູ້ຊ່ຽວຊານ. ໂພສທີ່ຝ່າຝືນຖືກເຊື່ອງ ແລະ ການຝ່າຝືນຊ້ຳໆອາດເຮັດໃຫ້ບັນຊີຖືກລະງັບ.", // TODO-LO-REVIEW
    },
    terms: {
      title: "ເງື່ອນໄຂການນຳໃຊ້",
      p1: "Sati ໃຊ້ຟຣີ. ຜົນຈາກ Sati AI ແລະ ຜູ້ຊ່ຽວຊານແມ່ນຄຳແນະນຳເພື່ອໃຫ້ເຈົ້າລະວັງ — ບໍ່ແມ່ນຄຳປຶກສາທາງກົດໝາຍ. ໃນກໍລະນີສຸກເສີນ ໃຫ້ຕິດຕໍ່ເຈົ້າໜ້າທີ່ໂດຍກົງສະເໝີ.", // TODO-LO-REVIEW
      p2: "ເຈົ້າເປັນເຈົ້າຂອງສິ່ງທີ່ເຈົ້າໂພສ ແລະ ອະນຸຍາດໃຫ້ Sati ສະແດງໃນແອັບ. [ເພີ່ມກົດໝາຍທີ່ໃຊ້ບັງຄັບ ແລະ ເງື່ອນໄຂສົມບູນກ່ອນເປີດໂຕ.]", // TODO-LO-REVIEW
    },
    children: {
      title: "ເດັກນ້ອຍ ແລະ ຄອບຄົວ",
      p: "ກຸ່ມເດັກ (6–14) ບໍ່ມີ AI ແຊັດ — ເນັ້ນເກມຝຶກທີ່ປອດໄພ ແລະ ໂພສຫຼອກລວງຈຳລອງ, ພາສາລາວເປັນຫຼັກ. ພວກເຮົາແນະນຳໃຫ້ພໍ່ແມ່ຕັ້ງຄ່າແອັບຮ່ວມກັບລູກ.", // TODO-LO-REVIEW
    },
  },
  titles: {
    home: "Satisampasanya", // TODO-LO-REVIEW
    about: "ກ່ຽວກັບພວກເຮົາ — Satisampasanya", // TODO-LO-REVIEW
    impact: "ຜົນກະທົບ — Satisampasanya", // TODO-LO-REVIEW
    help: "ຂໍຄວາມຊ່ວຍເຫຼືອ — Satisampasanya", // TODO-LO-REVIEW
    feedback: "ຄຳຕິຊົມ — Satisampasanya", // TODO-LO-REVIEW
    policies: "ນະໂຍບາຍ — Satisampasanya", // TODO-LO-REVIEW
    notFound: "ບໍ່ພົບໜ້ານີ້ — Satisampasanya", // TODO-LO-REVIEW
  },
  comingSoon: {
    title: "ບໍ່ພົບໜ້ານີ້", // TODO-LO-REVIEW
    body: "ໜ້າທີ່ເຈົ້າຊອກຫາບໍ່ມີຢູ່.", // TODO-LO-REVIEW
    back: "ກັບໄປໜ້າຫຼັກ", // TODO-LO-REVIEW
  },
};
