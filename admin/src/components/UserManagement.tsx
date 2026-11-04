import {useMemo,useState} from 'react';
import {Plus,Download,Pencil,FilterX} from 'lucide-react';
import {formatCount,type AdminData,type ManagedUser} from '../api';
import {useLang,useT,ago,fullDate} from '../i18n';
import {UserEditor} from './UserEditor';
import {Select,SearchField,FilterTabs,Pager,downloadCSV} from './ui';

const ROLES=['member','viewer','reviewer','admin'] as const;
const isoDate=(value:number|null)=>value?new Date(value).toISOString().slice(0,10):'';

export function UserManagement({data,onUpdated}:{data:AdminData;onUpdated:()=>Promise<void>}){
 const t=useT(),lang=useLang();
 const [search,setSearch]=useState(''),[role,setRole]=useState<'all'|typeof ROLES[number]>('all'),[status,setStatus]=useState('all'),[sort,setSort]=useState('name');
 const [page,setPage]=useState(0),[size,setSize]=useState(25),[editing,setEditing]=useState<ManagedUser|null|undefined>(undefined);
 const query=search.trim().toLowerCase();
 const base=useMemo(()=>data.users.filter(u=>(!query||(u.name+' '+u.email+' '+u.id).toLowerCase().includes(query))&&(status==='all'||u.status===status)),[data.users,query,status]);
 const users=useMemo(()=>base.filter(u=>role==='all'||u.role===role).sort(sort==='name'?(a,b)=>a.name.localeCompare(b.name):sort==='login'?(a,b)=>(b.lastLogin||0)-(a.lastLogin||0):(a,b)=>(b.createdAt||0)-(a.createdAt||0)),[base,role,sort]);
 const visible=users.slice(page*size,(page+1)*size);
 const total=data.users.length,active=data.users.filter(u=>u.status==='active').length,staff=data.users.filter(u=>u.role!=='member').length,inactive=total-active;
 const pct=(n:number)=>total?Math.round(n/total*100):0;
 const filtered=!!query||role!=='all'||status!=='all';
 const clear=()=>{setSearch('');setRole('all');setStatus('all');setPage(0);};
 const exportCSV=()=>downloadCSV('sati-users.csv',[['Name','Email','User ID','Role','Status','Last sign-in','Created'],...users.map(u=>[u.name,u.email,u.id,u.role,u.status,isoDate(u.lastLogin),isoDate(u.createdAt)])]);
 const tabs=[{key:'all' as const,label:t.states.all,count:base.length},...ROLES.map(r=>({key:r,label:t.roles[r],count:base.filter(u=>u.role===r).length}))];

 return <>
  <div className="sd-page-head"><p>{t.usersSub}</p><div className="sd-actions">
   <button className="sd-btn" onClick={exportCSV} disabled={!users.length}><Download size={16}/>{t.exportCsv}</button>
   <button className="sd-btn primary" onClick={()=>setEditing(null)}><Plus size={16}/>{t.newUser}</button>
  </div></div>
  <section className="sd-kpis" aria-label={t.kpis}>
   <div><span>{t.totalUsers}</span><strong>{formatCount(total)}</strong><small>{t.roles.member}: {formatCount(total-staff)}</small></div>
   <div><span>{t.activeAccounts}</span><strong>{formatCount(active)}</strong><small>{t.ofTotal(pct(active))}</small></div>
   <div><span>{t.staff}</span><strong>{formatCount(staff)}</strong><small>{t.staffSub}</small></div>
   <div><span>{t.inactive}</span><strong className={inactive?'danger':''}>{formatCount(inactive)}</strong><small>{t.blocked}</small></div>
  </section>
  <section className="sd-card sd-table-card">
   <div className="sd-card-head"><div><h2>{t.accounts} <span className="sd-count-badge mono">{formatCount(total)}</span></h2></div></div>
   <FilterTabs label={t.colRole} value={role} onChange={r=>{setRole(r);setPage(0);}} items={tabs}/>
   <div className="sd-toolbar">
    <SearchField value={search} onChange={v=>{setSearch(v);setPage(0);}} placeholder={t.searchUsers}/>
    <Select label={t.colStatus} value={status} onChange={v=>{setStatus(v);setPage(0);}} options={[{value:'all',label:t.allStatuses},{value:'active',label:t.statuses.active},{value:'inactive',label:t.statuses.inactive}]}/>
    <Select label={t.sortBy} value={sort} onChange={v=>{setSort(v);setPage(0);}} options={[{value:'name',label:'A–Z'},{value:'login',label:t.colLastLogin},{value:'created',label:t.newest}]}/>
    {filtered&&<button className="sd-btn ghost" onClick={clear}><FilterX size={16}/>{t.clearFilters}</button>}
   </div>
   <div className="sd-table-wrap"><table className="sd-table">
    <thead><tr><th>{t.colUser}</th><th>{t.colRole}</th><th>{t.colStatus}</th><th>{t.colLastLogin}</th><th>{t.colCreated}</th><th className="right"><span className="sd-visually-hidden">{t.colAction}</span></th></tr></thead>
    <tbody>{visible.map(u=><tr key={u.id}>
     <td><div className="sd-user-cell"><span className={`sd-avatar r-${u.role}`}>{u.name[0]?.toUpperCase()}</span><div><strong>{u.name}</strong><small>{u.email}</small><code className="mono" title={u.id}>{u.id.slice(0,8)}</code></div></div></td>
     <td><span className={`sd-role r-${u.role}`}>{t.roles[u.role]||u.role}</span></td>
     <td><span className={`sd-state ${u.status}`}><i aria-hidden="true"/>{t.statuses[u.status]||u.status}</span></td>
     <td className="c-time">{u.lastLogin?<><time title={fullDate(u.lastLogin,lang)}>{ago(u.lastLogin,lang)}</time><small>{fullDate(u.lastLogin,lang)}</small></>:<span className="sd-dash">{t.never}</span>}</td>
     <td className="c-time">{u.createdAt?<time title={fullDate(u.createdAt,lang)}>{fullDate(u.createdAt,lang).split(' · ')[0]}</time>:'—'}</td>
     <td className="right"><button className="sd-icon-btn small" aria-label={t.editUser(u.name)} title={t.editUser(u.name)} onClick={()=>setEditing(u)}><Pencil size={16}/></button></td>
    </tr>)}</tbody>
   </table>{!users.length&&<div className="sd-empty-state"><p>{t.noMatch}</p>{filtered&&<button className="sd-btn" onClick={clear}>{t.clearFilters}</button>}</div>}</div>
   <Pager page={page} size={size} total={users.length} onChange={setPage} onSize={s=>{setSize(s);setPage(0);}}/>
  </section>
  {editing!==undefined&&<UserEditor user={editing} onClose={()=>setEditing(undefined)} onSaved={onUpdated}/>}
 </>;
}
