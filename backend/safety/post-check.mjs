import {checkContent} from './checker.mjs';
import {localFirstCheck} from '../screening/local-check.mjs';
const VERDICTS=['approved','caution','needs_expert'],RISKS=['low','medium','high'];
const severity=result=>VERDICTS.indexOf(result.verdict)*RISKS.length+RISKS.indexOf(result.risk);
// Every version a reader can see is screened (English, Lao, and the source link with each);
// the strictest verdict decides, so text hidden in the non-primary language cannot go live unchecked.
// With the real checker, English text is screened locally first (backend/screening); an injected `check` is used as given.
export async function checkPost(post,{check=checkContent,onProgress=()=>{}}={}){
 const screened=check===checkContent?(text,options)=>localFirstCheck(text,{llm:checkContent,onProgress:options?.onProgress}):check;
 const primary=post.contentLanguage==='lo'?(post.contentLo||post.content):post.content;
 const versions=[...new Set([primary,post.content,post.contentLo].filter(value=>typeof value==='string'&&value.trim()))];
 const withLink=source=>post.link&&!source.includes(post.link)?source+'\n'+post.link:source;
 const results=await Promise.all(versions.map((source,index)=>screened(withLink(source),{onProgress:index===0?onProgress:()=>{}})));
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
