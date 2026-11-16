import logoImage from "/brand-mark.svg";
import { useState, useEffect } from "react";
import type { Lang } from "../types";

// Total time on screen. The progress bar below runs for the same length.
const TOTAL_MS = 3000;

const CSS = `
@keyframes splash-in { from { opacity: 0; transform: translateY(12px) scale(0.92); } to { opacity: 1; transform: none; } }
@keyframes splash-glow { 0%, 100% { transform: scale(1); opacity: 0.55; } 50% { transform: scale(1.12); opacity: 0.85; } }
@keyframes splash-bar { from { transform: scaleX(0); } to { transform: scaleX(1); } }
@keyframes splash-rise { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
`;

export function SplashScreen({ onDone, lang }: { onDone: () => void; lang: Lang }) {
  const [fading, setFading] = useState(false);
  useEffect(() => {
    const t1 = setTimeout(() => setFading(true), TOTAL_MS - 600);
    const t2 = setTimeout(() => onDone(), TOTAL_MS);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onDone]);

  return (
    <div className="absolute inset-0 z-[100] flex flex-col items-center justify-between h-dvh overflow-hidden px-6 py-[8dvh]"
      style={{ background: "radial-gradient(120% 70% at 50% 30%, #F3EEFF 0%, #FFFFFF 60%)", opacity: fading ? 0 : 1, transition: "opacity 0.6s ease-in-out" }}>
      <style>{CSS}</style>

      <div className="relative flex flex-col items-center gap-4 text-center">
        <div className="relative flex items-center justify-center">
          <span aria-hidden className="absolute w-[min(62vw,260px)] h-[min(62vw,260px)] rounded-full bg-[radial-gradient(circle,#E4D9FF_0%,rgba(243,238,255,0)_72%)]"
            style={{ animation: "splash-glow 2.4s ease-in-out infinite" }} />
          <img src={logoImage} alt="Satisampasanya logo"
            className="relative w-[min(56vw,230px)] h-[min(56vw,230px)] object-contain [mask-image:radial-gradient(closest-side,#000_45%,transparent_92%)] [-webkit-mask-image:radial-gradient(closest-side,#000_45%,transparent_92%)]"
            style={{ animation: "splash-in 0.9s cubic-bezier(.2,.8,.2,1) both" }} />
        </div>
        <h1 className={`text-2xl font-bold leading-[1.35] tracking-normal text-[#14112B] font-[BoonHome,Phetsarath,sans-serif] ${lang === "lo" ? "" : "font-display"}`}
          style={{ animation: "splash-rise 0.7s 0.3s ease-out both" }}>
          {lang === "lo" ? "ສະຕິຊຳປະຊັນຍະ" : "Satisampasanya"}
        </h1>
      </div>

      <div className="flex flex-col items-center gap-4 w-full max-w-[220px]" style={{ animation: "splash-rise 0.7s 0.5s ease-out both" }}>
        <div role="progressbar" aria-label={lang === "lo" ? "ກຳລັງໂຫຼດ" : "Loading"} className="w-full h-1 rounded-full bg-[#ECE6FB] overflow-hidden">
          <span className="block h-full w-full origin-left rounded-full bg-gradient-to-r from-[#5B21D1] to-[#2563EB]"
            style={{ animation: `splash-bar ${TOTAL_MS}ms linear both` }} />
        </div>
        <p className={`text-[#5F6390] text-[10px] text-center leading-relaxed ${lang === "lo" ? "font-lao" : ""}`}>
          {lang === "lo" ? "ແຫຼ່ງຂໍ້ມູນທີ່ເຊື່ອຖືໄດ້ ສຳລັບໄວໜຸ່ມ" : "Your trusted source, built for youth."}
        </p>
      </div>
    </div>
  );
}
