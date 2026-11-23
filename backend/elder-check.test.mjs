import test from 'node:test';
import assert from 'node:assert/strict';
import { checkElderMessage } from '../frontend/src/lib/elderCheck.ts';

// Regression set for the on-phone message check in Simple mode (Lao and English).
// scam = red, caution = amber, safe = green.
const CASES = [
  // Scams
  ['scam', 'ທະນາຄານແຈ້ງ: ບັນຊີຂອງທ່ານຖືກລະງັບ ກະລຸນາສົ່ງລະຫັດ OTP ດ່ວນ'],
  ['scam', 'ຂໍສະແດງຄວາມຍິນດີ! ທ່ານຖືກລາງວັນ 50,000,000 ກີບ. ຈ່າຍຄ່າທຳນຽມ 500,000 ກີບກ່ອນ'],
  ['scam', 'ແມ່ໃຫຍ່ ແມ່ນຂ້ອຍເອງ ຂ້ອຍເກີດອຸບັດຕິເຫດ ຢູ່ໂຮງໝໍ ໂອນເງິນໃຫ້ແດ່ ດ່ວນ'],
  ['scam', 'ຕຳຫຼວດແຈ້ງວ່າຊື່ທ່ານຢູ່ໃນຄະດີຟອກເງິນ ຕ້ອງໂອນເງິນມາກວດສອບ'],
  ['scam', 'ຫ້ອງການບຳນານ: ກະລຸນາຕິດຕັ້ງແອັບ ແລະ ໃສ່ລະຫັດ ເພື່ອຮັບເງິນບຳນານ'],
  ['scam', 'Your bank account is blocked. Click http://bcel-verify.xyz and enter your PIN now'],
  ['scam', 'Congratulations, you are the winner of our lottery! Pay a small fee to claim it'],
  ['scam', "Grandma it's me, I had an accident and I'm in hospital, please send money right now"],
  // QA misses: a prize scam saying "ຢ່າງເປັນທາງການ" (officially), and an investment scam with no bank words.
  ['scam', 'ທ່ານໄດ້ຮັບລາງວັນຢ່າງເປັນທາງການ ກົດລິ້ງນີ້ເພື່ອຮັບເງິນ'],
  ['scam', 'Guaranteed profit 30% every month! Invest now, send USDT to this wallet today only'],
  // Demo blockers: family / authority impersonation with a transfer, secrecy, Thai words, job abroad
  ['scam', 'ແມ່ນລູກເອງ ເບີໃໝ່ ໂອນ 2 ລ້ານ ຢ່າບອກໃຜ'],
  ['scam', 'Grandson is in hospital, send 5,000,000 kip to 0201234567, tell nobody'],
  ['scam', 'ຫຼານຢູ່ໂຮງໝໍ ໂອນເງິນ 5,000,000 ກີບ ມາເບີ 0201234567 ຢ່າບອກໃຜ'],
  ['scam', 'ຕຳຫຼວດແຈ້ງ case ຢາບ້າ ต้อง โอนเงิน 20,000 บาท ຢ່າບອກໃຜ'],
  ['scam', 'Your bank account will be closed, verify now'],
  ['scam', 'ບໍ່ມີປະສົບການກໍເຮັດໄດ້. ຟຣີທຸກຢ່າງ ຄ່າເດີນທາງ, ທີ່ພັກ, ອາຫານ. ເງິນເດືອນດີ. ຄລິກລິ້ງເພື່ອສະໝັກເລີຍ!'],
  ['scam', 'Hiring in Bangkok, high pay, free flight. Send passport and pay 500 THB fee'],
  // Careful
  ['caution', 'ວຽກຕ່າງປະເທດ ເງິນເດືອນສູງ ສົນໃຈບໍ່'],
  ['caution', 'Hello, this is the bank. Please call us back about your account.'],
  ['caution', 'Here are the wedding photos: https://photos.example.com/album'],
  ['caution', 'ຫຼານເອີຍ ໂທຫາແມ່ໃຫຍ່ແດ່ເດີ້'],
  ['caution', 'Please pay the electricity bill before Friday'],
  // Advice that names codes and the bank stays amber: the result screen still says to ask family.
  // Plain advice about codes is safe (the demo brief): it carries no bait. Bait that says "never" still scores.
  ['safe', 'Never share your OTP with anyone. The bank will never ask for it.'],
  ['safe', 'ທະນາຄານຈະບໍ່ຂໍລະຫັດ PIN ຫຼື OTP ຂອງທ່ານ'],
  ['scam', 'Never mind the rules, click http://bcel-verify.xyz and enter your PIN now'],
  // Safe, including the two false-signal cases ("ຢ່າງ" is an ordinary word; "ping" is not "pin")
  ['safe', 'ມື້ນີ້ອາກາດດີຢ່າງຫຼາຍ ໄປວັດນຳກັນບໍ່'],
  ['safe', 'Ping me when you arrive at the market'],
  ['safe', "I'm shopping at the market, back at 5"],
  ['safe', 'ກິນເຂົ້າແລ້ວບໍ່ ແມ່'],
  ['safe', 'ໝາກມ່ວງ ກິໂລລະ 20,000 ກີບ ຕະຫຼາດເຊົ້າ ມື້ນີ້ລາຄາດີ'],
  ['safe', 'ລູກເອງ ມື້ນີ້ກັບເຮືອນຊ້າ ກິນເຂົ້າກ່ອນເດີ້'],
  ['safe', 'ຢ່າລືມກິນຢາເດີ້'],
  ['safe', 'Happy birthday grandma! See you at the temple tomorrow'],
  ['safe', 'Can you send me the link to the recipe?'],
  // v2 UAT: the exact A7 (scam) and A12 (safe advice) wording each persona typed.
  ['scam', 'ຫລານຊາຍຢູ່ໂຮງໝໍ ໂອນເງິນ 5,000,000 ກີບ ໄປເບີ 0201234567 ຢ່າບອກໃຜ'],
  ['scam', 'ລູກຊາຍຢູ່ໂຮງໝໍ, ກະລຸນາສົ່ງ 5,000,000 ກີບ ໄປເບີ 0201234567, ຢ່າບອກໃຜ'],
  ['scam', 'ຫຼານຢູ່ໂຮງໝໍ grandson in hospital, send 5,000,000 kip to 0201234567, tell nobody'],
  ['scam', 'ຫລານຊາຍຢູ່ໂຮງໝໍ ກະລຸນາສົ່ງ 5,000,000 ກີບ ໄປ 0201234567 ຢ່າບອກໃຜ (grandson in hospital, send 5,000,000 kip to 0201234567, tell nobody)'],
  ['scam', 'ຫຼານຊາຍຢູ່ໂຮງໝໍ, ສົ່ງ 5,000,000 ກີບ ໄປເບີ 0201234567, ຢ່າບອກໃຜ'],
  ['scam', 'ຫຼານນອນໂຮງໝໍ ຕ້ອງການດ່ວນ ສົ່ງ 5,000,000 ກີບ ໃຫ້ 0201234567 ຢ່າບອກໃຜ (grandson in hospital, send 5,000,000 kip to 0201234567, tell nobody)'],
  ['scam', 'ຫຼານຢູ່ໂຮງໝໍ ສົ່ງ 5,000,000 ກີບ ເຂົ້າເບີ 0201234567 ຢ່າບອກໃຜ (grandson in hospital, send 5,000,000 kip to 0201234567, tell nobody)'],
  ['scam', 'ຫຼານຊາຍຢູ່ໂຮງໝໍ ຕ້ອງການເງິນດ່ວນ ສົ່ງ 5,000,000 ກີບ ໄປເບີ 0201234567 ຢ່າບອກໃຜ (grandson in hospital, send 5,000,000 kip to 0201234567, tell nobody)'],
  ['scam', 'ລູກຊາຍຢູ່ໂຮງໝໍ grandson in hospital, send 5,000,000 kip to 0201234567, tell nobody'],
  ['scam', 'ຫລານຊາຍຢູ່ໂຮງໝໍ ສົ່ງເງິນ 5,000,000 ກີບ ໄປເບີ 0201234567 ຢ່າບອກໃຜ (grandson in hospital, send 5,000,000 kip to 0201234567, tell nobody)'],
  ['safe', "ທະນາຄານບໍ່ເຄີຍຂໍລະຫັດ OTP ຂອງທ່ານ ຢ່າບອກລະຫັດ OTP ໃຫ້ໃຜ"],
  ['safe', "ທະນາຄານບໍ່ເຄີຍຖາມລະຫັດ OTP ຂອງທ່ານ, ຢ່າບອກລະຫັດ OTP ໃຫ້ໃຜ"],
  ['safe', "ທະນາຄານບໍ່ເຄີຍຂໍ OTP ຂອງທ່ານ, ຢ່າແບ່ງປັນ OTP ໃຫ້ໃຜ"],
  ['safe', "ທະນາຄານບໍ່ເຄີຍຖາມຫາ OTP ຂອງທ່ານ, ຢ່າບອກ OTP ໃຫ້ໃຜ"],
  ['safe', "ທະນາຄານບໍ່ເຄີຍຖາມລະຫັດ OTP ຂອງທ່ານ, ຢ່າບອກລະຫັດນີ້ໃຫ້ໃຜ"],
  ['safe', "ທະນາຄານບໍ່ເຄີຍຖາມລະຫັດ OTP ຂອງທ່ານ. ຢ່າບອກລະຫັດ OTP ໃຫ້ໃຜ"],
  ['safe', "ທະນາຄານບໍ່ເຄີຍຖາມລະຫັດ OTP ຂອງທ່ານ. ຢ່າບອກລະຫັດ OTP ໃຫ້ຜູ້ໃດ"],
  ['safe', "ທະນາຄານບໍ່ເຄີຍຖາມລະຫັດ OTP ຂອງທ່ານ, ຢ່າແບ່ງປັນລະຫັດໃຫ້ໃຜ"],
  ['safe', "ທະນາຄານບໍ່ເຄີຍຂໍລະຫັດ OTP ຂອງທ່ານ, ຢ່າບອກລະຫັດໃຫ້ໃຜ"],
  // Guards for the A7/A12 fix
  ['scam', "ແມ່ນລູກເອງ ເບີໃໝ່ ໂອນ 2 ລ້ານ ຢ່າບອກໃຜ"],
  ['scam', "ຫຼານເຂົ້າໂຮງໝໍ ສົ່ງເງິນ 5 ລ້ານ ຢ່າບອກໃຜ"],
  ['safe', "ທະນາຄານບໍ່ເຄີຍຂໍ OTP ຢ່າບອກລະຫັດໃຫ້ໃຜ"],
  ['safe', "ສົ່ງຮູບໃຫ້ແມ່ແລ້ວ"],
  ['safe', "ສົ່ງຂໍ້ຄວາມຫາແມ່ແລ້ວເດີ້"],
  ['scam', "ແມ່ນລູກເອງ ເບີໃໝ່ ໂອນ 2 ລ້ານ ຢ່າບອກໃຜ"],
  ['scam', "ຕຳຫຼວດແຈ້ງຄະດີ ຢາບ້າ, โอนเงิน 20,000 บาท, ຢ່າບອກໃຜ"],
  ['scam', "ຂໍສະແດງຄວາມຍິນດີ! ທ່ານຖືກລາງວັນ 50,000,000 ກີບ. ຈ່າຍຄ່າທຳນຽມ 500,000 ກີບກ່ອນ"],
  ['scam', "Your bank account will be closed today, verify now at bit.ly/xx"],
  // Code REQUESTS are scams, even next to "tell nobody" or inside a message that also warns.
  ['scam', 'ສົ່ງລະຫັດ OTP ມາໃຫ້ຂ້ອຍ ຢ່າບອກລະຫັດໃຫ້ໃຜ'],
  ['scam', "send me your OTP code, don't tell the code to anyone"],
  ['scam', 'ເຈົ້າໜ້າທີ່ທະນາຄານ: ກະລຸນາບອກລະຫັດ OTP ເພື່ອຢືນຢັນ'],
  ['scam', 'ກະລຸນາແຈ້ງລະຫັດ OTP ທີ່ໄດ້ຮັບ'],
  ['scam', 'ส่ง OTP มาให้ด่วน อย่าบอกใคร'],
];

test('elder message check: regression set', () => {
  assert.ok(CASES.length >= 20);
  const wrong = CASES.map(([want, text]) => ({ want, got: checkElderMessage(text), text })).filter(c => c.got !== c.want);
  assert.deepEqual(wrong, []);
});

// One named test per case, so a run shows exactly which wording is covered (the set above is a single test).
for (const [want, text] of CASES) {
  test(`elder check [${want}] ${text.slice(0, 60)}`, () => assert.equal(checkElderMessage(text), want));
}
