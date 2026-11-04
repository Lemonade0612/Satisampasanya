import { memo, type ReactNode } from 'react';
import type { LandmarkKind, Scene, Terrain, Trees } from '../data/dashJourney';

// Vector parallax backdrop for Scam Dash. Everything is SVG so it stays sharp on any screen.
// Layers scroll at different speeds; `dist` is the run distance, `progress` (0..1) moves the landmark across one stop.

const TAU = Math.PI * 2;

// Seamless 400-wide ridge line, so two copies side by side tile without a seam.
function ridge(terrain: Terrain, seed: number, base: number, amp: number) {
  const pts: string[] = [];
  const towers = Array.from({ length: 6 }, (_, i) => ({ c: ((i + 0.5) / 6) * 400 + Math.sin(seed + i * 3) * 18, w: 22 + ((i * 7 + seed * 5) % 4) * 6, h: 0.55 + 0.45 * Math.abs(Math.sin(seed * 2 + i)) }));
  for (let x = 0; x <= 400; x += 4) {
    const u = x / 400;
    let h: number;
    if (terrain === 'karst') {
      h = Math.max(0.12, ...towers.map(t => { const d = Math.min(Math.abs(x - t.c), 400 - Math.abs(x - t.c)) / t.w; return d < 1 ? t.h * (1 - d ** 4) : 0; }));
    } else if (terrain === 'peaks') {
      const tri = 1 - Math.abs(2 * ((u * 4 + seed * 0.13) % 1) - 1);
      h = 0.3 + 0.6 * tri + 0.08 * Math.sin(TAU * u * 11 + seed);
    } else {
      const k = terrain === 'flat' ? 0.35 : terrain === 'sea' ? 0.45 : 1;
      h = 0.5 + k * (0.3 * Math.sin(TAU * u * 2 + seed) + 0.15 * Math.sin(TAU * u * 5 + seed * 2));
    }
    pts.push(`${x},${(base - amp * h).toFixed(1)}`);
  }
  return `M0,200 L${pts.join(' L')} L400,200Z`;
}

const Ridge = memo(function Ridge({ terrain, seed, color, amp }: { terrain: Terrain; seed: number; color: string; amp: number }) {
  return <svg viewBox="0 0 400 200" preserveAspectRatio="none" className="w-full h-full block"><path d={ridge(terrain, seed, 200, amp)} fill={color} /></svg>;
});

const TREE_X = [18, 70, 128, 176, 236, 290, 348];
const NearRow = memo(function NearRow({ trees, dark }: { trees: Trees; dark: string }) {
  const leaf = ['#2F7D4A', '#3E9A57', '#277043'];
  return (
    <svg viewBox="0 0 400 150" preserveAspectRatio="none" className="w-full h-full block">
      {TREE_X.map((x, i) => {
        const s = 0.75 + ((i * 37) % 5) / 10;
        if (trees === 'city') {
          const w = 34 + (i % 3) * 10, h = 60 + ((i * 29) % 5) * 16;
          return <g key={i}>
            <rect x={x - w / 2} y={150 - h} width={w} height={h} rx="2" fill={i % 2 ? '#64748B' : '#7C8BA3'} />
            {Array.from({ length: Math.floor(h / 16) }, (_, r) => [0, 1, 2].map(c => <rect key={`${r}${c}`} x={x - w / 2 + 5 + c * ((w - 10) / 3)} y={150 - h + 6 + r * 16} width={(w - 10) / 3 - 4} height="8" fill="#E0F2FE" opacity=".75" />))}
          </g>;
        }
        if (trees === 'palm') return <g key={i} transform={`translate(${x} 150) scale(${s})`}>
          <path d="M0 0 Q-6 -50 6 -96" stroke="#8B5E34" strokeWidth="7" fill="none" strokeLinecap="round" />
          {[-150, -115, -65, -30, -90].map((a, j) => <path key={j} d={`M6 -96 q${Math.cos(a * Math.PI / 180) * 26} ${Math.sin(a * Math.PI / 180) * 26 - 6} ${Math.cos(a * Math.PI / 180) * 48} ${Math.sin(a * Math.PI / 180) * 48 + 22}`} stroke={leaf[j % 3]} strokeWidth="9" fill="none" strokeLinecap="round" />)}
        </g>;
        if (trees === 'pine') return <g key={i} transform={`translate(${x} 150) scale(${s})`}>
          <rect x="-4" y="-18" width="8" height="18" fill="#6B4423" />
          {[0, 1, 2].map(j => <polygon key={j} points={`-${30 - j * 7},${-14 - j * 26} 0,${-58 - j * 26} ${30 - j * 7},${-14 - j * 26}`} fill={leaf[j % 2 ? 1 : 2]} />)}
        </g>;
        return <g key={i} transform={`translate(${x} 150) scale(${s})`}>
          <rect x="-5" y="-40" width="10" height="40" rx="3" fill="#7A4E2D" />
          <circle cx="-16" cy="-52" r="22" fill={leaf[2]} /><circle cx="16" cy="-54" r="22" fill={leaf[0]} /><circle cx="0" cy="-74" r="26" fill={leaf[1]} />
          <circle cx="-6" cy="-82" r="8" fill="#fff" opacity=".12" />
        </g>;
      })}
      {[40, 110, 200, 270, 330, 390].map((x, i) => <ellipse key={i} cx={x} cy="150" rx="26" ry="12" fill={dark} />)}
    </svg>
  );
});

const Clouds = memo(function Clouds({ dusk }: { dusk?: boolean }) {
  const c = dusk ? '#FFE8D6' : '#fff';
  return (
    <svg viewBox="0 0 400 100" preserveAspectRatio="none" className="w-full h-full block" opacity=".9">
      {[[60, 30, 1], [210, 55, .8], [330, 25, 1.1]].map(([x, y, s], i) => (
        <g key={i} transform={`translate(${x} ${y}) scale(${s})`} fill={c}>
          <ellipse cx="0" cy="0" rx="34" ry="11" /><circle cx="-10" cy="-8" r="13" /><circle cx="10" cy="-12" r="16" />
        </g>
      ))}
    </svg>
  );
});

// Two copies side by side, shifted by `shift` percent of the layer width.
function Strip({ shift, style, children }: { shift: number; style: React.CSSProperties; children: ReactNode }) {
  return (
    <div className="absolute inset-x-0 overflow-hidden pointer-events-none" style={style}>
      <div className="flex h-full w-[200%] will-change-transform" style={{ transform: `translate3d(${-(shift % 100) / 2}%,0,0)` }}>
        <div className="w-1/2 h-full">{children}</div><div className="w-1/2 h-full">{children}</div>
      </div>
    </div>
  );
}

export const GROUND = 16; // % of scene height taken by the road; runner and traps stand on it.

// Foreground below the road on tall screens: verge, bushes, flowers and stones scrolling fastest.
const Foreground = memo(function Foreground({ city }: { city?: boolean }) {
  const bloom = ['#F472B6', '#FACC15', '#F8FAFC', '#FB923C'];
  return (
    <svg viewBox="0 0 400 120" preserveAspectRatio="none" className="w-full h-full block">
      {[30, 120, 210, 300, 370].map((x, i) => <g key={x}>
        {city
          ? <g><rect x={x - 2} y="8" width="4" height="70" fill="#475569" /><rect x={x - 10} y="4" width="20" height="8" rx="4" fill="#64748B" /><circle cx={x} cy="14" r="5" fill="#FEF3C7" /></g>
          : <><ellipse cx={x} cy="34" rx={30 + (i % 2) * 10} ry="20" fill="#2F7D4A" /><ellipse cx={x - 14} cy="28" rx="16" ry="14" fill="#3E9A57" /><ellipse cx={x + 12} cy="24" rx="12" ry="11" fill="#4CAF63" /></>}
      </g>)}
      {[60, 92, 160, 176, 250, 268, 336, 352].map((x, i) => <g key={x}><line x1={x} y1="62" x2={x} y2="48" stroke="#2F7D4A" strokeWidth="2" /><circle cx={x} cy="46" r="4.5" fill={bloom[i % 4]} /></g>)}
      {[[80, 92, 14], [196, 104, 10], [320, 88, 16]].map(([x, y, r]) => <ellipse key={x} cx={x} cy={y} rx={r} ry={r * 0.6} fill="#9CA3AF" opacity=".85" />)}
    </svg>
  );
});

// `floor` is where the top of the road sits, in % from the bottom. Tall screens raise it so the
// action sits in the middle instead of being squeezed into the bottom strip.
export function DashScene({ scene, kind, dist, progress, floor = GROUND }: { scene: Scene; kind: LandmarkKind; dist: number; progress: number; floor?: number }) {
  const sea = scene.terrain === 'sea';
  const lift = floor - GROUND; // height of the foreground under the road
  return (
    <div className="absolute inset-0 overflow-hidden" style={{ background: `linear-gradient(${scene.sky[0]},${scene.sky[1]} 70%)` }}>
      <div className="absolute rounded-full" style={{ width: 64, height: 64, right: '14%', top: '14%', background: scene.dusk ? '#FFB86B' : '#FFF6C9', boxShadow: `0 0 60px 20px ${scene.dusk ? '#FFB86B88' : '#FFF6C988'}` }} />
      <Strip shift={dist * 0.06} style={{ top: '6%', height: '18%' }}><Clouds dusk={scene.dusk} /></Strip>
      {sea && <div className="absolute inset-x-0" style={{ bottom: `${floor + 6}%`, height: '16%', background: 'linear-gradient(#5BB8D9,#2E8FB8)' }} />}
      <Strip shift={dist * 0.2} style={{ bottom: `${floor + (sea ? 18 : 6)}%`, height: sea ? '22%' : '38%' }}><Ridge terrain={scene.terrain} seed={1} color={scene.far} amp={sea ? 120 : 190} /></Strip>
      {!sea && <Strip shift={dist * 0.4} style={{ bottom: `${floor + 6}%`, height: '26%' }}><Ridge terrain={scene.terrain === 'karst' ? 'karst' : 'hills'} seed={4} color={scene.mid} amp={170} /></Strip>}
      {/* The landmark sits far behind the road: smaller, slightly hazed and slower than the near trees, so the runner reads as up close. */}
      <div className="absolute pointer-events-none will-change-transform" style={{ bottom: `${floor + 9}%`, left: `${104 - progress * 150}%`, width: '44%', aspectRatio: '1', filter: 'saturate(.85) brightness(1.04)', opacity: 0.95 }}>
        <Landmark kind={kind} />
      </div>
      <Strip shift={dist * 1.0} style={{ bottom: `${floor + 2}%`, height: '20%' }}><NearRow trees={scene.trees} dark={scene.grass} /></Strip>
      <div className="absolute inset-x-0" style={{ bottom: `${floor}%`, height: '4%', background: scene.grass }} />
      <div className="absolute inset-x-0" style={{ bottom: `${lift}%`, height: `${GROUND}%`, background: 'linear-gradient(#5B6170,#3F4451)' }}>
        <div className="absolute inset-x-0 top-0 h-2" style={{ backgroundImage: 'repeating-linear-gradient(90deg,#F8FAFC 0 22px,#E5484D 22px 44px)', backgroundPositionX: `${-dist * 6.4}px` }} />
        <div className="absolute inset-x-0 top-[62%] h-1.5 rounded" style={{ backgroundImage: 'repeating-linear-gradient(90deg,#FDE68A 0 30px,transparent 30px 64px)', backgroundPositionX: `${-dist * 6.4}px` }} />
        <div className="absolute inset-x-0 bottom-0 h-1.5" style={{ backgroundImage: 'repeating-linear-gradient(90deg,#F8FAFC 0 22px,#E5484D 22px 44px)', backgroundPositionX: `${-dist * 6.4}px` }} />
      </div>
      {lift > 0 && <div className="absolute inset-x-0 bottom-0" style={{ height: `${lift}%`, background: `linear-gradient(${scene.grass}, color-mix(in srgb, ${scene.grass} 70%, #0b3d1f))` }}>
        <Strip shift={dist * 1.6} style={{ top: '4%', height: 'min(70%, 120px)' }}><Foreground city={scene.trees === 'city'} /></Strip>
      </div>}
    </div>
  );
}

const GOLD = '#E8B526', GOLD_D = '#B7861A', RED = '#B4232C', WHITE = '#FFF8EA', STONE = '#A68C6D', STONE_D = '#7E6750';

// One drawing per landmark, 200x200 with the ground at the bottom edge.
export const Landmark = memo(function Landmark({ kind }: { kind: LandmarkKind }) {
  return <svg viewBox="0 0 200 200" className="w-full h-full block overflow-visible" aria-hidden>{draw(kind)}</svg>;
});

const roofTiers = (color: string, edge: string) => <>
  <polygon points="22,140 56,112 144,112 178,140" fill={color} stroke={edge} strokeWidth="3" strokeLinejoin="round" />
  <polygon points="44,114 72,90 128,90 156,114" fill={color} stroke={edge} strokeWidth="3" strokeLinejoin="round" />
  <polygon points="66,92 86,72 114,72 134,92" fill={color} stroke={edge} strokeWidth="3" strokeLinejoin="round" />
  <path d="M22 140 q-8 -6 -6 -16 M178 140 q8 -6 6 -16 M44 114 q-7 -5 -5 -13 M156 114 q7 -5 5 -13" stroke={edge} strokeWidth="3" fill="none" strokeLinecap="round" />
  <polygon points="96,72 100,40 104,72" fill={GOLD} />
</>;

const bell = (x: number, y: number, s: number, c = GOLD, d = GOLD_D) => <g transform={`translate(${x} ${y}) scale(${s})`}>
  <rect x="-30" y="-12" width="60" height="12" fill={d} /><rect x="-24" y="-22" width="48" height="10" fill={c} />
  <path d="M-22 -22 Q-22 -58 0 -64 Q22 -58 22 -22Z" fill={c} /><path d="M-6 -62 L0 -100 L6 -62Z" fill={c} />
  <circle cx="0" cy="-74" r="5" fill={d} /><path d="M-10 -26 Q-12 -50 0 -58" stroke="#fff" strokeOpacity=".35" strokeWidth="4" fill="none" />
</g>;

const prang = (x: number, s: number, c: string, d: string) => <g transform={`translate(${x} 200) scale(${s})`}>
  <rect x="-26" y="-30" width="52" height="30" fill={d} />
  {[0, 1, 2, 3, 4, 5].map(i => <rect key={i} x={-22 + i * 3} y={-46 - i * 16} width={44 - i * 6} height="17" rx="6" fill={i % 2 ? c : d} />)}
  <path d="M-4 -142 L0 -170 L4 -142Z" fill={d} />
</g>;

function draw(kind: LandmarkKind): ReactNode {
  switch (kind) {
    case 'temple': case 'palace': {
      const roof = kind === 'palace' ? GOLD : RED, edge = kind === 'palace' ? GOLD_D : GOLD;
      return <>
        <rect x="28" y="182" width="144" height="18" fill="#E2D3B5" /><rect x="50" y="138" width="100" height="44" fill={WHITE} />
        {[64, 84, 116, 136].map(x => <rect key={x} x={x - 3} y="140" width="6" height="42" fill="#E9D8B4" />)}
        <path d="M90 182 V156 a10 10 0 0 1 20 0 V182Z" fill={GOLD} />{roofTiers(roof, edge)}
      </>;
    }
    case 'stupa': return <>
      <rect x="10" y="184" width="180" height="16" fill={GOLD_D} /><rect x="22" y="170" width="156" height="16" fill={GOLD} />
      {[30, 52, 148, 170].map(x => <path key={x} d={`M${x - 7} 170 Q${x} 140 ${x + 7} 170Z M${x - 2} 150 L${x} 128 L${x + 2} 150Z`} fill={GOLD} />)}
      <path d="M48 170 Q50 128 100 116 Q150 128 152 170Z" fill={GOLD} />
      <path d="M78 118 L86 70 L114 70 L122 118Z" fill={GOLD} /><path d="M86 72 Q100 20 114 72Z" fill={GOLD} /><path d="M97 40 L100 6 L103 40Z" fill={GOLD_D} />
      <path d="M64 166 Q66 136 96 124" stroke="#fff" strokeOpacity=".4" strokeWidth="5" fill="none" />
    </>;
    case 'gate': return <>
      <rect x="30" y="80" width="140" height="120" fill="#E9DCC0" /><path d="M76 200 V146 a24 24 0 0 1 48 0 V200Z" fill="#7C9DB5" />
      <rect x="30" y="80" width="140" height="10" fill="#D6C29C" /><rect x="40" y="118" width="22" height="30" fill="#D6C29C" /><rect x="138" y="118" width="22" height="30" fill="#D6C29C" />
      {[44, 156, 100].map((x, i) => <g key={x}><rect x={x - 10} y={i === 2 ? 52 : 62} width="20" height={i === 2 ? 28 : 18} fill="#E9DCC0" /><path d={`M${x - 12} ${i === 2 ? 52 : 62} Q${x} ${i === 2 ? 22 : 38} ${x + 12} ${i === 2 ? 52 : 62}Z`} fill={GOLD} /><path d={`M${x - 1.5} ${i === 2 ? 30 : 44} L${x} ${i === 2 ? 12 : 30} L${x + 1.5} ${i === 2 ? 30 : 44}Z`} fill={GOLD_D} /></g>)}
      {[72, 128].map(x => <g key={x}><rect x={x - 8} y="66" width="16" height="14" fill="#E9DCC0" /><path d={`M${x - 9} 66 Q${x} 46 ${x + 9} 66Z`} fill={GOLD} /></g>)}
    </>;
    case 'waterfall': return <>
      <path d="M0 200 V60 Q30 40 60 70 V200Z" fill="#4E7A5A" /><path d="M200 200 V50 Q170 40 140 70 V200Z" fill="#4E7A5A" />
      <path d="M60 70 Q100 56 140 70 V200 H60Z" fill="#E6FBFF" />
      {[72, 88, 104, 120, 132].map((x, i) => <line key={x} x1={x} y1="70" x2={x} y2="200" stroke="#9EE6F0" strokeWidth="5" strokeDasharray="14 10" className="dash-water" style={{ animationDelay: `${i * -0.15}s` }} />)}
      <path d="M20 170 Q100 150 180 170 V200 H20Z" fill="#3FC1C9" /><path d="M40 180 Q100 168 160 180" stroke="#fff" strokeOpacity=".6" strokeWidth="3" fill="none" />
      <circle cx="30" cy="70" r="20" fill="#3B7A4C" /><circle cx="172" cy="62" r="22" fill="#3B7A4C" />
    </>;
    case 'jars': return <>
      <path d="M0 200 Q100 168 200 200Z" fill="#9DB45A" />
      {[[40, 186, 1], [86, 180, 1.3], [134, 186, 1.05], [168, 192, .8], [66, 194, .7]].map(([x, y, s], i) => <g key={i} transform={`translate(${x} ${y}) scale(${s})`}>
        <path d="M-16 0 Q-22 -30 -12 -42 H12 Q22 -30 16 0Z" fill="#9C9384" /><ellipse cx="0" cy="-42" rx="12" ry="4" fill="#5E574C" />
        <path d="M-10 -6 Q-14 -26 -8 -36" stroke="#fff" strokeOpacity=".3" strokeWidth="3" fill="none" />
      </g>)}
    </>;
    case 'balloons': return <>
      {[[60, 70, 1, '#EF4444', '#FACC15'], [140, 40, .8, '#3B82F6', '#F8FAFC'], [118, 120, .6, '#F97316', '#22C55E']].map(([x, y, s, a, b], i) => <g key={i} transform={`translate(${x} ${y}) scale(${s})`} className="daily-float" style={{ animationDelay: `${i * -0.8}s` }}>
        <path d="M0 -40 C30 -40 34 -6 12 14 H-12 C-34 -6 -30 -40 0 -40Z" fill={a as string} /><path d="M0 -40 C10 -30 10 0 5 14 H-5 C-10 0 -10 -30 0 -40Z" fill={b as string} />
        <line x1="-10" y1="14" x2="-6" y2="26" stroke="#6B4423" strokeWidth="1.5" /><line x1="10" y1="14" x2="6" y2="26" stroke="#6B4423" strokeWidth="1.5" /><rect x="-7" y="26" width="14" height="10" rx="2" fill="#8B5E34" />
      </g>)}
    </>;
    case 'khmer': return <>{prang(55, .75, STONE, STONE_D)}{prang(145, .75, STONE, STONE_D)}{prang(100, 1, STONE, STONE_D)}<rect x="0" y="190" width="200" height="10" fill={STONE_D} /></>;
    case 'prang': return <>{prang(48, .6, '#F1E9DA', '#C9B48E')}{prang(152, .6, '#F1E9DA', '#C9B48E')}{prang(100, 1.12, '#F7F1E4', '#D3B98A')}{[100].map(x => <g key={x}>{[0, 1, 2, 3].map(i => <circle key={i} cx={x + (i % 2 ? 6 : -6)} cy={160 - i * 34} r="2.5" fill="#3B82F6" />)}</g>)}</>;
    case 'angkor': return <>
      <rect x="0" y="182" width="200" height="18" fill="#5BA7C9" /><rect x="10" y="150" width="180" height="34" fill={STONE_D} />
      {[18, 40, 62, 84, 116, 138, 160, 182].map(x => <rect key={x} x={x - 4} y="158" width="8" height="26" fill={STONE} />)}
      {prang(40, .55, STONE, STONE_D)}{prang(160, .55, STONE, STONE_D)}{prang(70, .7, STONE, STONE_D)}{prang(130, .7, STONE, STONE_D)}{prang(100, .95, STONE, STONE_D)}
      <rect x="10" y="150" width="180" height="8" fill={STONE} />
    </>;
    case 'pagoda': return <>{bell(100, 200, 1.7)}<rect x="0" y="194" width="200" height="6" fill={GOLD_D} /></>;
    case 'pagodas': return <>{bell(40, 200, .7, '#B5653E', '#8A4A2C')}{bell(150, 200, .9, '#B5653E', '#8A4A2C')}{bell(95, 200, 1.2, '#C2724A', '#8A4A2C')}{draw('balloons')}</>;
    case 'onepillar': return <>
      <ellipse cx="100" cy="194" rx="96" ry="10" fill="#5BA7C9" /><rect x="92" y="130" width="16" height="64" fill="#9C9384" />
      <rect x="60" y="104" width="80" height="28" fill="#8B3A2B" /><polygon points="46,108 70,82 130,82 154,108" fill="#5C3A2E" />
      <path d="M46 108 q-6 -8 0 -14 M154 108 q6 -8 0 -14" stroke="#5C3A2E" strokeWidth="4" fill="none" /><circle cx="100" cy="78" r="5" fill={GOLD} />
      {[30, 170].map(x => <circle key={x} cx={x} cy="188" r="7" fill="#F472B6" />)}
    </>;
    case 'citadel': return <>
      <rect x="0" y="150" width="200" height="50" fill="#8B3A2B" /><path d="M80 200 V172 a20 20 0 0 1 40 0 V200Z" fill="#3B2A22" />
      {[0, 20, 40, 60, 140, 160, 180].map(x => <rect key={x} x={x + 2} y="142" width="14" height="10" fill="#8B3A2B" />)}
      <rect x="60" y="112" width="80" height="38" fill="#FCD34D" /><polygon points="44,116 70,92 130,92 156,116" fill="#B45309" />
      <rect x="74" y="78" width="52" height="16" fill="#FCD34D" /><polygon points="62,80 82,60 118,60 138,80" fill="#B45309" />
      {[76, 100, 124].map(x => <rect key={x} x={x - 2} y="114" width="4" height="36" fill={RED} />)}
    </>;
    case 'lanterns': return <>
      {[[0, 60, '#F6C453'], [62, 76, '#F2B33D'], [138, 62, '#F6C453']].map(([x, w, c], i) => <g key={i}>
        <rect x={x as number} y="120" width={w as number} height="80" fill={c as string} /><polygon points={`${(x as number) - 6},124 ${(x as number) + (w as number) / 2},96 ${(x as number) + (w as number) + 6},124`} fill="#8B3A2B" />
        <rect x={(x as number) + 10} y="150" width="16" height="22" fill="#5C3A2E" /><rect x={(x as number) + (w as number) - 26} y="168" width="16" height="32" fill="#5C3A2E" />
      </g>)}
      <path d="M0 110 Q100 140 200 110" stroke="#5C3A2E" strokeWidth="1.5" fill="none" />
      {[20, 50, 80, 110, 140, 170].map((x, i) => <g key={x} className="daily-float" style={{ animationDelay: `${i * -0.4}s` }}><line x1={x} y1={110 + Math.sin((x / 200) * Math.PI) * 15} x2={x} y2={120 + Math.sin((x / 200) * Math.PI) * 15} stroke="#5C3A2E" /><ellipse cx={x} cy={128 + Math.sin((x / 200) * Math.PI) * 15} rx="7" ry="9" fill={['#EF4444', '#F97316', '#EAB308', '#EC4899'][i % 4]} /></g>)}
    </>;
    case 'bridge': return <>
      <path d="M0 110 Q100 70 200 110" stroke={GOLD} strokeWidth="10" fill="none" /><path d="M0 104 Q100 64 200 104" stroke="#F8D35E" strokeWidth="3" fill="none" />
      {[[50, 1], [150, -1]].map(([x, f]) => <g key={x} transform={`translate(${x} 200) scale(${f} 1)`}>
        <path d="M-18 0 Q-24 -60 -14 -96 L-8 -110 Q-2 -112 0 -104 L2 -112 Q8 -114 10 -104 L12 -110 Q18 -110 18 -100 Q24 -70 16 0Z" fill="#8C8F8A" />
        <path d="M-14 -40 Q-10 -70 -12 -90" stroke="#6B6E69" strokeWidth="3" fill="none" />
      </g>)}
    </>;
    case 'city': return <>
      {[[10, 90, '#94A3B8'], [42, 130, '#64748B'], [78, 170, '#475569'], [118, 120, '#64748B'], [150, 150, '#7C8BA3'], [180, 80, '#94A3B8']].map(([x, h, c], i) => <g key={i}>
        <rect x={x as number} y={200 - (h as number)} width="30" height={h as number} fill={c as string} />
        {Array.from({ length: Math.floor((h as number) / 14) }, (_, r) => <rect key={r} x={(x as number) + 5} y={206 - (h as number) + r * 14} width="20" height="6" fill="#E0F2FE" opacity=".7" />)}
      </g>)}
      <path d="M93 30 V0" stroke="#475569" strokeWidth="3" />
    </>;
    case 'boat': return <>
      <rect x="0" y="168" width="200" height="32" fill="#4FA3C7" /><path d="M10 180 Q100 172 190 180" stroke="#fff" strokeOpacity=".5" strokeWidth="2" fill="none" />
      <path d="M40 160 L160 160 Q150 182 120 182 H70 Q48 182 40 160Z" fill="#8B5E34" /><rect x="74" y="130" width="52" height="30" fill="#C2410C" /><polygon points="66,132 100,112 134,132" fill="#7C2D12" />
      <path d="M120 160 V80" stroke="#6B4423" strokeWidth="3" /><path d="M122 84 Q160 110 122 150Z" fill="#E7C08A" />
    </>;
    case 'stilt': return <>
      <rect x="0" y="170" width="200" height="30" fill="#5AA9C9" />
      {[[10, 60], [80, 70], [150, 46]].map(([x, w], i) => <g key={i}>
        {[0, 1, 2, 3].map(j => <rect key={j} x={x + 4 + j * (w - 8) / 3} y="150" width="4" height="30" fill="#6B4423" />)}
        <rect x={x} y="118" width={w} height="34" fill={['#F2B33D', '#7DD3FC', '#F87171'][i]} /><polygon points={`${x - 6},120 ${x + w / 2},96 ${x + w + 6},120`} fill="#8B3A2B" />
        <rect x={x + w / 2 - 6} y="132" width="12" height="20" fill="#5C3A2E" />
      </g>)}
    </>;
    case 'twin': return <>
      {[62, 138].map(x => <g key={x}>
        {[0, 1, 2, 3, 4].map(i => <rect key={i} x={x - 18 + i * 3} y={200 - (i + 1) * 34} width={36 - i * 6} height="36" fill={i % 2 ? '#CBD5E1' : '#94A3B8'} />)}
        <path d={`M${x - 1.5} 30 L${x} 0 L${x + 1.5} 30Z`} fill="#94A3B8" />
      </g>)}
      <rect x="80" y="110" width="40" height="6" fill="#64748B" /><path d="M84 116 L100 140 L116 116" stroke="#64748B" strokeWidth="3" fill="none" />
    </>;
    case 'clocktower': return <>
      <rect x="20" y="130" width="160" height="70" fill="#B4473B" /><polygon points="12,132 100,104 188,132" fill="#7C2D12" />
      <rect x="84" y="60" width="32" height="140" fill="#B4473B" /><polygon points="80,62 100,36 120,62" fill="#7C2D12" />
      <circle cx="100" cy="82" r="10" fill={WHITE} /><path d="M100 76 V82 H105" stroke="#1F2937" strokeWidth="2" fill="none" />
      {[36, 60, 140, 164].map(x => <rect key={x} x={x - 6} y="150" width="12" height="20" fill={WHITE} />)}
    </>;
    case 'terraces': return <>
      {[0, 1, 2, 3, 4].map(i => <path key={i} d={`M0 ${100 + i * 22} Q100 ${80 + i * 22} 200 ${100 + i * 22} V200 H0Z`} fill={['#86C26B', '#6FB35A', '#5AA14C', '#4C8E42', '#3F7C38'][i]} />)}
      {[0, 1, 2, 3].map(i => <path key={i} d={`M0 ${100 + i * 22} Q100 ${80 + i * 22} 200 ${100 + i * 22}`} stroke="#C7E6A8" strokeWidth="2" fill="none" />)}
    </>;
    case 'supertrees': return <>
      {[[40, 120, 1], [100, 70, 1.2], [160, 110, .9]].map(([x, y, s], i) => <g key={i} transform={`translate(${x} ${y}) scale(${s})`}>
        <path d={`M-6 0 L-10 ${(200 - y) / s} H10 L6 0Z`} fill="#6D28D9" />
        <path d="M-34 -6 Q0 18 34 -6 L8 4 H-8Z" fill="#A855F7" />{[-28, -14, 0, 14, 28].map(dx => <circle key={dx} cx={dx} cy="-6" r="4" fill="#F0ABFC" />)}
      </g>)}
      <path d="M40 130 Q100 112 160 128" stroke="#C4B5FD" strokeWidth="4" fill="none" />
    </>;
    case 'mbs': return <>
      {[52, 100, 148].map(x => <path key={x} d={`M${x - 16} 200 L${x - 10} 70 H${x + 10} L${x + 16} 200Z`} fill="#CBD5E1" stroke="#94A3B8" strokeWidth="2" />)}
      <path d="M22 64 H190 Q192 72 178 74 H26Z" fill="#64748B" /><rect x="0" y="190" width="200" height="10" fill="#4FA3C7" />
    </>;
    case 'beach': return <>
      <rect x="0" y="160" width="200" height="40" fill="#E9D6A4" /><path d="M0 160 Q50 152 100 160 T200 160 V150 H0Z" fill="#39B3D6" />
      <path d="M130 200 V130" stroke="#475569" strokeWidth="3" /><path d="M96 134 Q130 104 164 134Z" fill="#F43F5E" /><path d="M118 134 Q130 110 142 134Z" fill="#FDE68A" />
      <rect x="40" y="176" width="40" height="8" rx="4" fill="#38BDF8" />
    </>;
    case 'monument': return <>
      <rect x="40" y="170" width="120" height="30" fill={WHITE} stroke="#D6C29C" strokeWidth="2" /><path d="M88 170 L94 50 H106 L112 170Z" fill={WHITE} stroke="#D6C29C" strokeWidth="2" />
      <rect x="86" y="44" width="28" height="8" fill="#D6C29C" /><path d="M92 44 Q90 22 100 8 Q110 22 108 44Z" fill={GOLD} />
    </>;
    case 'borobudur': return <>
      {[0, 1, 2, 3, 4].map(i => <rect key={i} x={10 + i * 16} y={180 - i * 20} width={180 - i * 32} height="22" fill={i % 2 ? STONE : STONE_D} />)}
      {[-2, -1, 0, 1, 2].map(i => <path key={i} d={`M${100 + i * 26 - 7} 100 Q${100 + i * 26} 84 ${100 + i * 26 + 7} 100Z`} fill={STONE} />)}
      <path d="M88 100 Q100 60 112 100Z" fill={STONE_D} /><path d="M99 68 L100 50 L101 68Z" fill={STONE_D} />
    </>;
    case 'volcano': return <>
      <path d="M0 200 L76 60 Q100 52 124 60 L200 200Z" fill="#7A6A5C" /><path d="M76 60 Q100 52 124 60 L112 84 Q100 74 88 84Z" fill="#F1F5F9" />
      {[0, 1, 2].map(i => <circle key={i} cx={100 + i * 10} cy={40 - i * 16} r={10 + i * 5} fill="#E2E8F0" opacity={0.8 - i * 0.2} className="daily-float" style={{ animationDelay: `${i * -0.6}s` }} />)}
    </>;
    case 'balitemple': return <>
      {[1, -1].map(f => <g key={f} transform={`translate(100 0) scale(${f} 1)`}>
        <path d="M10 200 V60 L22 50 V200Z M22 200 V70 L40 70 L44 90 H54 L58 110 H66 L70 130 H78 V200Z" fill="#8A6A52" />
        <path d="M10 60 L22 40 L22 50Z" fill="#6B4E3A" />
      </g>)}
      <rect x="70" y="180" width="60" height="20" fill="#B8A089" />
    </>;
    case 'chocohills': return <>
      {[[30, 150, 40], [90, 130, 52], [150, 146, 44], [190, 166, 30], [60, 176, 28]].map(([x, y, r], i) => <path key={i} d={`M${x - r} 200 Q${x} ${y - r} ${x + r} 200Z`} fill={i % 2 ? '#8B5E34' : '#A47148'} />)}
    </>;
    case 'mosque': return <>
      <rect x="0" y="186" width="200" height="14" fill="#5AA9C9" /><rect x="40" y="130" width="120" height="56" fill={WHITE} />
      {[52, 76, 124, 148].map(x => <path key={x} d={`M${x - 6} 186 V166 a6 6 0 0 1 12 0 V186Z`} fill="#CBD5E1" />)}
      <path d="M64 130 Q64 76 100 70 Q136 76 136 130Z" fill={GOLD} /><path d="M98 70 L100 52 L102 70Z" fill={GOLD_D} />
      {[22, 178].map(x => <g key={x}><rect x={x - 5} y="70" width="10" height="116" fill={WHITE} /><path d={`M${x - 6} 70 Q${x} 50 ${x + 6} 70Z`} fill={GOLD} /></g>)}
    </>;
    case 'statue': return <>
      <path d="M0 200 Q100 120 200 200Z" fill="#6FA35A" /><rect x="88" y="128" width="24" height="20" fill="#CBD5E1" /><circle cx="100" cy="122" r="12" fill="#94A3B8" />
      <path d="M96 110 V70 M104 110 V70" stroke="#E2E8F0" strokeWidth="6" /><path d="M100 76 L70 60 M100 76 L130 60" stroke="#E2E8F0" strokeWidth="6" strokeLinecap="round" />
      <path d="M92 110 L96 72 H104 L108 110Z" fill="#E2E8F0" /><circle cx="100" cy="64" r="7" fill="#E2E8F0" />
    </>;
  }
}
