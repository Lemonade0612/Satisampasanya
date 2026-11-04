import type { L10n } from '../types';
import type { Call } from './scamCalls';

// More days for Scam Call, one per Scam Detective character. Each day is a pool of eight calls
// (four real, four scams) over six time slots; two slots hold a real call and a scam, so each play
// draws a different, balanced handful in time order. Trafficking-themed calls follow the 2025 US TIP report (Laos).
// Lao strings are drafts (needsNativeReview).

const l = (en: string, lo: string): L10n => ({ en, lo });
const real = { who: 'woman', rate: -6, pitch: 0 } as const;

export const TON_CALLS: Call[] = [
  { id: 'ton-mum', real: true, voice: { ...real, pitch: 2 }, time: '15:30', place: l('Home after school', 'ຢູ່ເຮືອນຫຼັງເລີກຮຽນ'), stake: 0,
    note: l('Mum went to the market and said she would call on her way home.', 'ແມ່ໄປຕະຫຼາດ ແລະ ບອກວ່າຈະໂທມາຕອນກັບບ້ານ.'),
    caller: l('Mum', 'ແມ່'), number: '+856 20 77•• 3105', saved: true,
    lines: [
      l("Ton, it's Mum. I'm leaving the market now.", 'ຕົ້ນ, ແມ່ເອງລູກ. ແມ່ກຳລັງອອກຈາກຕະຫຼາດແລ້ວເດີ້.'),
      l('Did you finish your homework?', 'ເຮັດການບ້ານແລ້ວບໍ່ລູກ?'),
      l("Keep the door locked until I'm home. See you soon!", 'ລັອກປະຕູໄວ້ເດີ້ ຈົນກວ່າແມ່ຈະກັບຮອດ. ອີກບໍ່ດົນແມ່ກໍ່ຮອດແລ້ວ!'),
    ],
    moves: { trust: l('Say hi and promise to lock the door', 'ທັກທາຍ ແລະ ສັນຍາວ່າຈະລັອກປະຕູ'), check: l('Call Mum back on her saved number', 'ໂທກັບຫາແມ່ ເບີທີ່ບັນທຶກໄວ້'), hangup: l('Hang up without answering', 'ວາງສາຍ ບໍ່ຕອບ') },
    outcome: {
      trust: l('Mum is happy, the door stays locked, and she is home in twenty minutes.', 'ແມ່ດີໃຈ ປະຕູລັອກໄວ້ ແລະ ແມ່ກັບຮອດໃນຊາວນາທີ.'),
      check: l('Mum answers straight away and laughs: "Good thinking!"', 'ແມ່ຮັບທັນທີ ແລ້ວຫົວ: "ຄິດດີຫຼາຍ!"'),
      hangup: l('Mum gets worried when Ton does not answer and hurries home in a panic.', 'ແມ່ເປັນຫ່ວງເມື່ອຕົ້ນບໍ່ຮັບ ແລ້ວຟ້າວກັບບ້ານ.'),
    },
    signs: ['known', 'nothing'], flags: [],
    remember: l('A family number you saved, asking nothing secret, is fine to talk to.', 'ເບີຄອບຄົວທີ່ບັນທຶກໄວ້ ແລະ ບໍ່ຂໍຫຍັງລັບ ລົມໄດ້ເລີຍ.') },

  { id: 'ton-prize', real: false, voice: { who: 'man', rate: 16, pitch: 6 }, time: '16:00', place: l('Playing on the tablet', 'ຫຼິ້ນແທັບເລັດ'), stake: 500_000,
    note: l("Ton plays a game on Mum's old phone. He never entered a contest.", 'ຕົ້ນຫຼິ້ນເກມໃນໂທລະສັບເກົ່າຂອງແມ່. ບໍ່ເຄີຍສະໝັກແຂ່ງຂັນຫຍັງ.'),
    caller: l('Game Prize Team', 'ທີມລາງວັນເກມ'), number: '+856 30 51•• 0098', saved: false,
    lines: [
      l('Congratulations! You won ten thousand free diamonds in your game!', 'ຍິນດີນຳເດີ້ນ້ອງ! ນ້ອງໄດ້ເພັດຟຣີ ໜຶ່ງໝື່ນເມັດໃນເກມ!'),
      l('I just sent a six-digit code to this phone. Read it to me.', 'ພີ່ຫາກໍ່ສົ່ງລະຫັດຫົກຕົວ ໄປໂທລະສັບນີ້. ອ່ານໃຫ້ພີ່ຟັງແດ່ເດີ້.'),
      l("Quick, the prize disappears in one minute. Don't ask your mum, it's a surprise!", 'ໄວໆເດີ້ ອີກໜຶ່ງນາທີ ລາງວັນຈະຫາຍແລ້ວ. ບໍ່ຕ້ອງຖາມແມ່ເດີ້ ເອົາໄວ້ເຊີໄພຣສ໌!'),
    ],
    moves: { trust: l('Read the code out', 'ອ່ານລະຫັດໃຫ້ຟັງ'), check: l('Say "I will ask Mum first"', 'ບອກວ່າ "ຂໍຖາມແມ່ກ່ອນ"'), hangup: l('Hang up', 'ວາງສາຍ') },
    outcome: {
      trust: l("The code unlocked Mum's bank app. 500,000 kip vanished from her account.", 'ລະຫັດນັ້ນເປີດແອັບທະນາຄານຂອງແມ່. ເງິນ 500,000 ກີບຫາຍໄປ.'),
      check: l('The caller hangs up the moment Ton mentions Mum. No diamonds ever existed.', 'ຜູ້ໂທວາງສາຍທັນທີທີ່ຕົ້ນເວົ້າເຖິງແມ່. ບໍ່ມີເພັດແທ້.'),
      hangup: l('Ton goes back to his game. Nothing lost.', 'ຕົ້ນກັບໄປຫຼິ້ນເກມ. ບໍ່ເສຍຫຍັງ.'),
    },
    signs: ['gift', 'code', 'clock', 'hush'], flags: ['too_good', 'personal_data', 'urgency'],
    remember: l('A code sent to your phone is a key. Never read it to anyone, even for free prizes.', 'ລະຫັດທີ່ສົ່ງມາໂທລະສັບແມ່ນກະແຈ. ຢ່າອ່ານໃຫ້ໃຜ ແມ່ນແຕ່ເພື່ອລາງວັນຟຣີ.') },

  { id: 'ton-coach', real: true, voice: { who: 'man', rate: -4, pitch: 0 }, time: '16:30', place: l('Snack time', 'ເວລາກິນເຂົ້າໜົມ'), stake: 0,
    note: l("Ton has football practice on Saturdays. Coach Vong's number is saved.", 'ຕົ້ນມີຊ້ອມບານທຸກວັນເສົາ. ເບີຂອງຄູຝຶກວົງບັນທຶກໄວ້.'),
    caller: l('Coach Vong', 'ຄູຝຶກວົງ'), number: '+856 20 54•• 7721', saved: true,
    lines: [
      l('Hi Ton, Coach Vong here.', 'ສະບາຍດີຕົ້ນ, ຄູວົງເອງເດີ້.'),
      l('Practice tomorrow starts at nine instead of eight because of the rain.', 'ມື້ອື່ນ ຊ້ອມເລີ່ມເກົ້າໂມງເດີ້ ບໍ່ແມ່ນແປດໂມງ ເພາະຝົນຕົກ.'),
      l('Please tell your mum. See you on the field!', 'ບອກແມ່ນຳເດີ້. ແລ້ວພົບກັນຢູ່ເດີ່ນ!'),
    ],
    moves: { trust: l('Say thanks and tell Mum', 'ຂອບໃຈ ແລ້ວບອກແມ່'), check: l('Tell Mum so she can check the team group', 'ບອກແມ່ ໃຫ້ແມ່ກວດໃນກຸ່ມທີມ'), hangup: l('Hang up before he finishes', 'ວາງສາຍກ່ອນເພິ່ນເວົ້າຈົບ') },
    outcome: {
      trust: l('Ton arrives at nine with the rest of the team.', 'ຕົ້ນໄປຮອດເກົ້າໂມງພ້ອມທີມ.'),
      check: l('The team group says the same. Mum sets an alarm for eight-thirty.', 'ກຸ່ມທີມບອກຄືກັນ. ແມ່ຕັ້ງໂມງປຸກແປດໂມງເຄິ່ງ.'),
      hangup: l('Ton turns up at eight and waits alone in the rain for an hour.', 'ຕົ້ນໄປຮອດແປດໂມງ ແລ້ວລໍຖ້າຄົນດຽວກາງຝົນໜຶ່ງຊົ່ວໂມງ.'),
    },
    signs: ['known', 'match', 'nothing'], flags: [],
    remember: l('Real grown-ups are happy for you to tell your parents. That is a good sign.', 'ຜູ້ໃຫຍ່ແທ້ ດີໃຈທີ່ທ່ານບອກພໍ່ແມ່. ນັ້ນແມ່ນສັນຍານທີ່ດີ.') },

  { id: 'ton-stranger', real: false, voice: { who: 'man', rate: 6, pitch: -8 }, time: '17:00', place: l('Watching cartoons', 'ເບິ່ງກາຕູນ'), stake: 0,
    note: l('Dad is working in the provinces this week. Ton is home alone until Mum gets back.', 'ອາທິດນີ້ພໍ່ໄປເຮັດວຽກຕ່າງແຂວງ. ຕົ້ນຢູ່ເຮືອນຄົນດຽວຈົນແມ່ກັບ.'),
    caller: l('Unknown number', 'ເບີບໍ່ຮູ້ຈັກ'), number: '+856 20 98•• 4432', saved: false,
    lines: [
      l("Hello, I'm a friend of your dad. He asked me to pick you up.", 'ສະບາຍດີຫຼານ, ອາເປັນໝູ່ພໍ່ຂອງຫຼານເດີ້. ພໍ່ໃຫ້ອາມາຮັບຫຼານ.'),
      l('Is anybody at home with you right now?', 'ຕອນນີ້ມີໃຜຢູ່ເຮືອນນຳຫຼານບໍ່?'),
      l("Tell me your address. It's our secret, don't call your mum.", 'ບອກທີ່ຢູ່ໃຫ້ອາແດ່. ອັນນີ້ເປັນຄວາມລັບຂອງເຮົາເດີ້ ບໍ່ຕ້ອງໂທຫາແມ່.'),
    ],
    moves: { trust: l('Tell him the address', 'ບອກທີ່ຢູ່'), check: l('Say "I will call my mum" and hang up', 'ບອກວ່າ "ຈະໂທຫາແມ່" ແລ້ວວາງສາຍ'), hangup: l('Hang up and call Mum', 'ວາງສາຍ ແລ້ວໂທຫາແມ່') },
    outcome: {
      trust: l('A stranger now knows Ton is alone and where he lives. Mum rushes home and calls the police.', 'ຄົນແປກໜ້າຮູ້ວ່າຕົ້ນຢູ່ຄົນດຽວ ແລະ ຢູ່ໃສ. ແມ່ຟ້າວກັບ ແລະ ແຈ້ງຕຳຫຼວດ.'),
      check: l("Mum confirms Dad sent nobody. She tells Ton he did exactly the right thing.", 'ແມ່ຢືນຢັນວ່າພໍ່ບໍ່ໄດ້ສົ່ງໃຜມາ. ແມ່ບອກວ່າຕົ້ນເຮັດຖືກແລ້ວ.'),
      hangup: l('Mum is home in ten minutes and blocks the number.', 'ແມ່ກັບຮອດໃນສິບນາທີ ແລະ ບລັອກເບີນັ້ນ.'),
    },
    signs: ['private', 'hush', 'mask'], flags: ['personal_data', 'unverified_identity'],
    remember: l('Never tell a caller that you are alone or where you live. Call a parent instead.', 'ຢ່າບອກຜູ້ໂທວ່າຢູ່ຄົນດຽວ ຫຼື ຢູ່ໃສ. ໃຫ້ໂທຫາພໍ່ແມ່ແທນ.') },

  { id: 'ton-grandma', real: true, voice: { who: 'woman', rate: -12, pitch: -2 }, time: '17:30', place: l('Feeding the cat', 'ໃຫ້ອາຫານແມວ'), stake: 0,
    note: l('Grandma lives two streets away and visits most weekends.', 'ແມ່ຕູ້ຢູ່ຫ່າງໄປສອງຊອຍ ມາຢາມເກືອບທຸກທ້າຍອາທິດ.'),
    caller: l('Grandma', 'ແມ່ຕູ້'), number: '+856 20 22•• 6610', saved: true,
    lines: [
      l("Ton, it's Grandma. I made khao poon today.", 'ຕົ້ນ, ແມ່ຕູ້ເອງເດີ້ລູກ. ມື້ນີ້ແມ່ຕູ້ເຮັດເຂົ້າປຸ້ນ.'),
      l("I'll bring some over at seven.", 'ເຈັດໂມງແລງ ແມ່ຕູ້ຈະເອົາໄປໃຫ້ເດີ້.'),
      l('Tell your mum to keep a bowl ready for me!', 'ບອກແມ່ໃຫ້ກຽມຖ້ວຍໄວ້ໃຫ້ແມ່ຕູ້ນຳເດີ້!'),
    ],
    moves: { trust: l('Say "Yes Grandma!" and tell Mum', 'ບອກວ່າ "ເຈົ້າ ແມ່ຕູ້!" ແລ້ວບອກແມ່'), check: l('Check it is Grandma\'s saved number', 'ກວດວ່າແມ່ນເບີແມ່ຕູ້ທີ່ບັນທຶກໄວ້'), hangup: l('Hang up, too busy', 'ວາງສາຍ ບໍ່ຫວ່າງ') },
    outcome: {
      trust: l('Seven o\'clock: khao poon for everyone.', 'ເຈັດໂມງ: ເຂົ້າປຸ້ນໃຫ້ທຸກຄົນ.'),
      check: l("It's Grandma's number. Ton passes the message on.", 'ແມ່ນເບີແມ່ຕູ້. ຕົ້ນບອກແມ່ຕໍ່.'),
      hangup: l('Grandma calls Mum instead, a little hurt that Ton hung up on her.', 'ແມ່ຕູ້ໂທຫາແມ່ແທນ ນ້ອຍໃຈໜ້ອຍໜຶ່ງທີ່ຕົ້ນວາງສາຍ.'),
    },
    signs: ['known', 'nothing'], flags: [],
    remember: l('Not every call is a trick. Family on a saved number asking for nothing is safe.', 'ບໍ່ແມ່ນທຸກສາຍແມ່ນກົນ. ຄອບຄົວເບີທີ່ບັນທຶກ ບໍ່ຂໍຫຍັງ ແມ່ນປອດໄພ.') },

  { id: 'ton-hospital', real: false, voice: { who: 'woman', rate: 18, pitch: 4 }, time: '18:00', place: l('Waiting for Mum', 'ລໍຖ້າແມ່'), stake: 1_000_000,
    note: l('Mum said she would be home by six-thirty.', 'ແມ່ບອກວ່າຈະກັບຮອດຫົກໂມງເຄິ່ງ.'),
    caller: l('Hospital nurse', 'ພະຍາບານໂຮງໝໍ'), number: '+856 30 40•• 1187', saved: false,
    lines: [
      l('Is this Ton? Your mum fell at the market and she is in hospital!', 'ແມ່ນຕົ້ນບໍ່? ແມ່ຂອງນ້ອງລົ້ມຢູ່ຕະຫຼາດ ຕອນນີ້ຢູ່ໂຮງໝໍແລ້ວ!'),
      l('We need money for her treatment right now.', 'ຕ້ອງໃຊ້ເງິນປິ່ນປົວແມ່ດຽວນີ້ເລີຍ.'),
      l("Open your mum's bank app on the old phone and read me the password.", 'ນ້ອງເປີດແອັບທະນາຄານຂອງແມ່ ໃນໂທລະສັບເຄື່ອງເກົ່າ ແລ້ວອ່ານລະຫັດໃຫ້ຟັງແດ່.'),
    ],
    moves: { trust: l('Read the password, Mum needs help', 'ອ່ານລະຫັດ ແມ່ຕ້ອງການຄວາມຊ່ວຍເຫຼືອ'), check: l('Hang up and call Mum and Grandma', 'ວາງສາຍ ແລ້ວໂທຫາແມ່ ແລະ ແມ່ຕູ້'), hangup: l('Hang up', 'ວາງສາຍ') },
    outcome: {
      trust: l("1,000,000 kip left Mum's account. Mum was fine, just stuck in traffic.", 'ເງິນ 1,000,000 ກີບອອກຈາກບັນຊີແມ່. ແມ່ບໍ່ເປັນຫຍັງ ພຽງແຕ່ລົດຕິດ.'),
      check: l('Mum answers from her motorbike. She is fine and nearly home.', 'ແມ່ຮັບສາຍຈາກລົດຈັກ. ບໍ່ເປັນຫຍັງ ໃກ້ຮອດເຮືອນແລ້ວ.'),
      hangup: l('Ton is scared, but Mum walks in five minutes later, safe.', 'ຕົ້ນຢ້ານ ແຕ່ແມ່ເຂົ້າເຮືອນມາຫ້ານາທີຕໍ່ມາ ປອດໄພ.'),
    },
    signs: ['scare', 'mask', 'code', 'clock'], flags: ['urgency', 'unverified_identity', 'personal_data'],
    remember: l('If a caller says a parent is hurt, call that parent or another grown-up yourself. Hospitals never ask a child for passwords.', 'ຖ້າຜູ້ໂທບອກວ່າພໍ່ແມ່ບາດເຈັບ ໃຫ້ໂທຫາພໍ່ແມ່ ຫຼື ຜູ້ໃຫຍ່ເອງ. ໂຮງໝໍບໍ່ເຄີຍຂໍລະຫັດຈາກເດັກ.') },

  { id: 'ton-sister', real: false, voice: { who: 'woman', rate: 12, pitch: 6 }, time: '16:30', place: l('Snack time', 'ເວລາກິນເຂົ້າໜົມ'), stake: 0,
    note: l("Ton's big sister Nok is 19 and has been looking for work.", 'ເອື້ອຍນົກຂອງຕົ້ນອາຍຸ 19 ປີ ກຳລັງຊອກວຽກ.'),
    caller: l('Unknown number', 'ເບີບໍ່ຮູ້ຈັກ'), number: '+66 9•• ••• 207', saved: false,
    lines: [
      l("Hi little one! I'm a friend of your big sister. Is she home?", 'ສະບາຍດີນ້ອງ! ເອື້ອຍເປັນໝູ່ຂອງເອື້ອຍນ້ອງເດີ້. ລາວຢູ່ເຮືອນບໍ່?'),
      l('I have a great job for her abroad. Tell me her phone number and send me her photo.', 'ເອື້ອຍມີວຽກດີໆຢູ່ຕ່າງປະເທດໃຫ້ລາວ. ບອກເບີໂທລາວແດ່ ແລ້ວສົ່ງຮູບລາວມາໃຫ້ເອື້ອຍນຳ.'),
      l("Don't tell your mum yet. It's a surprise!", 'ຢ່າຟ້າວບອກແມ່ເທື່ອເດີ້. ເອົາໄວ້ເຊີໄພຣສ໌!'),
    ],
    moves: { trust: l("Give Nok's number and photo", 'ໃຫ້ເບີ ແລະ ຮູບຂອງເອື້ອຍນົກ'), check: l('Say "ask her yourself" and tell Mum', 'ບອກວ່າ "ຖາມລາວເອງ" ແລ້ວບອກແມ່'), hangup: l('Hang up', 'ວາງສາຍ') },
    outcome: {
      trust: l('The "friend" now messages Nok every day with a job offer that sounds perfect. Ton was used to reach her.', '"ໝູ່" ສົ່ງຂໍ້ຄວາມຫານົກທຸກມື້ ກັບວຽກທີ່ຟັງດີເລີດ. ຕົ້ນຖືກໃຊ້ເປັນທາງເຂົ້າຫາລາວ.'),
      check: l('Mum and Nok have never heard of this friend. Now the family knows to be careful.', 'ແມ່ ແລະ ນົກ ບໍ່ເຄີຍຮູ້ຈັກໝູ່ຄົນນີ້. ຕອນນີ້ຄອບຄົວຮູ້ວ່າຕ້ອງລະວັງ.'),
      hangup: l('Ton hangs up. He should still tell Mum, but nothing was shared.', 'ຕົ້ນວາງສາຍ. ຄວນບອກແມ່ຢູ່ ແຕ່ບໍ່ໄດ້ໃຫ້ຫຍັງໄປ.'),
    },
    signs: ['gift', 'private', 'hush'], flags: ['too_good', 'personal_data', 'off_platform'],
    remember: l('Recruiters use kids to reach older brothers and sisters. Family numbers and photos stay private.', 'ຄົນຊັກຊວນໃຊ້ເດັກ ເພື່ອເຂົ້າຫາອ້າຍເອື້ອຍ. ເບີ ແລະ ຮູບຂອງຄອບຄົວເປັນເລື່ອງສ່ວນຕົວ.') },

  { id: 'ton-library', real: true, voice: { who: 'woman', rate: -8, pitch: 2 }, time: '17:00', place: l('Watching cartoons', 'ເບິ່ງກາຕູນ'), stake: 0,
    note: l('Last week Ton and Mum reserved a dinosaur book at the school library.', 'ອາທິດແລ້ວ ຕົ້ນກັບແມ່ຈອງປຶ້ມໄດໂນເສົາທີ່ຫ້ອງສະໝຸດໂຮງຮຽນ.'),
    caller: l('School library', 'ຫ້ອງສະໝຸດໂຮງຮຽນ'), number: '+856 21 41•• 2286', saved: true,
    lines: [
      l('Hello, this is the school library.', 'ສະບາຍດີ, ນີ້ແມ່ນຫ້ອງສະໝຸດໂຮງຮຽນເດີ້.'),
      l("The dinosaur book you reserved is ready.", 'ປຶ້ມໄດໂນເສົາ ທີ່ນ້ອງຈອງໄວ້ ມາແລ້ວເດີ້.'),
      l('Come and get it with Mum or Dad any day this week.', 'ມາເອົາກັບພໍ່ ຫຼື ແມ່ ມື້ໃດກໍ່ໄດ້ໃນອາທິດນີ້.'),
    ],
    moves: { trust: l('Say thank you and tell Mum', 'ຂອບໃຈ ແລ້ວບອກແມ່'), check: l('Ask Mum if they reserved a book', 'ຖາມແມ່ວ່າຈອງປຶ້ມແທ້ບໍ'), hangup: l('Hang up, it might be a trick', 'ວາງສາຍ ອາດແມ່ນກົນຫຼອກ') },
    outcome: {
      trust: l('Ton gets the dinosaur book the next morning.', 'ຕົ້ນໄດ້ປຶ້ມໄດໂນເສົາມື້ຕໍ່ມາ.'),
      check: l('Mum remembers. They pick it up together tomorrow.', 'ແມ່ຈື່ໄດ້. ໄປເອົານຳກັນມື້ອື່ນ.'),
      hangup: l('Someone else borrows the book first.', 'ມີຄົນອື່ນຢືມປຶ້ມໄປກ່ອນ.'),
    },
    signs: ['known', 'match', 'nothing'], flags: [],
    remember: l('A saved number, something you really did, and it tells you to bring a parent: that is safe.', 'ເບີທີ່ບັນທຶກ, ສິ່ງທີ່ເຮັດແທ້ ແລະ ບອກໃຫ້ພາພໍ່ແມ່ມາ: ນັ້ນປອດໄພ.') },
];

export const NOY_CALLS: Call[] = [
  { id: 'noy-uni', real: true, voice: real, time: '08:00', place: l('Breakfast', 'ກິນເຂົ້າເຊົ້າ'), stake: 0,
    note: l('Noy applied to the National University last week and wrote her number on the form.', 'ອາທິດແລ້ວນ້ອຍສະໝັກມະຫາວິທະຍາໄລແຫ່ງຊາດ ແລະ ຂຽນເບີໃສ່ໃບສະໝັກ.'),
    caller: l('Unknown number', 'ເບີບໍ່ຮູ້ຈັກ'), number: '+856 21 77•• 0412', saved: false,
    lines: [
      l('Hello, this is the admissions office at the National University.', 'ສະບາຍດີ, ໂທມາຈາກຫ້ອງການຮັບສະໝັກ ມະຫາວິທະຍາໄລແຫ່ງຊາດເດີ້.'),
      l('Your application is missing a copy of your school certificate.', 'ໃບສະໝັກຂອງນ້ອງ ຍັງຂາດສຳເນົາໃບປະກາດຢູ່ເດີ້.'),
      l('Please bring it to Building Two before Friday. There is no fee.', 'ກະລຸນາເອົາມາສົ່ງທີ່ຕຶກສອງ ກ່ອນວັນສຸກ. ບໍ່ມີຄ່າທຳນຽມຫຍັງເດີ້.'),
    ],
    moves: { trust: l('Say thanks and bring it on Friday', 'ຂອບໃຈ ແລ້ວເອົາໄປວັນສຸກ'), check: l('Call back on the number from the university website', 'ໂທກັບເບີໃນເວັບໄຊມະຫາວິທະຍາໄລ'), hangup: l('Hang up, it is a strange number', 'ວາງສາຍ ເບີແປກ') },
    outcome: {
      trust: l('Noy hands in the copy at the office. Her application is complete.', 'ນ້ອຍຍື່ນສຳເນົາທີ່ຫ້ອງການ. ໃບສະໝັກຄົບຖ້ວນ.'),
      check: l('The website number reaches the same office. Careful, and still on time.', 'ເບີໃນເວັບຕິດຫ້ອງການດຽວກັນ. ລະວັງ ແລະ ທັນເວລາ.'),
      hangup: l('Noy misses the deadline and her application is put on hold.', 'ນ້ອຍພາດເສັ້ນຕາຍ ໃບສະໝັກຖືກພັກໄວ້.'),
    },
    signs: ['match', 'nothing'], flags: [],
    remember: l('A call that asks you to come to the office in person, with no fee, is how real offices work.', 'ສາຍທີ່ໃຫ້ໄປຫ້ອງການເອງ ບໍ່ມີຄ່າທຳນຽມ ແມ່ນວິທີຂອງຫ້ອງການແທ້.') },

  { id: 'noy-job', real: false, voice: { who: 'woman', rate: 14, pitch: 6 }, time: '09:30', place: l('Scrolling job posts', 'ເລື່ອນເບິ່ງປະກາດວຽກ'), stake: 200_000,
    note: l('Noy posted in a group that she wants part-time work for the summer.', 'ນ້ອຍໂພສໃນກຸ່ມວ່າຢາກໄດ້ວຽກພາກສ່ວນຊ່ວງພັກຮຽນ.'),
    caller: l('Recruiter', 'ຜູ້ຮັບສະໝັກວຽກ'), number: '+856 20 93•• 5528', saved: false,
    lines: [
      l('Hi! We saw your post. Easy work from home: rate hotels online for 300,000 kip a day.', 'ສະບາຍດີເດີ້! ເຫັນໂພສຂອງນ້ອງແລ້ວ. ມີວຽກງ່າຍໆຢູ່ເຮືອນ: ໃຫ້ຄະແນນໂຮງແຮມອອນລາຍ ໄດ້ມື້ລະ 300,000 ກີບ.'),
      l('First you pay a 200,000 kip fee to activate your account.', 'ແຕ່ກ່ອນອື່ນ ຕ້ອງຈ່າຍຄ່າເປີດບັນຊີ 200,000 ກີບກ່ອນເດີ້.'),
      l('Only three places left. Transfer in the next ten minutes.', 'ຕອນນີ້ເຫຼືອແຕ່ສາມບ່ອນ. ໂອນພາຍໃນສິບນາທີນີ້ເລີຍເດີ້.'),
    ],
    moves: { trust: l('Transfer the fee to grab a place', 'ໂອນຄ່າທຳນຽມ ຈອງບ່ອນ'), check: l('Ask for the company name and office address', 'ຖາມຊື່ບໍລິສັດ ແລະ ທີ່ຢູ່ຫ້ອງການ'), hangup: l('Hang up', 'ວາງສາຍ') },
    outcome: {
      trust: l('After the fee came a "tax", then an "upgrade". 200,000 kip gone and no job.', 'ຫຼັງຄ່າທຳນຽມ ມີ "ພາສີ" ແລ້ວ "ອັບເກຣດ". ເສຍ 200,000 ກີບ ບໍ່ມີວຽກ.'),
      check: l('The recruiter dodges the question and stops answering.', 'ຜູ້ຮັບສະໝັກຫຼົບຄຳຖາມ ແລ້ວບໍ່ຕອບອີກ.'),
      hangup: l('Noy keeps looking and finds a real job at a café nearby.', 'ນ້ອຍຊອກຕໍ່ ແລະ ໄດ້ວຽກແທ້ຢູ່ຮ້ານກາເຟໃກ້ໆ.'),
    },
    signs: ['gift', 'pay', 'clock'], flags: ['too_good', 'upfront_fee', 'urgency'],
    remember: l('Real employers pay you. A job that asks you to pay first is not a job.', 'ນາຍຈ້າງແທ້ຈ່າຍເງິນໃຫ້ທ່ານ. ວຽກທີ່ໃຫ້ຈ່າຍກ່ອນ ບໍ່ແມ່ນວຽກ.') },

  { id: 'noy-police', real: false, voice: { who: 'man', rate: 10, pitch: -12 }, time: '11:00', place: l('Studying at home', 'ຮຽນຢູ່ເຮືອນ'), stake: 1_500_000,
    note: l('Noy has never sent a parcel in her life.', 'ນ້ອຍບໍ່ເຄີຍສົ່ງພັດສະດຸຈັກເທື່ອ.'),
    caller: l('Police Department', 'ກົມຕຳຫຼວດ'), number: '+856 21 30•• 9001', saved: false,
    lines: [
      l('This is the police. A parcel with fake passports was sent in your name.', 'ນີ້ແມ່ນຕຳຫຼວດ. ມີພັດສະດຸທີ່ມີໜັງສືຜ່ານແດນປອມ ຖືກສົ່ງໃນນາມຂອງທ່ານ.'),
      l('You will be arrested today unless you prove you are innocent.', 'ທ່ານຈະຖືກຈັບພາຍໃນມື້ນີ້ ຖ້າບໍ່ພິສູດໃຫ້ເຫັນວ່າທ່ານບໍລິສຸດ.'),
      l('Move your savings to our safe account for checking, and tell no one, not even your parents.', 'ໃຫ້ໂອນເງິນເກັບທັງໝົດ ເຂົ້າບັນຊີປອດໄພຂອງພວກເຮົາເພື່ອກວດສອບ. ແລະ ຫ້າມບອກໃຜ ແມ່ນແຕ່ພໍ່ແມ່.'),
    ],
    moves: { trust: l('Move the money to stay out of trouble', 'ໂອນເງິນ ເພື່ອບໍ່ໃຫ້ມີບັນຫາ'), check: l('Tell her parents and call the police station herself', 'ບອກພໍ່ແມ່ ແລະ ໂທຫາປ້ອມຕຳຫຼວດເອງ'), hangup: l('Hang up', 'ວາງສາຍ') },
    outcome: {
      trust: l("There is no safe account. 1,500,000 kip of Noy's savings is gone.", 'ບໍ່ມີບັນຊີປອດໄພ. ເງິນເກັບ 1,500,000 ກີບຂອງນ້ອຍຫາຍໄປ.'),
      check: l('The station has no case in her name. Her dad reports the number.', 'ປ້ອມຕຳຫຼວດບໍ່ມີຄະດີໃນນາມນາງ. ພໍ່ລາຍງານເບີນັ້ນ.'),
      hangup: l('Nobody comes to arrest anyone. Noy goes back to studying.', 'ບໍ່ມີໃຜມາຈັບ. ນ້ອຍກັບໄປຮຽນຕໍ່.'),
    },
    signs: ['mask', 'scare', 'hush', 'pay'], flags: ['unverified_identity', 'urgency', 'off_platform'],
    remember: l('Police never ask you to move money to a "safe account", and never tell you to hide it from family.', 'ຕຳຫຼວດບໍ່ເຄີຍໃຫ້ໂອນເງິນເຂົ້າ "ບັນຊີປອດໄພ" ແລະ ບໍ່ໃຫ້ປິດບັງຄອບຄົວ.') },

  { id: 'noy-cafe', real: true, voice: { who: 'woman', rate: -4, pitch: -2 }, time: '13:00', place: l('Lunch with friends', 'ກິນເຂົ້າທ່ຽງກັບໝູ່'), stake: 0,
    note: l('Yesterday Noy handed her CV to the owner of a café near her school.', 'ມື້ວານນ້ອຍຍື່ນປະຫວັດໃຫ້ເຈົ້າຂອງຮ້ານກາເຟໃກ້ໂຮງຮຽນ.'),
    caller: l('Unknown number', 'ເບີບໍ່ຮູ້ຈັກ'), number: '+856 20 56•• 3349', saved: false,
    lines: [
      l("Hi Noy, it's Mrs. Phet from the café. You left your CV yesterday.", 'ສະບາຍດີນ້ອຍ, ເອື້ອຍເພັດ ຈາກຮ້ານກາເຟເດີ້. ມື້ວານນ້ອຍມາຝາກປະຫວັດໄວ້.'),
      l('Can you come for a trial shift on Saturday morning?', 'ວັນເສົາຕອນເຊົ້າ ມາລອງເຮັດວຽກເບິ່ງໄດ້ບໍ່?'),
      l('We pay at the end of the day, in cash.', 'ເຮົາຈ່າຍເງິນສົດ ຕອນເລີກວຽກເລີຍເດີ້.'),
    ],
    moves: { trust: l('Say yes to Saturday', 'ຕອບຮັບວັນເສົາ'), check: l('Save her number and ask her to text the time', 'ບັນທຶກເບີ ແລະ ຂໍໃຫ້ສົ່ງເວລາທາງຂໍ້ຄວາມ'), hangup: l('Hang up, unknown caller', 'ວາງສາຍ ບໍ່ຮູ້ຈັກ') },
    outcome: {
      trust: l('The trial goes well. Noy gets the summer job.', 'ການລອງວຽກໄປໄດ້ດີ. ນ້ອຍໄດ້ວຽກພາກຮຽນ.'),
      check: l('Mrs. Phet texts "Saturday 7:00". Noy goes and gets the job.', 'ເອື້ອຍເພັດສົ່ງ "ວັນເສົາ 7:00". ນ້ອຍໄປ ແລະ ໄດ້ວຽກ.'),
      hangup: l('The café gives the job to someone else.', 'ຮ້ານກາເຟໃຫ້ວຽກຄົນອື່ນ.'),
    },
    signs: ['match', 'nothing'], flags: [],
    remember: l('This job came from a place Noy visited herself, and it pays her. No fee, no secrets.', 'ວຽກນີ້ມາຈາກບ່ອນທີ່ນ້ອຍໄປເອງ ແລະ ຈ່າຍໃຫ້ນາງ. ບໍ່ມີຄ່າທຳນຽມ ບໍ່ມີຄວາມລັບ.') },

  { id: 'noy-friend', real: true, voice: { who: 'woman', rate: 2, pitch: 8 }, time: '15:00', place: l('On the bus home', 'ຢູ່ລົດເມກັບບ້ານ'), stake: 0,
    note: l('Noy and her classmate Bee have a chemistry test next week.', 'ນ້ອຍ ແລະ ບີ ໝູ່ຮ່ວມຫ້ອງ ມີສອບເຄມີອາທິດໜ້າ.'),
    caller: l('Bee', 'ບີ'), number: '+856 20 99•• 2207', saved: true,
    lines: [
      l('Noy! Did you see the group chat?', 'ນ້ອຍ! ເຫັນແຊັດກຸ່ມບໍ່?'),
      l("We're meeting at the library at four to study for chemistry.", 'ພວກເຮົານັດກັນຢູ່ຫໍສະໝຸດ ສີ່ໂມງ ອ່ານເຄມີນຳກັນ.'),
      l('Bring your notes, mine are a mess!', 'ເອົາບົດຈົດມານຳເດີ້ ຂອງເຮົາຫຍຸ້ງໝົດເລີຍ!'),
    ],
    moves: { trust: l('Say "See you at four!"', 'ບອກວ່າ "ພົບກັນສີ່ໂມງ!"'), check: l('Check the group chat first', 'ກວດແຊັດກຸ່ມກ່ອນ'), hangup: l('Hang up, it could be fake', 'ວາງສາຍ ອາດເປັນຂອງປອມ') },
    outcome: {
      trust: l('Four friends, one table, much better notes.', 'ໝູ່ສີ່ຄົນ ໂຕະດຽວ ບົດຈົດດີຂຶ້ນຫຼາຍ.'),
      check: l('The group chat says the same. Noy heads to the library.', 'ແຊັດກຸ່ມບອກຄືກັນ. ນ້ອຍໄປຫໍສະໝຸດ.'),
      hangup: l('Bee is confused and the group studies without Noy.', 'ບີງົງ ແລະ ກຸ່ມອ່ານໜັງສືໂດຍບໍ່ມີນ້ອຍ.'),
    },
    signs: ['known', 'nothing'], flags: [],
    remember: l('Being careful is not the same as trusting no one. A saved friend asking nothing is fine.', 'ລະວັງ ບໍ່ແມ່ນບໍ່ເຊື່ອໃຜເລີຍ. ໝູ່ທີ່ບັນທຶກໄວ້ ບໍ່ຂໍຫຍັງ ແມ່ນປອດໄພ.') },

  { id: 'noy-scholar', real: false, voice: { who: 'man', rate: 12, pitch: 2 }, time: '17:00', place: l('Doing homework', 'ເຮັດການບ້ານ'), stake: 500_000,
    note: l('Noy has not applied for any scholarship abroad.', 'ນ້ອຍບໍ່ໄດ້ສະໝັກທຶນຕ່າງປະເທດໃດໆ.'),
    caller: l('Scholarship Foundation', 'ມູນນິທິທຶນການສຶກສາ'), number: '+856 30 88•• 7120', saved: false,
    lines: [
      l('Congratulations! You have won a full scholarship to study in Japan.', 'ຍິນດີນຳເດີ້! ທ່ານໄດ້ຮັບທຶນເຕັມ ໄປຮຽນຢູ່ປະເທດຍີ່ປຸ່ນ.'),
      l('To keep your place, pay the 500,000 kip processing fee today.', 'ເພື່ອຮັກສາບ່ອນໄວ້ ຕ້ອງຈ່າຍຄ່າດຳເນີນການ 500,000 ກີບ ພາຍໃນມື້ນີ້.'),
      l("Also send a photo of your ID card and your parents' bank details.", 'ແລ້ວສົ່ງຮູບບັດປະຈຳຕົວ ກັບຂໍ້ມູນທະນາຄານຂອງພໍ່ແມ່ ມາໃຫ້ນຳເດີ້.'),
    ],
    moves: { trust: l('Pay and send the photos', 'ຈ່າຍ ແລະ ສົ່ງຮູບ'), check: l('Ask her teacher if the scholarship is real', 'ຖາມຄູວ່າທຶນນີ້ແທ້ບໍ'), hangup: l('Hang up', 'ວາງສາຍ') },
    outcome: {
      trust: l('500,000 kip gone, and her ID is later used to open a fake account.', 'ເສຍ 500,000 ກີບ ແລະ ບັດຂອງນາງຖືກໃຊ້ເປີດບັນຊີປອມ.'),
      check: l('Her teacher has never heard of it. Real scholarships come through the school.', 'ຄູບໍ່ເຄີຍໄດ້ຍິນ. ທຶນແທ້ມາຜ່ານໂຮງຮຽນ.'),
      hangup: l('Noy had applied for nothing, so she lost nothing.', 'ນ້ອຍບໍ່ໄດ້ສະໝັກຫຍັງ ຈຶ່ງບໍ່ເສຍຫຍັງ.'),
    },
    signs: ['gift', 'pay', 'private'], flags: ['too_good', 'upfront_fee', 'personal_data'],
    remember: l('You cannot win a scholarship you never applied for. Real ones never charge to "hold your place".', 'ບໍ່ສາມາດໄດ້ທຶນທີ່ບໍ່ເຄີຍສະໝັກ. ທຶນແທ້ບໍ່ເກັບເງິນ "ຈອງບ່ອນ".') },

  { id: 'noy-chat', real: false, voice: { who: 'woman', rate: 14, pitch: 4 }, time: '13:00', place: l('Lunch with friends', 'ກິນເຂົ້າທ່ຽງກັບໝູ່'), stake: 300_000,
    note: l('Noy liked a job post on social media this morning.', 'ເຊົ້ານີ້ ນ້ອຍກົດໄລກ໌ໂພສວຽກໃນໂຊຊຽວ.'),
    caller: l('Unknown number', 'ເບີບໍ່ຮູ້ຈັກ'), number: '+856 20 77•• 0153', saved: false,
    lines: [
      l('Hi Noy! We saw you liked our post. Online chat job, eight million kip a month.', 'ສະບາຍດີນ້ອຍ! ເຫັນນ້ອຍກົດໄລກ໌ໂພສເຮົາ. ມີວຽກແຊັດອອນລາຍ ເດືອນລະແປດລ້ານກີບເດີ້.'),
      l('Free meals and a free room at our office near the border.', 'ມີອາຫານຟຣີ ຫ້ອງພັກຟຣີ ຢູ່ຫ້ອງການໃກ້ຊາຍແດນ.'),
      l('Just pay three hundred thousand kip for the uniform, and the bus leaves Saturday.', 'ພຽງແຕ່ຈ່າຍຄ່າເຄື່ອງແບບ ສາມແສນກີບ, ລົດຈະອອກວັນເສົານີ້.'),
    ],
    moves: { trust: l('Pay for the uniform and pack a bag', 'ຈ່າຍຄ່າເຄື່ອງແບບ ແລ້ວກຽມກະເປົາ'), check: l('Ask for the company name and check with the labour office', 'ຂໍຊື່ບໍລິສັດ ແລ້ວກວດກັບຫ້ອງການແຮງງານ'), hangup: l('Hang up', 'ວາງສາຍ') },
    outcome: {
      trust: l('Three hundred thousand kip gone. In real cases like this, the "free" room became a debt and the chat quota was impossible.', 'ເສຍສາມແສນກີບ. ໃນກໍລະນີແທ້ ຫ້ອງ "ຟຣີ" ກາຍເປັນໜີ້ ແລະ ເປົ້າແຊັດເປັນໄປບໍ່ໄດ້.'),
      check: l('"Company name? We are new." The caller hangs up. No such company is registered.', '"ຊື່ບໍລິສັດ? ເຮົາຫາກໍ່ເປີດ." ຜູ້ໂທວາງສາຍ. ບໍ່ມີບໍລິສັດນີ້ຈົດທະບຽນ.'),
      hangup: l('Noy goes back to lunch with her friends and her savings.', 'ນ້ອຍກັບໄປກິນເຂົ້າກັບໝູ່ ເງິນເກັບຍັງຢູ່.'),
    },
    signs: ['gift', 'debt', 'pay', 'clock'], flags: ['too_good', 'upfront_fee', 'unverified_identity', 'urgency'],
    remember: l('Free room and travel can turn into debt. A real employer has a name and address you can check.', 'ຫ້ອງ ແລະ ຄ່າເດີນທາງຟຣີ ອາດກາຍເປັນໜີ້. ນາຍຈ້າງແທ້ມີຊື່ ແລະ ທີ່ຢູ່ທີ່ກວດໄດ້.') },

  { id: 'noy-bakery', real: true, voice: { who: 'woman', rate: -4, pitch: -2 }, time: '09:30', place: l('Scrolling job posts', 'ເລື່ອນເບິ່ງປະກາດວຽກ'), stake: 0,
    note: l('Yesterday Noy handed her CV to the bakery on her street.', 'ມື້ວານ ນ້ອຍເອົາ CV ໄປຝາກຮ້ານເບເກີຣີໃນຊອຍ.'),
    caller: l('Unknown number', 'ເບີບໍ່ຮູ້ຈັກ'), number: '+856 20 55•• 7412', saved: false,
    lines: [
      l("Hello Noy, it's Mrs Phet from the bakery. Thanks for your CV.", 'ສະບາຍດີນ້ອຍ, ນາງເພັດ ຈາກຮ້ານເບເກີຣີເດີ້. ຂອບໃຈທີ່ສົ່ງ CV ມາ.'),
      l('Can you come for a trial shift on Saturday at eight?', 'ວັນເສົາ ແປດໂມງ ມາລອງວຽກໄດ້ບໍ່?'),
      l("Bring your ID card. We copy it and hand it back. Seventy thousand a day.", 'ເອົາບັດປະຈຳຕົວມານຳ. ເຮົາຖ່າຍສຳເນົາແລ້ວຄືນໃຫ້ເລີຍ. ຄ່າແຮງ ມື້ລະເຈັດສິບພັນເດີ້.'),
    ],
    moves: { trust: l('Say yes to Saturday', 'ຕົກລົງວັນເສົາ'), check: l('Walk past the bakery and ask in person', 'ຍ່າງໄປຖາມທີ່ຮ້ານເອງ'), hangup: l('Hang up, job calls are scams', 'ວາງສາຍ ສາຍວຽກແມ່ນການຫຼອກ') },
    outcome: {
      trust: l('Noy works the Saturday shift and goes home with seventy thousand kip.', 'ນ້ອຍເຮັດວຽກວັນເສົາ ໄດ້ເງິນເຈັດສິບພັນກີບກັບບ້ານ.'),
      check: l('Mrs Phet waves from behind the counter. Same offer, face to face.', 'ນາງເພັດໂບກມືຈາກເຄົາເຕີ. ຂໍ້ສະເໜີດຽວກັນ ພົບໜ້າ.'),
      hangup: l('Noy misses a real job just down the street.', 'ນ້ອຍພາດວຽກແທ້ໃກ້ເຮືອນ.'),
    },
    signs: ['match', 'nothing'], flags: [],
    remember: l('A real place you visited, in-person work, your ID handed back, and they pay you.', 'ສະຖານທີ່ແທ້ທີ່ເຄີຍໄປ, ເຮັດວຽກຕົວຈິງ, ບັດຄືນໃຫ້ ແລະ ເຂົາຈ່າຍໃຫ້ທ່ານ.') },
];

export const KHAMLA_CALLS: Call[] = [
  { id: 'kh-drinks', real: true, voice: { who: 'man', rate: -4, pitch: -4 }, time: '07:00', place: l('Opening the shop', 'ເປີດຮ້ານ'), stake: 0,
    note: l('Khamla orders drinks from the same wholesaler every week. Their number is saved.', 'ຄຳຫຼ້າສັ່ງເຄື່ອງດື່ມຈາກຮ້ານຂາຍສົ່ງດຽວກັນທຸກອາທິດ. ເບີບັນທຶກໄວ້.'),
    caller: l('Drinks wholesaler', 'ຮ້ານຂາຍສົ່ງເຄື່ອງດື່ມ'), number: '+856 21 41•• 8830', saved: true,
    lines: [
      l('Morning Khamla! Your ten crates arrive at nine.', 'ສະບາຍດີຄຳຫຼ້າ! ເຄື່ອງດື່ມສິບແກັດ ຈະຮອດເກົ້າໂມງເດີ້.'),
      l('Same price as last week.', 'ລາຄາຄືອາທິດແລ້ວ.'),
      l('Pay the driver or at our counter, as usual.', 'ຈ່າຍຄົນຂັບ ຫຼື ຈ່າຍທີ່ເຄົາເຕີກໍ່ໄດ້ ຄືເກົ່າເນາະ.'),
    ],
    moves: { trust: l('Say thanks, get the cash ready', 'ຂອບໃຈ ກຽມເງິນສົດ'), check: l('Compare with last week\'s receipt', 'ທຽບກັບໃບບິນອາທິດແລ້ວ'), hangup: l('Hang up, too busy', 'ວາງສາຍ ບໍ່ຫວ່າງ') },
    outcome: {
      trust: l('The crates arrive on time and the fridge is full before the lunch rush.', 'ແກັດມາຮອດທັນເວລາ ຕູ້ເຢັນເຕັມກ່ອນທ່ຽງ.'),
      check: l('Same price as the receipt. Khamla pays the driver at nine.', 'ລາຄາກົງໃບບິນ. ຄຳຫຼ້າຈ່າຍຄົນຂັບເກົ້າໂມງ.'),
      hangup: l('Nobody is there to receive the crates and the driver takes them back.', 'ບໍ່ມີໃຜຮັບແກັດ ຄົນຂັບເອົາກັບຄືນ.'),
    },
    signs: ['known', 'match', 'nothing'], flags: [],
    remember: l('Saved number, usual order, usual way to pay: everything matches.', 'ເບີທີ່ບັນທຶກ ສັ່ງປົກກະຕິ ຈ່າຍແບບເກົ່າ: ທຸກຢ່າງກົງກັນ.') },

  { id: 'kh-qr', real: false, voice: { who: 'woman', rate: 16, pitch: -6 }, time: '08:30', place: l('First customers', 'ລູກຄ້າທຳອິດ'), stake: 2_000_000,
    note: l('Khamla takes QR payments at the shop. Her bank has never phoned her.', 'ຄຳຫຼ້າຮັບຈ່າຍ QR ທີ່ຮ້ານ. ທະນາຄານບໍ່ເຄີຍໂທຫາ.'),
    caller: l('Bank security team', 'ທີມຄວາມປອດໄພທະນາຄານ'), number: '+856 30 21•• 6654', saved: false,
    lines: [
      l('Your shop QR account shows suspicious activity and will be frozen today.', 'ບັນຊີ QR ຂອງຮ້ານທ່ານ ມີທຸລະກຳໜ້າສົງໄສ, ຈະຖືກອາຍັດພາຍໃນມື້ນີ້.'),
      l('I am sending a code to confirm you are the owner. Read it to me.', 'ຂ້ອຍຈະສົ່ງລະຫັດ ເພື່ອຢືນຢັນວ່າທ່ານເປັນເຈົ້າຂອງ. ອ່ານໃຫ້ຂ້ອຍຟັງແດ່ເດີ້.'),
      l('Hurry, you have fifteen minutes.', 'ໄວໆເດີ້ ທ່ານມີເວລາແຕ່ສິບຫ້ານາທີ.'),
    ],
    moves: { trust: l('Read the code to keep the account open', 'ອ່ານລະຫັດ ບໍ່ໃຫ້ບັນຊີຖືກອາຍັດ'), check: l('Call the number on the back of her bank card', 'ໂທເບີຫຼັງບັດທະນາຄານ'), hangup: l('Hang up', 'ວາງສາຍ') },
    outcome: {
      trust: l('The code let them log in. 2,000,000 kip of shop money gone in a minute.', 'ລະຫັດໃຫ້ເຂົາເຂົ້າລະບົບ. ເງິນຮ້ານ 2,000,000 ກີບຫາຍໃນນາທີດຽວ.'),
      check: l('The bank says the account is fine and they never call for codes.', 'ທະນາຄານບອກບັນຊີບໍ່ເປັນຫຍັງ ແລະ ບໍ່ເຄີຍໂທຂໍລະຫັດ.'),
      hangup: l('The QR keeps working all day.', 'QR ໃຊ້ໄດ້ຕະຫຼອດມື້.'),
    },
    signs: ['mask', 'scare', 'code', 'clock'], flags: ['unverified_identity', 'urgency', 'personal_data'],
    remember: l('A bank will never ask you to read out a code. The number on your card is the one to call.', 'ທະນາຄານບໍ່ເຄີຍໃຫ້ອ່ານລະຫັດ. ເບີຫຼັງບັດແມ່ນເບີທີ່ຄວນໂທ.') },

  { id: 'kh-customer', real: true, voice: { who: 'woman', rate: -10, pitch: -4 }, time: '10:00', place: l('Stocking shelves', 'ຈັດເຄື່ອງໃສ່ຊັ້ນ'), stake: 0,
    note: l('Neighbours often phone ahead to reserve rice and oil.', 'ເພື່ອນບ້ານມັກໂທມາຈອງເຂົ້າ ແລະ ນ້ຳມັນລ່ວງໜ້າ.'),
    caller: l('Unknown number', 'ເບີບໍ່ຮູ້ຈັກ'), number: '+856 20 58•• 1146', saved: false,
    lines: [
      l("Hello, I'm Mrs. Ning, from the house near the temple.", 'ສະບາຍດີ, ແມ່ນິງເດີ້ ເຮືອນທີ່ຢູ່ໃກ້ວັດ.'),
      l('Could you keep five kilos of rice and two bottles of oil for me?', 'ເກັບເຂົ້າຫ້າກິໂລ ກັບນ້ຳມັນສອງຕຸກ ໄວ້ໃຫ້ແດ່ໄດ້ບໍ່?'),
      l("I'll pick them up and pay at five.", 'ຫ້າໂມງ ຈະມາເອົາ ແລ້ວຈ່າຍເງິນເລີຍເດີ້.'),
    ],
    moves: { trust: l('Set the bag aside for her', 'ເກັບຖົງໄວ້ໃຫ້'), check: l('Write her name and number on the bag', 'ຂຽນຊື່ ແລະ ເບີໃສ່ຖົງ'), hangup: l('Hang up, unknown number', 'ວາງສາຍ ເບີແປກ') },
    outcome: {
      trust: l('Mrs. Ning comes at five, pays cash, and becomes a regular.', 'ແມ່ນາງນິງມາຫ້າໂມງ ຈ່າຍເງິນສົດ ແລະ ກາຍເປັນລູກຄ້າປະຈຳ.'),
      check: l('The bag waits by the till with her name on it. She pays at five.', 'ຖົງລໍຖ້າຢູ່ຂ້າງເຄົາເຕີພ້ອມຊື່. ນາງຈ່າຍຫ້າໂມງ.'),
      hangup: l('Mrs. Ning buys from the shop across the road instead.', 'ແມ່ນາງນິງໄປຊື້ຮ້ານກົງກັນຂ້າມແທນ.'),
    },
    signs: ['nothing'], flags: [],
    remember: l('She pays in person when she collects, so Khamla risks nothing. Unknown is not the same as scam.', 'ນາງຈ່າຍກັບມືຕອນມາເອົາ ຄຳຫຼ້າບໍ່ສ່ຽງຫຍັງ. ເບີແປກ ບໍ່ແມ່ນການຫຼອກສະເໝີ.') },

  { id: 'kh-school', real: false, voice: { who: 'woman', rate: 18, pitch: 2 }, time: '12:00', place: l('Lunch rush', 'ຊ່ວງທ່ຽງຄົນຫຼາຍ'), stake: 800_000,
    note: l('Her son Somchai is at school until four. The school office number is saved.', 'ລູກຊາຍສົມໃຈຢູ່ໂຮງຮຽນຈົນສີ່ໂມງ. ເບີຫ້ອງການໂຮງຮຽນບັນທຶກໄວ້.'),
    caller: l('Unknown number', 'ເບີບໍ່ຮູ້ຈັກ'), number: '+856 20 91•• 0773', saved: false,
    lines: [
      l("This is Somchai's teacher. He fell in the playground and is at the clinic.", 'ນີ້ແມ່ນຄູຂອງສົມໃຈເດີ້. ລາວລົ້ມຢູ່ເດີ່ນຫຼິ້ນ ຕອນນີ້ຢູ່ຄລີນິກ.'),
      l('The clinic needs 800,000 kip before treatment. Transfer to the nurse now.', 'ຄລີນິກຕ້ອງການ 800,000 ກີບ ກ່ອນປິ່ນປົວ. ໂອນໃຫ້ພະຍາບານດຽວນີ້ເລີຍ.'),
      l("Don't call the school, the line is busy.", 'ບໍ່ຕ້ອງໂທຫາໂຮງຮຽນເດີ້ ສາຍບໍ່ຫວ່າງ.'),
    ],
    moves: { trust: l('Transfer right away', 'ໂອນທັນທີ'), check: l('Call the school office on the saved number', 'ໂທຫາຫ້ອງການໂຮງຮຽນ ເບີທີ່ບັນທຶກ'), hangup: l('Hang up', 'ວາງສາຍ') },
    outcome: {
      trust: l('800,000 kip gone. Somchai was in class the whole time.', 'ເສຍ 800,000 ກີບ. ສົມໃຈຢູ່ໃນຫ້ອງຮຽນຕະຫຼອດ.'),
      check: l('The office puts Somchai on the phone. He is fine and asks what is for dinner.', 'ຫ້ອງການໃຫ້ສົມໃຈລົມ. ລາວບໍ່ເປັນຫຍັງ ແລະ ຖາມວ່າແລງນີ້ກິນຫຍັງ.'),
      hangup: l('Khamla is shaken, but Somchai walks home at four, unhurt.', 'ຄຳຫຼ້າຕົກໃຈ ແຕ່ສົມໃຈຍ່າງກັບບ້ານສີ່ໂມງ ບໍ່ເປັນຫຍັງ.'),
    },
    signs: ['scare', 'mask', 'pay', 'hush'], flags: ['urgency', 'unverified_identity', 'upfront_fee'],
    remember: l('"Don\'t call the school" is the giveaway. Call the school or clinic yourself on a number you already have.', '"ບໍ່ຕ້ອງໂທຫາໂຮງຮຽນ" ແມ່ນສັນຍານ. ໂທຫາໂຮງຮຽນ ຫຼື ຄລີນິກເອງ ດ້ວຍເບີທີ່ມີ.') },

  { id: 'kh-husband', real: true, voice: { who: 'man', rate: -2, pitch: -6 }, time: '14:30', place: l('Quiet afternoon', 'ຕອນບ່າຍງຽບໆ'), stake: 0,
    note: l('This morning her husband took the car to the garage for a new tyre.', 'ເຊົ້ານີ້ຜົວເອົາລົດໄປອູ່ປ່ຽນຢາງ.'),
    caller: l('Husband', 'ຜົວ'), number: '+856 20 55•• 9014', saved: true,
    lines: [
      l("It's me. The garage says the tyre costs 300,000 kip.", 'ອ້າຍເອງ. ອູ່ບອກວ່າ ຢາງເສັ້ນໃໝ່ 300,000 ກີບ.'),
      l("I forgot my wallet. Can you send it to the garage's QR? I'll text you a photo of it.", 'ອ້າຍລືມກະເປົາເງິນ. ໂອນໃສ່ QR ຂອງອູ່ໃຫ້ແດ່ໄດ້ບໍ່? ອ້າຍຈະສົ່ງຮູບໄປໃຫ້.'),
      l('Or call me back if you want to check.', 'ຫຼື ຖ້າຢາກກວດ ໂທກັບມາຫາອ້າຍກໍ່ໄດ້ເດີ້.'),
    ],
    moves: { trust: l('Send it to the garage QR', 'ໂອນໃສ່ QR ຂອງອູ່'), check: l('Call him back on his saved number first', 'ໂທກັບຫາເບີທີ່ບັນທຶກກ່ອນ'), hangup: l('Hang up, it asks for money', 'ວາງສາຍ ຂໍເງິນ') },
    outcome: {
      trust: l('The QR shows the garage name. The car is home by dinner.', 'QR ສະແດງຊື່ອູ່. ລົດກັບຮອດບ້ານກ່ອນແລງ.'),
      check: l('He picks up and hands the phone to the mechanic. All real.', 'ລາວຮັບ ແລ້ວຍື່ນໃຫ້ຊ່າງລົມ. ແທ້ທັງໝົດ.'),
      hangup: l('Her husband waits at the garage for an hour until a friend lends him the money.', 'ຜົວລໍຖ້າຢູ່ອູ່ໜຶ່ງຊົ່ວໂມງ ຈົນໝູ່ຢືມເງິນໃຫ້.'),
    },
    signs: ['known', 'match'], flags: [],
    remember: l('Money requests are not always scams. Saved number, a story that matches, and an offer to call back.', 'ການຂໍເງິນບໍ່ແມ່ນການຫຼອກສະເໝີ. ເບີທີ່ບັນທຶກ ເລື່ອງກົງກັນ ແລະ ໃຫ້ໂທກັບໄດ້.') },

  { id: 'kh-order', real: false, voice: { who: 'man', rate: 12, pitch: 0 }, time: '16:00', place: l('Counting the till', 'ນັບເງິນໃນລິ້ນຊັກ'), stake: 400_000,
    note: l('Khamla runs a small corner shop. Big companies have never ordered from her.', 'ຄຳຫຼ້າເປີດຮ້ານນ້ອຍໆ. ບໍລິສັດໃຫຍ່ບໍ່ເຄີຍສັ່ງຊື້.'),
    caller: l('Event company manager', 'ຜູ້ຈັດການບໍລິສັດຈັດງານ'), number: '+856 20 97•• 3381', saved: false,
    lines: [
      l('We want two hundred cases of water for our event this weekend.', 'ພວກເຮົາຢາກໄດ້ນ້ຳ ສອງຮ້ອຍແກັດ ສຳລັບງານທ້າຍອາທິດນີ້.'),
      l('Our driver collects tomorrow, but first pay 400,000 kip delivery insurance to our account.', 'ມື້ອື່ນຄົນຂັບຈະມາເອົາ, ແຕ່ກ່ອນອື່ນ ຈ່າຍຄ່າປະກັນການຂົນສົ່ງ 400,000 ກີບ ເຂົ້າບັນຊີພວກເຮົາກ່ອນເດີ້.'),
      l("We'll pay the full six million when he arrives.", 'ຄົນຂັບມາຮອດ ພວກເຮົາຈະຈ່າຍເຕັມ ຫົກລ້ານເລີຍ.'),
    ],
    moves: { trust: l('Pay the insurance, it is a big sale', 'ຈ່າຍຄ່າປະກັນ ຂາຍໄດ້ຫຼາຍ'), check: l('Say "Pay a deposit first, then I prepare it"', 'ບອກວ່າ "ຈ່າຍມັດຈຳກ່ອນ ແລ້ວຈະກຽມ"'), hangup: l('Hang up', 'ວາງສາຍ') },
    outcome: {
      trust: l('No driver comes. The 400,000 kip "insurance" was the whole trick.', 'ບໍ່ມີຄົນຂັບມາ. "ຄ່າປະກັນ" 400,000 ກີບແມ່ນກົນທັງໝົດ.'),
      check: l('The manager suddenly needs to "check with the boss" and never calls back.', 'ຜູ້ຈັດການ "ຂໍຖາມນາຍກ່ອນ" ແລ້ວບໍ່ໂທກັບອີກ.'),
      hangup: l('Khamla closes up on time. No harm done.', 'ຄຳຫຼ້າປິດຮ້ານທັນເວລາ. ບໍ່ເສຍຫຍັງ.'),
    },
    signs: ['gift', 'pay'], flags: ['too_good', 'upfront_fee'],
    remember: l('A buyer pays the seller, not the other way round. Any "fee" before a big order is the scam.', 'ຜູ້ຊື້ຈ່າຍໃຫ້ຜູ້ຂາຍ ບໍ່ແມ່ນກົງກັນຂ້າມ. "ຄ່າທຳນຽມ" ກ່ອນສັ່ງໃຫຍ່ ແມ່ນການຫຼອກ.') },

  { id: 'kh-nephew', real: false, voice: { who: 'man', rate: 10, pitch: 6 }, time: '14:30', place: l('Quiet afternoon', 'ຕອນບ່າຍງຽບໆ'), stake: 5_000_000,
    note: l("Khamla's nephew Phet left two months ago for a 'customer service job' and has barely called since.", 'ເພັດ ຫຼານຂອງຄຳຫຼ້າ ໄປເຮັດ "ວຽກບໍລິການລູກຄ້າ" ສອງເດືອນກ່ອນ ແລະ ບໍ່ຄ່ອຍໂທມາ.'),
    caller: l('Unknown number', 'ເບີບໍ່ຮູ້ຈັກ'), number: '+95 9•• ••• 318', saved: false,
    lines: [
      l("Auntie, it's Phet. The job wasn't real. They took my passport.", 'ປ້າ... ເພັດເອງ. ວຽກນັ້ນບໍ່ແມ່ນແທ້ເລີຍ. ເຂົາຍຶດໜັງສືຜ່ານແດນຂ້ອຍໄປແລ້ວ.'),
      l('The boss says I owe five million kip. Send it to this account and I can come home.', 'ນາຍບອກວ່າ ຂ້ອຍຕິດໜີ້ຫ້າລ້ານກີບ. ປ້າໂອນເຂົ້າບັນຊີນີ້ແດ່ ຂ້ອຍຈະໄດ້ກັບບ້ານ.'),
      l("Or find two new workers to take my place. Please don't tell the police.", 'ຫຼື ຫາຄົນງານໃໝ່ສອງຄົນ ມາແທນຂ້ອຍ. ຢ່າບອກຕຳຫຼວດເດີ້ປ້າ.'),
    ],
    moves: { trust: l('Send five million kip to the account', 'ໂອນຫ້າລ້ານກີບເຂົ້າບັນຊີ'), check: l("Call Phet's mum, save the details, and call 1300 or 1362", 'ໂທຫາແມ່ຂອງເພັດ ເກັບຂໍ້ມູນໄວ້ ແລ້ວໂທ 1300 ຫຼື 1362'), hangup: l('Hang up', 'ວາງສາຍ') },
    outcome: {
      trust: l('The money reaches the people running the operation. A week later there is a new "debt".', 'ເງິນໄປຮອດຄົນທີ່ຄຸມແກ໊ງ. ອາທິດຕໍ່ມາ ມີ "ໜີ້" ໃໝ່.'),
      check: l("Phet's mum hasn't heard from him either. Trained helpers take the case quietly, without any payment.", 'ແມ່ຂອງເພັດກໍ່ບໍ່ໄດ້ຂ່າວ. ເຈົ້າໜ້າທີ່ທີ່ມີການຝຶກ ຮັບເລື່ອງຢ່າງງຽບໆ ໂດຍບໍ່ຕ້ອງຈ່າຍ.'),
      hangup: l('No money sent, but if Phet really is trapped, he still needs help. Khamla should tell the family and call 1300 or 1362.', 'ບໍ່ໄດ້ສົ່ງເງິນ ແຕ່ຖ້າເພັດຖືກກັກແທ້ ເຂົາຍັງຕ້ອງການຄວາມຊ່ວຍເຫຼືອ. ຄຳຫຼ້າຄວນບອກຄອບຄົວ ແລະ ໂທ 1300 ຫຼື 1362.'),
    },
    signs: ['docs', 'debt', 'pay', 'hush'], flags: ['personal_data', 'upfront_fee', 'off_platform'],
    remember: l('Whether it is a fake emergency or a real trap, never pay the "boss" or send new workers. Get trained help, quietly.', 'ບໍ່ວ່າເປັນເຫດດ່ວນປອມ ຫຼື ຖືກກັກແທ້ ຢ່າຈ່າຍ "ນາຍ" ຫຼື ສົ່ງຄົນງານໃໝ່ໄປ. ຂໍຄວາມຊ່ວຍເຫຼືອຢ່າງງຽບໆ.') },

  { id: 'kh-meeting', real: true, voice: { who: 'man', rate: -6, pitch: -4 }, time: '12:00', place: l('Lunch rush', 'ຊ່ວງທ່ຽງຄົນຫຼາຍ'), stake: 0,
    note: l("Khamla saved the village chief's number at the last village meeting.", 'ຄຳຫຼ້າບັນທຶກເບີນາຍບ້ານໄວ້ ຈາກກອງປະຊຸມບ້ານເທື່ອກ່ອນ.'),
    caller: l('Village Chief Somsak', 'ນາຍບ້ານສົມສັກ'), number: '+856 20 23•• 9017', saved: true,
    lines: [
      l('Hello Khamla, Somsak here. Quick reminder.', 'ສະບາຍດີຄຳຫຼ້າ, ສົມສັກເອງ. ໂທມາແຈ້ງເຕືອນສັ້ນໆ.'),
      l("Sunday at nine, the Lao Women's Union is talking about fake job offers at the village hall.", 'ວັນອາທິດ ເກົ້າໂມງ ສະຫະພັນແມ່ຍິງລາວ ຈະມາລົມເລື່ອງວຽກປອມ ຢູ່ຫ້ອງການບ້ານເດີ້.'),
      l('Bring your son if you can. It is free.', 'ຖ້າໄດ້ ພາລູກຊາຍມານຳ. ບໍ່ເສຍຄ່າຫຍັງ.'),
    ],
    moves: { trust: l('Say they will both come', 'ບອກວ່າຈະໄປທັງສອງ'), check: l('Check the notice board at the village hall', 'ເບິ່ງປ້າຍປະກາດທີ່ຫ້ອງການບ້ານ'), hangup: l('Hang up, too busy', 'ວາງສາຍ ຫຍຸ້ງ') },
    outcome: {
      trust: l('Her son learns that a changed destination or a held passport means stop.', 'ລູກຊາຍຮຽນຮູ້ວ່າ ການປ່ຽນບ່ອນເຮັດວຽກ ຫຼື ຖືກຍຶດໜັງສືຜ່ານແດນ ໝາຍເຖິງໃຫ້ຢຸດ.'),
      check: l("The notice is on the board. Khamla writes it on the shop calendar.", 'ມີປະກາດຢູ່ປ້າຍ. ຄຳຫຼ້າຂຽນໃສ່ປະຕິທິນຮ້ານ.'),
      hangup: l('They miss a free talk that could protect her son.', 'ພາດການລົມຟຣີ ທີ່ອາດປົກປ້ອງລູກຊາຍ.'),
    },
    signs: ['known', 'nothing'], flags: [],
    remember: l('Real community help is public, free, and invites your family.', 'ຄວາມຊ່ວຍເຫຼືອແທ້ຈາກຊຸມຊົນ ເປັນສາທາລະນະ ບໍ່ເສຍຄ່າ ແລະ ເຊີນຄອບຄົວ.') },
];

export const BOUNMY_CALLS: Call[] = [
  { id: 'bo-malee', real: true, voice: { who: 'woman', rate: -8, pitch: 0 }, time: '08:00', place: l('Morning tea', 'ກິນຊາຕອນເຊົ້າ'), stake: 0,
    note: l('His daughter Malee calls most mornings before work.', 'ລູກສາວມາລີໂທມາເກືອບທຸກເຊົ້າກ່ອນໄປວຽກ.'),
    caller: l('Daughter Malee', 'ລູກສາວມາລີ'), number: '+856 20 23•• 5560', saved: true,
    lines: [
      l('Morning Dad! Did you take your blood pressure pill?', 'ສະບາຍດີພໍ່! ກິນຢາຄວາມດັນແລ້ວບໍ່?'),
      l("I'll come by after work with some fruit.", 'ເລີກວຽກແລ້ວ ລູກຈະເອົາໝາກໄມ້ໄປຢາມເດີ້.'),
      l('If anyone calls asking for money, call me first, okay?', 'ຖ້າມີໃຜໂທມາຂໍເງິນ ໂທຫາລູກກ່ອນເດີ້ພໍ່.'),
    ],
    moves: { trust: l('Chat and say he took the pill', 'ລົມ ແລະ ບອກວ່າກິນຢາແລ້ວ'), check: l('Look at the name on the screen first', 'ເບິ່ງຊື່ໃນໜ້າຈໍກ່ອນ'), hangup: l('Hang up, it might be a trick', 'ວາງສາຍ ອາດເປັນກົນ') },
    outcome: {
      trust: l('Malee is relieved. She brings mangoes in the evening.', 'ມາລີສະບາຍໃຈ. ຕອນແລງເອົາໝາກມ່ວງມາໃຫ້.'),
      check: l('"Malee", from his contacts. He chats happily.', '"ມາລີ" ຈາກລາຍຊື່. ລາວລົມຢ່າງມ່ວນ.'),
      hangup: l('Malee worries all day and leaves work early to check on him.', 'ມາລີເປັນຫ່ວງໝົດມື້ ແລະ ອອກວຽກໄວມາເບິ່ງ.'),
    },
    signs: ['known', 'nothing'], flags: [],
    remember: l('Family on a saved number, asking nothing, is a call to enjoy.', 'ຄອບຄົວເບີທີ່ບັນທຶກ ບໍ່ຂໍຫຍັງ ແມ່ນສາຍທີ່ຄວນມ່ວນນຳ.') },

  { id: 'bo-grandson', real: false, voice: { who: 'man', rate: 14, pitch: 14 }, time: '09:00', place: l('Watering the plants', 'ຫົດນ້ຳຕົ້ນໄມ້'), stake: 1_500_000,
    note: l("His grandson Tou is at university in Vientiane. Tou's number is saved.", 'ຫຼານຊາຍຕູ້ ຮຽນມະຫາວິທະຍາໄລຢູ່ວຽງຈັນ. ເບີຂອງຕູ້ບັນທຶກໄວ້.'),
    caller: l('Unknown number', 'ເບີບໍ່ຮູ້ຈັກ'), number: '+856 20 96•• 2218', saved: false,
    lines: [
      l("Grandpa, it's me! Guess who?", 'ພໍ່ຕູ້! ຫຼານເອງ! ທາຍເບິ່ງ ແມ່ນໃຜ?'),
      l('I broke my phone, this is my new number. I had a motorbike accident.', 'ໂທລະສັບຫຼານແຕກ ນີ້ເບີໃໝ່. ຫຼານລົດຈັກລົ້ມ...'),
      l("Please send 1,500,000 kip to my friend's account. Don't tell Mum, she'll be angry.", 'ພໍ່ຕູ້ໂອນ 1,500,000 ກີບ ໃສ່ບັນຊີໝູ່ຫຼານແດ່. ຢ່າບອກແມ່ເດີ້ ແມ່ຈະຄຽດ.'),
    ],
    moves: { trust: l('Send the money, poor boy', 'ໂອນເງິນ ສົງສານຫຼານ'), check: l("Call Tou's old number, then Malee", 'ໂທເບີເກົ່າຂອງຕູ້ ແລ້ວໂທຫາມາລີ'), hangup: l('Hang up', 'ວາງສາຍ') },
    outcome: {
      trust: l('1,500,000 kip to a stranger. Tou was in class with no accident at all.', 'ເງິນ 1,500,000 ກີບໄປຫາຄົນແປກໜ້າ. ຕູ້ຢູ່ໃນຫ້ອງຮຽນ ບໍ່ມີອຸບັດຕິເຫດ.'),
      check: l('Tou answers his old number straight away: "Grandpa? I\'m fine!"', 'ຕູ້ຮັບເບີເກົ່າທັນທີ: "ພໍ່ຕູ້? ຫຼານບໍ່ເປັນຫຍັງ!"'),
      hangup: l('Later Malee tells him the same scam hit two neighbours this month.', 'ຕໍ່ມາມາລີບອກວ່າເດືອນນີ້ເພື່ອນບ້ານສອງຄົນຖືກແບບນີ້.'),
    },
    signs: ['hush', 'scare', 'pay', 'mask'], flags: ['unverified_identity', 'urgency', 'off_platform'],
    remember: l('"Guess who?" and "new number" mean: call the old number or the parents before you send anything.', '"ທາຍແມ່ນໃຜ?" ແລະ "ເບີໃໝ່" ໝາຍຄວາມວ່າ: ໂທເບີເກົ່າ ຫຼື ພໍ່ແມ່ກ່ອນໂອນ.') },

  { id: 'bo-pension', real: false, voice: { who: 'man', rate: 8, pitch: -10 }, time: '10:30', place: l('Reading the newspaper', 'ອ່ານໜັງສືພິມ'), stake: 2_500_000,
    note: l('Mr. Bounmy collects his pension at the bank every month. Nothing has changed.', 'ທ້າວບຸນມີຮັບເງິນບຳນານທີ່ທະນາຄານທຸກເດືອນ. ບໍ່ມີຫຍັງປ່ຽນ.'),
    caller: l('Pension Office', 'ຫ້ອງການບຳນານ'), number: '+856 21 66•• 0045', saved: false,
    lines: [
      l('Your pension will stop this month because your file is not updated.', 'ເງິນບຳນານຂອງທ່ານ ຈະຖືກຢຸດເດືອນນີ້ ເພາະແຟ້ມຂອງທ່ານ ບໍ່ໄດ້ອັບເດດ.'),
      l('I need your bank card number and PIN to update it.', 'ຂ້ອຍຕ້ອງການເລກບັດທະນາຄານ ແລະ ລະຫັດ PIN ຂອງທ່ານ ເພື່ອອັບເດດໃຫ້.'),
      l('If not, you lose three months of payments.', 'ຖ້າບໍ່ເຮັດ ທ່ານຈະເສຍເງິນບຳນານ ສາມເດືອນເດີ້.'),
    ],
    moves: { trust: l('Read out the card and PIN', 'ອ່ານເລກບັດ ແລະ PIN'), check: l('Go to the pension office in person with Malee', 'ໄປຫ້ອງການບຳນານເອງກັບມາລີ'), hangup: l('Hang up', 'ວາງສາຍ') },
    outcome: {
      trust: l('By noon 2,500,000 kip, his whole month and more, is gone.', 'ຮອດທ່ຽງ ເງິນ 2,500,000 ກີບ ໝົດທັງເດືອນ.'),
      check: l('The office says his file is fine. Nobody there asks for a PIN, ever.', 'ຫ້ອງການບອກແຟ້ມບໍ່ເປັນຫຍັງ. ບໍ່ມີໃຜຂໍ PIN ເລີຍ.'),
      hangup: l('His pension arrives as usual at the end of the month.', 'ເງິນບຳນານເຂົ້າປົກກະຕິທ້າຍເດືອນ.'),
    },
    signs: ['mask', 'code', 'scare'], flags: ['unverified_identity', 'personal_data', 'urgency'],
    remember: l('No office ever needs your PIN. Real paperwork is done at the counter, in person.', 'ບໍ່ມີຫ້ອງການໃດຕ້ອງການ PIN. ເອກະສານແທ້ເຮັດທີ່ເຄົາເຕີ.') },

  { id: 'bo-clinic', real: true, voice: { who: 'woman', rate: -10, pitch: 2 }, time: '13:00', place: l('After lunch', 'ຫຼັງກິນເຂົ້າທ່ຽງ'), stake: 0,
    note: l('Last month he booked an eye check at the district clinic.', 'ເດືອນແລ້ວລາວນັດກວດຕາທີ່ຄລີນິກເມືອງ.'),
    caller: l('Unknown number', 'ເບີບໍ່ຮູ້ຈັກ'), number: '+856 21 31•• 7782', saved: false,
    lines: [
      l('Hello Mr. Bounmy, this is the district clinic.', 'ສະບາຍດີພໍ່ບຸນມີ, ໂທມາຈາກຄລີນິກເມືອງເດີ້.'),
      l('A reminder: your eye check is tomorrow at nine.', 'ແຈ້ງເຕືອນເດີ້: ມື້ອື່ນ ເກົ້າໂມງ ມີນັດກວດຕາ.'),
      l('Please bring your health card. There is nothing to pay in advance.', 'ກະລຸນາເອົາບັດສຸຂະພາບມານຳ. ບໍ່ຕ້ອງຈ່າຍຫຍັງລ່ວງໜ້າເດີ້.'),
    ],
    moves: { trust: l('Thank them and write it on the calendar', 'ຂອບໃຈ ແລ້ວຂຽນໃສ່ປະຕິທິນ'), check: l('Check the date on his appointment card', 'ກວດວັນທີໃນບັດນັດ'), hangup: l('Hang up, he does not know the number', 'ວາງສາຍ ບໍ່ຮູ້ຈັກເບີ') },
    outcome: {
      trust: l('He goes at nine and gets new glasses. He can read the paper again.', 'ລາວໄປເກົ້າໂມງ ໄດ້ແວ່ນໃໝ່. ອ່ານໜັງສືພິມໄດ້ອີກ.'),
      check: l('The card says the same date. He sets out his health card for the morning.', 'ບັດບອກວັນດຽວກັນ. ລາວກຽມບັດສຸຂະພາບໄວ້.'),
      hangup: l('He forgets the date and waits two more months for a new slot.', 'ລາວລືມວັນ ແລະ ຕ້ອງລໍອີກສອງເດືອນ.'),
    },
    signs: ['match', 'nothing'], flags: [],
    remember: l('It matched a real booking, asked for nothing, and wanted no money up front.', 'ກົງກັບການນັດແທ້ ບໍ່ຂໍຫຍັງ ບໍ່ໃຫ້ຈ່າຍລ່ວງໜ້າ.') },

  { id: 'bo-lottery', real: false, voice: { who: 'woman', rate: 14, pitch: 8 }, time: '15:00', place: l('Afternoon nap', 'ນອນຕອນບ່າຍ'), stake: 600_000,
    note: l('Mr. Bounmy has never entered a lucky draw.', 'ທ້າວບຸນມີບໍ່ເຄີຍຮ່ວມຈັບສະຫຼາກ.'),
    caller: l('Lucky Draw Centre', 'ສູນຈັບສະຫຼາກ'), number: '+856 30 74•• 5591', saved: false,
    lines: [
      l('Congratulations! You won a brand new motorbike in our lucky draw!', 'ຍິນດີນຳເດີ້! ທ່ານໄດ້ລົດຈັກຄັນໃໝ່ ຈາກການຈັບສະຫຼາກຂອງພວກເຮົາ!'),
      l('Just pay 600,000 kip for tax and transport.', 'ພຽງແຕ່ຈ່າຍຄ່າພາສີ ກັບຄ່າຂົນສົ່ງ 600,000 ກີບເທົ່ານັ້ນ.'),
      l("Transfer to our agent's account and we deliver it today.", 'ໂອນເຂົ້າບັນຊີຕົວແທນເຮົາ ແລ້ວຈະສົ່ງລົດໃຫ້ພາຍໃນມື້ນີ້ເລີຍ.'),
    ],
    moves: { trust: l('Pay, a motorbike for 600,000 is a bargain', 'ຈ່າຍ ລົດຈັກ 600,000 ຖືກຫຼາຍ'), check: l('Ask: "When did I enter this draw?"', 'ຖາມ: "ຂ້ອຍຮ່ວມຈັບສະຫຼາກຕອນໃດ?"'), hangup: l('Hang up', 'ວາງສາຍ') },
    outcome: {
      trust: l('No motorbike arrives, only a second call asking for an "insurance fee".', 'ບໍ່ມີລົດຈັກມາ ມີແຕ່ສາຍທີສອງຂໍ "ຄ່າປະກັນ".'),
      check: l('The caller has no answer and hangs up.', 'ຜູ້ໂທຕອບບໍ່ໄດ້ ແລ້ວວາງສາຍ.'),
      hangup: l('He goes back to his nap. Nothing lost.', 'ລາວກັບໄປນອນຕໍ່. ບໍ່ເສຍຫຍັງ.'),
    },
    signs: ['gift', 'pay'], flags: ['too_good', 'upfront_fee'],
    remember: l('You cannot win a draw you never entered. Real prizes never cost money to collect.', 'ບໍ່ສາມາດໄດ້ລາງວັນທີ່ບໍ່ເຄີຍຮ່ວມ. ລາງວັນແທ້ບໍ່ຕ້ອງຈ່າຍເພື່ອຮັບ.') },

  { id: 'bo-kham', real: true, voice: { who: 'man', rate: -10, pitch: -6 }, time: '17:00', place: l('Evening walk', 'ຍ່າງຫຼິ້ນຕອນແລງ'), stake: 0,
    note: l('Kham from next door is an old friend. His number is saved.', 'ຄຳ ເຮືອນຖັດໄປ ແມ່ນໝູ່ເກົ່າ. ເບີບັນທຶກໄວ້.'),
    caller: l('Neighbour Kham', 'ເພື່ອນບ້ານຄຳ'), number: '+856 20 28•• 4417', saved: true,
    lines: [
      l("Bounmy, it's Kham next door.", 'ບຸນມີ, ຄຳ ເຮືອນຖັດໄປເອງເດີ້.'),
      l('The village meeting moved to the temple hall at seven tonight.', 'ກອງປະຊຸມບ້ານ ຍ້າຍໄປສາລາວັດ ເຈັດໂມງຄືນນີ້.'),
      l("I'll knock on your door and we can walk there together.", 'ຂ້ອຍຈະໄປເຄາະປະຕູ ແລ້ວຍ່າງໄປນຳກັນເນາະ.'),
    ],
    moves: { trust: l('Say "See you at seven"', 'ບອກວ່າ "ພົບກັນເຈັດໂມງ"'), check: l('Check that it is Kham\'s saved number', 'ກວດວ່າແມ່ນເບີຄຳທີ່ບັນທຶກ'), hangup: l('Hang up, he is resting', 'ວາງສາຍ ກຳລັງພັກ') },
    outcome: {
      trust: l('They walk to the temple together and hear about the new road.', 'ຍ່າງໄປວັດນຳກັນ ແລະ ຟັງເລື່ອງທາງໃໝ່.'),
      check: l("It's Kham. Mr. Bounmy puts on his good shirt.", 'ແມ່ນຄຳແທ້. ທ້າວບຸນມີນຸ່ງເສື້ອງາມ.'),
      hangup: l('He misses the meeting about the new road through the village.', 'ລາວພາດກອງປະຊຸມເລື່ອງທາງໃໝ່ຜ່ານບ້ານ.'),
    },
    signs: ['known', 'nothing'], flags: [],
    remember: l('Hanging up on everyone keeps you safe from scams, but also from your friends.', 'ວາງສາຍທຸກຄົນ ປອດໄພຈາກການຫຼອກ ແຕ່ກໍ່ຫ່າງໝູ່ນຳ.') },

  { id: 'bo-techpark', real: false, voice: { who: 'man', rate: 14, pitch: 6 }, time: '17:00', place: l('Evening walk', 'ຍ່າງຫຼິ້ນຕອນແລງ'), stake: 2_000_000,
    note: l("Bounmy's grandson Kham finished university and is looking for work.", 'ຄຳ ຫຼານຂອງບຸນມີ ຮຽນຈົບມະຫາວິທະຍາໄລ ແລະ ກຳລັງຊອກວຽກ.'),
    caller: l('Unknown number', 'ເບີບໍ່ຮູ້ຈັກ'), number: '+856 20 98•• 4420', saved: false,
    lines: [
      l("Grandpa, I'm Kham's friend from university. My company in a big tech park is hiring.", 'ພໍ່ຕູ້, ຂ້ອຍເປັນໝູ່ມະຫາວິທະຍາໄລຂອງຄຳເດີ້. ບໍລິສັດຂ້ອຍ ຢູ່ເຂດເທັກໂນໂລຊີໃຫຍ່ ກຳລັງຮັບຄົນ.'),
      l('Beautiful office, twenty million kip a month. Send two million for his visa today.', 'ຫ້ອງການງາມ ເງິນເດືອນ ຊາວລ້ານກີບ. ມື້ນີ້ ໂອນສອງລ້ານ ຄ່າວີຊາໃຫ້ລາວແດ່.'),
      l("He leaves tomorrow. Don't spoil the surprise, don't tell his parents.", 'ລາວຈະອອກເດີນທາງມື້ອື່ນ. ຢ່າໃຫ້ເສຍເຊີໄພຣສ໌ເດີ້ ຢ່າບອກພໍ່ແມ່ລາວ.'),
    ],
    moves: { trust: l('Send two million for the visa', 'ໂອນສອງລ້ານຄ່າວີຊາ'), check: l('Call Kham and his parents first', 'ໂທຫາຄຳ ແລະ ພໍ່ແມ່ເຂົາກ່ອນ'), hangup: l('Hang up', 'ວາງສາຍ') },
    outcome: {
      trust: l('Two million kip gone, and the recruiter now pushes Kham to leave fast. A nice office was the bait.', 'ເສຍສອງລ້ານກີບ ແລະ ຄົນຊັກຊວນຍູ້ຄຳໃຫ້ອອກໄວ. ຫ້ອງການງາມແມ່ນເຫຍື່ອ.'),
      check: l('Kham has never heard of this friend. The family agrees to check any offer together.', 'ຄຳບໍ່ເຄີຍຮູ້ຈັກໝູ່ຄົນນີ້. ຄອບຄົວຕົກລົງກວດທຸກຂໍ້ສະເໜີນຳກັນ.'),
      hangup: l('Bounmy keeps his pension. He should still warn Kham.', 'ບຸນມີຮັກສາເງິນບຳນານໄວ້. ຍັງຄວນເຕືອນຄຳ.'),
    },
    signs: ['gift', 'pay', 'clock', 'hush'], flags: ['too_good', 'upfront_fee', 'urgency', 'off_platform'],
    remember: l('Young educated men are prime targets for scam-compound recruiters. A shiny office proves nothing.', 'ຊາຍໜຸ່ມທີ່ມີການສຶກສາ ເປັນເປົ້າໝາຍຫຼັກຂອງຄົນຊັກຊວນເຂົ້າແກ໊ງຫຼອກລວງ. ຫ້ອງການງາມພິສູດຫຍັງບໍ່ໄດ້.') },

  { id: 'bo-pharmacy', real: true, voice: { who: 'woman', rate: -10, pitch: 0 }, time: '10:30', place: l('Reading the newspaper', 'ອ່ານໜັງສືພິມ'), stake: 0,
    note: l('On Monday Bounmy ordered his blood pressure pills at the pharmacy.', 'ວັນຈັນ ບຸນມີສັ່ງຢາຄວາມດັນທີ່ຮ້ານຢາ.'),
    caller: l('Thongkhan Pharmacy', 'ຮ້ານຢາທອງຂັນ'), number: '+856 21 31•• 5580', saved: true,
    lines: [
      l('Hello Uncle Bounmy, this is the pharmacy.', 'ສະບາຍດີລຸງບຸນມີ, ນີ້ແມ່ນຮ້ານຢາເດີ້.'),
      l('Your blood pressure pills are ready.', 'ຢາຄວາມດັນຂອງລຸງ ກຽມໄວ້ໃຫ້ແລ້ວ.'),
      l('Come any day this week and pay at the counter.', 'ມາມື້ໃດກໍ່ໄດ້ໃນອາທິດນີ້ ແລ້ວຈ່າຍຢູ່ເຄົາເຕີເດີ້.'),
    ],
    moves: { trust: l('Say he will come tomorrow', 'ບອກວ່າຈະມາມື້ອື່ນ'), check: l('Look for the pharmacy number on the pill box', 'ເບິ່ງເບີຮ້ານຢາຢູ່ກັບກ່ອງຢາ'), hangup: l('Hang up, it might be a scam', 'ວາງສາຍ ອາດແມ່ນການຫຼອກ') },
    outcome: {
      trust: l('Bounmy picks up his pills on his morning walk.', 'ບຸນມີໄປຮັບຢາຕອນຍ່າງຫຼິ້ນເຊົ້າ.'),
      check: l('Same number as on the box. All good.', 'ເບີດຽວກັບກ່ອງຢາ. ບໍ່ມີບັນຫາ.'),
      hangup: l('Bounmy runs out of pills on Friday.', 'ບຸນມີໝົດຢາວັນສຸກ.'),
    },
    signs: ['known', 'match', 'nothing'], flags: [],
    remember: l('A saved number, an order you really made, and you pay in person.', 'ເບີທີ່ບັນທຶກ, ສິ່ງທີ່ສັ່ງແທ້ ແລະ ຈ່າຍຕົວຈິງ.') },
];

export const DARA_CALLS: Call[] = [
  { id: 'da-bus', real: true, voice: { who: 'woman', rate: -4, pitch: 0 }, time: '07:30', place: l('At the bus station', 'ຢູ່ສະຖານີລົດເມ'), stake: 0,
    note: l('Yesterday Dara bought a bus ticket at the station counter and left a phone number.', 'ມື້ວານດາຣາຊື້ປີ້ລົດເມທີ່ເຄົາເຕີສະຖານີ ແລະ ຝາກເບີໄວ້.'),
    caller: l('Unknown number', 'ເບີບໍ່ຮູ້ຈັກ'), number: '+856 21 24•• 1190', saved: false,
    lines: [
      l('Hello, this is the bus station.', 'ສະບາຍດີ, ໂທມາຈາກສະຖານີລົດເມເດີ້.'),
      l('Your 8:40 bus leaves from gate three today, not gate one.', 'ລົດຖ້ຽວ 8:40 ຂອງທ່ານ ມື້ນີ້ອອກປະຕູສາມເດີ້ ບໍ່ແມ່ນປະຕູໜຶ່ງ.'),
      l('Show your paper ticket to the driver. Nothing else to pay.', 'ສະແດງປີ້ໃຫ້ຄົນຂັບເບິ່ງ. ບໍ່ຕ້ອງຈ່າຍຫຍັງເພີ່ມ.'),
    ],
    moves: { trust: l('Walk to gate three', 'ຍ່າງໄປປະຕູສາມ'), check: l('Look at the departure board', 'ເບິ່ງປ້າຍຂາອອກ'), hangup: l('Hang up, unknown number', 'ວາງສາຍ ເບີແປກ') },
    outcome: {
      trust: l('Dara finds the bus at gate three and gets a window seat.', 'ດາຣາເຫັນລົດຢູ່ປະຕູສາມ ໄດ້ບ່ອນນັ່ງຕິດປ່ອງຢ້ຽມ.'),
      check: l('The board says gate three too. Careful and still on time.', 'ປ້າຍກໍ່ບອກປະຕູສາມ. ລະວັງ ແລະ ທັນເວລາ.'),
      hangup: l('Dara waits at gate one and nearly misses the bus.', 'ດາຣາລໍຢູ່ປະຕູໜຶ່ງ ເກືອບພາດລົດ.'),
    },
    signs: ['match', 'nothing'], flags: [],
    remember: l('It matched a ticket Dara really bought, and asked for nothing.', 'ກົງກັບປີ້ທີ່ດາຣາຊື້ແທ້ ແລະ ບໍ່ຂໍຫຍັງ.') },

  { id: 'da-agent', real: false, voice: { who: 'man', rate: 14, pitch: -2 }, time: '08:30', place: l('Waiting to board', 'ລໍຖ້າຂຶ້ນລົດ'), stake: 3_000_000,
    note: l('Dara wants to work abroad and has asked around about jobs in Thailand.', 'ດາຣາຢາກໄປເຮັດວຽກຕ່າງປະເທດ ແລະ ຖາມຫາວຽກຢູ່ໄທ.'),
    caller: l('Agent Kim', 'ຕົວແທນຄິມ'), number: '+66 8•• ••• 412', saved: false,
    lines: [
      l('I have a factory job in Thailand for you: fifteen million kip a month, no experience needed.', 'ມີວຽກໂຮງງານຢູ່ໄທ ໃຫ້ເຈົ້າເດີ້: ເດືອນລະສິບຫ້າລ້ານກີບ, ບໍ່ຕ້ອງມີປະສົບການ.'),
      l("Pay three million kip now for the visa. I'll keep your passport safe for you.", 'ຈ່າຍຄ່າວີຊາ ສາມລ້ານກີບດຽວນີ້. ໜັງສືຜ່ານແດນ ຂ້ອຍຈະເກັບໄວ້ໃຫ້.'),
      l("The van leaves tonight. Don't tell anyone, places are limited.", 'ລົດຕູ້ອອກຄືນນີ້. ຢ່າບອກໃຜເດີ້ ບ່ອນມີຈຳກັດ.'),
    ],
    moves: { trust: l('Pay and get in the van tonight', 'ຈ່າຍ ແລ້ວຂຶ້ນລົດຕູ້ຄືນນີ້'), check: l('Check the agency on the labour office list', 'ກວດຊື່ບໍລິສັດໃນລາຍຊື່ຂອງຫ້ອງການແຮງງານ'), hangup: l('Hang up', 'ວາງສາຍ') },
    outcome: {
      trust: l('Three million kip gone, and the "job" is a locked compound across the border. This is how trafficking starts.', 'ເສຍສາມລ້ານກີບ ແລະ "ວຽກ" ແມ່ນບ່ອນຖືກກັກຂັງຂ້າມແດນ. ນີ້ແມ່ນການຄ້າມະນຸດ.'),
      check: l('Agent Kim is on no official list. The labour office warns Dara about this exact script.', 'ຕົວແທນຄິມບໍ່ມີໃນລາຍຊື່ທາງການ. ຫ້ອງການແຮງງານເຕືອນເລື່ອງນີ້.'),
      hangup: l('Dara keeps the money and the passport. Both matter.', 'ດາຣາຮັກສາເງິນ ແລະ ໜັງສືຜ່ານແດນໄວ້. ສຳຄັນທັງສອງ.'),
    },
    signs: ['gift', 'pay', 'hush', 'clock'], flags: ['too_good', 'upfront_fee', 'off_platform', 'urgency'],
    remember: l('Never give your passport to an agent, and never pay big fees to someone not on the official list.', 'ຢ່າໃຫ້ໜັງສືຜ່ານແດນແກ່ຕົວແທນ ແລະ ຢ່າຈ່າຍຄ່າທຳນຽມໃຫ້ຄົນທີ່ບໍ່ມີໃນລາຍຊື່ທາງການ.') },

  { id: 'da-labour', real: true, voice: { who: 'man', rate: -8, pitch: -4 }, time: '10:00', place: l('On the bus', 'ຢູ່ເທິງລົດເມ'), stake: 0,
    note: l('Last week Dara asked the provincial labour office about legal work abroad.', 'ອາທິດແລ້ວດາຣາຖາມຫ້ອງການແຮງງານແຂວງ ເລື່ອງວຽກຕ່າງປະເທດທີ່ຖືກກົດໝາຍ.'),
    caller: l('Unknown number', 'ເບີບໍ່ຮູ້ຈັກ'), number: '+856 21 21•• 3305', saved: false,
    lines: [
      l('Hello Dara, this is the provincial labour office, following up on your visit.', 'ສະບາຍດີດາຣາ, ໂທມາຈາກຫ້ອງການແຮງງານແຂວງ ຕາມເລື່ອງທີ່ມາຖາມໄວ້ເດີ້.'),
      l('There is a free session on legal jobs abroad this Thursday at two.', 'ວັນພະຫັດນີ້ ບ່າຍສອງໂມງ ມີການແນະນຳວຽກຕ່າງປະເທດທີ່ຖືກກົດໝາຍ, ບໍ່ເສຍຄ່າ.'),
      l('Come to our office. And never pay an agent who is not on our list.', 'ມາທີ່ຫ້ອງການເດີ້. ແລະ ຢ່າຈ່າຍເງິນໃຫ້ຕົວແທນ ທີ່ບໍ່ມີໃນລາຍຊື່ຂອງເຮົາ.'),
    ],
    moves: { trust: l('Say Dara will come on Thursday', 'ບອກວ່າຈະໄປວັນພະຫັດ'), check: l('Check the office number on the government website', 'ກວດເບີຫ້ອງການໃນເວັບລັດ'), hangup: l('Hang up, Dara is tired of calls', 'ວາງສາຍ ເບື່ອສາຍໂທ') },
    outcome: {
      trust: l('At the session Dara learns which agencies are licensed and what a real contract looks like.', 'ທີ່ການແນະນຳ ດາຣາຮູ້ວ່າບໍລິສັດໃດມີໃບອະນຸຍາດ ແລະ ສັນຍາແທ້ເປັນແນວໃດ.'),
      check: l('The number matches the website. Dara signs up for Thursday.', 'ເບີກົງກັບເວັບ. ດາຣາລົງຊື່ວັນພະຫັດ.'),
      hangup: l('Dara misses the free session and is left with only the agents from social media.', 'ດາຣາພາດການແນະນຳ ເຫຼືອແຕ່ຕົວແທນໃນໂຊຊຽວ.'),
    },
    signs: ['match', 'nothing'], flags: [],
    remember: l('Real offices invite you in, charge nothing, and warn you about fake agents.', 'ຫ້ອງການແທ້ເຊີນໃຫ້ມາ ບໍ່ເກັບເງິນ ແລະ ເຕືອນເລື່ອງຕົວແທນປອມ.') },

  { id: 'da-immig', real: false, voice: { who: 'man', rate: 10, pitch: -14 }, time: '12:00', place: l('Lunch stop', 'ຈອດພັກກິນເຂົ້າ'), stake: 1_000_000,
    note: l('Dara has a passport but has never used it.', 'ດາຣາມີໜັງສືຜ່ານແດນ ແຕ່ບໍ່ເຄີຍໃຊ້.'),
    caller: l('Immigration officer', 'ເຈົ້າໜ້າທີ່ກວດຄົນເຂົ້າເມືອງ'), number: '+856 30 63•• 8820', saved: false,
    lines: [
      l('Your passport shows an error and you are on the travel blacklist.', 'ໜັງສືຜ່ານແດນຂອງທ່ານມີຂໍ້ຜິດພາດ, ຕອນນີ້ທ່ານຢູ່ໃນບັນຊີດຳ.'),
      l('Pay a one million kip fine now, or you can never travel.', 'ຕ້ອງຈ່າຍຄ່າປັບໜຶ່ງລ້ານກີບດຽວນີ້, ບໍ່ຊັ້ນ ທ່ານຈະເດີນທາງບໍ່ໄດ້ຕະຫຼອດໄປ.'),
      l('Send it to my personal account and I will clear it today.', 'ໂອນເຂົ້າບັນຊີສ່ວນຕົວຂອງຂ້ອຍ ແລ້ວຂ້ອຍຈະແກ້ໃຫ້ພາຍໃນມື້ນີ້.'),
    ],
    moves: { trust: l('Pay the fine to stay off the list', 'ຈ່າຍຄ່າປັບ ເພື່ອອອກຈາກບັນຊີ'), check: l('Ask the immigration office counter directly', 'ຖາມເຄົາເຕີຫ້ອງການຄົນເຂົ້າເມືອງໂດຍກົງ'), hangup: l('Hang up', 'ວາງສາຍ') },
    outcome: {
      trust: l('One million kip to a stranger. There was never a blacklist.', 'ເງິນໜຶ່ງລ້ານກີບໄປຫາຄົນແປກໜ້າ. ບໍ່ເຄີຍມີບັນຊີດຳ.'),
      check: l("The counter checks: Dara's passport is fine.", 'ເຄົາເຕີກວດ: ໜັງສືຜ່ານແດນດາຣາບໍ່ເປັນຫຍັງ.'),
      hangup: l('Nothing happens. Dara finishes lunch.', 'ບໍ່ມີຫຍັງເກີດຂຶ້ນ. ດາຣາກິນເຂົ້າຕໍ່.'),
    },
    signs: ['mask', 'scare', 'pay'], flags: ['unverified_identity', 'urgency', 'upfront_fee'],
    remember: l('Fines are paid at an official counter with a receipt, never to an officer\'s personal account.', 'ຄ່າປັບຈ່າຍທີ່ເຄົາເຕີທາງການ ມີໃບຮັບເງິນ ບໍ່ແມ່ນບັນຊີສ່ວນຕົວ.') },

  { id: 'da-mum', real: true, voice: { who: 'woman', rate: -10, pitch: -2 }, time: '14:00', place: l('Back on the road', 'ອອກເດີນທາງຕໍ່'), stake: 0,
    note: l("Dara's mum always worries on travel days.", 'ແມ່ຂອງດາຣາເປັນຫ່ວງທຸກເທື່ອທີ່ເດີນທາງ.'),
    caller: l('Mum', 'ແມ່'), number: '+856 20 52•• 6078', saved: true,
    lines: [
      l('Dara, are you on the bus?', 'ດາຣາ, ຂຶ້ນລົດແລ້ວບໍ່ລູກ?'),
      l('I put sticky rice and dried fish in your bag.', 'ແມ່ໃສ່ເຂົ້າໜຽວ ກັບປາແຫ້ງ ໄວ້ໃນກະເປົາໃຫ້ເດີ້.'),
      l('Call me when you arrive, okay?', 'ຮອດແລ້ວ ໂທຫາແມ່ເດີ້ລູກ.'),
    ],
    moves: { trust: l('Chat and promise to call', 'ລົມ ແລະ ສັນຍາວ່າຈະໂທ'), check: l('Check it is Mum on the screen', 'ເບິ່ງວ່າແມ່ນແມ່ໃນໜ້າຈໍ'), hangup: l('Hang up, Dara is tired', 'ວາງສາຍ ເມື່ອຍ') },
    outcome: {
      trust: l("Mum sounds happy. Dara finds the sticky rice at the next stop.", 'ແມ່ດີໃຈ. ດາຣາເຫັນເຂົ້າໜຽວຕອນຈອດຕໍ່ໄປ.'),
      check: l('It is Mum. They talk until the signal drops.', 'ແມ່ນແມ່ແທ້. ລົມກັນຈົນສັນຍານຫາຍ.'),
      hangup: l('Mum calls three more times, now really worried.', 'ແມ່ໂທມາອີກສາມເທື່ອ ເປັນຫ່ວງແທ້.'),
    },
    signs: ['known', 'nothing'], flags: [],
    remember: l('Keep family close when you travel. They are the people to call when something feels wrong.', 'ໃຫ້ຄອບຄົວຢູ່ໃກ້ຕອນເດີນທາງ. ເຂົາແມ່ນຄົນທີ່ຄວນໂທຫາເມື່ອມີຫຍັງຜິດປົກກະຕິ.') },

  { id: 'da-crypto', real: false, voice: { who: 'man', rate: 12, pitch: 4 }, time: '16:00', place: l('Arriving in town', 'ໃກ້ຮອດເມືອງ'), stake: 1_000_000,
    note: l("Dara hasn't spoken to anyone from high school in years.", 'ດາຣາບໍ່ໄດ້ລົມກັບໝູ່ມັດທະຍົມຫຼາຍປີແລ້ວ.'),
    caller: l('Unknown number', 'ເບີບໍ່ຮູ້ຈັກ'), number: '+856 20 94•• 6631', saved: false,
    lines: [
      l("Dara! It's Phone from high school. New number!", 'ດາຣາ! ໂຟນເອງ ໝູ່ມັດທະຍົມ. ເບີໃໝ່ເດີ້!'),
      l('I make two million a week trading crypto. Put in one million and I double it by Friday.', 'ຂ້ອຍຫາໄດ້ອາທິດລະສອງລ້ານ ຈາກເທຣດຄຣິບໂຕ. ລົງໜຶ່ງລ້ານ ຮອດວັນສຸກ ໄດ້ຄືນສອງເທົ່າ.'),
      l('Download the app from my link, not from the store.', 'ດາວໂຫຼດແອັບຈາກລິ້ງຂ້ອຍເດີ້ ບໍ່ແມ່ນຈາກສະໂຕ.'),
    ],
    moves: { trust: l('Install the app and put in a million', 'ຕິດຕັ້ງແອັບ ແລ້ວລົງໜຶ່ງລ້ານ'), check: l('Ask a question only the real Phone would know', 'ຖາມຄຳຖາມທີ່ໂຟນແທ້ເທົ່ານັ້ນຮູ້'), hangup: l('Hang up', 'ວາງສາຍ') },
    outcome: {
      trust: l('The app shows fake profits, then locks. One million kip gone.', 'ແອັບສະແດງກຳໄລປອມ ແລ້ວລັອກ. ເສຍໜຶ່ງລ້ານກີບ.'),
      check: l('"Who was our maths teacher?" Silence, then the line goes dead.', '"ຄູຄະນິດເຮົາແມ່ນໃຜ?" ງຽບ ແລ້ວສາຍຂາດ.'),
      hangup: l('Dara arrives in town with all the savings still there.', 'ດາຣາຮອດເມືອງ ເງິນເກັບຍັງຢູ່ຄົບ.'),
    },
    signs: ['gift', 'pay', 'mask'], flags: ['too_good', 'suspicious_link', 'unverified_identity'],
    remember: l('Doubled money is never real, and an app from a link instead of the store is a trap.', 'ເງິນເພີ່ມສອງເທົ່າບໍ່ມີແທ້ ແລະ ແອັບຈາກລິ້ງ ບໍ່ແມ່ນຈາກສະໂຕ ແມ່ນກັບດັກ.') },

  { id: 'da-switch', real: false, voice: { who: 'woman', rate: 12, pitch: -2 }, time: '14:00', place: l('Back on the road', 'ອອກເດີນທາງຕໍ່'), stake: 2_000_000,
    note: l('Dara accepted a customer-service job in Bangkok from a recruiter online.', 'ດາຣາຮັບວຽກບໍລິການລູກຄ້າຢູ່ບາງກອກ ຈາກຄົນຮັບສະໝັກອອນລາຍ.'),
    caller: l('Recruiter Ms. Lin', 'ຄົນຮັບສະໝັກ ນາງ ລິນ'), number: '+856 20 61•• 2294', saved: true,
    lines: [
      l('Small change, Dara. The Bangkok office is full, so you start at our Bokeo branch.', 'ປ່ຽນແຜນໜ້ອຍໜຶ່ງເດີ້ດາຣາ. ຫ້ອງການບາງກອກເຕັມແລ້ວ, ເຈົ້າຈະເລີ່ມວຽກທີ່ສາຂາບໍ່ແກ້ວ.'),
      l('Same salary, free dorm. Our driver will hold your passport at the border.', 'ເງິນເດືອນຄືເກົ່າ ຫໍພັກຟຣີ. ຄົນຂັບຈະຖືໜັງສືຜ່ານແດນໄວ້ໃຫ້ ຢູ່ດ່ານ.'),
      l('Get off at the next stop. Send two million kip for the new permit, and sign the contract in the car.', 'ລົງປ້າຍໜ້າເດີ້. ໂອນສອງລ້ານກີບ ຄ່າໃບອະນຸຍາດໃໝ່ ແລ້ວເຊັນສັນຍາໃນລົດເລີຍ.'),
    ],
    moves: { trust: l('Get off and pay for the permit', 'ລົງລົດ ແລ້ວຈ່າຍຄ່າໃບອະນຸຍາດ'), check: l('Stay on the bus and call the labour office', 'ຢູ່ເທິງລົດ ແລ້ວໂທຫາຫ້ອງການແຮງງານ'), hangup: l('Hang up and stay on the bus', 'ວາງສາຍ ແລ້ວຢູ່ເທິງລົດ') },
    outcome: {
      trust: l('Two million kip gone, passport handed over. The "branch" is a compound Dara is not allowed to leave.', 'ເສຍສອງລ້ານກີບ ໜັງສືຜ່ານແດນຖືກເອົາໄປ. "ສາຂາ" ແມ່ນບ່ອນທີ່ດາຣາບໍ່ໄດ້ຮັບອະນຸຍາດໃຫ້ອອກ.'),
      check: l('The labour office has no record of the company. They tell Dara this switch is a known trafficking pattern.', 'ຫ້ອງການແຮງງານບໍ່ມີຂໍ້ມູນບໍລິສັດ. ເຂົາບອກດາຣາວ່າ ການປ່ຽນແບບນີ້ແມ່ນຮູບແບບການຄ້າມະນຸດທີ່ຮູ້ກັນ.'),
      hangup: l('Dara stays on the bus with her passport and her savings.', 'ດາຣາຢູ່ເທິງລົດ ພ້ອມໜັງສືຜ່ານແດນ ແລະ ເງິນເກັບ.'),
    },
    signs: ['switch', 'docs', 'debt', 'pay'], flags: ['unverified_identity', 'personal_data', 'upfront_fee', 'urgency'],
    remember: l('Even a saved contact can be a trafficker. If the country or worksite changes at the last minute, stop.', 'ແມ່ນແຕ່ເບີທີ່ບັນທຶກ ກໍ່ອາດເປັນຜູ້ຄ້າມະນຸດ. ຖ້າປະເທດ ຫຼື ບ່ອນເຮັດວຽກປ່ຽນກະທັນຫັນ ໃຫ້ຢຸດ.') },

  { id: 'da-agency', real: true, voice: { who: 'woman', rate: -6, pitch: 2 }, time: '16:00', place: l('Arriving in town', 'ໃກ້ຮອດເມືອງ'), stake: 0,
    note: l("Dara applied in person to an agency she found on the labour office's licensed list.", 'ດາຣາໄປສະໝັກເອງ ກັບບໍລິສັດທີ່ພົບໃນລາຍຊື່ມີໃບອະນຸຍາດຂອງຫ້ອງການແຮງງານ.'),
    caller: l('Unknown number', 'ເບີບໍ່ຮູ້ຈັກ'), number: '+856 21 26•• 4471', saved: false,
    lines: [
      l('Hello Dara, this is the agency you visited. Your contract is ready, in Lao.', 'ສະບາຍດີດາຣາ, ນີ້ແມ່ນບໍລິສັດທີ່ເຈົ້າມາສະໝັກ. ສັນຍາພ້ອມແລ້ວ ເປັນພາສາລາວເດີ້.'),
      l('Take it home and read it with your family before you sign.', 'ເອົາກັບບ້ານໄປອ່ານກັບຄອບຄົວກ່ອນ ແລ້ວຄ່ອຍເຊັນ.'),
      l('You keep your passport the whole time. You can check our licence at the labour office.', 'ເຈົ້າເກັບໜັງສືຜ່ານແດນໄວ້ເອງຕະຫຼອດ. ໃບອະນຸຍາດຂອງເຮົາ ກວດໄດ້ທີ່ຫ້ອງການແຮງງານ.'),
    ],
    moves: { trust: l('Pick up the contract tomorrow', 'ໄປເອົາສັນຍາມື້ອື່ນ'), check: l('Check the licence with the labour office first', 'ກວດໃບອະນຸຍາດກັບຫ້ອງການແຮງງານກ່ອນ'), hangup: l('Hang up, all agents are scams', 'ວາງສາຍ ນາຍໜ້າທຸກຄົນຫຼອກ') },
    outcome: {
      trust: l('Dara reads the contract with Mum. The job, pay and place match what she applied for.', 'ດາຣາອ່ານສັນຍາກັບແມ່. ວຽກ, ເງິນເດືອນ ແລະ ສະຖານທີ່ ກົງກັບທີ່ສະໝັກ.'),
      check: l('The licence is real. Dara collects the contract with confidence.', 'ໃບອະນຸຍາດແທ້. ດາຣາໄປເອົາສັນຍາຢ່າງໝັ້ນໃຈ.'),
      hangup: l('Dara loses a safe, legal way to work abroad.', 'ດາຣາເສຍທາງເລືອກທີ່ປອດໄພ ແລະ ຖືກກົດໝາຍ ໃນການໄປເຮັດວຽກຕ່າງປະເທດ.'),
    },
    signs: ['match', 'nothing'], flags: [],
    remember: l('Safe migration: a licensed agency, a contract in your language, time to read it, and your passport stays with you.', 'ການໄປເຮັດວຽກທີ່ປອດໄພ: ບໍລິສັດມີໃບອະນຸຍາດ, ສັນຍາເປັນພາສາຂອງທ່ານ, ມີເວລາອ່ານ ແລະ ທ່ານເກັບໜັງສືຜ່ານແດນເອງ.') },
];
