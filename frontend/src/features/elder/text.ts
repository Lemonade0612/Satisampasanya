import type { Lang } from '../../types';
import type { ElderVerdict } from '../../lib/elderCheck';

// Simple mode copy. Lao first; every Lao string needs a native check. // REVIEW-LO (all Lao in this file)
export const ET = {
  lo: {
    hello: 'ສະບາຍດີ', listen: 'ຟັງ', stop: 'ຢຸດ', tip_label: 'ຄຳເຕືອນມື້ນີ້',
    check: 'ກວດຂໍ້ຄວາມ', check_sub: 'ແທ້ ຫຼື ຫຼອກ?',
    call: 'ໂທຫາລູກຫຼານ', call_sub: 'ຖາມກ່ອນ ໂອນເງິນ',
    full_app: 'ເປີດແອັບເຕັມ', back: 'ກັບ',
    paste_title: 'ວາງຂໍ້ຄວາມທີ່ໄດ້ຮັບ', paste_hint: 'ກົດຄ້າງ ແລ້ວເລືອກ "ວາງ"', paste: 'ວາງ', run: 'ກວດເລີຍ',
    result_title: 'ຜົນການກວດ', your_message: 'ຂໍ້ຄວາມຂອງທ່ານ',
    phone_title: 'ເບີລູກຫຼານ', phone_hint: 'ໃສ່ເບີໂທ ເທື່ອດຽວ. ຄັ້ງໜ້າ ກົດແລ້ວໂທເລີຍ.', save: 'ບັນທຶກ ແລະ ໂທ', skip: 'ບໍ່ແມ່ນຕອນນີ້',
  },
  en: {
    hello: 'Hello', listen: 'Listen', stop: 'Stop', tip_label: "Today's warning",
    check: 'Check a message', check_sub: 'Real or scam?',
    call: 'Call family', call_sub: 'Ask before you send money',
    full_app: 'Open full app', back: 'Back',
    paste_title: 'Paste the message you got', paste_hint: 'Press and hold, then choose "Paste"', paste: 'Paste', run: 'Check now',
    result_title: 'Result', your_message: 'Your message',
    phone_title: 'Family number', phone_hint: 'Enter the number once. Next time one tap calls.', save: 'Save and call', skip: 'Not now',
  },
} as const;

export const VERDICT: Record<ElderVerdict, { bg: string; lo: [string, string]; en: [string, string] }> = {
  scam: { bg: '#DC2626', lo: ['ຫຼອກລວງ', 'ຢ່າບອກລະຫັດ. ຢ່າໂອນເງິນ.'], en: ['Scam', "Don't share codes. Don't send money."] },
  // amber-700, not amber-500: white text needs 4.5:1.
  caution: { bg: '#B45309', lo: ['ລະວັງ', 'ຢ່າເພິ່ງເຊື່ອ. ໂທຖາມລູກຫຼານກ່ອນ.'], en: ['Be careful', "Don't trust it yet. Ask family first."] },
  safe: { bg: '#15803D', lo: ['ປອດໄພ', 'ບໍ່ເຫັນສັນຍານຫຼອກ. ຖ້າສົງໃສ ໃຫ້ຖາມລູກຫຼານ.'], en: ['Looks safe', 'No scam signs found. If unsure, ask family.'] },
};

// Rotated daily: bank OTP, fake officials, "grandchild in trouble", pension and lottery wins.
export const ELDER_TIPS: Record<Lang, string>[] = [
  { lo: 'ທະນາຄານ ບໍ່ເຄີຍຖາມລະຫັດ OTP. ຢ່າບອກໃຜ.', en: 'Banks never ask for your OTP code. Never tell anyone.' },
  { lo: 'ຕຳຫຼວດແທ້ ບໍ່ໂທມາໃຫ້ໂອນເງິນຄ່າປັບໃໝ.', en: 'Real police never call asking you to pay a fine by transfer.' },
  { lo: 'ມີຄົນໂທມາວ່າ ຫຼານມີບັນຫາ? ວາງສາຍ ແລ້ວໂທຫາຫຼານເອງ.', en: 'A caller says your grandchild is in trouble? Hang up and call them yourself.' },
  { lo: 'ຖືກຫວຍ ແຕ່ຕ້ອງຈ່າຍເງິນກ່ອນ ແມ່ນຫຼອກລວງ.', en: 'A win that asks you to pay first is a scam.' },
  { lo: 'ເງິນບຳນານ ບໍ່ຕ້ອງຢືນຢັນທາງໂທລະສັບ.', en: 'Your pension never needs confirming by phone.' },
  { lo: 'ເຈົ້າໜ້າທີ່ ບໍ່ຂໍລະຫັດ ຫຼື ເງິນ ທາງໂທລະສັບ.', en: 'Officials never ask for codes or money by phone.' },
  { lo: 'ຢ່າໃຫ້ຄົນແປກໜ້າ ຈັບໂທລະສັບຂອງທ່ານ.', en: "Don't let strangers handle your phone." },
];
export const tipForToday = (day: number) => ELDER_TIPS[((day % ELDER_TIPS.length) + ELDER_TIPS.length) % ELDER_TIPS.length];
