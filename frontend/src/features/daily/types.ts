import type { Lang } from '../../types';
import type { BandTagged } from '../../lib/band';

export type { Lang };
export type L10n = { en: string; lo: string };
export type ScamType = 'fake_job' | 'prize' | 'bank_phishing' | 'overseas_recruitment' | 'investment' | 'game_item' | 'stranger' | 'romance' | 'loan' | 'impersonation' | 'family_emergency' | 'safety_basics';
// Mirrors Sati's AI check categories so missed flags line up with real screening results.
export type FlagCategory = 'urgency' | 'upfront_fee' | 'too_good' | 'unverified_identity' | 'personal_data' | 'off_platform' | 'suspicious_link';

export type Message = { from: 'them' | 'me' | 'system'; text: L10n };
export type Choice = { id: string; text: L10n; correct: boolean; consequence: L10n; action: 'reply' | 'ignore' | 'verify' | 'report' };
export type Segment = { text: L10n; flag?: FlagCategory };

export type ChatStep = { id: string; kind: 'chat'; messages: Message[]; prompt: L10n; choices: Choice[] };
export type FlagStep = { id: string; kind: 'flags'; prompt: L10n; segments: Segment[] };
export type Step = ChatStep | FlagStep;

// Every session, card and round can say who it is for (BandTagged: `bands`, `essential`).
export type Scenario = BandTagged & {
  id: string;
  scamType: ScamType;
  status: 'draft' | 'verified' | 'rejected';
  verifiedBy: string | null;
  verifiedAt: string | null;
  needsNativeReview: boolean;
  boss?: boolean;
  channel: 'whatsapp' | 'messenger' | 'sms' | 'video' | 'tiktok';
  contact: string;
  title: L10n;
  intro: L10n;
  steps: Step[];
  redFlags: FlagCategory[];
  explanation: L10n;
  source?: 'ai_draft' | 'expert';
  // Kids get these fields instead of the full ones.
  gentle?: Partial<Pick<Scenario, 'title' | 'intro' | 'explanation' | 'steps'>>;
  // Short content warning shown before intense real-case detail.
  warning?: L10n;
};

export type QuickCard = BandTagged & { id: string; scamType: ScamType; isScam: boolean; sender: string; text: L10n; why: L10n };
export type LinkRound = BandTagged & { id: string; brand: string; options: string[]; safe: number; why: L10n };

export type GameId = 'story' | 'flags' | 'realorscam' | 'links' | 'dash' | 'detective' | 'call';
