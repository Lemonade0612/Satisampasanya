// Scam Dash route through Laos, north to south. After the last stop the run loops back north, faster.
export const STOPS: { id: string; img: string; name: { en: string; lo: string }; fact: { en: string; lo: string } }[] = [
  { id: 'luangprabang', img: '/images/dash/luangprabang.jpg', name: { en: 'Luang Prabang', lo: 'ຫຼວງພະບາງ' }, fact: { en: 'Fake tour deals target visitors here. Book with known operators.', lo: 'ດີລທົວປອມມັກຫຼອກນັກທ່ອງທ່ຽວ. ຈອງກັບບໍລິສັດທີ່ຮູ້ຈັກ.' } },
  { id: 'kuangsi', img: '/images/dash/kuangsi.jpg', name: { en: 'Kuang Si Falls', lo: 'ນ້ຳຕົກຕາດກວາງຊີ' }, fact: { en: 'A "free ticket" link is a classic trap.', lo: 'ລິ້ງ "ປີ້ຟຣີ" ແມ່ນກັບດັກທີ່ພົບເລື້ອຍ.' } },
  { id: 'jars', img: '/images/dash/jars.jpg', name: { en: 'Plain of Jars', lo: 'ທົ່ງໄຫຫີນ' }, fact: { en: 'Scammers fake family emergencies. Call your family back yourself.', lo: 'ຜູ້ຫຼອກລວງປອມເຫດດ່ວນຄອບຄົວ. ໂທກັບຫາຄອບຄົວເອງ.' } },
  { id: 'vangvieng', img: '/images/dash/vangvieng.jpg', name: { en: 'Vang Vieng', lo: 'ວັງວຽງ' }, fact: { en: '"Easy job abroad, no interview" can be a trafficking lure.', lo: '"ວຽກງ່າຍຕ່າງປະເທດ ບໍ່ສຳພາດ" ອາດແມ່ນເຫຍື່ອການຄ້າມະນຸດ.' } },
  { id: 'thatluang', img: '/images/dash/thatluang.jpg', name: { en: 'Pha That Luang, Vientiane', lo: 'ພະທາດຫຼວງ, ວຽງຈັນ' }, fact: { en: 'Fake donation pages appear around festivals. Give in person.', lo: 'ໜ້າບໍລິຈາກປອມມັກມີຊ່ວງບຸນ. ບໍລິຈາກດ້ວຍຕົນເອງ.' } },
  { id: 'patuxai', img: '/images/dash/patuxai.jpg', name: { en: 'Patuxai, Vientiane', lo: 'ປະຕູໄຊ, ວຽງຈັນ' }, fact: { en: 'Banks never ask for your PIN or OTP by message.', lo: 'ທະນາຄານບໍ່ເຄີຍຂໍ PIN ຫຼື OTP ທາງຂໍ້ຄວາມ.' } },
  { id: 'south', img: '/images/dash/south.jpg', name: { en: 'Southern Laos', lo: 'ພາກໃຕ້ລາວ' }, fact: { en: 'Border "agents" who keep your passport are a danger sign.', lo: '"ນາຍໜ້າ" ທີ່ຍຶດໜັງສືຜ່ານແດນແມ່ນສັນຍານອັນຕະລາຍ.' } },
];

// Modes are sized for different players: Easy suits young kids and elders (slow, more hearts).
export const MODES = {
  easy: { speed: 0.022, hearts: 5, icon: '🐢' },
  normal: { speed: 0.032, hearts: 3, icon: '🏃' },
  fast: { speed: 0.044, hearts: 3, icon: '⚡' },
} as const;
export type ModeId = keyof typeof MODES;
