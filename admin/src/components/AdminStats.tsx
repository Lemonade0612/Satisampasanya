import {needsReview,ageHours,formatCount,type AdminData} from '../api';
import {useT} from '../i18n';
export function AdminStats({data}:{data:AdminData}){
 const t=useT();
 const day=Date.now()-24*3600000;const recent=data.posts.filter(p=>(p.createdAt||0)>=day);
 const pending=data.posts.filter(needsReview);const breaching=pending.filter(p=>ageHours(p)>=36).length;
 const reviewed=data.posts.filter(p=>p.review);const hours=reviewed.map(p=>(p.review!.reviewedAt-(p.createdAt||p.review!.reviewedAt))/3600000);
 const median=hours.length?hours.sort((a,b)=>a-b)[Math.floor(hours.length/2)]:null;
 const flagged=recent.filter(needsReview).length;
 // A null value renders its fallback words instead of a placeholder dash.
 const values=[{label:t.backlog,value:pending.length?formatCount(pending.length):null,words:t.clear,detail:breaching?t.nearTarget(breaching):t.notNear,danger:breaching>0},{label:t.posts24,value:recent.length?formatCount(recent.length):null,words:t.noNew,detail:t.totals(data.totals.posts,data.totals.users)},{label:t.flagRate,value:recent.length?`${(flagged/recent.length*100).toFixed(1)}%`:null,words:t.noNew,detail:t.sentReview(flagged)},{label:t.median,value:median===null?null:median<1?`${Math.round(median*60)}m`:`${median.toFixed(1)}h`,words:t.noDecisions,detail:t.decisions(reviewed.length)}];
 return <section className="sd-kpis" aria-label={t.kpis}>{values.map(item=><div key={item.label}><span>{item.label}</span>{item.value===null?<strong className="words">{item.words}</strong>:<strong className={item.danger?'danger':''}>{item.value}</strong>}<small>{item.detail}</small></div>)}</section>;
}
