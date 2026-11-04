import {useMemo,useState} from 'react';
import {Heart,MessageCircle,Repeat2,TriangleAlert,Download,CircleCheck,FilterX} from 'lucide-react';
import {formatCount,needsReview,severity,type AdminData,type AdminPost} from '../api';
import {useLang,useT,ago,fullDate} from '../i18n';
import {Select,SearchField,FilterTabs,Pager,downloadCSV} from './ui';
import {ReviewDialog} from './ReviewDialog';

const DAY=86400000;
type StatusKey='all'|'needs'|'flagged'|'sla'|'confirmed'|'false'|'clean'|'rejected';
const STATUS_KEYS:StatusKey[]=['all','needs','flagged','sla','confirmed','false','clean','rejected'];
const matchesStatus=(p:AdminPost,k:StatusKey)=>k==='all'||(k==='needs'?needsReview(p):p.state===k);
const matchesDate=(p:AdminPost,range:string)=>{const age=Date.now()-(p.createdAt||0);return range==='all'||(range==='older'?age>30*DAY:age<=Number(range)*DAY);};
const engagement=(p:AdminPost)=>p.likes+p.comments+p.reposts;
const sorters:Record<string,(a:AdminPost,b:AdminPost)=>number>={
 newest:(a,b)=>(b.createdAt||0)-(a.createdAt||0),oldest:(a,b)=>(a.createdAt||0)-(b.createdAt||0),
 warned:(a,b)=>b.warnedMe-a.warnedMe||(b.createdAt||0)-(a.createdAt||0),active:(a,b)=>engagement(b)-engagement(a)||(b.createdAt||0)-(a.createdAt||0),
};

export function AdminRecords({data,onReviewed,canReview}:{data:AdminData;onReviewed:()=>Promise<void>;canReview:boolean}){
 const t=useT(),lang=useLang();
 const [search,setSearch]=useState(''),[status,setStatus]=useState<StatusKey>('all'),[range,setRange]=useState('all'),[sort,setSort]=useState('newest');
 const [page,setPage]=useState(0),[size,setSize]=useState(25),[expanded,setExpanded]=useState<string|null>(null),[selected,setSelected]=useState<AdminPost|null>(null);
 const reset=<T,>(set:(v:T)=>void)=>(v:T)=>{set(v);setPage(0);};
 const query=search.trim().toLowerCase();
 // Search and date narrow first, so each status tab shows how many matches it would give.
 const base=useMemo(()=>data.posts.filter(p=>matchesDate(p,range)&&(!query||[p.content,p.contentLo,p.tags.join(' '),p.author.name].join(' ').toLowerCase().includes(query))),[data.posts,range,query]);
 const rows=useMemo(()=>base.filter(p=>matchesStatus(p,status)).sort(sorters[sort]),[base,status,sort]);
 const tabs=STATUS_KEYS.map(key=>({key,label:t.states[key],count:base.filter(p=>matchesStatus(p,key)).length,tone:key==='needs'?'red' as const:undefined})).filter(x=>x.count>0||x.key==='all'||x.key==='needs'||x.key===status);
 const visible=rows.slice(page*size,(page+1)*size);
 const filtered=status!=='all'||range!=='all'||!!query;
 const clear=()=>{setSearch('');setStatus('all');setRange('all');setPage(0);};
 const exportCSV=()=>downloadCSV('sati-posts.csv',[['ID','Received','Author','Status','Needs review','Content','Tags','Likes','Comments','Reposts','Warnings','Reviewer','Review note'],...rows.map(p=>[p.id,p.createdAt?new Date(p.createdAt).toISOString():'',p.author.name,p.state,needsReview(p)?'yes':'no',p.content,p.tags.join(' '),p.likes,p.comments,p.reposts,p.warnedMe,p.review?.reviewerName,p.review?.note])]);

 return <section className="sd-card sd-table-card">
  <div className="sd-card-head"><div><h2>{t.postsHead} <span className="sd-count-badge mono">{formatCount(data.posts.length)}</span></h2><p>{t.postsSub}</p></div>
   <button className="sd-btn" onClick={exportCSV} disabled={!rows.length}><Download size={16}/>{t.exportCsv}</button></div>
  <FilterTabs label={t.colStatus} value={status} onChange={reset(setStatus)} items={tabs}/>
  <div className="sd-toolbar">
   <SearchField value={search} onChange={reset(setSearch)} placeholder={t.searchPosts}/>
   <Select label={t.dateRange} value={range} onChange={reset(setRange)} options={[{value:'all',label:t.anyTime},{value:'1',label:t.d1},{value:'7',label:t.d7},{value:'30',label:t.d30},{value:'older',label:t.older}]}/>
   <Select label={t.sortBy} value={sort} onChange={reset(setSort)} options={[{value:'newest',label:t.newest},{value:'oldest',label:t.oldest},{value:'warned',label:t.mostWarned},{value:'active',label:t.mostActive}]}/>
   {filtered&&<button className="sd-btn ghost" onClick={clear}><FilterX size={16}/>{t.clearFilters}</button>}
  </div>
  <div className="sd-table-wrap"><table className="sd-table">
   <thead><tr><th>{t.colPost}</th><th>{t.colAuthor}</th><th>{t.colStatus}</th><th>{t.colReceived}</th><th>{t.colActivity}</th><th className="right">{t.colAction}</th></tr></thead>
   <tbody>{visible.map(p=>{const needs=needsReview(p),fresh=Date.now()-(p.createdAt||0)<DAY,open=expanded===p.id,long=p.content.length>110,postLang=p.contentLanguage||p.check?.language;
    return <tr key={p.id} className={needs?'attention':''}>
     <td className="c-post"><div className="sd-post-cell">{p.image&&<img src={p.image} alt="" loading="lazy"/>}<div>
      {(fresh||needs)&&<div className="sd-tags">{needs&&<span className={`sd-pill ${severity(p)==='red'?'red':'watch'}`}>{severity(p)==='red'?t.red:t.watch}</span>}{fresh&&<span className="sd-pill new">{t.newBadge}</span>}</div>}
      <p className={`sd-cell-text ${open?'':'clamp'}`} lang={postLang==='lo'?'lo':undefined}>{p.content}</p>
      {long&&<button className="sd-more-link" onClick={()=>setExpanded(open?null:p.id)}>{open?t.showLess:t.showMore}</button>}
      {p.tags.length>0&&<p className="sd-hashtags">{p.tags.map(tag=>'#'+tag).join('  ')}</p>}
      {p.review&&<p className="sd-review-note"><CircleCheck size={14}/><span><strong>{t.reviewedBy(p.review.reviewerName)}</strong> · {p.review.note}</span></p>}
     </div></div></td>
     <td className="c-author">{p.author.name}</td>
     <td><span className={`sd-status s-${p.state}`}>{t.states[p.state]||p.state}</span></td>
     <td className="c-time">{p.createdAt?<><time dateTime={new Date(p.createdAt).toISOString()} title={fullDate(p.createdAt,lang)}>{ago(p.createdAt,lang)}</time><small>{fullDate(p.createdAt,lang)}</small></>:'—'}</td>
     <td><div className="sd-activity mono">
      <span title={t.likes}><Heart size={14}/>{formatCount(p.likes)}</span><span title={t.comments}><MessageCircle size={14}/>{formatCount(p.comments)}</span>
      <span title={t.reposts}><Repeat2 size={14}/>{formatCount(p.reposts)}</span><span title={t.warnings} className={p.warnedMe?'warn':''}><TriangleAlert size={14}/>{formatCount(p.warnedMe)}</span>
     </div></td>
     <td className="right">{needs?<button className="sd-btn primary small" disabled={!canReview} title={canReview?undefined:t.viewerCannot} onClick={()=>setSelected(p)}>{t.review}</button>:<span className="sd-dash">—</span>}</td>
    </tr>;})}</tbody>
  </table>{!rows.length&&<div className="sd-empty-state"><p>{t.noMatch}</p>{filtered&&<button className="sd-btn" onClick={clear}>{t.clearFilters}</button>}</div>}</div>
  <Pager page={page} size={size} total={rows.length} onChange={setPage} onSize={s=>{setSize(s);setPage(0);}}/>
  {selected&&<ReviewDialog post={selected} onClose={()=>setSelected(null)} onReviewed={onReviewed}/>}
 </section>;
}
