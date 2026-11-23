import { ArrowLeft, ArrowDown, ArrowUpRight, Camera, ChevronRight, Link2, MessagesSquare, Phone, SquarePen } from "lucide-react";
const logoImage = "/brand-mark.svg";
import {useCallback,useEffect,useLayoutEffect,useRef,useState} from 'react';
import {request} from '../lib/api';
import {streamAssistant} from '../lib/assistantStream';
import {verifyLocal} from '../lib/verify';
import {AssistantMessage,type AssistantResult,type ChatMessage} from '../components/assistant/AssistantMessage';
import {AssistantComposer,type CheckKind,type AssistantMode} from '../components/assistant/AssistantComposer';
import {useBand} from '../lib/band';
import {TIERS} from '../features/daily/lib/age';
import type {Lang} from '../types';

const NEAR=120; // px from the bottom that still counts as "reading the latest message"

export function AssistantScreen({lang,onBack}:{lang:Lang;onBack?:()=>void}){
 const lo=lang==='lo';
 const [text,setText]=useState('');
 const [image,setImage]=useState<string>();
 const openAttach=useRef<(()=>void)|null>(null);
 const [kind,setKind]=useState<CheckKind>('text');
 const [mode,setMode]=useState<AssistantMode>('auto');
 const [busy,setBusy]=useState(false);
 const sending=useRef(false);
 // The band shapes tone and depth only; it is sent with the question and never stored on the server.
 const band=useBand();
 const [error,setError]=useState('');
 const [remaining,setRemaining]=useState({text:20,post:10});
 const [messages,setMessages]=useState<ChatMessage[]>([]);
 const list=useRef<HTMLDivElement>(null),composer=useRef<HTMLDivElement>(null),input=useRef<HTMLTextAreaElement>(null as unknown as HTMLTextAreaElement);
 const nearBottom=useRef(true),nextId=useRef(1);
 const [pill,setPill]=useState(false);
 const [keyboardH,setKeyboardH]=useState<number|null>(null);
 useEffect(()=>{request<{text:number;post:number}>('/assistant/usage').then(setRemaining).catch(error=>setError(error.message));},[]);

 // Phone keyboard: follow the visible viewport so the input stays above the keyboard and the list shrinks instead of hiding behind it.
 useEffect(()=>{
  const vv=window.visualViewport;if(!vv)return;
  const on=()=>setKeyboardH(vv.height<window.innerHeight-80?vv.height:null);
  vv.addEventListener('resize',on);vv.addEventListener('scroll',on);on();
  return()=>{vv.removeEventListener('resize',on);vv.removeEventListener('scroll',on);};
 },[]);
 // Keep scrolled messages clear of the sticky input.
 useLayoutEffect(()=>{
  const el=composer.current,box=list.current;if(!el||!box)return;
  const set=()=>box.style.setProperty('scroll-padding-bottom',el.offsetHeight+'px');set();
  const ro=new ResizeObserver(set);ro.observe(el);return()=>ro.disconnect();
 },[]);

 const toBottom=useCallback((smooth=false)=>{const box=list.current;if(!box)return;box.scrollTo({top:box.scrollHeight,behavior:smooth?'smooth':'auto'});nearBottom.current=true;setPill(false);},[]);
 const onScroll=()=>{const box=list.current;if(!box)return;nearBottom.current=box.scrollHeight-box.scrollTop-box.clientHeight<NEAR;if(nearBottom.current)setPill(false);};
 // New content (cards, streamed words): follow it only if the reader is already at the bottom, otherwise offer the pill.
 useLayoutEffect(()=>{if(!messages.length)return;if(nearBottom.current)toBottom();else setPill(true);},[messages,toBottom]);
 useEffect(()=>{if(keyboardH&&nearBottom.current)toBottom();},[keyboardH,toBottom]);

 const patch=(id:number,change:(m:ChatMessage)=>ChatMessage)=>setMessages(all=>all.map(m=>m.id===id?change(m):m));

 // A tile or suggested question fills the composer and sets the mode; the person edits it and sends.
 const prefill=(value:string,nextMode:AssistantMode)=>{setKind('text');setMode(nextMode);setText(value);requestAnimationFrame(()=>{const el=input.current;if(el){el.focus();el.setSelectionRange(value.length,value.length);}});};
 const send=async()=>{
  const question=text.trim(),photo=image;if((!question&&!photo)||sending.current)return;
  sending.current=true;setBusy(true);setError('');
  const selectedKind=kind,id=nextId.current++;
  // Optimistic: the message, the typing dots and (for links, numbers and scam wording) the verdict card show at once.
  const local=selectedKind==='text'&&mode!=='ask'&&question?verifyLocal(question):undefined;
  const checks=local&&(mode==='check'||local.hasEvidence)?local:undefined;
  nearBottom.current=true;
  setMessages(all=>[...all,{id,question,image:photo,checks,text:'',status:'streaming'}]);setText('');setImage(undefined);
  try{
   if(selectedKind==='post'&&!photo){
    const result=await request<AssistantResult>('/assistant','POST',{text:question,kind:'post',mode:'check',band});
    patch(id,m=>({...m,status:'done',legacy:result}));setRemaining(r=>({...r,post:result.remaining}));
   }else{
    await streamAssistant({text:question,image:photo,mode,kind:'text',band,lang},event=>{
     if(event.type==='checks')patch(id,m=>({...m,checks:event.checks,serverChecked:true}));
     else if(event.type==='token')patch(id,m=>({...m,text:m.text+event.text}));
     else if(event.type==='done'){patch(id,m=>({...m,text:event.text,status:'done',fallback:event.fallback,serverChecked:true}));setRemaining(r=>({...r,text:event.remaining}));}
    });
    patch(id,m=>m.status==='streaming'?{...m,status:'done'}:m);
   }
  }catch(e){
   const message=(e as Error).message;
   patch(id,m=>({...m,status:'error',error:message}));setError(message);
  }finally{sending.current=false;setBusy(false);}
 };

 const caps=[
  {Icon:Link2,color:'#5B21D1',lo:'ກວດລິ້ງ',en:'Check a link',fill:lo?'ກວດລິ້ງນີ້ໃຫ້ແດ່: ':'Please check this link: ',mode:'check' as AssistantMode},
  {Icon:MessagesSquare,color:'#2563EB',lo:'ກວດຂໍ້ຄວາມ',en:'Check a message',fill:lo?'ກວດຂໍ້ຄວາມນີ້ໃຫ້ແດ່: ':'Please check this message: ',mode:'check' as AssistantMode},
  {Icon:Phone,color:'#E11D48',lo:'ກວດເບີໂທ',en:'Check a number',fill:lo?'ກວດເບີໂທນີ້ໃຫ້ແດ່: ':'Please check this phone number: ',mode:'check' as AssistantMode},
 ];
 const tries=lo?['ຂໍ້ຄວາມໄດ້ລາງວັນນີ້ ແທ້ບໍ?','ວຽກໄທເງິນເດືອນສູງ ບໍ່ຕ້ອງມີໜັງສືຜ່ານແດນ?','ໂປສເຕີຮັບສະໝັກວຽກນີ້ ແທ້ບໍ?','ຖືກຫຼອກແລ້ວ ຄວນເຮັດແນວໃດ?']:['Is this prize message real?','Thai job, high pay, no passport needed?','Is this job poster real?','I was scammed. What now?'];
 const bandName=lo?({kids:'ເດັກນ້ອຍ',youth:'ໄວໜຸ່ມ',adult:'ຜູ້ໃຫຍ່',elder:'ຜູ້ສູງອາຍຸ'} as Record<string,string>)[band]:TIERS[band].range;
 return <section className="flex flex-col h-full max-h-[100dvh] bg-white text-[#14112B]" style={keyboardH?{height:keyboardH}:undefined}>
  <header className="shrink-0 flex items-center gap-2.5 px-3 py-2 border-b border-[#ECECF4]">
   {onBack&&<button type="button" onClick={onBack} aria-label={lo?'ກັບ':'Back'} className="w-11 h-11 flex items-center justify-center"><ArrowLeft size={22}/></button>}
   <img src={logoImage} alt="Sati" className="w-[34px] h-[34px] object-contain shrink-0"/>
   <div className="flex-1 min-w-0"><h1 className="text-[16px] font-bold leading-tight">{lo?'ຖາມ Sati':'Ask Sati'}</h1>
    <p className="flex items-center gap-[5px] text-[12px] text-[#5F6390]"><span className="w-[7px] h-[7px] rounded-full bg-[#22C55E]"/>{lo?'ຜູ້ຊ່ວຍຄວາມປອດໄພ':'Safety helper'} · {bandName}</p></div>
   {messages.length>0&&<button type="button" onClick={()=>{setMessages([]);setError('');}} aria-label={lo?'ແຊັດໃໝ່':'New chat'} className="w-10 h-10 rounded-full bg-[#F3F4F8] text-[#3F4268] flex items-center justify-center"><SquarePen size={18}/></button>}
  </header>
  <div className="relative flex-1 min-h-0">
   <div ref={list} onScroll={onScroll} data-testid="chat-list" className="h-full overflow-y-auto overscroll-contain scrollbar-hide px-4 py-5" aria-live="polite">
    {!messages.length&&<div>
     <h1 className="mt-3 mb-1.5 text-[24px] leading-[1.35] font-bold">{lo?<>ສະບາຍດີ<br/>ມີຫຍັງໃຫ້ Sati ຊ່ວຍ?</>:<>Hello<br/>What can Sati help with?</>}</h1>
     <p className="mb-[22px] text-[14px] leading-[1.6] text-[#5F6390]">{lo?'ວາງລິ້ງ, ຂໍ້ຄວາມ ຫຼື ເບີໂທທີ່ສົງໄສ ຫຼື ຖາມຫຍັງກໍໄດ້ກ່ຽວກັບຄວາມປອດໄພອອນລາຍ.':'Paste a suspicious link, message or number, or ask anything about staying safe online.'}</p>
     <button type="button" onClick={()=>{prefill(lo?'ໂປສເຕີນີ້ ແທ້ ຫຼື ປອມ?':'Is this poster real or fake?','auto');openAttach.current?.();}} className="flex w-full items-center gap-3 mb-2.5 p-3.5 rounded-[20px] text-left text-white" style={{background:'linear-gradient(135deg, #4A16B5, #5B21D1 55%, #6E8EF0)',boxShadow:'0 5px 0 #3B0E91'}}>
      <span aria-hidden className="flex shrink-0 w-12 h-12 rounded-[14px] bg-white/20 items-center justify-center"><Camera size={22}/></span>
      <span className="flex-1 min-w-0"><span className="block text-[16px] font-bold">{lo?'ກວດໂປສເຕີ: ແທ້ ຫຼື ປອມ?':'Check a poster: real or fake?'}</span><span className="block text-[13px] leading-[1.4] text-white/85">{lo?'ຖ່າຍຮູບ ຫຼື ອັບໂຫຼດ ໂປສເຕີວຽກ, ໂປຣໂມຊັນ, ແຈ້ງການ':'Take or upload a job poster, promotion or notice'}</span></span>
      <ChevronRight size={20} aria-hidden className="shrink-0"/>
     </button>
     <div className="grid grid-cols-3 gap-2 mb-[26px]" role="group" aria-label={lo?'ເລືອກສິ່ງທີ່ຕ້ອງການ':'What do you need?'}>
      {caps.map(c=><button key={c.en} type="button" onClick={()=>prefill(c.fill,c.mode)} className="p-[12px_10px] rounded-2xl bg-[#F6F7FC] text-left">
       <span className="flex w-8 h-8 mb-2 rounded-[10px] bg-white items-center justify-center" style={{color:c.color}}><c.Icon size={16}/></span>
       <span className="block text-[13px] font-bold">{lo?c.lo:c.en}</span></button>)}
     </div>
     <p className="mb-2.5 text-[12px] font-bold text-[#5F6390]">{lo?'ລອງຖາມ':'Try asking'}</p>
     <div className="flex flex-col gap-2" role="group" aria-label={lo?'ຄຳຖາມແນະນຳ':'Suggested questions'}>
      {tries.map(q=><button key={q} type="button" onClick={()=>prefill(q,'ask')} className="flex items-center gap-2.5 min-h-[52px] px-3.5 rounded-[14px] border border-[#ECECF4] bg-white text-[14px] text-left"><span className="flex-1">{q}</span><ArrowUpRight size={16} className="shrink-0 text-[#A3A6C2]"/></button>)}
     </div>
    </div>}
    <div className="flex flex-col gap-3.5">{messages.map(message=><AssistantMessage key={message.id} message={message} lang={lang}/>)}</div>
   </div>
   {pill&&<button type="button" onClick={()=>toBottom(true)} className="absolute left-1/2 -translate-x-1/2 bottom-3 z-20 inline-flex items-center gap-1.5 rounded-full bg-[#5B21D1] text-white px-4 min-h-11 font-bold shadow-lg"><ArrowDown size={18} aria-hidden/>{lo?'ຂໍ້ຄວາມໃໝ່':'New message'}</button>}
  </div>
  <AssistantComposer innerRef={composer} inputRef={input} lang={lang} text={text} onText={setText} kind={kind} onKind={setKind} busy={busy} error={error} remaining={remaining[kind]} onSend={()=>void send()} mode={mode} onMode={setMode} image={image} onImage={setImage} openRef={openAttach}/>
 </section>;
}
