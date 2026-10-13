import type {Lang,CheckResult} from '../../types';
import {CheckResultCard} from '../safety/CheckResultCard';
export type AssistantResult={mode:'ask'|'check';language:Lang;remaining:number;check?:CheckResult;answer?:string;steps?:string[];question?:string;offer?:string};
export function AssistantMessage({question,result}:{question:string;result:AssistantResult;lang?:Lang}){
 return <div className="mb-5">
  <p className="rounded-2xl bg-primary/10 p-3 text-sm whitespace-pre-wrap font-lao">{question}</p>
  {result.mode==='ask'?<div lang={result.language} className="p-3 text-sm font-lao leading-relaxed">
   <p>{result.answer}</p>
   <ol className="list-decimal pl-5 mt-2 space-y-2">{result.steps?.map((step,index)=><li key={index}>{step}</li>)}</ol>
   {result.question&&<p className="mt-3 font-semibold">{result.question}</p>}
   <p className="mt-3">{result.offer}</p>
  </div>:result.check&&<CheckResultCard result={result.check}/>}
 </div>;
}
