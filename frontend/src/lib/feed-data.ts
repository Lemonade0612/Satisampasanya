import imgBcel from "/images/image_2.png";
import imgApk from "/images/image_2_apk.png";
import imgPhoneScam from "/images/image-13.png";
import imgTraffickingVideo from "/images/image-11.png";
import imgLaoPost from "/images/Screenshot_2026-07-19_at_14.05.21.png";
import imgTraffickingPoster from "/images/image-10.png";
import imgTruck from "/images/image-12.png";
import imgTiktokScam from "/images/image-14.png";
import type { Author, Post } from "../types";

export const AUTHORS: Record<string, Author> = {
  sara:  { name: "Sarak Sivilay",   handle: "@sarak_s",   initials: "SS", color: "#5B21D1", points: 1240 },
  kham:  { name: "Khamla Vongsa",   handle: "@khamla_v",  initials: "KV", color: "#2563EB", points: 820  },
  admin: { name: "Sati Team",       handle: "@sati_team", initials: "ST", color: "#16A34A", points: 9999 },
  boun:  { name: "Bounmy Thao",     handle: "@bounmy_t",  initials: "BT", color: "#DB2777", points: 210  },
  naly:  { name: "Naly Phommasack", handle: "@naly_ph",   initials: "NP", color: "#EA580C", points: 340  },
  phone: { name: "Phonesavanh K.",  handle: "@phsavanh",  initials: "PK", color: "#0891B2", points: 590  },
  malee: { name: "Malee Souphanh",  handle: "@malee_sp",  initials: "MS", color: "#7C3AED", points: 430  },
};

export const INITIAL_POSTS: Post[] = [
  {
    id: "p1", author: AUTHORS.sara,
    content: 'WARNING: Fake "BCEL Bank" WhatsApp message asking you to verify your account. The number +856 20 97 386 532 is NOT BCEL. Do not click any links or share your OTP. Screenshot attached — save and share.',
    contentLo: 'ຄຳເຕືອນ: ຂໍ້ຄວາມ WhatsApp ປອມ "BCEL Bank" ຮຽກໃຫ້ຢືນຢັນບັນຊີ. ເບີ +856 20 97 386 532 ບໍ່ແມ່ນ BCEL. ຢ່າກົດລິ້ງ ຫຼື ແຊຣ໌ OTP ຂອງທ່ານ.',
    tags: ["OnlineScam", "PhishingAlert"], timestamp: "2h", state: "confirmed",
    likes: 847, comments: 92, reposts: 431, warnedMe: 203,
    points: 50, featuredPoints: true,
    image: imgBcel,
  },
  {
    id: "p2", author: AUTHORS.kham,
    content: 'SCAM ALERT: Someone sent me a WhatsApp message with a "LaoKYC.apk" file to download. This is malware — it steals banking apps and contacts. The sender pretended to be from a government agency. DO NOT install any APK from WhatsApp.',
    contentLo: 'ການຫຼອກລວງ: ມີຄົນສົ່ງໄຟລ "LaoKYC.apk" ຜ່ານ WhatsApp. ນີ້ແມ່ນ malware — ລັກຂໍ້ມູນ banking ແລະ ລາຍຊື່ຜູ້ຕິດຕໍ່. ຢ່າຕິດຕັ້ງ APK ຈາກ WhatsApp.',
    tags: ["OnlineScam", "DigitalSafety"], timestamp: "5h", state: "flagged",
    likes: 34, comments: 8, reposts: 12, warnedMe: 19,
    flagReason: "APK malware claims need source verification before amplification. Expert reviewing — usually within 48h.",
    flagReasonLo: "ຄຳອ້າງກ່ຽວກັບ malware ຕ້ອງການການຢືນຢັນ. ຜູ້ຊ່ຽວຊານກຳລັງກວດສອບ — ພາຍໃນ 48 ຊ.ມ.",
    image: imgApk,
  },
  {
    id: "p3", author: AUTHORS.admin,
    content: "How phone scams in Laos work — recognize the signs:\n\n• Product offers that sound too good to be true\n• Unsolicited calls from government agencies or big companies\n• Asking for personal info or threatening harm if you don't comply\n\nHow to protect yourself: End the call. Block the number. Never click links in messages. Never wire money to a stranger.",
    contentLo: "ວິທີການຫຼອກລວງທາງໂທລະສັບໃນລາວ:\n\n• ສະເໜີສິນຄ້າທີ່ດີເກີນຈິງ\n• ໂທຫາໂດຍໄຮ້ນັດໝາຍຈາກໜ່ວຍງານລັດ\n• ຮຽກຂໍ້ມູນສ່ວນຕົວ ຫຼື ຂູ່ຮ້າຍ\n\nວິທີປ້ອງກັນ: ວາງສາຍ. ບ໋ອກເບີ. ຢ່າກົດລິ້ງ. ຢ່າໂອນເງິນໃຫ້ຄົນແປກໜ້າ.",
    tags: ["OnlineScam", "PhishingAlert", "DigitalSafety"], timestamp: "1d", state: "confirmed",
    likes: 2341, comments: 187, reposts: 1204, warnedMe: 891,
    points: 75, featuredPoints: false, isNews: true,
    image: imgPhoneScam,
  },
  {
    id: "p4", author: AUTHORS.boun,
    content: "A TikTok video showing a chained woman in China went viral — she is one of thousands trafficked for forced marriage and labour. This happens to Lao women too. If someone offers you a job or marriage in China without meeting in person first, report it immediately: 1800 (Lao anti-trafficking hotline).",
    contentLo: "ວິດີໂອ TikTok ສະແດງຜູ້ຍິງຖືກຕ່ວນໃນຈີນ — ນາງແມ່ນໜຶ່ງໃນຫຼາຍພັນຄົນທີ່ຖືກຄ້າ. ນີ້ເກີດຂຶ້ນກັບຜູ້ຍິງລາວດ້ວຍ. ຖ້າໃຜສະເໜີວຽກ ຫຼື ການແຕ່ງງານໃນຈີນໂດຍບໍ່ໄດ້ພົບກ່ອນ, ລາຍງານທັນທີ: 1800.",
    tags: ["Trafficking", "BorderSafety"], timestamp: "3h", state: "sla",
    likes: 156, comments: 43, reposts: 89, warnedMe: 74,
    hasVideo: true,
    image: imgTraffickingVideo,
  },
  {
    id: "p5", author: AUTHORS.naly,
    content: "Reporting scams to the Lao cybercrime police is pointless. They just warn the scammer and nothing happens. Don't bother — just warn friends directly.",
    contentLo: "ການລາຍງານການຫຼອກລວງໃຫ້ຕຳຫຼວດອາຊະຍາກຳໄຊເບີລາວແມ່ນໄຮ້ປະໂຫຍດ. ພວກເຂົາພຽງແຕ່ເຕືອນຜູ້ຫຼອກລວງ. ຢ່າເສຍເວລາ.",
    tags: ["DigitalSafety"], timestamp: "8h", state: "false",
    likes: 12, comments: 5, reposts: 3, warnedMe: 0,
    correction: "Lao cybercrime police do file and act on reports. Report at cybercrime.gov.la or call 021-212-516. Filings compile evidence to identify and dismantle scam networks.",
    correctionLo: "ຕຳຫຼວດອາຊະຍາກຳໄຊເບີລາວຮັບ ແລະ ດຳເນີນການ. ລາຍງານທີ່ cybercrime.gov.la ຫຼື 021-212-516.",
    image: imgLaoPost,
  },
  {
    id: "p6", author: AUTHORS.phone,
    content: "This Facebook post in Lao is spreading dangerous misinformation about border crossing. The post claims it's safe to cross with a broker — it is NOT. This is how trafficking starts. Shared as a WARNING, not an endorsement.",
    contentLo: "ໂພສ Facebook ນີ້ແຜ່ຂໍ້ມູນຜິດກ່ຽວກັບການຂ້າມຊາຍແດນ. ໂພສອ້າງວ່າການຂ້າມຜ່ານນາຍໜ້າປອດໄພ — ບໍ່ປອດໄພ. ນີ້ແມ່ນຈຸດເລີ່ມຕົ້ນຂອງການຄ້າມະນຸດ. ແຊຣ໌ເພື່ອເຕືອນ.",
    tags: ["Trafficking", "SocialMedia"], timestamp: "1h", state: "clean",
    likes: 67, comments: 14, reposts: 38, warnedMe: 29,
  },
  {
    id: "p7", author: AUTHORS.malee,
    content: "Human trafficking takes many forms — sexual exploitation, forced labor, child trafficking, forced marriage, organ trafficking. Know the signs. The Church and NGOs in Laos offer free support. #TogetherAgainstHumanTrafficking",
    contentLo: "ການຄ້າມະນຸດມີຫຼາຍຮູບແບບ — ການຂູດຮີດທາງເພດ, ແຮງງານບັງຄັບ, ການຄ້າເດັກ, ການແຕ່ງງານບັງຄັບ, ການຄ້າອະໄວຍະວະ. ຮູ້ຈັກສັນຍານ. NGO ໃນລາວໃຫ້ການຊ່ວຍເຫຼືອຟຣີ.",
    tags: ["Trafficking", "BorderSafety"], timestamp: "4h", state: "confirmed",
    likes: 312, comments: 28, reposts: 145, warnedMe: 118,
    points: 40, featuredPoints: false,
    image: imgTraffickingPoster,
  },
  {
    id: "p8", author: AUTHORS.kham,
    content: "FOUND IN A TRUCK: This photo shows people smuggled in a truck container on the Lao-Thai border. If you see suspicious vehicles, call 1800 or the police immediately. Do not engage the traffickers.",
    contentLo: "ພົບໃນລົດບັນທຸກ: ຮູບນີ້ສະແດງຄົນທີ່ຖືກລັກລອບຂ້າມຊາຍແດນ. ຖ້າເຫັນລົດໜ້າສົງໄສ, ໂທ 1800 ທັນທີ.",
    tags: ["Trafficking", "BorderSafety"], timestamp: "6h", state: "confirmed",
    likes: 523, comments: 61, reposts: 287, warnedMe: 201,
    points: 45, featuredPoints: true,
    image: imgTruck,
  },
  {
    id: "p9", author: AUTHORS.phone,
    content: "TikTok scam: 'Joybuy' pop-ups appearing in videos promise prizes if you click. This is a phishing page — it collects your phone number and payment details. If you see this popup while watching TikTok, close it immediately.",
    contentLo: "ການຫຼອກລວງ TikTok: ປ໊ອບອັບ 'Joybuy' ສັນຍາລາງວັນຖ້າກົດ. ນີ້ແມ່ນໜ້າ phishing — ເກັບເບີໂທ ແລະ ຂໍ້ມູນການຊຳລະ. ຖ້າເຫັນ popup ນີ້, ປິດທັນທີ.",
    tags: ["OnlineScam", "SocialMedia"], timestamp: "30m", state: "clean",
    likes: 89, comments: 17, reposts: 52, warnedMe: 41,
    hasVideo: true,
    image: imgTiktokScam,
  },
  {
    id: "p10", author: AUTHORS.admin,
    content: "BREAKING: 924 Indian nationals rescued from Golden Triangle SEZ in Laos. Trafficked workers forced into cyber-scam operations. This mirrors what happens to Lao citizens too. Read the full RFA report for details on how trafficking networks operate in the region.",
    contentLo: "ຂ່າວດ່ວນ: 924 ຄົນອິນເດຍຖືກຊ່ອຍຈາກເຂດສີ່ເຫຼົ່າສາມຫຼ່ຽມຄຳໃນລາວ. ແຮງງານທີ່ຖືກຄ້າຖືກບັງຄັບເຮັດວຽກ scam ໄຊເບີ. ນີ້ຄ້າຍຄືກັບສິ່ງທີ່ເກີດຂຶ້ນກັບພົນລະເມືອງລາວ. ອ່ານບົດລາຍງານ RFA ສົມບູນ.",
    tags: ["Trafficking", "BorderSafety", "DigitalSafety"], timestamp: "30m", state: "confirmed",
    likes: 1240, comments: 187, reposts: 892, warnedMe: 654,
    points: 60, featuredPoints: true, isNews: true,
    link: "https://www.rfa.org/lao/daily/southeastasia/924-indian-nationals-rescured-from-golden-triangle-sez-01302025003502.html",
  },
];
