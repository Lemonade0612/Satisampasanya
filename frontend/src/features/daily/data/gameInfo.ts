import type { GameId, L10n } from '../types';
// What each game teaches, for the "Learn more" sheet on the Play page. Lao is a draft for native review.
const l = (en: string, lo: string): L10n => ({ en, lo });
export const GAME_INFO: Record<GameId, { learn: L10n[]; minutes: number }> = {
  call: { minutes: 3, learn: [l('Scammers pretend to be police, banks and offices', 'ຄົນຫຼອກລວງແກ້ງເປັນຕຳຫຼວດ, ທະນາຄານ ແລະ ຫ້ອງການ'), l('Never read out an OTP or move money because of a call', 'ຢ່າອ່ານ OTP ຫຼື ໂອນເງິນຍ້ອນສາຍໂທ'), l('Hang up and call the real number yourself', 'ວາງສາຍ ແລ້ວໂທເບີແທ້ເອງ')] },
  detective: { minutes: 3, learn: [l('Spot the clues in a real-looking scam case', 'ຊອກຫາຮ່ອງຮອຍໃນກໍລະນີທີ່ເບິ່ງຄືແທ້'), l('Ask who, why and what they want from you', 'ຖາມວ່າໃຜ, ເປັນຫຍັງ ແລະ ເຂົາຢາກໄດ້ຫຍັງ'), l('Check before you trust', 'ກວດກ່ອນເຊື່ອ')] },
  story: { minutes: 3, learn: [l('How a job offer grows into a fee, secrecy and a pickup', 'ຂໍ້ສະເໜີວຽກຄ່ອຍໆກາຍເປັນຄ່າທຳນຽມ, ຄວາມລັບ ແລະ ລົດມາຮັບ'), l('Why “tell no one” is a trafficking warning sign', 'ເປັນຫຍັງ “ຢ່າບອກໃຜ” ຈຶ່ງເປັນສັນຍານອັນຕະລາຍ'), l('Block, keep the chat and report to 1533', 'ບລັອກ, ເກັບແຊັດ ແລະ ແຈ້ງ 1533')] },
  flags: { minutes: 2, learn: [l('Find the red-flag phrases hidden in a message', 'ຊອກຫາຄຳອັນຕະລາຍທີ່ແຝງຢູ່ໃນຂໍ້ຄວາມ'), l('Urgency, upfront fees and too-good offers', 'ຄວາມເລັ່ງດ່ວນ, ຄ່າທຳນຽມລ່ວງໜ້າ ແລະ ຂໍ້ສະເໜີດີເກີນຈິງ')] },
  realorscam: { minutes: 2, learn: [l('Decide fast: real message or scam?', 'ຕັດສິນໄວ: ຂໍ້ຄວາມແທ້ ຫຼື ຫຼອກລວງ?'), l('Check the sender before you tap', 'ກວດຜູ້ສົ່ງກ່ອນກົດ')] },
  links: { minutes: 2, learn: [l('Read a link: the domain sits before the first “/”', 'ອ່ານລິ້ງ: ໂດເມນຢູ່ກ່ອນ “/” ອັນທຳອິດ'), l('Look-alike names and extra words are fake signs', 'ຊື່ຄ້າຍກັນ ແລະ ຄຳເພີ່ມແມ່ນສັນຍານປອມ')] },
  dash: { minutes: 2, learn: [l('Run, jump and dodge scam traps', 'ແລ່ນ, ໂດດ ແລະ ຫຼີກກັບດັກ'), l('Collect safe habits along the way', 'ເກັບນິໄສປອດໄພລະຫວ່າງທາງ')] },
};
