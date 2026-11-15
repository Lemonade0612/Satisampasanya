import { ArrowLeft, ArrowDown } from "lucide-react";
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
 const list=useRef<HTMLDivElement>(null),composer=useRef<HTMLDivElement>(null);
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
   <div className="flex items-center gap-1">
    {onBack&&<button type="button" onClick={onBack} aria-label={lo?'ກັບຄືນ':'Back'} className="min-w-11 min-h-11 flex items-center justify-center"><ArrowLeft size={22}/></button>}
    <h1 className="font-bold text-lg flex-1">{lo?'ຜູ້ຊ່ວຍຄວາມປອດໄພ':'Safety assistant'}</h1>
    <span className="text-xs text-muted-foreground tabular-nums">{remaining.text}/20 · {remaining.post}/10</span>
   </div>
   <p className="text-[13px] text-muted-foreground font-lao pl-1">{lo?'ກວດລິ້ງ, ເບີໂທ ແລະ ຂໍ້ຄວາມ. ເປັນຕົວຊ່ວຍ ບໍ່ແມ່ນການຢືນຢັນຂໍ້ເທັດຈິງ.':'Checks links, phone numbers and messages. A helper, not fact verification.'} <span className="text-primary font-semibold">{lo?'ຄຳຕອບປັບສຳລັບ':'Tuned for'}: {DT[lang][`age_${band}`]}</span></p>
  </header>
  <div className="relative flex-1 min-h-0">
   <div ref={list} onScroll={onScroll} data-testid="chat-list" className="h-full overflow-y-auto overscroll-contain px-3 pt-3 pb-4" aria-live="polite">
    <DailySafetyTip lang={lang}/>
    <div className="mt-3">{messages.map(message=><AssistantMessage key={message.id} message={message} lang={lang}/>)}</div>
   </div>
   {pill&&<button type="button" onClick={()=>toBottom(true)} className="absolute left-1/2 -translate-x-1/2 bottom-3 z-20 inline-flex items-center gap-1.5 rounded-full bg-primary text-primary-foreground px-4 min-h-11 font-bold shadow-lg font-lao"><ArrowDown size={18} aria-hidden/>{lo?'ຂໍ້ຄວາມໃໝ່':'New message'}</button>}
  </div>
  <AssistantComposer innerRef={composer} lang={lang} text={text} onText={setText} kind={kind} onKind={setKind} busy={busy} error={error} remaining={remaining[kind]} onSend={()=>void send()} mode={mode} onMode={setMode}/>
 </section>;
}
