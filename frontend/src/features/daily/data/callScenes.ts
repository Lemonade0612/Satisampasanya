import type { FlagCategory, L10n } from '../types';
import type { Call, Day } from './scamCalls';

// The three illustrated Scam Call stories (scene photos in /public/games): Noy (17, at home), Dara (24, bus stop) and
// Auntie Suk (noodle shop). Each day has a scam call from the story, a real call and a second scam, so "decline" is not always right.
// Lao is a draft for native review (needsNativeReview). Add or edit calls here; no game code changes.
const l = (en: string, lo: string): L10n => ({ en, lo });
const scam = { who: 'woman', rate: 14, pitch: 4 } as const, real = { who: 'woman', rate: 2, pitch: 0 } as const, realMan = { who: 'man', rate: 2, pitch: 0 } as const, scamMan = { who: 'man', rate: 12, pitch: -3 } as const;
type Spec = { id: string; real: boolean; voice: Call['voice']; time: string; place: L10n; note: L10n; caller: L10n; number: string; saved: boolean; stake: number; lines: L10n[];
  trust: [L10n, L10n]; check: [L10n, L10n]; hangup: [L10n, L10n]; signs: string[]; flags: FlagCategory[]; remember: L10n };
const call = (s: Spec): Call => ({ id: s.id, real: s.real, voice: s.voice, time: s.time, place: s.place, note: s.note, caller: s.caller, number: s.number, saved: s.saved, stake: s.stake, lines: s.lines,
  moves: { trust: s.trust[0], check: s.check[0], hangup: s.hangup[0] }, outcome: { trust: s.trust[1], check: s.check[1], hangup: s.hangup[1] }, signs: s.signs, flags: s.flags, remember: s.remember });

const NOY: Call[] = [
  call({ id: 'sn-otp', real: false, voice: scam, time: '09:00', stake: 1_500_000, saved: false, number: '+66 2 ••• 1030', caller: l('Bank security team', 'ທີມຮັກສາຄວາມປອດໄພທະນາຄານ'),
    place: l('At home, phone on the desk', 'ຢູ່ເຮືອນ ໂທລະສັບຢູ່ເທິງໂຕະ'), note: l('A foreign number you do not know. Your bank never calls from abroad to ask for codes.', 'ເບີຕ່າງປະເທດທີ່ບໍ່ຮູ້ຈັກ. ທະນາຄານບໍ່ໂທມາຈາກຕ່າງປະເທດເພື່ອຂໍລະຫັດ.'),
    lines: [l('This is your bank security team. Someone is using your card right now.', 'ນີ້ແມ່ນທີມຮັກສາຄວາມປອດໄພຂອງທະນາຄານ. ມີຄົນກຳລັງໃຊ້ບັດຂອງເຈົ້າຢູ່ດຽວນີ້.'), l('To stop it, read me the 6-digit code we just sent to your phone.', 'ເພື່ອຢຸດ ອ່ານລະຫັດ 6 ຕົວທີ່ເຮົາຫາກໍສົ່ງເຂົ້າໂທລະສັບໃຫ້ຟັງແດ່.'), l('Quickly! You have two minutes before the account is emptied.', 'ໄວໆ! ເຈົ້າມີສອງນາທີກ່ອນບັນຊີຈະຖືກຖອນໝົດ.')],
    trust: [l('Read out the 6-digit code', 'ອ່ານລະຫັດ 6 ຕົວ'), l('The code was a payment code. Money leaves the account at once.', 'ລະຫັດນັ້ນແມ່ນລະຫັດຈ່າຍເງິນ. ເງິນອອກຈາກບັນຊີທັນທີ.')],
    check: [l('Hang up and call the number in my bank app', 'ວາງສາຍ ແລ້ວໂທເບີໃນແອັບທະນາຄານ'), l('The real bank says nothing is wrong. Safe and smart.', 'ທະນາຄານແທ້ບອກວ່າບໍ່ມີຫຍັງຜິດປົກກະຕິ. ປອດໄພ ແລະ ສະຫຼາດ.')],
    hangup: [l('Decline the call', 'ປະຕິເສດສາຍ'), l('Declining is safe. The scammer moves on to someone else.', 'ການປະຕິເສດປອດໄພ. ຄົນຫຼອກລວງໄປຫາຄົນອື່ນ.')],
    signs: ['mask', 'clock', 'code', 'scare'], flags: ['urgency', 'personal_data'], remember: l('Nobody real needs your OTP. Never read it out, not even to your bank.', 'ບໍ່ມີໃຜແທ້ຕ້ອງການ OTP ຂອງເຈົ້າ. ຢ່າອ່ານໃຫ້ໃຜ ແມ່ນແຕ່ທະນາຄານ.') }),
  call({ id: 'sn-teacher', real: true, voice: real, time: '11:00', stake: 0, saved: true, number: '+856 21 •• 7710', caller: l('Teacher Vanh', 'ຄູວັນ'),
    place: l('Doing homework', 'ເຮັດວຽກບ້ານ'), note: l('Teacher Vanh is saved in your contacts. You asked about the exam on Monday.', 'ຄູວັນຢູ່ໃນລາຍຊື່ຂອງເຈົ້າ. ເຈົ້າຖາມເລື່ອງສອບເສັງວັນຈັນ.'),
    lines: [l('Hello Noy, about your question: the exam is Monday at 8 in Room 4.', 'ສະບາຍດີນ້ອຍ, ເລື່ອງທີ່ຖາມ: ສອບເສັງວັນຈັນ 8 ໂມງ ຫ້ອງ 4.'), l('Bring a pen and your student card. No fee at all.', 'ເອົາປາກກາ ແລະ ບັດນັກຮຽນມາ. ບໍ່ມີຄ່າໃຊ້ຈ່າຍຫຍັງ.')],
    trust: [l('Thank the teacher and note it down', 'ຂອບໃຈຄູ ແລ້ວຈົດໄວ້'), l('Noy is on time and ready.', 'ນ້ອຍມາທັນເວລາ ແລະ ພ້ອມ.')],
    check: [l('Ask a classmate to confirm', 'ຖາມໝູ່ຮ່ວມຫ້ອງໃຫ້ຢືນຢັນ'), l('A classmate confirms. Careful, and still right.', 'ໝູ່ຢືນຢັນ. ລະວັງ ແລະ ຖືກຕ້ອງ.')],
    hangup: [l('Decline the call', 'ປະຕິເສດສາຍ'), l('Noy misses the exam details and has to ask again.', 'ນ້ອຍພາດລາຍລະອຽດສອບເສັງ ຕ້ອງຖາມໃໝ່.')],
    signs: ['known', 'match', 'nothing'], flags: [], remember: l('Saved number, matches your life, asks for nothing secret: usually a real call.', 'ເບີທີ່ບັນທຶກໄວ້, ກົງກັບຊີວິດເຈົ້າ, ບໍ່ຂໍຫຍັງລັບ: ປົກກະຕິແມ່ນສາຍແທ້.') }),
  call({ id: 'sn-parcel', real: false, voice: scamMan, time: '14:30', stake: 300_000, saved: false, number: '+856 20 91•• 3340', caller: l('Parcel customs', 'ພາສີພັດສະດຸ'),
    place: l('Resting after school', 'ພັກຜ່ອນຫຼັງເລີກຮຽນ'), note: l('You did not order anything online this week.', 'ອາທິດນີ້ເຈົ້າບໍ່ໄດ້ສັ່ງຫຍັງອອນລາຍ.'),
    lines: [l('Your parcel is stuck at customs. Pay a 300,000 kip fee to release it.', 'ພັດສະດຸຂອງເຈົ້າຄ້າງຢູ່ພາສີ. ຈ່າຍຄ່າທຳນຽມ 300,000 ກີບເພື່ອປ່ອຍ.'), l('Scan the QR I send you. Do it today or it is returned.', 'ສະແກນ QR ທີ່ສົ່ງໃຫ້ ມື້ນີ້ ຖ້າບໍ່ດັ່ງນັ້ນຈະຖືກສົ່ງຄືນ.')],
    trust: [l('Scan the QR and pay', 'ສະແກນ QR ແລ້ວຈ່າຍ'), l('The money goes to a stranger. There was never a parcel.', 'ເງິນໄປຫາຄົນແປກໜ້າ. ບໍ່ເຄີຍມີພັດສະດຸ.')],
    check: [l('Ask for the tracking number and check with the post office', 'ຖາມເລກພັດສະດຸ ແລ້ວກວດກັບໄປສະນີ'), l('No such parcel exists. You caught it.', 'ບໍ່ມີພັດສະດຸນີ້. ເຈົ້າຈັບໄດ້.')],
    hangup: [l('Decline the call', 'ປະຕິເສດສາຍ'), l('Safe. A real parcel shows up with a tracking number.', 'ປອດໄພ. ພັດສະດຸແທ້ມີເລກຕິດຕາມ.')],
    signs: ['pay', 'clock', 'gift'], flags: ['upfront_fee', 'urgency'], remember: l('Paying to "release" something you never ordered is a scam.', 'ຈ່າຍເງິນເພື່ອ "ປ່ອຍ" ຂອງທີ່ບໍ່ໄດ້ສັ່ງ ແມ່ນການຫຼອກລວງ.') }),
];
const DARA: Call[] = [
  call({ id: 'sd-police', real: false, voice: scamMan, time: '08:40', stake: 3_000_000, saved: false, number: '+856 30 •• 9021', caller: l('Cyber police unit', 'ໜ່ວຍຕຳຫຼວດໄຊເບີ'),
    place: l('Waiting for the 08:40 bus', 'ລໍຖ້າລົດເມ 08:40'), note: l('A number you do not know claims to be the police.', 'ເບີທີ່ບໍ່ຮູ້ຈັກ ອ້າງວ່າເປັນຕຳຫຼວດ.'),
    lines: [l('This is the cyber police. Your bank account is linked to a crime.', 'ນີ້ແມ່ນຕຳຫຼວດໄຊເບີ. ບັນຊີທະນາຄານຂອງເຈົ້າກ່ຽວຂ້ອງກັບອາຊະຍາກຳ.'), l('To protect your money, move it all to a safe account we give you.', 'ເພື່ອປົກປ້ອງເງິນ ໃຫ້ໂອນທັງໝົດເຂົ້າ "ບັນຊີປອດໄພ" ທີ່ເຮົາໃຫ້.'), l('Do not tell anyone, or you will be arrested.', 'ຢ່າບອກໃຜ ບໍ່ດັ່ງນັ້ນຈະຖືກຈັບ.')],
    trust: [l('Move the money to the safe account', 'ໂອນເງິນເຂົ້າບັນຊີປອດໄພ'), l('There is no safe account. Everything is gone.', 'ບໍ່ມີບັນຊີປອດໄພ. ເງິນຫາຍໝົດ.')],
    check: [l('Hang up and call 1191 myself', 'ວາງສາຍ ແລ້ວໂທ 1191 ເອງ'), l('Real police never ask you to move money. 1191 confirms it is a scam.', 'ຕຳຫຼວດແທ້ບໍ່ເຄີຍບອກໃຫ້ໂອນເງິນ. 1191 ຢືນຢັນວ່າເປັນການຫຼອກລວງ.')],
    hangup: [l('Decline the call', 'ປະຕິເສດສາຍ'), l('Safe. Report the number to 1533 later.', 'ປອດໄພ. ແຈ້ງເບີນີ້ກັບ 1533 ພາຍຫຼັງ.')],
    signs: ['mask', 'scare', 'pay', 'hush'], flags: ['urgency', 'unverified_identity'], remember: l('No real officer asks you to move money to a "safe account". Stop, hang up, call 1191.', 'ເຈົ້າໜ້າທີ່ແທ້ບໍ່ບອກໃຫ້ໂອນເງິນເຂົ້າ "ບັນຊີປອດໄພ". ຢຸດ, ວາງສາຍ, ໂທ 1191.') }),
  call({ id: 'sd-mum', real: true, voice: real, time: '12:15', stake: 0, saved: true, number: '+856 20 •• 4521', caller: l('Mum', 'ແມ່'),
    place: l('Lunch break', 'ພັກທ່ຽງ'), note: l('Mum is saved in your contacts and calls most days.', 'ແມ່ຢູ່ໃນລາຍຊື່ ແລະ ໂທເກືອບທຸກມື້.'),
    lines: [l('Dara, are you eating? Remember we have dinner at home on Sunday.', 'ດາລາ, ກິນເຂົ້າແລ້ວບໍ? ຈື່ວ່າວັນອາທິດກິນເຂົ້າແລງຢູ່ເຮືອນເດີ້.'), l('I will cook your favourite.', 'ແມ່ຈະເຮັດອັນທີ່ລູກມັກ.')],
    trust: [l('Chat with Mum', 'ລົມກັບແມ່'), l('A warm call. Nothing was asked of you.', 'ສາຍອົບອຸ່ນ. ບໍ່ມີໃຜຂໍຫຍັງ.')],
    check: [l('Ask Mum a family question first', 'ຖາມແມ່ເລື່ອງຄອບຄົວກ່ອນ'), l('Mum laughs and answers. Careful, and still kind.', 'ແມ່ຫົວ ແລ້ວຕອບ. ລະວັງ ແລະ ຍັງອ່ອນໂຍນ.')],
    hangup: [l('Decline the call', 'ປະຕິເສດສາຍ'), l('Mum worries when you do not answer.', 'ແມ່ເປັນຫ່ວງເມື່ອເຈົ້າບໍ່ຮັບ.')],
    signs: ['known', 'match', 'nothing'], flags: [], remember: l('A known person asking for nothing is a real call. Not every call is a scam.', 'ຄົນທີ່ຮູ້ຈັກ ແລະ ບໍ່ຂໍຫຍັງ ແມ່ນສາຍແທ້. ບໍ່ແມ່ນທຸກສາຍທີ່ເປັນການຫຼອກລວງ.') }),
  call({ id: 'sd-refund', real: false, voice: scam, time: '17:30', stake: 800_000, saved: false, number: '+856 20 77•• 0058', caller: l('Ticket refund desk', 'ໂຕະຄືນເງິນປີ້'),
    place: l('On the way home', 'ຢູ່ເທິງທາງກັບບ້ານ'), note: l('You did not ask for any refund.', 'ເຈົ້າບໍ່ໄດ້ຂໍຄືນເງິນຫຍັງ.'),
    lines: [l('You are owed a 2,000,000 kip refund. First pay an 800,000 kip tax fee.', 'ເຈົ້າມີເງິນຄືນ 2,000,000 ກີບ. ກ່ອນອື່ນຈ່າຍພາສີ 800,000 ກີບ.'), l('Send it now and we pay you tonight.', 'ໂອນດຽວນີ້ ແລ້ວຄືນຄືນນີ້.')],
    trust: [l('Pay the tax fee', 'ຈ່າຍຄ່າພາສີ'), l('The refund never comes.', 'ເງິນຄືນບໍ່ເຄີຍມາ.')],
    check: [l('Hang up and check my own bookings', 'ວາງສາຍ ແລ້ວກວດການຈອງຂອງຂ້ອຍເອງ'), l('No refund exists. You stay safe.', 'ບໍ່ມີເງິນຄືນ. ເຈົ້າປອດໄພ.')],
    hangup: [l('Decline the call', 'ປະຕິເສດສາຍ'), l('Safe. Free money that asks for a fee first is a trap.', 'ປອດໄພ. ເງິນຟຣີທີ່ຂໍຄ່າທຳນຽມກ່ອນແມ່ນກັບດັກ.')],
    signs: ['gift', 'pay', 'clock'], flags: ['too_good', 'upfront_fee'], remember: l('If you must pay first to receive money, it is a scam.', 'ຖ້າຕ້ອງຈ່າຍກ່ອນຈຶ່ງໄດ້ເງິນ ແມ່ນການຫຼອກລວງ.') }),
];
const SUK: Call[] = [
  call({ id: 'ss-tax', real: false, voice: scamMan, time: '10:00', stake: 4_800_000, saved: false, number: '+856 20 58•• 7712', caller: l('Tax office', 'ຫ້ອງການພາສີ'),
    place: l('At the shop, between customers', 'ຢູ່ຮ້ານ ລະຫວ່າງລູກຄ້າ'), note: l('A number you do not know. The tax office writes letters; it does not demand QR payments by phone.', 'ເບີທີ່ບໍ່ຮູ້ຈັກ. ຫ້ອງການພາສີສົ່ງໜັງສື ບໍ່ໄດ້ບັງຄັບຈ່າຍ QR ທາງໂທລະສັບ.'),
    lines: [l('This is the tax office. Your shop owes 4,800,000 kip in unpaid tax.', 'ນີ້ແມ່ນຫ້ອງການພາສີ. ຮ້ານຂອງທ່ານຄ້າງພາສີ 4,800,000 ກີບ.'), l('Pay now by scanning the QR code I send, or the shop will be closed today.', 'ຈ່າຍດຽວນີ້ໂດຍສະແກນ QR ທີ່ສົ່ງໃຫ້ ບໍ່ດັ່ງນັ້ນຮ້ານຈະຖືກປິດມື້ນີ້.'), l('Do not tell your family. Pay within the hour.', 'ຢ່າບອກຄອບຄົວ. ຈ່າຍພາຍໃນໜຶ່ງຊົ່ວໂມງ.')],
    trust: [l('Scan the QR and pay', 'ສະແກນ QR ແລ້ວຈ່າຍ'), l('The QR sends money to a stranger. The shop loses its savings.', 'QR ສົ່ງເງິນໃຫ້ຄົນແປກໜ້າ. ຮ້ານສູນເສຍເງິນເກັບ.')],
    check: [l('Hang up and visit or call the real tax office', 'ວາງສາຍ ແລ້ວໄປ ຫຼື ໂທຫາຫ້ອງການພາສີແທ້'), l('The real office has no debt on record. A scam, caught.', 'ຫ້ອງການແທ້ບໍ່ມີໜີ້ຄ້າງ. ການຫຼອກລວງ ຖືກຈັບໄດ້.')],
    hangup: [l('Decline the call', 'ປະຕິເສດສາຍ'), l('Safe. If there was a real debt, a letter would arrive.', 'ປອດໄພ. ຖ້າມີໜີ້ແທ້ ຈະມີໜັງສືມາ.')],
    signs: ['mask', 'clock', 'pay', 'hush'], flags: ['urgency', 'unverified_identity'], remember: l('Offices do not collect tax by QR over the phone. Hang up and go in person.', 'ຫ້ອງການບໍ່ເກັບພາສີດ້ວຍ QR ທາງໂທລະສັບ. ວາງສາຍ ແລ້ວໄປດ້ວຍຕົນເອງ.') }),
  call({ id: 'ss-supplier', real: true, voice: realMan, time: '07:30', stake: 0, saved: true, number: '+856 20 •• 3315', caller: l('Mr. Vong (noodle supplier)', 'ທ້າວວົງ (ຜູ້ສົ່ງເສັ້ນ)'),
    place: l('Opening the shop', 'ເປີດຮ້ານ'), note: l('Mr. Vong is saved in your phone and delivers every week.', 'ທ້າວວົງຢູ່ໃນໂທລະສັບ ແລະ ສົ່ງເຄື່ອງທຸກອາທິດ.'),
    lines: [l('Good morning! I will deliver the noodles tomorrow at 9, same as always.', 'ສະບາຍດີຕອນເຊົ້າ! ມື້ອື່ນ 9 ໂມງ ຂ້ອຍຈະສົ່ງເສັ້ນ ຄືເກົ່າ.'), l('Pay me cash when I arrive, as usual.', 'ຈ່າຍເງິນສົດຕອນມາຮອດ ຄືປົກກະຕິ.')],
    trust: [l('Say thanks and be ready', 'ຂອບໃຈ ແລ້ວກຽມຮັບ'), l('The delivery arrives on time.', 'ຂອງມາສົ່ງທັນເວລາ.')],
    check: [l('Call him back on his saved number', 'ໂທກັບເບີທີ່ບັນທຶກໄວ້'), l('Same Mr. Vong. Careful, and fine.', 'ທ້າວວົງຄົນເດີມ. ລະວັງ ແລະ ບໍ່ມີບັນຫາ.')],
    hangup: [l('Decline the call', 'ປະຕິເສດສາຍ'), l('You miss the delivery time and the shop runs short.', 'ພາດເວລາສົ່ງ ຮ້ານຂາດເຄື່ອງ.')],
    signs: ['known', 'match', 'nothing'], flags: [], remember: l('A saved supplier, the usual routine, no surprise payment: a real call.', 'ຜູ້ສົ່ງທີ່ບັນທຶກໄວ້, ວຽກປົກກະຕິ, ບໍ່ມີການຈ່າຍແບບກະທັນຫັນ: ສາຍແທ້.') }),
  call({ id: 'ss-merchant', real: false, voice: scam, time: '15:00', stake: 1_000_000, saved: false, number: '+856 20 66•• 9904', caller: l('Bank merchant desk', 'ໂຕະຜູ້ຄ້າທະນາຄານ'),
    place: l('Quiet afternoon', 'ຕອນບ່າຍງຽບ'), note: l('Your bank has not told you about any change to your shop QR.', 'ທະນາຄານບໍ່ໄດ້ແຈ້ງປ່ຽນ QR ຮ້ານ.'),
    lines: [l('We are upgrading your shop QR. Read me the code we send you to keep it active.', 'ເຮົາກຳລັງອັບເກຣດ QR ຮ້ານ. ອ່ານລະຫັດທີ່ສົ່ງໃຫ້ເພື່ອໃຫ້ໃຊ້ຕໍ່ໄດ້.'), l('If not, your QR stops working today.', 'ຖ້າບໍ່ ມື້ນີ້ QR ຈະໃຊ້ບໍ່ໄດ້.')],
    trust: [l('Read out the code', 'ອ່ານລະຫັດ'), l('The code approves a transfer out of the shop account.', 'ລະຫັດອະນຸມັດການໂອນອອກຈາກບັນຊີຮ້ານ.')],
    check: [l('Hang up and ask my bank branch', 'ວາງສາຍ ແລ້ວຖາມສາຂາທະນາຄານ'), l('The branch says there is no upgrade. A scam, caught.', 'ສາຂາບອກວ່າບໍ່ມີອັບເກຣດ. ການຫຼອກລວງ ຖືກຈັບໄດ້.')],
    hangup: [l('Decline the call', 'ປະຕິເສດສາຍ'), l('Safe. Banks never need your OTP.', 'ປອດໄພ. ທະນາຄານບໍ່ຕ້ອງການ OTP ຂອງທ່ານ.')],
    signs: ['code', 'clock', 'mask'], flags: ['personal_data', 'urgency'], remember: l('An OTP is a key to your money. Never read it out, to anyone.', 'OTP ແມ່ນກະແຈເງິນຂອງທ່ານ. ຢ່າອ່ານໃຫ້ໃຜ.') }),
];

export type Scene = { id: string; image: string; scam: L10n; day: Day };
const avatar = { skin: 1, hair: 2, outfit: 3, extra: 0 };
export const SCENES: Scene[] = [
  { id: 'noy', image: '/games/noy.jpg', scam: l('Bank OTP scam', 'ຫຼອກຂໍ OTP ທະນາຄານ'), day: { id: 'scene-noy', bands: ['youth', 'adult'], room: 'student', hero: { name: l('Noy', 'ນ້ອຍ'), age: 17, avatar }, balance: 2_000_000, calls: NOY,
    who: l('At home, phone on the desk', 'ຢູ່ເຮືອນ ໂທລະສັບຢູ່ເທິງໂຕະ'), intro: l('Noy, 17, is home with her phone and her savings. It will ring {n} times today.', 'ນ້ອຍ, 17 ປີ, ຢູ່ເຮືອນກັບໂທລະສັບ ແລະ ເງິນເກັບ. ມື້ນີ້ຈະດັງ {n} ເທື່ອ.') } },
  { id: 'dara', image: '/games/dara.jpg', scam: l('Fake police "safe account" scam', 'ຕຳຫຼວດປອມ "ບັນຊີປອດໄພ"'), day: { id: 'scene-dara', bands: ['youth', 'adult'], room: 'worker', hero: { name: l('Dara', 'ດາລາ'), age: 24, avatar }, balance: 3_000_000, calls: DARA,
    who: l('At the bus stop', 'ຢູ່ປ້າຍລົດເມ'), intro: l('Dara, 24, waits for the 08:40 bus. The phone will ring {n} times today.', 'ດາລາ, 24 ປີ, ລໍຖ້າລົດເມ 08:40. ມື້ນີ້ໂທລະສັບຈະດັງ {n} ເທື່ອ.') } },
  { id: 'suk', image: '/games/shop.jpg', scam: l('Fake tax office QR payment scam', 'ຫ້ອງການພາສີປອມ ບັງຄັບຈ່າຍ QR'), day: { id: 'scene-suk', bands: ['adult', 'elder'], room: 'stall', hero: { name: l('Auntie Suk', 'ເອື້ອຍສຸກ'), age: 45, avatar }, balance: 6_000_000, calls: SUK,
    who: l('Runs a noodle shop', 'ເປີດຮ້ານເຝີ'), intro: l('Auntie Suk runs a noodle shop. Her phone will ring {n} times today.', 'ເອື້ອຍສຸກເປີດຮ້ານເຝີ. ມື້ນີ້ໂທລະສັບຈະດັງ {n} ເທື່ອ.') } },
];
export const sceneOf = (dayId: string) => SCENES.find(s => s.day.id === dayId);
