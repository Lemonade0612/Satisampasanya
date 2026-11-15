export declare const REAL_OR_SCAM_SECONDS: Record<'kids' | 'youth' | 'adult' | 'elder', number>;
export declare const ANSWER_PAUSE_MS: number;
export declare const STREAK_CONFETTI: number;
export declare const LINK_HUNT_ROUNDS: number;
export declare function shuffle<T>(list: T[], rng?: () => number): T[];
export declare function pickLinkRounds<T extends { isReal: boolean }>(pool: T[], count?: number, rng?: () => number): T[];
export declare function realDomain(url: string): string;
