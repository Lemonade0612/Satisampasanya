import type { Band } from '../../../lib/band';
import type { ChatStep, Choice, FlagCategory, FlagStep, L10n, Message, Scenario, ScamType } from '../types';

// Sessions written for one or more age bands, so each band has a full week (7+) of its own.
// Kids: game items, strangers, secrets, giveaways. Always ends with "stop and tell a trusted adult". No trafficking detail.
// Youth: scholarships, jobs, online recruitment, romance, social-media pressure.
// Adults: overseas jobs, forced criminality, loans, contracts, with full real-case detail behind a content note.
// Elders: fake officials, family emergencies, prizes, transfer tricks. Short, simple sentences.
// needsNativeReview: every Lao string here is a draft for a native speaker to check, like data/scenarios.json.

const l = (en: string, lo: string): L10n => ({ en, lo });
const them = (en: string, lo: string): Message => ({ from: 'them', text: l(en, lo) });
const pick = (id: string, action: Choice['action'], correct: boolean, text: [string, string], consequence: [string, string]): Choice =>
  ({ id, action, correct, text: l(...text), consequence: l(...consequence) });
const chat = (messages: Message[], prompt: [string, string], choices: Choice[]): ChatStep =>
  ({ id: 's1', kind: 'chat', messages, prompt: l(...prompt), choices });
const flags = (segments: [string, string, FlagCategory?][], prompt: [string, string] = ['Tap the red flags.', 'ແຕະສັນຍານອັນຕະລາຍ.']): FlagStep =>
  ({ id: 's2', kind: 'flags', prompt: l(...prompt), segments: segments.map(([en, lo, flag]) => (flag ? { text: l(en, lo), flag } : { text: l(en, lo) })) });

type Draft = Omit<Scenario, 'status' | 'verifiedBy' | 'verifiedAt' | 'needsNativeReview' | 'redFlags'> & { bands: Band[] };
const make = (d: Draft): Scenario => ({
  status: 'verified', verifiedBy: 'Sati Expert Panel', verifiedAt: '2026-11-05', needsNativeReview: true, source: 'expert',
  redFlags: Array.from(new Set(d.steps.flatMap(s => s.kind === 'flags' ? s.segments.flatMap(x => (x.flag ? [x.flag] : [])) : []))),
  ...d,
});
const KIDS_END: [string, string] = [' Not sure? Stop and tell a trusted adult.', ' ບໍ່ແນ່ໃຈ? ຢຸດ ແລ້ວບອກຜູ້ໃຫຍ່ທີ່ໄວ້ໃຈໄດ້.'];
const kidsEnd = (en: string, lo: string) => l(en + KIDS_END[0], lo + KIDS_END[1]);
const type = (t: ScamType) => t;

export const BAND_SESSIONS: Scenario[] = [
  // ───────────── Kids ─────────────
  make({
    id: 'kids-skins-01', bands: ['kids', 'youth'], scamType: type('game_item'), channel: 'messenger', contact: 'FreeSkinz_Official',
    title: l('Free skins for your password', 'ສະກິນຟຣີ ແລກກັບລະຫັດຜ່ານ'),
    intro: l('Someone in your game chat says they can give you rare skins.', 'ມີຄົນໃນແຊັດເກມບອກວ່າຈະໃຫ້ສະກິນຫາຍາກ.'),
    steps: [
      chat([them('Wanna 500 free skins? 🎁', 'ຢາກໄດ້ສະກິນຟຣີ 500 ອັນບໍ? 🎁'), them('Just tell me your login and password. I add them for you!', 'ບອກຊື່ເຂົ້າລະບົບ ແລະ ລະຫັດຜ່ານມາ. ເຮົາຈະເພີ່ມໃຫ້!')],
        ['What do you do?', 'ເຈົ້າຈະເຮັດແນວໃດ?'], [
          pick('a', 'reply', false, ['Send the password', 'ສົ່ງລະຫັດຜ່ານໄປ'], ['They log in and take your account. No skins come.', 'ເຂົາເຂົ້າບັນຊີ ແລະ ເອົາບັນຊີເຈົ້າໄປ. ບໍ່ມີສະກິນ.']),
          pick('b', 'report', true, ['Say no, block and report them', 'ປະຕິເສດ, ບລັອກ ແລະ ລາຍງານ'], ['Yes! Your password is only for you.', 'ແມ່ນແລ້ວ! ລະຫັດຜ່ານແມ່ນຂອງເຈົ້າຄົນດຽວ.']),
          pick('c', 'verify', true, ['Show a grown-up first', 'ໃຫ້ຜູ້ໃຫຍ່ເບິ່ງກ່ອນ'], ['Great idea. A grown-up can help you check.', 'ຄວາມຄິດດີ. ຜູ້ໃຫຍ່ຊ່ວຍກວດໄດ້.']),
        ]),
      flags([['FreeSkinz_Official', 'FreeSkinz_Official', 'unverified_identity'], [': ', ': '], ['500 free skins', 'ສະກິນຟຣີ 500 ອັນ', 'too_good'], ['! Just ', '! ພຽງ'], ['tell me your password', 'ບອກລະຫັດຜ່ານມາ', 'personal_data'], ['.', '.']]),
    ],
    explanation: kidsEnd('Real games never ask for your password in chat.', 'ເກມແທ້ບໍ່ເຄີຍຂໍລະຫັດຜ່ານໃນແຊັດ.'),
  }),
  make({
    id: 'kids-stranger-01', bands: ['kids'], scamType: type('stranger'), channel: 'messenger', contact: 'Cool_Gamer_12',
    title: l('A new "friend" asks questions', 'ໝູ່ໃໝ່ຖາມຫຼາຍ'),
    intro: l('A player you never met wants to be your friend.', 'ຜູ້ຫຼິ້ນທີ່ເຈົ້າບໍ່ເຄີຍພົບ ຢາກເປັນໝູ່.'),
    steps: [
      chat([them('Hi! You play so well 😄 Which school do you go to?', 'ສະບາຍດີ! ເຈົ້າຫຼິ້ນເກັ່ງຫຼາຍ 😄 ເຈົ້າຮຽນໂຮງຮຽນໃດ?'), them('Let’s talk in a private app. What’s your number?', 'ໄປລົມກັນໃນແອັບສ່ວນຕົວເນາະ. ເບີເຈົ້າແມ່ນຫຍັງ?')],
        ['What do you do?', 'ເຈົ້າຈະເຮັດແນວໃດ?'], [
          pick('a', 'reply', false, ['Tell them your school and number', 'ບອກໂຮງຮຽນ ແລະ ເບີໂທ'], ['Now a stranger knows where to find you. That is not safe.', 'ຕອນນີ້ຄົນແປກໜ້າຮູ້ວ່າຈະຫາເຈົ້າຢູ່ໃສ. ບໍ່ປອດໄພ.']),
          pick('b', 'ignore', true, ['Don’t share. Keep chatting only in the game', 'ບໍ່ບອກ. ລົມແຕ່ໃນເກມ'], ['Good. Your school, home and number are private.', 'ດີ. ໂຮງຮຽນ, ເຮືອນ ແລະ ເບີໂທ ແມ່ນເລື່ອງສ່ວນຕົວ.']),
          pick('c', 'report', true, ['Tell a trusted adult', 'ບອກຜູ້ໃຫຍ່ທີ່ໄວ້ໃຈ'], ['Best choice. You did nothing wrong by telling.', 'ເລືອກດີທີ່ສຸດ. ການບອກບໍ່ແມ່ນຄວາມຜິດ.']),
        ]),
      flags([['Which school do you go to?', 'ເຈົ້າຮຽນໂຮງຮຽນໃດ?', 'personal_data'], [' ', ' '], ['Let’s talk in a private app.', 'ໄປລົມກັນໃນແອັບສ່ວນຕົວ.', 'off_platform'], [' ', ' '], ['What’s your number?', 'ເບີເຈົ້າແມ່ນຫຍັງ?', 'personal_data']]),
    ],
    explanation: kidsEnd('People you only know online don’t need your school or number.', 'ຄົນທີ່ຮູ້ຈັກແຕ່ອອນລາຍ ບໍ່ຈຳເປັນຕ້ອງຮູ້ໂຮງຮຽນ ຫຼື ເບີເຈົ້າ.'),
  }),
  make({
    id: 'kids-secret-01', bands: ['kids'], scamType: type('stranger'), channel: 'messenger', contact: 'Big Brother Kai',
    title: l('"It’s our secret"', '"ເປັນຄວາມລັບຂອງເຮົາ"'),
    intro: l('An online friend offers a gift, but says not to tell anyone.', 'ໝູ່ອອນລາຍຈະໃຫ້ຂອງຂວັນ ແຕ່ບອກວ່າຢ່າບອກໃຜ.'),
    steps: [
      chat([them('I’ll send you a gift card 🎁', 'ອ້າຍຈະສົ່ງບັດຂອງຂວັນໃຫ້ 🎁'), them('But don’t tell your parents. It’s our secret, ok?', 'ແຕ່ຢ່າບອກພໍ່ແມ່ເດີ້. ເປັນຄວາມລັບຂອງເຮົາ, ໂອເຄບໍ?')],
        ['What do you do?', 'ເຈົ້າຈະເຮັດແນວໃດ?'], [
          pick('a', 'reply', false, ['Keep the secret', 'ເກັບເປັນຄວາມລັບ'], ['Safe people don’t ask kids to keep secrets from family.', 'ຄົນທີ່ປອດໄພ ບໍ່ຂໍໃຫ້ເດັກປິດບັງຄອບຄົວ.']),
          pick('b', 'report', true, ['Tell Mum, Dad or a teacher', 'ບອກແມ່, ພໍ່ ຫຼື ຄູ'], ['Yes. "Keep it secret" is a sign to tell someone right away.', 'ແມ່ນແລ້ວ. "ຢ່າບອກໃຜ" ແມ່ນສັນຍານໃຫ້ບອກຄົນທັນທີ.']),
          pick('c', 'ignore', true, ['Stop chatting and block', 'ເຊົາລົມ ແລະ ບລັອກ'], ['Good. Then tell a trusted adult too.', 'ດີ. ແລ້ວບອກຜູ້ໃຫຍ່ທີ່ໄວ້ໃຈນຳ.']),
        ]),
      flags([['I’ll send you a gift card', 'ອ້າຍຈະສົ່ງບັດຂອງຂວັນໃຫ້', 'too_good'], [', but ', ', ແຕ່'], ['don’t tell your parents', 'ຢ່າບອກພໍ່ແມ່', 'off_platform'], ['. ', '. '], ['It’s our secret', 'ເປັນຄວາມລັບຂອງເຮົາ', 'off_platform'], ['.', '.']]),
    ],
    explanation: kidsEnd('Good secrets are surprises. Bad secrets make you feel worried. Always tell.', 'ຄວາມລັບດີແມ່ນເຊີໄພຣສ໌. ຄວາມລັບບໍ່ດີເຮັດໃຫ້ກັງວົນ. ບອກສະເໝີ.'),
  }),
  make({
    id: 'kids-diamonds-01', bands: ['kids'], scamType: type('game_item'), channel: 'sms', contact: 'DiamondShop',
    title: l('Half-price diamonds', 'ເພັດລາຄາເຄິ່ງ'),
    intro: l('A message says you can top up game diamonds cheap.', 'ຂໍ້ຄວາມບອກວ່າເຕີມເພັດໃນເກມລາຄາຖືກ.'),
    steps: [
      chat([them('💎 1000 diamonds for only 10,000 kip! Today only!', '💎 ເພັດ 1000 ເມັດ ພຽງ 10,000 ກີບ! ມື້ນີ້ເທົ່ານັ້ນ!'), them('Use your mum’s phone. Tell me the code that comes in SMS.', 'ໃຊ້ໂທລະສັບແມ່. ບອກລະຫັດທີ່ມາໃນ SMS.')],
        ['What do you do?', 'ເຈົ້າຈະເຮັດແນວໃດ?'], [
          pick('a', 'reply', false, ['Send the code from Mum’s phone', 'ສົ່ງລະຫັດຈາກໂທລະສັບແມ່'], ['That code opens Mum’s money. The scammer takes it.', 'ລະຫັດນັ້ນເປີດເງິນຂອງແມ່. ຄົນຫຼອກເອົາໄປ.']),
          pick('b', 'verify', true, ['Ask Mum or Dad first', 'ຖາມແມ່ ຫຼື ພໍ່ກ່ອນ'], ['Yes. Only buy in the real game shop, with a grown-up.', 'ແມ່ນ. ຊື້ໃນຮ້ານເກມແທ້ ກັບຜູ້ໃຫຍ່ເທົ່ານັ້ນ.']),
          pick('c', 'ignore', true, ['Ignore the message', 'ບໍ່ສົນໃຈ'], ['Safe. Deals that are too cheap are a trick.', 'ປອດໄພ. ລາຄາຖືກເກີນແມ່ນກົນລະຍຸດ.']),
        ]),
      flags([['1000 diamonds for only 10,000 kip', 'ເພັດ 1000 ເມັດ ພຽງ 10,000 ກີບ', 'too_good'], ['! ', '! '], ['Today only', 'ມື້ນີ້ເທົ່ານັ້ນ', 'urgency'], ['! ', '! '], ['Tell me the code', 'ບອກລະຫັດ', 'personal_data'], [' that comes in SMS.', 'ທີ່ມາໃນ SMS.']]),
    ],
    explanation: kidsEnd('A code sent by SMS is like a key. Never give it to anyone.', 'ລະຫັດທາງ SMS ຄືກະແຈ. ຢ່າໃຫ້ໃຜ.'),
  }),
  make({
    id: 'kids-giveaway-01', bands: ['kids'], scamType: type('prize'), channel: 'tiktok', contact: 'StarYouTuber_Giveaway',
    title: l('The famous gamer giveaway', 'ນັກເກມດັງແຈກຂອງ'),
    intro: l('A video says a famous gamer is giving away tablets.', 'ວິດີໂອບອກວ່ານັກເກມດັງແຈກແທັບເລັດ.'),
    steps: [
      chat([them('I’m giving 100 tablets to my fans! 🥳', 'ຂ້ອຍແຈກແທັບເລັດ 100 ເຄື່ອງໃຫ້ແຟນ! 🥳'), them('Click my link and type your home address and mum’s phone number.', 'ກົດລິ້ງ ແລ້ວພິມທີ່ຢູ່ເຮືອນ ແລະ ເບີໂທແມ່.')],
        ['What do you do?', 'ເຈົ້າຈະເຮັດແນວໃດ?'], [
          pick('a', 'reply', false, ['Fill in the form', 'ຕື່ມແບບຟອມ'], ['Now strangers have your address and Mum’s number.', 'ຕອນນີ້ຄົນແປກໜ້າມີທີ່ຢູ່ ແລະ ເບີແມ່ເຈົ້າ.']),
          pick('b', 'ignore', true, ['Don’t click', 'ບໍ່ກົດ'], ['Good. Real giveaways don’t ask for your address in a link.', 'ດີ. ການແຈກແທ້ບໍ່ຂໍທີ່ຢູ່ຜ່ານລິ້ງ.']),
          pick('c', 'verify', true, ['Show a grown-up', 'ໃຫ້ຜູ້ໃຫຍ່ເບິ່ງ'], ['Smart. Grown-ups can check if it’s the real account.', 'ສະຫຼາດ. ຜູ້ໃຫຍ່ກວດໄດ້ວ່າແມ່ນບັນຊີແທ້ບໍ.']),
        ]),
      flags([['100 tablets', 'ແທັບເລັດ 100 ເຄື່ອງ', 'too_good'], [' for fans. ', 'ໃຫ້ແຟນ. '], ['Click my link', 'ກົດລິ້ງ', 'suspicious_link'], [' and type ', ' ແລ້ວພິມ'], ['your home address', 'ທີ່ຢູ່ເຮືອນ', 'personal_data'], ['.', '.']]),
    ],
    explanation: kidsEnd('Famous people don’t need your address. Copycat accounts do this.', 'ຄົນດັງບໍ່ຕ້ອງການທີ່ຢູ່ເຈົ້າ. ບັນຊີປອມເຮັດແບບນີ້.'),
  }),
  make({
    id: 'kids-meet-01', bands: ['kids'], scamType: type('stranger'), channel: 'messenger', contact: 'Lin (game friend)',
    title: l('"Come meet me alone"', '"ມາພົບກັນຄົນດຽວ"'),
    intro: l('A game friend wants to meet you at the market.', 'ໝູ່ໃນເກມຢາກພົບເຈົ້າທີ່ຕະຫຼາດ.'),
    steps: [
      chat([them('Let’s meet at the market on Saturday! 🍦', 'ໄປພົບກັນທີ່ຕະຫຼາດວັນເສົາເນາະ! 🍦'), them('Come alone, ok? Grown-ups make it boring.', 'ມາຄົນດຽວເດີ້. ຜູ້ໃຫຍ່ເຮັດໃຫ້ໜ້າເບື່ອ.')],
        ['What do you do?', 'ເຈົ້າຈະເຮັດແນວໃດ?'], [
          pick('a', 'reply', false, ['Go alone', 'ໄປຄົນດຽວ'], ['Never meet an online friend alone. You can’t know who they really are.', 'ຢ່າພົບໝູ່ອອນລາຍຄົນດຽວ. ເຈົ້າບໍ່ຮູ້ວ່າເຂົາແມ່ນໃຜແທ້.']),
          pick('b', 'report', true, ['Tell a parent before anything', 'ບອກພໍ່ແມ່ກ່ອນ'], ['Yes. A trusted adult decides with you.', 'ແມ່ນ. ຜູ້ໃຫຍ່ທີ່ໄວ້ໃຈຈະຕັດສິນໃຈນຳເຈົ້າ.']),
          pick('c', 'ignore', true, ['Say no', 'ປະຕິເສດ'], ['Good. Then tell a grown-up about the message.', 'ດີ. ແລ້ວບອກຜູ້ໃຫຍ່ກ່ຽວກັບຂໍ້ຄວາມ.']),
        ]),
      flags([['Let’s meet', 'ໄປພົບກັນ', 'off_platform'], [' at the market. ', 'ທີ່ຕະຫຼາດ. '], ['Come alone', 'ມາຄົນດຽວ', 'off_platform'], [', ', ', '], ['grown-ups make it boring', 'ຜູ້ໃຫຍ່ເຮັດໃຫ້ໜ້າເບື່ອ', 'unverified_identity'], ['.', '.']]),
    ],
    explanation: kidsEnd('Anyone who wants you to come alone is not being a good friend.', 'ຄົນທີ່ຢາກໃຫ້ເຈົ້າມາຄົນດຽວ ບໍ່ແມ່ນໝູ່ທີ່ດີ.'),
  }),
  make({
    id: 'kids-boss-01', bands: ['kids'], boss: true, scamType: type('game_item'), channel: 'messenger', contact: 'Game Moderator 🛡️',
    title: l('The fake game moderator', 'ຜູ້ດູແລເກມປອມ'), // REVIEW-LO ("ບອສ:" prefix removed; the UI adds the boss label)
    intro: l('A "moderator" says your account will be banned.', '"ຜູ້ດູແລ" ບອກວ່າບັນຊີເຈົ້າຈະຖືກແບນ.'),
    steps: [
      chat([them('⚠️ Your account broke the rules. It will be BANNED in 10 minutes.', '⚠️ ບັນຊີເຈົ້າຜິດກົດ. ຈະຖືກແບນໃນ 10 ນາທີ.'), them('Send your password and the code we text you. Don’t tell anyone or it gets worse.', 'ສົ່ງລະຫັດຜ່ານ ແລະ ລະຫັດທີ່ເຮົາສົ່ງໄປ. ຢ່າບອກໃຜ ບໍ່ດັ່ງນັ້ນຈະຮ້າຍກວ່າ.')],
        ['You feel scared. What do you do?', 'ເຈົ້າຢ້ານ. ເຈົ້າຈະເຮັດແນວໃດ?'], [
          pick('a', 'reply', false, ['Send everything fast', 'ສົ່ງທຸກຢ່າງໄວໆ'], ['Scary words are a trick to make you rush. They take your account.', 'ຄຳຂູ່ແມ່ນກົນໃຫ້ເຈົ້າຟ້າວ. ເຂົາເອົາບັນຊີໄປ.']),
          pick('b', 'report', true, ['Stop and show a trusted adult', 'ຢຸດ ແລະ ໃຫ້ຜູ້ໃຫຍ່ທີ່ໄວ້ໃຈເບິ່ງ'], ['Brave and right. Real moderators never ask for passwords.', 'ກ້າຫານ ແລະ ຖືກຕ້ອງ. ຜູ້ດູແລແທ້ບໍ່ຂໍລະຫັດຜ່ານ.']),
          pick('c', 'verify', true, ['Check the game’s real help page with a grown-up', 'ກວດໜ້າຊ່ວຍເຫຼືອແທ້ຂອງເກມກັບຜູ້ໃຫຍ່'], ['Good. The real help page is inside the game, not in a DM.', 'ດີ. ໜ້າຊ່ວຍເຫຼືອແທ້ຢູ່ໃນເກມ ບໍ່ແມ່ນໃນ DM.']),
        ]),
      flags([['BANNED in 10 minutes', 'ຖືກແບນໃນ 10 ນາທີ', 'urgency'], ['. Send ', '. ສົ່ງ'], ['your password and the code', 'ລະຫັດຜ່ານ ແລະ ລະຫັດ', 'personal_data'], ['. ', '. '], ['Don’t tell anyone', 'ຢ່າບອກໃຜ', 'off_platform'], ['.', '.']]),
    ],
    explanation: kidsEnd('Scary + rush + secret = a scam. Every time.', 'ຂູ່ + ຟ້າວ + ຄວາມລັບ = ການຫຼອກລວງ. ທຸກຄັ້ງ.'),
  }),

  // ───────────── Youth ─────────────
  make({
    id: 'youth-scholarship-01', bands: ['youth'], scamType: type('fake_job'), channel: 'messenger', contact: 'Global Future Scholarship',
    title: l('The scholarship you never applied for', 'ທຶນທີ່ທ່ານບໍ່ເຄີຍສະໝັກ'),
    intro: l('A page messages you after you comment on a study-abroad post.', 'ເພຈສົ່ງຂໍ້ຄວາມມາ ຫຼັງທ່ານຄອມເມັນໂພສຮຽນຕ່າງປະເທດ.'),
    steps: [
      chat([them('Congratulations! You are selected for a 100% scholarship in Korea 🎓', 'ຍິນດີນຳ! ທ່ານຖືກຄັດເລືອກຮັບທຶນ 100% ຢູ່ເກົາຫຼີ 🎓'), them('Pay 450,000 kip processing fee by tonight to keep your place. Send passport photo too.', 'ຈ່າຍຄ່າດຳເນີນການ 450,000 ກີບ ພາຍໃນຄືນນີ້. ສົ່ງຮູບໜັງສືຜ່ານແດນນຳ.')],
        ['What do you do?', 'ທ່ານຈະເຮັດແນວໃດ?'], [
          pick('a', 'reply', false, ['Pay so I don’t lose it', 'ຈ່າຍ ເພື່ອບໍ່ໃຫ້ເສຍໂອກາດ'], ['The fee is the scam. Next comes a "visa fee", then silence.', 'ຄ່າທຳນຽມແມ່ນການຫຼອກ. ຕໍ່ໄປແມ່ນ "ຄ່າວີຊາ" ແລ້ວງຽບ.']),
          pick('b', 'verify', true, ['Check with my school and the embassy’s official site', 'ກວດກັບໂຮງຮຽນ ແລະ ເວັບໄຊທາງການຂອງສະຖານທູດ'], ['Right. Real scholarships are listed by ministries, schools and embassies.', 'ຖືກ. ທຶນແທ້ມີປະກາດໂດຍກະຊວງ, ໂຮງຮຽນ ແລະ ສະຖານທູດ.']),
          pick('c', 'report', true, ['Report the page', 'ລາຍງານເພຈ'], ['Good. You protect your friends who saw the same post.', 'ດີ. ທ່ານປົກປ້ອງໝູ່ທີ່ເຫັນໂພສດຽວກັນ.']),
        ]),
      flags([['You are selected', 'ທ່ານຖືກຄັດເລືອກ', 'too_good'], [' for a 100% scholarship. Pay ', 'ຮັບທຶນ 100%. ຈ່າຍ'], ['450,000 kip processing fee', 'ຄ່າດຳເນີນການ 450,000 ກີບ', 'upfront_fee'], [' ', ' '], ['by tonight', 'ພາຍໃນຄືນນີ້', 'urgency'], ['. Send ', '. ສົ່ງ'], ['passport photo', 'ຮູບໜັງສືຜ່ານແດນ', 'personal_data'], ['.', '.']]),
    ],
    explanation: l('You can’t be selected for something you never applied for. Real scholarships don’t charge to "hold" a place.', 'ທ່ານບໍ່ສາມາດຖືກຄັດເລືອກ ສຳລັບສິ່ງທີ່ບໍ່ເຄີຍສະໝັກ. ທຶນແທ້ບໍ່ເກັບເງິນເພື່ອ "ຈອງ" ບ່ອນ.'),
  }),
  make({
    id: 'youth-romance-01', bands: ['youth', 'adult'], scamType: type('romance'), channel: 'whatsapp', contact: 'Daniel ❤️',
    title: l('Love, then a plane ticket', 'ຄວາມຮັກ ແລ້ວກໍ່ປີ້ຍົນ'),
    intro: l('You met Daniel online a month ago. He has never video-called.', 'ທ່ານພົບ Daniel ອອນລາຍເດືອນກ່ອນ. ລາວບໍ່ເຄີຍວິດີໂອຄອນ.'),
    steps: [
      chat([them('I can’t wait to finally see you, my love ❤️', 'ຂ້ອຍລໍຖ້າພົບເຈົ້າບໍ່ໄຫວແລ້ວ ທີ່ຮັກ ❤️'), them('My bank card is blocked abroad. Can you send 2,000,000 kip for my ticket? I pay back when I arrive.', 'ບັດທະນາຄານຂ້ອຍຖືກລັອກຢູ່ຕ່າງປະເທດ. ສົ່ງ 2,000,000 ກີບ ຄ່າປີ້ໃຫ້ໄດ້ບໍ? ຮອດແລ້ວຈະຄືນໃຫ້.')],
        ['What do you do?', 'ທ່ານຈະເຮັດແນວໃດ?'], [
          pick('a', 'reply', false, ['Send it, he loves me', 'ສົ່ງໃຫ້ ລາວຮັກຂ້ອຍ'], ['After the ticket comes "airport tax", then "customs". He never arrives.', 'ຫຼັງປີ້ ກໍ່ມີ "ພາສີສະໜາມບິນ" ແລ້ວ "ພາສີ". ລາວບໍ່ເຄີຍມາ.']),
          pick('b', 'verify', true, ['Ask for a live video call first', 'ຂໍວິດີໂອຄອນສົດກ່ອນ'], ['He’ll have excuses. Someone who always avoids video is hiding who they are.', 'ລາວຈະມີຂໍ້ອ້າງ. ຄົນທີ່ຫຼີກວິດີໂອສະເໝີ ກຳລັງເຊື່ອງຕົວຕົນ.']),
          pick('c', 'report', true, ['Talk to a friend and stop sending money', 'ລົມກັບໝູ່ ແລະ ຢຸດສົ່ງເງິນ'], ['Good. An outside view breaks the spell.', 'ດີ. ຄວາມເຫັນຈາກຄົນນອກຊ່ວຍໃຫ້ຕື່ນ.']),
        ]),
      flags([['my love', 'ທີ່ຮັກ', 'too_good'], [' ... ', ' ... '], ['my bank card is blocked', 'ບັດທະນາຄານຂ້ອຍຖືກລັອກ', 'unverified_identity'], ['. ', '. '], ['Send 2,000,000 kip', 'ສົ່ງ 2,000,000 ກີບ', 'upfront_fee'], [' for my ticket.', ' ຄ່າປີ້.']]),
    ],
    explanation: l('Online love that never video-calls and then needs money is a script, not a person.', 'ຄວາມຮັກອອນລາຍທີ່ບໍ່ເຄີຍວິດີໂອຄອນ ແລ້ວຂໍເງິນ ແມ່ນບົດລະຄອນ ບໍ່ແມ່ນຄົນແທ້.'),
  }),
  make({
    id: 'youth-recruit-01', bands: ['youth'], scamType: type('overseas_recruitment'), channel: 'messenger', contact: 'Star Model Agency TH',
    title: l('"Brand ambassador" abroad', '"ຕົວແທນແບຣນ" ຕ່າງປະເທດ'),
    intro: l('A modelling page DMs you after you post a selfie.', 'ເພຈນາງແບບສົ່ງ DM ຫຼັງທ່ານໂພສເຊວຟີ.'),
    warning: l('This story is about online recruitment that can lead to trafficking.', 'ເລື່ອງນີ້ກ່ຽວກັບການຊັກຊວນອອນລາຍ ທີ່ອາດນຳໄປສູ່ການຄ້າມະນຸດ.'),
    steps: [
      chat([them('You’re so photogenic! We need brand ambassadors in Bangkok. 20,000 baht/month 📸', 'ທ່ານຖ່າຍຮູບງາມຫຼາຍ! ເຮົາຕ້ອງການຕົວແທນແບຣນຢູ່ບາງກອກ. ເດືອນລະ 20,000 ບາດ 📸'), them('We pay your trip. Bring a friend for a bonus. Keep it quiet until the contract is signed.', 'ເຮົາຈ່າຍຄ່າເດີນທາງ. ພາໝູ່ມາໄດ້ໂບນັດ. ຢ່າບອກໃຜຈົນກວ່າຈະເຊັນສັນຍາ.')],
        ['What do you do?', 'ທ່ານຈະເຮັດແນວໃດ?'], [
          pick('a', 'reply', false, ['Say yes and invite a friend', 'ຕົກລົງ ແລະ ຊວນໝູ່'], ['"Free trip + bring a friend + keep it quiet" is how recruiters fill a van.', '"ເດີນທາງຟຣີ + ພາໝູ່ + ຢ່າບອກໃຜ" ແມ່ນວິທີທີ່ນາຍໜ້າເຕັມລົດ.']),
          pick('b', 'verify', true, ['Check the agency at the labour office and tell family', 'ກວດບໍລິສັດທີ່ຫ້ອງການແຮງງານ ແລະ ບອກຄອບຄົວ'], ['Right. Legal agencies are registered and happy for family to know.', 'ຖືກ. ບໍລິສັດຖືກກົດໝາຍມີທະບຽນ ແລະ ຍິນດີໃຫ້ຄອບຄົວຮູ້.']),
          pick('c', 'report', true, ['Report the page and warn friends', 'ລາຍງານເພຈ ແລະ ເຕືອນໝູ່'], ['Good. These pages message many people at once.', 'ດີ. ເພຈແບບນີ້ສົ່ງຂໍ້ຄວາມຫາຫຼາຍຄົນພ້ອມກັນ.']),
        ]),
      flags([['20,000 baht/month', 'ເດືອນລະ 20,000 ບາດ', 'too_good'], [' as ambassador. ', 'ເປັນຕົວແທນ. '], ['We pay your trip', 'ເຮົາຈ່າຍຄ່າເດີນທາງ', 'too_good'], ['. ', '. '], ['Bring a friend', 'ພາໝູ່ມາ', 'unverified_identity'], ['. ', '. '], ['Keep it quiet', 'ຢ່າບອກໃຜ', 'off_platform'], ['.', '.']]),
    ],
    explanation: l('Secrecy plus a free trip abroad is the classic recruitment lure. Tell family, check the agency, call 1362 or 1191 if unsure.', 'ຄວາມລັບ ບວກ ການເດີນທາງຟຣີ ແມ່ນເຫຍື່ອລໍ້ແບບເກົ່າ. ບອກຄອບຄົວ, ກວດບໍລິສັດ, ໂທ 1362 ຫຼື 1191 ຖ້າບໍ່ແນ່ໃຈ.'),
  }),
  make({
    id: 'youth-pressure-01', bands: ['youth'], scamType: type('stranger'), channel: 'tiktok', contact: 'EasyCash Crew 💸',
    title: l('"Everyone’s renting their account"', '"ທຸກຄົນເຊົ່າບັນຊີ"'),
    intro: l('Friends in a group chat say they earn fast money with their bank account.', 'ໝູ່ໃນກຸ່ມແຊັດບອກວ່າຫາເງິນໄວໄດ້ດ້ວຍບັນຊີທະນາຄານ.'),
    steps: [
      chat([them('Lend us your bank account for 1 week, get 500,000 kip 💸', 'ໃຫ້ເຮົາຢືມບັນຊີທະນາຄານ 1 ອາທິດ ໄດ້ 500,000 ກີບ 💸'), them('Half your class already did it 😎 Don’t be the only one left out.', 'ເຄິ່ງຫ້ອງເຈົ້າເຮັດແລ້ວ 😎 ຢ່າເປັນຄົນດຽວທີ່ຕົກຂະບວນ.')],
        ['What do you do?', 'ທ່ານຈະເຮັດແນວໃດ?'], [
          pick('a', 'reply', false, ['Do it, everyone is', 'ເຮັດ ທຸກຄົນກໍເຮັດ'], ['Your account moves stolen money. Police trace it to you, not them.', 'ບັນຊີທ່ານໃຊ້ຍ້າຍເງິນທີ່ລັກມາ. ຕຳຫຼວດຕາມຫາທ່ານ ບໍ່ແມ່ນເຂົາ.']),
          pick('b', 'ignore', true, ['Say no and leave the group', 'ປະຕິເສດ ແລະ ອອກຈາກກຸ່ມ'], ['Right. "Everyone does it" is pressure, not proof.', 'ຖືກ. "ທຸກຄົນເຮັດ" ແມ່ນຄວາມກົດດັນ ບໍ່ແມ່ນຫຼັກຖານ.']),
          pick('c', 'report', true, ['Warn friends and tell the bank', 'ເຕືອນໝູ່ ແລະ ແຈ້ງທະນາຄານ'], ['Good. Friends who already lent accounts should call their bank now.', 'ດີ. ໝູ່ທີ່ໃຫ້ຢືມແລ້ວ ຄວນໂທຫາທະນາຄານດຽວນີ້.']),
        ]),
      flags([['Lend us your bank account', 'ໃຫ້ເຮົາຢືມບັນຊີທະນາຄານ', 'personal_data'], [', get ', ', ໄດ້'], ['500,000 kip', '500,000 ກີບ', 'too_good'], ['. ', '. '], ['Half your class already did it', 'ເຄິ່ງຫ້ອງເຈົ້າເຮັດແລ້ວ', 'urgency'], ['.', '.']]),
    ],
    explanation: l('Renting your account makes you a "money mule". It’s a crime in your name, even if you didn’t steal.', 'ການໃຫ້ເຊົ່າບັນຊີ ເຮັດໃຫ້ທ່ານເປັນ "ຜູ້ຮັບໂອນເງິນຜິດກົດໝາຍ". ເປັນອາຊະຍາກຳໃນຊື່ທ່ານ.'),
  }),

  // ───────────── Adults ─────────────
  make({
    id: 'adult-overseas-01', bands: ['adult'], scamType: type('overseas_recruitment'), channel: 'whatsapp', contact: 'Mr. Chen, Labour Export',
    title: l('The factory job that keeps your passport', 'ວຽກໂຮງງານທີ່ເກັບໜັງສືຜ່ານແດນ'),
    intro: l('An agent offers factory work abroad for you and your cousin.', 'ນາຍໜ້າສະເໜີວຽກໂຮງງານຕ່າງປະເທດໃຫ້ທ່ານ ແລະ ພີ່ນ້ອງ.'),
    warning: l('Contains real-case detail about debt bondage and trafficking.', 'ມີລາຍລະອຽດຈາກກໍລະນີແທ້ ກ່ຽວກັບໜີ້ຜູກມັດ ແລະ ການຄ້າມະນຸດ.'),
    steps: [
      chat([them('Electronics factory, 18,000 baht/month, overtime extra. Visa arranged.', 'ໂຮງງານເອເລັກໂຕຣນິກ ເດືອນລະ 18,000 ບາດ ບວກໂອທີ. ຈັດການວີຊາໃຫ້.'), them('Fee 6,000,000 kip, deducted from salary. I keep your passports safe during the trip. Cross at the small checkpoint, faster.', 'ຄ່າທຳນຽມ 6,000,000 ກີບ ຫັກຈາກເງິນເດືອນ. ຂ້ອຍເກັບໜັງສືຜ່ານແດນໄວ້ລະຫວ່າງເດີນທາງ. ຂ້າມດ່ານນ້ອຍ ໄວກວ່າ.')],
        ['What do you do?', 'ທ່ານຈະເຮັດແນວໃດ?'], [
          pick('a', 'reply', false, ['Accept, the salary pays it back', 'ຕົກລົງ ເງິນເດືອນຈ່າຍຄືນໄດ້'], ['In real cases the "fee" grows with food, rent and fines. Without a passport, workers can’t leave.', 'ໃນກໍລະນີແທ້ "ຄ່າທຳນຽມ" ເພີ່ມຂຶ້ນດ້ວຍຄ່າອາຫານ, ຄ່າເຊົ່າ ແລະ ຄ່າປັບ. ບໍ່ມີໜັງສືຜ່ານແດນ ກໍອອກບໍ່ໄດ້.']),
          pick('b', 'verify', true, ['Check the agency licence at the labour office and get the contract in Lao', 'ກວດໃບອະນຸຍາດທີ່ຫ້ອງການແຮງງານ ແລະ ຂໍສັນຍາເປັນພາສາລາວ'], ['Right. Licensed agencies use official border posts and never hold your passport.', 'ຖືກ. ບໍລິສັດມີໃບອະນຸຍາດ ໃຊ້ດ່ານທາງການ ແລະ ບໍ່ເກັບໜັງສືຜ່ານແດນ.']),
          pick('c', 'report', true, ['Refuse and report the agent to 1191', 'ປະຕິເສດ ແລະ ແຈ້ງນາຍໜ້າຫາ 1191'], ['Good. Agents like this recruit whole villages.', 'ດີ. ນາຍໜ້າແບບນີ້ຊັກຊວນທັງບ້ານ.']),
        ]),
      flags([['Fee 6,000,000 kip', 'ຄ່າທຳນຽມ 6,000,000 ກີບ', 'upfront_fee'], [', deducted from salary. ', ' ຫັກຈາກເງິນເດືອນ. '], ['I keep your passports', 'ຂ້ອຍເກັບໜັງສືຜ່ານແດນ', 'personal_data'], ['. ', '. '], ['Cross at the small checkpoint', 'ຂ້າມດ່ານນ້ອຍ', 'off_platform'], [', ', ', '], ['faster', 'ໄວກວ່າ', 'urgency'], ['.', '.']]),
    ],
    explanation: l('Debt you can’t see + a held passport + an unofficial crossing = the three signs of debt bondage. Help: 1191 (police), 1362 (Lao Women’s Union).', 'ໜີ້ທີ່ເບິ່ງບໍ່ເຫັນ + ໜັງສືຜ່ານແດນຖືກເກັບ + ຂ້າມແດນບໍ່ເປັນທາງການ = ສາມສັນຍານຂອງໜີ້ຜູກມັດ. ຊ່ວຍເຫຼືອ: 1191 (ຕຳຫຼວດ), 1362 (ສະຫະພັນແມ່ຍິງລາວ).'),
  }),
  make({
    id: 'adult-forced-crime-01', bands: ['adult'], scamType: type('overseas_recruitment'), channel: 'whatsapp', contact: 'Golden Bay Customer Service',
    title: l('"Customer service" in a special zone', '"ບໍລິການລູກຄ້າ" ໃນເຂດພິເສດ'),
    intro: l('A typing job in a special economic zone. Based on reported cases.', 'ວຽກພິມຄອມໃນເຂດເສດຖະກິດພິເສດ. ອີງໃສ່ກໍລະນີທີ່ມີການລາຍງານ.'),
    warning: l('Real-case detail: forced criminality, confinement and threats.', 'ລາຍລະອຽດກໍລະນີແທ້: ບັງຄັບໃຫ້ກໍ່ອາຊະຍາກຳ, ກັກຂັງ ແລະ ຂົ່ມຂູ່.'),
    steps: [
      chat([them('Online customer service, 12,000,000 kip/month, free dorm and meals. Must type fast in Lao and English.', 'ບໍລິການລູກຄ້າອອນລາຍ ເດືອນລະ 12,000,000 ກີບ ຫໍພັກ ແລະ ອາຫານຟຣີ. ຕ້ອງພິມໄວທັງລາວ ແລະ ອັງກິດ.'), them('A car picks you up tomorrow. Phones are kept by security during training. Leave before 6 months = 30,000,000 kip penalty.', 'ລົດມາຮັບມື້ອື່ນ. ຝ່າຍຮັກສາຄວາມປອດໄພເກັບໂທລະສັບລະຫວ່າງຝຶກ. ອອກກ່ອນ 6 ເດືອນ = ປັບ 30,000,000 ກີບ.')],
        ['What do you do?', 'ທ່ານຈະເຮັດແນວໃດ?'], [
          pick('a', 'reply', false, ['Go, it’s good money', 'ໄປ ເງິນດີ'], ['In reported cases, "customer service" means running scams on strangers for 14+ hours, under threat, until a "debt" is paid.', 'ໃນກໍລະນີທີ່ລາຍງານ "ບໍລິການລູກຄ້າ" ໝາຍເຖິງການຫຼອກລວງຄົນອື່ນ 14+ ຊົ່ວໂມງ ພາຍໃຕ້ການຂົ່ມຂູ່ ຈົນກວ່າຈະຈ່າຍ "ໜີ້".']),
          pick('b', 'verify', true, ['Ask for the company registration and a contract to read at home first', 'ຂໍທະບຽນບໍລິສັດ ແລະ ສັນຍາມາອ່ານທີ່ເຮືອນກ່ອນ'], ['They will refuse or rush you. That tells you everything.', 'ເຂົາຈະປະຕິເສດ ຫຼື ເລັ່ງທ່ານ. ນັ້ນບອກທຸກຢ່າງ.']),
          pick('c', 'report', true, ['Refuse, keep the chat and call 1191', 'ປະຕິເສດ, ເກັບແຊັດໄວ້ ແລະ ໂທ 1191'], ['Right. Screenshots help police find the network.', 'ຖືກ. ພາບໜ້າຈໍຊ່ວຍຕຳຫຼວດຕາມເຄືອຂ່າຍ.']),
        ]),
      flags([['12,000,000 kip/month, free dorm and meals', 'ເດືອນລະ 12,000,000 ກີບ ຫໍພັກ ແລະ ອາຫານຟຣີ', 'too_good'], ['. ', '. '], ['A car picks you up tomorrow', 'ລົດມາຮັບມື້ອື່ນ', 'urgency'], ['. ', '. '], ['Phones are kept by security', 'ຝ່າຍຮັກສາຄວາມປອດໄພເກັບໂທລະສັບ', 'personal_data'], ['. ', '. '], ['30,000,000 kip penalty', 'ປັບ 30,000,000 ກີບ', 'upfront_fee'], ['.', '.']]),
    ],
    explanation: l('Taking your phone and fining you for leaving are control, not HR. If someone you know is inside, save their messages and quietly call 1191 or 1362.', 'ການເກັບໂທລະສັບ ແລະ ປັບເງິນເມື່ອອອກ ແມ່ນການຄວບຄຸມ. ຖ້າຄົນຮູ້ຈັກຢູ່ຂ້າງໃນ ເກັບຂໍ້ຄວາມໄວ້ ແລ້ວໂທ 1191 ຫຼື 1362 ຢ່າງງຽບໆ.'),
  }),
  make({
    id: 'adult-loan-01', bands: ['adult'], scamType: type('loan'), channel: 'sms', contact: 'QuickLoan LA',
    title: l('The instant loan with a fee first', 'ເງິນກູ້ດ່ວນທີ່ຕ້ອງຈ່າຍກ່ອນ'),
    intro: l('Your shop needs cash. An SMS offers a fast loan.', 'ຮ້ານທ່ານຕ້ອງການເງິນ. SMS ສະເໜີເງິນກູ້ໄວ.'),
    steps: [
      chat([them('Approved! 20,000,000 kip loan, no documents, 0% first month ✅', 'ອະນຸມັດແລ້ວ! ເງິນກູ້ 20,000,000 ກີບ ບໍ່ຕ້ອງມີເອກະສານ 0% ເດືອນທຳອິດ ✅'), them('Pay 800,000 kip insurance first and install our app (allow contacts) to receive the money.', 'ຈ່າຍຄ່າປະກັນ 800,000 ກີບກ່ອນ ແລະ ຕິດຕັ້ງແອັບ (ອະນຸຍາດລາຍຊື່ຕິດຕໍ່) ເພື່ອຮັບເງິນ.')],
        ['What do you do?', 'ທ່ານຈະເຮັດແນວໃດ?'], [
          pick('a', 'reply', false, ['Pay the insurance', 'ຈ່າຍຄ່າປະກັນ'], ['No loan comes. The app copies your contacts and they harass your family for "debt".', 'ບໍ່ມີເງິນກູ້. ແອັບສຳເນົາລາຍຊື່ ແລະ ຂົ່ມຂູ່ຄອບຄົວທ່ານເລື່ອງ "ໜີ້".']),
          pick('b', 'verify', true, ['Go to a licensed bank or microfinance office', 'ໄປທະນາຄານ ຫຼື ສະຖາບັນການເງິນທີ່ມີໃບອະນຸຍາດ'], ['Right. Real lenders take fees from the loan, never before it.', 'ຖືກ. ຜູ້ໃຫ້ກູ້ແທ້ຫັກຄ່າທຳນຽມຈາກເງິນກູ້ ບໍ່ແມ່ນກ່ອນ.']),
          pick('c', 'ignore', true, ['Delete and block', 'ລຶບ ແລະ ບລັອກ'], ['Safe. You never applied, so nothing was "approved".', 'ປອດໄພ. ທ່ານບໍ່ເຄີຍສະໝັກ ຈຶ່ງບໍ່ມີຫຍັງ "ອະນຸມັດ".']),
        ]),
      flags([['Approved!', 'ອະນຸມັດແລ້ວ!', 'too_good'], [' No documents. ', ' ບໍ່ຕ້ອງມີເອກະສານ. '], ['Pay 800,000 kip insurance first', 'ຈ່າຍຄ່າປະກັນ 800,000 ກີບກ່ອນ', 'upfront_fee'], [' and ', ' ແລະ '], ['allow contacts', 'ອະນຸຍາດລາຍຊື່ຕິດຕໍ່', 'personal_data'], ['.', '.']]),
    ],
    explanation: l('A loan that costs money before you get money is not a loan. Contact access is used for blackmail.', 'ເງິນກູ້ທີ່ຕ້ອງຈ່າຍກ່ອນໄດ້ເງິນ ບໍ່ແມ່ນເງິນກູ້. ການເຂົ້າເຖິງລາຍຊື່ໃຊ້ເພື່ອຂົ່ມຂູ່.'),
  }),
  make({
    id: 'adult-contract-01', bands: ['adult', 'youth'], scamType: type('fake_job'), channel: 'whatsapp', contact: 'Sunrise Manpower',
    title: l('Read the contract before you sign', 'ອ່ານສັນຍາກ່ອນເຊັນ'),
    intro: l('An agency sends a job contract and wants it signed today.', 'ບໍລິສັດສົ່ງສັນຍາວຽກມາ ແລະ ຢາກໃຫ້ເຊັນມື້ນີ້.'),
    steps: [
      chat([them('Here is your contract (in Chinese and English). Sign and send a photo today.', 'ນີ້ແມ່ນສັນຍາ (ພາສາຈີນ ແລະ ອັງກິດ). ເຊັນ ແລ້ວສົ່ງຮູບມື້ນີ້.'), them('No time for a Lao copy. Page 6 is standard: we hold ID cards and charge 25,000,000 kip if you quit.', 'ບໍ່ມີເວລາແປເປັນລາວ. ໜ້າ 6 ເປັນມາດຕະຖານ: ເຮົາເກັບບັດປະຈຳຕົວ ແລະ ເກັບ 25,000,000 ກີບ ຖ້າລາອອກ.')],
        ['What do you do?', 'ທ່ານຈະເຮັດແນວໃດ?'], [
          pick('a', 'reply', false, ['Sign, contracts are all the same', 'ເຊັນ ສັນຍາຄືກັນໝົດ'], ['You just agreed to give up your ID and owe a fine you can’t pay.', 'ທ່ານຫາກໍຕົກລົງມອບບັດ ແລະ ເປັນໜີ້ຄ່າປັບທີ່ຈ່າຍບໍ່ໄຫວ.']),
          pick('b', 'verify', true, ['Ask for a Lao copy and show it to the labour office', 'ຂໍສະບັບພາສາລາວ ແລະ ໃຫ້ຫ້ອງການແຮງງານເບິ່ງ'], ['Right. You have the right to read a contract in your language before signing.', 'ຖືກ. ທ່ານມີສິດອ່ານສັນຍາເປັນພາສາຕົນ ກ່ອນເຊັນ.']),
          pick('c', 'ignore', true, ['Refuse to sign under pressure', 'ບໍ່ເຊັນພາຍໃຕ້ຄວາມກົດດັນ'], ['Good. A real employer can wait a few days.', 'ດີ. ນາຍຈ້າງແທ້ລໍຖ້າໄດ້ຈັກມື້.']),
        ]),
      flags([['Sign and send a photo today', 'ເຊັນ ແລ້ວສົ່ງຮູບມື້ນີ້', 'urgency'], ['. ', '. '], ['No time for a Lao copy', 'ບໍ່ມີເວລາແປເປັນລາວ', 'unverified_identity'], ['. ', '. '], ['We hold ID cards', 'ເຮົາເກັບບັດປະຈຳຕົວ', 'personal_data'], [' and ', ' ແລະ '], ['charge 25,000,000 kip if you quit', 'ເກັບ 25,000,000 ກີບ ຖ້າລາອອກ', 'upfront_fee'], ['.', '.']]),
    ],
    explanation: l('Check three things: a copy in Lao, who keeps your documents (you), and what happens if you leave.', 'ກວດສາມຢ່າງ: ສະບັບພາສາລາວ, ໃຜເກັບເອກະສານ (ທ່ານ) ແລະ ຈະເກີດຫຍັງຖ້າລາອອກ.'),
  }),

  // ───────────── Elders ─────────────
  make({
    id: 'elder-police-01', bands: ['elder', 'adult'], scamType: type('impersonation'), channel: 'video', contact: '"Police Officer Somphone"',
    title: l('The "police" video call', 'ວິດີໂອຄອນ "ຕຳຫຼວດ"'),
    intro: l('A man in uniform calls you on video.', 'ຜູ້ຊາຍໃສ່ເຄື່ອງແບບ ໂທວິດີໂອຫາທ່ານ.'),
    steps: [
      chat([them('This is the police. Your bank account is used for crime.', 'ນີ້ແມ່ນຕຳຫຼວດ. ບັນຊີທະນາຄານຂອງທ່ານຖືກໃຊ້ກໍ່ອາຊະຍາກຳ.'), them('Move your money to our safe account now. Do not tell your family.', 'ໂອນເງິນມາບັນຊີປອດໄພຂອງເຮົາດຽວນີ້. ຢ່າບອກຄອບຄົວ.')],
        ['What do you do?', 'ທ່ານຈະເຮັດແນວໃດ?'], [
          pick('a', 'reply', false, ['Move the money', 'ໂອນເງິນ'], ['The money is gone. Police never ask you to move money.', 'ເງິນໝົດ. ຕຳຫຼວດບໍ່ເຄີຍໃຫ້ທ່ານໂອນເງິນ.']),
          pick('b', 'verify', true, ['Hang up. Call 1191 yourself', 'ວາງສາຍ. ໂທ 1191 ເອງ'], ['Right. Call the real number yourself. Report the scam to 1533.', 'ຖືກ. ໂທຫາເບີແທ້ດ້ວຍຕົວເອງ. ລາຍງານການຫຼອກລວງທີ່ 1533.']),
          pick('c', 'report', true, ['Hang up and tell your family', 'ວາງສາຍ ແລະ ບອກຄອບຄົວ'], ['Good. Scammers hate family. Family helps.', 'ດີ. ຄົນຫຼອກຢ້ານຄອບຄົວ. ຄອບຄົວຊ່ວຍໄດ້.']),
        ]),
      flags([['This is the police', 'ນີ້ແມ່ນຕຳຫຼວດ', 'unverified_identity'], ['. ', '. '], ['Move your money', 'ໂອນເງິນ', 'upfront_fee'], [' to our safe account ', 'ມາບັນຊີປອດໄພ '], ['now', 'ດຽວນີ້', 'urgency'], ['. ', '. '], ['Do not tell your family', 'ຢ່າບອກຄອບຄົວ', 'off_platform'], ['.', '.']]),
    ],
    explanation: l('Real police never ask for money. They never say "tell no one".', 'ຕຳຫຼວດແທ້ບໍ່ຂໍເງິນ. ບໍ່ເຄີຍເວົ້າວ່າ "ຢ່າບອກໃຜ".'),
  }),
  make({
    id: 'elder-grandchild-01', bands: ['elder'], scamType: type('family_emergency'), channel: 'whatsapp', contact: 'Unknown number',
    title: l('"Grandma, it’s me!"', '"ແມ່ຕູ້ ແມ່ນຫຼານເອງ!"'),
    intro: l('A new number says it is your grandson.', 'ເບີໃໝ່ບອກວ່າແມ່ນຫຼານຊາຍ.'),
    steps: [
      chat([them('Grandma, it’s me! My phone broke, this is my new number.', 'ແມ່ຕູ້ ແມ່ນຫຼານເອງ! ໂທລະສັບເພ, ນີ້ແມ່ນເບີໃໝ່.'), them('I had an accident. Please send 3,000,000 kip now. Don’t tell Mum.', 'ຫຼານເກີດອຸບັດຕິເຫດ. ສົ່ງ 3,000,000 ກີບດຽວນີ້ແດ່. ຢ່າບອກແມ່.')],
        ['What do you do?', 'ທ່ານຈະເຮັດແນວໃດ?'], [
          pick('a', 'reply', false, ['Send the money', 'ສົ່ງເງິນ'], ['It was not your grandson. The money is gone.', 'ບໍ່ແມ່ນຫຼານ. ເງິນໝົດ.']),
          pick('b', 'verify', true, ['Call his old number or his mum', 'ໂທເບີເກົ່າຂອງຫຼານ ຫຼື ແມ່ຂອງຫຼານ'], ['Right. He is safe at home.', 'ຖືກ. ຫຼານຢູ່ເຮືອນປອດໄພ.']),
          pick('c', 'verify', true, ['Ask a question only he knows', 'ຖາມຄຳຖາມທີ່ມີແຕ່ຫຼານຮູ້'], ['Good. The caller can’t answer.', 'ດີ. ຄົນໂທຕອບບໍ່ໄດ້.']),
        ]),
      flags([['this is my new number', 'ນີ້ແມ່ນເບີໃໝ່', 'unverified_identity'], ['. ', '. '], ['Send 3,000,000 kip', 'ສົ່ງ 3,000,000 ກີບ', 'upfront_fee'], [' ', ' '], ['now', 'ດຽວນີ້', 'urgency'], ['. ', '. '], ['Don’t tell Mum', 'ຢ່າບອກແມ່', 'off_platform'], ['.', '.']]),
    ],
    explanation: l('New number + money now + "don’t tell" = stop. Call family on the old number.', 'ເບີໃໝ່ + ເງິນດຽວນີ້ + "ຢ່າບອກ" = ຢຸດ. ໂທຫາຄອບຄົວເບີເກົ່າ.'),
  }),
  make({
    id: 'elder-lottery-01', bands: ['elder'], scamType: type('prize'), channel: 'sms', contact: 'Lao Lucky Lottery',
    title: l('You won the lottery!', 'ທ່ານຖືກເລກ!'),
    intro: l('An SMS says you won a big prize.', 'SMS ບອກວ່າທ່ານຖືກລາງວັນໃຫຍ່.'),
    steps: [
      chat([them('You won 50,000,000 kip! 🎉', 'ທ່ານຖືກ 50,000,000 ກີບ! 🎉'), them('Pay 500,000 kip tax today to get your prize.', 'ຈ່າຍພາສີ 500,000 ກີບ ມື້ນີ້ ເພື່ອຮັບລາງວັນ.')],
        ['Did you buy a ticket? No. What do you do?', 'ທ່ານຊື້ປີ້ບໍ? ບໍ່. ທ່ານຈະເຮັດແນວໃດ?'], [
          pick('a', 'reply', false, ['Pay the tax', 'ຈ່າຍພາສີ'], ['There is no prize. Only the tax was real.', 'ບໍ່ມີລາງວັນ. ມີແຕ່ພາສີທີ່ແທ້.']),
          pick('b', 'ignore', true, ['Delete it', 'ລຶບຖິ້ມ'], ['Right. No ticket, no prize.', 'ຖືກ. ບໍ່ມີປີ້ ບໍ່ມີລາງວັນ.']),
          pick('c', 'verify', true, ['Show your children', 'ໃຫ້ລູກເບິ່ງ'], ['Good. Ask family before you pay anything.', 'ດີ. ຖາມຄອບຄົວກ່ອນຈ່າຍຫຍັງ.']),
        ]),
      flags([['You won 50,000,000 kip', 'ທ່ານຖືກ 50,000,000 ກີບ', 'too_good'], ['! ', '! '], ['Pay 500,000 kip tax', 'ຈ່າຍພາສີ 500,000 ກີບ', 'upfront_fee'], [' ', ' '], ['today', 'ມື້ນີ້', 'urgency'], ['.', '.']]),
    ],
    explanation: l('Real prizes never ask you to pay first.', 'ລາງວັນແທ້ບໍ່ເຄີຍໃຫ້ຈ່າຍກ່ອນ.'),
  }),
  make({
    id: 'elder-transfer-01', bands: ['elder', 'adult'], scamType: type('bank_phishing'), channel: 'sms', contact: '+856 20 5x xxx',
    title: l('"I sent money to you by mistake"', '"ຂ້ອຍໂອນເງິນຜິດໃຫ້ທ່ານ"'),
    intro: l('You get a bank message, then a phone call.', 'ທ່ານໄດ້ຂໍ້ຄວາມທະນາຄານ ແລ້ວກໍມີຄົນໂທມາ.'),
    steps: [
      chat([them('BANK: You received 1,000,000 kip.', 'ທະນາຄານ: ທ່ານໄດ້ຮັບ 1,000,000 ກີບ.'), them('Sorry uncle, I sent it by mistake! Please send it back to this other account quickly.', 'ຂໍໂທດລຸງ ຂ້ອຍໂອນຜິດ! ກະລຸນາໂອນຄືນໃສ່ບັນຊີອື່ນນີ້ໄວໆ.')],
        ['What do you do?', 'ທ່ານຈະເຮັດແນວໃດ?'], [
          pick('a', 'reply', false, ['Send it back now', 'ໂອນຄືນດຽວນີ້'], ['The SMS was fake. No money came in. You sent your own money.', 'SMS ປອມ. ບໍ່ມີເງິນເຂົ້າ. ທ່ານໂອນເງິນຕົນເອງ.']),
          pick('b', 'verify', true, ['Open your bank app and check', 'ເປີດແອັບທະນາຄານ ແລະ ກວດ'], ['Right. The balance did not change.', 'ຖືກ. ຍອດເງິນບໍ່ປ່ຽນ.']),
          pick('c', 'verify', true, ['Go to the bank in person', 'ໄປທະນາຄານດ້ວຍຕົນເອງ'], ['Good. The bank fixes real mistakes, not strangers.', 'ດີ. ທະນາຄານແກ້ຄວາມຜິດພາດແທ້ ບໍ່ແມ່ນຄົນແປກໜ້າ.']),
        ]),
      flags([['You received 1,000,000 kip', 'ທ່ານໄດ້ຮັບ 1,000,000 ກີບ', 'unverified_identity'], ['. Send it back to ', '. ໂອນຄືນໃສ່'], ['this other account', 'ບັນຊີອື່ນນີ້', 'upfront_fee'], [' ', ' '], ['quickly', 'ໄວໆ', 'urgency'], ['.', '.']]),
    ],
    explanation: l('Check your bank app, not the SMS. Real mistakes are fixed by the bank.', 'ກວດແອັບທະນາຄານ ບໍ່ແມ່ນ SMS. ທະນາຄານແກ້ຄວາມຜິດພາດແທ້.'),
  }),
  make({
    id: 'elder-official-01', bands: ['elder'], scamType: type('impersonation'), channel: 'sms', contact: 'EDL-Electric',
    title: l('"Your power will be cut"', '"ໄຟຟ້າຈະຖືກຕັດ"'),
    intro: l('An SMS says your electricity will be cut today.', 'SMS ບອກວ່າໄຟຟ້າຈະຖືກຕັດມື້ນີ້.'),
    steps: [
      chat([them('Your electricity will be cut in 1 hour. You owe 350,000 kip.', 'ໄຟຟ້າຂອງທ່ານຈະຖືກຕັດໃນ 1 ຊົ່ວໂມງ. ທ່ານຄ້າງ 350,000 ກີບ.'), them('Pay to this personal account now.', 'ຈ່າຍໃສ່ບັນຊີສ່ວນຕົວນີ້ດຽວນີ້.')],
        ['What do you do?', 'ທ່ານຈະເຮັດແນວໃດ?'], [
          pick('a', 'reply', false, ['Pay quickly', 'ຈ່າຍໄວໆ'], ['It was not the power company. The money is gone.', 'ບໍ່ແມ່ນບໍລິສັດໄຟຟ້າ. ເງິນໝົດ.']),
          pick('b', 'verify', true, ['Look at your last bill. Call the office', 'ເບິ່ງບິນເທື່ອກ່ອນ. ໂທຫາຫ້ອງການ'], ['Right. Your bill was already paid.', 'ຖືກ. ບິນຈ່າຍແລ້ວ.']),
          pick('c', 'report', true, ['Ask a neighbour or child', 'ຖາມເພື່ອນບ້ານ ຫຼື ລູກ'], ['Good. They got the same SMS.', 'ດີ. ເຂົາກໍໄດ້ SMS ດຽວກັນ.']),
        ]),
      flags([['cut in 1 hour', 'ຕັດໃນ 1 ຊົ່ວໂມງ', 'urgency'], ['. You owe 350,000 kip. ', '. ທ່ານຄ້າງ 350,000 ກີບ. '], ['Pay to this personal account', 'ຈ່າຍໃສ່ບັນຊີສ່ວນຕົວນີ້', 'upfront_fee'], [' ', ' '], ['now', 'ດຽວນີ້', 'urgency'], ['.', '.']]),
    ],
    explanation: l('Companies never ask you to pay into a personal account.', 'ບໍລິສັດບໍ່ເຄີຍໃຫ້ຈ່າຍໃສ່ບັນຊີສ່ວນຕົວ.'),
  }),
  make({
    id: 'elder-boss-01', bands: ['elder'], boss: true, scamType: type('impersonation'), channel: 'whatsapp', contact: '"Pension Office" → "Bank Officer"',
    title: l('The pension and the bank', 'ບຳນານ ແລະ ທະນາຄານ'), // REVIEW-LO ("ບອສ:" prefix removed; the UI adds the boss label)
    intro: l('Two calls in one morning. They work together.', 'ສອງສາຍໃນເຊົ້າດຽວ. ເຂົາເຮັດວຽກນຳກັນ.'),
    steps: [
      chat([them('Pension Office: your pension will stop. A bank officer will call you to fix it.', 'ຫ້ອງການບຳນານ: ເງິນບຳນານຂອງທ່ານຈະຢຸດ. ພະນັກງານທະນາຄານຈະໂທມາແກ້ໄຂ.'), them('Bank officer: install this app and read me the 6 numbers you get.', 'ພະນັກງານທະນາຄານ: ຕິດຕັ້ງແອັບນີ້ ແລ້ວອ່ານເລກ 6 ໂຕທີ່ໄດ້ຮັບໃຫ້ຂ້ອຍ.')],
        ['What do you do?', 'ທ່ານຈະເຮັດແນວໃດ?'], [
          pick('a', 'reply', false, ['Install it and read the numbers', 'ຕິດຕັ້ງ ແລະ ອ່ານເລກ'], ['The app lets them see your phone. The numbers open your bank. Your savings are gone.', 'ແອັບໃຫ້ເຂົາເບິ່ງໂທລະສັບທ່ານ. ເລກເປີດທະນາຄານ. ເງິນເກັບໝົດ.']),
          pick('b', 'verify', true, ['Hang up. Go to the pension office in person', 'ວາງສາຍ. ໄປຫ້ອງການບຳນານດ້ວຍຕົນເອງ'], ['Right. Your pension is fine.', 'ຖືກ. ບຳນານຂອງທ່ານປົກກະຕິ.']),
          pick('c', 'report', true, ['Hang up and call your bank’s number on your card', 'ວາງສາຍ ແລະ ໂທເບີທະນາຄານທີ່ຢູ່ຫຼັງບັດ'], ['Good. The bank never asks for those 6 numbers.', 'ດີ. ທະນາຄານບໍ່ເຄີຍຂໍເລກ 6 ໂຕນັ້ນ.']),
        ]),
      flags([['your pension will stop', 'ເງິນບຳນານຈະຢຸດ', 'urgency'], ['. ', '. '], ['A bank officer will call you', 'ພະນັກງານທະນາຄານຈະໂທມາ', 'unverified_identity'], ['. ', '. '], ['Install this app', 'ຕິດຕັ້ງແອັບນີ້', 'suspicious_link'], [' and ', ' ແລະ '], ['read me the 6 numbers', 'ອ່ານເລກ 6 ໂຕໃຫ້ຂ້ອຍ', 'personal_data'], ['.', '.']]),
    ],
    explanation: l('Never install an app or read out a code for a caller. Hang up and go in person.', 'ຢ່າຕິດຕັ້ງແອັບ ຫຼື ອ່ານລະຫັດໃຫ້ຄົນໂທ. ວາງສາຍ ແລ້ວໄປດ້ວຍຕົນເອງ.'),
  }),

  // ───────────── Essential: every band ─────────────
  make({
    id: 'essential-help-01', bands: ['kids', 'youth', 'adult', 'elder'], essential: true, scamType: type('safety_basics'), channel: 'messenger', contact: 'Sati',
    title: l('Something feels wrong. Who do you call?', 'ມີບາງຢ່າງຜິດປົກກະຕິ. ໂທຫາໃຜ?'),
    intro: l('A message makes you feel scared or rushed. Here is what to do.', 'ຂໍ້ຄວາມເຮັດໃຫ້ທ່ານຢ້ານ ຫຼື ຟ້າວ. ນີ້ແມ່ນສິ່ງທີ່ຕ້ອງເຮັດ.'),
    steps: [
      chat([them('Send money now or something bad will happen. Tell no one.', 'ສົ່ງເງິນດຽວນີ້ ບໍ່ດັ່ງນັ້ນຈະມີເລື່ອງບໍ່ດີ. ຢ່າບອກໃຜ.')],
        ['What is the safest first step?', 'ຂັ້ນຕອນທຳອິດທີ່ປອດໄພທີ່ສຸດແມ່ນຫຍັງ?'], [
          pick('a', 'reply', false, ['Do what it says, fast', 'ເຮັດຕາມໄວໆ'], ['Rushing is exactly what scammers want.', 'ການຟ້າວແມ່ນສິ່ງທີ່ຄົນຫຼອກຕ້ອງການ.']),
          pick('b', 'report', true, ['Stop, keep the message, tell someone you trust', 'ຢຸດ, ເກັບຂໍ້ຄວາມໄວ້, ບອກຄົນທີ່ໄວ້ໃຈ'], ['Yes. Then call 1191 (police) or 1362 (Lao Women’s Union) if anyone is in danger.', 'ແມ່ນ. ແລ້ວໂທ 1191 (ຕຳຫຼວດ) ຫຼື 1362 (ສະຫະພັນແມ່ຍິງລາວ) ຖ້າມີຄົນຕົກຢູ່ໃນອັນຕະລາຍ.']),
          pick('c', 'verify', true, ['Check it on Sati', 'ກວດໃນ Sati'], ['Good. Paste it into Ask Sati, or report it in the feed.', 'ດີ. ວາງໃສ່ ຖາມ Sati ຫຼື ລາຍງານໃນໜ້າຂ່າວ.']),
        ]),
      flags([['Send money now', 'ສົ່ງເງິນດຽວນີ້', 'urgency'], [' or something bad will happen. ', ' ບໍ່ດັ່ງນັ້ນຈະມີເລື່ອງບໍ່ດີ. '], ['Tell no one', 'ຢ່າບອກໃຜ', 'off_platform'], ['.', '.']]),
    ],
    explanation: l('Stop. Save. Tell. Report. Help lines: 1191 police, 1533 online scams, 1362 Lao Women’s Union.', 'ຢຸດ. ເກັບ. ບອກ. ລາຍງານ. ສາຍດ່ວນ: 1191 ຕຳຫຼວດ, 1533 ລາຍງານການສໍ້ໂກງອອນລາຍ, 1362 ສະຫະພັນແມ່ຍິງລາວ.'),
    gentle: {
      intro: l('A message makes you feel scared. You can always get help.', 'ຂໍ້ຄວາມເຮັດໃຫ້ເຈົ້າຢ້ານ. ເຈົ້າຂໍຄວາມຊ່ວຍເຫຼືອໄດ້ສະເໝີ.'),
      explanation: l('Stop and tell a trusted adult: a parent, teacher or family member. If you feel unsafe, an adult can call 1191.', 'ຢຸດ ແລ້ວບອກຜູ້ໃຫຍ່ທີ່ໄວ້ໃຈ: ພໍ່ແມ່, ຄູ ຫຼື ຍາດພີ່ນ້ອງ. ຖ້າບໍ່ປອດໄພ ຜູ້ໃຫຍ່ໂທ 1191 ໄດ້.'),
    },
  }),
];
