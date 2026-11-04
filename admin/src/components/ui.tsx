import {ChevronDown,ChevronLeft,ChevronRight,ChevronsLeft,ChevronsRight,Search,X} from 'lucide-react';
import {formatCount} from '../api';
import {useT} from '../i18n';

type Option={value:string;label:string};

// Native <select> for accessibility and keyboard support, with a drawn chevron instead of the browser arrow.
export function Select({label,value,onChange,options}:{label:string;value:string;onChange:(value:string)=>void;options:Option[]}){
 return <div className={`sd-select ${value!==options[0]?.value?'is-set':''}`}>
  <select aria-label={label} value={value} onChange={e=>onChange(e.target.value)}>{options.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}</select>
  <ChevronDown size={16} aria-hidden="true"/>
 </div>;
}

export function SearchField({value,onChange,placeholder}:{value:string;onChange:(value:string)=>void;placeholder:string}){
 const t=useT();
 return <div className="sd-search">
  <Search size={18} aria-hidden="true"/>
  <input type="search" aria-label={placeholder} placeholder={placeholder} value={value} onChange={e=>onChange(e.target.value)}/>
  {value&&<button type="button" aria-label={t.clearSearch} onClick={()=>onChange('')}><X size={16}/></button>}
 </div>;
}

export function FilterTabs<K extends string>({value,onChange,items,label}:{value:K;onChange:(key:K)=>void;items:{key:K;label:string;count:number;tone?:'red'|'watch'}[];label:string}){
 return <div className="sd-tabs" role="tablist" aria-label={label}>
  {items.map(item=><button key={item.key} type="button" role="tab" aria-selected={value===item.key} className={`${value===item.key?'active':''} ${item.tone||''}`} onClick={()=>onChange(item.key)}>
   {item.tone&&<i aria-hidden="true"/>}{item.label}<span className="mono">{formatCount(item.count)}</span>
  </button>)}
 </div>;
}

// Page list with ellipses: 1 … 4 5 6 … 20, so thousands of rows stay navigable.
const pageList=(page:number,pages:number)=>{
 const wanted=new Set([0,pages-1,page-1,page,page+1].filter(p=>p>=0&&p<pages));
 const sorted=[...wanted].sort((a,b)=>a-b);const out:(number|'gap')[]=[];
 sorted.forEach((p,i)=>{if(i&&p-sorted[i-1]>1)out.push('gap');out.push(p);});return out;
};
export function Pager({page,size,total,onChange,onSize,sizes=[25,50,100]}:{page:number;size:number;total:number;onChange:(page:number)=>void;onSize?:(size:number)=>void;sizes?:number[]}){
 const t=useT();
 if(!total)return null;
 const pages=Math.max(1,Math.ceil(total/size));
 return <nav className="sd-pager" aria-label="Pagination">
  <span className="sd-pager-count">{t.showing(formatCount(page*size+1),formatCount(Math.min(total,(page+1)*size)),formatCount(total))}</span>
  <div className="sd-pager-controls">
   {onSize&&<Select label={t.perPage} value={String(size)} onChange={v=>onSize(Number(v))} options={sizes.map(s=>({value:String(s),label:`${s} ${t.perPage}`}))}/>}
   {pages>1&&<div className="sd-pages">
    <button type="button" aria-label={t.firstPage} disabled={page===0} onClick={()=>onChange(0)}><ChevronsLeft size={16}/></button>
    <button type="button" aria-label={t.prevPage} disabled={page===0} onClick={()=>onChange(page-1)}><ChevronLeft size={16}/></button>
    {pageList(page,pages).map((p,i)=>p==='gap'?<span key={'g'+i} className="sd-gap">…</span>:<button type="button" key={p} aria-label={t.goPage(p+1)} aria-current={p===page?'page':undefined} className={p===page?'active mono':'mono'} onClick={()=>onChange(p)}>{p+1}</button>)}
    <button type="button" aria-label={t.nextPage} disabled={page>=pages-1} onClick={()=>onChange(page+1)}><ChevronRight size={16}/></button>
    <button type="button" aria-label={t.lastPage} disabled={page>=pages-1} onClick={()=>onChange(pages-1)}><ChevronsRight size={16}/></button>
   </div>}
  </div>
 </nav>;
}

// CSV with a BOM so Excel opens Lao text correctly; leading =+@- are escaped against formula injection.
export function downloadCSV(filename:string,rows:unknown[][]){
 const escape=(v:unknown)=>'"'+String(v??'').replace(/^[=+@\-\t\r]/,"'$&").replace(/"/g,'""')+'"';
 const url=URL.createObjectURL(new Blob(['﻿'+rows.map(row=>row.map(escape).join(',')).join('\r\n')],{type:'text/csv;charset=utf-8'}));
 const link=document.createElement('a');link.href=url;link.download=filename;link.click();URL.revokeObjectURL(url);
}
