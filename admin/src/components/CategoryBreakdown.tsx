import {Lightbulb} from 'lucide-react';
import {formatCount,topicIndex,TOPIC_COLORS,type AdminPost} from '../api';
import {useT} from '../i18n';
export function CategoryBreakdown({posts}:{posts:AdminPost[]}){
 const t=useT();
 const reported=posts.filter(p=>['flagged','sla','confirmed','false'].includes(p.state));
 const counts=TOPIC_COLORS.map(()=>0);reported.forEach(p=>counts[topicIndex(p)]++);
 const total=reported.length,max=Math.max(1,...counts),pct=(n:number)=>total?Math.round(n/total*100):0;
 return <section className="sd-card"><div className="sd-card-head"><div><h2>{t.topics}</h2><p>{t.topicsSub(total)}</p></div></div><div className="sd-topics">{t.topicNames.map((name,i)=><div className="sd-topic-row" key={name}><strong>{name}</strong><span className="sd-track" role="img" aria-label={`${name}: ${counts[i]}, ${pct(counts[i])}%`}><i style={{width:`${counts[i]/max*100}%`,background:TOPIC_COLORS[i]}}/></span><span className="mono">{formatCount(counts[i])} · {pct(counts[i])}%</span></div>)}</div>{pct(counts[4])>50&&<p className="sd-tip"><Lightbulb size={16}/><span>{t.tip}</span></p>}</section>;
}
