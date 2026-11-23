// Official documents listed in Explore → ເອກະສານ. Each opens its source in the browser.
export type DocKind = 'notice' | 'guide' | 'plan' | 'report';
export type OfficialDoc = { kind: DocKind; title: string; source: string; url: string; en: { title: string; source: string } };

export const DOC_KIND_LABEL: Record<DocKind, { lo: string; en: string }> = {
  notice: { lo: 'ແຈ້ງການ', en: 'Notice' }, guide: { lo: 'ຄູ່ມື', en: 'Guide' }, plan: { lo: 'ແຜນ', en: 'Plan' }, report: { lo: 'ລາຍງານ', en: 'Report' },
};

export const OFFICIAL_DOCS: OfficialDoc[] = [
  { kind: 'notice', title: 'ແຈ້ງເຕືອນທົ່ວປະເທດ ກ່ຽວກັບການຫຼອກລວງອອນລາຍ', source: 'ກະຊວງປ້ອງກັນຄວາມສະຫງົບ · 30 ກ.ຍ. 2025', url: 'https://laotiantimes.com/?p=130534', en: { title: "Nationwide warning about online scams", source: "Ministry of Public Security · 30 Sep 2025" } },
  { kind: 'notice', title: 'ເປີດສາຍດ່ວນ 1533 ລາຍງານການສໍ້ໂກງອອນລາຍ', source: 'ກະຊວງເຕັກໂນໂລຊີ ແລະ ການສື່ສານ · 29 ທ.ວ. 2025', url: 'https://kpl.gov.la/detail.aspx?id=96241', en: { title: "Hotline 1533 opens to report online fraud", source: "Ministry of Technology and Communications · 29 Dec 2025" } },
  { kind: 'guide', title: 'ຄວາມຮູ້ ຄວາມປອດໄພທາງໄຊເບີ', source: 'LaoCERT · PDF', url: 'https://laocert.gov.la/ftp_upload/CyberSecurityAwareness.pdf', en: { title: "Cyber security awareness guide", source: "LaoCERT · PDF · Lao" } },
  { kind: 'plan', title: 'ແຜນຍຸດທະສາດ 5 ປີ ຕ້ານການຄ້າມະນຸດ 2019–2023', source: 'Open Development Mekong', url: 'https://data.laos.opendevelopmentmekong.net/lo/laws_record/five-year-national-strategic-plan-for-counter-trafficking-in-persons-2019-2023', en: { title: "5-year national strategy against human trafficking 2019–2023", source: "Open Development Mekong" } },
  { kind: 'plan', title: 'ທິດທາງຕ້ານການຄ້າມະນຸດ 2026–2030', source: 'ຄະນະກຳມະການແຫ່ງຊາດຕ້ານການຄ້າມະນຸດ · ມິ.ຖ. 2026', url: 'https://www.thestar.com.my/aseanplus/aseanplus-news/2026/06/11/laos-prioritises-human-trafficking-elimination', en: { title: "Anti-trafficking direction 2026–2030", source: "National Committee on Anti-Human Trafficking · Jun 2026" } },
  { kind: 'report', title: 'ລາຍງານ UNODC: ການຄ້າມະນຸດເພື່ອບັງຄັບເຮັດວຽກສໍ້ໂກງອອນລາຍ ໃນອາຊີຕາເວັນອອກສຽງໃຕ້ (ASEAN)', source: 'UNODC · PDF · ພາສາອັງກິດ', url: 'https://www.unodc.org/roseap/uploads/documents/Publications/2023/TiP_for_FC_Policy_Report.pdf', en: { title: "UNODC report: trafficking for forced online-scam work in Southeast Asia (ASEAN)", source: "UNODC · PDF · English" } },
  { kind: 'plan', title: 'ສົນທິສັນຍາອາຊຽນ ວ່າດ້ວຍການຕ້ານການຄ້າມະນຸດ (ACTIP)', source: 'ອາຊຽນ (ASEAN) · asean.org', url: 'https://asean.org/our-communities/asean-political-security-community/rules-based-people-oriented-people-centred/asean-convention-against-trafficking-in-persons/', en: { title: "ASEAN Convention Against Trafficking in Persons (ACTIP)", source: "ASEAN · asean.org" } },
  { kind: 'report', title: 'ລາຍງານ ແລະ ຂໍ້ມູນ ການຄ້າມະນຸດ ໃນພາກພື້ນອາຊຽນ', source: 'UNODC ພາກພື້ນອາຊີຕາເວັນອອກສຽງໃຕ້', url: 'https://www.unodc.org/roseap/', en: { title: "Reports and data on human trafficking in the ASEAN region", source: "UNODC Regional Office for Southeast Asia" } },
];

// Government figures for the stats card (National Committee for Anti-Human Trafficking, Jan 2025).
export const TRAFFICKING_STATS_2024 = { cases: 46, victims: 85, under18: 40 };
