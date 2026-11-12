// Official documents listed in Explore → ເອກະສານ. Each opens its source in the browser.
export type DocKind = 'notice' | 'guide' | 'plan';
export type OfficialDoc = { kind: DocKind; title: string; source: string; url: string };

export const DOC_KIND_LABEL: Record<DocKind, { lo: string; en: string }> = {
  notice: { lo: 'ແຈ້ງການ', en: 'Notice' }, guide: { lo: 'ຄູ່ມື', en: 'Guide' }, plan: { lo: 'ແຜນ', en: 'Plan' },
};

export const OFFICIAL_DOCS: OfficialDoc[] = [
  { kind: 'notice', title: 'ແຈ້ງເຕືອນທົ່ວປະເທດ ກ່ຽວກັບການຫຼອກລວງອອນລາຍ', source: 'ກະຊວງປ້ອງກັນຄວາມສະຫງົບ · 30 ກ.ຍ. 2025', url: 'https://laotiantimes.com/?p=130534' },
  { kind: 'notice', title: 'ເປີດສາຍດ່ວນ 1533 ລາຍງານການສໍ້ໂກງອອນລາຍ', source: 'ກະຊວງເຕັກໂນໂລຊີ ແລະ ການສື່ສານ · 29 ທ.ວ. 2025', url: 'https://kpl.gov.la/detail.aspx?id=96241' },
  { kind: 'guide', title: 'ຄວາມຮູ້ ຄວາມປອດໄພທາງໄຊເບີ', source: 'LaoCERT · PDF', url: 'https://laocert.gov.la/ftp_upload/CyberSecurityAwareness.pdf' },
  { kind: 'plan', title: 'ແຜນຍຸດທະສາດ 5 ປີ ຕ້ານການຄ້າມະນຸດ 2019–2023', source: 'Open Development Mekong', url: 'https://data.laos.opendevelopmentmekong.net/lo/laws_record/five-year-national-strategic-plan-for-counter-trafficking-in-persons-2019-2023' },
  { kind: 'plan', title: 'ທິດທາງຕ້ານການຄ້າມະນຸດ 2026–2030', source: 'ຄະນະກຳມະການແຫ່ງຊາດຕ້ານການຄ້າມະນຸດ · ມິ.ຖ. 2026', url: 'https://www.thestar.com.my/aseanplus/aseanplus-news/2026/06/11/laos-prioritises-human-trafficking-elimination' },
];

// Government figures for the stats card (National Committee for Anti-Human Trafficking, Jan 2025).
export const TRAFFICKING_STATS_2024 = { cases: 46, victims: 85, under18: 40 };
