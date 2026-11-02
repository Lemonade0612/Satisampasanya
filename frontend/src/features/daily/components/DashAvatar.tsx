import { EXTRAS, OUTFITS, SKINS, type Avatar } from '../lib/dashPlayer';

// Drawn runner so players can build their own look; `step` swings the legs while running.
export function DashAvatar({ a, size = 64, step = 0 }: { a: Avatar; size?: number; step?: number }) {
  const skin = SKINS[a.skin], cloth = OUTFITS[a.outfit], hair = '#2B1B12';
  const swing = Math.sin(step) * 14;
  return (
    <svg width={size} height={size * 1.25} viewBox="0 0 64 80" aria-hidden>
      <g stroke={skin} strokeWidth="7" strokeLinecap="round">
        <line x1="26" y1="56" x2={26 - swing / 2} y2="74" />
        <line x1="38" y1="56" x2={38 + swing / 2} y2="74" />
      </g>
      <rect x="18" y="34" width="28" height="26" rx="10" fill={cloth} />
      <circle cx="32" cy="22" r="14" fill={skin} />
      {a.hair === 0 && <path d="M18 20a14 14 0 0 1 28 0c-6-5-20-5-28 0z" fill={hair} />}
      {a.hair === 1 && <path d="M18 22a14 14 0 0 1 28 0v12h-5V20c-6-4-12-4-18 0v14h-5z" fill={hair} />}
      {a.hair === 2 && <><path d="M18 20a14 14 0 0 1 28 0c-6-5-20-5-28 0z" fill={hair} /><circle cx="32" cy="6" r="6" fill={hair} /></>}
      <circle cx="27" cy="23" r="2" fill="#1F2937" /><circle cx="37" cy="23" r="2" fill="#1F2937" />
      <path d="M27 29q5 4 10 0" stroke="#1F2937" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M28 40l4 4 6-7" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" />
      {EXTRAS[a.extra] && <text x="32" y={EXTRAS[a.extra] === '👓' ? 28 : 10} fontSize={EXTRAS[a.extra] === '👓' ? 16 : 18} textAnchor="middle">{EXTRAS[a.extra]}</text>}
    </svg>
  );
}
