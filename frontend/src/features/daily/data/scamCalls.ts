import { BookUser, CalendarCheck, KeyRound, Lock, Siren, Timer, VenetianMask, Wallet, ShieldCheck, type LucideIcon } from 'lucide-react';
import type { FlagCategory, L10n } from '../types';

// "Souk's Day": Souk runs a noodle stall in Vientiane. Each play picks one call per time slot,
// real or scam at random, so the pattern never repeats. Lao strings are drafts (needsNativeReview).

export type Move = 'trust' | 'check' | 'hangup';
// Voice-over style per caller. `who` picks the voice (see VOICES in scripts/gen-call-voices.mjs);
// rate is a % change in speed, pitch a Hz shift. Scammers run fast and pushy, real callers calm.
export type Voice = { who: 'man' | 'woman'; rate: number; pitch: number };
export type Sign = { id: string; icon: LucideIcon; good?: boolean; name: L10n; body: L10n };
export type Call = {
  id: string; real: boolean; voice: Voice; time: string; place: L10n; note: L10n;
  caller: L10n; number: string; saved: boolean; stake: number;
  lines: L10n[]; moves: Record<Move, L10n>; outcome: Record<Move, L10n>;
  signs: string[]; flags: FlagCategory[]; remember: L10n;
};

export const START_BALANCE = 4_000_000;
export const HERO = { name: { en: 'Souk', lo: 'ສຸກ' }, age: 34, avatar: { skin: 1, hair: 2, outfit: 4, extra: 0 } };

export const SIGNS: Sign[] = [
  { id: 'mask', icon: VenetianMask, name: { en: 'Borrowed uniform', lo: 'ຢືມເຄື່ອງແບບ' },
    body: { en: 'They claim a title you respect: bank, police, office. A title on the phone proves nothing.', lo: 'ອ້າງຕຳແໜ່ງທີ່ທ່ານເຄົາລົບ: ທະນາຄານ, ຕຳຫຼວດ. ຕຳແໜ່ງທາງໂທລະສັບພິສູດຫຍັງບໍ່ໄດ້.' } },
  { id: 'clock', icon: Timer, name: { en: 'Countdown', lo: 'ນັບຖອຍຫຼັງ' },
    body: { en: 'A made-up deadline leaves no time to think or ask anyone.', lo: 'ເສັ້ນຕາຍປອມ ເຮັດໃຫ້ບໍ່ມີເວລາຄິດ ຫຼື ຖາມໃຜ.' } },
  { id: 'hush', icon: Lock, name: { en: 'Keep it quiet', lo: 'ຢ່າບອກໃຜ' },
    body: { en: 'Being told not to tell family is the clearest warning there is.', lo: 'ການຖືກບອກວ່າຢ່າບອກຄອບຄົວ ແມ່ນສັນຍານເຕືອນທີ່ຊັດທີ່ສຸດ.' } },
  { id: 'scare', icon: Siren, name: { en: 'Panic button', lo: 'ປຸ່ມຕົກໃຈ' },
    body: { en: 'Arrest, cut-off, accident: fear switches off careful thinking.', lo: 'ຖືກຈັບ, ຕັດໄຟ, ອຸບັດຕິເຫດ: ຄວາມຢ້ານເຮັດໃຫ້ຄິດບໍ່ທັນ.' } },
  { id: 'code', icon: KeyRound, name: { en: 'Asks for the key', lo: 'ຂໍກະແຈ' },
    body: { en: 'An OTP or PIN is the key to your money. Nobody real needs it.', lo: 'OTP ຫຼື PIN ແມ່ນກະແຈເງິນຂອງທ່ານ. ຄົນແທ້ບໍ່ຕ້ອງການ.' } },
  { id: 'pay', icon: Wallet, name: { en: 'Pay a stranger', lo: 'ຈ່າຍໃຫ້ຄົນແປກໜ້າ' },
    body: { en: 'Money to a personal account or a link, not to the office you know.', lo: 'ເງິນເຂົ້າບັນຊີສ່ວນຕົວ ຫຼື ລິ້ງ ບໍ່ແມ່ນຫ້ອງການທີ່ຮູ້ຈັກ.' } },
  { id: 'match', icon: CalendarCheck, good: true, name: { en: 'Matches your day', lo: 'ກົງກັບມື້ຂອງທ່ານ' },
    body: { en: 'It fits something you really did or expected.', lo: 'ກົງກັບສິ່ງທີ່ທ່ານເຮັດ ຫຼື ລໍຖ້າແທ້.' } },
  { id: 'nothing', icon: ShieldCheck, good: true, name: { en: 'Nothing secret asked', lo: 'ບໍ່ຂໍຂໍ້ມູນລັບ' },
    body: { en: 'No code, no password, no transfer to a stranger.', lo: 'ບໍ່ຂໍລະຫັດ, ລະຫັດຜ່ານ, ບໍ່ໃຫ້ໂອນໃຫ້ຄົນແປກໜ້າ.' } },
  { id: 'known', icon: BookUser, good: true, name: { en: 'Known contact', lo: 'ເບີທີ່ຮູ້ຈັກ' },
    body: { en: 'A number you saved yourself, or one printed on your card.', lo: 'ເບີທີ່ທ່ານບັນທຶກເອງ ຫຼື ເບີທີ່ພິມຢູ່ບັດ.' } },
];

const l = (en: string, lo: string): L10n => ({ en, lo });

// Each slot holds one real call and one scam; a play takes one of each slot.
export const SLOTS: Call[][] = [
  [
    { id: 'courier', real: true, voice: { who: 'man', rate: 4, pitch: 0 }, time: '07:30', place: l('Opening the stall', 'ເປີດຮ້ານ'), stake: 0,
      note: l('Souk ordered a gas burner online on Monday. Cash on delivery, 280,000 kip.', 'ສຸກສັ່ງເຕົາແກັສທາງອອນລາຍວັນຈັນ. ຈ່າຍປາຍທາງ 280,000 ກີບ.'),
      caller: l('Unknown number', 'ເບີບໍ່ຮູ້ຈັກ'), number: '+856 20 55•• 1902', saved: false,
      lines: [
        l("Morning! Delivery rider here. I've got a gas burner for Souk.", 'ສະບາຍດີ! ຄົນສົ່ງເຄື່ອງ. ມີເຕົາແກັສສົ່ງໃຫ້ສຸກ.'),
        l("I'm parked by the blue gate. It's 280,000 kip cash on delivery.", 'ຈອດຢູ່ປະຕູສີຟ້າ. 280,000 ກີບ ຈ່າຍປາຍທາງ.'),
        l('You can open the box and check it before you pay.', 'ເປີດກ່ອງກວດກ່ອນຈ່າຍໄດ້ເດີ້.'),
      ],
      moves: { trust: l('Go out, check the box, pay', 'ອອກໄປກວດກ່ອງ ແລ້ວຈ່າຍ'), check: l('Check the order in the app first', 'ກວດຄຳສັ່ງຊື້ໃນແອັບກ່ອນ'), hangup: l('Hang up, it is a stranger', 'ວາງສາຍ ຄົນແປກໜ້າ') },
      outcome: {
        trust: l('The burner arrives, Souk checks it, pays in person. Lunch service is saved.', 'ໄດ້ເຕົາ ກວດແລ້ວຈ່າຍກັບມື. ທັນຂາຍຕອນທ່ຽງ.'),
        check: l('The app shows "out for delivery". Souk goes out and pays. Careful and still on time.', 'ແອັບສະແດງ "ກຳລັງສົ່ງ". ອອກໄປຈ່າຍ. ລະວັງ ແລະ ທັນເວລາ.'),
        hangup: l('The rider leaves. The burner goes back to the depot and Souk cooks on one stove all day.', 'ຄົນສົ່ງໜີໄປ. ເຕົາກັບຄືນສາງ ສຸກຕ້ອງໃຊ້ເຕົາດຽວໝົດມື້.'),
      },
      signs: ['match', 'nothing'], flags: [],
      remember: l('An unknown number is not a scam by itself. It matched a real order, and Souk could see the box before paying.', 'ເບີແປກບໍ່ແມ່ນການຫຼອກສະເໝີ. ກົງກັບຄຳສັ່ງຊື້ແທ້ ແລະ ເຫັນກ່ອງກ່ອນຈ່າຍ.') },
    { id: 'customs', real: false, voice: { who: 'woman', rate: 12, pitch: -4 }, time: '07:30', place: l('Opening the stall', 'ເປີດຮ້ານ'), stake: 150_000,
      note: l('Souk has not ordered anything this month.', 'ເດືອນນີ້ສຸກບໍ່ໄດ້ສັ່ງຫຍັງ.'),
      caller: l('Express Parcel Centre', 'ສູນພັດສະດຸດ່ວນ'), number: '+856 30 92•• 4410', saved: false,
      lines: [
        l('Hello, your international parcel is held at customs.', 'ສະບາຍດີ, ພັດສະດຸຕ່າງປະເທດຂອງທ່ານຖືກກັກຢູ່ພາສີ.'),
        l('A tax of 150,000 kip must be paid today or it is destroyed.', 'ຕ້ອງຈ່າຍພາສີ 150,000 ກີບມື້ນີ້ ບໍ່ດັ່ງນັ້ນຈະຖືກທຳລາຍ.'),
        l("I'll text you a payment link. Enter your card number there.", 'ຈະສົ່ງລິ້ງຈ່າຍເງິນທາງ SMS. ໃສ່ເລກບັດຢູ່ນັ້ນ.'),
      ],
      moves: { trust: l('Pay the link, just in case', 'ຈ່າຍລິ້ງໄວ້ກ່ອນ'), check: l('Ask: "What is inside and who sent it?"', 'ຖາມ: "ຂ້າງໃນມີຫຍັງ ແລະ ໃຜສົ່ງ?"'), hangup: l('Hang up, no parcel expected', 'ວາງສາຍ ບໍ່ໄດ້ລໍພັດສະດຸ') },
      outcome: {
        trust: l('The link was fake. 150,000 kip is gone and the card number is now for sale.', 'ລິ້ງປອມ. ເສຍ 150,000 ກີບ ແລະ ເລກບັດຖືກຂາຍ.'),
        check: l('The caller cannot say what is inside, then hangs up. There was never a parcel.', 'ຜູ້ໂທບອກບໍ່ໄດ້ວ່າຂ້າງໃນມີຫຍັງ ແລ້ວວາງສາຍ. ບໍ່ມີພັດສະດຸແທ້.'),
        hangup: l('Souk had ordered nothing, so there was nothing to lose by hanging up.', 'ສຸກບໍ່ໄດ້ສັ່ງຫຍັງ ວາງສາຍກໍ່ບໍ່ເສຍຫຍັງ.'),
      },
      signs: ['mask', 'clock', 'pay'], flags: ['upfront_fee', 'urgency', 'suspicious_link'],
      remember: l('A parcel you never ordered plus a fee by link is a classic trap. Customs never asks for card numbers by phone.', 'ພັດສະດຸທີ່ບໍ່ໄດ້ສັ່ງ ບວກຄ່າທຳນຽມທາງລິ້ງ ແມ່ນກັບດັກ. ພາສີບໍ່ຂໍເລກບັດທາງໂທລະສັບ.') },
  ],
  [
    { id: 'branch', real: true, voice: { who: 'woman', rate: -6, pitch: 0 }, time: '10:00', place: l('Morning rush', 'ຊ່ວງເຊົ້າຄົນຫຼາຍ'), stake: 0,
      note: l('Last week Souk reported her bank card lost. The number on the back of her old card ends in 1500.', 'ອາທິດແລ້ວສຸກແຈ້ງບັດທະນາຄານເສຍ. ເບີຫຼັງບັດລົງທ້າຍ 1500.'),
      caller: l('Mekong Bank (card hotline)', 'ທະນາຄານແມ່ຂອງ (ສາຍບັດ)'), number: '1500', saved: false,
      lines: [
        l('Good morning, this is Mekong Bank. Your replacement card is ready.', 'ສະບາຍດີ, ທະນາຄານແມ່ຂອງ. ບັດໃໝ່ຂອງທ່ານພ້ອມແລ້ວ.'),
        l('Please collect it at the Thatluang branch with your ID card.', 'ກະລຸນາມາຮັບທີ່ສາຂາທາດຫຼວງ ພ້ອມບັດປະຈຳຕົວ.'),
        l('We will never ask for your PIN or a code on the phone.', 'ພວກເຮົາບໍ່ເຄີຍຂໍ PIN ຫຼື ລະຫັດທາງໂທລະສັບ.'),
      ],
      moves: { trust: l('Note it, go to the branch later', 'ຈົດໄວ້ ໄປສາຂາພາຍຫຼັງ'), check: l('Hang up, call 1500 back to confirm', 'ວາງສາຍ ໂທກັບ 1500 ເພື່ອຢືນຢັນ'), hangup: l('Hang up and ignore it', 'ວາງສາຍ ແລະ ບໍ່ສົນໃຈ') },
      outcome: {
        trust: l('Souk picks up her new card that afternoon. Nothing was asked on the phone.', 'ສຸກໄປຮັບບັດໃໝ່ຕອນບ່າຍ. ທາງໂທລະສັບບໍ່ໄດ້ຂໍຫຍັງ.'),
        check: l('The hotline confirms the card is waiting. Calling back is never wrong.', 'ສາຍດ່ວນຢືນຢັນວ່າບັດລໍຢູ່. ການໂທກັບບໍ່ເຄີຍຜິດ.'),
        hangup: l('The card sits at the branch for weeks. Souk cannot take card payments.', 'ບັດຄ້າງຢູ່ສາຂາຫຼາຍອາທິດ. ສຸກຮັບຈ່າຍດ້ວຍບັດບໍ່ໄດ້.'),
      },
      signs: ['match', 'nothing', 'known'], flags: [],
      remember: l('A real bank sends you to the branch and asks for nothing secret. Calling the number on your card is always safe.', 'ທະນາຄານແທ້ໃຫ້ໄປສາຂາ ແລະ ບໍ່ຂໍຂໍ້ມູນລັບ. ໂທເບີຫຼັງບັດປອດໄພສະເໝີ.') },
    { id: 'otp', real: false, voice: { who: 'man', rate: 18, pitch: -4 }, time: '10:00', place: l('Morning rush', 'ຊ່ວງເຊົ້າຄົນຫຼາຍ'), stake: 1_200_000,
      note: l("Souk's card works fine. She paid her supplier with it yesterday.", 'ບັດຂອງສຸກໃຊ້ໄດ້ປົກກະຕິ. ມື້ວານຫາກໍ່ຈ່າຍຜູ້ສະໜອງ.'),
      caller: l('Mekong Bank Security', 'ຄວາມປອດໄພທະນາຄານແມ່ຂອງ'), number: '+856 20 77•• 8123', saved: false,
      lines: [
        l("This is your bank's security desk. A 1,200,000 kip transfer is leaving your account.", 'ນີ້ແມ່ນຝ່າຍຄວາມປອດໄພ. ມີການໂອນ 1,200,000 ກີບ ອອກຈາກບັນຊີທ່ານ.'),
        l("To cancel it I'm sending a code to your phone. Read it to me.", 'ເພື່ອຍົກເລີກ ຂ້ອຍຈະສົ່ງລະຫັດ. ອ່ານໃຫ້ຂ້ອຍຟັງ.'),
        l('Hurry, it completes in 60 seconds. Do not hang up.', 'ໄວໆ ອີກ 60 ວິນາທີຈະສຳເລັດ. ຢ່າວາງສາຍ.'),
      ],
      moves: { trust: l('Read out the code', 'ອ່ານລະຫັດໃຫ້'), check: l('Hang up, call the number on the card', 'ວາງສາຍ ໂທເບີຫຼັງບັດ'), hangup: l('Hang up', 'ວາງສາຍ') },
      outcome: {
        trust: l('The code approved the transfer, not the cancel. 1,200,000 kip is gone.', 'ລະຫັດອະນຸມັດການໂອນ ບໍ່ແມ່ນຍົກເລີກ. ເສຍ 1,200,000 ກີບ.'),
        check: l('The real bank says no transfer was ever started. Souk reports the number.', 'ທະນາຄານແທ້ບອກວ່າບໍ່ມີການໂອນ. ສຸກແຈ້ງເບີນັ້ນ.'),
        hangup: l('Hanging up stopped the trick. The money never moved.', 'ການວາງສາຍຢຸດກົນໄດ້. ເງິນບໍ່ໄດ້ໄປໃສ.'),
      },
      signs: ['mask', 'code', 'clock'], flags: ['unverified_identity', 'personal_data', 'urgency'],
      remember: l('The code a "bank" asks you to read out is the one that lets them take the money.', 'ລະຫັດທີ່ "ທະນາຄານ" ຂໍໃຫ້ອ່ານ ແມ່ນລະຫັດທີ່ໃຫ້ເຂົາເອົາເງິນໄປ.') },
  ],
  [
    { id: 'teacher', real: true, voice: { who: 'woman', rate: -8, pitch: 4 }, time: '13:00', place: l('Lunch service', 'ຊ່ວງຂາຍທ່ຽງ'), stake: 0,
      note: l("Souk's daughter Mai, 10, said she had a sore throat this morning.", 'ລູກສາວມາຍ 10 ປີ ບອກວ່າເຈັບຄໍຕອນເຊົ້າ.'),
      caller: l('Teacher Vanh', 'ອາຈານວັນ'), number: '+856 20 22•• 6071', saved: true,
      lines: [
        l("Souk, it's Teacher Vanh. Mai has a fever, she's resting in the office.", 'ສຸກ, ອາຈານວັນເດີ້. ມາຍເປັນໄຂ້ ພັກຢູ່ຫ້ອງການ.'),
        l('Can you or someone in the family come and pick her up?', 'ເຈົ້າ ຫຼື ຄົນໃນຄອບຄົວມາຮັບລາວໄດ້ບໍ່?'),
        l("She's fine, just tired. No rush, come when you can.", 'ລາວບໍ່ເປັນຫຍັງ ພຽງແຕ່ເມື່ອຍ. ບໍ່ຟ້າວ ມາເວລາສະດວກ.'),
      ],
      moves: { trust: l('Close the stall, go get Mai', 'ປິດຮ້ານ ໄປຮັບມາຍ'), check: l('Call the school office to check', 'ໂທຫາຫ້ອງການໂຮງຮຽນກວດກ່ອນ'), hangup: l('Hang up, could be a trick', 'ວາງສາຍ ອາດແມ່ນກົນ') },
      outcome: {
        trust: l('Mai is waiting in the office with a cold towel. She is happy to see her mum.', 'ມາຍລໍຢູ່ຫ້ອງການ. ດີໃຈທີ່ເຫັນແມ່.'),
        check: l('The office confirms. Souk goes. A quick check costs one minute.', 'ຫ້ອງການຢືນຢັນ. ສຸກໄປ. ກວດໄວໆໃຊ້ເວລານາທີດຽວ.'),
        hangup: l('Mai waits all afternoon. Not every worrying call is a scam.', 'ມາຍລໍໝົດບ່າຍ. ບໍ່ແມ່ນທຸກສາຍທີ່ໜ້າເປັນຫ່ວງແມ່ນການຫຼອກ.'),
      },
      signs: ['known', 'match', 'nothing'], flags: [],
      remember: l('Worrying news alone is not a red flag. A saved contact, no money asked and no rush: that is a real call.', 'ຂ່າວໜ້າເປັນຫ່ວງ ບໍ່ແມ່ນສັນຍານອັນຕະລາຍສະເໝີ. ເບີບັນທຶກ ບໍ່ຂໍເງິນ ບໍ່ເລັ່ງ: ນັ້ນແມ່ນສາຍແທ້.') },
    { id: 'nephew', real: false, voice: { who: 'man', rate: 15, pitch: 12 }, time: '13:00', place: l('Lunch service', 'ຊ່ວງຂາຍທ່ຽງ'), stake: 800_000,
      note: l("Souk's nephew Bee studies in Udon Thani. His number is saved in her phone.", 'ຫຼານບີ ຮຽນຢູ່ອຸດອນ. ເບີລາວບັນທຶກໄວ້ໃນໂທລະສັບ.'),
      caller: l('New number', 'ເບີໃໝ່'), number: '+66 8• ••• 2304', saved: false,
      lines: [
        l("Aunty, it's me! My phone broke, this is a friend's number.", 'ນ້າ, ຂ້ອຍເອງ! ໂທລະສັບເພ ນີ້ເບີໝູ່.'),
        l('I crashed my motorbike. The clinic wants 800,000 kip before they treat me.', 'ລົດລົ້ມ. ຄລີນິກຂໍ 800,000 ກີບ ກ່ອນປິ່ນປົວ.'),
        l("Send it to my friend's account. Please don't tell Mum, she'll panic.", 'ໂອນເຂົ້າບັນຊີໝູ່. ຢ່າບອກແມ່ເດີ້ ລາວຈະຕົກໃຈ.'),
      ],
      moves: { trust: l('Send the money now', 'ໂອນເງິນດຽວນີ້'), check: l('Call Bee on his saved number', 'ໂທຫາບີທາງເບີທີ່ບັນທຶກ'), hangup: l('Hang up', 'ວາງສາຍ') },
      outcome: {
        trust: l("Bee was in class all along. 800,000 kip went to a stranger's account.", 'ບີຢູ່ໃນຫ້ອງຮຽນຕະຫຼອດ. 800,000 ກີບ ໄປບັນຊີຄົນແປກໜ້າ.'),
        check: l('Bee answers from class, confused. He is fine.', 'ບີຮັບສາຍຈາກຫ້ອງຮຽນ ງົງ. ລາວບໍ່ເປັນຫຍັງ.'),
        hangup: l('Safe. Souk later learns the same call hit three families on her street.', 'ປອດໄພ. ພາຍຫຼັງຮູ້ວ່າສາຍດຽວກັນໂທຫາສາມຄອບຄົວໃນຖະໜົນ.'),
      },
      signs: ['mask', 'scare', 'hush', 'pay'], flags: ['unverified_identity', 'upfront_fee', 'urgency'],
      remember: l('The caller never said his name, Souk did. Call family back on the number you already have.', 'ຜູ້ໂທບໍ່ໄດ້ບອກຊື່ ສຸກບອກເອງ. ໂທກັບຫາຄອບຄົວທາງເບີທີ່ມີ.') },
  ],
  [
    { id: 'supplier', real: true, voice: { who: 'man', rate: -5, pitch: -6 }, time: '16:00', place: l('Prepping for dinner', 'ກຽມຂາຍຕອນແລງ'), stake: 0,
      note: l('Mr. Vong delivers rice noodles every Tuesday. Souk always pays him cash at the door.', 'ທ້າວວົງສົ່ງເສັ້ນທຸກວັນອັງຄານ. ສຸກຈ່າຍເງິນສົດທີ່ໜ້າຮ້ານສະເໝີ.'),
      caller: l('Mr. Vong (noodles)', 'ທ້າວວົງ (ເສັ້ນ)'), number: '+856 20 58•• 3317', saved: true,
      lines: [
        l("Souk, Vong here. Truck's stuck in traffic at Khualuang.", 'ສຸກ, ວົງເດີ້. ລົດຕິດຢູ່ຂົວຫຼວງ.'),
        l("I'll be there about six instead of five. Same as always.", 'ຈະຮອດປະມານຫົກໂມງ ແທນຫ້າໂມງ. ຄືເກົ່າ.'),
        l('Pay me when I arrive, no change in price.', 'ຈ່າຍຕອນຮອດ ລາຄາຄືເກົ່າ.'),
      ],
      moves: { trust: l('OK, see you at six', 'ໂອເຄ ພົບກັນຫົກໂມງ'), check: l('Text Vong to confirm', 'ສົ່ງຂໍ້ຄວາມຫາວົງຢືນຢັນ'), hangup: l('Hang up', 'ວາງສາຍ') },
      outcome: {
        trust: l('Vong arrives at six. Dinner noodles are ready on time.', 'ວົງຮອດຫົກໂມງ. ເສັ້ນພ້ອມຂາຍແລງ.'),
        check: l('Vong replies with a thumbs-up. All good.', 'ວົງຕອບກັບວ່າໂອເຄ.'),
        hangup: l('Vong thinks Souk is upset and skips the stop. No noodles tonight.', 'ວົງຄິດວ່າສຸກໃຈຮ້າຍ ເລີຍບໍ່ແວ່. ແລງນີ້ບໍ່ມີເສັ້ນ.'),
      },
      signs: ['known', 'match', 'nothing'], flags: [],
      remember: l('Saved contact, usual routine, pay in person: everything matches. Trust is fine here.', 'ເບີບັນທຶກ ກິດຈະວັດປົກກະຕິ ຈ່າຍກັບມື: ກົງກັນໝົດ. ໄວ້ໃຈໄດ້.') },
    { id: 'supplier-fake', real: false, voice: { who: 'woman', rate: 8, pitch: 2 }, time: '16:00', place: l('Prepping for dinner', 'ກຽມຂາຍຕອນແລງ'), stake: 1_500_000,
      note: l('Mr. Vong delivers rice noodles every Tuesday. Souk always pays him cash at the door.', 'ທ້າວວົງສົ່ງເສັ້ນທຸກວັນອັງຄານ. ສຸກຈ່າຍເງິນສົດທີ່ໜ້າຮ້ານສະເໝີ.'),
      caller: l('Vong Noodles Accounts', 'ບັນຊີ ວົງເສັ້ນ'), number: '+856 20 91•• 0045', saved: false,
      lines: [
        l("Hello, I handle Mr. Vong's accounts now. He's busy driving.", 'ສະບາຍດີ, ຂ້ອຍດູແລບັນຊີໃຫ້ທ້າວວົງ. ລາວຂັບລົດຢູ່.'),
        l('From this month we only take bank transfer, paid in advance.', 'ແຕ່ເດືອນນີ້ ຮັບແຕ່ໂອນ ຈ່າຍລ່ວງໜ້າ.'),
        l("Send 1,500,000 kip for the month to this new account, or there's no delivery tonight.", 'ໂອນ 1,500,000 ກີບ ເຂົ້າບັນຊີໃໝ່ນີ້ ບໍ່ດັ່ງນັ້ນຄືນນີ້ບໍ່ສົ່ງ.'),
      ],
      moves: { trust: l('Transfer the month in advance', 'ໂອນລ່ວງໜ້າໝົດເດືອນ'), check: l("Call Vong on his saved number", 'ໂທຫາວົງທາງເບີທີ່ບັນທຶກ'), hangup: l('Hang up', 'ວາງສາຍ') },
      outcome: {
        trust: l("Vong never changed anything. 1,500,000 kip is gone and he still wants paying.", 'ວົງບໍ່ໄດ້ປ່ຽນຫຍັງ. ເສຍ 1,500,000 ກີບ ແລະ ຍັງຕ້ອງຈ່າຍວົງອີກ.'),
        check: l('Vong laughs: "No accountant, still cash!" Someone saw his name on the stall sign.', 'ວົງຫົວ: "ບໍ່ມີຄົນເຮັດບັນຊີ ເງິນສົດຄືເກົ່າ!" ມີຄົນເຫັນຊື່ລາວຢູ່ປ້າຍຮ້ານ.'),
        hangup: l('Safe, but the best move is calling Vong so he can warn his other customers.', 'ປອດໄພ ແຕ່ທາງທີ່ດີແມ່ນໂທຫາວົງ ເພື່ອລາວເຕືອນລູກຄ້າຄົນອື່ນ.'),
      },
      signs: ['mask', 'pay', 'clock'], flags: ['unverified_identity', 'upfront_fee', 'urgency'],
      remember: l('"New account number" calls hit small shops hard. Any payment change gets confirmed with the person you know.', 'ສາຍ "ປ່ຽນເລກບັນຊີ" ຫຼອກຮ້ານນ້ອຍຫຼາຍ. ການປ່ຽນການຈ່າຍ ຕ້ອງຢືນຢັນກັບຄົນທີ່ຮູ້ຈັກ.') },
  ],
  [
    { id: 'outage', real: true, voice: { who: 'man', rate: -6, pitch: -2 }, time: '19:30', place: l('Closing up', 'ປິດຮ້ານ'), stake: 0,
      note: l('A neighbour mentioned roadworks on the street this weekend.', 'ເພື່ອນບ້ານເວົ້າວ່າທ້າຍອາທິດນີ້ມີສ້ອມທາງ.'),
      caller: l('Electricity office', 'ຫ້ອງການໄຟຟ້າ'), number: '+856 21 •••• 900', saved: false,
      lines: [
        l('Good evening, this is the district electricity office.', 'ສະບາຍແລງ, ນີ້ແມ່ນຫ້ອງການໄຟຟ້າເມືອງ.'),
        l('Power on your street will be off this Sunday, 8 to 12, for roadworks.', 'ວັນອາທິດນີ້ 8 ຫາ 12 ໂມງ ຈະຕັດໄຟຖະໜົນທ່ານ ເພື່ອສ້ອມທາງ.'),
        l('Nothing to do or pay. Just plan your cooking around it.', 'ບໍ່ຕ້ອງເຮັດ ຫຼື ຈ່າຍຫຍັງ. ພຽງແຕ່ວາງແຜນເຮັດອາຫານ.'),
      ],
      moves: { trust: l('Thank them, plan for Sunday', 'ຂອບໃຈ ວາງແຜນວັນອາທິດ'), check: l('Check the notice board at the village office', 'ກວດປ້າຍແຈ້ງການຢູ່ຫ້ອງການບ້ານ'), hangup: l('Hang up', 'ວາງສາຍ') },
      outcome: {
        trust: l('Souk preps noodles on Saturday night. Sunday goes smoothly.', 'ສຸກກຽມເສັ້ນຄືນວັນເສົາ. ວັນອາທິດລຽບງ່າຍ.'),
        check: l('The notice is on the board. Souk is ready for Sunday.', 'ມີປ້າຍແຈ້ງການແທ້. ສຸກພ້ອມສຳລັບວັນອາທິດ.'),
        hangup: l('On Sunday the power goes off mid-breakfast and the broth goes cold.', 'ວັນອາທິດໄຟດັບກາງຊ່ວງເຊົ້າ ນ້ຳແກງເຢັນ.'),
      },
      signs: ['match', 'nothing'], flags: [],
      remember: l('Information only, nothing to pay, matches what the neighbour said: a real notice.', 'ແຈ້ງຂໍ້ມູນ ບໍ່ຕ້ອງຈ່າຍ ກົງກັບທີ່ເພື່ອນບ້ານເວົ້າ: ແຈ້ງການແທ້.') },
    { id: 'cutoff', real: false, voice: { who: 'man', rate: 14, pitch: -10 }, time: '19:30', place: l('Closing up', 'ປິດຮ້ານ'), stake: 650_000,
      note: l('Souk paid the electricity bill at the counter two weeks ago. She kept the receipt.', 'ສຸກຈ່າຍຄ່າໄຟທີ່ເຄົາເຕີສອງອາທິດກ່ອນ. ເກັບໃບຮັບເງິນໄວ້.'),
      caller: l('Electricity office', 'ຫ້ອງການໄຟຟ້າ'), number: '+856 20 99•• 7310', saved: false,
      lines: [
        l('Your electricity bill is three months overdue: 650,000 kip.', 'ຄ່າໄຟຂອງທ່ານຄ້າງສາມເດືອນ: 650,000 ກີບ.'),
        l('A team is coming to cut your power in one hour.', 'ອີກໜຶ່ງຊົ່ວໂມງທີມງານຈະມາຕັດໄຟ.'),
        l("Scan the QR I'm sending to pay my officer directly and stop the cut.", 'ສະແກນ QR ທີ່ສົ່ງໃຫ້ ຈ່າຍໃຫ້ພະນັກງານໂດຍກົງ ເພື່ອຢຸດການຕັດ.'),
      ],
      moves: { trust: l('Scan and pay to avoid the cut', 'ສະແກນຈ່າຍ ກັນຖືກຕັດ'), check: l('Find the receipt, call the office number on it', 'ຊອກໃບຮັບເງິນ ໂທເບີຫ້ອງການໃນໃບ'), hangup: l('Hang up', 'ວາງສາຍ') },
      outcome: {
        trust: l("The QR went to a personal account. 650,000 kip gone, and the bill was already paid.", 'QR ເປັນບັນຊີສ່ວນຕົວ. ເສຍ 650,000 ກີບ ທັງທີ່ຈ່າຍແລ້ວ.'),
        check: l('The office confirms the bill is paid and nobody is coming.', 'ຫ້ອງການຢືນຢັນວ່າຈ່າຍແລ້ວ ບໍ່ມີໃຜມາ.'),
        hangup: l('Nobody came. The lights stayed on.', 'ບໍ່ມີໃຜມາ. ໄຟຍັງຮຸ່ງ.'),
      },
      signs: ['mask', 'scare', 'clock', 'pay'], flags: ['unverified_identity', 'urgency', 'upfront_fee'],
      remember: l('Utilities send written notices and take payment at the counter or official app, never to "my officer".', 'ການໄຟຟ້າສົ່ງແຈ້ງການເປັນລາຍລັກອັກສອນ ຮັບເງິນທີ່ເຄົາເຕີ ຫຼື ແອັບທາງການ ບໍ່ແມ່ນ "ພະນັກງານຂ້ອຍ".') },
  ],
];

// One call per slot; reroll until the day has at least two of each, so neither answer is a safe bet.
export function planDay(): Call[] {
  for (;;) {
    const day = SLOTS.map(s => s[Math.random() < 0.5 ? 0 : 1]);
    const real = day.filter(c => c.real).length;
    if (real >= 2 && real <= 3) return day;
  }
}

export const CT = {
  en: {
    intro_title: "Souk's day", intro: "Souk runs a noodle stall near Talat Sao. Today her phone rings five times. Some calls are real, some are scams. You decide what she does.",
    intro_tip: 'Hanging up on everyone is not the answer either: real calls matter too.',
    start: 'Start the day', balance: 'Savings', knows: 'What Souk knows', answer: 'Answer',
    in_contacts: 'Saved contact', not_contacts: 'Not in contacts', listen: 'Listening…', decide: 'What does Souk do?',
    was_real: 'This call was real', was_scam: 'This call was a scam', good: 'Good call', careful: 'Careful and correct', missed: 'Too suspicious', lost: 'Lost',
    signs: 'Signs in this call', remember: 'Remember', next_call: 'Next call', finish: 'End the day', kip: 'kip',
    day_done: 'Day complete', calls_ok: 'calls handled well', no_voice: 'This phone has no voice for this language, so the call is shown as text.',
  },
  lo: {
    intro_title: 'ມື້ໜຶ່ງຂອງສຸກ', intro: 'ສຸກເປີດຮ້ານເຝີໃກ້ຕະຫຼາດເຊົ້າ. ມື້ນີ້ໂທລະສັບດັງຫ້າເທື່ອ. ບາງສາຍແທ້ ບາງສາຍຫຼອກ. ທ່ານຕັດສິນໃຈແທນລາວ.',
    intro_tip: 'ວາງສາຍທຸກຄົນກໍ່ບໍ່ແມ່ນຄຳຕອບ: ສາຍແທ້ກໍ່ສຳຄັນ.',
    start: 'ເລີ່ມມື້ໃໝ່', balance: 'ເງິນເກັບ', knows: 'ສິ່ງທີ່ສຸກຮູ້', answer: 'ຮັບສາຍ',
    in_contacts: 'ເບີທີ່ບັນທຶກ', not_contacts: 'ບໍ່ມີໃນລາຍຊື່', listen: 'ກຳລັງຟັງ…', decide: 'ສຸກຈະເຮັດແນວໃດ?',
    was_real: 'ສາຍນີ້ແມ່ນແທ້', was_scam: 'ສາຍນີ້ແມ່ນການຫຼອກ', good: 'ຕັດສິນໃຈດີ', careful: 'ລະວັງ ແລະ ຖືກຕ້ອງ', missed: 'ສົງໄສເກີນໄປ', lost: 'ເສຍ',
    signs: 'ສັນຍານໃນສາຍນີ້', remember: 'ຈື່ໄວ້', next_call: 'ສາຍຕໍ່ໄປ', finish: 'ຈົບມື້', kip: 'ກີບ',
    day_done: 'ຈົບມື້', calls_ok: 'ສາຍທີ່ຮັບມືໄດ້ດີ', no_voice: 'ໂທລະສັບນີ້ບໍ່ມີສຽງພາສາລາວ ຈຶ່ງສະແດງເປັນຂໍ້ຄວາມ.',
  },
};
