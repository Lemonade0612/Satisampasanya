import {useState} from 'react';
import {needsReview,byPriority,severity,ageHours,formatCount,type AdminPost} from '../api';
import {useLang,useT,waitLabel} from '../i18n';
import {ReviewDialog} from './ReviewDialog';
const signals:Record<string,string>={scam_risk:'Scam risk',trafficking_recruitment:'Recruitment',phishing:'ID request',impersonation:'Impersonation',fear_bait:'Urgency',misinformation:'Unverified claim',harassment:'Harassment',victim_blaming:'Victim blaming',profanity_only:'Profanity',off_topic:'Off-topic'};
const SAFE=['safe_tip','news'];
// Wraps every phrase the AI quoted as evidence in <mark>, matching case-insensitively.
export function Highlighted({text,phrases}:{text:string;phrases:string[]}){
 const terms=phrases.map(p=>p.trim()).filter(p=>p.length>2&&text.toLowerCase().includes(p.toLowerCase()));
 if(!terms.length)return <>{text}</>;
 const pattern=new RegExp(`(${terms.map(t=>t.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|')})`,'gi');
 return <>{text.split(pattern).map((part,i)=>i%2?<mark key={i}>{part}</mark>:part)}</>;
}
export const postSignals=(p:AdminPost)=>[...new Set([...(p.check?.labels||[]).filter(l=>!SAFE.includes(l)).map(l=>signals[l]||l.replace(/_/g,' ')),...(p.screening?.flags||[]).map(f=>f.replace(/ detected$/i,''))])].slice(0,5);
export function NeedsEyesFirst({posts,onReviewed,canReview=true,onOpenQueue}:{posts:AdminPost[];onReviewed:()=>Promise<void>;canReview?:boolean;onOpenQueue:()=>void}){
 const t=useT(),lang=useLang();
 const [selected,setSelected]=useState<AdminPost|null>(null);
 const all=posts.filter(needsReview).sort(byPriority);const top=all.slice(0,4);
 return <section className="sd-card"><div className="sd-card-head"><div><h2>{t.eyes}</h2><p>{t.eyesSub}</p></div>{all.length>4&&<button className="sd-link" onClick={onOpenQueue}>{t.seeAll(all.length)}</button>}</div>{!top.length&&<p className="sd-quiet">{t.caughtUp}</p>}<ol className="sd-eyes">{top.map((p,i)=>{const hours=ageHours(p),red=severity(p)==='red',postLang=p.contentLanguage||p.check?.language||'en',chips=postSignals(p);return <li className="sd-eye" key={p.id}><span className="sd-rank" aria-label={t.rank(i+1)}>{String(i+1).padStart(2,'0')}</span><div><div className="sd-tags"><span className={`sd-pill ${red?'red':'watch'}`}>{red?t.red:t.watch}</span><span className="sd-pill lang" lang={postLang==='lo'?'lo':undefined}>{postLang==='lo'?'ລາວ':'EN'}</span>{p.check?.labels.some(l=>SAFE.includes(l))&&<span className="sd-pill ok">{t.safeTip}</span>}</div><p className="sd-post" lang={postLang==='lo'?'lo':undefined}><Highlighted text={p.content} phrases={p.check?.reasons.map(r=>r.evidence)||[]}/></p>{chips.length>0&&<div className="sd-chips">{chips.map(c=><span className="sd-chip" key={c}>{c}</span>)}</div>}</div><div className="sd-wait"><strong className="mono">{waitLabel(hours,lang)}</strong><small>{hours>=48?t.pastTarget(waitLabel(hours-48,lang)):t.left(waitLabel(48-hours,lang))}</small><span className="sd-overdue" aria-hidden="true"><i className={hours>=48?'':'near'} style={{width:`${Math.min(100,Math.max(4,hours/48*100))}%`}}/></span><button className="sd-btn primary small" disabled={!canReview} title={canReview?undefined:t.viewerCannot} onClick={()=>setSelected(p)}>{t.review}</button></div></li>;})}</ol>{selected&&<ReviewDialog post={selected} onClose={()=>setSelected(null)} onReviewed={onReviewed}/>}</section>;
}
