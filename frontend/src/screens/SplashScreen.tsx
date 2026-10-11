import logoImage from "/images/Satisampasanya_Logo_app.png";
import { useState, useEffect } from "react";

export function SplashScreen({ onDone }: { onDone: () => void }) {
  const [fading, setFading] = useState(false);
  useEffect(() => {
    const t1 = setTimeout(() => setFading(true), 2000);
    const t2 = setTimeout(() => onDone(), 2600);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onDone]);

  return (
    <div className="absolute inset-0 z-[100] flex flex-col items-center justify-center"
      style={{ background: "#FFFFFF", opacity: fading ? 0 : 1, transition: "opacity 0.6s ease-in-out" }}>
      <div className="absolute inset-0" style={{ background: "radial-gradient(circle at 50% 40%, rgba(147,197,253,0.12) 0%, transparent 60%)" }} />
      <div className="relative">
        <img src={logoImage} alt="Sati Logo" className="w-20 h-20 rounded-2xl object-contain " />
      </div>
      <h1 className="font-display font-bold text-slate-900 text-center mt-6 leading-none" style={{ fontSize: 32, letterSpacing: "-0.03em" }}>
        Satisampasanya
      </h1>
      <p className="font-lao text-slate-500 mt-3 text-base" style={{ letterSpacing: "0.04em" }}>ສະຕິຊໍາປະຊັນຍະ</p>

      <div className="absolute bottom-16 flex flex-col items-center gap-2">
        <div className="w-8 h-8 rounded-full border-2 border-violet-100 border-t-violet-600 animate-spin" />
        <p className="text-slate-500 text-[10px] text-center leading-relaxed">
          Your trusted source, built for youth.
        </p>
        <p className="font-lao text-slate-500 text-[10px] text-center mt-0.5">
          ແຫຼ່ງຂໍ້ມູນທີ່ໜ້າເຊື່ອ ສໍາລັບໄວໜຸ່ມ
        </p>
      </div>
    </div>
  );
}
