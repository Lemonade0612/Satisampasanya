import {useMemo,useState} from 'react';
import {Lock,CircleCheck} from 'lucide-react';
import {needsReview,byPriority,severity,ageHours,formatCount,type AdminPost} from '../api';
import {useLang,useT,ago,fullDate,waitLabel} from '../i18n';
import {ModerationLabels} from './ModerationLabels';
import {Highlighted} from './NeedsEyesFirst';
import {ReviewDialog} from './ReviewDialog';
import {Select,SearchField,FilterTabs,Pager} from './ui';

type Filter='all'|'red'|'yellow'|'breach';
const sorters:Record<string,(a:AdminPost,b:AdminPost)=>number>={priority:byPriority,oldest:(a,b)=>(a.createdAt||0)-(b.createdAt||0),newest:(a,b)=>(b.createdAt||0)-(a.createdAt||0)};

export function ReviewQueue({posts,onReviewed,canReview=true}:{posts:AdminPost[];onReviewed:()=>Promise<void>;canReview?:boolean}){
 const t=useT(),lang=useLang();
 const [filter,setFilter]=useState<Filter>('all'),[search,setSearch]=useState(''),[sort,setSort]=useState('priority');
 const [page,setPage]=useState(0),[size,setSize]=useState(25),[selected,setSelected]=useState<AdminPost|null>(null);
 const query=search.trim().toLowerCase();
 const all=useMemo(()=>posts.filter(needsReview).filter(p=>!query||[p.content,p.contentLo,p.tags.join(' '),p.author.name].join(' ').toLowerCase().includes(query)),[posts,query]);
 const match=(p:AdminPost,f:Filter)=>f==='all'||(f==='breach'?ageHours(p)>=36:severity(p)===f);
 const queue=useMemo(()=>all.filter(p=>match(p,filter)).sort(sorters[sort]),[all,filter,sort]);
 const visible=queue.slice(page*size,(page+1)*size);
 const tabs=([['all',t.states.all],['red',t.red],['yellow',t.watch],['breach',t.breach]] as const).map(([key,label])=>({key:key as Filter,label,count:all.filter(p=>match(p,key)).length,tone:key==='red'?'red' as const:key==='yellow'?'watch' as const:undefined}));
 return <section className="sd-card sd-table-card">
  <div className="sd-card-head"><div><h2>{t.queueHead} <span className="sd-count-badge mono">{formatCount(posts.filter(needsReview).length)}</span></h2><p>{t.queueSub}</p></div></div>
  <FilterTabs label={t.queue} value={filter} onChange={f=>{setFilter(f);setPage(0);}} items={tabs}/>
  <div className="sd-toolbar">
   <SearchField value={search} onChange={v=>{setSearch(v);setPage(0);}} placeholder={t.searchQueue}/>
   <Select label={t.sortBy} value={sort} onChange={v=>{setSort(v);setPage(0);}} options={[{value:'priority',label:t.priority},{value:'oldest',label:t.oldest},{value:'newest',label:t.newest}]}/>
  </div>
  {!queue.length&&<div className="sd-empty-state"><CircleCheck size={22}/><p>{query||filter!=='all'?t.noMatch:t.caughtUp}</p></div>}
  <ol className="sd-queue">{visible.map(p=>{const hours=ageHours(p),postLang=p.contentLanguage||p.check?.language;
   return <li key={p.id} className={`sd-qrow ${severity(p)}`}>
    <div className="sd-qmain">
     <ModerationLabels post={p}/>
     <p className="sd-qtext" lang={postLang==='lo'?'lo':undefined}><Highlighted text={p.content} phrases={p.check?.reasons.map(r=>r.evidence)||[]}/></p>
     <p className="sd-qmeta"><strong>{p.author.name}</strong>{p.tags.length>0&&<span>{p.tags.map(tag=>'#'+tag).join(' ')}</span>}{p.createdAt&&<time title={fullDate(p.createdAt,lang)}>{ago(p.createdAt,lang)}</time>}</p>
     <p className="sd-qreason"><Lock size={14}/>{p.screening?.note||p.flagReason||t.flagged} · {t.locked}</p>
    </div>
    <div className="sd-wait">
     <strong className="mono">{waitLabel(hours,lang)}</strong>
     <small>{hours>=48?t.pastTarget(waitLabel(hours-48,lang)):t.left(waitLabel(48-hours,lang))}</small>
     <span className="sd-overdue" aria-hidden="true"><i className={hours>=48?'':'near'} style={{width:`${Math.min(100,Math.max(4,hours/48*100))}%`}}/></span>
     <button className="sd-btn primary small" disabled={!canReview} title={canReview?undefined:t.viewerCannot} onClick={()=>setSelected(p)}>{t.review}</button>
    </div>
   </li>;})}</ol>
  <Pager page={page} size={size} total={queue.length} onChange={setPage} onSize={s=>{setSize(s);setPage(0);}}/>
  {selected&&<ReviewDialog post={selected} onClose={()=>setSelected(null)} onReviewed={onReviewed}/>}
 </section>;
}
