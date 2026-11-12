import { MessageCircle } from "lucide-react";

// Floating "Ask Sati" pill: right 16px, 16px above the 76px nav. Scroll areas pad their bottom by ASK_SATI_PAD.
export const ASK_SATI_PAD = "pb-32";
export function AskSatiButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick}
      className="absolute right-4 bottom-[calc(92px+env(safe-area-inset-bottom))] z-30 h-12 px-5 rounded-full bg-background border border-border shadow-[var(--shadow-soft)] flex items-center gap-2 text-text font-bold active:scale-95 transition-transform">
      <MessageCircle size={22} aria-hidden className="text-primary" />ຖາມ Sati
    </button>
  );
}
