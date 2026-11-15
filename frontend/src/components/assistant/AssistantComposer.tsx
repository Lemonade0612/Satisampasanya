import {useEffect,useRef,useState} from 'react';
import {Plus,SendHorizontal,Loader2,X,Check} from 'lucide-react';
import type {Lang} from '../../types';
export type CheckKind='text'|'post';
export type AssistantMode='auto'|'ask'|'check';

const MODES:{id:AssistantMode|'post';en:string;lo:string;hint_en:string;hint_lo:string}[]=[
 {id:'auto',en:'Auto',lo:'ອັດຕະໂນມັດ',hint_en:'Sati decides: answer or check',hint_lo:'Sati ເລືອກເອງ: ຕອບ ຫຼື ກວດ'},
 {id:'ask',en:'Ask',lo:'ຖາມ',hint_en:'Ask a safety question',hint_lo:'ຖາມຄຳຖາມຄວາມປອດໄພ'},
 {id:'check',en:'Check',lo:'ກວດ',hint_en:'Check a link, number or message',hint_lo:'ກວດລິ້ງ, ເບີ ຫຼື ຂໍ້ຄວາມ'},
 {id:'post',en:'Post draft',lo:'ກວດໂພສກ່ອນແບ່ງປັນ',hint_en:'Check a post before you share it',hint_lo:'ກວດໂພສກ່ອນແບ່ງປັນ'},
];

// One aligned row in a 52px bar: 40px options button, auto-growing input (40px to 120px), 40px send button, all vertically centred.
// The options button picks the mode (the earlier row of chips lives in its sheet), then the disclaimer and the How Sati link.
export function AssistantComposer({lang,text,onText,kind,onKind,busy,error,remaining,onSend,mode,onMode,innerRef,inputRef}:{
 lang:Lang;text:string;onText:(text:string)=>void;kind:CheckKind;onKind:(kind:CheckKind)=>void;
 mode:AssistantMode;onMode:(mode:AssistantMode)=>void;busy:boolean;error:string;remaining:number;onSend:()=>void;innerRef?:React.Ref<HTMLDivElement>;inputRef?:React.RefObject<HTMLTextAreaElement>;
}){
 const lo=lang==='lo',own=useRef<HTMLTextAreaElement>(null),area=inputRef??own,[menu,setMenu]=useState(false);
 // Grows with the text: 40px minimum, 120px maximum.
 useEffect(()=>{const el=area.current;if(!el)return;el.style.height='auto';el.style.height=Math.max(40,Math.min(el.scrollHeight,120))+'px';},[text,area]);
 const canSend=!!text.trim()&&!busy&&remaining!==0;
 const current=kind==='post'?'post':mode;
 const pick=(id:AssistantMode|'post')=>{if(id==='post'){onKind('post');}else{onKind('text');onMode(id);}setMenu(false);area.current?.focus();};
 const label=MODES.find(m=>m.id===current)!;
 return <div ref={innerRef} className="sticky bottom-0 z-10 shrink-0 border-t border-border bg-background px-3 pt-2 pb-[max(8px,env(safe-area-inset-bottom))]">
  {current!=='auto'&&<p className="mb-1.5"><button type="button" onClick={()=>pick('auto')} aria-label={lo?'ປິດໂໝດ':'Clear mode'} className="inline-flex items-center gap-1.5 rounded-full bg-[#EDE9FE] px-3 min-h-8 text-[13px] font-bold text-[#3B0E91] font-lao">{lo?label.lo:label.en}<X size={14} aria-hidden/></button></p>}
  {error&&<p role="alert" className="text-[15px] text-danger pb-1">{error}</p>}
  <form className="flex items-center gap-2 min-h-[52px]" onSubmit={event=>{event.preventDefault();if(canSend)onSend();}}>
   <button type="button" aria-haspopup="dialog" aria-expanded={menu} aria-label={lo?'ຕົວເລືອກ':'Options'} onClick={()=>setMenu(true)} className="shrink-0 w-10 h-10 rounded-full border border-border bg-background text-text-2 flex items-center justify-center"><Plus size={20} aria-hidden/></button>
   <textarea ref={area} aria-label={lo?'ຂໍ້ຄວາມ':'Your message'} value={text} onChange={event=>onText(event.target.value)} maxLength={2000} rows={1}
    onKeyDown={event=>{if(event.key==='Enter'&&!event.shiftKey&&window.matchMedia?.('(pointer: fine)').matches){event.preventDefault();if(canSend)onSend();}}}
    className="flex-1 min-w-0 min-h-10 max-h-[120px] rounded-[20px] border border-border bg-background px-4 py-[5px] text-[18px] leading-[1.5] font-lao resize-none focus:outline-none focus:border-primary" style={{fontSize:18}}
    placeholder={lo?'ຖາມ ຫຼື ວາງ…':'Ask or paste…'}/>
   <button type="submit" disabled={!canSend} aria-label={busy?(lo?'ກຳລັງກວດ…':'Checking…'):(lo?'ສົ່ງ':'Send')} className="shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-40">
    {busy?<Loader2 size={20} className="animate-spin motion-reduce:animate-none" aria-hidden/>:<SendHorizontal size={20} aria-hidden/>}
   </button>
  </form>
  <p className="mt-1.5 text-[12px] leading-snug text-muted-foreground font-lao">
   {lo?'Sati AI ອາດຜິດພາດໄດ້. ກະລຸນາກວດສອບຂໍ້ມູນສຳຄັນອີກຄັ້ງ.':'Sati AI can make mistakes. Please double-check important info.'}{' '}
   <a href="#/how-sati" className="underline font-bold">{lo?'ວິທີ Sati ກວດ':'How Sati checks'}</a>
  </p>
  {menu&&<div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/45" onClick={()=>setMenu(false)}>
   <div role="dialog" aria-modal="true" aria-label={lo?'ຮູບແບບຜູ້ຊ່ວຍ':'Assistant mode'} onClick={e=>e.stopPropagation()} className="w-full max-w-[480px] rounded-t-3xl bg-background px-4 pt-3 pb-[calc(16px+env(safe-area-inset-bottom))]">
    <span aria-hidden className="mx-auto mb-2 block h-1 w-10 rounded-full bg-border"/>
    <h2 className="text-[1.25rem] font-bold font-lao">{lo?'ຮູບແບບຜູ້ຊ່ວຍ':'Assistant mode'}</h2>
    <div role="radiogroup" className="mt-2 flex flex-col">{MODES.map(m=><button key={m.id} type="button" role="radio" aria-checked={current===m.id} onClick={()=>pick(m.id)} className="min-h-14 flex items-center gap-3 text-left font-lao">
     <span className="flex-1"><span className="block text-[17px] font-bold">{lo?m.lo:m.en}</span><span className="block text-[14px] text-muted-foreground">{lo?m.hint_lo:m.hint_en}</span></span>{current===m.id&&<Check size={20} aria-hidden className="text-primary"/>}</button>)}</div>
   </div></div>}
 </div>;
}
