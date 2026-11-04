import { memo } from 'react';

// Illustrated rooms for Scam Detective, one per persona, in the same flat style as Souk's stall.
// `night` swaps the window sky and lights the lamp so cases feel like different moments of the day.
export type Room = 'kid' | 'student' | 'parent' | 'elder' | 'worker';

const SKY = { day: ['#8CCBF2', '#E6F5FF'], night: ['#2B3165', '#4B4F8A'] };

export const Backdrop = memo(function Backdrop({ room, night }: { room: Room; night?: boolean }) {
  const sky = night ? SKY.night : SKY.day;
  const wall = { kid: '#FDE7C8', student: '#DDE7FB', parent: '#F6E2C4', elder: '#E7EFE0', worker: '#D9E2EC' }[room];
  const floor = { kid: '#C99A6B', student: '#A8B4CC', parent: '#B98B5E', elder: '#B08960', worker: '#8B95A5' }[room];
  return (
    <svg viewBox="0 0 400 220" preserveAspectRatio="xMidYMax slice" className="absolute inset-0 w-full h-full" aria-hidden>
      <defs>
        <linearGradient id={`sky-${room}-${night ? 1 : 0}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={sky[0]} /><stop offset="1" stopColor={sky[1]} /></linearGradient>
      </defs>
      <rect width="400" height="220" fill={night ? '#3B3F63' : wall} />
      {night && <rect width="400" height="220" fill={wall} opacity=".35" />}
      <rect y="168" width="400" height="52" fill={floor} />
      <rect y="164" width="400" height="6" fill="#00000018" />
      {room !== 'worker' && <Window x={room === 'elder' ? 40 : 250} night={night} id={`sky-${room}-${night ? 1 : 0}`} />}
      {room === 'kid' && <>
        <rect x="40" y="40" width="54" height="40" rx="4" fill="#60A5FA" /><circle cx="58" cy="58" r="9" fill="#FACC15" /><path d="M44 78 L64 60 L76 70 L90 56 L90 78Z" fill="#22C55E" />
        <rect x="108" y="48" width="36" height="46" rx="4" fill="#F472B6" /><path d="M126 60 l4 9 10 1 -8 6 3 10 -9 -6 -9 6 3 -10 -8 -6 10 -1z" fill="#FEF3C7" />
        <rect x="20" y="132" width="150" height="36" rx="10" fill="#7DD3FC" /><rect x="20" y="120" width="44" height="20" rx="8" fill="#F8FAFC" /><rect x="14" y="110" width="12" height="58" rx="4" fill="#B45309" />
        <circle cx="200" cy="158" r="12" fill="#EF4444" /><path d="M190 154 Q200 146 210 154" stroke="#fff" strokeWidth="3" fill="none" />
      </>}
      {room === 'student' && <>
        {[0, 1, 2].map(i => <rect key={i} x={36 + i * 26} y={52} width="20" height="34" rx="2" fill={['#A78BFA', '#F59E0B', '#34D399'][i]} />)}
        <rect x="30" y="86" width="96" height="6" fill="#8B5E34" />
        <rect x="60" y="120" width="170" height="10" rx="3" fill="#8B5E34" /><rect x="70" y="130" width="8" height="38" fill="#6B4423" /><rect x="212" y="130" width="8" height="38" fill="#6B4423" />
        <rect x="150" y="96" width="50" height="26" rx="3" fill="#334155" /><rect x="154" y="100" width="42" height="18" fill="#93C5FD" />
        <path d="M96 120 q4 -18 18 -18" stroke="#16A34A" strokeWidth="4" fill="none" /><rect x="86" y="108" width="20" height="14" rx="3" fill="#F97316" />
      </>}
      {room === 'parent' && <>
        {[0, 1, 2].map(r => <g key={r}><rect x="24" y={46 + r * 38} width="170" height="6" fill="#8B5E34" />
          {Array.from({ length: 7 }, (_, i) => <rect key={i} x={30 + i * 23} y={26 + r * 38} width="16" height="20" rx="3" fill={['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#EC4899', '#FACC15', '#8B5CF6'][(i + r * 2) % 7]} />)}
        </g>)}
        <rect x="200" y="122" width="190" height="46" rx="4" fill="#9A3412" /><rect x="200" y="118" width="190" height="8" rx="3" fill="#C2410C" />
        <rect x="320" y="98" width="40" height="22" rx="4" fill="#E5E7EB" /><rect x="326" y="102" width="28" height="8" fill="#22C55E" />
      </>}
      {room === 'elder' && <>
        <rect x="200" y="54" width="70" height="50" rx="4" fill="#FEF3C7" stroke="#B45309" strokeWidth="5" /><circle cx="235" cy="76" r="10" fill="#D97706" opacity=".6" /><path d="M210 100 q25 -22 50 0" fill="#B45309" opacity=".4" />
        <path d="M290 168 V122 Q290 106 306 106 H364 Q380 106 380 122 V168Z" fill="#A16207" /><rect x="282" y="136" width="106" height="20" rx="8" fill="#CA8A04" />
        <rect x="150" y="140" width="22" height="28" rx="4" fill="#B45309" /><path d="M161 140 q-16 -30 -4 -50 M161 140 q12 -34 22 -42 M161 140 q-2 -36 2 -56" stroke="#16A34A" strokeWidth="5" fill="none" strokeLinecap="round" />
        {night && <circle cx="330" cy="60" r="40" fill="#FFE7A8" opacity=".2" />}
      </>}
      {room === 'worker' && <>
        <rect width="400" height="110" fill={`url(#sky-${room}-${night ? 1 : 0})`} />
        {[[10, 60], [60, 90], [120, 50], [250, 80], [310, 100], [360, 64]].map(([x, h], i) => <rect key={i} x={x} y={110 - h} width="44" height={h} fill={night ? '#475569' : '#94A3B8'} />)}
        <rect y="104" width="400" height="10" fill="#64748B" />
        <rect x="140" y="40" width="120" height="30" rx="4" fill="#0F172A" /><text x="200" y="60" textAnchor="middle" fontSize="13" fontWeight="700" fill="#FBBF24">BUS · DEP 08:40</text>
        <rect x="20" y="132" width="140" height="10" rx="4" fill="#475569" /><rect x="30" y="142" width="6" height="26" fill="#334155" /><rect x="144" y="142" width="6" height="26" fill="#334155" />
        <rect x="300" y="120" width="34" height="48" rx="6" fill="#DC2626" /><rect x="306" y="128" width="22" height="14" rx="2" fill="#FCA5A5" />
      </>}
      {night && <rect width="400" height="220" fill="#0B1030" opacity=".18" />}
    </svg>
  );
});

function Window({ x, night, id }: { x: number; night?: boolean; id: string }) {
  return <g>
    <rect x={x} y="26" width="110" height="80" rx="6" fill={`url(#${id})`} stroke="#F8FAFC" strokeWidth="6" />
    {night ? <circle cx={x + 80} cy="48" r="10" fill="#FFF4D6" /> : <circle cx={x + 80} cy="50" r="13" fill="#FFE08A" />}
    <path d={`M${x} 86 Q${x + 30} 66 ${x + 55} 80 T${x + 110} 74 V106 H${x}Z`} fill={night ? '#3A3F6E' : '#9DCDB0'} />
    <line x1={x + 55} y1="26" x2={x + 55} y2="106" stroke="#F8FAFC" strokeWidth="4" />
  </g>;
}
