import {CHECK_PROMPT,ASK_PROMPT,INTENT_PROMPT} from './prompts.mjs';
import {modelReply,inputLanguage,readSafetyConfig} from './model.mjs';
export const LABELS=['scam_risk','trafficking_recruitment','phishing','impersonation','misinformation','fear_bait','harassment','victim_blaming','profanity_only','off_topic','political_sarcasm','satire','safe_tip','news'];
const reasonSchema={type:'object',additionalProperties:false,properties:{text:{type:'string'},evidence:{type:'string'}},required:['text','evidence']};
export const CHECK_SCHEMA={type:'object',additionalProperties:false,properties:{verdict:{type:'string',enum:['approved','caution','needs_expert']},risk:{type:'string',enum:['low','medium','high']},labels:{type:'array',items:{type:'string',enum:LABELS}},on_topic:{type:'boolean'},reasons:{type:'array',maxItems:3,items:reasonSchema},suggested_edit:{type:'string'},summary:{type:'string'}},required:['verdict','risk','labels','on_topic','reasons','suggested_edit','summary']};
const answerSchema={type:'object',additionalProperties:false,properties:{answer:{type:'string'},steps:{type:'array',minItems:2,maxItems:4,items:{type:'string'}},question:{type:'string'},offer:{type:'string'}},required:['answer','steps','question','offer']};
const invalid=(lang='en')=>Object.assign(new Error(lang==='lo'?'ການກວດ AI ຍັງບໍ່ສຳເລັດ. ກະລຸນາລອງໃໝ່.':'The AI response needs another check. Please try again.'),{status:502});
export function validUserText(value,lang){
 if(typeof value!=='string'||value.length>3000||/\b(sample|example|demo|test|judge|prompt|FREEZED)\b|ໂພສຕົວຢ່າງ/iu.test(value))return false;
 if(lang==='lo'&&value.trim()){
  if(!/[຀-໿]/u.test(value))return false;
  const prose=value.replace(/https?:\/\/[^\s]+/gu,'').replace(/\b(?:OTP|PIN|ID|QR|AI|WhatsApp|Telegram|SMS|URL|Sati|Facebook|TikTok)\b/gi,'');
  if(/[a-z]{2,}/i.test(prose))return false;
 }
 return true;
}
export function guardVerdict(result,text){
 const language=inputLanguage(text);
 if(!result||!['approved','caution','needs_expert'].includes(result.verdict)||!['low','medium','high'].includes(result.risk)||typeof result.on_topic!=='boolean'||!Array.isArray(result.labels)||result.labels.some(label=>!LABELS.includes(label))||!Array.isArray(result.reasons)||!validUserText(result.summary,language)||!result.summary.trim()||!validUserText(result.suggested_edit,language))throw invalid(language);
 const reasons=result.verdict==='approved'?[]:result.reasons.filter(reason=>typeof reason?.evidence==='string'&&reason.evidence.trim()&&reason.evidence.length<=120&&reason.evidence.trim().split(/\s+/u).length<=8&&text.includes(reason.evidence)&&validUserText(reason.text,language)&&reason.text.trim()&&!/credibility indicators|bilingual content|broader reach|detailed content|tags match|ຂໍ້ມູນສອງພາສາ|ເນື້ອຫາລະອຽດ/iu.test(reason.text)).slice(0,3);
 if(result.verdict!=='approved'&&!reasons.length)throw invalid(language);
 if(result.verdict==='caution'&&!result.suggested_edit.trim())throw invalid(language);
 return {verdict:result.verdict,risk:result.risk,labels:[...new Set(result.labels)],on_topic:result.on_topic,reasons,suggested_edit:result.verdict==='caution'?result.suggested_edit:'',summary:result.summary,language,checkedAt:Date.now()};
}
export async function classifyIntent(text,{reply=modelReply}={}){
 const result=(await reply(INTENT_PROMPT,{text},{maxTokens:16})).trim().toUpperCase();
 if(!['ASK','CHECK'].includes(result))throw invalid(inputLanguage(text));
 return result==='ASK'?'ask':'check';
}
export async function checkContent(text,{reply=modelReply,onProgress=()=>{}}={}){
 onProgress('read');const language=inputLanguage(text);
 if(!text.trim())throw Object.assign(new Error('Write a message first.'),{status:400});
 onProgress('links');
 const links=text.match(/https?:\/\/[^\s]+|\b(?:bit\.ly|tinyurl\.com)\/[^\s]+/gu)||[];
 const numbers=text.match(/\+?\d[\d\s()-]{6,}\d/gu)||[];
 onProgress('patterns');
 const input={text,language,links,numbers};
 const options={schema:CHECK_SCHEMA,name:'sati_check'};
 const result=await reply(CHECK_PROMPT,input,options);
 onProgress('verdict');
 try{return guardVerdict(result,text);}catch(error){
  if(error.status!==502)throw error;
  // Retry one invalid result; never publish unchecked output or replace it with a preset verdict.
  const correction=language==='lo'?'All prose fields must contain Lao only, except common acronyms such as OTP or PIN. Copy evidence exactly from the input.':'Copy evidence exactly from the input.';
  const repaired=await reply(CHECK_PROMPT+'\nYour previous response failed validation. '+correction+' Follow the full schema and all language, evidence and verdict rules.',input,options);
  return guardVerdict(repaired,text);
 }
}
export async function askSafety(text,{reply=modelReply}={}){
 const language=inputLanguage(text);let helplines=[];
 try{helplines=JSON.parse(readSafetyConfig().helplines);}catch{}
 if(!Array.isArray(helplines))helplines=[];
 helplines=helplines.filter(item=>typeof item?.name==='string'&&typeof item?.phone==='string');
 const result=await reply(ASK_PROMPT,{text,language,localHelplines:helplines},{schema:answerSchema,name:'sati_answer'});
 if(!result||!Array.isArray(result.steps)||result.steps.length<2||result.steps.length>4||[result.answer,...result.steps,result.question,result.offer].some(value=>!validUserText(value,language))||!result.answer?.trim()||!result.offer?.trim())throw invalid(language);
 const full=[result.answer,...result.steps,result.question,result.offer].join('\n');
 if(/FREEZED|flagged|severity|verdict|targeted harassment|Profanity detected/iu.test(full))throw invalid(language);
 const phones=full.match(/\+?\d[\d\s()-]{6,}\d/gu)||[];
 if(phones.some(phone=>!helplines.some(line=>line.phone.replace(/\D/g,'')===phone.replace(/\D/g,''))))throw invalid(language);
 return {...result,language};
}
