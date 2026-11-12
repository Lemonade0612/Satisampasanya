import {readFileSync} from 'node:fs';
import {parseEnv} from 'node:util';
export const inputLanguage=text=>/[຀-໿]/u.test(text)?'lo':'en';
export function readSafetyConfig(){
 let local={};try{local=parseEnv(readFileSync('.env.local','utf8'));}catch{}
 const setting=name=>local[name]||process.env[name]||'';
 const provider=setting('AI_PROVIDER')||(setting('OPENROUTER_API_KEY')?'openrouter':'openai');
 return {provider,key:setting(provider==='openrouter'?'OPENROUTER_API_KEY':'OPENAI_API_KEY'),model:setting(provider==='openrouter'?'OPENROUTER_MODEL':'OPENAI_MODEL')||(provider==='openrouter'?'openai/gpt-4.1-mini':'gpt-4.1-mini'),helplines:setting('LOCAL_HELPLINES')||'[]',fallbacks:setting('OPENROUTER_FALLBACK_MODELS').split(',').map(v=>v.trim()).filter(Boolean)};
}
export const modelConfigured=()=>!!readSafetyConfig().key;
const failure=(lang,status=503)=>Object.assign(new Error(lang==='lo'?'ບໍລິການ AI ຍັງບໍ່ພ້ອມ. ກະລຸນາລອງໃໝ່ພາຍຫຼັງ.':'The AI service is unavailable. Please try again later.'),{status});
// Global daily cap across every user, so free-tier quotas or credits cannot be drained.
// Counted per Laos day in memory; a restart resets it, which errs on the side of availability.
export const RESTING={en:'Sati AI is resting for today. Please try again tomorrow.',lo:'ວັນນີ້ Sati AI ກຳລັງພັກຜ່ອນ. ກະລຸນາລອງໃໝ່ມື້ອື່ນ.'}; // REVIEW-LO
const usage={day:'',count:0};
const laosDay=()=>new Date(Date.now()+7*3600000).toISOString().slice(0,10);
export function takeAiCall(cap=Number(process.env.AI_DAILY_CAP)||300){
 const day=laosDay();if(usage.day!==day){usage.day=day;usage.count=0;}
 if(usage.count>=cap)return false;usage.count++;return true;
}
const resting=lang=>Object.assign(new Error(RESTING[lang]),{status:429,resting:true});
// Free OpenRouter models often reject strict JSON schemas; ask for JSON in the prompt instead.
const jsonOnly=schema=>`\n\nReply with only one JSON object (no prose, no code fences) matching this JSON schema:\n${JSON.stringify(schema)}`;
const unfence=text=>text.replace(/^```(?:json)?\s*/i,'').replace(/\s*```$/,'').trim();
export async function modelReply(instructions,input,{schema,name='sati_result',fetcher=fetch,maxTokens=1800,config=readSafetyConfig()}={}){
 const language=inputLanguage(input.text||'');if(!config.key)throw failure(language);
 if(!takeAiCall())throw resting(language);
 const router=config.provider==='openrouter';
 const routerBody=strict=>({model:config.model,...(config.fallbacks?.length?{models:[config.model,...config.fallbacks]}:{}),messages:[{role:'system',content:instructions+(schema&&!strict?jsonOnly(schema):'')},{role:'user',content:JSON.stringify(input)}],max_tokens:maxTokens,...(schema&&strict?{response_format:{type:'json_schema',json_schema:{name,strict:true,schema}},provider:{require_parameters:true}}:{})});
 const body=router?routerBody(true):{model:config.model,store:false,instructions,input:JSON.stringify(input),max_output_tokens:maxTokens,...(schema?{text:{format:{type:'json_schema',name,strict:true,schema}}}:{})};
 const post=payload=>fetcher(router?'https://openrouter.ai/api/v1/chat/completions':'https://api.openai.com/v1/responses',{method:'POST',headers:{Authorization:`Bearer ${config.key}`,'Content-Type':'application/json'},signal:AbortSignal.timeout(60000),body:JSON.stringify(payload)});
 let response;try{response=await post(body);if(router&&schema&&!response.ok&&response.status!==429&&response.status!==401)response=await post(routerBody(false));}catch{throw failure(language);}
 if(!response.ok)throw failure(language,502);
 const value=await response.json();let result;
 if(router){const choice=value.choices?.[0];if(value.error||!choice||choice.finish_reason!=='stop'||choice.message?.refusal)throw failure(language,502);result=typeof choice.message?.content==='string'?choice.message.content.trim():'';}
 else{if(value.status==='incomplete'||value.output?.some(item=>item.content?.some(part=>part.type==='refusal')))throw failure(language,502);result=value.output?.flatMap(item=>item.content||[]).filter(part=>part.type==='output_text').map(part=>part.text).join('').trim();}
 if(!result)throw failure(language,502);
 if(!schema)return result;try{return JSON.parse(unfence(result));}catch{throw failure(language,502);}
}
