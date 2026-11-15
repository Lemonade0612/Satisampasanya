import type {Lang,CheckResult} from '../../types';
import {CheckResultCard} from '../safety/CheckResultCard';
import {VerdictCard} from './VerdictCard';
import type {VerifyResult} from '../../lib/verify';

// Old JSON answer, still used for "check a post draft".
export type AssistantResult={mode:'ask'|'check';language:Lang;remaining:number;check?:CheckResult;answer?:string;steps?:string[];question?:string;offer?:string};
export type ChatMessage={id:number;question:string;checks?:VerifyResult;text:string;status:'streaming'|'done'|'error';legacy?:AssistantResult;error?:string;fallback?:boolean;serverChecked?:boolean};

// The user's message appears at once; the verdict card comes next, then the explanation streams in below it.
export function AssistantMessage({message,lang}:{message:ChatMessage;lang:Lang}){
 const {question,checks,text,status,legacy,error}=message;
 const typing=status==='streaming'&&!text;
 return <div className="mb-6 grid gap-3">
  <p className="ml-auto max-w-[92%] rounded-3xl rounded-br-md bg-primary text-primary-foreground px-4 py-3 text-[18px] leading-[1.6] whitespace-pre-wrap break-words font-lao">{question}</p>
  {checks&&<VerdictCard checks={checks} lang={lang} pending={status==='streaming'&&!message.serverChecked&&checks.detected.urls.length>0}/>}
  {legacy?.check&&<CheckResultCard result={legacy.check} lang={lang}/>}
  {legacy&&!legacy.check&&<div lang={legacy.language} className="text-[18px] leading-[1.6] font-lao"><p>{legacy.answer}</p><ol className="list-decimal pl-6 mt-2 space-y-2">{legacy.steps?.map((s,i)=><li key={i}>{s}</li>)}</ol>{legacy.question&&<p className="mt-3 font-semibold">{legacy.question}</p>}{legacy.offer&&<p className="mt-3">{legacy.offer}</p>}</div>}
  {typing&&<p role="status" aria-label={lang==='lo'?'Sati ກຳລັງພິມ':'Sati is typing'} className="flex items-center gap-1.5 px-2 text-muted-foreground"><span className="typing-dot"/><span className="typing-dot" style={{animationDelay:'.15s'}}/><span className="typing-dot" style={{animationDelay:'.3s'}}/></p>}
  {text&&<p className="rounded-3xl rounded-bl-md bg-muted px-4 py-3 text-[18px] leading-[1.6] whitespace-pre-wrap break-words font-lao">{text}{status==='streaming'&&<span aria-hidden className="inline-block w-2 h-5 align-middle ml-0.5 bg-foreground/60 animate-pulse"/>}</p>}
  {error&&<p role="alert" className="text-[17px] text-red-600">{error}</p>}
 </div>;
}
