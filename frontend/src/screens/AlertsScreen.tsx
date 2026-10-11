import { SatiLogo } from "../components/shared/Brand";
import { ArrowLeft, Bell } from 'lucide-react';
import { T } from '../lib/translations';
import type { Lang, Notification } from '../types';

export function AlertsScreen({lang,alerts,onMarkRead,onMarkAllRead,onClose}: {lang:Lang;alerts:Notification[];onMarkRead:(id:string)=>Promise<void>;onMarkAllRead:()=>Promise<void>;onClose:()=>void}) {
  const t=T[lang];
  const verbs={comment:lang==='lo'?'ສະແດງຄຳຄິດເຫັນໃນໂພສຂອງທ່ານ':'commented on your post',like:lang==='lo'?'ມັກໂພສຂອງທ່ານ':'liked your post',warned:lang==='lo'?'ໄດ້ຮັບຄຳເຕືອນຈາກໂພສຂອງທ່ານ':'found your warning helpful',repost:lang==='lo'?'ແບ່ງປັນໂພສຂອງທ່ານ':'reposted your post'};
  return <section className="h-full flex flex-col bg-background"><header className="flex items-center gap-3 px-3 py-2 border-b border-border"><button onClick={onClose} aria-label={t.back} className="touch-target"><ArrowLeft size={22}/></button><SatiLogo size={28}/><h2 className="font-semibold flex-1">{t.alerts_title}</h2>{alerts.some(a=>!a.read)&&<button onClick={()=>void onMarkAllRead()} className="touch-target text-sm text-primary">{t.alerts_mark_all}</button>}</header><div className="flex-1 min-h-0 overflow-y-auto">{!alerts.length?<div className="text-center p-8 text-muted-foreground"><Bell className="mx-auto mb-3"/>{lang==='lo'?'ຍັງບໍ່ມີແຈ້ງເຕືອນ':'No notifications yet.'}</div>:alerts.map(alert=><button key={alert.id} onClick={()=>void onMarkRead(alert.id)} className={`block w-full text-left p-4 border-b border-border ${alert.read?'':'bg-primary/5'}`}><p className="text-sm font-lao break-words">{alert.actor_name} {verbs[alert.kind]}</p><time className="text-xs text-muted-foreground">{new Date(alert.created).toLocaleString(lang==='lo'?'lo-LA':'en-US')}</time></button>)}</div></section>;
}
