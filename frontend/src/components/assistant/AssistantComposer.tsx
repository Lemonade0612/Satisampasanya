import {useEffect,useRef} from 'react';
import {SendHorizontal,Loader2} from 'lucide-react';
import type {Lang} from '../../types';
export type CheckKind='text'|'post';
export type AssistantMode='auto'|'ask'|'check';

const CHIPS:{id:AssistantMode;en:string;lo:string}[]=[{id:'auto',en:'Auto',lo:'ອັດຕະໂນມັດ'},{id:'ask',en:'Ask',lo:'ຖາມ'},{id:'check',en:'Check',lo:'ກວດ'}];

// Compact composer: one row of chips (mode + draft toggle), then the input and a round send button, then the disclaimer.
export function AssistantComposer({lang,text,onText,kind,onKind,busy,error,remaining,onSend,mode,onMode,innerRef}:{
 lang:Lang;text:string;onText:(text:string)=>void;kind:CheckKind;onKind:(kind:CheckKind)=>void;
 mode:AssistantMode;onMode:(mode:AssistantMode)=>void;busy:boolean;error:string;remaining:number;onSend:()=>void;innerRef?:React.Ref<HTMLDivElement>;
}){
 const lo=lang==='lo',area=useRef<HTMLTextAreaElement>(null);
 // Grows with the text, up to about four lines.
 useEffect(()=>{const el=area.current;if(!el)return;el.style.height='auto';el.style.height=Math.min(el.scrollHeight,132)+'px';},[text]);
 const chip=(on:boolean)=>`shrink-0 min-h-10 px-4 rounded-full border text-[15px] font-bold font-lao ${on?'bg-primary text-primary-foreground border-primary':'bg-background text-foreground border-border'}`;
 const canSend=!!text.trim()&&!busy&&remaining!==0;
 return <div ref={innerRef} className="sticky bottom-0 z-10 shrink-0 border-t border-border bg-background px-3 pt-2 pb-[max(8px,env(safe-area-inset-bottom))]">
  <div role="radiogroup" aria-label={lo?'ຮູບແບບຜູ້ຊ່ວຍ':'Assistant mode'} className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
   {CHIPS.map(c=><button key={c.id} type="button" role="radio" aria-checked={mode===c.id} onClick={()=>onMode(c.id)} className={chip(mode===c.id)}>{lo?c.lo:c.en}</button>)}
   <span aria-hidden className="shrink-0 w-px bg-border my-1"/>
   <button type="button" aria-pressed={kind==='post'} onClick={()=>onKind(kind==='post'?'text':'post')} className={chip(kind==='post')}>{lo?'ກວດໂພສກ່ອນແບ່ງປັນ':'Post draft'}</button>
  </div>
  {error&&<p role="alert" className="text-[15px] text-red-600 pb-1">{error}</p>}
  <form className="flex items-end gap-2" onSubmit={event=>{event.preventDefault();if(canSend)onSend();}}>
   <textarea ref={area} aria-label={lo?'ຂໍ້ຄວາມ':'Your message'} value={text} onChange={event=>onText(event.target.value)} maxLength={2000} rows={1}
    onKeyDown={event=>{if(event.key==='Enter'&&!event.shiftKey&&window.matchMedia?.('(pointer: fine)').matches){event.preventDefault();if(canSend)onSend();}}}
    className="flex-1 min-w-0 rounded-3xl border border-border bg-background px-4 py-3 text-[18px] leading-[1.5] font-lao resize-none focus:outline-none focus:border-primary" style={{maxHeight:132,fontSize:18}}
    placeholder={lo?'ຖາມ ຫຼື ວາງລິ້ງ / ຂໍ້ຄວາມທີ່ຕ້ອງການກວດ…':'Ask, or paste a link or message to check…'}/>
   <button type="submit" disabled={!canSend} aria-label={busy?(lo?'ກຳລັງກວດ…':'Checking…'):(lo?'ສົ່ງ':'Send')} className="shrink-0 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-40">
    {busy?<Loader2 size={22} className="animate-spin" aria-hidden/>:<SendHorizontal size={22} aria-hidden/>}
   </button>
  </form>
  <p className="mt-2 text-[12px] leading-snug text-muted-foreground font-lao">
   {lo?'Sati AI ອາດຜິດພາດໄດ້. ກະລຸນາກວດສອບຂໍ້ມູນສຳຄັນອີກຄັ້ງ.':'Sati AI can make mistakes. Please double-check important info.'}{' '}
   <a href="/about-ai" target="_blank" rel="noopener" className="underline">{lo?'ເບິ່ງວິທີທີ່ Sati ກວດ':'How Sati checks'}</a>
  </p>
 </div>;
}
