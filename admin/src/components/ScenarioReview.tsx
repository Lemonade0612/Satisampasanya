import {useEffect,useMemo,useState} from 'react';
import {CircleCheck,Eye,EyeOff} from 'lucide-react';
import {adminApi,type AdminScenario,type L10n,type ScenarioStatus} from '../api';
import {BUNDLED} from '../bundledScenarios';
import {useLang,useT,ago,fullDate} from '../i18n';
import {FilterTabs,SearchField,Pager} from './ui';

// Staff review of daily game scenarios. The server enforces the role and the draft → approved → live order;
// this screen only offers the moves the server will accept, and every decision needs a note.
type Filter='all'|ScenarioStatus|'builtin';
const MOVES:Record<ScenarioStatus,{to:ScenarioStatus;key:string;primary?:boolean}[]>={
 draft:[{to:'approved',key:'approved',primary:true},{to:'rejected',key:'rejected'}],
 approved:[{to:'live',key:'live',primary:true},{to:'draft',key:'draft'},{to:'rejected',key:'rejected'}],
 live:[{to:'approved',key:'unpublish'},{to:'rejected',key:'rejected'}],
 rejected:[{to:'draft',key:'draft'}],
};

export function useAdminList<T>(load:()=>Promise<T[]>,refreshKey:unknown){
 const [items,setItems]=useState<T[]|null>(null),[error,setError]=useState('');
 const reload=async()=>{try{setItems(await load());setError('');}catch(e){setError((e as Error).message);}};
 useEffect(()=>{void reload();},[refreshKey]); // eslint-disable-line react-hooks/exhaustive-deps
 return {items,error,reload};
}

export function ScenarioReview({refreshKey,canReview}:{refreshKey:unknown;canReview:boolean}){
 const t=useT(),lang=useLang();
 const {items,error,reload}=useAdminList(adminApi.scenarios,refreshKey);
 const retiredList=useAdminList(adminApi.retired,refreshKey);
 const retired=useMemo(()=>new Map((retiredList.items||[]).map(r=>[r.id,r])),[retiredList.items]);
 const [filter,setFilter]=useState<Filter>('draft'),[search,setSearch]=useState(''),[page,setPage]=useState(0),[size,setSize]=useState(25);
 const [open,setOpen]=useState<string|null>(null),[deciding,setDeciding]=useState<{title:L10n;label:string;submit:(note:string)=>Promise<unknown>;done:()=>Promise<void>}|null>(null);
 const query=search.trim().toLowerCase();
 const all=useMemo(()=>(items||[]).filter(s=>!query||[s.id,s.topic,s.title.en,s.title.lo].join(' ').toLowerCase().includes(query)),[items,query]);
 const shown=all.filter(s=>filter==='all'||s.status===filter);
 const builtin=BUNDLED.filter(s=>!query||[s.id,s.title.en,s.title.lo].join(' ').toLowerCase().includes(query));
 const tabs=[...(['draft','approved','live','rejected','all'] as const).map(key=>({key:key as Filter,label:t.scnStatus[key],count:key==='all'?all.length:all.filter(s=>s.status===key).length,tone:key==='draft'?'watch' as const:undefined})),{key:'builtin' as Filter,label:t.builtIn,count:builtin.length}];
 const pageCount=filter==='builtin'?builtin.length:shown.length;
 return <section className="sd-card sd-table-card">
  <div className="sd-card-head"><div><h2>{t.scnHead}</h2><p>{t.scnSub}</p></div></div>
  <FilterTabs label={t.scenarios} value={filter} onChange={f=>{setFilter(f);setPage(0);}} items={tabs}/>
  <div className="sd-toolbar"><SearchField value={search} onChange={v=>{setSearch(v);setPage(0);}} placeholder={t.searchScenarios}/></div>
  {(error||retiredList.error)&&<div className="admin-error" role="alert">{t.loadFailed} ({error||retiredList.error})</div>}
  {filter==='builtin'&&<p className="sd-qreason">{t.builtInNote}</p>}
  {filter==='builtin'&&<ol className="sd-queue">{builtin.slice(page*size,(page+1)*size).map(s=>{const r=retired.get(s.id);
   return <li key={s.id} className="sd-qrow sd-scn">
    <div className="sd-qmain">
     <p className="sd-tags"><span className={`sd-status ${r?'s-rejected':'s-live'}`}>{r?t.retired:t.builtInActive}</span>{s.bands.map(b=><span key={b} className="sd-pill">{t.bandNames[b]||b}</span>)}</p>
     <p className="sd-qtext"><strong>{s.title.en}</strong> · <span lang="lo">{s.title.lo}</span></p>
     <p className="sd-qmeta"><span className="mono">{s.id}</span></p>
     {r&&<p className="sd-qreason">{t.lastDecision(r.retiredBy.name,ago(r.retiredAt,lang))} · “{r.note}”</p>}
     <button className="sd-btn small" aria-expanded={open===s.id} onClick={()=>setOpen(open===s.id?null:s.id)}>{open===s.id?<EyeOff size={16}/>:<Eye size={16}/>}{open===s.id?t.hidePreview:t.preview}</button>
     {open===s.id&&<ScenarioPreview sc={s.scenario}/>}
    </div>
    <div className="sd-wait sd-scn-actions"><button className={`sd-btn small ${r?'primary':''}`} disabled={!canReview} title={canReview?undefined:t.viewerCannot}
     onClick={()=>setDeciding({title:s.title,label:r?t.restore:t.retire,submit:note=>adminApi.setRetired(s.id,!r,note),done:retiredList.reload})}>{r?t.restore:t.retire}</button></div>
   </li>;})}</ol>}
  {filter!=='builtin'&&items&&!shown.length&&<div className="sd-empty-state"><CircleCheck size={22}/><p>{query?t.noMatch:t.noScenarios}</p></div>}
  {filter!=='builtin'&&<ol className="sd-queue">{shown.slice(page*size,(page+1)*size).map(s=>
   <li key={s.id} className={`sd-qrow sd-scn ${s.status==='draft'?'draft':''}`}>
    <div className="sd-qmain">
     <p className="sd-tags"><span className={`sd-status s-${s.status}`}>{t.scnStatus[s.status]}</span>{s.bands.map(b=><span key={b} className="sd-pill">{t.bandNames[b]||b}</span>)}<span className="sd-pill">{t.intensity(s.intensity)}</span><span className="sd-pill">{s.source==='ai_draft'?t.aiDraft:t.expert}</span></p>
     <p className="sd-qtext"><strong>{s.title.en}</strong> · <span lang="lo">{s.title.lo}</span></p>
     <p className="sd-qmeta"><span className="mono">{s.id}</span><span>#{s.topic}</span><time title={fullDate(s.updatedAt,lang)}>{ago(s.updatedAt,lang)}</time></p>
     {s.reviewedBy&&s.reviewedAt&&<p className="sd-qreason">{t.lastDecision(s.reviewedBy.name,ago(s.reviewedAt,lang))}{s.reviewNote&&<> · “{s.reviewNote}”</>}</p>}
     <button className="sd-btn small" aria-expanded={open===s.id} onClick={()=>setOpen(open===s.id?null:s.id)}>{open===s.id?<EyeOff size={16}/>:<Eye size={16}/>}{open===s.id?t.hidePreview:t.preview}</button>
     {open===s.id&&<ScenarioPreview sc={s.scenario}/>}
    </div>
    <div className="sd-wait sd-scn-actions">{MOVES[s.status].map(m=>
     <button key={m.key} className={`sd-btn small ${m.primary?'primary':''}`} disabled={!canReview} title={canReview?undefined:t.viewerCannot} onClick={()=>setDeciding({title:s.title,label:t.scnActions[m.key],submit:note=>adminApi.reviewScenario(s.id,m.to,note),done:reload})}>{t.scnActions[m.key]}</button>)}
    </div>
   </li>)}</ol>}
  <Pager page={page} size={size} total={pageCount} onChange={setPage} onSize={n=>{setSize(n);setPage(0);}}/>
  {deciding&&<DecisionDialog {...deciding} onClose={()=>setDeciding(null)}/>}
 </section>;
}

// Both languages side by side: a reviewer approves the Lao and the English together.
function ScenarioPreview({sc}:{sc:AdminScenario['scenario']}){
 const t=useT();
 const col=(k:keyof L10n)=><div lang={k} className="sd-scn-col">
  <h3>{k==='en'?'English':'ລາວ'}</h3>
  {sc.warning&&<p><b>{t.scnWarning}:</b> {sc.warning[k]}</p>}
  <p><b>{t.scnIntro}:</b> {sc.intro[k]}</p>
  {sc.steps.map(step=><div key={step.id} className="sd-scn-step">
   {step.kind==='chat'?<>{step.messages.map((m,i)=><p key={i} className={`sd-scn-msg ${m.from}`}>{m.text[k]}</p>)}
    <p><b>{step.prompt[k]}</b></p><ul>{step.choices.map(c=><li key={c.id}>{c.correct?'✓':'✕'} {c.text[k]} <small>→ {c.consequence[k]}</small></li>)}</ul></>
   :<><p><b>{step.prompt[k]}</b></p><p>{step.segments.map((g,i)=>g.flag?<mark key={i} title={g.flag}>{g.text[k]}</mark>:<span key={i}>{g.text[k]}</span>)}</p></>}
  </div>)}
  <p><b>{t.scnExplain}:</b> {sc.explanation[k]}</p>
 </div>;
 return <div className="sd-scn-preview">{col('en')}{col('lo')}</div>;
}

// Every decision, including retiring a built-in scenario, needs a note: it is saved in the moderation log.
function DecisionDialog({title,label,submit:save,done,onClose}:{title:L10n;label:string;submit:(note:string)=>Promise<unknown>;done:()=>Promise<void>;onClose:()=>void}){
 const t=useT();
 const [note,setNote]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const submit=async()=>{setBusy(true);setError('');try{await save(note);await done();onClose();}catch(e){setError((e as Error).message);}finally{setBusy(false);}};
 return <div className="admin-modal-backdrop"><form className="admin-card admin-review-modal" role="dialog" aria-modal="true" aria-label={t.decisionFor(label)} onSubmit={e=>{e.preventDefault();void submit();}}>
  <h2>{t.decisionFor(label)}</h2>
  <p><strong>{title.en}</strong> · <span lang="lo">{title.lo}</span></p>
  <label>{t.noteLabel}<textarea required maxLength={1000} value={note} onChange={e=>setNote(e.target.value)} placeholder={t.notePlaceholder}/></label>
  {error&&<p role="alert">{error}</p>}
  <div className="admin-actions"><button type="button" disabled={busy} onClick={onClose}>{t.cancel}</button><button disabled={busy||!note.trim()}>{busy?t.saving:t.saveDecision}</button></div>
 </form></div>;
}
