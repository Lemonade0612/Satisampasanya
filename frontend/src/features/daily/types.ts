import type { Lang } from '../../types';

export type { Lang };
export type L10n = { en: string; lo: string };
export type ScamType = 'fake_job' | 'prize' | 'bank_phishing' | 'overseas_recruitment' | 'investment';
// Mirrors Sati's AI check categories so missed flags line up with real screening results.
export type FlagCategory = 'urgency' | 'upfront_fee' | 'too_good' | 'unverified_identity' | 'personal_data' | 'off_platform' | 'suspicious_link';

export type Message = { from: 'them' | 'me' | 'system'; text: L10n };
export type Choice = { id: string; text: L10n; correct: boolean; consequence: L10n; action: 'reply' | 'ignore' | 'verify' | 'report' };
export type Segment = { text: L10n; flag?: FlagCategory };

export type ChatStep = { id: string; kind: 'chat'; messages: Message[]; prompt: L10n; choices: Choice[] };
export type FlagStep = { id: string; kind: 'flags'; prompt: L10n; segments: Segment[] };
export type Step = ChatStep | FlagStep;

export type Scenario = {
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
};

export type QuickCard = { id: string; scamType: ScamType; isScam: boolean; sender: string; text: L10n; why: L10n };
export type LinkRound = { id: string; brand: string; options: string[]; safe: number; why: L10n };

export type GameId = 'story' | 'flags' | 'realorscam' | 'links' | 'dash' | 'detective' | 'call';
