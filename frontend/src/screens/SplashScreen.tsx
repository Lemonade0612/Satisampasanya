import logoImage from "/brand-mark.svg";
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
      <div className="relative flex flex-col items-center gap-3 px-6 text-center">
        <img src={logoImage} alt="Satisampasanya logo" className="w-36 h-36 object-contain " />
        <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900">Satisampasanya</h1>
        <p className="font-lao text-xl font-semibold text-violet-700">ສະຕິຊໍາປະຊັນຍະ</p>
      </div>
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
