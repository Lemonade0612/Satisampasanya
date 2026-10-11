import {needsReview,type AdminData} from '../api';
import {Clock3,ShieldCheck,Users,FileText} from 'lucide-react';
export function AdminStats({data}:{data:AdminData}){
 const pending=data.posts.filter(needsReview);const urgent=pending.filter(p=>Date.now()-(p.createdAt||Date.now())>36*3600000).length;
 const reviewed=data.posts.filter(p=>p.review);const timely=reviewed.filter(p=>p.review!.reviewedAt-(p.createdAt||0)<=48*3600000).length;
 const values=[{label:'Waiting for review',value:pending.length,detail:`${urgent} urgent · 48h review target`,icon:Clock3,color:'purple'},{label:'Reviewed within 48h',value:reviewed.length?`${Math.round(timely/reviewed.length*100)}%`:'—',detail:reviewed.length?`${timely} of ${reviewed.length} saved reviews`:'No saved reviews yet',icon:ShieldCheck,color:'blue'},{label:'Scams confirmed',value:data.posts.filter(p=>p.state==='confirmed').length,detail:'Confirmed posts in the database',icon:FileText,color:'amber'},{label:'Community members',value:data.totals.users,detail:`${data.totals.posts} posts · ${data.totals.comments} comments`,icon:Users,color:'green'}];
 return <div className="admin-stats">{values.map(item=><section key={item.label}><div><span>{item.label}</span><span className={`stat-icon ${item.color}`}><item.icon size={18}/></span></div><strong>{item.value}</strong><small>{item.detail}</small></section>)}</div>;
}
