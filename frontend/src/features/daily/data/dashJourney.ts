// Scam Dash routes: one per ASEAN country, landmarks ordered north to south (west to east for Indonesia).
// After the last stop the run loops back to the first stop, faster. Scenes are drawn as vectors so they stay sharp.
type T2 = { en: string; lo: string };

export type Terrain = 'hills' | 'karst' | 'peaks' | 'flat' | 'sea';
export type Trees = 'round' | 'palm' | 'pine' | 'city';
export type Scene = { sky: [string, string]; far: string; mid: string; grass: string; terrain: Terrain; trees: Trees; dusk?: boolean };
export type LandmarkKind =
  | 'temple' | 'palace' | 'stupa' | 'gate' | 'waterfall' | 'jars' | 'balloons' | 'khmer' | 'prang' | 'angkor'
  | 'pagoda' | 'pagodas' | 'onepillar' | 'citadel' | 'lanterns' | 'bridge' | 'city' | 'boat' | 'stilt' | 'twin'
  | 'clocktower' | 'terraces' | 'supertrees' | 'mbs' | 'beach' | 'monument' | 'borobudur' | 'volcano' | 'balitemple'
  | 'chocohills' | 'mosque' | 'statue';
export type Stop = { id: string; kind: LandmarkKind; scene: Scene; name: T2; fact?: T2 };

const SCENES = {
  jungle: { sky: ['#7CC6F2', '#DFF3FF'], far: '#A8CFC0', mid: '#6FA88A', grass: '#5DA052', terrain: 'hills', trees: 'round' },
  karst: { sky: ['#8FD0F5', '#E8F6FF'], far: '#9DC3B6', mid: '#5F9B7F', grass: '#62A456', terrain: 'karst', trees: 'palm' },
  highland: { sky: ['#94C9F0', '#EEF7FF'], far: '#B4C7D8', mid: '#7D9DB5', grass: '#6B9F4F', terrain: 'peaks', trees: 'pine' },
  plain: { sky: ['#87CBF0', '#FFF4DA'], far: '#C9C79B', mid: '#A4A86C', grass: '#9DB45A', terrain: 'flat', trees: 'round' },
  coast: { sky: ['#5EC2F2', '#E3F7FF'], far: '#8FB8A6', mid: '#5C9A7E', grass: '#E9D6A4', terrain: 'sea', trees: 'palm' },
  bay: { sky: ['#7FC4EA', '#EAF6FF'], far: '#93B8AC', mid: '#5E8F7C', grass: '#65A35A', terrain: 'sea', trees: 'palm' },
  city: { sky: ['#6FB7EE', '#E6F2FF'], far: '#B3C2D6', mid: '#8798B3', grass: '#7FAE5D', terrain: 'flat', trees: 'city' },
  dusk: { sky: ['#F59E7B', '#FFE3B3'], far: '#C99A9A', mid: '#9C6F7E', grass: '#7A9A4E', terrain: 'hills', trees: 'round', dusk: true },
} satisfies Record<string, Scene>;

const L = (id: string, kind: LandmarkKind, scene: keyof typeof SCENES, en: string, lo: string, fact?: T2): Stop =>
  ({ id, kind, scene: SCENES[scene], name: { en, lo }, fact });

export const ROUTES: Record<string, Stop[]> = {
  LA: [
    L('luangprabang', 'temple', 'jungle', 'Luang Prabang', 'ຫຼວງພະບາງ', { en: 'Fake tour deals target visitors here. Book with known operators.', lo: 'ດີລທົວປອມມັກຫຼອກນັກທ່ອງທ່ຽວ. ຈອງກັບບໍລິສັດທີ່ຮູ້ຈັກ.' }),
    L('kuangsi', 'waterfall', 'jungle', 'Kuang Si Falls', 'ນ້ຳຕົກຕາດກວາງຊີ', { en: 'A "free ticket" link is a classic trap.', lo: 'ລິ້ງ "ປີ້ຟຣີ" ແມ່ນກັບດັກທີ່ພົບເລື້ອຍ.' }),
    L('jars', 'jars', 'plain', 'Plain of Jars', 'ທົ່ງໄຫຫີນ', { en: 'Scammers fake family emergencies. Call your family back yourself.', lo: 'ຜູ້ຫຼອກລວງປອມເຫດດ່ວນຄອບຄົວ. ໂທກັບຫາຄອບຄົວເອງ.' }),
    L('vangvieng', 'balloons', 'karst', 'Vang Vieng', 'ວັງວຽງ', { en: '"Easy job abroad, no interview" can be a trafficking lure.', lo: '"ວຽກງ່າຍຕ່າງປະເທດ ບໍ່ສຳພາດ" ອາດແມ່ນເຫຍື່ອການຄ້າມະນຸດ.' }),
    L('thatluang', 'stupa', 'city', 'Pha That Luang, Vientiane', 'ພະທາດຫຼວງ, ວຽງຈັນ', { en: 'Fake donation pages appear around festivals. Give in person.', lo: 'ໜ້າບໍລິຈາກປອມມັກມີຊ່ວງບຸນ. ບໍລິຈາກດ້ວຍຕົນເອງ.' }),
    L('patuxai', 'gate', 'city', 'Patuxai, Vientiane', 'ປະຕູໄຊ, ວຽງຈັນ', { en: 'Banks never ask for your PIN or OTP by message.', lo: 'ທະນາຄານບໍ່ເຄີຍຂໍ PIN ຫຼື OTP ທາງຂໍ້ຄວາມ.' }),
    L('watphou', 'khmer', 'dusk', 'Wat Phou, Champasak', 'ວັດພູ, ຈຳປາສັກ', { en: 'Border "agents" who keep your passport are a danger sign.', lo: '"ນາຍໜ້າ" ທີ່ຍຶດໜັງສືຜ່ານແດນແມ່ນສັນຍານອັນຕະລາຍ.' }),
  ],
  TH: [
    L('doisuthep', 'stupa', 'highland', 'Doi Suthep, Chiang Mai', 'ດອຍສຸເທບ, ຊຽງໃໝ່'),
    L('sukhothai', 'khmer', 'plain', 'Sukhothai', 'ສຸໂຂໄທ'),
    L('ayutthaya', 'prang', 'dusk', 'Ayutthaya', 'ອະຍຸທະຍາ'),
    L('watarun', 'prang', 'city', 'Wat Arun, Bangkok', 'ວັດອະລຸນ, ບາງກອກ'),
    L('phuket', 'beach', 'coast', 'Phuket', 'ພູເກັດ'),
  ],
  VN: [
    L('hanoi', 'onepillar', 'city', 'One Pillar Pagoda, Hanoi', 'ວັດເສົາດຽວ, ຮ່າໂນ້ຍ'),
    L('halong', 'boat', 'bay', 'Ha Long Bay', 'ອ່າວຮາລອງ'),
    L('hue', 'citadel', 'plain', 'Hue Citadel', 'ເມືອງເກົ່າເຫວ້'),
    L('hoian', 'lanterns', 'dusk', 'Hoi An', 'ຮອຍອານ'),
    L('goldenbridge', 'bridge', 'highland', 'Golden Bridge, Da Nang', 'ຂົວທອງ, ດ່ານັງ'),
    L('saigon', 'city', 'city', 'Ho Chi Minh City', 'ນະຄອນໂຮ່ຈິມິນ'),
    L('mekong', 'boat', 'jungle', 'Mekong Delta', 'ສາມຫຼ່ຽມແມ່ນ້ຳຂອງ'),
  ],
  KH: [
    L('angkor', 'angkor', 'jungle', 'Angkor Wat, Siem Reap', 'ນະຄອນວັດ, ເສີມລາບ'),
    L('tonlesap', 'stilt', 'plain', 'Tonle Sap', 'ທະເລສາບ'),
    L('phnompenh', 'palace', 'city', 'Royal Palace, Phnom Penh', 'ພະລາຊະວັງ, ພະນົມເປັນ'),
    L('kep', 'beach', 'coast', 'Kep', 'ແກບ'),
  ],
  MM: [
    L('mandalay', 'palace', 'plain', 'Mandalay', 'ມັນດະເລ'),
    L('bagan', 'pagodas', 'dusk', 'Bagan', 'ພຸກາມ'),
    L('inle', 'boat', 'highland', 'Inle Lake', 'ທະເລສາບອິນເລ'),
    L('shwedagon', 'pagoda', 'city', 'Shwedagon, Yangon', 'ຊະເວດາກອງ, ຢ່າງກຸ້ງ'),
  ],
  MY: [
    L('langkawi', 'beach', 'coast', 'Langkawi', 'ລັງກາວີ'),
    L('penang', 'lanterns', 'city', 'George Town, Penang', 'ຈອດທາວ, ປີນັງ'),
    L('cameron', 'terraces', 'highland', 'Cameron Highlands', 'ຄາເມຣອນ ໄຮແລນ'),
    L('kl', 'twin', 'city', 'Kuala Lumpur', 'ກົວລາລຳເປີ'),
    L('malacca', 'clocktower', 'plain', 'Malacca', 'ມະລາກາ'),
  ],
  SG: [
    L('gardens', 'supertrees', 'dusk', 'Gardens by the Bay', 'ສວນກາເດັນ ບາຍ ເດີ ເບ'),
    L('marinabay', 'mbs', 'city', 'Marina Bay', 'ມາຣີນາ ເບ'),
    L('sentosa', 'beach', 'coast', 'Sentosa', 'ເຊັນໂຕຊາ'),
  ],
  ID: [
    L('toba', 'boat', 'highland', 'Lake Toba, Sumatra', 'ທະເລສາບໂຕບາ'),
    L('jakarta', 'monument', 'city', 'Monas, Jakarta', 'ໂມນາສ, ຈາກາຕາ'),
    L('borobudur', 'borobudur', 'jungle', 'Borobudur', 'ບໍໂຣບູດູ'),
    L('bromo', 'volcano', 'dusk', 'Mount Bromo', 'ພູໄຟໂບຣໂມ'),
    L('bali', 'balitemple', 'coast', 'Bali', 'ບາຫຼີ'),
  ],
  PH: [
    L('banaue', 'terraces', 'highland', 'Banaue Rice Terraces', 'ນາຂັ້ນໄດ ບານາເວ'),
    L('manila', 'city', 'city', 'Manila', 'ມະນີລາ'),
    L('mayon', 'volcano', 'plain', 'Mayon Volcano', 'ພູໄຟມາຢອນ'),
    L('bohol', 'chocohills', 'jungle', 'Chocolate Hills, Bohol', 'ພູຊັອກໂກແລັດ, ໂບໂຮນ'),
    L('siargao', 'beach', 'coast', 'Siargao', 'ຊີອາກາວ'),
  ],
  BN: [
    L('omarali', 'mosque', 'city', 'Omar Ali Saifuddien Mosque', 'ມັດສະຍິດ ໂອມາ ອາລີ'),
    L('kampongayer', 'stilt', 'bay', 'Kampong Ayer', 'ກຳປົງ ອາແຢ'),
    L('temburong', 'waterfall', 'jungle', 'Ulu Temburong', 'ອູລູ ເຕັມບູຣົງ'),
  ],
  TL: [
    L('cristorei', 'statue', 'coast', 'Cristo Rei, Dili', 'ຄຣິສໂຕ ເຣ, ດີລີ'),
    L('atauro', 'beach', 'bay', 'Atauro Island', 'ເກາະອາຕາອູໂຣ'),
    L('ramelau', 'volcano', 'highland', 'Mount Ramelau', 'ພູຣາເມເລົາ'),
  ],
};

// Stops without their own fact, and every stop after the first lap, show one of these, so gates keep teaching
// something new. Facts come from the 2025 US Trafficking in Persons report (Laos), UN experts (2025), US CRS and the FTC.
// Every number carries its year and scope: identified victims, potential victims and estimates are kept apart.
export const TIPS: T2[] = [
  { en: 'Real prizes never ask you to pay a fee first.', lo: 'ລາງວັນແທ້ບໍ່ເຄີຍໃຫ້ຈ່າຍຄ່າທຳນຽມກ່ອນ.' },
  { en: 'Banks never ask for your PIN or OTP by message.', lo: 'ທະນາຄານບໍ່ເຄີຍຂໍ PIN ຫຼື OTP ທາງຂໍ້ຄວາມ.' },
  { en: 'A friend asking for money in chat? Call them on their usual number first.', lo: 'ໝູ່ຂໍເງິນໃນແຊັດ? ໂທຫາເບີປົກກະຕິຂອງເຂົາກ່ອນ.' },
  { en: 'Rushing you to act "now" is the oldest scam trick. Slow down.', lo: 'ການເລັ່ງໃຫ້ເຮັດ "ດຽວນີ້" ແມ່ນກົນຫຼອກເກົ່າແກ່ທີ່ສຸດ. ຄ່ອຍໆຄິດ.' },
  { en: 'The person scamming you may be a victim too, forced to type under threat.', lo: 'ຄົນທີ່ຫຼອກທ່ານ ອາດເປັນຜູ້ເຄາະຮ້າຍເຊັ່ນກັນ ຖືກບັງຄັບໃຫ້ພິມພາຍໃຕ້ການຂົ່ມຂູ່.' },
  { en: 'Young, educated men are often trafficked into scam work, not only women and girls.', lo: 'ຊາຍໜຸ່ມທີ່ມີການສຶກສາ ມັກຖືກຄ້າມະນຸດໄປເຮັດວຽກຫຼອກລວງ ບໍ່ແມ່ນແຕ່ຜູ້ຍິງ ແລະ ເດັກຍິງ.' },
  { en: 'A signed contract and a salary do not prove someone is free to leave.', lo: 'ສັນຍາທີ່ເຊັນ ແລະ ເງິນເດືອນ ບໍ່ໄດ້ພິສູດວ່າຄົນນັ້ນອອກໄດ້ຢ່າງເສລີ.' },
  { en: 'Trafficking can happen inside Laos too, without crossing any border.', lo: 'ການຄ້າມະນຸດເກີດຂຶ້ນພາຍໃນລາວໄດ້ ໂດຍບໍ່ຕ້ອງຂ້າມແດນ.' },
  { en: '"Free" room and meals can become a debt you are forced to work off.', lo: 'ຫ້ອງພັກ ແລະ ອາຫານ "ຟຣີ" ອາດກາຍເປັນໜີ້ທີ່ຖືກບັງຄັບໃຫ້ເຮັດວຽກໃຊ້.' },
  { en: 'Some trapped workers are told to recruit a friend to win their own release.', lo: 'ຄົນງານທີ່ຖືກກັກບາງຄົນ ຖືກບອກໃຫ້ຊວນໝູ່ມາ ຈຶ່ງຈະຖືກປ່ອຍ.' },
  { en: 'A shiny tech park or office building does not prove a job is legal.', lo: 'ເຂດເທັກໂນໂລຊີ ຫຼື ຕຶກຫ້ອງການງາມໆ ບໍ່ໄດ້ພິສູດວ່າວຽກຖືກກົດໝາຍ.' },
  { en: 'Task scams look like games: levels, rewards, then "deposit to withdraw". The balance is fake.', lo: 'ການຫຼອກແບບວຽກຄືເກມ: ເລເວລ, ລາງວັນ ແລ້ວ "ຝາກເພື່ອຖອນ". ຍອດເງິນເປັນຂອງປອມ.' },
  { en: 'Job moved from Thailand to "our other branch" at the last minute? That change is the warning.', lo: 'ວຽກຍ້າຍຈາກໄທ ໄປ "ສາຂາອື່ນ" ກະທັນຫັນ? ການປ່ຽນນັ້ນແມ່ນສັນຍານເຕືອນ.' },
  { en: 'Keep your passport and phone. Whoever holds them holds you.', lo: 'ເກັບໜັງສືຜ່ານແດນ ແລະ ໂທລະສັບໄວ້ເອງ. ໃຜຖືມັນ ກໍ່ຄວບຄຸມທ່ານ.' },
  { en: 'In 2024, Lao authorities formally identified 85 trafficking victims. That counts recognition, not everyone harmed.', lo: 'ປີ 2024 ທາງການລາວ ຢືນຢັນຜູ້ເຄາະຮ້າຍຈາກການຄ້າມະນຸດ 85 ຄົນ. ນັ້ນແມ່ນຈຳນວນທີ່ຖືກຮັບຮູ້ ບໍ່ແມ່ນທຸກຄົນທີ່ຖືກກະທົບ.' },
  { en: 'About 1,948 potential victims were released from the Golden Triangle zone in 2024 (US TIP report).', lo: 'ປະມານ 1,948 ຄົນທີ່ອາດເປັນຜູ້ເຄາະຮ້າຍ ຖືກປ່ອຍອອກຈາກເຂດສາມຫຼ່ຽມຄຳ ໃນປີ 2024 (ລາຍງານ TIP ສະຫະລັດ).' },
  { en: 'Of about 6,364 people removed from the zone (Sep 2022 to Dec 2024), only 25 were formally identified as victims.', lo: 'ໃນປະມານ 6,364 ຄົນທີ່ຖືກນຳອອກຈາກເຂດ (ກ.ຍ. 2022 ຫາ ທ.ວ. 2024) ມີພຽງ 25 ຄົນທີ່ຖືກຢືນຢັນເປັນຜູ້ເຄາະຮ້າຍ.' },
  { en: 'UN experts reported people of more than 32 nationalities in the Golden Triangle zone (2025).', lo: 'ຜູ້ຊ່ຽວຊານ UN ລາຍງານວ່າມີຄົນຫຼາຍກວ່າ 32 ສັນຊາດ ໃນເຂດສາມຫຼ່ຽມຄຳ (2025).' },
  { en: 'A rescue count is not a confirmed-victim count, and fewer identified victims does not mean less trafficking.', lo: 'ຈຳນວນຄົນທີ່ຖືກຊ່ວຍ ບໍ່ແມ່ນຈຳນວນຜູ້ເຄາະຮ້າຍທີ່ຢືນຢັນ ແລະ ການຢືນຢັນໜ້ອຍລົງ ບໍ່ໄດ້ໝາຍວ່າການຄ້າມະນຸດຫຼຸດລົງ.' },
  { en: 'Worried someone is trapped? Lao Women\'s Union 1362, police 1191. Never post their location publicly.', lo: 'ເປັນຫ່ວງວ່າມີຄົນຖືກກັກ? ສະຫະພັນແມ່ຍິງລາວ 1362, ຕຳຫຼວດ 1191. ຢ່າໂພສບ່ອນຢູ່ຂອງເຂົາສາທາລະນະ.' },
];

// Kids get these instead of the stop facts and TIPS above, which include trafficking detail.
export const KIDS_TIPS: T2[] = [
  { en: 'Your password is only for you. Not even friends get it.', lo: 'ລະຫັດຜ່ານແມ່ນຂອງເຈົ້າຄົນດຽວ. ໝູ່ກໍບໍ່ໃຫ້.' },
  { en: 'A code sent by SMS is a key. Never tell anyone.', lo: 'ລະຫັດທາງ SMS ແມ່ນກະແຈ. ຢ່າບອກໃຜ.' },
  { en: 'Free skins or diamonds from a stranger are a trick.', lo: 'ສະກິນ ຫຼື ເພັດຟຣີຈາກຄົນແປກໜ້າ ແມ່ນກົນຫຼອກ.' },
  { en: '"Keep it secret" means: tell a trusted adult now.', lo: '"ຢ່າບອກໃຜ" ໝາຍຄວາມວ່າ: ບອກຜູ້ໃຫຍ່ທີ່ໄວ້ໃຈດຽວນີ້.' },
  { en: 'Never share your school, address or phone number online.', lo: 'ຢ່າບອກໂຮງຮຽນ, ທີ່ຢູ່ ຫຼື ເບີໂທ ທາງອອນລາຍ.' },
  { en: 'Never meet an online friend alone. Ask a grown-up first.', lo: 'ຢ່າພົບໝູ່ອອນລາຍຄົນດຽວ. ຖາມຜູ້ໃຫຍ່ກ່ອນ.' },
  { en: 'Scary messages want you to rush. Stop and show a grown-up.', lo: 'ຂໍ້ຄວາມຂູ່ຢາກໃຫ້ເຈົ້າຟ້າວ. ຢຸດ ແລ້ວໃຫ້ຜູ້ໃຫຍ່ເບິ່ງ.' },
  { en: 'Telling an adult is never getting in trouble. It’s being smart.', lo: 'ການບອກຜູ້ໃຫຍ່ ບໍ່ແມ່ນຄວາມຜິດ. ແມ່ນຄວາມສະຫຼາດ.' },
];

// Seeded once per session so each visit shows a different spread of facts.
const SEED = Math.floor(Math.random() * TIPS.length);
export const routeFor = (country: string) => ROUTES[country] ?? ROUTES.LA;
// First lap: the stop's own fact. Later laps (and stops without one) draw from TIPS so nothing repeats too soon.
export const factFor = (stop: Stop, i: number, lap = 0, kids = false) =>
  kids ? KIDS_TIPS[(SEED + i * 3 + lap) % KIDS_TIPS.length]
    : (lap === 0 && stop.fact) ? stop.fact : TIPS[(SEED + i * 7 + lap * 3) % TIPS.length];
