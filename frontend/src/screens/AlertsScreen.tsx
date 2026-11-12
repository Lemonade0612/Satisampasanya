import { useState } from "react";
import { SatiLogo } from "../components/shared/Brand";
import { AlertTriangle, ArrowLeft, Bell, CheckCheck, ClipboardCheck, Heart, MessageCircle, Newspaper, Repeat2, Settings, ShieldCheck, type LucideIcon } from 'lucide-react';
import { T } from '../lib/translations';
import { alertVerb } from '../lib/alertText';
import type { Lang, Notification } from '../types';

type Tab = 'all' | 'unread' | 'new';
const DAY = 86400000;

const ICONS: Record<Notification['kind'], LucideIcon> = {
  comment: MessageCircle, like: Heart, warned: AlertTriangle, repost: Repeat2, review: ShieldCheck,
  news: Newspaper, safety: AlertTriangle, review_requested: ClipboardCheck, review_overdue: ClipboardCheck,
};

// "5 ນາທີ", "2 ຊມ", "2 ມື້", then a date.
function shortTime(ts: number, lang: Lang, now: number) {
  const lo = lang === 'lo', m = Math.max(0, Math.floor((now - ts) / 60000));
  if (m < 1) return lo ? 'ດຽວນີ້' : 'now';
  if (m < 60) return lo ? `${m} ນາທີ` : `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return lo ? `${h} ຊມ` : `${h}h`;
  const d = Math.floor(h / 24);
  if (d < 7) return lo ? `${d} ມື້` : `${d}d`;
  return new Date(ts).toLocaleDateString(lo ? 'lo-LA' : 'en-US', { day: 'numeric', month: 'short' });
} // REVIEW-LO

export function AlertsScreen({lang,alerts,onMarkRead,onMarkAllRead,onClose,onOpenPost,onOpenSettings}: {lang:Lang;alerts:Notification[];onMarkRead:(id:string)=>Promise<void>;onMarkAllRead:()=>Promise<void>;onClose:()=>void;onOpenPost:(id:string)=>void;onOpenSettings:()=>void}) {
  const t = T[lang], lo = lang === 'lo';
  const [tab, setTab] = useState<Tab>('all');
  const now = Date.now();
  const startOfToday = new Date(now).setHours(0, 0, 0, 0);
  const shown = [...alerts].sort((a, b) => b.created - a.created)
    .filter(a => tab === 'all' || (tab === 'unread' ? !a.read : now - a.created < DAY));
  const groups = [
    { label: lo ? 'ມື້ນີ້' : 'Today', items: shown.filter(a => a.created >= startOfToday) },
    { label: lo ? 'ອາທິດນີ້' : 'This week', items: shown.filter(a => a.created < startOfToday && a.created >= startOfToday - 6 * DAY) },
    { label: lo ? 'ກ່ອນໜ້ານີ້' : 'Earlier', items: shown.filter(a => a.created < startOfToday - 6 * DAY) },
  ].filter(g => g.items.length);
  const tabs: [Tab, string][] = [['all', lo ? 'ທັງໝົດ' : 'All'], ['unread', lo ? 'ຍັງບໍ່ອ່ານ' : 'Unread'], ['new', lo ? 'ໃໝ່' : 'New']];
  const empty = tab === 'unread' ? (lo ? 'ອ່ານໝົດແລ້ວ' : "You're all caught up.") : tab === 'new' ? (lo ? 'ບໍ່ມີແຈ້ງເຕືອນໃໝ່ໃນ 24 ຊົ່ວໂມງ' : 'Nothing new in the last 24 hours.') : (lo ? 'ຍັງບໍ່ມີແຈ້ງເຕືອນ' : 'No notifications yet.');

  return <section className="h-full flex flex-col bg-background font-lao">
    <div className="shrink-0 border-b border-border bg-background">
      <header className="flex items-center gap-2 px-2 py-2">
        <button onClick={onClose} aria-label={t.back} className="min-w-11 min-h-11 flex items-center justify-center"><ArrowLeft size={22}/></button>
        <SatiLogo size={28}/>
        <h2 className="font-display font-bold text-lg flex-1 truncate">{lo ? 'ແຈ້ງເຕືອນ' : 'Notifications'}</h2>
        {alerts.some(a => !a.read) && <button onClick={() => void onMarkAllRead()} className="min-h-11 px-2 flex items-center gap-1 text-sm font-semibold text-primary"><CheckCheck size={16} aria-hidden/>{lo ? 'ອ່ານທັງໝົດ' : 'Mark all read'}</button>}
        <button onClick={onOpenSettings} aria-label={lo ? 'ການຕັ້ງຄ່າ' : 'Settings'} className="min-w-11 min-h-11 flex items-center justify-center text-text-2"><Settings size={22}/></button>
      </header>
      <div role="tablist" className="grid grid-cols-3 px-4">
        {tabs.map(([id, label]) => <button key={id} role="tab" aria-selected={tab === id} onClick={() => setTab(id)}
          className={`relative justify-self-center min-h-12 py-2 px-1 text-[15px] font-bold ${tab === id ? 'text-primary-ink' : 'text-text-muted'}`}>
          {label}{tab === id && <span aria-hidden className="absolute bottom-0 left-0 right-0 h-[3px] bg-primary rounded-full"/>}
        </button>)}
      </div>
    </div>
    <div className="flex-1 min-h-0 overflow-y-auto">
      {!groups.length ? <div className="text-center px-8 py-16">
        <span className="mx-auto w-16 h-16 rounded-full bg-[#F3F4F8] dark:bg-muted border border-[#E9EAF1] dark:border-border text-[#4B4F73] dark:text-muted-foreground flex items-center justify-center mb-3"><Bell size={26}/></span>
        <p className="text-sm text-muted-foreground">{empty}</p>
      </div> : groups.map(g => <div key={g.label}>
        <h3 className="px-4 pt-4 pb-1 text-xs font-semibold text-muted-foreground">{g.label}</h3>
        <ul className="divide-y divide-[#EEEEF4] dark:divide-border">
          {g.items.map(alert => {
            const Icon = ICONS[alert.kind] ?? Bell;
            return <li key={alert.id}><button onClick={() => { if (!alert.read) void onMarkRead(alert.id); onOpenPost(alert.post_id); }}
              className="w-full min-h-[64px] flex items-center gap-3 px-4 py-3 text-left bg-background">
              <span aria-hidden className="w-10 h-10 rounded-full bg-[#F3F4F8] dark:bg-muted border border-[#E9EAF1] dark:border-border text-[#4B4F73] dark:text-muted-foreground flex items-center justify-center shrink-0"><Icon size={18}/></span>
              <span className="flex-1 min-w-0">
                <span className={`block text-sm break-words ${alert.read ? 'text-muted-foreground' : 'font-semibold text-foreground'}`}>{alert.actor_name} {alertVerb(alert, lang)}</span>
                <time dateTime={new Date(alert.created).toISOString()} className="text-xs text-muted-foreground">{shortTime(alert.created, lang, now)}</time>
              </span>
              {!alert.read && <span aria-label={lo ? 'ຍັງບໍ່ອ່ານ' : 'Unread'} className="w-2 h-2 rounded-full bg-primary shrink-0"/>}
            </button></li>;
          })}
        </ul>
      </div>)}
    </div>
  </section>;
}
