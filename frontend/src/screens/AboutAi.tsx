import { useState } from 'react';
import type { Lang } from '../types';

// /about-ai: how Sati checks content, what it cannot do, and what happens to your data. Lao is a draft for native review. // REVIEW-LO
const read = (): Lang => { try { return localStorage.getItem('sati-lang') === 'lo' ? 'lo' : 'en'; } catch { return 'en'; } };

const COPY = {
  en: {
    title: 'How Sati AI checks things', back: 'Back to Sati',
    sections: [
      { h: 'What it does', p: ['The Safety Assistant helps you judge links, phone numbers and messages about scams, trafficking, jobs, study abroad and online safety. It gives you a colour verdict, the checks behind it, and what to do next.'] },
      { h: 'How a check works', p: ['Before any AI is used, Sati runs fixed checks on what you paste:'],
        list: ['Links: we read the real domain (the part right before the first single “/”), compare it with a list of official sites, and look for look-alikes (g00gle, extra words like -login or -verify), hidden characters (xn--), number addresses, risky endings such as .xyz or .ru, http instead of https, and link shorteners that hide the destination.',
          'Google Safe Browsing: the link is compared with Google’s list of known dangerous sites. If this check is not available, we say so.',
          'Domain age: very new domains (under 90 days) are a warning sign. We look this up through RDAP; it is skipped if it fails.',
          'Phone numbers: we check the Lao format (+856, 020, 030), compare with Sati’s hotline list, and flag foreign numbers in job offers.',
          'Wording: we look for known scam patterns such as a “free visa”, fees paid first, or someone keeping your passport. These rules are editable by our team.',
          'Only then does the AI write a short explanation. It is told the results of these checks and must not contradict them.'] },
      { h: 'What the verdicts mean', list: ['🟢 Looks safe: the address matches an official site we know. It is never a promise.', '🟡 Be careful: some warning signs, or we cannot see enough, for example a shortened link.', '🔴 Likely scam: strong warning signs were found.', '⚪ Can’t tell: nothing we can check either way. This is not a safe result.'] },
      { h: 'What it cannot do', list: ['It cannot be sure. New scam sites are not on any list yet, and a real-looking site can still be a scam.', 'It cannot open links, call numbers or see who is really behind a message.', 'The AI can make mistakes. For anything important, check with the official organisation yourself, ask a trusted adult, or call a hotline: 1362 (Lao Women’s Union, free, 24 hours).'] },
      { h: 'Your data', list: ['What you paste is sent to Sati’s server to run the checks. Links may be sent to Google Safe Browsing, and the domain name to an RDAP service.', 'The text is sent to our AI provider to write the explanation. Do not paste passwords, OTP codes, bank PINs or ID numbers.', 'Your age group only changes how the answer is written. It is not saved with your question.', 'We count how many checks you use each day so the service stays fair. Questions about your data: satisampasanya@gmail.com.'] },
    ],
  },
  lo: {
    title: 'Sati AI ກວດສອບແນວໃດ', back: 'ກັບໄປ Sati',
    sections: [
      { h: 'ມັນເຮັດຫຍັງ', p: ['ຜູ້ຊ່ວຍຄວາມປອດໄພຊ່ວຍທ່ານປະເມີນລິ້ງ, ເບີໂທ ແລະ ຂໍ້ຄວາມກ່ຽວກັບການຫຼອກລວງ, ການຄ້າມະນຸດ, ວຽກ, ການຮຽນຕ່າງປະເທດ ແລະ ຄວາມປອດໄພອອນລາຍ. ມັນບອກຜົນເປັນສີ, ສິ່ງທີ່ກວດ ແລະ ສິ່ງທີ່ຄວນເຮັດຕໍ່.'] },
      { h: 'ການກວດເຮັດວຽກແນວໃດ', p: ['ກ່ອນໃຊ້ AI Sati ກວດສິ່ງທີ່ທ່ານວາງດ້ວຍກົດທີ່ກຳນົດໄວ້ກ່ອນ:'],
        list: ['ລິ້ງ: ເຮົາອ່ານໂດເມນຈິງ (ສ່ວນກ່ອນເຄື່ອງໝາຍ “/” ອັນທຳອິດ) ປຽບທຽບກັບລາຍການເວັບທາງການ ແລະ ຫາເວັບທີ່ລອກຊື່ (g00gle, ຄຳເພີ່ມເຊັ່ນ -login ຫຼື -verify), ຕົວອັກສອນເຊື່ອງ (xn--), ທີ່ຢູ່ເປັນຕົວເລກ, ຕົວຈົບທີ່ມີຄວາມສ່ຽງເຊັ່ນ .xyz ຫຼື .ru, http ແທນ https ແລະ ລິ້ງສັ້ນທີ່ເຊື່ອງປາຍທາງ.',
          'Google Safe Browsing: ປຽບທຽບລິ້ງກັບບັນຊີເວັບອັນຕະລາຍຂອງ Google. ຖ້າກວດບໍ່ໄດ້ ເຮົາຈະບອກ.',
          'ອາຍຸໂດເມນ: ໂດເມນໃໝ່ຫຼາຍ (ຕ່ຳກວ່າ 90 ມື້) ເປັນສັນຍານເຕືອນ. ເຮົາຊອກຜ່ານ RDAP ແລະ ຂ້າມຖ້າບໍ່ສຳເລັດ.',
          'ເບີໂທ: ກວດຮູບແບບເບີລາວ (+856, 020, 030), ປຽບທຽບກັບລາຍການສາຍດ່ວນຂອງ Sati ແລະ ເຕືອນເບີຕ່າງປະເທດໃນຂໍ້ສະເໜີວຽກ.',
          'ຄຳໃນຂໍ້ຄວາມ: ຫາຮູບແບບການຫຼອກລວງທີ່ຮູ້ຈັກ ເຊັ່ນ “ວີຊາຟຣີ”, ຈ່າຍຄ່າທຳນຽມກ່ອນ ຫຼື ມີຄົນຖືໜັງສືຜ່ານແດນຂອງທ່ານ. ທີມງານແກ້ໄຂກົດເຫຼົ່ານີ້ໄດ້.',
          'ຫຼັງຈາກນັ້ນ AI ຈຶ່ງຂຽນຄຳອະທິບາຍສັ້ນໆ. AI ຮູ້ຜົນການກວດເຫຼົ່ານີ້ ແລະ ຕ້ອງບໍ່ຂັດແຍ້ງກັບມັນ.'] },
      { h: 'ຄວາມໝາຍຂອງຜົນ', list: ['🟢 ເບິ່ງຄືວ່າປອດໄພ: ທີ່ຢູ່ກົງກັບເວັບທາງການທີ່ເຮົາຮູ້ຈັກ. ບໍ່ແມ່ນຄຳສັນຍາ.', '🟡 ຄວນລະວັງ: ມີສັນຍານເຕືອນບາງຢ່າງ ຫຼື ເຮົາເຫັນຂໍ້ມູນບໍ່ພໍ ເຊັ່ນ ລິ້ງສັ້ນ.', '🔴 ອາດເປັນການຫຼອກລວງ: ພົບສັນຍານເຕືອນທີ່ຊັດເຈນ.', '⚪ ບອກບໍ່ໄດ້: ບໍ່ມີຫຍັງທີ່ເຮົາກວດໄດ້ທັງສອງທາງ. ນີ້ບໍ່ແມ່ນຜົນທີ່ປອດໄພ.'] },
      { h: 'ສິ່ງທີ່ມັນເຮັດບໍ່ໄດ້', list: ['ມັນບໍ່ສາມາດແນ່ໃຈໄດ້. ເວັບຫຼອກລວງໃໝ່ອາດຍັງບໍ່ຢູ່ໃນບັນຊີໃດ ແລະ ເວັບທີ່ເບິ່ງຄືແທ້ກໍ່ອາດເປັນການຫຼອກລວງ.', 'ມັນເປີດລິ້ງ, ໂທເບີ ຫຼື ເຫັນວ່າໃຜຢູ່ເບື້ອງຫຼັງຂໍ້ຄວາມບໍ່ໄດ້.', 'AI ອາດຜິດພາດໄດ້. ສຳລັບເລື່ອງສຳຄັນ ໃຫ້ກວດກັບອົງການທາງການເອງ, ຖາມຜູ້ໃຫຍ່ທີ່ໄວ້ໃຈ ຫຼື ໂທສາຍດ່ວນ: 1362 (ສະຫະພັນແມ່ຍິງລາວ, ບໍ່ເສຍຄ່າ, 24 ຊົ່ວໂມງ).'] },
      { h: 'ຂໍ້ມູນຂອງທ່ານ', list: ['ສິ່ງທີ່ທ່ານວາງຖືກສົ່ງໄປເຊີບເວີຂອງ Sati ເພື່ອກວດ. ລິ້ງອາດຖືກສົ່ງໄປ Google Safe Browsing ແລະ ຊື່ໂດເມນຖືກສົ່ງໄປບໍລິການ RDAP.', 'ຂໍ້ຄວາມຖືກສົ່ງໃຫ້ຜູ້ໃຫ້ບໍລິການ AI ຂອງເຮົາເພື່ອຂຽນຄຳອະທິບາຍ. ຢ່າວາງລະຫັດຜ່ານ, ລະຫັດ OTP, PIN ທະນາຄານ ຫຼື ເລກບັດປະຈຳຕົວ.', 'ກຸ່ມອາຍຸຂອງທ່ານປ່ຽນແຕ່ວິທີຂຽນຄຳຕອບ. ມັນບໍ່ຖືກບັນທຶກພ້ອມຄຳຖາມ.', 'ເຮົານັບຈຳນວນການກວດຕໍ່ມື້ເພື່ອໃຫ້ບໍລິການຍຸຕິທຳ. ຄຳຖາມກ່ຽວກັບຂໍ້ມູນ: satisampasanya@gmail.com.'] },
    ],
  },
} as const;

export function AboutAi() {
  const [lang, setLang] = useState<Lang>(read);
  const t = COPY[lang];
  const pick = (l: Lang) => { setLang(l); try { localStorage.setItem('sati-lang', l); } catch { /* storage blocked */ } document.documentElement.lang = l; };
  return (
    <main lang={lang} className="min-h-screen bg-background text-foreground font-lao">
      <div className="mx-auto max-w-2xl px-5 py-6 text-[18px] leading-[1.7]">
        <div className="flex items-center justify-between gap-3 mb-6">
          <a href="/" className="font-bold text-primary underline">← {t.back}</a>
          <div role="group" aria-label="Language" className="inline-flex rounded-full border border-border p-0.5">
            {(['en', 'lo'] as const).map(l => <button key={l} type="button" aria-pressed={lang === l} onClick={() => pick(l)} className={`px-3 min-h-9 rounded-full text-sm font-bold ${lang === l ? 'bg-primary text-primary-foreground' : ''}`}>{l === 'en' ? 'EN' : 'ລາວ'}</button>)}
          </div>
        </div>
        <h1 className="text-3xl font-extrabold mb-6">{t.title}</h1>
        {t.sections.map(s => (
          <section key={s.h} className="mb-7">
            <h2 className="text-xl font-extrabold mb-2">{s.h}</h2>
            {'p' in s && s.p.map((p, i) => <p key={i} className="mb-2">{p}</p>)}
            {'list' in s && <ul className="list-disc pl-6 grid gap-2">{s.list.map((x, i) => <li key={i}>{x}</li>)}</ul>}
          </section>
        ))}
      </div>
    </main>
  );
}
