import { useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import { alertVerb } from '../../lib/alertText';
import type { Lang, Notification } from '../../types';

// On-ground notification: slides in from the top while the app is open.
export function AlertBanner({ alert, lang, onOpen, onDismiss }: { alert: Notification; lang: Lang; onOpen: () => void; onDismiss: () => void }) {
  useEffect(() => { const timer = setTimeout(onDismiss, 5000); return () => clearTimeout(timer); }, [alert.id, onDismiss]);
  return (
    <div role="status" aria-live="polite" className="alert-banner absolute top-[calc(env(safe-area-inset-top)+8px)] inset-x-3 z-[60] flex items-center gap-3 rounded-2xl bg-card border border-border shadow-xl p-3">
      <button onClick={onOpen} className="flex flex-1 min-w-0 items-center gap-3 text-left">
        <span className="shrink-0 w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center"><Bell size={18} /></span>
        <span className="min-w-0">
          <span className="block text-xs font-semibold text-muted-foreground">Sati</span>
          <span className="block text-sm font-lao truncate"><b>{alert.actor_name}</b> {alertVerb(alert, lang)}</span>
        </span>
      </button>
      <button onClick={onDismiss} aria-label={lang === 'lo' ? 'ປິດ' : 'Dismiss'} className="touch-target shrink-0 text-muted-foreground"><X size={18} /></button>
    </div>
  );
}
