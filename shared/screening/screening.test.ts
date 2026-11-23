import { describe, expect, it } from "vitest";
import { screenPost, type FlagId } from "./index";

const ids = (t: string, link?: string) => screenPost(t, link).flags.map((f) => f.id);
const has = (t: string, id: FlagId, link?: string) => expect(ids(t, link)).toContain(id);
const lacks = (t: string, id: FlagId, link?: string) => expect(ids(t, link)).not.toContain(id);

const CHINESE_EN = "Free Chinese Language Course! Starts Nov 15, 2026, 17:30–19:00, China Cultural Center, Vientiane. Limited seats! Phone/WhatsApp: 020 5555 5555. Or scan the QR code.";
const CHINESE_NO_PHONE = "Free Chinese Language Course! Starts Nov 15, 2026, 17:30–19:00, China Cultural Center, Vientiane. Limited seats! Contact on WhatsApp or scan the QR code.";
const CHINESE_LO = "ຮຽນພາສາຈີນຟຣີ! ສູນວັດທະນະທຳຈີນ ວຽງຈັນ. ຈຳນວນຈຳກັດ! ທັກ WhatsApp ຫຼື ສະແກນ QR";

describe("the original bug: friendly lure post", () => {
  it("English with a phone number is blocked, with every lure signal listed", () => {
    const r = screenPost(CHINESE_EN);
    expect(r.state).toBe("blocked");
    for (const f of ["free_offer", "urgency", "private_contact", "qr_only", "authority_name", "phone"] as FlagId[]) expect(r.flags.map((x) => x.id)).toContain(f);
  });
  it("without the number it is flagged, never clean", () => {
    const r = screenPost(CHINESE_NO_PHONE);
    expect(r.state).toBe("flagged");
    expect(r.flags.map((f) => f.id)).toEqual(expect.arrayContaining(["free_offer", "urgency", "private_contact", "qr_only"]));
  });
  it("Lao version is flagged", () => {
    const r = screenPost(CHINESE_LO);
    expect(r.state).toBe("flagged");
    expect(r.flags.map((f) => f.id)).toEqual(expect.arrayContaining(["free_offer", "urgency", "private_contact", "qr_only"]));
  });
  it("is deterministic: same input, same output, no randomness", () => {
    const a = JSON.stringify(screenPost(CHINESE_NO_PHONE));
    for (let i = 0; i < 20; i++) expect(JSON.stringify(screenPost(CHINESE_NO_PHONE))).toBe(a);
  });
});

describe("profanity", () => {
  it("English, leetspeak, masked, spaced, stretched", () => {
    for (const t of ["fuck this app", "this is sh1t honestly", "f*ck you all", "what a b!tch move", "f u c k off", "fuuuuck this"]) expect(screenPost(t).state, t).toBe("false");
  });
  it("Lao", () => expect(screenPost("ເຢັດແມ່ມຶງ").state).toBe("false"));
  it("class / assess / Scunthorpe-style words stay clean", () => {
    for (const t of ["Our class assessment about online scams is tomorrow", "I passed the classic scam awareness quiz today"]) lacks(t, "profanity");
  });
  it("Lao look-alikes: village, fruit, company", () => {
    for (const t of ["ບ້ານຂອງຂ້ອຍຢູ່ໃກ້ແມ່ນ້ຳ ແລະ ມີໝາກມ່ວງຫຼາຍ", "ບໍລິສັດນີ້ເປັນບໍລິສັດທີ່ມີໃບອະນຸຍາດ ກວດໄດ້"]) lacks(t, "profanity");
  });
});

describe("animal_insults", () => {
  it("aimed at a person", () => {
    has("ມຶງແມ່ນໝາ", "animal_insults");
    has("you pig, nobody likes you", "animal_insults");
    has("ໄອ້ຄວາຍ ໂງ່ແທ້", "animal_insults");
  });
  it("plain mentions are fine", () => {
    lacks("My dog is so cute today and loves long walks", "animal_insults");
    lacks("ໝາຂອງຂ້ອຍໜ້າຮັກ", "animal_insults");
    lacks("ໝາກໄມ້ໃນຕະຫຼາດມື້ນີ້ສົດຫຼາຍ", "animal_insults");
  });
});

describe("bullying and hate speech", () => {
  it("bullying", () => { has("everyone in class should ignore her, she is ugly", "bullying"); has("kys nobody wants you", "bullying"); });
  it("not bullying", () => { lacks("The ugly truth about job scams is that they target students", "bullying"); lacks("Be kind and include everyone in the group", "bullying"); });
  it("hate speech is red", () => { const r = screenPost("Foreigners are all trash and criminals"); expect(r.flags.map((f) => f.id)).toContain("hate_speech"); expect(r.state).toBe("false"); });
  it("not hate speech", () => lacks("Foreigners and Lao people can both be victims of job scams", "hate_speech"));
});

describe("political_claims", () => {
  it("sarcasm about the government is flagged", () => {
    expect(screenPost("The government is corrupt lol, sure they care about us").state).toBe("flagged");
    has("The government is corrupt lol, sure they care about us", "political_claims");
  });
  it("rest/holiday ພັກ is not political", () => lacks("ວັນພັກນີ້ພວກເຮົາໄປພັກຜ່ອນທີ່ນ້ຳຕົກ ຫຼາຍຄົນມາຫຼິ້ນນຳ", "political_claims"));
  it("news from a trusted source is not flagged", () => lacks("The minister opened a new anti-trafficking unit today https://www.laotiantimes.com/news", "political_claims"));
});

describe("lures", () => {
  it("job in Thailand with Telegram is red", () => expect(screenPost("Job in Thailand 15,000 baht/month, DM Telegram").state).toBe("false"));
  it("deposit ask in Lao is red", () => expect(screenPost("ໂອນເງິນມັດຈຳ 200,000 ກີບ").state).toBe("false"));
  it("free Robux bait is flagged", () => expect(screenPost("Free Robux! Click bit.ly/free-rbx and log in now").state).toBe("flagged"));
  it("free offer alone is fine", () => { const r = screenPost("Our library offers a free story hour for kids every Saturday morning"); expect(r.state).toBe("clean"); has("Our library offers a free story hour for kids every Saturday morning", "free_offer"); });
  it("urgency negative", () => lacks("We meet every week in the hall at the school", "urgency"));
  it("private_contact negative: 'never message on WhatsApp' is advice", () => lacks("Real recruiters never ask you to chat only on WhatsApp", "private_contact"));
  it("qr_only is dropped when a trusted link is given", () => lacks("Scan the QR code or read https://www.iom.int/safe-migration", "qr_only"));
  it("authority name with a trusted link is verified", () => lacks("The embassy published guidance: https://www.mofa.gov.la/news", "authority_name"));
  it("authority name with no link is a signal", () => has("Embassy scholarship open for students", "authority_name"));
  it("money_ask is negated by 'never'", () => { lacks("Never pay a deposit to get a job", "money_ask"); has("Pay a deposit to get your job", "money_ask"); });
  it("'never mind' does not hide a real deposit ask", () => has("Never mind the rules, send a deposit today", "money_ask"));
  it("job abroad needs a second signal; a story does not trigger", () => { lacks("My cousin almost went to work in Thailand, glad we checked first", "job_abroad"); has("Hiring! Work in Cambodia, DM me", "job_abroad"); });
  it("emotional manipulation", () => { has("SHOCKING!!! Share before deleted", "emotional_manipulation"); lacks("The workshop on scam awareness starts at nine", "emotional_manipulation"); });
  it("credential request", () => { has("Free UC! just send your ID and password to me", "credential_request"); lacks("Never share your password with anyone", "credential_request"); });
  it("trafficking signs", () => { has("We keep your passport during the contract", "trafficking_signs"); has("ບໍ່ຕ້ອງມີພາສປອດ ຂ້າມແດນໃຫ້", "trafficking_signs"); lacks("Never let anyone hold your passport", "trafficking_signs"); });
});

describe("links", () => {
  it("shorteners, http and lookalikes are suspicious", () => {
    has("Check this out bit.ly/abc123 for the safety guide today", "suspicious_link");
    has("Read the guide at http://example.org/guide for the details", "suspicious_link");
    has("Official page: https://gov.la.login-secure.com/verify for scam help", "suspicious_link");
  });
  it("trusted https link is a positive signal, not suspicious", () => {
    const t = "Safe migration advice for workers, read https://www.iom.int/migrants";
    has(t, "source_link_provided"); lacks(t, "suspicious_link");
  });
  it("tip with a gov.la link is clean plus source_link_provided", () => {
    const r = screenPost("Tip: check job offers with the labour ministry first", "https://www.laopdr.gov.la/jobs");
    expect(r.state).toBe("clean");
    expect(r.flags.map((f) => f.id)).toContain("source_link_provided");
  });
  it("source link lowers the score", () => {
    const a = screenPost("Free safe-migration workshop this Friday at the community hall");
    const b = screenPost("Free safe-migration workshop this Friday at the community hall", "https://www.iom.int");
    expect(b.score).toBeLessThan(a.score);
  });
});

describe("privacy is always blocked", () => {
  const cases: [string, FlagId][] = [
    ["Call me 020 5555 1234", "phone"], ["+856 20 9876 5432 for details", "phone"], ["WhatsApp 030 555 1234 now", "phone"], ["Thai line 081 234 5678 text", "phone"],
    ["my email is noy.lao@gmail.com", "email"], ["Passport no. P1234567", "passport_no"], ["ບັດປະຈຳຕົວ ເລກ 0123456789", "id_card"],
    ["BCEL account 010 12 00 123456789", "bank_account"], ["I'm at 17.9757, 102.6331 come now", "location_sharing"],
    ["https://maps.app.goo.gl/abc123 meet here", "location_sharing"], ["ເຮືອນຂ້ອຍຢູ່ບ້ານໂພນໄຊ ໜ່ວຍ 5", "location_sharing"], ["໐໒໐ ໕໕໕໕ ໑໒໓໔ ໂທມາ", "phone"],
  ];
  for (const [t, id] of cases) it(`${id}: ${t}`, () => { const r = screenPost(t); expect(r.state).toBe("blocked"); expect(r.flags.map((f) => f.id)).toContain(id); });
  it("hotline numbers are allowed", () => {
    expect(screenPost("Call 1300 if you see a fake job ad at your school").state).toBe("clean");
    expect(ids("Call 1300 if you see a fake job ad at your school")).not.toContain("phone");
  });
  it("amounts, dates and times are not phone numbers", () => {
    const r = screenPost("The scam cost her 2,000,000 kip on 15/11/2026 between 17:30–19:00 in Vientiane");
    expect(r.state).toBe("clean");
  });
  it("a zero-width trick does not hide a number", () => expect(screenPost("020​ 5555​ 1234 call").state).toBe("blocked"));
});

describe("short and off-topic", () => {
  it("very short is flagged low", () => { const r = screenPost("lol"); expect(r.state).toBe("flagged"); expect(r.severity).toBe("low"); has("lol", "very_short_content"); });
  it("long enough is not short", () => lacks("Always verify a job offer with the labour office", "very_short_content"));
  it("off topic is flagged", () => has("Look at my lunch, sticky rice and laap", "off_topic"));
  it("on-topic mention of food is fine", () => lacks("Scammers sell fake lunch vouchers, report them", "off_topic"));
});

describe("other content checks", () => {
  it("sexual and dangerous content are red", () => {
    expect(screenPost("Free porn videos click here now").state).toBe("false");
    expect(screenPost("ຂາຍຢາບ້າ ທັກມາໄດ້ເລີຍ").state).toBe("false");
  });
  it("misinformation is flagged", () => has("This miracle cure fixes everything", "misinformation"));
  it("hotline_present and bilingual boosts", () => {
    has("ຖ້າເຫັນປະກາດວຽກໜ້າສົງໄສ ໃຫ້ໂທ 1300", "hotline_present");
    has("ລະວັງວຽກຕ່າງປະເທດ ແລະ ຢ່າໂອນເງິນໃຫ້ໃຜ. Beware of fake job offers abroad and never transfer money", "bilingual_content");
    lacks("Stay safe online", "bilingual_content");
  });
});
