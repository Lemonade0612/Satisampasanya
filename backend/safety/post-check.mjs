import {checkContent} from './checker.mjs';
const VERDICTS=['approved','caution','needs_expert'],RISKS=['low','medium','high'];
const severity=result=>VERDICTS.indexOf(result.verdict)*RISKS.length+RISKS.indexOf(result.risk);
// Every version a reader can see is screened (English, Lao, and the source link with each);
// the strictest verdict decides, so text hidden in the non-primary language cannot go live unchecked.
export async function checkPost(post,{check=checkContent,onProgress=()=>{}}={}){
 const primary=post.contentLanguage==='lo'?(post.contentLo||post.content):post.content;
 const versions=[...new Set([primary,post.content,post.contentLo].filter(value=>typeof value==='string'&&value.trim()))];
 const withLink=source=>post.link&&!source.includes(post.link)?source+'\n'+post.link:source;
 const results=await Promise.all(versions.map((source,index)=>check(withLink(source),{onProgress:index===0?onProgress:()=>{}})));
 const result=results.reduce((worst,next)=>severity(next)>severity(worst)?next:worst);
 post.check=result;
 post.state=result.verdict!=='approved'?'flagged':'clean';
 post.frozen=result.verdict!=='approved';
 post.screeningStage=post.frozen?'expert_review':'completed';
 post.screening={mode:'ai',severity:result.risk,flags:[],note:result.summary,noteLo:result.summary,checkedAt:result.checkedAt};
 post.aiSeverity=result.risk==='low'?'none':result.risk;
 post.aiFlags=[];
 post.flagReason=result.summary;post.flagReasonLo=result.summary;
 return post;
}
