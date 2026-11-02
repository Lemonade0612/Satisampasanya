import { HAIR_COLORS, OUTFITS, SKINS, type Avatar } from '../lib/dashPlayer';

export type Pose = 'stand' | 'run' | 'jump' | 'duck';

const INK = '#1F2937', SHOE = '#1E293B';

// Limb from a joint: upper and lower segment with a bend, angles in radians from straight down.
function limb(x: number, y: number, a: number, bend: number, len: number) {
  const kx = x + Math.sin(a) * len, ky = y + Math.cos(a) * len;
  const b = a - bend;
  return { kx, ky, fx: kx + Math.sin(b) * len, fy: ky + Math.cos(b) * len };
}

// Drawn runner so players can build their own look. `step` drives the run cycle; `pose` switches jump/duck.
export function DashAvatar({ a, size = 64, step = 0, pose }: { a: Avatar; size?: number; step?: number; pose?: Pose }) {
  const p: Pose = pose ?? (step ? 'run' : 'stand');
  const skin = SKINS[a.skin] ?? SKINS[1], cloth = OUTFITS[a.outfit] ?? OUTFITS[0], HAIR = HAIR_COLORS[a.hairColor ?? 0];
  const sw = Math.sin(step) * 0.75;
  const legs = p === 'run' ? [[sw, sw < 0 ? 1.1 : 0.25], [-sw, -sw < 0 ? 1.1 : 0.25]]
    : p === 'jump' ? [[0.7, 1.4], [-0.25, 0.6]]
    : p === 'duck' ? [[1.45, 1.45], [-1.25, 0.3]]
    : [[0.08, 0], [-0.08, 0]];
  const arms = p === 'run' ? [-sw * 1.1, sw * 1.1] : p === 'jump' ? [2.4, -2.2] : p === 'duck' ? [1.7, 1.3] : [0.15, -0.15];
  const bob = p === 'run' ? -Math.abs(Math.cos(step)) * 2.2 : 0;
  // Ducking is a low crouch-slide: the upper body drops and leans in, the legs fold under it.
  const drop = p === 'duck' ? 15 : 0;
  const lean = p === 'run' ? 'rotate(6 32 56)' : p === 'duck' ? 'rotate(16 32 72)' : '';

  const Leg = ({ i, x }: { i: number; x: number }) => {
    const hip = 56 + drop, l = limb(x, hip, legs[i][0], legs[i][1], 10);
    return <g>
      <polyline points={`${x},${hip} ${l.kx},${l.ky} ${l.fx},${l.fy}`} stroke={INK} strokeOpacity=".22" strokeWidth="8.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points={`${x},${hip} ${l.kx},${l.ky} ${l.fx},${l.fy}`} stroke={skin} strokeWidth="6.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <ellipse cx={l.fx + 2} cy={l.fy + 1} rx="5" ry="3.2" fill={SHOE} /><path d={`M${l.fx - 2.5} ${l.fy + 3} h9`} stroke="#fff" strokeWidth="1.3" strokeLinecap="round" />
    </g>;
  };
  const Arm = ({ i, x, back }: { i: number; x: number; back?: boolean }) => {
    const sy = 39 + drop, l = limb(x, sy, arms[i], p === 'run' ? -0.9 : 0.2, 8);
    return <g opacity={back ? 0.85 : 1}>
      <polyline points={`${x},${sy} ${l.kx},${l.ky} ${l.fx},${l.fy}`} stroke={skin} strokeWidth="5.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={l.fx} cy={l.fy} r="3.2" fill={skin} stroke={INK} strokeOpacity=".22" strokeWidth="1" />
      <line x1={x} y1={sy} x2={x + (l.kx - x) * 0.6} y2={sy + (l.ky - sy) * 0.6} stroke={cloth} strokeWidth="7" strokeLinecap="round" />
    </g>;
  };

  return (
    <svg width={size} height={size * 1.25} viewBox="0 0 64 80" aria-hidden className="overflow-visible">
      <g transform={`translate(0 ${bob}) ${lean}`}>
        <Leg i={1} x={36} />
        <Arm i={0} x={24} back />
        <Leg i={0} x={28} />
        <g transform={`translate(0 ${drop})`}>
        {a.hair === 1 && <path d="M17 20 a15 15 0 0 1 30 0 v16 q-3 3 -6 0 v-14 h-18 v14 q-3 3 -6 0z" fill={HAIR} />}
        {a.hair === 4 && <path d="M44 14 q12 4 8 22 q-2 4 -5 1 q2 -12 -6 -18z" fill={HAIR} />}
        {a.hair === 5 && [[19, 16], [24, 9], [32, 6], [40, 9], [45, 16], [17, 24], [47, 24]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="6.5" fill={HAIR} />)}
        <rect x="19" y="33" width="26" height="25" rx="9" fill={cloth} stroke={INK} strokeOpacity=".2" strokeWidth="1.2" />
        <rect x="20" y="51" width="24" height="7" rx="3.5" fill={INK} opacity=".35" />
        <path d="M26 33.5 l6 5 6 -5" stroke="#fff" strokeOpacity=".7" strokeWidth="2" fill="none" strokeLinejoin="round" />
        <path d="M27 44 l4 4 6 -7" stroke="#fff" strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="32" cy="21" r="14" fill={skin} stroke={INK} strokeOpacity=".2" strokeWidth="1.2" />
        {a.hair === 0 && <path d="M18 20 a14 14 0 0 1 28 -2 q-6 -3 -10 2 q-4 -5 -9 -1 q-5 -2 -9 1z" fill={HAIR} />}
        {a.hair === 1 && <path d="M18 21 a14 14 0 0 1 28 -2 q-8 -4 -14 1 q-6 -3 -14 1z" fill={HAIR} />}
        {a.hair === 2 && <><circle cx="32" cy="5" r="6" fill={HAIR} /><path d="M18 20 a14 14 0 0 1 28 0 q-14 -7 -28 0z" fill={HAIR} /></>}
        {a.hair === 4 && <path d="M18 20 a14 14 0 0 1 28 -2 q-10 -6 -18 -1 q-5 0 -10 3z" fill={HAIR} />}
        {a.hair === 5 && <path d="M19 19 a13 12 0 0 1 26 0 q-6 -4 -13 -3 q-7 -1 -13 3z" fill={HAIR} />}
        {a.hair !== 3 && <path d="M23 12 q5 -4 11 -3" stroke="#fff" strokeOpacity=".35" strokeWidth="2" fill="none" strokeLinecap="round" />}
        <g fill={INK}><ellipse cx="27" cy="22" rx="2" ry={p === 'duck' ? 1 : 2.4} /><ellipse cx="38" cy="22" rx="2" ry={p === 'duck' ? 1 : 2.4} /></g>
        <circle cx="27.7" cy="21.2" r=".7" fill="#fff" /><circle cx="38.7" cy="21.2" r=".7" fill="#fff" />
        <circle cx="23.5" cy="27" r="2.4" fill="#F472B6" opacity=".35" /><circle cx="41" cy="27" r="2.4" fill="#F472B6" opacity=".35" />
        {p === 'jump' ? <ellipse cx="33" cy="29" rx="2.4" ry="2.8" fill={INK} /> : <path d="M28 28 q5 4 10 0" stroke={INK} strokeWidth="1.8" fill="none" strokeLinecap="round" />}
        {a.extra === 1 && <g><path d="M18 11 L32 4 L46 11 L32 17Z" fill={INK} /><path d="M24 13 v5 q8 4 16 0 v-5" fill={INK} /><path d="M44 11 v8" stroke="#FACC15" strokeWidth="1.6" /><circle cx="44" cy="20" r="1.6" fill="#FACC15" /></g>}
        {a.extra === 2 && <g><path d="M18 17 a14 13 0 0 1 28 0z" fill="#EF4444" /><path d="M42 16 h12 q2 3 -2 4 h-12z" fill="#B91C1C" /><circle cx="32" cy="5" r="1.6" fill="#B91C1C" /></g>}
        {a.extra === 3 && <g fill="none" stroke={INK} strokeWidth="1.6"><circle cx="27" cy="22" r="4.4" /><circle cx="38" cy="22" r="4.4" /><path d="M31.4 22 h2.2 M42.4 21 l3 -1" /></g>}
        {a.extra === 5 && <g><path d="M17 22 a15 15 0 0 1 30 0" stroke={INK} strokeWidth="2.6" fill="none" /><rect x="14" y="19" width="6" height="10" rx="3" fill="#EF4444" /><rect x="44" y="19" width="6" height="10" rx="3" fill="#EF4444" /></g>}
        {a.extra === 4 && <g transform="translate(20 10)">{[0, 72, 144, 216, 288].map(r => <circle key={r} cx={Math.cos(r * Math.PI / 180) * 3.2} cy={Math.sin(r * Math.PI / 180) * 3.2} r="2.6" fill="#F472B6" />)}<circle r="1.8" fill="#FACC15" /></g>}
        </g>
        <Arm i={1} x={40} />
      </g>
    </svg>
  );
}
