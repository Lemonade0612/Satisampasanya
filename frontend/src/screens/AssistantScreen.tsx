import { ArrowLeft, ArrowDown, ScanSearch, Briefcase, LifeBuoy } from "lucide-react";
import logoImage from "/images/sati-mark.png";
import {useCallback,useEffect,useLayoutEffect,useRef,useState} from 'react';
import {request} from '../lib/api';
import {streamAssistant} from '../lib/assistantStream';
import {verifyLocal} from '../lib/verify';
import {DailySafetyTip} from '../components/feed/DailySafetyTip';
import {AssistantMessage,type AssistantResult,type ChatMessage} from '../components/assistant/AssistantMessage';
import {AssistantComposer,type CheckKind,type AssistantMode} from '../components/assistant/AssistantComposer';
import {useBand} from '../lib/band';
import {DT} from '../features/daily/i18n';
import type {Lang} from '../types';

const NEAR=120; // px from the bottom that still counts as "reading the latest message"

export function AssistantScreen({lang,onBack}:{lang:Lang;onBack?:()=>void}){
 const lo=lang==='lo';
 const [text,setText]=useState('');
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
  const question=text.trim();if(!question||sending.current)return;
  sending.current=true;setBusy(true);setError('');
  const selectedKind=kind,id=nextId.current++;
  // Optimistic: the message, the typing dots and (for links, numbers and scam wording) the verdict card show at once.
  const local=selectedKind==='text'&&mode!=='ask'?verifyLocal(question):undefined;
  const checks=local&&(mode==='check'||local.hasEvidence)?local:undefined;
  nearBottom.current=true;
  setMessages(all=>[...all,{id,question,checks,text:'',status:'streaming'}]);setText('');
  try{
   if(selectedKind==='post'){
    const result=await request<AssistantResult>('/assistant','POST',{text:question,kind:'post',mode:'check',band});
    patch(id,m=>({...m,status:'done',legacy:result}));setRemaining(r=>({...r,post:result.remaining}));
   }else{
    await streamAssistant({text:question,mode,kind:'text',band,lang},event=>{
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

 return <section className="flex flex-col h-full max-h-[100dvh] bg-background" style={keyboardH?{height:keyboardH}:undefined}>
  <header className="shrink-0 px-3 pt-1 pb-2 border-b border-border">
   <div className="flex items-center gap-2">
    {onBack&&<button type="button" onClick={onBack} aria-label={lo?'ກັບຄືນ':'Back'} className="min-w-11 min-h-11 flex items-center justify-center"><ArrowLeft size={22}/></button>}
    <img src={logoImage} alt="" aria-hidden className="w-9 h-9 object-contain shrink-0 bg-transparent"/>
    <div className="flex-1 min-w-0"><h1 className="font-extrabold text-[1.25rem] leading-tight">{lo?'ຖາມ Sati':'Ask Sati'}</h1>
     <p className="text-[13px] leading-snug text-muted-foreground font-lao">{lo?'ກວດລິ້ງ ແລະ ຖາມເລື່ອງຄວາມປອດໄພ':'Check links, ask about safety'}</p></div>
    <span className="text-xs text-muted-foreground tabular-nums shrink-0">{remaining.text}/20 · {remaining.post}/10</span>
   </div>
  </header>
  <div className="relative flex-1 min-h-0">
   <div ref={list} onScroll={onScroll} data-testid="chat-list" className="h-full overflow-y-auto overscroll-contain px-3 pt-3 pb-4" aria-live="polite">
    {!messages.length&&<div className="grid gap-3 mb-3">
     <div className="grid gap-2" role="group" aria-label={lo?'ເລືອກສິ່ງທີ່ຕ້ອງການ':'What do you need?'}>
      {([
       {Icon:ScanSearch,lo:'ກວດຂໍ້ຄວາມ ຫຼື ລິ້ງ',en:'Check a message or link',fill:lo?'ກວດຂໍ້ຄວາມ ຫຼື ລິ້ງນີ້ໃຫ້ແດ່: ':'Please check this message or link: ',mode:'check' as AssistantMode},
       {Icon:Briefcase,lo:'ກວດຂໍ້ສະເໜີວຽກ',en:'Check a job offer',fill:lo?'ກວດຂໍ້ສະເໜີວຽກນີ້ວ່າປອດໄພບໍ: ':'Is this job offer safe? ',mode:'check' as AssistantMode},
       {Icon:LifeBuoy,lo:'ຖ້າຖືກຫຼອກແລ້ວ ເຮັດແນວໃດ',en:'What to do if scammed',fill:lo?'ຂ້ອຍຄິດວ່າຖືກຫຼອກແລ້ວ ຄວນເຮັດແນວໃດ?':'I think I was scammed. What should I do?',mode:'ask' as AssistantMode},
      ]).map(t=><button key={t.en} type="button" onClick={()=>prefill(t.fill,t.mode)} className="flex items-center gap-3 rounded-2xl border border-border bg-surface px-4 min-h-14 text-left font-lao active:bg-surface-2">
       <span aria-hidden className="w-10 h-10 shrink-0 rounded-xl bg-[#EDE9FE] text-[#5B21D1] flex items-center justify-center"><t.Icon size={22}/></span><span className="flex-1 text-[17px] font-bold">{lo?t.lo:t.en}</span></button>)}
     </div>
     <div className="flex flex-wrap gap-2" role="group" aria-label={lo?'ຄຳຖາມແນະນຳ':'Suggested questions'}>
      {(lo?['ວຽກຕ່າງປະເທດທີ່ໃຫ້ເງິນເດືອນສູງ ປອດໄພບໍ?','ເຂົາຂໍ OTP ຂອງຂ້ອຍ ຕ້ອງເຮັດແນວໃດ?','ວິທີກວດວ່າລິ້ງປອມ?','ເຂົາຂໍໜັງສືຜ່ານແດນ ປົກກະຕິບໍ?']:['Is a high-paying job abroad safe?','Someone asked for my OTP. What now?','How do I tell a fake link?','Is it normal to hand over my passport?']).map(q=><button key={q} type="button" onClick={()=>prefill(q,'ask')} className="min-h-11 rounded-full border border-border bg-background px-4 py-2 text-left text-[15px] font-bold text-text font-lao">{q}</button>)}
     </div>
    </div>}
    <DailySafetyTip lang={lang}/>
    <div className="mt-3">{messages.map(message=><AssistantMessage key={message.id} message={message} lang={lang}/>)}</div>
   </div>
   {pill&&<button type="button" onClick={()=>toBottom(true)} className="absolute left-1/2 -translate-x-1/2 bottom-3 z-20 inline-flex items-center gap-1.5 rounded-full bg-primary text-primary-foreground px-4 min-h-11 font-bold shadow-lg font-lao"><ArrowDown size={18} aria-hidden/>{lo?'ຂໍ້ຄວາມໃໝ່':'New message'}</button>}
  </div>
  <AssistantComposer innerRef={composer} inputRef={input} lang={lang} text={text} onText={setText} kind={kind} onKind={setKind} busy={busy} error={error} remaining={remaining[kind]} onSend={()=>void send()} mode={mode} onMode={setMode}/>
 </section>;
}
