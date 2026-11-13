// Copied from frontend/src/lib/hotlines.ts — keep in sync by hand (website must not import from frontend/).
// Lao help lines shown in Explore → ສາຍດ່ວນ. Update numbers here only.
// [VERIFY] marks entries still to be confirmed with the organisation before launch.
export type Hotline = { number: string; tel: string; name: { lo: string; en: string }; org?: { lo: string; en: string }; extra?: { lo: string; en: string }; tone: 'rose' | 'blue' | 'violet' | 'amber' | 'emerald' | 'sky' | 'slate'; verify?: boolean };
export type HotlineGroup = { title: { lo: string; en: string }; items: Hotline[] };

export const HOTLINES: HotlineGroup[] = [
  { title: { lo: 'ການຫຼອກລວງ ແລະ ອອນລາຍ', en: 'Scams and online' }, items: [
    { number: '1533', tel: '1533', tone: 'rose', name: { lo: 'ສູນຕ້ານການສໍ້ໂກງອອນລາຍ', en: 'Anti online fraud centre' }, org: { lo: 'ກະຊວງເຕັກໂນໂລຊີ ແລະ ການສື່ສານ', en: 'Ministry of Technology and Communications' }, extra: { lo: 'ເປີດ 24 ຊົ່ວໂມງ · ລາຍງານການຫຼອກລວງ', en: 'Open 24 hours · report scams' } },
    { number: 'LaoCERT', tel: '+85621254508', tone: 'blue', verify: true, name: { lo: 'ຖືກແຮັກ ຫຼື ຖືກຂົ່ມເຫັງອອນລາຍ', en: 'Hacked or harassed online' }, extra: { lo: '021 254 508 · report@laocert.gov.la', en: '021 254 508 · report@laocert.gov.la' } },
  ] },
  { title: { lo: 'ການຄ້າມະນຸດ, ຄວາມຮຸນແຮງ ແລະ ໄວໜຸ່ມ', en: 'Trafficking, violence and youth' }, items: [
    { number: '1362', tel: '1362', tone: 'violet', name: { lo: 'ສູນໃຫ້ຄຳປຶກສາ ແລະ ປົກປ້ອງແມ່ຍິງ ແລະ ເດັກ', en: 'Counselling and protection for women and children' }, org: { lo: 'ສະຫະພັນແມ່ຍິງລາວ', en: "Lao Women's Union" }, extra: { lo: '24/7 · WhatsApp 020 9613 1362', en: '24/7 · WhatsApp 020 9613 1362' } },
    { number: '1361', tel: '1361', tone: 'sky', name: { lo: 'ສາຍດ່ວນໄວໜຸ່ມ Noi Yakhoo', en: 'Noi Yakhoo youth line' }, org: { lo: 'ໃຫ້ຄຳປຶກສາໄວໜຸ່ມຍິງ', en: 'Counselling for young women' } },
    { number: '1300', tel: '1300', tone: 'emerald', name: { lo: 'ສາຍດ່ວນສັງຄົມ ປະເທດໄທ', en: 'Thailand social assistance hotline' }, org: { lo: 'ສຳລັບຄົນລາວທີ່ຢູ່ໄທ', en: 'For Lao people in Thailand' }, extra: { lo: '24 ຊົ່ວໂມງ · ມີພາສາລາວ', en: '24 hours · Lao spoken' } },
  ] },
  { title: { lo: 'ສຸກເສີນ', en: 'Emergency' }, items: [
    { number: '1191', tel: '1191', tone: 'blue', name: { lo: 'ຕຳຫຼວດ', en: 'Police' } },
    { number: '1195', tel: '1195', tone: 'rose', name: { lo: 'ລົດໂຮງໝໍ', en: 'Ambulance' } },
    { number: '1190', tel: '1190', tone: 'amber', name: { lo: 'ດັບເພີງ', en: 'Fire' } },
    { number: '021 251 128', tel: '+85621251128', tone: 'slate', name: { lo: 'ຕຳຫຼວດທ່ອງທ່ຽວ', en: 'Tourist police' }, org: { lo: 'ນະຄອນຫຼວງວຽງຈັນ', en: 'Vientiane Capital' } },
  ] },
]; // REVIEW-LO
