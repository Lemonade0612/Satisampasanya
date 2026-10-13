// ═══════════════════════════════════════════════════════════════════════════════
//  COMPREHENSIVE AI SCREENING ENGINE v2.0
//  Covers: Profanity, Off-topic, Bias/Bullying, Credibility, Queue Management
// ═══════════════════════════════════════════════════════════════════════════════

import { Post, AIAnalysisResult, ScreeningLog, ScreeningStage } from "./types";
import { AI_SCREENING_CONFIG } from "./constants";

// ═══════════════════════════════════════════════════════════════════════════════
//  CONTENT POLICY DATABASE (Bilingual: EN + LO)
// ═══════════════════════════════════════════════════════════════════════════════

const CONTENT_POLICIES = {
  // ── PROFANITY & VULGAR LANGUAGE ──
  profanityEn: [
    "fuck", "fucking", "fucked", "shit", "shitty", "bitch", "asshole", "damn", "crap", "hell",
    "bastard", "dick", "pussy", "cock", "whore", "slut", "cunt",
    "motherfucker", "bullshit", "piss", "wanker", "twat",
  ],
  profanityLo: [
    "ຫໍາ", "ແຕດ", "ບັກຊາດໝາ",
    "ຄວາຍຊາດ", "ຫີຊາດ", "ໝາຊາດ", "ເຈົ້າໂງ່", "ຄົນຂີ້ຄ້ານ",
    "ຂີ້ຄ້ານ", "ຂີ້ລາຍ", "ຂີ້ຕົວ", "ຂີ້ກະໂປກ", "ຂີ້ກະໂປກ",
    "ຂີ້ກະໂປກ", "ຂີ້ກະໂປກ", "ຂີ້ກະໂປກ",
  ],

  // ── SEXUAL CONTENT ──
  sexualEn: [
    "sex", "porn", "nude", "naked", "xxx", "adult content",
    "escort", "prostitute", "brothel", "sexual", "explicit",
    "onlyfans", "cam girl", "hookup", "nsfw",
  ],
  sexualLo: [
    "ຮ່ວມເພດ", "ເປືອຍ", "ຮ່ວມຮ່າງ", "xxx",
    "ຄ້າປະເວນີ", "ໂສເພນີ", "ບ່ອນຄ້າປະເວນີ", "ຄ້າບໍລິການ",
    "ຮູບເປືອຍ", "ວີດີໂອເປືອຍ", "ຄວາມສຳພັນ",
  ],

  // ── ANIMAL-RELATED INSULTS ──
  animalInsultsEn: [
    "you pig", "you dog", "you rat", "you monkey", "you donkey",
    "filthy animal", "like a dog", "dirty pig",
  ],
  animalInsultsLo: [
    "ມຶງຄວາຍ", "ມຶງຄືໝາ", "ບັກຊາດໝາ",
  ],

  // ── BIAS / DISCRIMINATION ──
  biasEn: [
    "stupid lao", "laos is poor", "backward", "inferior",
    "all lao people", "women can't", "men only", "racist",
    "discriminate", "prejudice", "stereotype", "xenophobic",
    "hate speech", "ethnic slur", "racial", "homophobic",
    "transphobic", "sexist", "misogynist", "ableist",
  ],
  biasLo: [
    "ຄົນລາວໂງ່", "ລາວທຸກຍາກ", "ລົດຖ້ອຍ", "ຕ່ຳຕ້ອຍ",
    "ຄົນລາວທຸກ", "ຜູ້ຍິງບໍ່ສາມາດ", "ຜູ້ຊາຍເທົ່ານັ້ນ", "ເຫຍື້ອຊາດ",
    "ກີດກັນ", "ລັດຖະນິຍົມ", "ຄຳສັບນິຍົມ", "ກຽດຊັງ",
    "ຄຳເວົ້າກຽດຊັງ", "ກີດກັນທາງເພດ", "ກີດກັນທາງຊາດ",
    "ກີດກັນທາງສາສະໜາ", "ກີດກັນທາງຊົນເຜົ່າ",
  ],

  // ── BULLYING / HARASSMENT ──
  bullyingEn: [
    "kill yourself", "kys", "die", "worthless", "nobody likes you",
    "ugly", "fat", "loser", "pathetic", "lame", "idiot", "moron",
    "retard", "dumb", "stupid", "shut up", "go away", "get lost",
    "mocking", "ridicule", "humiliate", "embarrass", "shame",
  ],
  bullyingLo: [
    "ໄປຕາຍ", "ຕາຍໄປ", "ບໍ່ມີຄ່າ", "ບໍ່ມີໃຜມັກ", "ໜ້າກຽດ",
    "ເຈົ້າໂງ່", "ມຶງໂງ່",
    "ປິດປາກ", "ມຶງໄປໄກ", "ມຶງຫາຍໄປ", "ເຍາະເຍີ້ຍ", "ຢີ່ຫີ່",
    "ອັບອາຍ", "ຂາຍໜ້າ", "ຂົ່ມເຫັງ", "ຂົ່ມຂີ່",
  ],

  // ── OFF-TOPIC CONTENT ──
  offTopicEn: [
    "going travel", "travel vlog", "vacation", "holiday trip",
    "my new car", "bought a house", "flexing", "showing off",
    "check out my", "follow me", "subscribe", "like and share",
    "food review", "restaurant", "cooking recipe", "fashion",
    "makeup tutorial", "gaming", "movie review", "music",
    "sports", "football", "basketball", "celebrity gossip",
    "dating", "relationship advice", "breakup", "crush",
    "party", "clubbing", "drinking", "night out",
    "shopping haul", "unboxing", "product review",
  ],
  offTopicLo: [
    "ໄປທ່ຽວ", "ທ່ຽວຫຼີ້ນ", "ພັກຜ່ອນ", "ທຣິບ",
    "ລົດໃໝ່", "ຊື້ເຮືອນ", "ອວດ", "ອວດຮວຍ", "ອວດຮັ່ງ",
    "ເບິ່ງຂອງຂ້ອຍ", "ຕິດຕາມຂ້ອຍ", "ກົດຕິດຕາມ", "ກົດແຊຣ໌",
    "ຮີວິວອາຫານ", "ຮ້ານອາຫານ", "ສູດອາຫານ", "ແຟຊັ່ນ",
    "ສອນແຕ່ງໜ້າ", "ເກມ", "ຮີວິວໜັງ", "ເພງ",
    "ກິລາ", "ບານ", "ບານສົກ", "ຂ່າວດາລາ",
    "ຄວາມຮັກ", "ຄຳແນະນຳ", "ເລີກກັນ", "ມັກ",
    "ງານປາຕີ", "ຄື້ນຄວາມ", "ດື່ມ", "ກາງຄືນ",
    "ຊື້ຂອງ", "ແກ້ກັ່ອງ", "ຮີວິວສິນຄ້າ",
  ],

  // ── CREDIBILITY INDICATORS (POSITIVE) ──
  credibilityEn: [
    "source", "report", "according to", "verified", "official",
    "police", "government", "ministry", "department", "authority",
    "rfa", "reuters", "bbc", "cnn", "al jazeera", "voa",
    "study shows", "research", "data", "statistics", "reported",
    "hotline", "helpline", "contact", "report to", "file complaint",
    "cybercrime.gov.la", "021-212-516", "1800", "1515",
    "lao youth union", "lao women union", "lao front",
    "who", "unicef", "undp", "world bank", "imf",
    "press release", "statement", "announcement",
    "document", "evidence", "proof", "witness",
  ],
  credibilityLo: [
    "ແຫຼ່ງຂໍ້ມູນ", "ລາຍງານ", "ອີງຕາມ", "ຢືນຢັນ", "ທາງການ",
    "ຕຳຫຼວດ", "ລັດຖະບານ", "ກະຊວງ", "ພະແນກ", "ອຳນາດການປົກຄອງ",
    "ສື່", "ຂ່າວ", "ສຳນັກຂ່າວ", "ວິທະຍຸ",
    "ການສຶກສາ", "ການຄົ້ນຄວ້າ", "ຂໍ້ມູນ", "ສະຖິຕິ", "ລາຍງານ",
    "ສາຍດ່ວນ", "ສາຍໂທຟຣີ", "ຕິດຕໍ່", "ລາຍງານ", "ຟ້ອງ",
    "cybercrime.gov.la", "021-212-516", "1800", "1515",
    "ສູນກາງຊາວໜຸ່ມ", "ສູນກາງສະຫະພັນແມ່ຍິງ", "ແນວລາວສ້າງຊາດ",
    "ອົງການ", "ສະຫະປະຊາຊາດ", "ທະນາຄານໂລກ",
    "ຖະແຫຼງການ", "ຄຳຖະແຫຼງ", "ປະກາດ",
    "ເອກະສານ", "ຫຼັກຖານ", "ພະຍານ",
  ],

  // ── BUSINESS / COMPANY MENTIONS (NEUTRAL - CHECK CREDIBILITY) ──
  businessEn: [
    "company", "corporation", "enterprise", "business", "firm",
    "ltd", "limited", "inc", "co.", "group",
    "bcel", "ldb", "acleda", "sacom", "apb", "jdb",
    "lao telecom", "unitel", "beeline", "etl",
    "lao airlines", "vietnam airlines", "thai airways",
    "mining", "hydropower", "construction", "factory",
  ],
  businessLo: [
    "ບໍລິສັດ", "ວິສາຫະກິດ", "ທຸລະກິດ", "ອົງກອນ", "ຮ້ານ",
    "ຈຳກັດ", "ສາມາດ", "ກຸ່ມ", "ຮ່ວມ",
    "ທະນາຄານ", "ບໍລິສັດທະນາຄານ", "ສະຫະກອນ",
    "ລາວທະນາຄານ", "ລາວວິທະຍຸ", "ຢູນີເຕວ", "ບີລາຍ",
    "ການບິນລາວ", "ການບິນ", "ຂຸດຄົ້ນ", "ໄຟຟ້າ", "ກໍ່ສ້າງ", "ໂຮງງານ",
  ],

  // ── SCAM INDICATORS ──
  scamEn: [
    "otp", "password", "pin", "bank account", "wire money", "transfer",
    "click link", "verify account", "suspended", "urgent", "limited time",
    "free money", "guaranteed return", "investment opportunity", "get rich",
    "act now", "exclusive deal", "winner", "lottery", "inheritance",
    "too good to be true", "no risk", "100% safe", "double your money",
    "whatsapp", "telegram", "facebook", "apk", "download file",
    "install app", "remote access", "screen share", "teamviewer",
    "anydesk", "cryptocurrency", "bitcoin", "crypto wallet",
    "private key", "seed phrase", "investment platform",
    "bcel", "scam", "fake", "fraud", "phishing", "malware",
    "job offer", "work from home", "easy money", "quick cash",
  ],
  scamLo: [
    "otp", "ລະຫັດ", "pin", "ບັນຊີ", "ໂອນເງິນ", "ເງິນ",
    "ກົດລິ້ງ", "ຢືນຢັນ", "ລົງທະບຽນ", "ດ່ວນ", "ຈຳກັດ",
    "ເງິນຟຣີ", "ຜົນຕອບແທນ", "ລົງທຶນ", "ຮວຍລວຍ",
    "ດຽວນີ້", "ຂໍ້ສະເໜີ", "ຖືກລາງວັນ", "ຫວຍ", "ມູນມໍລະດົກ",
    "ດີເກີນຈິງ", "ບໍ່ມີຄວາມສ່ຽງ", "ປອດໄພ 100%", "ເງິນຄູນ",
    "ແອັບ", "ໄຟລ", "ດາວໂຫຼດ", "ຕິດຕັ້ງ",
    "ເຂົ້າເຖິງ", "ແບ່ງປັນຫນ້າຈໍ", "ຄຣິບໂຕຄັນ",
    "ຄຣິບໂຕ", "ຄຣິບໂຕຄັນ", "ຄຣີບໂຕ", "ຄຣີບໂຕຄັນ",
    "ຫຼອກລວງ", "ປອມ", "ບໍ່ຖືກຕ້ອງ", "ລັກ", "ໄວຣັດ",
    "ສະເໜີວຽກ", "ເຮັດວຽກຢູ່ບ້ານ", "ເງິນງ່າຍ", "ເງິນໄວ",
  ],

  // ── TRAFFICKING INDICATORS ──
  traffickingEn: [
    "job in china", "job in thailand", "high salary", "no experience needed",
    "free accommodation", "free travel", "broker", "agent fee",
    "passport taken", "contract", "forced", "locked", "cannot leave",
    "border crossing", "illegal", "undocumented", "marriage broker",
    "matchmaking", "arranged marriage", "work permit", "visa assistance",
    "trafficking", "smuggled", "exploitation", "forced labor",
    "forced marriage", "sexual exploitation", "organ trafficking",
    "golden triangle", "myanmar", "cambodia", "laos border",
  ],
  traffickingLo: [
    "ວຽກໃນຈີນ", "ວຽກໃນໄທ", "ເງິນເດືອນສູງ", "ບໍ່ຕ້ອງມີປະສົບການ",
    "ທີ່ພັກຟຣີ", "ເດີນທາງຟຣີ", "ນາຍໜ້າ", "ຄ່າທຳນຽມ",
    "ເອົາໜັງສືຜ່ານແດນ", "ສັນຍາ", "ບັງຄັບ", "ລັອກ", "ອອກບໍ່ໄດ້",
    "ຂ້າມຊາຍແດນ", "ຜິດກົດໝາຍ", "ບໍ່ມີເອກະສານ", "ນາຍໜ້າແຕ່ງງານ",
    "ຈັດຫາຄູ່", "ແຕ່ງງານບັງຄັບ", "ໃບອະນຸຍາດ", "ຊ່ວຍເຫຼືອວີຊາ",
    "ຄ້າມະນຸດ", "ລັກລອບ", "ຂູດຮີດ", "ແຮງງານບັງຄັບ",
    "ການແຕ່ງງານບັງຄັບ", "ຂູດຮີດທາງເພດ", "ຄ້າອະໄວຍະວະ",
    "ສາມຫຼ່ຽມຄຳ", "ມຽນມາ", "ກຳປູເຈຍ", "ຊາຍແດນລາວ",
  ],

  // ── MISINFORMATION ──
  misinfoEn: [
    "government hiding", "conspiracy", "mainstream media lies",
    "doctors don't want you to know", "secret cure", "natural remedy",
    "they don't want you to know", "wake up", "sheep", "plandemic",
    "fake news", "hoax", "scamdemic", "controlled opposition",
    "pointless", "don't bother", "waste of time",
    "everyone knows", "trust me", "i heard", "someone told me",
    "no evidence needed", "obviously", "clearly", "everyone agrees",
  ],
  misinfoLo: [
    "ລັດບັງ", "ສົມຄົບຄິດ", "ສື່ຫຼັກໝົດຕົວ",
    "ແພດບໍ່ຢາກໃຫ້ຮູ້", "ຢາລັບ", "ຢາສະມຸນໄພ",
    "ບໍ່ຢາກໃຫ້ຮູ້", "ຕື່ນເຖິງ", "ກະບື", "ການລະບາດປອມ",
    "ຂ່າວປອມ", "ຫຼອກ", "ການລະບາດຫຼອກ", "ຝ່າຍຕົ້ນຕໍ່",
    "ໄຮ້ປະໂຫຍດ", "ຢ່າເສຍເວລາ", "ເສຍເວລາ",
    "ທຸກຄົນຮູ້", "ເຊື່ອຂ້ອຍ", "ຂ້ອຍໄດ້ຍິນ", "ມີຄົນບອກຂ້ອຍ",
    "ບໍ່ຕ້ອງການຫຼັກຖານ", "ແນ່ນອນ", "ຈະແຈ້ງ", "ທຸກຄົນເຫັນດີ",
  ],

  // ── DANGEROUS CONTENT ──
  dangerousEn: [
    "how to make", "bomb", "weapon", "harm yourself", "suicide",
    "kill", "attack", "violence", "terrorist", "extremist",
    "self-harm", "cutting", "overdose", "poison",
  ],
  dangerousLo: [
    "ວິທີເຮັດ", "ລະເບີດ", "ອາວຸດ", "ທຳຮ້າຍຕົວເອງ", "ຂ້າຕົວເອງ",
    "ຂ້າ", "ໂຈມຕີ", "ຄວາມຮຸນແຮງ", "ກໍ່ການຮ້າຍ", "ຫົວຮຸນແຮງ",
    "ທຳຮ້າຍຕົວເອງ", "ຕັດ", "ກິນຢາເກີນຂະໜາດ", "ພິດ",
  ],
};

// ═══════════════════════════════════════════════════════════════════════════════
//  EXPERT QUEUE MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════════

interface ExpertQueueItem {
  postId: string;
  priority: number; // 1-10, higher = more urgent
  submittedAt: number;
  aiSeverity: string;
  aiFlags: string[];
  estimatedReviewTime: number; // minutes
}

class ExpertQueueManager {
  private queue: ExpertQueueItem[] = [];
  private expertCount: number = 5; // Simulated expert panel
  private avgReviewTime: number = 15; // minutes per post

  addToQueue(item: ExpertQueueItem): void {
    // Sort by priority (descending) then by submission time
    this.queue.push(item);
    this.queue.sort((a, b) => {
      if (b.priority !== a.priority) return b.priority - a.priority;
      return a.submittedAt - b.submittedAt;
    });
  }

  getQueuePosition(postId: string): number {
    return this.queue.findIndex(item => item.postId === postId) + 1;
  }

  getEstimatedWaitTime(postId: string): number {
    const position = this.getQueuePosition(postId);
    if (position === 0) return 0;
    // Calculate based on available experts and queue position
    const postsPerHour = this.expertCount * (60 / this.avgReviewTime);
    return Math.ceil(position / postsPerHour * 60); // minutes
  }

  getQueueLength(): number {
    return this.queue.length;
  }

  // Simulate batch processing (every 30 minutes)
  processBatch(): string[] {
    const processed: string[] = [];
    const batchSize = Math.min(this.queue.length, this.expertCount * 2);

    for (let i = 0; i < batchSize; i++) {
      const item = this.queue.shift();
      if (item) processed.push(item.postId);
    }

    return processed;
  }

  // Auto-assign priority based on content
  static calculatePriority(severity: string, flags: string[]): number {
    let priority = 5; // default

    if (severity === "severe") priority = 10;
    else if (severity === "high") priority = 8;
    else if (severity === "medium") priority = 6;
    else if (severity === "low") priority = 3;
    else priority = 1;

    // Boost for dangerous content
    if (flags.some(f => f.includes("Dangerous") || f.includes("ທຳຮ້າຍ"))) {
      priority = Math.min(10, priority + 2);
    }

    // Boost for trafficking (high community risk)
    if (flags.some(f => f.includes("Trafficking") || f.includes("ຄ້າມະນຸດ"))) {
      priority = Math.min(10, priority + 1);
    }

    return priority;
  }
}

// Singleton instance
export const expertQueue = new ExpertQueueManager();

// ═══════════════════════════════════════════════════════════════════════════════
//  ANALYSIS ENGINE
// ═══════════════════════════════════════════════════════════════════════════════

function scanPatterns(content: string, enPatterns: string[], loPatterns: string[]): string[] {
  const contentLower = content.toLowerCase();
  const enMatches = enPatterns.filter(p => new RegExp(`(?<![a-z])${p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?![a-z])`, "i").test(contentLower));
  const loMatches = [...new Set(loPatterns)].filter(p => contentLower.includes(p.toLowerCase()));
  return [...enMatches, ...loMatches];
}

function detectLanguage(content: string): { hasEn: boolean; hasLo: boolean; isBilingual: boolean } {
  const hasEn = /[a-zA-Z]/.test(content);
  const hasLo = /[຀-໿]/.test(content);
  return { hasEn, hasLo, isBilingual: hasEn && hasLo };
}

/**
 * Comprehensive content analysis
 */
export function analyzePostContent(post: Post): AIAnalysisResult {
  const fullContent = (post.content + " " + (post.contentLo || "")).toLowerCase();
  const { hasEn, hasLo, isBilingual } = detectLanguage(fullContent);
  const flags: string[] = [];
  let severityScore = 0;
  let confidence = 0.85;
  let policyViolations: string[] = [];

  // ── 1. DANGEROUS CONTENT (Immediate Block) ──
  const dangerousMatches = scanPatterns(
    fullContent,
    CONTENT_POLICIES.dangerousEn,
    CONTENT_POLICIES.dangerousLo
  );
  if (dangerousMatches.length > 0) {
    return {
      severity: "severe",
      flags: ["🚨 Dangerous content detected — IMMEDIATE BLOCK", ...dangerousMatches.slice(0, 3).map(d => `Contains: "${d}"`)],
      confidence: 0.98,
      recommendedAction: "block",
      reasoning: "Content contains potentially dangerous or harmful information that violates platform safety guidelines. Blocked immediately.",
    };
  }

  // ── 2. PROFANITY & VULGAR LANGUAGE ──
  const profanityMatches = scanPatterns(
    fullContent,
    CONTENT_POLICIES.profanityEn,
    CONTENT_POLICIES.profanityLo
  );
  if (profanityMatches.length > 0) {
    severityScore += profanityMatches.length * 25;
    flags.push(`🤬 Profanity detected (${profanityMatches.length} words)`);
    policyViolations.push("profanity");
  }

  // ── 3. SEXUAL CONTENT ──
  const sexualMatches = scanPatterns(
    fullContent,
    CONTENT_POLICIES.sexualEn,
    CONTENT_POLICIES.sexualLo
  );
  if (sexualMatches.length > 0) {
    severityScore += sexualMatches.length * 30;
    flags.push(`🔞 Sexual content detected (${sexualMatches.length})`);
    policyViolations.push("sexual_content");
  }

  // ── 4. ANIMAL INSULTS ──
  const animalMatches = scanPatterns(
    fullContent,
    CONTENT_POLICIES.animalInsultsEn,
    CONTENT_POLICIES.animalInsultsLo
  );
  if (animalMatches.length > 0) {
    severityScore += animalMatches.length * 12;
    flags.push(`🐕 Animal insults detected (${animalMatches.length})`);
    policyViolations.push("animal_insults");
  }

  // ── 5. BIAS / DISCRIMINATION ──
  const biasMatches = scanPatterns(
    fullContent,
    CONTENT_POLICIES.biasEn,
    CONTENT_POLICIES.biasLo
  );
  if (biasMatches.length > 0) {
    severityScore += biasMatches.length * 20;
    flags.push(`⚠️ Bias/discrimination detected (${biasMatches.length})`);
    policyViolations.push("bias");
  }

  // ── 6. BULLYING / HARASSMENT ──
  const bullyingMatches = scanPatterns(
    fullContent,
    CONTENT_POLICIES.bullyingEn,
    CONTENT_POLICIES.bullyingLo
  );
  if (bullyingMatches.length > 0) {
    severityScore += bullyingMatches.length * 22;
    flags.push(`💔 Bullying/harassment detected (${bullyingMatches.length})`);
    policyViolations.push("bullying");
  }

  // ── 7. OFF-TOPIC CHECK ──
  const offTopicMatches = scanPatterns(
    fullContent,
    CONTENT_POLICIES.offTopicEn,
    CONTENT_POLICIES.offTopicLo
  );
  const hasSafetyContext = /scam|fraud|phishing|privacy|password|otp|trafficking|safety|protect|warning|verify|recruiter|passport|ຫຼອກ|ລະຫັດ|ປອດໄພ|ສ່ວນຕົວ|ຄ້າມະນຸດ|ເຕືອນ|ກວດສອບ|government|public service|service fees|fee schedule|receipt|civic|public interest|ລັດຖະບານ|ຄ່າທຳນຽມ|ໃບຮັບເງິນ/i.test(fullContent);

  if (!hasSafetyContext && (!post.repostOf || offTopicMatches.length > 0)) {
    severityScore += Math.max(1, offTopicMatches.length) * 8;
    flags.push("📵 Off-topic content detected — explain the connection to community safety or public-interest news");
    policyViolations.push("off_topic");
  }

  // ── 8. SCAM INDICATORS ──
  const scamMatches = scanPatterns(
    fullContent,
    CONTENT_POLICIES.scamEn,
    CONTENT_POLICIES.scamLo
  );
  if (scamMatches.length > 0) {
    severityScore += scamMatches.length * 15;
    flags.push(`💰 Scam indicators (${scamMatches.length})`);
  }

  // ── 9. TRAFFICKING INDICATORS ──
  const traffickingMatches = scanPatterns(
    fullContent,
    CONTENT_POLICIES.traffickingEn,
    CONTENT_POLICIES.traffickingLo
  );
  if (traffickingMatches.length > 0) {
    severityScore += traffickingMatches.length * 20;
    flags.push(`🚫 Trafficking indicators (${traffickingMatches.length})`);
  }

  // ── 10. MISINFORMATION ──
  const misinfoMatches = scanPatterns(
    fullContent,
    CONTENT_POLICIES.misinfoEn,
    CONTENT_POLICIES.misinfoLo
  );
  if (misinfoMatches.length > 0) {
    severityScore += misinfoMatches.length * 10;
    flags.push(`❓ Misinformation patterns (${misinfoMatches.length})`);
  }

  // ── 11. CREDIBILITY BOOSTERS ──
  const credibilityMatches = scanPatterns(
    fullContent,
    CONTENT_POLICIES.credibilityEn,
    CONTENT_POLICIES.credibilityLo
  );
  if (credibilityMatches.length > 0) {
    severityScore -= credibilityMatches.length * 8;
    flags.push(`✅ Credibility indicators (${credibilityMatches.length})`);
    confidence += 0.05;
  }

  // ── 12. BUSINESS/GOVERNMENT MENTIONS (Check for credibility) ──
  const businessMatches = scanPatterns(
    fullContent,
    CONTENT_POLICIES.businessEn,
    CONTENT_POLICIES.businessLo
  );
  if (businessMatches.length > 0) {
    // If business mentioned but no credibility indicators → flag
    if (credibilityMatches.length === 0) {
      severityScore += 15;
      flags.push(`🏢 Business mentioned without credible sources — needs verification`);
    } else {
      flags.push(`🏢 Business mentioned with credible backing`);
      severityScore -= 5;
    }
  }

  // ── 13. SOURCE LINK CHECK ──
  if (post.link && post.link.length > 10) {
    severityScore -= 15;
    flags.push("🔗 Source link provided");
    confidence += 0.05;
  }

  // ── 14. VISUAL EVIDENCE ──
  if (post.image || post.hasVideo) {
    severityScore -= 10;
    flags.push("📸 Visual evidence attached");
    confidence += 0.03;
  }

  // ── 15. TAG RELEVANCE ──
  const relevantTags = post.tags.filter(tag => {
    const tagLower = tag.toLowerCase();
    return fullContent.includes(tagLower) || 
           scamMatches.length > 0 && ["onlinescam", "phishingalert", "jobscam", "cryptoscam"].includes(tagLower) ||
           traffickingMatches.length > 0 && ["trafficking", "bordersafety"].includes(tagLower);
  });
  if (relevantTags.length === post.tags.length) {
    severityScore -= 5;
    flags.push("🏷️ Tags match content");
  }

  // ── 16. BILINGUAL BONUS ──
  if (isBilingual) {
    flags.push("🌐 Bilingual content (EN+LO) — broader reach");
    confidence += 0.02;
  }

  // ── 17. LENGTH CHECK ──
  const totalLength = post.content.length + (post.contentLo?.length || 0);
  if (totalLength < 100) {
    severityScore += 5;
    flags.push("⚠️ Very short content — limited context");
  } else if (totalLength > 500) {
    severityScore -= 5;
    flags.push("✅ Detailed content — more context");
  }

  // Normalize
  const normalizedScore = Math.max(0, severityScore);
  confidence = Math.min(0.99, Math.max(0.7, confidence));

  // ── DETERMINE FINAL VERDICT ──
  let severity: "none" | "low" | "medium" | "high" | "severe";
  let recommendedAction: "publish" | "publish_with_disclaimer" | "flag_for_review" | "block";

  // Policy violations override normal scoring
  const hasMajorViolation = policyViolations.some(v => 
    ["profanity", "sexual_content", "bias", "bullying"].includes(v)
  );

  if (hasMajorViolation && normalizedScore >= 40) {
    severity = "severe";
    recommendedAction = "flag_for_review";
  } else if (normalizedScore === 0) {
    severity = "none";
    recommendedAction = "publish";
  } else if (normalizedScore < 20) {
    severity = "low";
    recommendedAction = "publish";
  } else if (normalizedScore < 40) {
    severity = "medium";
    recommendedAction = "publish_with_disclaimer";
  } else if (normalizedScore < 60) {
    severity = "high";
    recommendedAction = "flag_for_review";
  } else {
    severity = "severe";
    recommendedAction = "flag_for_review";
  }

  // Off-topic with no safety relevance → freeze for expert
  if (policyViolations.includes("off_topic") && normalizedScore > 15) {
    recommendedAction = "flag_for_review";
    flags.push("🧊 FREEZED: Content appears off-topic — expert review required");
  }

  return {
    severity,
    flags: flags.length > 0 ? flags : ["✅ No issues detected"],
    confidence,
    recommendedAction,
    reasoning: generateReasoning(normalizedScore, severity, flags, policyViolations),
  };
}

function generateReasoning(
  score: number, 
  severity: string, 
  flags: string[],
  violations: string[]
): string {
  if (violations.length > 0) {
    return `Policy violations detected: ${violations.join(", ")}. Score: ${score}. Expert review recommended.`;
  }
  if (severity === "none") {
    return "Content appears safe and aligns with community guidelines. No concerning patterns detected.";
  }
  if (severity === "low") {
    return `Minor concerns (score: ${score}). Content can be published with standard monitoring.`;
  }
  if (severity === "medium") {
    return `Moderate risk (score: ${score}). Recommend publishing with disclaimer for user awareness.`;
  }
  if (severity === "high") {
    return `Significant concerns (score: ${score}). Expert review recommended: ${flags.slice(0, 2).join("; ")}.`;
  }
  return `Critical issues (score: ${score}). Immediate expert review required: ${flags.slice(0, 3).join("; ")}.`;
}

// ═══════════════════════════════════════════════════════════════════════════════
//  SCREENING PROCESS WITH QUEUE
// ═══════════════════════════════════════════════════════════════════════════════

export async function runAIScreening(
  post: Post,
  onProgress?: (progress: number) => void
): Promise<Post> {
  const startTime = Date.now();
  const analysis = analyzePostContent(post);
  const { isBilingual } = detectLanguage(post.content + " " + (post.contentLo || ""));

  // Simulate 30-minute processing
  const steps = 10;
  for (let i = 1; i <= steps; i++) {
    await delay(AI_SCREENING_CONFIG.AI_SCREENING_DURATION / steps / 60);
    if (onProgress) onProgress(Math.round((i / steps) * 100));
  }

  const logs: ScreeningLog[] = [
    {
      stage: "ai_screening",
      timestamp: startTime,
      message: `AI screening initiated. Languages: ${isBilingual ? "EN+LO" : "EN"}. Length: ${post.content.length} chars.`,
    },
    {
      stage: "ai_screening",
      timestamp: Date.now(),
      message: `Analysis complete. Severity: ${analysis.severity}. Confidence: ${Math.round(analysis.confidence * 100)}%.`,
      severity: analysis.severity === "none" ? "low" : analysis.severity as "low" | "medium" | "high" | "severe",
    },
  ];

  // Determine outcome
  let newState: Post["state"];
  let newStage: ScreeningStage;
  let expertDeadline: number | undefined;

  switch (analysis.recommendedAction) {
    case "publish":
      newState = "clean";
      newStage = "completed";
      logs.push({
        stage: "completed",
        timestamp: Date.now(),
        message: "✅ Post passed AI screening. Published with full interaction.",
      });
      break;

    case "publish_with_disclaimer":
      newState = "flagged";
      newStage = "expert_review";
      expertDeadline = Date.now() + AI_SCREENING_CONFIG.EXPERT_REVIEW_SLA;

      // Add to expert queue
      expertQueue.addToQueue({
        postId: post.id,
        priority: ExpertQueueManager.calculatePriority(analysis.severity, analysis.flags),
        submittedAt: Date.now(),
        aiSeverity: analysis.severity,
        aiFlags: analysis.flags,
        estimatedReviewTime: 15,
      });

      const waitTime = expertQueue.getEstimatedWaitTime(post.id);
      logs.push({
        stage: "expert_review",
        timestamp: Date.now(),
        message: `📋 Added to expert queue (position: #${expertQueue.getQueuePosition(post.id)}). Est. wait: ${waitTime} min.`,
        severity: "medium",
      });
      break;

    case "flag_for_review":
      newState = "flagged";
      newStage = "expert_review";
      expertDeadline = Date.now() + AI_SCREENING_CONFIG.EXPERT_REVIEW_SLA;

      expertQueue.addToQueue({
        postId: post.id,
        priority: ExpertQueueManager.calculatePriority(analysis.severity, analysis.flags),
        submittedAt: Date.now(),
        aiSeverity: analysis.severity,
        aiFlags: analysis.flags,
        estimatedReviewTime: 20,
      });

      const queuePos = expertQueue.getQueuePosition(post.id);
      const estWait = expertQueue.getEstimatedWaitTime(post.id);

      logs.push({
        stage: "expert_review",
        timestamp: Date.now(),
        message: `🚩 Flagged for expert review. Queue: #${queuePos} of ${expertQueue.getQueueLength()}. Est. wait: ${estWait} min.`,
        severity: analysis.severity as "low" | "medium" | "high" | "severe",
      });
      break;

    case "block":
      newState = "false";
      newStage = "completed";
      logs.push({
        stage: "completed",
        timestamp: Date.now(),
        message: "⛔ Post blocked. Content violates safety guidelines.",
        severity: "severe",
      });
      break;
  }

  return {
    ...post,
    state: newState,
    screeningStage: newStage,
    screeningLogs: logs,
    aiSeverity: analysis.severity,
    aiFlags: analysis.flags,
    expertReviewDeadline: expertDeadline,
    flagReason: analysis.recommendedAction !== "publish" && analysis.recommendedAction !== "block"
      ? `${analysis.reasoning} Expert reviewing — usually within 48h.`
      : undefined,
    flagReasonLo: analysis.recommendedAction !== "publish" && analysis.recommendedAction !== "block"
      ? `ການວິເຄາະ AI ພົບບັນຫາ. ຜູ້ຊ່ຽວຊານກຳລັງກວດສອບ — ພາຍໃນ 48 ຊ.ມ. (ຄິວ: #${expertQueue.getQueuePosition(post.id)})`
      : undefined,
    correction: analysis.recommendedAction === "block"
      ? "This content has been blocked for violating community safety guidelines."
      : undefined,
  };
}

export function checkSLAExpiry(post: Post): Post | null {
  if (!post.expertReviewDeadline || post.screeningStage !== "expert_review") return null;
  if (Date.now() < post.expertReviewDeadline) return null;

  const logs = [...(post.screeningLogs || [])];
  logs.push({
    stage: "auto_unlock",
    timestamp: Date.now(),
    message: "⏰ 48h SLA expired. Post auto-unlocked. No verified points awarded.",
    severity: "low",
  });

  return {
    ...post,
    state: "sla",
    screeningStage: "auto_unlock",
    screeningLogs: logs,
  };
}

export function simulateExpertReview(post: Post, approve: boolean): Post {
  const logs = [...(post.screeningLogs || [])];

  if (approve) {
    logs.push({
      stage: "completed",
      timestamp: Date.now(),
      message: "✅ Expert confirmed accuracy. Post verified. Points awarded.",
      severity: "low",
    });
    return {
      ...post,
      state: "confirmed",
      screeningStage: "completed",
      screeningLogs: logs,
      points: (post.points || 0) + 50,
      featuredPoints: Math.random() > 0.5,
    };
  } else {
    logs.push({
      stage: "completed",
      timestamp: Date.now(),
      message: "❌ Expert confirmed content is false/misleading. Correction applied.",
      severity: "high",
    });
    return {
      ...post,
      state: "false",
      screeningStage: "completed",
      screeningLogs: logs,
      correction: "Expert review found this content to be inaccurate. Please refer to official sources.",
      correctionLo: "ຜູ້ຊ່ຽວຊານພົບວ່າເນື້ອຫານີ້ບໍ່ຖືກຕ້ອງ. ກະລຸນາອ້າງອີງແຫຼ່ງຂໍ້ມູນທາງການ.",
    };
  }
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Export queue manager for external use
export { ExpertQueueManager };
