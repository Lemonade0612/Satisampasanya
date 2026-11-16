import logoImage from "/brand-mark.svg";
import { useState, useEffect } from "react";
import type { Lang } from "../types";

export function SplashScreen({ onDone, lang }: { onDone: () => void; lang: Lang }) {
  const [fading, setFading] = useState(false);
  useEffect(() => {
    const t1 = setTimeout(() => setFading(true), 2000);
    const t2 = setTimeout(() => onDone(), 2600);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onDone]);

  return (
    <div className="absolute inset-0 z-[100] flex flex-col items-center justify-center"
      style={{ background: "#FFFFFF", opacity: fading ? 0 : 1, transition: "opacity 0.6s ease-in-out" }}>
      <div className="relative flex flex-col items-center gap-3 px-6 text-center">
        <img src={logoImage} alt="Satisampasanya logo" className="w-[min(70vw,280px)] h-[min(70vw,280px)] object-contain" />
        <h1 className={`text-sm font-semibold tracking-tight text-slate-900 ${lang === "lo" ? "font-lao" : "font-display"}`}>{lang === "lo" ? "ສະຕິຊຳປະຊັນຍະ" : "Satisampasanya"}</h1>
      </div>
      <div className="absolute bottom-16 flex flex-col items-center gap-2">
        <div className="w-8 h-8 rounded-full border-2 border-violet-100 border-t-violet-600 animate-spin" />
        <p className={`text-slate-500 text-[9px] text-center leading-relaxed ${lang === "lo" ? "font-lao" : ""}`}>
          {lang === "lo" ? "ແຫຼ່ງຂໍ້ມູນທີ່ເຊື່ອຖືໄດ້ ສຳລັບໄວໜຸ່ມ" : "Your trusted source, built for youth."}
        </p>
      </div>
    </div>
  );
}
