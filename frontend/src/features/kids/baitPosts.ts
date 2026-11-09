import type { Lang } from '../daily/types';

// Bait-post simulator for Kids (6–14). Every post is a practice post: invented names, no real logos,
// no clickable links (only *.example.invalid text), no phone or account numbers.
// `source` is a citation id from CLAUDE_HANDOFF.md §9, or 'pattern' for a composite of reported patterns.
// Every Lao string below needs native review before the demo.

type Text = Record<Lang, string>;
export type BaitPost = {
  id: string;
  emoji: string;        // stands in for a profile picture, never a real logo
  from: Text;           // who appears to be posting
  body: Text;           // the tempting post
  fakeLink?: string;    // shown as plain text, never a link
  cta: Text;            // the tempting button
  reveal: Text;         // what would have happened
  rule: Text;           // the one rule to remember (read aloud)
  source: 'S11' | 'pattern';
};

export const BAIT_POSTS: BaitPost[] = [
  {
    id: 'k1', emoji: '🪙', source: 'S11',
    from: { en: 'Free Coins Club', lo: 'ຊົມຣົມຫຼຽນຟຣີ' }, // REVIEW-LO
    body: {
      en: 'FREE 10,000 game coins! Type your game username and password to get them now!',
      lo: 'ຟຣີ! ຫຼຽນເກມ 10,000 ຫຼຽນ! ພິມຊື່ຜູ້ໃຊ້ ແລະ ລະຫັດຜ່ານເກມ ເພື່ອຮັບດຽວນີ້!', // REVIEW-LO
    },
    fakeLink: 'free-coins.example.invalid',
    cta: { en: 'Get my coins', lo: 'ຮັບຫຼຽນ' }, // REVIEW-LO
    reveal: {
      en: 'The scammer now has your password. They log in, take your items and lock you out.',
      lo: 'ຄົນຫຼອກໄດ້ລະຫັດຜ່ານຂອງເຈົ້າແລ້ວ. ເຂົາເຂົ້າບັນຊີ ເອົາຂອງໃນເກມໄປ ແລະ ລັອກເຈົ້າອອກ.', // REVIEW-LO
    },
    rule: {
      en: 'Free coin generators are always fake. Only type your password inside the real game app.',
      lo: 'ເຄື່ອງແຈກຫຼຽນຟຣີ ແມ່ນປອມສະເໝີ. ພິມລະຫັດຜ່ານໃນແອັບເກມແທ້ເທົ່ານັ້ນ.', // REVIEW-LO
    },
  },
  {
    id: 'k2', emoji: '🎬', source: 'S11',
    from: { en: 'SkinDrop Videos', lo: 'ວິດີໂອແຈກສະກິນ' }, // REVIEW-LO
    body: {
      en: 'Free skins for everyone! Click the link in my bio before it runs out!',
      lo: 'ແຈກສະກິນຟຣີ ທຸກຄົນ! ກົດລິ້ງໃນໂປຣໄຟລ໌ ກ່ອນມັນໝົດ!', // REVIEW-LO
    },
    fakeLink: 'skins-free.example.invalid',
    cta: { en: 'Open link in bio', lo: 'ເປີດລິ້ງ' }, // REVIEW-LO
    reveal: {
      en: 'The link opens a fake login page. Whatever you type goes straight to the scammer.',
      lo: 'ລິ້ງນັ້ນເປີດໜ້າເຂົ້າສູ່ລະບົບປອມ. ຫຍັງທີ່ເຈົ້າພິມ ຈະໄປຫາຄົນຫຼອກທັນທີ.', // REVIEW-LO
    },
    rule: {
      en: 'Free-item links on video apps are traps. Don’t open them.',
      lo: 'ລິ້ງແຈກຂອງຟຣີ ໃນແອັບວິດີໂອ ແມ່ນກັບດັກ. ຢ່າເປີດ.', // REVIEW-LO
    },
  },
  {
    id: 'k3', emoji: '🙂', source: 'pattern',
    from: { en: 'Your friend Noy', lo: 'ໝູ່ຂອງເຈົ້າ ນ້ອຍ' }, // REVIEW-LO
    body: {
      en: 'Hey!! Please vote for me in the contest. Just log in here, it takes 1 second 🙏',
      lo: 'ເຮີ້!! ຊ່ວຍໂຫວດໃຫ້ແດ່ ໃນການປະກວດ. ແຄ່ເຂົ້າສູ່ລະບົບບ່ອນນີ້ 1 ວິນາທີ 🙏', // REVIEW-LO
    },
    fakeLink: 'vote-now.example.invalid',
    cta: { en: 'Log in and vote', lo: 'ເຂົ້າສູ່ລະບົບ ແລ້ວໂຫວດ' }, // REVIEW-LO
    reveal: {
      en: 'Noy’s account was hacked. The scammer is using it to steal your account too.',
      lo: 'ບັນຊີຂອງນ້ອຍຖືກແຮັກ. ຄົນຫຼອກໃຊ້ມັນ ເພື່ອລັກບັນຊີຂອງເຈົ້ານຳ.', // REVIEW-LO
    },
    rule: {
      en: 'Even a friend’s message can come from a scammer. Ask your friend face to face.',
      lo: 'ຂໍ້ຄວາມຈາກໝູ່ ກໍອາດມາຈາກຄົນຫຼອກໄດ້. ຖາມໝູ່ຕໍ່ໜ້າ.', // REVIEW-LO
    },
  },
  {
    id: 'k4', emoji: '💎', source: 'pattern',
    from: { en: 'Super Cheap Top-Up', lo: 'ເຕີມເກມລາຄາຖືກ' }, // REVIEW-LO
    body: {
      en: 'Game top-up 90% OFF! Send money to our account and we’ll add gems in 5 minutes.',
      lo: 'ເຕີມເກມ ຫຼຸດ 90%! ໂອນເງິນເຂົ້າບັນຊີພວກເຮົາ ແລ້ວຈະເຕີມເພັດໃຫ້ພາຍໃນ 5 ນາທີ.', // REVIEW-LO
    },
    cta: { en: 'Send money', lo: 'ໂອນເງິນ' }, // REVIEW-LO
    reveal: {
      en: 'The money is gone and no gems ever arrive. The page disappears the next day.',
      lo: 'ເງິນຫາຍໄປ ແລະ ບໍ່ໄດ້ເພັດຈັກເມັດ. ມື້ຕໍ່ມາ ເພຈກໍຫາຍໄປ.', // REVIEW-LO
    },
    rule: {
      en: 'Only buy through the official game store, together with a parent.',
      lo: 'ຊື້ຜ່ານຮ້ານຄ້າທາງການຂອງເກມເທົ່ານັ້ນ ພ້ອມກັບພໍ່ແມ່.', // REVIEW-LO
    },
  },
  {
    // Kept non-graphic on purpose: the only lesson is "secrets + moving apps → tell an adult".
    id: 'k5', emoji: '👤', source: 'pattern',
    from: { en: 'Someone you don’t know', lo: 'ຄົນທີ່ເຈົ້າບໍ່ຮູ້ຈັກ' }, // REVIEW-LO
    body: {
      en: 'You’re really cool. Let’s talk on another app. Don’t tell your parents, OK?',
      lo: 'ເຈົ້າເທ່ຫຼາຍ. ໄປລົມກັນໃນແອັບອື່ນເນາະ. ຢ່າບອກພໍ່ແມ່ເດີ້?', // REVIEW-LO
    },
    cta: { en: 'Move to the other app', lo: 'ໄປແອັບອື່ນ' }, // REVIEW-LO
    reveal: {
      en: 'People who ask for secrets and want to move apps may not be who they say they are.',
      lo: 'ຄົນທີ່ຂໍໃຫ້ປິດບັງ ແລະ ຢາກຍ້າຍແອັບ ອາດບໍ່ແມ່ນຄົນທີ່ເຂົາບອກ.', // REVIEW-LO
    },
    rule: {
      en: 'Secrets + moving apps = tell a trusted adult right now.',
      lo: 'ຄວາມລັບ + ຍ້າຍແອັບ = ບອກຜູ້ໃຫຍ່ທີ່ໄວ້ໃຈໄດ້ ທັນທີ.', // REVIEW-LO
    },
  },
  {
    id: 'k6', emoji: '📱', source: 'pattern',
    from: { en: 'Lucky Reels', lo: 'ຄລິບໂຊກດີ' }, // REVIEW-LO
    body: {
      en: 'Watch this reel to WIN A NEW PHONE! Share it with 10 friends to claim your prize!',
      lo: 'ເບິ່ງຄລິບນີ້ ເພື່ອລຸ້ນ ໂທລະສັບໃໝ່! ແຊຣ໌ໃຫ້ໝູ່ 10 ຄົນ ເພື່ອຮັບລາງວັນ!', // REVIEW-LO
    },
    cta: { en: 'Share to 10 friends', lo: 'ແຊຣ໌ໃຫ້ໝູ່ 10 ຄົນ' }, // REVIEW-LO
    reveal: {
      en: 'There is no phone. You just sent the scam to 10 friends, and some of them may fall for it.',
      lo: 'ບໍ່ມີໂທລະສັບດອກ. ເຈົ້າພຽງແຕ່ສົ່ງການຫຼອກລວງໄປຫາໝູ່ 10 ຄົນ ແລະ ບາງຄົນອາດຖືກຫຼອກ.', // REVIEW-LO
    },
    rule: {
      en: 'A prize you never entered is fake. Don’t share it.',
      lo: 'ລາງວັນທີ່ເຈົ້າບໍ່ໄດ້ສະໝັກ ແມ່ນປອມ. ຢ່າແຊຣ໌.', // REVIEW-LO
    },
  },
];

// Shared UI copy for the simulator.
export const BAIT_UI: Record<Lang, Record<string, string>> = {
  en: {
    title: 'Practice feed', intro: 'These posts are tricks. Tap one, or scroll past. What happens?',
    badge: 'Practice post', skip: 'Not tapping!', gotcha: 'Gotcha!', gotcha_sub: 'It was a trick. Here’s what would have happened:',
    smart: 'Smart move!', smart_sub: 'You didn’t fall for it. Here’s why:', rule: 'Remember', next: 'Back to the feed',
    stars: '{n} of {total} stars', all_done: 'You found every trick! Come back tomorrow, or play again.', again: 'Play again',
    adult: 'Not sure? Stop and tell a trusted adult.',
  },
  lo: {
    title: 'ຟີດຝຶກຫັດ', intro: 'ໂພສເຫຼົ່ານີ້ແມ່ນກົນຫຼອກ. ແຕະເບິ່ງ ຫຼື ເລື່ອນຜ່ານ. ຈະເກີດຫຍັງຂຶ້ນ?', // REVIEW-LO
    badge: 'ໂພສຝຶກຫັດ', skip: 'ບໍ່ແຕະ!', gotcha: 'ຖືກຫຼອກແລ້ວ!', gotcha_sub: 'ມັນແມ່ນກົນຫຼອກ. ນີ້ຄືສິ່ງທີ່ຈະເກີດຂຶ້ນ:', // REVIEW-LO
    smart: 'ເກັ່ງຫຼາຍ!', smart_sub: 'ເຈົ້າບໍ່ຖືກຫຼອກ. ເພາະວ່າ:', rule: 'ຈື່ໄວ້', next: 'ກັບໄປຟີດ', // REVIEW-LO
    stars: '{n} ໃນ {total} ດາວ', all_done: 'ເຈົ້າຈັບກົນຫຼອກໄດ້ໝົດແລ້ວ! ມາຫຼິ້ນໃໝ່ມື້ອື່ນ ຫຼື ຫຼິ້ນອີກຄັ້ງ.', again: 'ຫຼິ້ນອີກຄັ້ງ', // REVIEW-LO
    adult: 'ບໍ່ແນ່ໃຈບໍ? ຢຸດ ແລ້ວບອກຜູ້ໃຫຍ່ທີ່ໄວ້ໃຈໄດ້.',
  },
};
