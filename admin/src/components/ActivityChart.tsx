import {formatCount,type AdminPost} from '../api';
import {useLang,useT,shortDate} from '../i18n';
export function ActivityChart({posts}:{posts:AdminPost[]}){
 const t=useT(),lang=useLang();
 const today=new Date();const days=Array.from({length:14},(_,i)=>{const d=new Date(today);d.setDate(d.getDate()-13+i);d.setHours(0,0,0,0);return d;});
 const counts=days.map(d=>{const end=new Date(d);end.setDate(end.getDate()+1);return{posted:posts.filter(p=>p.createdAt!>=+d&&p.createdAt!<+end).length,reviewed:posts.filter(p=>p.review&&p.review.reviewedAt>=+d&&p.review.reviewedAt<+end).length};});
 const max=Math.max(1,...counts.flatMap(x=>[x.posted,x.reviewed]));
 const posted=counts.reduce((sum,x)=>sum+x.posted,0),reviewed=counts.reduce((sum,x)=>sum+x.reviewed,0);
 const insight=!posted&&!reviewed?t.insNone:!reviewed?t.insNoReview(posted):reviewed>=posted?t.insPace(reviewed,posted):t.insBehind(posted-reviewed);
 const slot=680/14,bar=Math.min(14,slot/2-4),h=(n:number)=>n/max*170;
 return <section className="sd-card sd-bars"><div className="sd-card-head"><div><h2>{t.activity}</h2><p>{t.activitySub}</p></div><div className="sd-legend"><span><i className="sd-swatch" style={{background:'var(--brand)'}}/>{t.posted}</span><span><i className="sd-swatch" style={{background:'var(--topic-invest)'}}/>{t.reviewed}</span></div></div><svg viewBox="0 0 730 230" role="img" aria-label={`${t.activity}: ${posted} ${t.posted}, ${reviewed} ${t.reviewed}`}>{[...new Set([0,1,2,3].map(i=>Math.round(max*i/3)))].map(v=><g key={v}><line x1="40" x2="720" y1={200-h(v)} y2={200-h(v)} stroke="var(--divider)"/><text x="30" y={204-h(v)} textAnchor="end">{formatCount(v)}</text></g>)}{counts.map((c,i)=>{const x=40+i*slot+slot/2;return <g key={i}><rect x={x-bar-1} y={200-h(c.posted)} width={bar} height={h(c.posted)} rx="3" fill="var(--brand)"><title>{`${shortDate(days[i],lang)}: ${c.posted} ${t.posted}`}</title></rect><rect x={x+1} y={200-h(c.reviewed)} width={bar} height={h(c.reviewed)} rx="3" fill="var(--topic-invest)"><title>{`${shortDate(days[i],lang)}: ${c.reviewed} ${t.reviewed}`}</title></rect></g>;})}{[0,4,9,13].map(i=><text key={i} x={40+i*slot+slot/2} y="222" textAnchor="middle">{shortDate(days[i],lang)}</text>)}</svg><p className="sd-insight">{insight}</p></section>;
}
