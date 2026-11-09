export type SpeakVoice = 'woman' | 'man';
export declare const VOICES: SpeakVoice[];
export declare const DEFAULT_VOICE: SpeakVoice;
export declare function normalizeSpoken(text: string): string;
export declare function audioKey(text: string, voice?: SpeakVoice): string;
export declare function audioPath(key: string, kind: 1 | 2): string;
