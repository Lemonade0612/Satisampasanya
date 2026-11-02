import {ChevronLeft,ChevronRight} from 'lucide-react';
import {formatCount} from '../api';
export function Pager({page,size,total,onChange}:{page:number;size:number;total:number;onChange:(page:number)=>void}){
 const pages=Math.max(1,Math.ceil(total/size));if(total<=size)return null;
 return <div className="pager"><span>Showing {formatCount(page*size+1)}–{formatCount(Math.min(total,(page+1)*size))} of {formatCount(total)}</span><div className="calendar-controls"><button aria-label="Previous page" disabled={page===0} onClick={()=>onChange(page-1)}><ChevronLeft size={16}/></button><span>Page {page+1} of {formatCount(pages)}</span><button aria-label="Next page" disabled={page>=pages-1} onClick={()=>onChange(page+1)}><ChevronRight size={16}/></button></div></div>;
}
