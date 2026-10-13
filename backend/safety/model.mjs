import {readFileSync} from 'node:fs';
import {parseEnv} from 'node:util';
export const inputLanguage=text=>/[຀-໿]/u.test(text)?'lo':'en';
export function readSafetyConfig(){
 let local={};try{local=parseEnv(readFileSync('.env.local','utf8'));}catch{}
 const setting=name=>local[name]||process.env[name]||'';
 const provider=setting('AI_PROVIDER')||(setting('OPENROUTER_API_KEY')?'openrouter':'openai');
 return {provider,key:setting(provider==='openrouter'?'OPENROUTER_API_KEY':'OPENAI_API_KEY'),model:setting(provider==='openrouter'?'OPENROUTER_MODEL':'OPENAI_MODEL')||(provider==='openrouter'?'openai/gpt-4.1-mini':'gpt-4.1-mini'),helplines:setting('LOCAL_HELPLINES')||'[]'};
}
export const modelConfigured=()=>!!readSafetyConfig().key;
const failure=(lang,status=503)=>Object.assign(new Error(lang==='lo'?'ບໍລິການ AI ຍັງບໍ່ພ້ອມ. ກະລຸນາລອງໃໝ່ພາຍຫຼັງ.':'The AI service is unavailable. Please try again later.'),{status});
export async function modelReply(instructions,input,{schema,name='sati_result',fetcher=fetch,maxTokens=1800,config=readSafetyConfig()}={}){
 const language=inputLanguage(input.text||'');if(!config.key)throw failure(language);
 const router=config.provider==='openrouter';
 const body=router?{model:config.model,messages:[{role:'system',content:instructions},{role:'user',content:JSON.stringify(input)}],max_tokens:maxTokens,...(schema?{response_format:{type:'json_schema',json_schema:{name,strict:true,schema}},provider:{require_parameters:true}}:{})}:{model:config.model,store:false,instructions,input:JSON.stringify(input),max_output_tokens:maxTokens,...(schema?{text:{format:{type:'json_schema',name,strict:true,schema}}}:{})};
 let response;try{response=await fetcher(router?'https://openrouter.ai/api/v1/chat/completions':'https://api.openai.com/v1/responses',{method:'POST',headers:{Authorization:`Bearer ${config.key}`,'Content-Type':'application/json'},signal:AbortSignal.timeout(60000),body:JSON.stringify(body)});}catch{throw failure(language);}
 if(!response.ok)throw failure(language,502);
 const value=await response.json();let result;
 if(router){const choice=value.choices?.[0];if(value.error||!choice||choice.finish_reason!=='stop'||choice.message?.refusal)throw failure(language,502);result=typeof choice.message?.content==='string'?choice.message.content.trim():'';}
 else{if(value.status==='incomplete'||value.output?.some(item=>item.content?.some(part=>part.type==='refusal')))throw failure(language,502);result=value.output?.flatMap(item=>item.content||[]).filter(part=>part.type==='output_text').map(part=>part.text).join('').trim();}
 if(!result)throw failure(language,502);
 if(!schema)return result;try{return JSON.parse(result);}catch{throw failure(language,502);}
}
