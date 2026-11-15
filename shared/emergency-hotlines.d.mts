export type EmergencyLine = { id: string; number: string; tel: string; tone: string; name: { en: string; lo: string }; note: { en: string; lo: string } };
export declare const ALWAYS_SHOWN: EmergencyLine;
export declare const FEATURED_ROTATION: EmergencyLine[];
export declare const ALL_NUMBERS: EmergencyLine[];
export declare const FEED_GAP: { min: number; max: number };
export declare function hotlineSlots(total: number, rng?: () => number, gap?: { min: number; max: number }): number[];
export declare function featuredAt(n: number): EmergencyLine;
