import { useState } from 'react';
import { UserRound, WifiOff, X } from 'lucide-react';
import type { Lang } from '../../types';

// Small "offline" / "guest" chip for the Daily home screen. It replaces the full-width banner that sat above
// every screen: it floats at the bottom, opens for the explanation and the retry/sign-in button,
// and can be dismissed for the rest of the session.
const HIDE_KEY = 'sati-guest-chip-hidden';
const readHidden = () => { try { return sessionStorage.getItem(HIDE_KEY) === '1'; } catch { return false; } };

export function GuestChip({ lang, offline, onAction }: { lang: Lang; offline: boolean; onAction: () => void }) {
  const lo = lang === 'lo';
  const [hidden, setHidden] = useState(readHidden);
  const [open, setOpen] = useState(false);
  if (hidden) return null;
  const hide = () => { setHidden(true); try { sessionStorage.setItem(HIDE_KEY, '1'); } catch { /* storage blocked: hidden until reload */ } };
  const Icon = offline ? WifiOff : UserRound;
  const label = offline ? (lo ? 'ອອບລາຍ' : 'Offline') : (lo ? 'ຫຼິ້ນແບບແຂກ' : 'Guest'); // REVIEW-LO ອອບລາຍ
  const detail = offline
    ? (lo ? 'ເກມທີ່ມີໃນແອັບ, ບັນທຶກຄວາມຄືບໜ້າໃນໂທລະສັບນີ້.' : 'Built-in games, progress saved on this phone.')
    : (lo ? 'ບັນທຶກຄວາມຄືບໜ້າໃນໂທລະສັບນີ້.' : 'Progress saved on this phone.');
  const action = offline ? (lo ? 'ລອງໃໝ່' : 'Try again') : (lo ? 'ເຂົ້າສູ່ລະບົບ' : 'Sign in');
  return (
    <div className="sticky bottom-3 z-20 flex justify-center px-4 pointer-events-none mt-3">
      <div role="status" className="pointer-events-auto flex flex-col rounded-2xl bg-foreground/90 text-background shadow-lg font-lao text-sm max-w-full">
        {open && <p className="px-3 pt-2.5">{detail}</p>}
        <div className="flex items-center">
          <button onClick={() => setOpen(o => !o)} aria-expanded={open} className="flex items-center gap-1.5 pl-3 pr-2 min-h-11 font-semibold">
            <Icon size={16} className="shrink-0" />{label}
          </button>
          <button onClick={onAction} className="px-2 min-h-11 font-bold underline underline-offset-2">{action}</button>
          <button onClick={hide} aria-label={lo ? 'ປິດ' : 'Dismiss'} className="w-11 h-11 flex items-center justify-center opacity-80"><X size={16} /></button>
        </div>
      </div>
    </div>
  );
}
