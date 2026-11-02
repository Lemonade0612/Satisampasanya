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

// Stops without their own fact show one of these, so every gate still teaches something.
export const TIPS: T2[] = [
  { en: 'Unknown number says you won a prize? Real prizes never ask you to pay a fee first.', lo: 'ເບີແປກບອກວ່າທ່ານຖືກລາງວັນ? ລາງວັນແທ້ບໍ່ເຄີຍໃຫ້ຈ່າຍຄ່າທຳນຽມກ່ອນ.' },
  { en: 'Banks never ask for your PIN or OTP by message.', lo: 'ທະນາຄານບໍ່ເຄີຍຂໍ PIN ຫຼື OTP ທາງຂໍ້ຄວາມ.' },
  { en: 'Check the web address letter by letter before you log in.', lo: 'ກວດທີ່ຢູ່ເວັບທຸກຕົວອັກສອນກ່ອນເຂົ້າລະບົບ.' },
  { en: 'A friend asking for money in chat? Call them on their usual number first.', lo: 'ໝູ່ຂໍເງິນໃນແຊັດ? ໂທຫາເບີປົກກະຕິຂອງເຂົາກ່ອນ.' },
  { en: 'High salary, no skills, travel paid? That job offer is a red flag.', lo: 'ເງິນເດືອນສູງ ບໍ່ຕ້ອງມີທັກສະ ອອກຄ່າເດີນທາງໃຫ້? ນັ້ນແມ່ນສັນຍານອັນຕະລາຍ.' },
  { en: 'Rushing you to act "now" is the oldest scam trick. Slow down.', lo: 'ການເລັ່ງໃຫ້ເຮັດ "ດຽວນີ້" ແມ່ນກົນຫຼອກເກົ່າແກ່ທີ່ສຸດ. ຄ່ອຍໆຄິດ.' },
  { en: 'Guaranteed investment returns do not exist. Walk away.', lo: 'ການລົງທຶນທີ່ຮັບປະກັນກຳໄລບໍ່ມີແທ້. ຍ່າງໜີ.' },
  { en: 'Never install an app a stranger sends you to "fix" your account.', lo: 'ຢ່າຕິດຕັ້ງແອັບທີ່ຄົນແປກໜ້າສົ່ງມາເພື່ອ "ແກ້ໄຂ" ບັນຊີ.' },
];

export const routeFor = (country: string) => ROUTES[country] ?? ROUTES.LA;
export const factFor = (stop: Stop, i: number) => stop.fact ?? TIPS[i % TIPS.length];

// Modes are sized for different players: Easy suits young kids and elders (slow, more hearts).
export const MODES = {
  easy: { speed: 0.022, hearts: 5 },
  normal: { speed: 0.032, hearts: 3 },
  fast: { speed: 0.044, hearts: 3 },
} as const;
export type ModeId = keyof typeof MODES;
