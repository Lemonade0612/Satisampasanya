import {useEffect,useRef,useState} from 'react';
import {Plus,ArrowUp,Loader2,X,Check,Camera,ImagePlus} from 'lucide-react';
import {readPhoto} from '../../lib/images';
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
export function AssistantComposer({lang,text,onText,kind,onKind,busy,error,remaining,onSend,mode,onMode,innerRef,inputRef,image,onImage,openRef}:{
 lang:Lang;text:string;onText:(text:string)=>void;kind:CheckKind;onKind:(kind:CheckKind)=>void;
 mode:AssistantMode;onMode:(mode:AssistantMode)=>void;busy:boolean;error:string;remaining:number;onSend:()=>void;innerRef?:React.Ref<HTMLDivElement>;inputRef?:React.RefObject<HTMLTextAreaElement>;
 image?:string;onImage:(image:string|undefined)=>void;openRef?:React.MutableRefObject<(()=>void)|null>;
}){
 const lo=lang==='lo',own=useRef<HTMLTextAreaElement>(null),area=inputRef??own,[menu,setMenu]=useState(false);
 // Grows with the text: 40px minimum, 120px maximum.
 useEffect(()=>{const el=area.current;if(!el)return;el.style.height='auto';el.style.height=Math.max(40,Math.min(el.scrollHeight,120))+'px';},[text,area]);
 const camera=useRef<HTMLInputElement>(null),gallery=useRef<HTMLInputElement>(null),[photoError,setPhotoError]=useState('');
 useEffect(()=>{if(openRef)openRef.current=()=>setMenu(true);},[openRef]);
 const choose=async(file?:File)=>{if(!file)return;setPhotoError('');try{onImage(await readPhoto(file));if(kind==='post')onKind('text');area.current?.focus();}catch(e){setPhotoError(lo?'ໃຊ້ຮູບນີ້ບໍ່ໄດ້. ລອງຮູບອື່ນ.':(e as Error).message);}};
 const attach=(input:React.RefObject<HTMLInputElement>)=>{setMenu(false);input.current?.click();};
 const canSend=(!!text.trim()||!!image)&&!busy&&remaining!==0;
 const current=kind==='post'?'post':mode;
 const pick=(id:AssistantMode|'post')=>{if(id==='post'){onKind('post');}else{onKind('text');onMode(id);}setMenu(false);area.current?.focus();};
 const label=MODES.find(m=>m.id===current)!;
 return <div ref={innerRef} className="sticky bottom-0 z-10 shrink-0 border-t border-[#ECECF4] bg-white px-3 pt-2.5 pb-[max(14px,env(safe-area-inset-bottom))]">
  {current!=='auto'&&<p className="mb-1.5"><button type="button" onClick={()=>pick('auto')} aria-label={lo?'ປິດໂໝດ':'Clear mode'} className="inline-flex items-center gap-1.5 rounded-full bg-[#EDE9FE] px-3 min-h-8 text-[13px] font-bold text-[#3B0E91] font-lao">{lo?label.lo:label.en}<X size={14} aria-hidden/></button></p>}
  {(error||photoError)&&<p role="alert" className="text-[15px] text-danger pb-1">{error||photoError}</p>}
  {image&&<div className="relative mb-2 inline-block"><img src={image} alt={lo?'ຮູບທີ່ແນບ':'Attached photo'} className="h-20 w-20 rounded-xl object-cover border border-[#E6E6F0]"/>
   <button type="button" onClick={()=>onImage(undefined)} aria-label={lo?'ເອົາຮູບອອກ':'Remove photo'} className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-[#14112B] text-white flex items-center justify-center"><X size={14} aria-hidden/></button></div>}
  <input ref={camera} type="file" accept="image/*" capture="environment" hidden onChange={e=>{void choose(e.target.files?.[0]);e.target.value='';}}/>
  <input ref={gallery} type="file" accept="image/*" hidden onChange={e=>{void choose(e.target.files?.[0]);e.target.value='';}}/>
  <form className="flex items-center gap-2 min-h-[52px] rounded-[26px] border border-[#E6E6F0] bg-[#FAFAFD] px-1.5" onSubmit={event=>{event.preventDefault();if(canSend)onSend();}}>
   <button type="button" aria-haspopup="dialog" aria-expanded={menu} aria-label={lo?'ແນບຮູບ ແລະ ຕົວເລືອກ':'Attach photo and options'} onClick={()=>setMenu(true)} className="shrink-0 w-10 h-10 rounded-full bg-white text-[#5F6390] flex items-center justify-center shadow-[0_1px_2px_rgba(20,17,43,0.08)]"><Plus size={20} aria-hidden/></button>
   <textarea ref={area} aria-label={lo?'ຂໍ້ຄວາມ':'Your message'} value={text} onChange={event=>onText(event.target.value)} maxLength={2000} rows={1}
    onKeyDown={event=>{if(event.key==='Enter'&&!event.shiftKey&&window.matchMedia?.('(pointer: fine)').matches){event.preventDefault();if(canSend)onSend();}}}
    className="flex-1 min-w-0 min-h-10 max-h-[120px] bg-transparent px-0.5 py-2.5 text-[15px] leading-5 text-[#14112B] resize-none border-0 focus:outline-none" style={{fontSize:15}}
    onPaste={event=>{const file=[...event.clipboardData.files].find(f=>f.type.startsWith('image/'));if(file){event.preventDefault();void choose(file);}}}
    placeholder={image?(lo?'ເພີ່ມຄຳອະທິບາຍ (ບໍ່ບັງຄັບ)…':'Add a note (optional)…'):(lo?'ຖາມ ຫຼື ວາງລິ້ງ / ຂໍ້ຄວາມ…':'Ask or paste a link / message…')}/>
   <button type="submit" disabled={!canSend} style={{opacity:1}} aria-label={busy?(lo?'ກຳລັງກວດ…':'Checking…'):(lo?'ສົ່ງ':'Send')} className="shrink-0 w-10 h-10 rounded-full bg-[#5B21D1] text-white flex items-center justify-center disabled:opacity-40">
    {busy?<Loader2 size={20} className="animate-spin motion-reduce:animate-none" aria-hidden/>:<ArrowUp size={17} aria-hidden/>}
   </button>
  </form>
  <p className="mt-2 text-center text-[11px] leading-[1.5] text-[#8A8DB0]">
   {lo?'Sati AI ອາດຜິດພາດ · ຢ່າແບ່ງປັນລະຫັດຜ່ານ · ':'Sati AI can be wrong · never share passwords · '}<a href="#/how-sati" className="underline font-bold text-[#5B21D1]">{lo?'ວິທີ Sati ກວດ':'How Sati checks'}</a><br/>{lo?`ເຫຼືອ ${remaining} ຄຳຖາມມື້ນີ້`:`${remaining} questions left today`}
  </p>
  {menu&&<div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/45" onClick={()=>setMenu(false)}>
   <div role="dialog" aria-modal="true" aria-label={lo?'ແນບ ແລະ ຮູບແບບ':'Attach and mode'} onClick={e=>e.stopPropagation()} className="w-full max-w-[480px] rounded-t-3xl bg-background px-4 pt-3 pb-[calc(16px+env(safe-area-inset-bottom))]">
    <span aria-hidden className="mx-auto mb-2 block h-1 w-10 rounded-full bg-border"/>
    <div className="grid grid-cols-2 gap-2 mb-4">
     <button type="button" onClick={()=>attach(camera)} className="min-h-[72px] rounded-2xl bg-[#F6F7FC] flex flex-col items-center justify-center gap-1.5 font-lao font-bold text-[15px]"><Camera size={22} aria-hidden className="text-[#5B21D1]"/>{lo?'ຖ່າຍຮູບ':'Take photo'}</button>
     <button type="button" onClick={()=>attach(gallery)} className="min-h-[72px] rounded-2xl bg-[#F6F7FC] flex flex-col items-center justify-center gap-1.5 font-lao font-bold text-[15px]"><ImagePlus size={22} aria-hidden className="text-[#5B21D1]"/>{lo?'ອັບໂຫຼດຮູບ / ພາບໜ້າຈໍ':'Upload photo / screenshot'}</button>
    </div>
    <h2 className="text-[1.25rem] font-bold font-lao">{lo?'ຮູບແບບຜູ້ຊ່ວຍ':'Assistant mode'}</h2>
    <div role="radiogroup" className="mt-2 flex flex-col">{MODES.map(m=><button key={m.id} type="button" role="radio" aria-checked={current===m.id} onClick={()=>pick(m.id)} className="min-h-14 flex items-center gap-3 text-left font-lao">
     <span className="flex-1"><span className="block text-[17px] font-bold">{lo?m.lo:m.en}</span><span className="block text-[14px] text-muted-foreground">{lo?m.hint_lo:m.hint_en}</span></span>{current===m.id&&<Check size={20} aria-hidden className="text-primary"/>}</button>)}</div>
   </div></div>}
 </div>;
}
