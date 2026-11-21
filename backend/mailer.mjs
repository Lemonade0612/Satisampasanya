// Mailer interface: { send({ to, subject, text }) }. MAIL_TRANSPORT=console (default) or smtp.
// SMTP needs the `nodemailer` package (not installed yet: follow-up) plus SMTP_URL and MAIL_FROM. Without them the console transport is used.
export function consoleTransport({ log = console.log, production = process.env.NODE_ENV === 'production' } = {}) {
  return {
    name: 'console',
    // In production the body (it holds a reset link) is never written to logs.
    async send({ to, subject, text }) { log(production ? `[mail:console] "${subject}" for ${to.replace(/^(.).*(@.*)$/, '$1***$2')} not delivered: no mail transport configured` : `[mail:console] To: ${to}\nSubject: ${subject}\n${text}`); return { delivered: false }; },
  };
}
export async function createMailer(env = process.env, { log = console.log } = {}) {
  if ((env.MAIL_TRANSPORT || 'console') === 'smtp') {
    try {
      if (!env.SMTP_URL || !env.MAIL_FROM) throw new Error('SMTP_URL and MAIL_FROM are required');
      const nodemailer = (await import('nodemailer')).default;
      const transport = nodemailer.createTransport(env.SMTP_URL);
      return { name: 'smtp', async send({ to, subject, text }) { await transport.sendMail({ from: env.MAIL_FROM, to, subject, text }); return { delivered: true }; } };
    } catch (error) { log(`[mail] SMTP unavailable (${error.message}); using the console transport.`); }
  }
  return consoleTransport({ log });
}
export const resetMail = (token, lang = 'en', base = process.env.APP_URL || 'http://localhost:5173') => {
  const link = `${base.replace(/\/$/, '')}/?reset=${token}`;
  return lang === 'lo'
    ? { subject: 'ຕັ້ງລະຫັດຜ່ານ Sati ໃໝ່', text: `ກົດລິ້ງນີ້ເພື່ອຕັ້ງລະຫັດຜ່ານໃໝ່ (ໃຊ້ໄດ້ 15 ນາທີ):\n${link}\nຖ້າທ່ານບໍ່ໄດ້ຂໍ, ບໍ່ຕ້ອງເຮັດຫຍັງ.` } // REVIEW-LO
    : { subject: 'Reset your Sati password', text: `Open this link to set a new password (valid for 15 minutes):\n${link}\nIf you did not ask for this, ignore this email.` };
};
