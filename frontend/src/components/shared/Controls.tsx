import { Globe, Sun, Moon } from "lucide-react";
import { T } from "../../lib/translations";
import type { Lang, ThemeMode } from "../../types";

export function FormInput({ value, onChange, placeholder, type = "text", error, right }: {
  value: string; onChange: (v: string) => void; placeholder: string;
  type?: string; error?: string; right?: React.ReactNode;
}) {
  return (
    <div className="mb-3">
      <div className={`flex items-center rounded-xl px-4 py-3.5 border transition-all ${error ? "border-red-400 bg-red-50/30" : "border-border bg-muted/50 focus-within:border-primary/60 focus-within:bg-white dark:focus-within:bg-background"}`}>
        <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} type={type}
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/60 text-foreground" />
        {right}
      </div>
      {error && <p className="text-[11px] text-red-500 mt-1 ml-1">{error}</p>}
    </div>
  );
}

export function SocialButtons({ onPress, label }: { onPress: () => void; label: string }) {
  return (
    <div className="mt-5 mb-2">
      <p className="text-xs text-muted-foreground text-center mb-3">{label}</p>
      <div className="flex justify-center gap-4">
        {[
          <svg key="g" width="18" height="18" viewBox="0 0 18 18"><path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908C16.658 14.251 17.64 11.945 17.64 9.2z" fill="#4285F4"/><path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/><path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/><path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/></svg>,
          <svg key="f" width="18" height="18" viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>,
          <svg key="a" width="15" height="18" viewBox="0 0 814 1000" fill="black"><path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76.5 0-103.7 40.8-165.9 40.8s-105-57.8-155.5-127.4C46 537.8 10.3 427.8 10.3 321.7c0-178.5 116.4-272.8 230.7-272.8 61.3 0 112.4 40.8 150.8 40.8 36.7 0 94.7-43.1 163.7-43.1 26.4 0 108.2 2.6 163.7 80.3zm-234.4-181.9c30.3-36.2 52.2-86.5 52.2-136.7 0-7.1-.6-14.3-1.9-20.1-49.3 1.9-108.2 33.2-142.6 75.2-28.1 32.2-55.9 82.5-55.9 133.3 0 7.7 1.3 15.4 1.9 17.9 3.2.6 8.4 1.3 13.6 1.3 44.1 0 100.9-30.3 132.7-70.9z"/></svg>,
        ].map((icon, i) => (
          <button key={i} onClick={onPress} className="w-12 h-12 rounded-full border border-border bg-white dark:bg-background flex items-center justify-center hover:bg-gray-50 dark:hover:bg-muted active:scale-95 transition-all shadow-sm">{icon}</button>
        ))}
      </div>
    </div>
  );
}

export function LangToggle({ lang, onToggle }: { lang: Lang; onToggle: () => void }) {
  return (
    <button onClick={onToggle} className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-full border border-primary/30 bg-white/70 dark:bg-background/70 text-primary hover:bg-primary/5 active:scale-95 transition-all backdrop-blur-sm">
      <Globe size={12} />
      <span className="font-lao text-[11px]">{T[lang].lang_switch}</span>
    </button>
  );
}

export function ThemeToggle({ mode, onChange }: { mode: ThemeMode; onChange: (m: ThemeMode) => void }) {
  const isDark = mode === "dark" || (mode === "system" && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches);
  return (
    <button
      onClick={() => onChange(isDark ? "light" : "dark")}
      className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
      title={isDark ? "Switch to light" : "Switch to dark"}
    >
      {isDark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}
