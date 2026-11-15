import {useState} from 'react';
import {CircleCheck,TriangleAlert} from 'lucide-react';
import {adminApi,type AdminCurated} from '../api';
import {useLang} from '../i18n';
import {FilterTabs} from './ui';
import {useAdminList} from './ScenarioReview';

// Curated Posts / ຂ່າວສານ: staff approve or reject what the public feed shows. The server enforces the role and refuses to
// approve a post the moderation rules reject. Job, study, volunteer, finance and child-related posts start as pending.
type Filter='pending'|'approved'|'rejected'|'all';
const RULE:Record<string,string>={approve:'Rules: OK',review:'Rules: needs a person',reject:'Rules: reject'};

export function CuratedReview({refreshKey,canReview}:{refreshKey:unknown;canReview:boolean}){
 const lo=useLang()==='lo';
 const {items,error,reload}=useAdminList(adminApi.curated,refreshKey);
 const [filter,setFilter]=useState<Filter>('pending'),[note,setNote]=useState<Record<string,string>>({}),[busy,setBusy]=useState(''),[problem,setProblem]=useState('');
 const all=items||[];
 const shown=all.filter(p=>filter==='all'||p.status===filter);
 const decide=async(p:AdminCurated,status:'approved'|'rejected'|'pending')=>{
  setBusy(p.id);setProblem('');
  try{await adminApi.reviewCurated(p.id,status,note[p.id]||'');await reload();}catch(e){setProblem((e as Error).message);}finally{setBusy('');}
 };
 const tabs=(['pending','approved','rejected','all'] as const).map(key=>({key:key as Filter,label:key[0].toUpperCase()+key.slice(1),count:key==='all'?all.length:all.filter(p=>p.status===key).length,tone:key==='pending'?'watch' as const:undefined}));
 return <section className="sd-card sd-table-card">
  <div className="sd-card-head"><div><h2>{lo?'ໂພສຄັດເລືອກ (ຂ່າວສານ)':'Curated posts'}</h2><p>The app feed shows only approved, unexpired posts. Hotlines are pinned. Jobs, study abroad, volunteering, finance and anything involving children wait here for a person.</p></div></div>
  <FilterTabs label="Curated posts" value={filter} onChange={setFilter} items={tabs}/>
  {(error||problem)&&<div className="admin-error" role="alert">{error||problem}</div>}
  {items&&!shown.length&&<div className="sd-empty-state"><CircleCheck size={22}/><p>No posts in this status.</p></div>}
  <ol className="sd-queue">{shown.map(p=>
   <li key={p.id} className="sd-qrow">
    <div className="sd-qmain">
     <p className="sd-tags"><span className={`sd-status s-${p.status==='approved'?'live':p.status==='rejected'?'rejected':'draft'}`}>{p.status}</span><span className="sd-pill">{p.type}</span>{p.pinned&&<span className="sd-pill">pinned</span>}{p.expired&&<span className="sd-pill">expired</span>}<span className="sd-pill">{p.verified?'Verified source':'Unverified source'}</span><span className="sd-pill">{RULE[p.moderation.decision]}</span></p>
     <p className="sd-qtext"><strong>{p.title_en}</strong> · <span lang="lo">{p.title_lo}</span></p>
     <p className="sd-qreason">{p.summary_en}</p>
     {p.moderation.flags.filter(f=>f!=='unverified_source').length>0&&<p className="sd-qreason"><TriangleAlert size={14} aria-hidden="true"/> Flags: {p.moderation.flags.join(', ')}</p>}
     {p.moderation.decision!=='approve'&&<p className="sd-qreason">{p.moderation.reasons.join(' ')}</p>}
     {p.review_note&&<p className="sd-qreason">Curator note: {p.review_note}</p>}
     {p.review&&<p className="sd-qmeta">Last decision by {p.review.reviewerName}, {new Date(p.review.reviewedAt).toLocaleString()}{p.review.note?` · “${p.review.note}”`:''}</p>}
     <p className="sd-qmeta"><span className="mono">{p.id}</span> · {p.source_name}{p.image&&<> · <a href={p.image} target="_blank" rel="noreferrer">image</a></>}</p>
    </div>
    <div className="sd-wait sd-scn-actions">
     <input aria-label={`Note for ${p.id}`} placeholder="Note (optional)" maxLength={1000} value={note[p.id]||''} onChange={e=>setNote({...note,[p.id]:e.target.value})} disabled={!canReview}/>
     {p.status!=='approved'&&<button className="sd-btn small primary" disabled={!canReview||busy===p.id||p.moderation.decision==='reject'} title={canReview?undefined:'Viewers cannot review'} onClick={()=>void decide(p,'approved')}>Approve</button>}
     {p.status!=='rejected'&&<button className="sd-btn small" disabled={!canReview||busy===p.id} onClick={()=>void decide(p,'rejected')}>Reject</button>}
     {p.status!=='pending'&&<button className="sd-btn small" disabled={!canReview||busy===p.id} onClick={()=>void decide(p,'pending')}>Back to pending</button>}
    </div>
   </li>)}</ol>
 </section>;
}
