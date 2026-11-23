import {RESTING} from './safety/model.mjs';
import {askSafety,checkContent,classifyIntent} from './safety/checker.mjs';
const day=()=>new Date(Date.now()+7*3600000).toISOString().slice(0,10);
export function assistantUsage(db,userId){
 const rows=db.prepare('SELECT kind,count FROM assistant_usage WHERE user_id=? AND day=?').all(userId,day());
 return {text:20-(rows.find(row=>row.kind==='text')?.count||0),post:10-(rows.find(row=>row.kind==='post')?.count||0)};
}
export async function assistantReply(db,userId,{text,kind='text',mode='auto',band='youth'},{ask=askSafety,check=checkContent,classify=classifyIntent}={}){
 const date=day(),limit=kind==='post'?10:20;
 const used=db.prepare('INSERT INTO assistant_usage(user_id,day,kind,count) VALUES (?,?,?,1) ON CONFLICT(user_id,day,kind) DO UPDATE SET count=count+1 WHERE count<? RETURNING count').get(userId,date,kind,limit);
 if(!used)throw Object.assign(new Error('Daily limit reached. Your allowance resets at midnight in Laos.'),{status:429});
 try{
  const intent=mode==='auto'?await classify(text):mode;
  if(intent==='ask'){
   // The age band only shapes the answer's tone; it is not written to the database.
   const answer=await ask(text,{band});
   return {mode:'ask',language:answer.language,answer:answer.answer,steps:answer.steps,question:answer.question,offer:answer.offer,remaining:limit-used.count};
  }
  const result=await check(text);
  return {mode:'check',language:result.language,check:result,remaining:limit-used.count};
 }catch(error){db.prepare('UPDATE assistant_usage SET count=count-1 WHERE user_id=? AND day=? AND kind=?').run(userId,date,kind);
  // Global AI cap reached: a calm answer, not an error screen.
  if(error.resting){const language=/[\u0E80-\u0EFF]/u.test(text)?'lo':'en';return {mode:'ask',language,answer:RESTING[language],steps:[],remaining:limit-used.count+1};}
  throw error;}
}

// ---- Streaming answer ----------------------------------------------------------------------------------------------
// Order of events written to `emit`: {type:'checks'} (verdict card, before any AI), {type:'token'} pieces of the explanation,
// then {type:'done'} with the cleaned final text. Without an AI key or on an AI error the card still arrives, with a plain fallback text.
import {ALL_NUMBERS,ALWAYS_SHOWN} from '../shared/emergency-hotlines.mjs';
import {sanitizeClaims} from '../shared/verify.mjs';
import {verifyDeep,verifyLocal} from './link-verify.mjs';
import {modelStream,inputLanguage} from './safety/model.mjs';
import {streamPrompt} from './safety/prompts.mjs';

const known=new Set(ALL_NUMBERS.map(l=>l.tel.replace(/\D/g,'')));
// Numbers the model wrote that are not on the hotline list are removed from the final text.
export const scrubNumbers=text=>text.replace(/\+?\d[\d\s()-]{5,}\d/gu,found=>known.has(found.replace(/\D/g,''))||[...known].some(n=>found.replace(/\D/g,'').endsWith(n))?found:'');

export function fallbackText(checks,language){
 const lo=language==='lo';
 if(!checks)return lo?'ຕອນນີ້ Sati AI ຍັງຕອບບໍ່ໄດ້. ກະລຸນາລອງໃໝ່ ຫຼື ຖາມຜູ້ໃຫຍ່ທີ່ໄວ້ໃຈ.':'Sati AI cannot answer right now. Please try again, or ask a trusted adult.';
 const top=checks.signals.find(s=>s.result==='fail')||checks.signals.find(s=>s.result==='warn')||checks.signals.find(s=>s.result==='pass');
 return top?(lo?top.detail_lo:top.detail_en):(lo?'ເຮົາຍັງບໍ່ພົບຫຍັງທີ່ກວດໄດ້ ຈຶ່ງບອກບໍ່ໄດ້ວ່າປອດໄພ ຫຼື ບໍ່.':"We found nothing we can check, so we can't tell either way.");
}

export async function assistantStream(db,userId,{text,kind='text',mode='auto',band='youth',lang='en'},emit,{stream=modelStream,verify=verifyDeep,fetcher}={}){
 const date=day(),limit=kind==='post'?10:20;
 const used=db.prepare('INSERT INTO assistant_usage(user_id,day,kind,count) VALUES (?,?,?,1) ON CONFLICT(user_id,day,kind) DO UPDATE SET count=count+1 WHERE count<? RETURNING count').get(userId,date,kind,limit);
 if(!used)throw Object.assign(new Error('Daily limit reached. Your allowance resets at midnight in Laos.'),{status:429});
 const language=/[຀-໿]/u.test(text)?'lo':lang==='lo'?'lo':'en';
 try{
  // A verdict card is shown when asked for, or when the text holds a link, a phone number or scam wording. Plain questions get text only.
  const local=verifyLocal(text);
  const card=mode==='check'||(mode==='auto'&&local.hasEvidence);
  const checks=card?await verify(text,{fetcher}):null;
  if(checks)emit({type:'checks',checks});
  const hotlines=ALL_NUMBERS.map(l=>({name:l.name[language],number:l.number}));
  const brief=checks&&{level:checks.level,confidence:checks.confidence,signals:checks.signals.map(s=>({check:s.check,result:s.result,detail:language==='lo'?s.detail_lo:s.detail_en}))};
  let full='',fallback=false,resting=false;
  try{full=await stream(streamPrompt(band),{text,language,checks:brief,hotlines,dangerFirst:[ALWAYS_SHOWN.number]},piece=>emit({type:'token',text:piece}));}
  catch(error){
   if(error.resting){full=error.message;resting=true;}
   else{fallback=true;full=fallbackText(checks,language);}
   emit({type:'token',text:full});
  }
  // The AI could not answer (error or resting): hand the question back, like the non-streaming path does.
  const unanswered=fallback||resting;
  if(unanswered)db.prepare('UPDATE assistant_usage SET count=count-1 WHERE user_id=? AND day=? AND kind=?').run(userId,date,kind);
  emit({type:'done',text:scrubNumbers(sanitizeClaims(full)),fallback,remaining:limit-used.count+(unanswered?1:0),language});
 }catch(error){db.prepare('UPDATE assistant_usage SET count=count-1 WHERE user_id=? AND day=? AND kind=?').run(userId,date,kind);throw error;}
}
