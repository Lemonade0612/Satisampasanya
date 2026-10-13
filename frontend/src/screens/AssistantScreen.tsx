import {useEffect,useState} from 'react';
import {request} from '../lib/api';
import {DailySafetyTip} from '../components/feed/DailySafetyTip';
import {AssistantMessage,type AssistantResult} from '../components/assistant/AssistantMessage';
import {AssistantComposer,type CheckKind,type AssistantMode} from '../components/assistant/AssistantComposer';
import type {Lang} from '../types';

export function AssistantScreen({lang}:{lang:Lang}){
 const [text,setText]=useState('');
 const [kind,setKind]=useState<CheckKind>('text');
 const [mode,setMode]=useState<AssistantMode>('auto');
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState('');
 const [remaining,setRemaining]=useState({text:20,post:10});
 const [messages,setMessages]=useState<{question:string;result:AssistantResult}[]>([]);
 useEffect(()=>{request<{text:number;post:number}>('/assistant/usage').then(setRemaining).catch(error=>setError(error.message));},[]);
 const send=async()=>{
  setBusy(true);setError('');
  const selectedKind=kind,question=text;
  try{
   const result=await request<AssistantResult>('/assistant','POST',{text:question,kind:selectedKind,mode});
   setMessages(messages=>[...messages,{question,result}]);setText('');
   setRemaining(remaining=>({...remaining,[selectedKind]:result.remaining}));
  }catch(error){setError((error as Error).message);}
  finally{setBusy(false);}
 };
 return <section className="h-full flex flex-col">
  <header className="p-4 border-b border-border">
   <h1 className="font-semibold">{lang==='lo'?'ຜູ້ຊ່ວຍຄວາມປອດໄພ':'Safety assistant'}</h1>
   <p className="text-xs text-muted-foreground mt-1">{lang==='lo'?'ກວດຂໍ້ຄວາມ ແລະ ຮັບຄຳແນະນຳ — ບໍ່ແມ່ນການຢືນຢັນຂໍ້ເທັດຈິງ':'Check a draft or ask for safety tips. Results are not fact verification.'}</p>
   <p className="text-xs mt-2">{remaining.post}/10 {lang==='lo'?'ໂພສ':'post checks'} · {remaining.text}/20 {lang==='lo'?'ຂໍ້ຄວາມຍັງເຫຼືອມື້ນີ້':'texts left today'}</p>
  </header>
  <div className="flex-1 min-h-0 overflow-y-auto p-3" aria-live="polite">
   <DailySafetyTip lang={lang}/>
   {messages.map((message,index)=><AssistantMessage key={index} {...message} lang={lang}/>)}
  </div>
  <AssistantComposer lang={lang} text={text} onText={setText} kind={kind} onKind={setKind} busy={busy} error={error} remaining={remaining[kind]} onSend={()=>void send()} mode={mode} onMode={setMode}/>
 </section>;
}
