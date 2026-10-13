import {checkContent} from './checker.mjs';
export async function checkPost(post,{check=checkContent,onProgress=()=>{}}={}){
 const source=post.contentLanguage==='lo'?(post.contentLo||post.content):post.content;
 const text=post.link&&!source.includes(post.link)?source+'\n'+post.link:source;
 const result=await check(text,{onProgress});
 post.check=result;
 post.state=result.verdict==='needs_expert'?'flagged':'clean';
 post.frozen=result.verdict==='needs_expert';
 post.screeningStage=post.frozen?'expert_review':'completed';
 post.screening={mode:'ai',severity:result.risk,flags:[],note:result.summary,noteLo:result.summary,checkedAt:result.checkedAt};
 post.aiSeverity=result.risk==='low'?'none':result.risk;
 post.aiFlags=[];
 post.flagReason=result.summary;post.flagReasonLo=result.summary;
 return post;
}
