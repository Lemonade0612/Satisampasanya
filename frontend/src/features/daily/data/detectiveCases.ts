import type { FlagCategory, L10n } from '../types';
import type { Avatar } from '../lib/dashPlayer';

// Scam Detective: pick a character, then solve cases tailored to their life.
// Each message is split into parts; clue parts can be inspected with the magnifier.
// Lao strings are drafts and need native review (see needsNativeReview in i18n.ts).

export type Clue = { flag?: FlagCategory; note: L10n }; // no flag = a safe sign
export type Part = { text: L10n; clue?: Clue };
export type Action = { text: L10n; best: boolean; why: L10n };
export type Case = {
  id: string; channel: 'sms' | 'chat' | 'call' | 'email'; sender: L10n; situation: L10n;
  parts: Part[]; isScam: boolean; actions: Action[]; lesson: L10n;
};
export type Persona = { id: string; avatar: Avatar; name: L10n; age: number; who: L10n; cases: Case[] };

const A = (en: string, lo: string, best = false, whyEn = '', whyLo = ''): Action => ({ text: { en, lo }, best, why: { en: whyEn, lo: whyLo } });
const P = (en: string, lo: string, clue?: Clue): Part => ({ text: { en, lo }, clue });
const C = (flag: FlagCategory | undefined, en: string, lo: string): Clue => ({ flag, note: { en, lo } });

export const PERSONAS: Persona[] = [
  {
    id: 'student', avatar: { skin: 0, hair: 1, outfit: 2, extra: 0 }, name: { en: 'Noy', lo: 'ນ້ອຍ' }, age: 17, who: { en: 'Student looking for a summer job', lo: 'ນັກຮຽນ ກຳລັງຊອກວຽກພາກຮຽນ' },
    cases: [
      {
        id: 'noy-job', channel: 'chat', sender: { en: 'HR Recruiter', lo: 'ຝ່າຍບຸກຄົນ' }, isScam: true,
        situation: { en: 'Noy posted that she wants part-time work. A stranger messages her.', lo: 'ນ້ອຍໂພສວ່າຢາກໄດ້ວຽກພາກສ່ວນ. ຄົນແປກໜ້າສົ່ງຂໍ້ຄວາມມາ.' },
        parts: [
          P('Hi! Easy online job: like videos and earn ', 'ສະບາຍດີ! ວຽກອອນລາຍງ່າຍໆ: ກົດໄລກ໌ວິດີໂອ ແລ້ວໄດ້ເງິນ '),
          P('500,000 kip a day. ', '500,000 ກີບຕໍ່ມື້. ', C('too_good', 'Big money for almost no work. Real jobs do not pay like this.', 'ເງິນຫຼາຍ ແຕ່ເກືອບບໍ່ໄດ້ເຮັດວຽກ. ວຽກແທ້ບໍ່ຈ່າຍແບບນີ້.')),
          P('First pay a 100,000 kip sign-up fee ', 'ຈ່າຍຄ່າລົງທະບຽນ 100,000 ກີບກ່ອນ ', C('upfront_fee', 'A job that asks YOU to pay first is a scam.', 'ວຽກທີ່ໃຫ້ທ່ານຈ່າຍເງິນກ່ອນ ແມ່ນການຫຼອກລວງ.')),
          P('and move to Telegram. ', 'ແລ້ວຍ້າຍໄປ Telegram. ', C('off_platform', 'Moving you to another app hides them from safety checks.', 'ການຍ້າຍໄປແອັບອື່ນ ເພື່ອຫຼົບການກວດສອບ.')),
          P('Only 3 places left today!', 'ເຫຼືອພຽງ 3 ບ່ອນມື້ນີ້!', C('urgency', 'Rushing you so you do not stop to think.', 'ເລັ່ງໃຫ້ທ່ານບໍ່ມີເວລາຄິດ.')),
        ],
        actions: [
          A('Pay the fee quickly', 'ຈ່າຍຄ່າທຳນຽມໄວໆ', false, 'The fee is the scam. The "job" never pays.', 'ຄ່າທຳນຽມແມ່ນການຫຼອກ. "ວຽກ" ບໍ່ເຄີຍຈ່າຍ.'),
          A('Block, report, and tell a trusted adult', 'ບລັອກ, ລາຍງານ ແລະ ບອກຜູ້ໃຫຍ່ທີ່ໄວ້ໃຈ', true, 'Yes! Reporting protects your friends too.', 'ຖືກແລ້ວ! ການລາຍງານຊ່ວຍປົກປ້ອງໝູ່ນຳ.'),
          A('Ask them for proof first', 'ຂໍຫຼັກຖານຈາກເຂົາກ່ອນ', false, 'Scammers make fake proof easily. Do not keep talking.', 'ຜູ້ຫຼອກລວງສ້າງຫຼັກຖານປອມງ່າຍ. ຢ່າລົມຕໍ່.'),
        ],
        lesson: { en: 'Real jobs never ask you to pay to start.', lo: 'ວຽກແທ້ບໍ່ເຄີຍໃຫ້ຈ່າຍເງິນເພື່ອເລີ່ມວຽກ.' },
      },
      {
        id: 'noy-school', channel: 'sms', sender: { en: 'School Office', lo: 'ຫ້ອງການໂຮງຮຽນ' }, isScam: false,
        situation: { en: 'Noy gets a text from her school number saved in her phone.', lo: 'ນ້ອຍໄດ້ຂໍ້ຄວາມຈາກເບີໂຮງຮຽນທີ່ບັນທຶກໄວ້.' },
        parts: [
          P('Reminder: exams start Monday 8:00. ', 'ແຈ້ງເຕືອນ: ສອບເສັງເລີ່ມວັນຈັນ 8:00. ', C(undefined, 'Normal school news. No request at all.', 'ຂ່າວໂຮງຮຽນທຳມະດາ. ບໍ່ມີການຂໍຫຍັງ.')),
          P('Bring your student card. ', 'ເອົາບັດນັກຮຽນມານຳ. '),
          P('Questions? Visit the office.', 'ມີຄຳຖາມ? ມາຫາຫ້ອງການ.', C(undefined, 'It tells you to check in person. Scammers avoid that.', 'ບອກໃຫ້ມາກວດເອງ. ຜູ້ຫຼອກລວງຫຼີກລ້ຽງແບບນີ້.')),
        ],
        actions: [
          A('Ignore it, it might be a scam', 'ບໍ່ສົນໃຈ ອາດແມ່ນການຫຼອກ', false, 'Not every message is a scam. This one asks for nothing.', 'ບໍ່ແມ່ນທຸກຂໍ້ຄວາມເປັນການຫຼອກ. ອັນນີ້ບໍ່ຂໍຫຍັງ.'),
          A('Note the date and get ready', 'ຈົດວັນທີ ແລ້ວກຽມຕົວ', true, 'Right. It is from a known number and asks for nothing.', 'ຖືກ. ມາຈາກເບີທີ່ຮູ້ຈັກ ແລະ ບໍ່ຂໍຫຍັງ.'),
          A('Reply with your password', 'ຕອບກັບດ້ວຍລະຫັດຜ່ານ', false, 'Never send a password, even to a real school.', 'ຢ່າສົ່ງລະຫັດຜ່ານ ແມ່ນແຕ່ໂຮງຮຽນແທ້.'),
        ],
        lesson: { en: 'A safe message gives information and asks for nothing.', lo: 'ຂໍ້ຄວາມປອດໄພ ໃຫ້ຂໍ້ມູນ ແລະ ບໍ່ຂໍຫຍັງ.' },
      },
      {
        id: 'noy-game', channel: 'chat', sender: { en: 'FreeSkins Bot', lo: 'FreeSkins Bot' }, isScam: true,
        situation: { en: 'In a game chat, Noy sees a free prize offer.', lo: 'ໃນແຊັດເກມ ນ້ອຍເຫັນຂໍ້ສະເໜີລາງວັນຟຣີ.' },
        parts: [
          P('🎁 You won 10,000 free diamonds! ', '🎁 ທ່ານຖືກ 10,000 ເພັດຟຣີ! ', C('too_good', 'You did not enter any contest. Free prizes are bait.', 'ທ່ານບໍ່ໄດ້ສະໝັກແຂ່ງຂັນ. ລາງວັນຟຣີແມ່ນເຫຍື່ອ.')),
          P('Log in here: game-free-gift.top ', 'ເຂົ້າລະບົບທີ່: game-free-gift.top ', C('suspicious_link', 'Not the game\'s real website. It steals your account.', 'ບໍ່ແມ່ນເວັບແທ້ຂອງເກມ. ມັນລັກບັນຊີ.')),
          P('with your username and password.', 'ດ້ວຍຊື່ຜູ້ໃຊ້ ແລະ ລະຫັດຜ່ານ.', C('personal_data', 'Asking for your password is always a red flag.', 'ການຂໍລະຫັດຜ່ານ ແມ່ນສັນຍານອັນຕະລາຍສະເໝີ.')),
        ],
        actions: [
          A('Log in to claim it', 'ເຂົ້າລະບົບເພື່ອຮັບ', false, 'Your account would be stolen.', 'ບັນຊີຂອງທ່ານຈະຖືກລັກ.'),
          A('Do not click. Report the player', 'ບໍ່ກົດ. ລາຍງານຜູ້ຫຼິ້ນ', true, 'Correct. Prizes only come inside the real game.', 'ຖືກ. ລາງວັນມາໃນເກມແທ້ເທົ່ານັ້ນ.'),
          A('Share it with friends', 'ແຊຣ໌ໃຫ້ໝູ່', false, 'That spreads the trap to your friends.', 'ນັ້ນເຮັດໃຫ້ກັບດັກແຜ່ໄປຫາໝູ່.'),
        ],
        lesson: { en: 'Check the web address. Never type your password from a link in chat.', lo: 'ກວດທີ່ຢູ່ເວັບ. ຢ່າໃສ່ລະຫັດຜ່ານຈາກລິ້ງໃນແຊັດ.' },
      },
    ],
  },
  {
    id: 'parent', avatar: { skin: 2, hair: 2, outfit: 1, extra: 4 }, name: { en: 'Khamla', lo: 'ຄຳຫຼ້າ' }, age: 38, who: { en: 'Mum who runs a small shop', lo: 'ແມ່ ທີ່ເປີດຮ້ານນ້ອຍ' },
    cases: [
      {
        id: 'khamla-bank', channel: 'sms', sender: { en: '+856 20 9x xxx', lo: '+856 20 9x xxx' }, isScam: true,
        situation: { en: 'Khamla gets a text that looks like it is from her bank.', lo: 'ຄຳຫຼ້າໄດ້ຂໍ້ຄວາມຄືກັບມາຈາກທະນາຄານ.' },
        parts: [
          P('BANK ALERT: your account is locked. ', 'ແຈ້ງເຕືອນທະນາຄານ: ບັນຊີຂອງທ່ານຖືກລັອກ. ', C('unverified_identity', 'Sent from a normal phone number, not the bank\'s official name.', 'ສົ່ງຈາກເບີທຳມະດາ ບໍ່ແມ່ນຊື່ທາງການຂອງທະນາຄານ.')),
          P('Send the OTP code we just sent you ', 'ສົ່ງລະຫັດ OTP ທີ່ພວກເຮົາຫາກໍສົ່ງໃຫ້ ', C('personal_data', 'Banks NEVER ask for your OTP. It lets them take your money.', 'ທະນາຄານບໍ່ເຄີຍຂໍ OTP. ມັນເຮັດໃຫ້ເຂົາເອົາເງິນທ່ານໄດ້.')),
          P('within 10 minutes or lose your money.', 'ພາຍໃນ 10 ນາທີ ບໍ່ດັ່ງນັ້ນຈະເສຍເງິນ.', C('urgency', 'Fear and a timer stop you from checking.', 'ຄວາມຢ້ານ ແລະ ເວລາຈຳກັດ ເຮັດໃຫ້ທ່ານບໍ່ກວດສອບ.')),
        ],
        actions: [
          A('Send the code to save the account', 'ສົ່ງລະຫັດເພື່ອຮັກສາບັນຊີ', false, 'The code lets them empty the account.', 'ລະຫັດນັ້ນເຮັດໃຫ້ເຂົາຖອນເງິນໝົດ.'),
          A('Call the bank on the number on her card', 'ໂທຫາທະນາຄານຕາມເບີໃນບັດ', true, 'Yes. Always use the number you already know.', 'ແມ່ນແລ້ວ. ໃຊ້ເບີທີ່ທ່ານຮູ້ຢູ່ແລ້ວສະເໝີ.'),
          A('Call back the number that texted', 'ໂທກັບເບີທີ່ສົ່ງມາ', false, 'That number belongs to the scammer.', 'ເບີນັ້ນເປັນຂອງຜູ້ຫຼອກລວງ.'),
        ],
        lesson: { en: 'Never share an OTP. Call the bank on the number you trust.', lo: 'ຢ່າແຊຣ໌ OTP. ໂທຫາທະນາຄານຕາມເບີທີ່ເຊື່ອຖືໄດ້.' },
      },
      {
        id: 'khamla-parcel', channel: 'sms', sender: { en: 'LaoPost-Delivery', lo: 'LaoPost-Delivery' }, isScam: true,
        situation: { en: 'Khamla is waiting for stock for her shop. A delivery text arrives.', lo: 'ຄຳຫຼ້າລໍຖ້າສິນຄ້າ. ມີຂໍ້ຄວາມສົ່ງເຄື່ອງມາ.' },
        parts: [
          P('Your parcel is held. ', 'ພັດສະດຸຂອງທ່ານຖືກກັກໄວ້. '),
          P('Pay 15,000 kip customs fee ', 'ຈ່າຍຄ່າພາສີ 15,000 ກີບ ', C('upfront_fee', 'A small fee feels harmless, but they want your card details.', 'ຄ່າທຳນຽມນ້ອຍເບິ່ງບໍ່ອັນຕະລາຍ ແຕ່ເຂົາຢາກໄດ້ຂໍ້ມູນບັດ.')),
          P('at laopost-pay.info', 'ທີ່ laopost-pay.info', C('suspicious_link', 'Fake address that copies the post office name.', 'ທີ່ຢູ່ປອມ ທີ່ກັອບປີ້ຊື່ໄປສະນີ.')),
        ],
        actions: [
          A('Pay, it is only 15,000', 'ຈ່າຍ ພຽງ 15,000', false, 'They take card details and charge much more later.', 'ເຂົາເອົາຂໍ້ມູນບັດ ແລ້ວຕັດເງິນຫຼາຍກວ່ານັ້ນ.'),
          A('Check the tracking number on the seller\'s real app', 'ກວດເລກພັດສະດຸໃນແອັບແທ້ຂອງຜູ້ຂາຍ', true, 'Right. Check through a channel you already use.', 'ຖືກ. ກວດຜ່ານຊ່ອງທາງທີ່ທ່ານໃຊ້ຢູ່ແລ້ວ.'),
          A('Reply STOP', 'ຕອບກັບ STOP', false, 'Replying tells them your number is active.', 'ການຕອບກັບບອກເຂົາວ່າເບີນີ້ໃຊ້ງານຢູ່.'),
        ],
        lesson: { en: 'Small fees through links are a common trick. Check in the real app.', lo: 'ຄ່າທຳນຽມນ້ອຍຜ່ານລິ້ງ ແມ່ນກົນທີ່ພົບເລື້ອຍ. ກວດໃນແອັບແທ້.' },
      },
      {
        id: 'khamla-teacher', channel: 'chat', sender: { en: 'Teacher Vanh (saved contact)', lo: 'ອາຈານວັນ (ເບີທີ່ບັນທຶກ)' }, isScam: false,
        situation: { en: 'Her son\'s teacher, already in her contacts, writes in the class group.', lo: 'ຄູຂອງລູກ ທີ່ມີໃນລາຍຊື່ຕິດຕໍ່ ຂຽນໃນກຸ່ມຫ້ອງ.' },
        parts: [
          P('Parents: the school trip is on Friday. ', 'ຜູ້ປົກຄອງ: ໄປທັດສະນະສຶກສາວັນສຸກ. '),
          P('Please sign the paper form and bring it to class. ', 'ກະລຸນາເຊັນໃບຟອມ ແລ້ວເອົາມາຫ້ອງ. ', C(undefined, 'Paper form handed in person. No money, no link.', 'ຟອມເຈ້ຍ ສົ່ງດ້ວຍຕົນເອງ. ບໍ່ມີເງິນ ບໍ່ມີລິ້ງ.')),
          P('See you at pick-up!', 'ພົບກັນຕອນມາຮັບ!', C(undefined, 'From a contact she knows, in the usual group.', 'ຈາກຄົນທີ່ຮູ້ຈັກ ໃນກຸ່ມປົກກະຕິ.')),
        ],
        actions: [
          A('Sign the form and send it with her son', 'ເຊັນຟອມ ແລ້ວໃຫ້ລູກເອົາໄປ', true, 'Yes, this is a normal, safe request.', 'ແມ່ນ ນີ້ແມ່ນຄຳຂໍທຳມະດາ ແລະ ປອດໄພ.'),
          A('Report the teacher', 'ລາຍງານຄູ', false, 'Nothing here is suspicious.', 'ບໍ່ມີຫຍັງໜ້າສົງໄສ.'),
          A('Send the teacher her ID photo', 'ສົ່ງຮູບບັດປະຈຳຕົວໃຫ້ຄູ', false, 'Nobody asked for that. Do not overshare.', 'ບໍ່ມີໃຜຂໍ. ຢ່າແຊຣ໌ຂໍ້ມູນເກີນ.'),
        ],
        lesson: { en: 'Known person + usual place + no money asked = usually safe.', lo: 'ຄົນຮູ້ຈັກ + ບ່ອນປົກກະຕິ + ບໍ່ຂໍເງິນ = ສ່ວນຫຼາຍປອດໄພ.' },
      },
    ],
  },
  {
    id: 'elder', avatar: { skin: 1, hair: 3, outfit: 3, extra: 3 }, name: { en: 'Grandpa Bounmy', lo: 'ພໍ່ເຖົ້າບຸນມີ' }, age: 68, who: { en: 'Retired, loves his grandchildren', lo: 'ບຳນານ ຮັກຫຼານຫຼາຍ' },
    cases: [
      {
        id: 'bounmy-grandson', channel: 'call', sender: { en: 'Unknown number', lo: 'ເບີບໍ່ຮູ້ຈັກ' }, isScam: true,
        situation: { en: 'A crying voice calls Grandpa late at night.', lo: 'ສຽງຮ້ອງໄຫ້ໂທຫາພໍ່ຕູ້ຕອນເດິກ.' },
        parts: [
          P('Grandpa, it\'s me! I had an accident. ', 'ພໍ່ຕູ້ ແມ່ນຫຼານເອງ! ຫຼານເກີດອຸບັດຕິເຫດ. ', C('unverified_identity', '"It\'s me" with no name. A new number. Is it really him?', '"ແມ່ນຫຼານເອງ" ບໍ່ບອກຊື່. ເບີໃໝ່. ແມ່ນຫຼານແທ້ບໍ?')),
          P('Send 3 million kip now ', 'ສົ່ງ 3 ລ້ານກີບດຽວນີ້ ', C('urgency', 'Panic plus "now" is the scam pattern.', 'ຄວາມຕົກໃຈ ບວກ "ດຽວນີ້" ແມ່ນຮູບແບບການຫຼອກ.')),
          P('and please don\'t tell Mum.', 'ແລະ ຢ່າບອກແມ່ເດີ້.', C('unverified_identity', 'Asking for secrecy stops you from checking with family.', 'ການຂໍໃຫ້ປິດລັບ ເພື່ອບໍ່ໃຫ້ທ່ານກວດກັບຄອບຄົວ.')),
        ],
        actions: [
          A('Send the money right away', 'ສົ່ງເງິນທັນທີ', false, 'Scammers copy voices. The money would be gone.', 'ຜູ້ຫຼອກລວງປອມສຽງໄດ້. ເງິນຈະຫາຍໄປ.'),
          A('Hang up and call his grandson\'s usual number', 'ວາງສາຍ ແລ້ວໂທຫາເບີປົກກະຕິຂອງຫຼານ', true, 'Perfect. Call back on a number you know.', 'ດີຫຼາຍ. ໂທກັບເບີທີ່ຮູ້ຈັກ.'),
          A('Ask the caller for his bank details', 'ຂໍເລກບັນຊີຈາກຜູ້ໂທ', false, 'That still leads to sending money.', 'ນັ້ນຍັງນຳໄປສູ່ການສົ່ງເງິນ.'),
        ],
        lesson: { en: 'Family emergency + secret + money = hang up and call back yourself.', lo: 'ເຫດດ່ວນຄອບຄົວ + ປິດລັບ + ເງິນ = ວາງສາຍ ແລ້ວໂທກັບເອງ.' },
      },
      {
        id: 'bounmy-pension', channel: 'call', sender: { en: '"Pension Office"', lo: '"ຫ້ອງການບຳນານ"' }, isScam: true,
        situation: { en: 'Someone says they work for the pension office.', lo: 'ມີຄົນບອກວ່າເຮັດວຽກຫ້ອງການບຳນານ.' },
        parts: [
          P('Your pension will stop this week. ', 'ເງິນບຳນານຂອງທ່ານຈະຢຸດອາທິດນີ້. ', C('urgency', 'Threatening to stop money makes you afraid.', 'ການຂູ່ວ່າຈະຢຸດເງິນ ເຮັດໃຫ້ທ່ານຢ້ານ.')),
          P('Tell me your ID number and bank PIN ', 'ບອກເລກບັດ ແລະ PIN ທະນາຄານ ', C('personal_data', 'No office ever needs your PIN.', 'ບໍ່ມີຫ້ອງການໃດຕ້ອງການ PIN ຂອງທ່ານ.')),
          P('to update the system.', 'ເພື່ອອັບເດດລະບົບ.'),
        ],
        actions: [
          A('Give the details to keep the pension', 'ໃຫ້ຂໍ້ມູນເພື່ອຮັກສາບຳນານ', false, 'They would empty his account.', 'ເຂົາຈະຖອນເງິນໝົດບັນຊີ.'),
          A('Hang up and visit the office with family', 'ວາງສາຍ ແລ້ວໄປຫ້ອງການກັບລູກຫຼານ', true, 'Yes. Check in person with someone you trust.', 'ແມ່ນ. ກວດດ້ວຍຕົນເອງ ກັບຄົນທີ່ໄວ້ໃຈ.'),
          A('Give only the ID number', 'ໃຫ້ພຽງເລກບັດ', false, 'Even part of your details helps scammers.', 'ແມ່ນແຕ່ຂໍ້ມູນບາງສ່ວນ ກໍຊ່ວຍຜູ້ຫຼອກລວງ.'),
        ],
        lesson: { en: 'Your PIN is only for you. Nobody official will ask for it.', lo: 'PIN ແມ່ນສຳລັບທ່ານຄົນດຽວ. ບໍ່ມີທາງການໃດຂໍ.' },
      },
      {
        id: 'bounmy-temple', channel: 'chat', sender: { en: 'Daughter Malee', lo: 'ລູກສາວມາລີ' }, isScam: false,
        situation: { en: 'His daughter, in the family chat he always uses, sends a message.', lo: 'ລູກສາວ ສົ່ງຂໍ້ຄວາມໃນກຸ່ມຄອບຄົວທີ່ໃຊ້ສະເໝີ.' },
        parts: [
          P('Dad, I\'ll pick you up at 7 for the temple festival. ', 'ພໍ່ ລູກຈະມາຮັບ 7 ໂມງ ໄປບຸນວັດ. ', C(undefined, 'A normal family plan in the usual chat.', 'ແຜນຄອບຄົວທຳມະດາ ໃນແຊັດປົກກະຕິ.')),
          P('Bring your jacket, it\'s cold!', 'ເອົາເສື້ອກັນໜາວໄປນຳ ໜາວເດີ້!', C(undefined, 'No money, no link, no secret.', 'ບໍ່ມີເງິນ ບໍ່ມີລິ້ງ ບໍ່ມີຄວາມລັບ.')),
        ],
        actions: [
          A('Reply "OK, see you at 7"', 'ຕອບ "ໂອເຄ ພົບກັນ 7 ໂມງ"', true, 'Yes, enjoy the festival!', 'ແມ່ນ ມ່ວນກັບງານບຸນ!'),
          A('Block his daughter', 'ບລັອກລູກສາວ', false, 'Nothing is wrong here.', 'ບໍ່ມີຫຍັງຜິດ.'),
          A('Send her his PIN just in case', 'ສົ່ງ PIN ໃຫ້ລູກໄວ້ກ່ອນ', false, 'Never send a PIN by chat, even to family.', 'ຢ່າສົ່ງ PIN ທາງແຊັດ ແມ່ນແຕ່ຄອບຄົວ.'),
        ],
        lesson: { en: 'Being careful does not mean trusting nobody. Check, then relax.', lo: 'ການລະວັງ ບໍ່ແມ່ນບໍ່ໄວ້ໃຈໃຜເລີຍ. ກວດແລ້ວ ກໍສະບາຍໃຈ.' },
      },
    ],
  },
  {
    id: 'worker', avatar: { skin: 3, hair: 0, outfit: 5, extra: 2 }, name: { en: 'Dara', lo: 'ດາຣາ' }, age: 24, who: { en: 'Wants to work abroad', lo: 'ຢາກໄປເຮັດວຽກຕ່າງປະເທດ' },
    cases: [
      {
        id: 'dara-abroad', channel: 'chat', sender: { en: 'Agent Kim', lo: 'ນາຍໜ້າຄິມ' }, isScam: true,
        situation: { en: 'Dara joined a job group. An "agent" sends a private message.', lo: 'ດາຣາເຂົ້າກຸ່ມວຽກ. "ນາຍໜ້າ" ສົ່ງຂໍ້ຄວາມສ່ວນຕົວ.' },
        parts: [
          P('Office job abroad, $1,500 a month, ', 'ວຽກຫ້ອງການຕ່າງປະເທດ ເດືອນລະ $1,500 ', C('too_good', 'Very high pay with no skills needed.', 'ເງິນເດືອນສູງຫຼາຍ ບໍ່ຕ້ອງມີທັກສະ.')),
          P('no interview. ', 'ບໍ່ຕ້ອງສຳພາດ. ', C('unverified_identity', 'Real employers want to meet you. No company name either.', 'ນາຍຈ້າງແທ້ຢາກພົບທ່ານ. ບໍ່ມີຊື່ບໍລິສັດ.')),
          P('We pay your ticket. Give me your passport at the border.', 'ພວກເຮົາຈ່າຍປີ້ໃຫ້. ເອົາໜັງສືຜ່ານແດນໃຫ້ຂ້ອຍທີ່ດ່ານ.', C('personal_data', 'Taking your passport traps you. This is how trafficking starts.', 'ການຍຶດໜັງສືຜ່ານແດນ ແມ່ນການກັກຂັງ. ການຄ້າມະນຸດເລີ່ມແບບນີ້.')),
        ],
        actions: [
          A('Accept, it is a great chance', 'ຕົກລົງ ເປັນໂອກາດດີ', false, 'This could lead to forced work in a scam compound.', 'ອາດນຳໄປສູ່ການບັງຄັບເຮັດວຽກໃນແກ໊ງຫຼອກລວງ.'),
          A('Check the agency with the labour office first', 'ກວດບໍລິສັດກັບຫ້ອງການແຮງງານກ່ອນ', true, 'Yes. Only use licensed agencies.', 'ແມ່ນ. ໃຊ້ພຽງບໍລິສັດທີ່ມີໃບອະນຸຍາດ.'),
          A('Go, but keep a photo of the passport', 'ໄປ ແຕ່ເກັບຮູບໜັງສືຜ່ານແດນໄວ້', false, 'A photo will not help if they keep the real one.', 'ຮູບບໍ່ຊ່ວຍ ຖ້າເຂົາຍຶດເຫຼັ້ມແທ້.'),
        ],
        lesson: { en: 'Never hand your passport to a recruiter. Check licensed agencies.', lo: 'ຢ່າເອົາໜັງສືຜ່ານແດນໃຫ້ນາຍໜ້າ. ກວດບໍລິສັດທີ່ມີໃບອະນຸຍາດ.' },
      },
      {
        id: 'dara-crypto', channel: 'chat', sender: { en: 'Lily (new friend)', lo: 'ລີລີ (ໝູ່ໃໝ່)' }, isScam: true,
        situation: { en: 'A friendly stranger has chatted with Dara for two weeks.', lo: 'ຄົນແປກໜ້າທີ່ເປັນມິດ ລົມກັບດາຣາມາສອງອາທິດ.' },
        parts: [
          P('I made $3,000 this week with this app! ', 'ອາທິດນີ້ຂ້ອຍໄດ້ $3,000 ຈາກແອັບນີ້! ', C('too_good', 'Fast, sure profit is the bait.', 'ກຳໄລໄວ ແລະ ແນ່ນອນ ແມ່ນເຫຍື່ອ.')),
          P('Start with just $100. ', 'ເລີ່ມພຽງ $100. ', C('upfront_fee', 'Small at first, then they ask for more and more.', 'ເລີ່ມນ້ອຍ ແລ້ວຂໍຫຼາຍຂຶ້ນເລື້ອຍໆ.')),
          P('Profit is guaranteed, trust me', 'ຮັບປະກັນກຳໄລ ເຊື່ອຂ້ອຍເດີ້', C('too_good', '"Guaranteed" investing does not exist.', 'ການລົງທຶນ "ຮັບປະກັນ" ບໍ່ມີແທ້.')),
        ],
        actions: [
          A('Try with $100 to test', 'ລອງ $100 ເບິ່ງ', false, 'You may see fake profit, then never get money out.', 'ອາດເຫັນກຳໄລປອມ ແຕ່ຖອນເງິນບໍ່ໄດ້.'),
          A('Stop chatting and report the account', 'ຢຸດລົມ ແລະ ລາຍງານບັນຊີ', true, 'Right. Romance + investment is a known scam.', 'ຖືກ. ຄວາມຮັກ + ການລົງທຶນ ແມ່ນການຫຼອກທີ່ຮູ້ຈັກ.'),
          A('Ask Lily for a video call first', 'ຂໍວິດີໂອຄອນກັບລີລີກ່ອນ', false, 'Better, but deepfake calls exist. Do not invest.', 'ດີກວ່າ ແຕ່ມີວິດີໂອປອມ. ຢ່າລົງທຶນ.'),
        ],
        lesson: { en: 'Online friends who talk about investing are a big red flag.', lo: 'ໝູ່ອອນລາຍທີ່ເວົ້າເລື່ອງລົງທຶນ ແມ່ນສັນຍານອັນຕະລາຍໃຫຍ່.' },
      },
      {
        id: 'dara-labour', channel: 'sms', sender: { en: 'Ministry of Labour', lo: 'ກະຊວງແຮງງານ' }, isScam: false,
        situation: { en: 'Dara visited the labour office yesterday and gave his number there.', lo: 'ດາຣາໄປຫ້ອງການແຮງງານມື້ວານ ແລະ ໃຫ້ເບີໄວ້.' },
        parts: [
          P('Your training class starts 3 June at the Labour Office. ', 'ຫ້ອງຝຶກອົບຮົມເລີ່ມ 3 ມິຖຸນາ ທີ່ຫ້ອງການແຮງງານ. ', C(undefined, 'Matches something Dara really did.', 'ກົງກັບສິ່ງທີ່ດາຣາເຮັດແທ້.')),
          P('Free. Bring your ID card.', 'ຟຣີ. ເອົາບັດປະຈຳຕົວມາ.', C(undefined, 'Free, in person, no link, no payment.', 'ຟຣີ ມາດ້ວຍຕົນເອງ ບໍ່ມີລິ້ງ ບໍ່ຈ່າຍເງິນ.')),
        ],
        actions: [
          A('Go to the class on 3 June', 'ໄປຫ້ອງຮຽນວັນທີ 3 ມິຖຸນາ', true, 'Yes, this is the safe path to work abroad.', 'ແມ່ນ ນີ້ແມ່ນທາງປອດໄພໄປເຮັດວຽກຕ່າງປະເທດ.'),
          A('Ignore it', 'ບໍ່ສົນໃຈ', false, 'It matches his real visit. It is safe.', 'ກົງກັບການໄປແທ້. ປອດໄພ.'),
          A('Send money to save his place', 'ສົ່ງເງິນຈອງບ່ອນ', false, 'Nobody asked for money. Do not offer it.', 'ບໍ່ມີໃຜຂໍເງິນ. ຢ່າສະເໜີ.'),
        ],
        lesson: { en: 'A message that matches what you did, with no money asked, is usually real.', lo: 'ຂໍ້ຄວາມທີ່ກົງກັບສິ່ງທີ່ທ່ານເຮັດ ແລະ ບໍ່ຂໍເງິນ ສ່ວນຫຼາຍແມ່ນແທ້.' },
      },
    ],
  },
];
