import {askSafety,checkContent,classifyIntent} from './safety/checker.mjs';
const day=()=>new Date(Date.now()+7*3600000).toISOString().slice(0,10);
export function assistantUsage(db,userId){
 const rows=db.prepare('SELECT kind,count FROM assistant_usage WHERE user_id=? AND day=?').all(userId,day());
 return {text:20-(rows.find(row=>row.kind==='text')?.count||0),post:10-(rows.find(row=>row.kind==='post')?.count||0)};
}
export async function assistantReply(db,userId,{text,kind='text',mode='auto'},{ask=askSafety,check=checkContent,classify=classifyIntent}={}){
 const date=day(),limit=kind==='post'?10:20;
 const used=db.prepare('INSERT INTO assistant_usage(user_id,day,kind,count) VALUES (?,?,?,1) ON CONFLICT(user_id,day,kind) DO UPDATE SET count=count+1 WHERE count<? RETURNING count').get(userId,date,kind,limit);
 if(!used)throw Object.assign(new Error('Daily limit reached. Your allowance resets at midnight in Laos.'),{status:429});
 try{
  const intent=mode==='auto'?await classify(text):mode;
  if(intent==='ask'){
   const answer=await ask(text);
   return {mode:'ask',language:answer.language,answer:answer.answer,steps:answer.steps,question:answer.question,offer:answer.offer,remaining:limit-used.count};
  }
  const result=await check(text);
  return {mode:'check',language:result.language,check:result,remaining:limit-used.count};
 }catch(error){db.prepare('UPDATE assistant_usage SET count=count-1 WHERE user_id=? AND day=? AND kind=?').run(userId,date,kind);throw error;}
}
