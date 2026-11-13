import test from 'node:test';
import assert from 'node:assert/strict';
import { checkElderMessage } from '../frontend/src/lib/elderCheck.ts';

// Regression set for the on-phone message check in Easy mode (Lao and English).
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
  // Careful
  ['caution', 'Hello, this is the bank. Please call us back about your account.'],
  ['caution', 'Here are the wedding photos: https://photos.example.com/album'],
  ['caution', 'ຫຼານເອີຍ ໂທຫາແມ່ໃຫຍ່ແດ່ເດີ້'],
  ['caution', 'Please pay the electricity bill before Friday'],
  // Advice that names codes and the bank stays amber: the result screen still says to ask family.
  ['caution', 'Never share your OTP with anyone. The bank will never ask for it.'],
  ['caution', 'ທະນາຄານຈະບໍ່ຂໍລະຫັດ PIN ຫຼື OTP ຂອງທ່ານ'],
  // Safe, including the two false-signal cases ("ຢ່າງ" is an ordinary word; "ping" is not "pin")
  ['safe', 'ມື້ນີ້ອາກາດດີຢ່າງຫຼາຍ ໄປວັດນຳກັນບໍ່'],
  ['safe', 'Ping me when you arrive at the market'],
  ['safe', "I'm shopping at the market, back at 5"],
  ['safe', 'ກິນເຂົ້າແລ້ວບໍ່ ແມ່'],
  ['safe', 'ຢ່າລືມກິນຢາເດີ້'],
  ['safe', 'Happy birthday grandma! See you at the temple tomorrow'],
  ['safe', 'Can you send me the link to the recipe?'],
];

test('elder message check: regression set', () => {
  assert.ok(CASES.length >= 20);
  const wrong = CASES.map(([want, text]) => ({ want, got: checkElderMessage(text), text })).filter(c => c.got !== c.want);
  assert.deepEqual(wrong, []);
});
