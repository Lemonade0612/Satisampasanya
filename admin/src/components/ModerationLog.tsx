import {useMemo,useState} from 'react';
import {Bot,CircleCheck} from 'lucide-react';
import {adminApi} from '../api';
import {useLang,useT,ago,fullDate} from '../i18n';
import {FilterTabs,Pager} from './ui';
import {useAdminList} from './ScenarioReview';
import {bundledTitle} from '../bundledScenarios';

// Read-only, newest first: who decided what and when, and what the AI flagged and why. Entries are never edited.
type Filter='all'|'ai'|'staff';
export function ModerationLog({refreshKey,posts}:{refreshKey:unknown;posts:{id:string;content:string}[]}){
 const t=useT(),lang=useLang();
 const {items,error}=useAdminList(adminApi.moderation,refreshKey);
 const [filter,setFilter]=useState<Filter>('all'),[page,setPage]=useState(0),[size,setSize]=useState(25);
 const isAi=(e:{action:string})=>e.action.startsWith('ai_');
 const list=items||[];
 const shown=useMemo(()=>list.filter(e=>filter==='all'||(filter==='ai')===isAi(e)),[list,filter]);
 const postText=useMemo(()=>new Map(posts.map(p=>[p.id,p.content])),[posts]);
 const tabs=([['all',t.modAll],['ai',t.modAi],['staff',t.modStaff]] as const).map(([key,label])=>({key:key as Filter,label,count:key==='all'?list.length:list.filter(e=>(key==='ai')===isAi(e)).length}));
 return <section className="sd-card sd-table-card">
  <div className="sd-card-head"><div><h2>{t.moderation}</h2><p>{t.modSub}</p></div></div>
  <FilterTabs label={t.moderation} value={filter} onChange={f=>{setFilter(f);setPage(0);}} items={tabs}/>
  {error&&<div className="admin-error" role="alert">{t.loadFailed} ({error})</div>}
  {items&&!shown.length&&<div className="sd-empty-state"><CircleCheck size={22}/><p>{t.noEntries}</p></div>}
  {shown.length>0&&<div className="sd-table-wrap"><table className="sd-table sd-log">
   <thead><tr><th>{t.colWhen}</th><th>{t.colWho}</th><th>{t.colItem}</th><th>{t.colDecision}</th><th>{t.colNote}</th></tr></thead>
   <tbody>{shown.slice(page*size,(page+1)*size).map(e=>{
    const title=e.title||(e.kind==='scenario'?bundledTitle(e.targetId):null);
    const item=title?(lang==='lo'?title.lo:title.en):postText.get(e.targetId)||e.targetId;
    const who=e.actor?e.actor.name:e.action==='submitted'?t.aiDrafter:t.aiActor;
    const risk=typeof e.detail.risk==='string'?e.detail.risk:'';
    return <tr key={e.id}>
     <td><time title={fullDate(e.createdAt,lang)}>{ago(e.createdAt,lang)}</time></td>
     <td>{e.actor?who:<span className="sd-pill"><Bot size={14}/> {who}</span>}</td>
     <td><small>{t.kinds[e.kind]}</small><br/><span className="sd-log-item">{item.length>90?item.slice(0,90)+'…':item}</span></td>
     <td><span className={`sd-status ${isAi(e)?'s-flagged':`s-${e.action}`}`}>{t.modActions[e.action]||e.action}</span>{risk&&<><br/><small>{t.risk}: {risk}</small></>}</td>
     <td>{e.note||'—'}</td>
    </tr>;})}</tbody>
  </table></div>}
  <Pager page={page} size={size} total={shown.length} onChange={setPage} onSize={n=>{setSize(n);setPage(0);}}/>
 </section>;
}
