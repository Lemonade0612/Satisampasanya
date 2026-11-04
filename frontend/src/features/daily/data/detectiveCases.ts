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
    id: 'kid', avatar: { skin: 2, hair: 0, outfit: 0, extra: 0 }, name: { en: 'Ton', lo: 'ຕົ້ນ' }, age: 10, who: { en: 'Loves mobile games and videos', lo: 'ມັກເກມມືຖື ແລະ ວິດີໂອ' },
    cases: [
      {
        id: 'ton-skins', channel: 'chat', sender: { en: 'GameMaster_Official', lo: 'GameMaster_Official' }, isScam: true,
        situation: { en: 'Ton is playing his favourite game. A message pops up in the game chat.', lo: 'ຕົ້ນກຳລັງຫຼິ້ນເກມທີ່ມັກ. ມີຂໍ້ຄວາມເດັ້ງຂຶ້ນໃນແຊັດເກມ.' },
        parts: [
          P('You won 5 rare skins for FREE! ', 'ທ່ານໄດ້ສະກິນຫາຍາກ 5 ອັນ ຟຣີ! ', C('too_good', 'Free rare stuff for doing nothing? Too good to be true.', 'ຂອງຫາຍາກຟຣີ ໂດຍບໍ່ໄດ້ເຮັດຫຍັງ? ດີເກີນຈິງ.')),
          P('Type your game password here ', 'ພິມລະຫັດເກມຂອງທ່ານບ່ອນນີ້ ', C('personal_data', 'Your password is secret. Real game staff never ask for it.', 'ລະຫັດແມ່ນຄວາມລັບ. ທີມງານເກມແທ້ບໍ່ເຄີຍຂໍ.')),
          P('at skins-free-claim.xyz ', 'ທີ່ skins-free-claim.xyz ', C('suspicious_link', 'A strange website that is not the game.', 'ເວັບແປກໆ ບໍ່ແມ່ນເວັບຂອງເກມ.')),
          P('in 5 minutes or they disappear!', 'ພາຍໃນ 5 ນາທີ ບໍ່ດັ່ງນັ້ນຈະຫາຍໄປ!', C('urgency', 'Hurrying you so you do not stop and ask someone.', 'ເລັ່ງໃຫ້ຮີບ ເພື່ອບໍ່ໃຫ້ທ່ານຢຸດຖາມຜູ້ໃຫຍ່.')),
        ],
        actions: [
          A('Type the password fast before time runs out', 'ພິມລະຫັດໄວໆ ກ່ອນໝົດເວລາ', false, 'They would steal Ton\'s account and all his items.', 'ເຂົາຈະລັກບັນຊີ ແລະ ຂອງທັງໝົດຂອງຕົ້ນ.'),
          A('Close it and show a grown-up', 'ປິດ ແລ້ວບອກຜູ້ໃຫຍ່', true, 'Yes! Telling a grown-up is always a smart move.', 'ແມ່ນແລ້ວ! ບອກຜູ້ໃຫຍ່ ແມ່ນທາງເລືອກທີ່ສະຫຼາດສະເໝີ.'),
          A('Send the link to friends so they get skins too', 'ສົ່ງລິ້ງໃຫ້ໝູ່ ໃຫ້ໄດ້ສະກິນນຳ', false, 'That would trick his friends too.', 'ນັ້ນຈະເຮັດໃຫ້ໝູ່ຖືກຫຼອກນຳ.'),
        ],
        lesson: { en: 'Never share your password, not even for free prizes.', lo: 'ຢ່າບອກລະຫັດໃຫ້ໃຜ ແມ່ນແຕ່ເພື່ອລາງວັນຟຣີ.' },
      },
      {
        id: 'ton-teacher', channel: 'chat', sender: { en: 'Class 4B (Teacher Vanh)', lo: 'ຫ້ອງ 4ຂ (ຄູວັນ)' }, isScam: false,
        situation: { en: 'Ton\'s class group, the one his mum added him to, gets a message.', lo: 'ກຸ່ມຫ້ອງຮຽນ ທີ່ແມ່ເພີ່ມຕົ້ນເຂົ້າ ມີຂໍ້ຄວາມໃໝ່.' },
        parts: [
          P('Field trip to the zoo on Friday! ', 'ວັນສຸກໄປທັດສະນະສວນສັດ! ', C(undefined, 'News from the teacher in the usual class group.', 'ຂ່າວຈາກຄູ ໃນກຸ່ມຫ້ອງປົກກະຕິ.')),
          P('Bring water and a hat. ', 'ເອົານ້ຳ ແລະ ໝວກມານຳ. '),
          P('Ask your parents to sign the paper I gave you.', 'ໃຫ້ພໍ່ແມ່ເຊັນເຈ້ຍທີ່ຄູໃຫ້.', C(undefined, 'It asks you to involve your parents. Scammers want you to hide things.', 'ໃຫ້ບອກພໍ່ແມ່. ຜູ້ຫຼອກລວງຢາກໃຫ້ທ່ານປິດບັງ.')),
        ],
        actions: [
          A('Show Mum the message and the paper', 'ເອົາຂໍ້ຄວາມ ແລະ ເຈ້ຍໃຫ້ແມ່ເບິ່ງ', true, 'Great. Have fun at the zoo!', 'ດີຫຼາຍ. ມ່ວນໆຢູ່ສວນສັດ!'),
          A('Leave the group, it might be a trick', 'ອອກຈາກກຸ່ມ ອາດແມ່ນກົນຫຼອກ', false, 'Nothing is wrong here. Ton would miss the trip.', 'ບໍ່ມີຫຍັງຜິດ. ຕົ້ນຈະພາດການໄປທັດສະນະ.'),
          A('Reply with Mum\'s phone password', 'ຕອບດ້ວຍລະຫັດໂທລະສັບຂອງແມ່', false, 'Nobody asked for that, and it should never be shared.', 'ບໍ່ມີໃຜຂໍ ແລະ ບໍ່ຄວນແບ່ງປັນເລີຍ.'),
        ],
        lesson: { en: 'A message that asks you to tell your parents is a good sign.', lo: 'ຂໍ້ຄວາມທີ່ໃຫ້ບອກພໍ່ແມ່ ແມ່ນສັນຍານທີ່ດີ.' },
      },
      {
        id: 'ton-star', channel: 'chat', sender: { en: 'Famous Gamer ★', lo: 'ນັກເກມດັງ ★' }, isScam: true,
        situation: { en: 'An account with a famous gamer\'s name sends Ton a private message.', lo: 'ບັນຊີທີ່ໃຊ້ຊື່ນັກເກມດັງ ສົ່ງຂໍ້ຄວາມສ່ວນຕົວຫາຕົ້ນ.' },
        parts: [
          P('Hi! I picked you for a surprise gift box! ', 'ສະບາຍດີ! ພີ່ເລືອກນ້ອງໄດ້ກ່ອງຂອງຂວັນ! ', C('unverified_identity', 'Anyone can copy a famous name and photo.', 'ໃຜກໍ່ກັອບຊື່ ແລະ ຮູບຄົນດັງໄດ້.')),
          P('Send me a photo of you and your home address. ', 'ສົ່ງຮູບ ແລະ ທີ່ຢູ່ບ້ານມາໃຫ້. ', C('personal_data', 'Your photo and address are private. Strangers should never get them.', 'ຮູບ ແລະ ທີ່ຢູ່ແມ່ນເລື່ອງສ່ວນຕົວ. ຢ່າໃຫ້ຄົນແປກໜ້າ.')),
          P('Don\'t tell your parents, it\'s our secret!', 'ຢ່າບອກພໍ່ແມ່ເດີ້ ເປັນຄວາມລັບຂອງເຮົາ!', C('off_platform', 'An adult asking a child to keep secrets from parents is a big danger sign.', 'ຜູ້ໃຫຍ່ທີ່ໃຫ້ເດັກປິດລັບພໍ່ແມ່ ແມ່ນສັນຍານອັນຕະລາຍໃຫຍ່.')),
        ],
        actions: [
          A('Send the photo, he is famous', 'ສົ່ງຮູບໄປ ເພາະເຂົາດັງ', false, 'This could put Ton in real danger. Famous people do not do this.', 'ອາດເຮັດໃຫ້ຕົ້ນຕົກຢູ່ໃນອັນຕະລາຍ. ຄົນດັງບໍ່ເຮັດແບບນີ້.'),
          A('Keep it secret but don\'t reply', 'ປິດລັບໄວ້ ແຕ່ບໍ່ຕອບ', false, 'Not replying is good, but secrets like this must be told.', 'ບໍ່ຕອບແມ່ນດີ ແຕ່ຄວາມລັບແບບນີ້ຕ້ອງບອກ.'),
          A('Block, and tell Mum or Dad right away', 'ບລັອກ ແລ້ວບອກພໍ່ ຫຼື ແມ່ທັນທີ', true, 'Exactly. Good secrets are surprises; bad secrets make you hide things from family.', 'ຖືກຕ້ອງ. ຄວາມລັບດີແມ່ນເຊີໄພຣສ໌; ຄວາມລັບບໍ່ດີເຮັດໃຫ້ປິດບັງຄອບຄົວ.'),
        ],
        lesson: { en: 'If someone says "don\'t tell your parents", tell your parents.', lo: 'ຖ້າມີຄົນບອກວ່າ "ຢ່າບອກພໍ່ແມ່" ໃຫ້ບອກພໍ່ແມ່.' },
      },
      {
        id: 'ton-diamonds', channel: 'chat', sender: { en: 'DiamondTasks 💎', lo: 'DiamondTasks 💎' }, isScam: true,
        situation: { en: 'Ton finds an app that pays diamonds for watching ads. After a few days, this appears.', lo: 'ຕົ້ນພົບແອັບທີ່ໃຫ້ເພັດ ເມື່ອເບິ່ງໂຄສະນາ. ຫຼາຍມື້ຕໍ່ມາ ມີຂໍ້ຄວາມນີ້.' },
        parts: [
          P('Great job! You have 9,500 diamonds! ', 'ເກັ່ງຫຼາຍ! ເຈົ້າມີ 9,500 ເພັດ! ', C('too_good', 'A big number on the screen is not real money. The app can show anything.', 'ຕົວເລກໃຫຍ່ໃນໜ້າຈໍ ບໍ່ແມ່ນເງິນແທ້. ແອັບສະແດງຫຍັງກໍ່ໄດ້.')),
          P('Level 3 unlocks DOUBLE diamonds. ', 'ເລເວລ 3 ປົດລັອກເພັດສອງເທົ່າ. ', C('too_good', 'Levels and rewards keep you hooked, like a game.', 'ເລເວລ ແລະ ລາງວັນ ເຮັດໃຫ້ຕິດ ຄືເກມ.')),
          P('Ask Mum to top up 50,000 kip to unlock it. ', 'ຂໍໃຫ້ແມ່ເຕີມ 50,000 ກີບ ເພື່ອປົດລັອກ. ', C('upfront_fee', 'Pay to unlock your prize? That is how task scams take money.', 'ຈ່າຍເພື່ອປົດລັອກລາງວັນ? ນັ້ນແມ່ນວິທີການຫຼອກແບບວຽກເອົາເງິນ.')),
          P('Tell her it is for school books.', 'ບອກແມ່ວ່າເປັນຄ່າປຶ້ມ.', C('off_platform', 'They want Ton to lie to his mum. That is a big danger sign.', 'ເຂົາຢາກໃຫ້ຕົ້ນຕົວະແມ່. ນັ້ນແມ່ນສັນຍານອັນຕະລາຍໃຫຍ່.')),
        ],
        actions: [
          A('Ask Mum for 50,000 kip for "books"', 'ຂໍເງິນແມ່ 50,000 ກີບ ຄ່າ "ປຶ້ມ"', false, 'The diamonds never come out, and Mum loses money.', 'ເພັດບໍ່ເຄີຍຖອນໄດ້ ແລະ ແມ່ເສຍເງິນ.'),
          A('Keep watching ads but never pay', 'ເບິ່ງໂຄສະນາຕໍ່ ແຕ່ບໍ່ຈ່າຍ', false, 'Better, but the app will keep pushing. Tell a grown-up.', 'ດີກວ່າ ແຕ່ແອັບຈະຍູ້ຕໍ່ໄປ. ບອກຜູ້ໃຫຍ່.'),
          A('Show Mum the real message and delete the app', 'ເອົາຂໍ້ຄວາມແທ້ໃຫ້ແມ່ເບິ່ງ ແລ້ວລຶບແອັບ', true, 'Yes! Telling the truth beats the trick every time.', 'ແມ່ນແລ້ວ! ການບອກຄວາມຈິງ ຊະນະກົນຫຼອກທຸກເທື່ອ.'),
        ],
        lesson: { en: 'If an app asks for money to unlock your prize, the prize is fake.', lo: 'ຖ້າແອັບຂໍເງິນເພື່ອປົດລັອກລາງວັນ ລາງວັນນັ້ນແມ່ນປອມ.' },
      },
      {
        id: 'ton-sister', channel: 'chat', sender: { en: 'ProGamer_Lin', lo: 'ProGamer_Lin' }, isScam: true,
        situation: { en: 'An older player Ton games with every evening sends a private message.', lo: 'ຜູ້ຫຼິ້ນທີ່ໃຫຍ່ກວ່າ ທີ່ຕົ້ນຫຼິ້ນນຳທຸກແລງ ສົ່ງຂໍ້ຄວາມສ່ວນຕົວມາ.' },
        parts: [
          P('Your big sister can earn 5 million kip a month as a game tester abroad! ', 'ເອື້ອຍເຈົ້າຫາເງິນໄດ້ເດືອນລະ 5 ລ້ານກີບ ເປັນຄົນທົດສອບເກມຢູ່ຕ່າງປະເທດ! ', C('too_good', 'A big salary for an easy job, offered through a child. Too good to be true.', 'ເງິນເດືອນສູງ ວຽກງ່າຍ ສະເໜີຜ່ານເດັກ. ດີເກີນຈິງ.')),
          P('Send me her photo and phone number. ', 'ສົ່ງຮູບ ແລະ ເບີໂທຂອງເອື້ອຍມາ. ', C('personal_data', 'Recruiters use kids to reach older brothers and sisters. Family details are private.', 'ຄົນຊັກຊວນໃຊ້ເດັກ ເພື່ອເຂົ້າຫາອ້າຍເອື້ອຍ. ຂໍ້ມູນຄອບຄົວເປັນເລື່ອງສ່ວນຕົວ.')),
          P('Keep it a surprise, don\'t tell your parents.', 'ໃຫ້ເປັນເຊີໄພຣສ໌ ຢ່າບອກພໍ່ແມ່.', C('off_platform', 'A "surprise" that hides things from parents is a bad secret.', '"ເຊີໄພຣສ໌" ທີ່ປິດບັງພໍ່ແມ່ ແມ່ນຄວາມລັບທີ່ບໍ່ດີ.')),
        ],
        actions: [
          A('Send the photo, it would help his sister', 'ສົ່ງຮູບໄປ ຈະໄດ້ຊ່ວຍເອື້ອຍ', false, 'Fake jobs abroad can trap people far from home.', 'ວຽກປອມຕ່າງປະເທດ ອາດກັກຄົນໄວ້ໄກບ້ານ.'),
          A('Block him and tell Mum, Dad and his sister', 'ບລັອກ ແລ້ວບອກພໍ່ ແມ່ ແລະ ເອື້ອຍ', true, 'Perfect. Now the whole family knows to watch out.', 'ດີເລີດ. ຕອນນີ້ທັງຄອບຄົວຮູ້ວ່າຕ້ອງລະວັງ.'),
          A('Ask him for more details first', 'ຖາມລາຍລະອຽດກ່ອນ', false, 'He will only tell more nice lies. Stop and tell a grown-up.', 'ເຂົາຈະຕົວະງາມໆຕື່ມ. ຢຸດ ແລ້ວບອກຜູ້ໃຫຍ່.'),
        ],
        lesson: { en: 'Never share family photos or numbers with online friends. Job offers go to grown-ups.', lo: 'ຢ່າແຊຣ໌ຮູບ ຫຼື ເບີຂອງຄອບຄົວໃຫ້ໝູ່ອອນລາຍ. ເລື່ອງວຽກຕ້ອງໃຫ້ຜູ້ໃຫຍ່.' },
      },
      {
        id: 'ton-cousin', channel: 'chat', sender: { en: 'Family group', lo: 'ກຸ່ມຄອບຄົວ' }, isScam: false,
        situation: { en: 'Cousin Keo, who works in Vientiane, writes in the family group Mum made.', lo: 'ພີ່ແກ້ວ ທີ່ເຮັດວຽກຢູ່ວຽງຈັນ ຂຽນໃນກຸ່ມຄອບຄົວທີ່ແມ່ສ້າງ.' },
        parts: [
          P('I\'m coming home for Boun That Luang! ', 'ພີ່ຈະກັບບ້ານງານບຸນທາດຫຼວງ! ', C(undefined, 'News in the family group everyone already uses.', 'ຂ່າວໃນກຸ່ມຄອບຄົວທີ່ທຸກຄົນໃຊ້ຢູ່.')),
          P('Ton, I got you a football. ', 'ຕົ້ນ ພີ່ຊື້ບານໃຫ້. '),
          P('Auntie, I\'ll come by on Sunday afternoon.', 'ປ້າ ພີ່ຈະມາຫາວັນອາທິດຕອນບ່າຍ.', C(undefined, 'Plans to meet the family in person. Nothing secret, nothing to pay.', 'ນັດພົບຄອບຄົວຕົວຈິງ. ບໍ່ມີຄວາມລັບ ບໍ່ຕ້ອງຈ່າຍ.')),
        ],
        actions: [
          A('Reply "Yay!" and tell Mum', 'ຕອບ "ເຢ້!" ແລ້ວບອກແມ່', true, 'A happy message from family. Enjoy the football!', 'ຂໍ້ຄວາມດີໆຈາກຄອບຄົວ. ມ່ວນກັບບານເດີ້!'),
          A('Block Keo, it could be fake', 'ບລັອກພີ່ແກ້ວ ອາດແມ່ນປອມ', false, 'Nothing is wrong here. Being careful is good, but not with everyone.', 'ບໍ່ມີຫຍັງຜິດ. ລະວັງແມ່ນດີ ແຕ່ບໍ່ແມ່ນກັບທຸກຄົນ.'),
          A('Ask Keo to send money for a new game', 'ຂໍເງິນພີ່ແກ້ວຊື້ເກມໃໝ່', false, 'Not a scam, but not very polite either!', 'ບໍ່ແມ່ນການຫຼອກ ແຕ່ກໍ່ບໍ່ສຸພາບ!'),
        ],
        lesson: { en: 'Safe messages come from people you know, in groups you know, and ask for nothing.', lo: 'ຂໍ້ຄວາມປອດໄພ ມາຈາກຄົນທີ່ຮູ້ຈັກ ໃນກຸ່ມທີ່ຮູ້ຈັກ ແລະ ບໍ່ຂໍຫຍັງ.' },
      },
    ],
  },
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
      {
        id: 'noy-chatjob', channel: 'chat', sender: { en: 'Hiring Girls 18+ 💕', lo: 'ຮັບສະໝັກສາວ 18+ 💕' }, isScam: true,
        situation: { en: 'Noy turns 18 next month. A job page messages her after she likes a post.', lo: 'ນ້ອຍຈະອາຍຸ 18 ເດືອນໜ້າ. ເພຈວຽກສົ່ງຂໍ້ຄວາມມາ ຫຼັງຈາກນາງກົດໄລກ໌ໂພສ.' },
        parts: [
          P('Online chat job, 8 million kip a month! ', 'ວຽກແຊັດອອນລາຍ ເດືອນລະ 8 ລ້ານກີບ! ', C('too_good', 'Far more than a normal first job pays, for "just chatting".', 'ຫຼາຍກວ່າວຽກທຳອິດປົກກະຕິ ສຳລັບ "ແຄ່ລົມ".')),
          P('Free meals and a free room at our office near the border. ', 'ອາຫານຟຣີ ຫ້ອງພັກຟຣີ ທີ່ຫ້ອງການໃກ້ຊາຍແດນ. ', C('upfront_fee', 'In real Lao cases, "free" room and food became debts with quotas no one could reach.', 'ໃນກໍລະນີແທ້ໃນລາວ ຫ້ອງ ແລະ ອາຫານ "ຟຣີ" ກາຍເປັນໜີ້ ພ້ອມເປົ້າໝາຍທີ່ບໍ່ມີໃຜເຮັດໄດ້.')),
          P('No company name needed, just send your photo. ', 'ບໍ່ຕ້ອງຮູ້ຊື່ບໍລິສັດ ແຄ່ສົ່ງຮູບມາ. ', C('unverified_identity', 'No company, no address you can check. You cannot verify who they are.', 'ບໍ່ມີບໍລິສັດ ບໍ່ມີທີ່ຢູ່ທີ່ກວດໄດ້. ກວດບໍ່ໄດ້ວ່າແມ່ນໃຜ.')),
          P('Bus leaves Saturday, we pay the ticket.', 'ລົດອອກວັນເສົາ ເຮົາອອກຄ່າປີ້ໃຫ້.', C('urgency', 'Fast departure and paid travel mean less time to check, and you owe them.', 'ອອກເດີນທາງໄວ ແລະ ອອກຄ່າລົດໃຫ້ ເຮັດໃຫ້ບໍ່ມີເວລາກວດ ແລະ ຕິດໜີ້ເຂົາ.')),
        ],
        actions: [
          A('Send a photo and book the Saturday bus', 'ສົ່ງຮູບ ແລ້ວຈອງລົດວັນເສົາ', false, 'This is how "chat girl" debt traps begin.', 'ນີ້ແມ່ນວິທີທີ່ກັບດັກໜີ້ "ສາວແຊັດ" ເລີ່ມຕົ້ນ.'),
          A('Ask for the company name and real address, check it with the labour office, and tell family', 'ຂໍຊື່ບໍລິສັດ ແລະ ທີ່ຢູ່ແທ້ ກວດກັບຫ້ອງການແຮງງານ ແລະ ບອກຄອບຄົວ', true, 'Right. A real employer can be checked. This one will likely disappear.', 'ຖືກ. ນາຍຈ້າງແທ້ກວດໄດ້. ຄົນນີ້ຄົງຈະຫາຍໄປ.'),
          A('Go, but promise to call home every day', 'ໄປ ແຕ່ສັນຍາວ່າຈະໂທກັບບ້ານທຸກມື້', false, 'Phones are often taken on arrival. A plan to call is not protection.', 'ໂທລະສັບມັກຖືກຍຶດເມື່ອໄປຮອດ. ແຜນໂທບໍ່ແມ່ນການປ້ອງກັນ.'),
        ],
        lesson: { en: 'Free housing and travel can become debt. Check the real employer and worksite before you go.', lo: 'ທີ່ພັກ ແລະ ຄ່າເດີນທາງຟຣີ ອາດກາຍເປັນໜີ້. ກວດນາຍຈ້າງ ແລະ ບ່ອນເຮັດວຽກແທ້ກ່ອນໄປ.' },
      },
      {
        id: 'noy-taskapp', channel: 'chat', sender: { en: 'StarTasks Mentor Lina', lo: 'ຄູຝຶກ Lina ຈາກ StarTasks' }, isScam: true,
        situation: { en: 'Noy has been "rating hotels" on an app for three days and the balance keeps growing.', lo: 'ນ້ອຍ "ໃຫ້ຄະແນນໂຮງແຮມ" ໃນແອັບມາສາມມື້ ແລະ ຍອດເງິນເພີ່ມຂຶ້ນເລື້ອຍໆ.' },
        parts: [
          P('Today\'s earnings: 250,000 kip ✨ ', 'ລາຍໄດ້ມື້ນີ້: 250,000 ກີບ ✨ ', C('too_good', 'Money shown in the app is not money in your bank.', 'ເງິນທີ່ສະແດງໃນແອັບ ບໍ່ແມ່ນເງິນໃນທະນາຄານ.')),
          P('Your account is now VIP. To withdraw, top up 400,000 kip. ', 'ບັນຊີເປັນ VIP ແລ້ວ. ເພື່ອຖອນ ໃຫ້ເຕີມ 400,000 ກີບ. ', C('upfront_fee', 'Paying to get your own pay is the heart of every task scam.', 'ການຈ່າຍເພື່ອໄດ້ຄ່າຈ້າງຂອງຕົນ ແມ່ນຫົວໃຈຂອງການຫຼອກແບບວຽກ.')),
          P('Let\'s talk on Telegram, not here.', 'ໄປລົມໃນ Telegram ເດີ້ ບໍ່ແມ່ນບ່ອນນີ້.', C('off_platform', 'Moving to a private app makes it harder to report them.', 'ຍ້າຍໄປແອັບສ່ວນຕົວ ເຮັດໃຫ້ລາຍງານໄດ້ຍາກ.')),
        ],
        actions: [
          A('Top up 400,000 to get the 250,000 out', 'ເຕີມ 400,000 ເພື່ອຖອນ 250,000', false, 'Next comes a bigger "VIP fee". The money never comes out.', 'ຕໍ່ໄປຈະມີ "ຄ່າ VIP" ໃຫຍ່ກວ່າ. ເງິນບໍ່ເຄີຍຖອນໄດ້.'),
          A('Stop, pay nothing, screenshot it and report the account', 'ຢຸດ ບໍ່ຈ່າຍ ແຄັບໜ້າຈໍ ແລ້ວລາຍງານບັນຊີ', true, 'Yes. Noy loses three days, not her savings.', 'ແມ່ນ. ນ້ອຍເສຍສາມມື້ ບໍ່ແມ່ນເງິນເກັບ.'),
          A('Invite friends so they can earn too', 'ຊວນໝູ່ມາຫາເງິນນຳ', false, 'That spreads the scam to people Noy cares about.', 'ນັ້ນເຮັດໃຫ້ການຫຼອກແຜ່ໄປຫາຄົນທີ່ນ້ອຍຮັກ.'),
        ],
        lesson: { en: 'Never pay to get paid. A rising balance on a screen can be entirely made up.', lo: 'ຢ່າຈ່າຍເພື່ອໃຫ້ໄດ້ເງິນ. ຍອດເງິນທີ່ເພີ່ມຂຶ້ນໃນໜ້າຈໍ ອາດເປັນຂອງປອມທັງໝົດ.' },
      },
      {
        id: 'noy-cafejob', channel: 'sms', sender: { en: 'Mrs Phet, Dao Coffee', lo: 'ນາງເພັດ, ຮ້ານກາເຟດາວ' }, isScam: false,
        situation: { en: 'Noy dropped her CV at a café near her school last week.', lo: 'ອາທິດແລ້ວ ນ້ອຍເອົາ CV ໄປຝາກຮ້ານກາເຟໃກ້ໂຮງຮຽນ.' },
        parts: [
          P('Hi Noy, we got your CV. ', 'ສະບາຍດີນ້ອຍ ເຮົາໄດ້ CV ແລ້ວ. ', C(undefined, 'Matches what Noy really did.', 'ກົງກັບສິ່ງທີ່ນ້ອຍເຮັດແທ້.')),
          P('Come for a trial shift on Saturday at 8am. ', 'ມາລອງວຽກວັນເສົາ 8 ໂມງເຊົ້າ. ', C(undefined, 'A real place Noy has visited, in daylight.', 'ສະຖານທີ່ແທ້ທີ່ນ້ອຍເຄີຍໄປ ຕອນກາງເວັນ.')),
          P('Bring your ID card; we copy it and hand it straight back. ', 'ເອົາບັດປະຈຳຕົວມາ ເຮົາຖ່າຍສຳເນົາ ແລ້ວຄືນໃຫ້ທັນທີ. ', C(undefined, 'Noy keeps her own document.', 'ນ້ອຍເກັບເອກະສານໄວ້ເອງ.')),
          P('70,000 kip a day, paid at closing.', 'ມື້ລະ 70,000 ກີບ ຈ່າຍຕອນປິດຮ້ານ.', C(undefined, 'Normal pay, paid to her, nothing to pay them.', 'ຄ່າຈ້າງປົກກະຕິ ຈ່າຍໃຫ້ນາງ ບໍ່ຕ້ອງຈ່າຍເຂົາ.')),
        ],
        actions: [
          A('Reply yes and tell Mum where she will be', 'ຕອບຕົກລົງ ແລ້ວບອກແມ່ວ່າຈະໄປໃສ', true, 'A real job, and family knows where she is. Perfect.', 'ວຽກແທ້ ແລະ ຄອບຄົວຮູ້ວ່ານາງຢູ່ໃສ. ດີເລີດ.'),
          A('Ignore it, all job texts are scams', 'ບໍ່ສົນ ຂໍ້ຄວາມວຽກທຸກອັນເປັນການຫຼອກ', false, 'Noy would miss a real chance. Check, don\'t ignore everything.', 'ນ້ອຍຈະພາດໂອກາດແທ້. ກວດ ບໍ່ແມ່ນບໍ່ສົນທຸກຢ່າງ.'),
          A('Send the ID photo by text first', 'ສົ່ງຮູບບັດທາງຂໍ້ຄວາມກ່ອນ', false, 'Nobody asked for that. Bring it in person as they said.', 'ບໍ່ມີໃຜຂໍ. ເອົາໄປເອງຕາມທີ່ເຂົາບອກ.'),
        ],
        lesson: { en: 'Good jobs: a real place, in person, you keep your documents, and they pay you.', lo: 'ວຽກດີ: ສະຖານທີ່ແທ້ ພົບກັນຕົວຈິງ ທ່ານເກັບເອກະສານເອງ ແລະ ເຂົາຈ່າຍໃຫ້ທ່ານ.' },
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
      {
        id: 'khamla-casino', channel: 'chat', sender: { en: 'Lucky Mekong 88 ✅ Licensed', lo: 'Lucky Mekong 88 ✅ ມີໃບອະນຸຍາດ' }, isScam: true,
        situation: { en: 'Khamla is added to a "Mums\' Lucky Club" group. A message is pinned at the top.', lo: 'ຄຳຫຼ້າຖືກເພີ່ມເຂົ້າກຸ່ມ "ສະໂມສອນໂຊກດີຂອງແມ່". ມີຂໍ້ຄວາມປັກໝຸດໄວ້.' },
        parts: [
          P('Officially licensed online casino! ', 'ຄາສິໂນອອນລາຍມີໃບອະນຸຍາດ! ', C('unverified_identity', 'A tick and the word "licensed" are easy to fake. Fake gambling sites are a scam-compound tool.', 'ເຄື່ອງໝາຍຖືກ ແລະ ຄຳວ່າ "ມີໃບອະນຸຍາດ" ປອມງ່າຍ. ເວັບພະນັນປອມ ແມ່ນເຄື່ອງມືຂອງແກ໊ງຫຼອກລວງ.')),
          P('Deposit 200,000 kip, get a 1,000,000 kip bonus. ', 'ຝາກ 200,000 ກີບ ຮັບໂບນັດ 1,000,000 ກີບ. ', C('too_good', 'Five times your money for nothing.', 'ໄດ້ຫ້າເທົ່າ ໂດຍບໍ່ໄດ້ເຮັດຫຍັງ.')),
          P('Bee already won 5 million! ', 'ບີ ຖືກແລ້ວ 5 ລ້ານ! ', C('unverified_identity', '"Winners" in the group are often fake accounts.', '"ຜູ້ຊະນະ" ໃນກຸ່ມ ມັກເປັນບັນຊີປອມ.')),
          P('Withdraw any time after 3 more deposits.', 'ຖອນໄດ້ທຸກເວລາ ຫຼັງຝາກອີກ 3 ເທື່ອ.', C('upfront_fee', '"Any time, after you pay more" means never.', '"ທຸກເວລາ ຫຼັງຈ່າຍຕື່ມ" ໝາຍຄວາມວ່າບໍ່ເຄີຍ.')),
        ],
        actions: [
          A('Try 200,000 kip, just once', 'ລອງ 200,000 ກີບ ເທື່ອດຽວ', false, 'The first win is shown on screen. Withdrawing needs more deposits, forever.', 'ການຊະນະເທື່ອທຳອິດສະແດງໃນໜ້າຈໍ. ການຖອນຕ້ອງຝາກຕື່ມ ຕະຫຼອດໄປ.'),
          A('Leave the group, report it, and warn the other mums', 'ອອກຈາກກຸ່ມ ລາຍງານ ແລະ ເຕືອນແມ່ຄົນອື່ນ', true, 'Good. Warning others protects the whole street.', 'ດີ. ການເຕືອນຄົນອື່ນ ປົກປ້ອງທັງຄຸ້ມ.'),
          A('Ask Bee if she really won', 'ຖາມບີວ່າຖືກແທ້ບໍ', false, 'Not bad, but "Bee" may not exist. Leave and report.', 'ບໍ່ຮ້າຍ ແຕ່ "ບີ" ອາດບໍ່ມີແທ້. ອອກ ແລ້ວລາຍງານ.'),
        ],
        lesson: { en: 'A working website and a "licensed" badge do not make it real.', lo: 'ເວັບທີ່ໃຊ້ໄດ້ ແລະ ປ້າຍ "ມີໃບອະນຸຍາດ" ບໍ່ໄດ້ເຮັດໃຫ້ມັນເປັນຂອງແທ້.' },
      },
      {
        id: 'khamla-nephew', channel: 'chat', sender: { en: 'Nephew Phet', lo: 'ຫຼານເພັດ' }, isScam: true,
        situation: { en: 'Phet left two months ago for a "customer service job". A message arrives late at night.', lo: 'ເພັດໄປເຮັດ "ວຽກບໍລິການລູກຄ້າ" ສອງເດືອນກ່ອນ. ມີຂໍ້ຄວາມມາຕອນເດິກ.' },
        parts: [
          P('Auntie, the job is not real. ', 'ປ້າ ວຽກບໍ່ແມ່ນແທ້. ', C(undefined, 'This may truly be Phet. Trafficking victims are often deceived exactly like this.', 'ນີ້ອາດແມ່ນເພັດແທ້. ຜູ້ເຄາະຮ້າຍຈາກການຄ້າມະນຸດ ມັກຖືກຫຼອກແບບນີ້.')),
          P('They took my passport and make me scam people online. ', 'ເຂົາຍຶດໜັງສືຜ່ານແດນ ແລະ ບັງຄັບໃຫ້ຫຼອກຄົນອອນລາຍ. ', C('personal_data', 'Taken documents and forced scamming are signs of trafficking, not of a job.', 'ເອກະສານຖືກຍຶດ ແລະ ຖືກບັງຄັບຫຼອກ ແມ່ນສັນຍານຂອງການຄ້າມະນຸດ ບໍ່ແມ່ນວຽກ.')),
          P('Boss says I can leave if you send 20 million kip, or I bring 2 new workers. ', 'ນາຍບອກວ່າອອກໄດ້ ຖ້າປ້າສົ່ງ 20 ລ້ານກີບ ຫຼື ຂ້ອຍພາຄົນງານໃໝ່ມາ 2 ຄົນ. ', C('upfront_fee', 'Paying the "debt" or sending recruits feeds the operation and may not free him.', 'ການຈ່າຍ "ໜີ້" ຫຼື ສົ່ງຄົນໄປ ເປັນການລ້ຽງແກ໊ງ ແລະ ອາດບໍ່ໄດ້ປ່ອຍເຂົາ.')),
          P('Please don\'t post about it, they read my phone.', 'ຢ່າໂພສເດີ້ ເຂົາອ່ານໂທລະສັບຂ້ອຍ.', C(undefined, 'He is right about this: going public can put him in danger.', 'ເຂົາເວົ້າຖືກ: ການເປີດເຜີຍສາທາລະນະ ອາດເຮັດໃຫ້ເຂົາຕົກຢູ່ໃນອັນຕະລາຍ.')),
        ],
        actions: [
          A('Send the 20 million kip to the boss\'s account', 'ສົ່ງ 20 ລ້ານກີບ ໃຫ້ບັນຊີຂອງນາຍ', false, 'Payments often lead to new "debts". It funds the people holding him.', 'ການຈ່າຍມັກນຳໄປສູ່ "ໜີ້" ໃໝ່. ມັນເປັນເງິນໃຫ້ຄົນທີ່ກັກເຂົາ.'),
          A('Post his photo and location on Facebook for help', 'ໂພສຮູບ ແລະ ບ່ອນຢູ່ຂອງເຂົາໃນເຟສບຸກ ຂໍຄວາມຊ່ວຍເຫຼືອ', false, 'Going public can lead to punishment or a transfer to another site.', 'ການເປີດເຜີຍ ອາດເຮັດໃຫ້ເຂົາຖືກລົງໂທດ ຫຼື ຖືກຍ້າຍໄປບ່ອນອື່ນ.'),
          A('Save the messages and quietly call 1300 (police) or 1362 (Lao Women\'s Union)', 'ເກັບຂໍ້ຄວາມໄວ້ ແລ້ວໂທຫາ 1300 (ຕຳຫຼວດ) ຫຼື 1362 (ສະຫະພັນແມ່ຍິງລາວ) ຢ່າງງຽບໆ', true, 'Yes. Trained help, kept private, without paying or sending anyone else.', 'ແມ່ນ. ຄວາມຊ່ວຍເຫຼືອທີ່ມີການຝຶກ ເກັບເປັນຄວາມລັບ ບໍ່ຈ່າຍ ແລະ ບໍ່ສົ່ງຄົນອື່ນໄປ.'),
        ],
        lesson: { en: 'Someone forced to scam is a victim too. Get trained help quietly; never pay the bosses or send recruits.', lo: 'ຄົນທີ່ຖືກບັງຄັບໃຫ້ຫຼອກ ກໍ່ເປັນຜູ້ເຄາະຮ້າຍ. ຂໍຄວາມຊ່ວຍເຫຼືອຢ່າງງຽບໆ; ຢ່າຈ່າຍນາຍ ຫຼື ສົ່ງຄົນໄປ.' },
      },
      {
        id: 'khamla-meeting', channel: 'sms', sender: { en: 'Village Chief Somsak', lo: 'ນາຍບ້ານສົມສັກ' }, isScam: false,
        situation: { en: 'Khamla has the village chief\'s number saved from the last village meeting.', lo: 'ຄຳຫຼ້າບັນທຶກເບີນາຍບ້ານໄວ້ ຈາກກອງປະຊຸມບ້ານເທື່ອກ່ອນ.' },
        parts: [
          P('Village meeting Sunday 9am at the village hall. ', 'ປະຊຸມບ້ານວັນອາທິດ 9 ໂມງ ທີ່ຫ້ອງການບ້ານ. ', C(undefined, 'A saved contact and a public place.', 'ເບີທີ່ບັນທຶກ ແລະ ສະຖານທີ່ສາທາລະນະ.')),
          P('The Lao Women\'s Union will talk about fake job offers abroad. ', 'ສະຫະພັນແມ່ຍິງລາວ ຈະມາລົມເລື່ອງວຽກປອມຕ່າງປະເທດ. '),
          P('Bring your teenagers. Free.', 'ພາລູກໄວລຸ້ນມານຳ. ບໍ່ເສຍຄ່າ.', C(undefined, 'Nothing to pay, nothing secret, family invited.', 'ບໍ່ຕ້ອງຈ່າຍ ບໍ່ມີຄວາມລັບ ເຊີນຄອບຄົວ.')),
        ],
        actions: [
          A('Go with her son', 'ໄປກັບລູກຊາຍ', true, 'Good. Learning the warning signs together protects the whole family.', 'ດີ. ຮຽນສັນຍານເຕືອນນຳກັນ ປົກປ້ອງທັງຄອບຄົວ.'),
          A('Reply with her bank details to register', 'ຕອບດ້ວຍຂໍ້ມູນທະນາຄານ ເພື່ອລົງທະບຽນ', false, 'Nobody asked for that. Never send bank details by text.', 'ບໍ່ມີໃຜຂໍ. ຢ່າສົ່ງຂໍ້ມູນທະນາຄານທາງຂໍ້ຄວາມ.'),
          A('Delete it, meetings are boring', 'ລຶບຖິ້ມ ປະຊຸມໜ້າເບື່ອ', false, 'It is real, and useful for a family with a teenager.', 'ມັນແມ່ນແທ້ ແລະ ມີປະໂຫຍດສຳລັບຄອບຄົວທີ່ມີໄວລຸ້ນ.'),
        ],
        lesson: { en: 'Real community help is public, free, and invites your family along.', lo: 'ຄວາມຊ່ວຍເຫຼືອແທ້ຈາກຊຸມຊົນ ເປັນສາທາລະນະ ບໍ່ເສຍຄ່າ ແລະ ເຊີນຄອບຄົວໄປນຳ.' },
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
      {
        id: 'bounmy-techpark', channel: 'call', sender: { en: 'Unknown number', lo: 'ເບີບໍ່ຮູ້ຈັກ' }, isScam: true,
        situation: { en: 'A young man calls saying he is a friend of Bounmy\'s grandson Kham, who is looking for work.', lo: 'ຊາຍໜຸ່ມໂທມາ ບອກວ່າເປັນໝູ່ຂອງຄຳ ຫຼານຂອງບຸນມີ ທີ່ກຳລັງຊອກວຽກ.' },
        parts: [
          P('Grandpa, I\'m Kham\'s friend. My company in a big tech park is hiring. ', 'ພໍ່ເຖົ້າ ຂ້ອຍເປັນໝູ່ຄຳ. ບໍລິສັດຂ້ອຍຢູ່ເຂດເທັກໂນໂລຊີໃຫຍ່ ກຳລັງຮັບຄົນ. ', C('unverified_identity', 'Bounmy has never heard of this friend.', 'ບຸນມີບໍ່ເຄີຍຮູ້ຈັກໝູ່ຄົນນີ້.')),
          P('Beautiful office, 20 million kip a month. ', 'ຫ້ອງການງາມ ເດືອນລະ 20 ລ້ານກີບ. ', C('too_good', 'A fine building proves nothing. Scam compounds hide in smart-looking parks.', 'ຕຶກງາມພິສູດຫຍັງບໍ່ໄດ້. ແກ໊ງຫຼອກລວງລີ້ຢູ່ໃນເຂດທີ່ເບິ່ງທັນສະໄໝ.')),
          P('Send a photo of Kham\'s passport and 2 million for the visa. ', 'ສົ່ງຮູບໜັງສືຜ່ານແດນຂອງຄຳ ແລະ 2 ລ້ານຄ່າວີຊາ. ', C('upfront_fee', 'Big fees and copies of documents to a stranger.', 'ຄ່າທຳນຽມໃຫຍ່ ແລະ ສຳເນົາເອກະສານໃຫ້ຄົນແປກໜ້າ.')),
          P('He leaves tomorrow. Make it a surprise for him!', 'ເຂົາອອກມື້ອື່ນ. ເຮັດເປັນເຊີໄພຣສ໌ໃຫ້ເຂົາ!', C('urgency', 'A rush and a secret. No time for the family to check.', 'ເລັ່ງ ແລະ ປິດລັບ. ບໍ່ມີເວລາໃຫ້ຄອບຄົວກວດ.')),
        ],
        actions: [
          A('Pay the visa fee to help Kham', 'ຈ່າຍຄ່າວີຊາ ຊ່ວຍຄຳ', false, 'Kham could end up far from home, unable to leave.', 'ຄຳອາດໄປຕົກຢູ່ໄກບ້ານ ອອກບໍ່ໄດ້.'),
          A('Hang up and talk to Kham and his parents directly', 'ວາງສາຍ ແລ້ວລົມກັບຄຳ ແລະ ພໍ່ແມ່ເຂົາໂດຍກົງ', true, 'Yes. The family can check the company together, slowly.', 'ແມ່ນ. ຄອບຄົວກວດບໍລິສັດນຳກັນໄດ້ ຄ່ອຍໆ.'),
          A('Give the caller Kham\'s number', 'ໃຫ້ເບີຂອງຄຳແກ່ຜູ້ໂທ', false, 'Now the recruiter can work on Kham directly.', 'ຕອນນີ້ຄົນຊັກຊວນ ເຂົ້າຫາຄຳໄດ້ໂດຍກົງ.'),
        ],
        lesson: { en: 'A nice office and big pay prove nothing. Job offers are checked by the whole family, never in a rush.', lo: 'ຫ້ອງການງາມ ແລະ ເງິນດີ ພິສູດຫຍັງບໍ່ໄດ້. ວຽກຕ້ອງໃຫ້ຄອບຄົວກວດນຳກັນ ບໍ່ຮີບຮ້ອນ.' },
      },
      {
        id: 'bounmy-romance', channel: 'chat', sender: { en: 'Mai 🌸', lo: 'ໃໝ 🌸' }, isScam: true,
        situation: { en: 'Bounmy has chatted every evening for three weeks with Mai, a kind widow he met online.', lo: 'ບຸນມີລົມກັບໃໝ ແມ່ໝ້າຍໃຈດີທີ່ພົບອອນລາຍ ທຸກແລງ ມາສາມອາທິດ.' },
        parts: [
          P('Talking with you is the best part of my day ❤️ ', 'ການລົມກັບເຈົ້າ ແມ່ນຊ່ວງເວລາທີ່ດີທີ່ສຸດຂອງມື້ ❤️ ', C('unverified_identity', 'Weeks of warmth, but they never meet or video call.', 'ອົບອຸ່ນຫຼາຍອາທິດ ແຕ່ບໍ່ເຄີຍພົບ ຫຼື ວິດີໂອຄອນ.')),
          P('My gold trading app gave me 30% this month. ', 'ແອັບເທຣດຄຳຂອງຂ້ອຍ ໃຫ້ກຳໄລ 30% ເດືອນນີ້. ', C('too_good', 'Friendship that turns into an investment tip is the romance-investment scam.', 'ມິດຕະພາບທີ່ກາຍເປັນການຊວນລົງທຶນ ແມ່ນການຫຼອກແບບຄວາມຮັກ-ລົງທຶນ.')),
          P('Start with 3 million kip from your pension. ', 'ເລີ່ມດ້ວຍ 3 ລ້ານກີບ ຈາກເງິນບຳນານ. ', C('upfront_fee', 'The first "profits" will look real. The withdrawals will not be.', '"ກຳໄລ" ທຳອິດຈະເບິ່ງຄືແທ້. ການຖອນບໍ່ແມ່ນ.')),
          P('Don\'t tell your daughter, she won\'t understand us.', 'ຢ່າບອກລູກສາວ ລາວຈະບໍ່ເຂົ້າໃຈເຮົາ.', C('off_platform', 'Cutting you off from family is how the trap closes.', 'ການຕັດທ່ານອອກຈາກຄອບຄົວ ແມ່ນວິທີປິດກັບດັກ.')),
        ],
        actions: [
          A('Invest a little to show trust', 'ລົງທຶນໜ້ອຍໜຶ່ງ ສະແດງຄວາມໄວ້ໃຈ', false, 'Small wins on screen lead to bigger and bigger deposits.', 'ການຊະນະນ້ອຍໆໃນໜ້າຈໍ ນຳໄປສູ່ການຝາກຫຼາຍຂຶ້ນ.'),
          A('Show the chat to his daughter Malee', 'ເອົາແຊັດໃຫ້ລູກສາວມາລີເບິ່ງ', true, 'Exactly what "Mai" did not want. A trusted person sees it clearly.', 'ສິ່ງທີ່ "ໃໝ" ບໍ່ຢາກໃຫ້ເຮັດ. ຄົນທີ່ໄວ້ໃຈເຫັນຊັດ.'),
          A('Ask Mai to prove the profits first', 'ໃຫ້ໃໝພິສູດກຳໄລກ່ອນ', false, 'Fake apps show perfect fake profits. That proves nothing.', 'ແອັບປອມສະແດງກຳໄລປອມໄດ້ສົມບູນ. ພິສູດຫຍັງບໍ່ໄດ້.'),
        ],
        lesson: { en: 'When an online sweetheart brings up investing, it is a scam, however kind they seem.', lo: 'ເມື່ອຄົນຮັກອອນລາຍຊວນລົງທຶນ ມັນແມ່ນການຫຼອກ ບໍ່ວ່າເຂົາຈະເບິ່ງໃຈດີປານໃດ.' },
      },
      {
        id: 'bounmy-pharmacy', channel: 'sms', sender: { en: 'Thongkhan Pharmacy (saved)', lo: 'ຮ້ານຢາທອງຂັນ (ເບີທີ່ບັນທຶກ)' }, isScam: false,
        situation: { en: 'Bounmy ordered his blood pressure pills at the pharmacy on Monday.', lo: 'ວັນຈັນ ບຸນມີສັ່ງຢາຄວາມດັນທີ່ຮ້ານຢາ.' },
        parts: [
          P('Hello Uncle Bounmy, your pills are ready. ', 'ສະບາຍດີລຸງບຸນມີ ຢາພ້ອມແລ້ວ. ', C(undefined, 'Matches the order he really placed.', 'ກົງກັບການສັ່ງທີ່ລາວສັ່ງແທ້.')),
          P('Pick them up any day this week, ', 'ມາຮັບໄດ້ທຸກມື້ອາທິດນີ້ ', C(undefined, 'No rush.', 'ບໍ່ຮີບ.')),
          P('and pay at the counter.', 'ແລະ ຈ່າຍທີ່ເຄົາເຕີ.', C(undefined, 'Pay in person at a place he knows. No link, no transfer.', 'ຈ່າຍຕົວຈິງ ບ່ອນທີ່ຮູ້ຈັກ. ບໍ່ມີລິ້ງ ບໍ່ໂອນ.')),
        ],
        actions: [
          A('Pick them up on his walk tomorrow', 'ໄປຮັບຕອນຍ່າງຫຼິ້ນມື້ອື່ນ', true, 'Simple and real. Good for his health too.', 'ງ່າຍ ແລະ ແທ້. ດີຕໍ່ສຸຂະພາບນຳ.'),
          A('Ignore it, it might be a scam', 'ບໍ່ສົນ ອາດແມ່ນການຫຼອກ', false, 'It matches his order and asks nothing. He needs those pills.', 'ກົງກັບການສັ່ງ ແລະ ບໍ່ຂໍຫຍັງ. ລາວຕ້ອງການຢານັ້ນ.'),
          A('Reply with his ID number to confirm', 'ຕອບດ້ວຍເລກບັດປະຈຳຕົວ ເພື່ອຢືນຢັນ', false, 'Nobody asked for that. Never send ID numbers by text.', 'ບໍ່ມີໃຜຂໍ. ຢ່າສົ່ງເລກບັດທາງຂໍ້ຄວາມ.'),
        ],
        lesson: { en: 'Real messages match something you did and let you pay in person.', lo: 'ຂໍ້ຄວາມແທ້ ກົງກັບສິ່ງທີ່ທ່ານເຮັດ ແລະ ໃຫ້ຈ່າຍຕົວຈິງ.' },
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
      {
        id: 'dara-switch', channel: 'chat', sender: { en: 'Recruiter Ms. Lin', lo: 'ຄົນຮັບສະໝັກ ນາງ ລິນ' }, isScam: true,
        situation: { en: 'Dara accepted a customer-service job in Bangkok. The day before leaving, the plan changes.', lo: 'ດາຣາຮັບວຽກບໍລິການລູກຄ້າຢູ່ບາງກອກ. ມື້ກ່ອນອອກເດີນທາງ ແຜນປ່ຽນ.' },
        parts: [
          P('Small change: the Bangkok office is full, so you\'ll start at our Bokeo branch. ', 'ປ່ຽນໜ້ອຍໜຶ່ງ: ຫ້ອງການບາງກອກເຕັມ ເຈົ້າຈະເລີ່ມທີ່ສາຂາບໍ່ແກ້ວ. ', C('unverified_identity', 'A sudden change of country or worksite is a documented trafficking pattern.', 'ການປ່ຽນປະເທດ ຫຼື ບ່ອນເຮັດວຽກກະທັນຫັນ ແມ່ນຮູບແບບການຄ້າມະນຸດທີ່ມີການບັນທຶກ.')),
          P('Same salary, free dorm. ', 'ເງິນເດືອນຄືເກົ່າ ຫໍພັກຟຣີ. ', C('too_good', '"Free" housing can turn into a debt.', 'ທີ່ພັກ "ຟຣີ" ອາດກາຍເປັນໜີ້.')),
          P('Our driver will hold your passport at the border. ', 'ຄົນຂັບຈະຖືໜັງສືຜ່ານແດນໃຫ້ທີ່ດ່ານ. ', C('personal_data', 'Whoever holds your passport controls whether you can leave.', 'ໃຜຖືໜັງສືຜ່ານແດນ ກໍ່ຄວບຄຸມວ່າທ່ານອອກໄດ້ບໍ່.')),
          P('Sign the new contract on the bus.', 'ເຊັນສັນຍາໃໝ່ເທິງລົດ.', C('urgency', 'No time to read it, and no one to ask.', 'ບໍ່ມີເວລາອ່ານ ແລະ ບໍ່ມີໃຜໃຫ້ຖາມ.')),
        ],
        actions: [
          A('Go anyway, the salary is the same', 'ໄປຢູ່ດີ ເງິນເດືອນຄືເກົ່າ', false, 'The advertised job is gone. What waits may be a locked compound.', 'ວຽກທີ່ປະກາດໄວ້ຫາຍໄປແລ້ວ. ສິ່ງທີ່ລໍຖ້າ ອາດແມ່ນບ່ອນກັກຂັງ.'),
          A('Cancel, keep the passport, and check with the labour office', 'ຍົກເລີກ ເກັບໜັງສືຜ່ານແດນໄວ້ ແລ້ວກວດກັບຫ້ອງການແຮງງານ', true, 'Right. A changed destination is a reason to stop, not to adjust.', 'ຖືກ. ບ່ອນເຮັດວຽກທີ່ປ່ຽນ ແມ່ນເຫດຜົນທີ່ຈະຢຸດ ບໍ່ແມ່ນປັບຕົວ.'),
          A('Go, but hide a copy of the passport', 'ໄປ ແຕ່ເຊື່ອງສຳເນົາໜັງສືຜ່ານແດນໄວ້', false, 'A copy will not get Dara out. Do not go.', 'ສຳເນົາບໍ່ໄດ້ຊ່ວຍໃຫ້ດາຣາອອກມາໄດ້. ຢ່າໄປ.'),
        ],
        lesson: { en: 'If the country, worksite or contract changes at the last minute, stop.', lo: 'ຖ້າປະເທດ, ບ່ອນເຮັດວຽກ ຫຼື ສັນຍາປ່ຽນກະທັນຫັນ ໃຫ້ຢຸດ.' },
      },
      {
        id: 'dara-friend', channel: 'chat', sender: { en: 'Friend Lae', lo: 'ໝູ່ແລ' }, isScam: true,
        situation: { en: 'Dara\'s friend Lae went for a "customer service" job two months ago. She writes at 2am.', lo: 'ແລ ໝູ່ຂອງດາຣາ ໄປເຮັດວຽກ "ບໍລິການລູກຄ້າ" ສອງເດືອນກ່ອນ. ນາງຂຽນມາຕອນສອງໂມງເຊົ້າ.' },
        parts: [
          P('I have a contract and got paid 1 million kip, so it\'s legal, right? ', 'ຂ້ອຍມີສັນຍາ ແລະ ໄດ້ເງິນ 1 ລ້ານກີບ ສະນັ້ນຖືກກົດໝາຍແມ່ນບໍ? ', C(undefined, 'A contract and some pay do not prove someone is free.', 'ສັນຍາ ແລະ ເງິນບາງສ່ວນ ບໍ່ໄດ້ພິສູດວ່າຄົນນັ້ນເປັນອິດສະຫຼະ.')),
          P('But the manager keeps our passports and we can\'t leave the building. ', 'ແຕ່ຜູ້ຈັດການເກັບໜັງສືຜ່ານແດນ ແລະ ເຮົາອອກຈາກຕຶກບໍ່ໄດ້. ', C('personal_data', 'Taken passports and locked doors are signs of forced labour.', 'ໜັງສືຜ່ານແດນຖືກຍຶດ ແລະ ປະຕູຖືກລັອກ ແມ່ນສັນຍານຂອງການບັງຄັບແຮງງານ.')),
          P('If we miss our chat quota they add to our "debt". ', 'ຖ້າບໍ່ຮອດເປົ້າແຊັດ ເຂົາເພີ່ມ "ໜີ້". ', C('upfront_fee', 'Invented debts and impossible quotas keep workers trapped.', 'ໜີ້ທີ່ສ້າງຂຶ້ນ ແລະ ເປົ້າໝາຍທີ່ເປັນໄປບໍ່ໄດ້ ກັກຄົນງານໄວ້.')),
          P('They say I can go home if you come and take my place.', 'ເຂົາບອກວ່າຂ້ອຍກັບບ້ານໄດ້ ຖ້າເຈົ້າມາແທນ.', C('off_platform', 'Forcing workers to recruit replacements is a documented tactic.', 'ການບັງຄັບໃຫ້ຄົນງານຫາຄົນມາແທນ ແມ່ນກົນລະຍຸດທີ່ມີການບັນທຶກ.')),
        ],
        actions: [
          A('Go and take Lae\'s place so she can leave', 'ໄປແທນແລ ເພື່ອໃຫ້ນາງອອກໄດ້', false, 'Then two friends are trapped instead of one.', 'ແລ້ວກໍ່ມີໝູ່ຖືກກັກສອງຄົນ ແທນທີ່ຈະເປັນຄົນດຽວ.'),
          A('Tell Lae it sounds fine since she has a contract', 'ບອກແລວ່າບໍ່ເປັນຫຍັງ ເພາະມີສັນຍາ', false, 'A contract does not make confinement legal.', 'ສັນຍາບໍ່ໄດ້ເຮັດໃຫ້ການກັກຂັງຖືກກົດໝາຍ.'),
          A('Save the messages and quietly contact 1362 or 1300, and her family', 'ເກັບຂໍ້ຄວາມໄວ້ ແລ້ວຕິດຕໍ່ 1362 ຫຼື 1300 ແລະ ຄອບຄົວນາງຢ່າງງຽບໆ', true, 'Yes. Trained help, kept private so Lae is not punished.', 'ແມ່ນ. ຄວາມຊ່ວຍເຫຼືອທີ່ມີການຝຶກ ເກັບເປັນຄວາມລັບ ເພື່ອບໍ່ໃຫ້ແລຖືກລົງໂທດ.'),
        ],
        lesson: { en: 'Pay and a contract do not mean freedom. Check: does she keep her documents, her phone, and the right to leave?', lo: 'ເງິນ ແລະ ສັນຍາ ບໍ່ໄດ້ໝາຍເຖິງອິດສະຫຼະ. ກວດ: ນາງເກັບເອກະສານ, ໂທລະສັບ ແລະ ສິດທີ່ຈະອອກໄດ້ບໍ?' },
      },
      {
        id: 'dara-agency', channel: 'email', sender: { en: 'Licensed agency (from the labour office list)', lo: 'ບໍລິສັດມີໃບອະນຸຍາດ (ຈາກລາຍຊື່ຫ້ອງການແຮງງານ)' }, isScam: false,
        situation: { en: 'Dara found this agency on the labour office\'s list and applied in person.', lo: 'ດາຣາພົບບໍລິສັດນີ້ໃນລາຍຊື່ຂອງຫ້ອງການແຮງງານ ແລະ ໄປສະໝັກເອງ.' },
        parts: [
          P('Your contract is ready, in Lao, for farm work in Thailand. ', 'ສັນຍາພ້ອມແລ້ວ ເປັນພາສາລາວ ວຽກກະສິກຳຢູ່ໄທ. ', C(undefined, 'In Dara\'s language, and the same job she applied for.', 'ເປັນພາສາຂອງດາຣາ ແລະ ແມ່ນວຽກດຽວກັບທີ່ສະໝັກ.')),
          P('Take it home and read it with your family first. ', 'ເອົາກັບບ້ານໄປອ່ານກັບຄອບຄົວກ່ອນ. ', C(undefined, 'No rush, and family is welcome.', 'ບໍ່ຮີບ ແລະ ເຊີນຄອບຄົວໄດ້.')),
          P('You keep your passport at all times. ', 'ເຈົ້າເກັບໜັງສືຜ່ານແດນເອງຕະຫຼອດ. ', C(undefined, 'Dara stays in control of her documents.', 'ດາຣາຄວບຄຸມເອກະສານຂອງຕົນເອງ.')),
          P('You can check our licence at the labour office.', 'ກວດໃບອະນຸຍາດຂອງເຮົາໄດ້ທີ່ຫ້ອງການແຮງງານ.', C(undefined, 'They invite you to verify them independently.', 'ເຂົາເຊີນໃຫ້ກວດສອບເຂົາເອງ.')),
        ],
        actions: [
          A('Read it at home with Mum, then sign at the office', 'ອ່ານທີ່ເຮືອນກັບແມ່ ແລ້ວໄປເຊັນທີ່ຫ້ອງການ', true, 'Exactly how safe migration should look.', 'ນີ້ແມ່ນການເຄື່ອນຍ້າຍແຮງງານທີ່ປອດໄພ.'),
          A('Refuse, every job abroad is a trap', 'ປະຕິເສດ ວຽກຕ່າງປະເທດທຸກອັນເປັນກັບດັກ', false, 'Not every job abroad is unsafe. This one passes every check.', 'ບໍ່ແມ່ນວຽກຕ່າງປະເທດທຸກອັນບໍ່ປອດໄພ. ວຽກນີ້ຜ່ານການກວດທຸກຢ່າງ.'),
          A('Sign right away without reading', 'ເຊັນທັນທີ ບໍ່ອ່ານ', false, 'Even with a good agency, read before you sign.', 'ແມ່ນແຕ່ບໍລິສັດດີ ກໍ່ຕ້ອງອ່ານກ່ອນເຊັນ.'),
        ],
        lesson: { en: 'Safe work abroad: a licensed agency, a contract in your language, time to read it, and your passport stays with you.', lo: 'ວຽກຕ່າງປະເທດທີ່ປອດໄພ: ບໍລິສັດມີໃບອະນຸຍາດ ສັນຍາເປັນພາສາຂອງທ່ານ ມີເວລາອ່ານ ແລະ ທ່ານເກັບໜັງສືຜ່ານແດນເອງ.' },
      },
    ],
  },
];
