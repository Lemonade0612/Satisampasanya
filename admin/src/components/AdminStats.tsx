import {needsReview,ageHours,formatCount,type AdminData} from '../api';
import {Clock3,ShieldAlert,Activity,Timer} from 'lucide-react';
export function AdminStats({data}:{data:AdminData}){
 const day=Date.now()-24*3600000;const recent=data.posts.filter(p=>(p.createdAt||0)>=day);
 const pending=data.posts.filter(needsReview);const breaching=pending.filter(p=>ageHours(p)>=36).length;
 const reviewed=data.posts.filter(p=>p.review);const hours=reviewed.map(p=>(p.review!.reviewedAt-(p.createdAt||p.review!.reviewedAt))/3600000);
 const median=hours.length?hours.sort((a,b)=>a-b)[Math.floor(hours.length/2)]:null;
 const flagged=recent.filter(needsReview).length;
 const values=[{label:'Open backlog',value:formatCount(pending.length),detail:breaching?`${formatCount(breaching)} at risk of breaching 48h SLA`:'No items near SLA breach',icon:Clock3,color:breaching?'amber':'purple'},{label:'Posts · last 24h',value:formatCount(recent.length),detail:`${formatCount(data.totals.posts)} total · ${formatCount(data.totals.users)} members`,icon:Activity,color:'blue'},{label:'Flag rate · last 24h',value:recent.length?`${(flagged/recent.length*100).toFixed(1)}%`:'—',detail:`${formatCount(flagged)} posts routed to review`,icon:ShieldAlert,color:'amber'},{label:'Median time to decision',value:median===null?'—':median<1?`${Math.round(median*60)}m`:`${median.toFixed(1)}h`,detail:`${formatCount(reviewed.length)} decisions recorded`,icon:Timer,color:'green'}];
 return <div className="admin-stats">{values.map(item=><section key={item.label}><div><span>{item.label}</span><span className={`stat-icon ${item.color}`}><item.icon size={18}/></span></div><strong>{item.value}</strong><small>{item.detail}</small></section>)}</div>;
}
