import { useState } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import type { Lang } from '../../types';
import { laoDayNumber, load, save, today } from '../../features/daily/lib/storage';
import { filterByBand, useBand, type BandTagged } from '../../lib/band';

// "Fact or fake?": a daily true/false card instead of one fixed tip, so readers have to think before the answer shows.
// Lao strings are drafts and need native review.
type Card = BandTagged & { fact: boolean; q: [string, string]; why: [string, string] };
const CARDS: Card[] = [
  { fact: false, q: ['Your bank may call and ask you to read out the SMS code to stop a transfer.', 'ທະນາຄານອາດໂທມາຂໍໃຫ້ອ່ານລະຫັດ SMS ເພື່ອຢຸດການໂອນ.'], why: ['Fake. That code approves a payment. No real bank asks for it.', 'ປອມ. ລະຫັດນັ້ນອະນຸມັດການຈ່າຍ. ທະນາຄານແທ້ບໍ່ຂໍ.'] },
  { fact: true, q: ['A call from an unknown number can still be real.', 'ສາຍຈາກເບີແປກ ກໍ່ອາດແມ່ນສາຍແທ້.'], why: ['Fact. Couriers and offices often use new numbers. Judge what they ask for, not the number.', 'ຈິງ. ຄົນສົ່ງເຄື່ອງ ແລະ ຫ້ອງການມັກໃຊ້ເບີໃໝ່. ເບິ່ງສິ່ງທີ່ເຂົາຂໍ ບໍ່ແມ່ນເບີ.'] },
  { fact: false, q: ['If the caller ID shows "Police", it must be the police.', 'ຖ້າໜ້າຈໍສະແດງ "ຕຳຫຼວດ" ກໍ່ຕ້ອງແມ່ນຕຳຫຼວດ.'], why: ['Fake. Caller names can be faked. Hang up and call the station yourself.', 'ປອມ. ຊື່ຜູ້ໂທປອມໄດ້. ວາງສາຍ ແລ້ວໂທຫາສະຖານີເອງ.'] },
  { fact: true, q: ['Before sharing a warning, check its source and hide personal information.', 'ກ່ອນແຊຣ໌ຄຳເຕືອນ ກວດແຫຼ່ງຂໍ້ມູນ ແລະ ປິດບັງຂໍ້ມູນສ່ວນຕົວ.'], why: ['Fact. Fake warnings spread fast, and screenshots often show names and numbers.', 'ຈິງ. ຄຳເຕືອນປອມແຜ່ໄວ ແລະ ຮູບໜ້າຈໍມັກມີຊື່ ແລະ ເບີ.'] },
  { fact: false, q: ['A website with a padlock icon is always safe.', 'ເວັບທີ່ມີຮູບກະແຈລັອກ ປອດໄພສະເໝີ.'], why: ['Fake. Scam sites get padlocks too. Check the address letter by letter.', 'ປອມ. ເວັບຫຼອກກໍ່ມີກະແຈລັອກ. ກວດທີ່ຢູ່ທຸກຕົວອັກສອນ.'] },
  { bands: ['youth', 'adult', 'elder'], fact: true, q: ['Real job offers do not charge you a fee to start.', 'ວຽກແທ້ບໍ່ເກັບຄ່າທຳນຽມເພື່ອເລີ່ມວຽກ.'], why: ['Fact. Training fees, uniform fees and visa fees paid to a recruiter are classic traps.', 'ຈິງ. ຄ່າຝຶກ ຄ່າເຄື່ອງແບບ ຄ່າວີຊາ ທີ່ຈ່າຍໃຫ້ນາຍໜ້າ ແມ່ນກັບດັກ.'] },
  { fact: false, q: ['Only old people fall for scams.', 'ມີແຕ່ຄົນເຖົ້າທີ່ຖືກຫຼອກ.'], why: ['Fake. Young people lose money to job, game and investment scams every day.', 'ປອມ. ໄວໜຸ່ມເສຍເງິນໃຫ້ການຫຼອກວຽກ ເກມ ແລະ ລົງທຶນທຸກມື້.'] },
  { fact: true, q: ['A message that matches something you really did, and asks for nothing, is usually real.', 'ຂໍ້ຄວາມທີ່ກົງກັບສິ່ງທີ່ທ່ານເຮັດແທ້ ແລະ ບໍ່ຂໍຫຍັງ ສ່ວນຫຼາຍແມ່ນແທ້.'], why: ['Fact. Scams need something from you: money, a code or a click.', 'ຈິງ. ການຫຼອກຕ້ອງການບາງຢ່າງ: ເງິນ ລະຫັດ ຫຼື ການກົດ.'] },
  { fact: false, q: ['A video call proves the person is who they say they are.', 'ວິດີໂອຄອນພິສູດວ່າແມ່ນຄົນນັ້ນແທ້.'], why: ['Fake. Deepfake faces and voices exist. Still verify money requests another way.', 'ປອມ. ໃບໜ້າ ແລະ ສຽງປອມມີແລ້ວ. ກວດການຂໍເງິນທາງອື່ນ.'] },
  { fact: true, q: ['Hanging up and calling back on a number you trust is always allowed.', 'ວາງສາຍ ແລ້ວໂທກັບເບີທີ່ໄວ້ໃຈ ເຮັດໄດ້ສະເໝີ.'], why: ['Fact. A real caller will understand. Only a scammer needs you to stay on the line.', 'ຈິງ. ຄົນແທ້ເຂົ້າໃຈ. ມີແຕ່ມິດສາຊີບທີ່ຕ້ອງການໃຫ້ຖືສາຍໄວ້.'] },
  { bands: ['youth', 'adult', 'elder'], fact: false, q: ['Guaranteed investment profit is possible if the app looks professional.', 'ກຳໄລຮັບປະກັນເປັນໄປໄດ້ ຖ້າແອັບເບິ່ງເປັນມືອາຊີບ.'], why: ['Fake. No real investment is guaranteed. A nice app is cheap to build.', 'ປອມ. ບໍ່ມີການລົງທຶນແທ້ທີ່ຮັບປະກັນ. ແອັບງາມສ້າງໄດ້ງ່າຍ.'] },
  { fact: true, q: ['Never share your OTP or password, even with someone claiming to be your bank.', 'ຢ່າແຊຣ໌ OTP ຫຼື ລະຫັດຜ່ານ ແມ່ນແຕ່ຄົນທີ່ອ້າງວ່າເປັນທະນາຄານ.'], why: ['Fact. Your OTP is the last lock on your money.', 'ຈິງ. OTP ແມ່ນກະແຈສຸດທ້າຍຂອງເງິນທ່ານ.'] },
  { fact: false, q: ['If a friend messages asking for money, it is safe to send because you know them.', 'ຖ້າໝູ່ສົ່ງຂໍ້ຄວາມຂໍເງິນ ໂອນໄດ້ເລີຍເພາະຮູ້ຈັກ.'], why: ['Fake. Accounts get hacked. Call your friend on their usual number first.', 'ປອມ. ບັນຊີຖືກແຮັກໄດ້. ໂທຫາເບີປົກກະຕິຂອງໝູ່ກ່ອນ.'] },
  { fact: true, q: ['Scammers often say "keep this secret" so nobody can warn you.', 'ມິດສາຊີບມັກບອກວ່າ "ປິດເປັນຄວາມລັບ" ເພື່ອບໍ່ໃຫ້ໃຜເຕືອນ.'], why: ['Fact. Telling one person you trust breaks most scams.', 'ຈິງ. ບອກຄົນທີ່ໄວ້ໃຈຄົນດຽວ ກໍ່ທຳລາຍການຫຼອກສ່ວນຫຼາຍ.'] },
];
const ANSWER = 'sati-fact-answer';

// One card per day: the same card all day for everyone, a new one tomorrow. Today's answer is remembered.
// Days change at midnight in Vientiane, not UTC.
const dayKey = today;
const dayIndex = (n: number) => laoDayNumber() % n;

export function DailySafetyTip({ lang }: { lang: Lang }) {
  const lo = lang === 'lo' ? 1 : 0;
  const pool = filterByBand(CARDS, useBand());
  const c = pool[dayIndex(pool.length)];
  const [guess, setGuess] = useState<boolean | null>(() => { const a = load<{ day: string; guess: boolean } | null>(ANSWER, null); return a?.day === dayKey() ? a.guess : null; });
  const answer = (g: boolean) => { setGuess(g); save(ANSWER, { day: dayKey(), guess: g }); };
  const right = guess === c.fact;
  return (
    <aside className="m-3 rounded-2xl bg-primary/5 border border-border p-3 grid gap-2">
      <div className="flex items-center gap-2">
        <img src="/brand-mark.svg" alt="" className="w-5 h-5" />
        <p className="flex-1 text-xs font-semibold text-primary">{lo ? 'ແທ້ ຫຼື ປອມ? ປະຈຳວັນ' : "Today's fact or fake?"}</p>
        {guess !== null && <span className="text-[11px] text-muted-foreground">{lo ? 'ອັນໃໝ່ມື້ອື່ນ' : 'New one tomorrow'}</span>}
      </div>
      <p className="text-sm font-lao leading-relaxed font-medium">{c.q[lo]}</p>
      {guess === null
        ? <div className="grid grid-cols-2 gap-2">
            <button onClick={() => answer(true)} className="rounded-xl border border-border bg-card min-h-10 text-sm font-semibold hover:border-primary">{lo ? 'ແທ້' : 'Fact'}</button>
            <button onClick={() => answer(false)} className="rounded-xl border border-border bg-card min-h-10 text-sm font-semibold hover:border-primary">{lo ? 'ປອມ' : 'Fake'}</button>
          </div>
        : <p className={`rounded-xl p-2 text-sm font-lao flex gap-2 ${right ? 'bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100' : 'bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-100'}`}>
            {right ? <CheckCircle2 size={16} className="shrink-0 mt-0.5" /> : <XCircle size={16} className="shrink-0 mt-0.5" />}
            <span>{c.why[lo]}</span>
          </p>}
    </aside>
  );
}
