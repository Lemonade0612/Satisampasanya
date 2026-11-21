import {readFileSync} from 'node:fs';
import {parseEnv} from 'node:util';
export const inputLanguage=text=>/[຀-໿]/u.test(text)?'lo':'en';
export function readSafetyConfig(){
 let local={};try{local=parseEnv(readFileSync('.env.local','utf8'));}catch{}
 const setting=name=>local[name]||process.env[name]||'';
 const provider=setting('AI_PROVIDER')||(setting('OPENROUTER_API_KEY')?'openrouter':'openai');
 const keyName={openrouter:'OPENROUTER_API_KEY',anthropic:'ANTHROPIC_API_KEY',mock:'',openai:'OPENAI_API_KEY'}[provider]??'OPENAI_API_KEY',modelName={openrouter:'OPENROUTER_MODEL',anthropic:'ANTHROPIC_MODEL',openai:'OPENAI_MODEL'}[provider];
 return {provider,key:keyName?setting(keyName):'',model:(modelName&&setting(modelName))||{openrouter:'openai/gpt-4.1-mini',anthropic:'claude-haiku-5-5'}[provider]||'gpt-4.1-mini',helplines:setting('LOCAL_HELPLINES')||'[]',safeBrowsingKey:setting('GOOGLE_SAFE_BROWSING_KEY'),fallbacks:setting('OPENROUTER_FALLBACK_MODELS').split(',').map(v=>v.trim()).filter(Boolean)};
}
export const modelConfigured=()=>{const c=readSafetyConfig();return c.provider==='mock'||!!c.key;};
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

// ---- Mock and Anthropic ----------------------------------------------------------------------------------------------
// Mock answers are canned and bilingual. They run with AI_PROVIDER=mock, and as the fallback when the Anthropic key is missing or the call fails.
const MOCK_ASK={en:{answer:'Do not send money or share codes. Check with an official source first.',steps:['Stop and do not reply.','Ask a trusted adult or call the official hotline.'],question:'',offer:'Paste the message and I can check it.'},lo:{answer:'ຢ່າສົ່ງເງິນ ຫຼື ບອກລະຫັດ. ກວດກັບແຫຼ່ງທາງການກ່ອນ.',steps:['ຢຸດ ແລະ ຢ່າຕອບ.','ຖາມຜູ້ໃຫຍ່ທີ່ໄວ້ໃຈ ຫຼື ໂທສາຍດ່ວນທາງການ.'],question:'',offer:'ວາງຂໍ້ຄວາມມາ ແລ້ວຂ້ອຍຈະກວດໃຫ້.'}}; // REVIEW-LO
export function mockReply(schema,text,language){
 if(!schema)return MOCK_ASK[language].answer;
 if(schema.properties?.answer)return MOCK_ASK[language];
 const quote=text.trim().split(/\s+/u).slice(0,6).join(' ');
 return {verdict:'caution',risk:'medium',labels:['scam_risk'],on_topic:true,reasons:[{text:language==='lo'?'ກວດດ້ວຍມືໂດຍຜູ້ຊ່ຽວຊານກ່ອນ.':'Offline check: a person should review this first.',evidence:quote}],suggested_edit:language==='lo'?'ກວດກາແຫຼ່ງທີ່ມາກ່ອນໂພສ.':'Check the source before posting.',summary:language==='lo'?'ຍັງບໍ່ຢືນຢັນໄດ້ ຈຶ່ງຂໍໃຫ້ຄົນກວດ.':'Could not be confirmed, so a person should check.'}; // REVIEW-LO
}
const useMock=c=>c.provider==='mock'||(c.provider==='anthropic'&&!c.key);
async function anthropicCall(config,system,input,{maxTokens,stream,onToken,fetcher}){
 const response=await fetcher('https://api.anthropic.com/v1/messages',{method:'POST',headers:{'x-api-key':config.key,'anthropic-version':'2023-06-01','content-type':'application/json'},signal:AbortSignal.timeout(30000),body:JSON.stringify({model:config.model,max_tokens:maxTokens,system,messages:[{role:'user',content:JSON.stringify(input)}],...(stream?{stream:true}:{})})});
 if(!response.ok)throw new Error('anthropic '+response.status);
 if(!stream){const v=await response.json();return (v.content||[]).filter(p=>p.type==='text').map(p=>p.text).join('').trim();}
 const decoder=new TextDecoder();let buffer='',full='';
 const handle=line=>{if(!line.startsWith('data:'))return;try{const e=JSON.parse(line.slice(5));if(e.type==='content_block_delta'&&e.delta?.text){full+=e.delta.text;onToken(e.delta.text);}}catch{}};
 for await(const chunk of response.body){buffer+=decoder.decode(chunk,{stream:true});const lines=buffer.split('\n');buffer=lines.pop();lines.forEach(handle);}handle(buffer);
 return full;
}
export async function modelReply(instructions,input,{schema,name='sati_result',fetcher=fetch,maxTokens=1800,config=readSafetyConfig()}={}){
 const language=inputLanguage(input.text||'');
 if(useMock(config))return mockReply(schema,input.text||'',language);
 if(config.provider!=='anthropic'&&!config.key)throw failure(language);
 if(!takeAiCall())throw resting(language);
 if(config.provider==='anthropic'){try{const out=await anthropicCall(config,instructions+(schema?jsonOnly(schema):''),input,{maxTokens,fetcher});if(!schema)return out;return JSON.parse(unfence(out));}catch{return mockReply(schema,input.text||'',language);}}
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

// Streams a plain-text answer token by token. onToken gets every piece as it arrives; the full text is returned.
export async function modelStream(instructions,input,onToken,{fetcher=fetch,maxTokens=700,config=readSafetyConfig()}={}){
 const language=input.language||inputLanguage(input.text||'');
 if(useMock(config)){const t=mockReply(null,input.text||'',language);onToken(t);return t;}
 if(config.provider!=='anthropic'&&!config.key)throw failure(language);
 if(!takeAiCall())throw resting(language);
 if(config.provider==='anthropic'){try{const out=await anthropicCall(config,instructions,input,{maxTokens,stream:true,onToken,fetcher});if(out.trim())return out;}catch{}const t=mockReply(null,input.text||'',language);onToken(t);return t;}
 const router=config.provider==='openrouter';
 const body=router?{model:config.model,...(config.fallbacks?.length?{models:[config.model,...config.fallbacks]}:{}),messages:[{role:'system',content:instructions},{role:'user',content:JSON.stringify(input)}],max_tokens:maxTokens,stream:true}
  :{model:config.model,store:false,instructions,input:JSON.stringify(input),max_output_tokens:maxTokens,stream:true};
 let response;try{response=await fetcher(router?'https://openrouter.ai/api/v1/chat/completions':'https://api.openai.com/v1/responses',{method:'POST',headers:{Authorization:`Bearer ${config.key}`,'Content-Type':'application/json'},signal:AbortSignal.timeout(60000),body:JSON.stringify(body)});}catch{throw failure(language);}
 if(!response.ok||!response.body)throw failure(language,502);
 const decoder=new TextDecoder();let buffer='',full='';
 const handle=line=>{
  if(!line.startsWith('data:'))return;const data=line.slice(5).trim();if(!data||data==='[DONE]')return;
  let event;try{event=JSON.parse(data);}catch{return;}
  const piece=router?event.choices?.[0]?.delta?.content:event.type==='response.output_text.delta'?event.delta:'';
  if(typeof piece==='string'&&piece){full+=piece;onToken(piece);}
 };
 try{for await(const chunk of response.body){buffer+=decoder.decode(chunk,{stream:true});const lines=buffer.split('\n');buffer=lines.pop();lines.forEach(handle);}handle(buffer);}
 catch{if(!full)throw failure(language,502);}
 if(!full.trim())throw failure(language,502);
 return full;
}
