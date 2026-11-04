import {formatCount,type AdminPost} from '../api';
import {useLang,useT,dayDate} from '../i18n';
export function PostCalendar({posts}:{posts:AdminPost[]}){
 const t=useT(),lang=useLang();
 const today=new Date();today.setHours(0,0,0,0);
 const start=new Date(today);start.setDate(start.getDate()-(today.getDay()+6)%7-14);
 const days=Array.from({length:21},(_,i)=>{const from=new Date(start);from.setDate(from.getDate()+i);const to=new Date(from);to.setDate(to.getDate()+1);return{date:from,future:+from>+today,count:posts.filter(p=>p.createdAt!>=+from&&p.createdAt!<+to).length};});
 const past=days.filter(d=>!d.future);const max=Math.max(1,...past.map(d=>d.count));
 const level=(n:number)=>n?Math.min(4,Math.ceil(n/max*4)):0;
 const busiest=past.reduce((best,d)=>d.count>best.count?d:best,past[0]);
 let streak=0,run=0;past.forEach(d=>{run=d.count?0:run+1;streak=Math.max(streak,run);});
 return <section className="sd-card"><div className="sd-card-head"><div><h2>{t.calendar}</h2><p>{t.calendarSub(past.reduce((sum,d)=>sum+d.count,0))}</p></div><div className="sd-heat-scale" aria-hidden="true">{t.fewer}{[0,1,2,3,4].map(l=><i key={l} className={`l${l}`}/>)}{t.more}</div></div><div className="sd-heat" role="list" aria-label={t.calendar}>{t.weekdays.map(d=><span className="sd-heat-label" aria-hidden="true" key={d}>{d}</span>)}{days.map(d=><div key={+d.date} role="listitem" className={`sd-heat-day ${d.future?'out':''} ${+d.date===+today?'today':''}`} aria-label={`${dayDate(d.date,lang)}: ${d.future?t.upcoming:t.postCount(d.count)}`}><span className={`sd-heat-dot l${d.future?0:level(d.count)}`}>{d.date.getDate()}</span><small className="mono">{!d.future&&d.count>0?formatCount(d.count):''}</small></div>)}</div><div className="sd-tiles"><div className="sd-tile"><span>{t.busiest}</span>{busiest.count?<><strong>{t.postCount(busiest.count)}</strong><small>{dayDate(busiest.date,lang)}</small></>:<><strong>{t.noPostsYet}</strong><small>{t.nothingInRange}</small></>}</div><div className="sd-tile"><span>{t.quiet}</span><strong>{t.days(streak)}</strong><small>{streak?t.longestQuiet:t.everyDay}</small></div></div></section>;
}
