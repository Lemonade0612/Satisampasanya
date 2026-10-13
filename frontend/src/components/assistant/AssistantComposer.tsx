import type {Lang} from '../../types';
export type CheckKind='text'|'post';
export type AssistantMode='auto'|'ask'|'check';
export function AssistantComposer({lang,text,onText,kind,onKind,busy,error,remaining,onSend,mode,onMode}:{
 lang:Lang;text:string;onText:(text:string)=>void;kind:CheckKind;onKind:(kind:CheckKind)=>void;
 mode:AssistantMode;onMode:(mode:AssistantMode)=>void;busy:boolean;error:string;remaining:number;onSend:()=>void;
}){
 return <form className="p-3 border-t border-border" onSubmit={event=>{event.preventDefault();onSend();}}>
  <select aria-label={lang==='lo'?'ຮູບແບບຜູ້ຊ່ວຍ':'Assistant mode'} value={mode} onChange={event=>onMode(event.target.value as AssistantMode)} className="rounded-lg border border-border p-2 mb-2 mr-2 bg-background">
   <option value="auto">{lang==='lo'?'ອັດຕະໂນມັດ':'Auto'}</option><option value="ask">{lang==='lo'?'ຖາມຄຳແນະນຳ':'Ask'}</option><option value="check">{lang==='lo'?'ກວດຂໍ້ຄວາມ':'Check'}</option>
  </select>
  <select aria-label={lang==='lo'?'ປະເພດການກວດ':'Check type'} value={kind} onChange={event=>onKind(event.target.value as CheckKind)} className="rounded-lg border border-border p-2 mb-2 bg-background">
   <option value="text">{lang==='lo'?'ຖາມ / ກວດຂໍ້ຄວາມ':'Ask / check text'}</option>
   <option value="post">{lang==='lo'?'ກວດໂພສກ່ອນແຊຣ໌':'Check a post draft'}</option>
  </select>
  <textarea aria-label={lang==='lo'?'ຂໍ້ຄວາມ':'Your message'} value={text} onChange={event=>onText(event.target.value)} maxLength={2000} rows={3} className="w-full rounded-xl border border-border p-3 bg-background text-sm font-lao" placeholder={lang==='lo'?'ຖາມວິທີປ້ອງກັນ ຫຼື ວາງຂໍ້ຄວາມ…':'Ask for a safety tip, or paste a message to check…'}/>
  {error&&<p role="alert" className="text-sm text-red-600">{error}</p>}
  <button disabled={!text.trim()||busy||remaining===0} className="mt-2 w-full rounded-xl bg-primary text-white p-3 disabled:opacity-50">
   {busy?(lang==='lo'?'ກຳລັງກວດ…':'Checking…'):(lang==='lo'?'ສົ່ງ':'Send')}
  </button>
 </form>;
}
