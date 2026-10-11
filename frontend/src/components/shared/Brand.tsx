

export function SatiLogo({ size = 28, className = "" }: { size?: number; className?: string }) {
  return <img src="/images/Satisampasanya_Logo_app.png" alt="Satisampasanya" width={size} height={size} className={className} style={{objectFit:'contain'}} />;
}

export function SatiIllustration() {
  return (
    <svg viewBox="0 0 240 230" fill="none" className="w-full max-w-[240px]">
      <circle cx="120" cy="125" r="85" fill="#EEF2FF" opacity="0.8" />
      <rect x="74" y="165" width="72" height="7" rx="3.5" fill="#A5B4FC" />
      <rect x="78" y="172" width="7" height="30" rx="3.5" fill="#A5B4FC" />
      <rect x="135" y="172" width="7" height="30" rx="3.5" fill="#A5B4FC" />
      <path d="M94 165 L88 200" stroke="#13112B" strokeWidth="7" strokeLinecap="round" />
      <path d="M126 165 L132 200" stroke="#13112B" strokeWidth="7" strokeLinecap="round" />
      <rect x="92" y="115" width="46" height="55" rx="14" fill="#5B21D1" />
      <circle cx="115" cy="100" r="19" fill="#FBBF24" opacity="0.9" />
      <path d="M97 95 Q100 77 115 80 Q130 77 133 95" fill="#13112B" />
      <rect x="94" y="136" width="32" height="50" rx="5" fill="#1E1B4B" opacity="0.9" />
      <rect x="99" y="143" width="22" height="35" rx="3" fill="#F7F8FF" />
      <rect x="104" y="149" width="6" height="10" rx="1" fill="#5B21D1" />
      <rect x="104" y="159" width="6" height="10" rx="1" fill="#93C5FD" />
      <rect x="110" y="149" width="6" height="10" rx="1" fill="#4318B0" />
      <circle cx="178" cy="55" r="20" fill="#EEF2FF" stroke="#5B21D1" strokeWidth="1.5" opacity="0.9" />
      <path d="M168 52 L174 58 L188 46" stroke="#5B21D1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="38" cy="105" r="17" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="2" />
      <path d="M38 97v9M38 108v2" stroke="#D97706" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="24" y1="91" x2="52" y2="119" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round" opacity="0.65" />
      <line x1="52" y1="91" x2="24" y2="119" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round" opacity="0.65" />
      <circle cx="200" cy="90" r="13" fill="#FEE2E2" stroke="#EF4444" strokeWidth="1.5" opacity="0.8" />
      <path d="M200 83v7M200 92v2" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" />
      <circle cx="52" cy="55" r="5" fill="#5B21D1" opacity="0.22" />
      <circle cx="190" cy="155" r="4" fill="#93C5FD" opacity="0.28" />
      <circle cx="32" cy="160" r="3.5" fill="#5B21D1" opacity="0.18" />
    </svg>
  );
}
