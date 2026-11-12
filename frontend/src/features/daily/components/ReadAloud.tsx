import { useEffect } from 'react';
import { Volume2, VolumeX, Hourglass } from 'lucide-react';
import { DT } from '../i18n';
import { setSpeechRate, useSpeak } from '../lib/useSpeak';
import { useBand } from '../../../lib/band';
import type { Lang } from '../types';

// Read-aloud button. Lao plays the pre-recorded lines (scripts/gen-audio.mjs); a line with no recording yet
// shows a disabled "audio coming" button instead of failing silently or using a Thai voice.
// `parts` must be built with the helpers in lib/spoken.ts so each one matches a recording.
// `auto` reads as soon as the text changes (on for Elders). Elders also get a 0.85× / 1× speed switch.
export function ReadAloud({ parts, lang, auto = false, speed }: { parts: string[]; lang: Lang; auto?: boolean; speed?: boolean }) {
  const t = DT[lang];
  const band = useBand();
  const s = useSpeak(parts, lang, band);
  const key = parts.join('\u0001');
  useEffect(() => { if (auto && s.status === 'ready') s.play(); }, [key, auto, s.status === 'ready']); // eslint-disable-line react-hooks/exhaustive-deps
  const showSpeed = speed ?? band === 'elder';

  if (s.status === 'coming') return (
    <button type="button" disabled aria-disabled="true"
      className="justify-self-start flex items-center gap-2 rounded-full bg-muted px-4 min-h-11 text-sm font-bold font-lao opacity-70 cursor-not-allowed">
      <Hourglass size={18} />{t.audio_coming}
    </button>
  );
  return (
    <div className="flex flex-wrap items-center gap-2">
      <button type="button" onClick={() => (s.speaking ? s.stop() : s.play())} aria-pressed={s.speaking} disabled={s.status === 'loading'}
        className="flex items-center gap-2 rounded-full bg-muted px-4 min-h-11 text-sm font-bold font-lao">
        {s.speaking ? <VolumeX size={18} /> : <Volume2 size={18} />}{s.speaking ? t.stop_reading : t.read_aloud}
      </button>
      {showSpeed && (
        <div role="group" aria-label={t.speech_speed} className="flex rounded-full bg-muted p-1 text-sm font-bold">
          {([0.85, 1] as const).map(v => (
            <button key={v} type="button" onClick={() => setSpeechRate(v)} aria-pressed={s.rate === v}
              className={`min-h-9 min-w-12 rounded-full px-2 ${s.rate === v ? 'bg-background shadow-sm' : 'text-muted-foreground'}`}>{v}×</button>
          ))}
        </div>
      )}
    </div>
  );
}
