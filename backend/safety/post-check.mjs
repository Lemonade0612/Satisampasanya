import {checkContent} from './checker.mjs';
import {localFirstCheck} from '../screening/local-check.mjs';
import {moderate} from '../../shared/moderation.mjs';
import {localScreen, translationEnabled} from '../translation.mjs';
const VERDICTS=['approved','caution','needs_expert'],RISKS=['low','medium','high'];
const severity=result=>VERDICTS.indexOf(result.verdict)*RISKS.length+RISKS.indexOf(result.risk);
// Rule flags -> the labels the reviewer sees.
const RULE_LABELS={profanity:'profanity_only',political_satire:'political_sarcasm',partisan:'political_sarcasm'};
// Local NLI screening flags are sentences from the screening labels in backend/translation service; map them to Sati labels.
const LOCAL_LABELS=[[/insult|threat/iu,'harassment'],[/exploitation|trafficking|recruit/iu,'trafficking_recruitment'],[/money|credentials|password/iu,'scam_risk'],[/off-topic/iu,'off_topic']];
// Raise a result to at least the given verdict and risk. Never lowers anything, so the strictest signal wins.
function raise(result,{verdict='caution',risk='medium',labels=[],onTopic,summary}){
 const raised=VERDICTS.indexOf(verdict)>VERDICTS.indexOf(result.verdict);
 const next={...result,labels:[...new Set([...result.labels,...labels])]};
 if(raised)next.verdict=verdict;
 if(RISKS.indexOf(risk)>RISKS.indexOf(result.risk))next.risk=risk;
 if(onTopic===false)next.on_topic=false;
 // The AI summary may say "approved"; once the rules or local screen overrule it, show their reason instead.
 if(raised&&summary)next.summary=summary;
 return next;
}
// Deterministic policy rules (shared/moderation.mjs) are a floor the AI cannot approve past: profanity, political
// satire or partisan content, adult, gambling, crypto, shopping and travel promotions are held even if the AI calls them a safe tip.
// "off_topic" is left to the AI: the keyword list is too narrow to decide relevance for a real safety post.
export function applyRules(result,post){
 const rules=moderate(post);
 const policy=rules.flags.filter(flag=>flag!=='off_topic');
 if(rules.decision!=='reject'||!policy.length)return result;
 return raise(result,{verdict:'caution',risk:'medium',labels:policy.map(flag=>RULE_LABELS[flag]||'off_topic'),summary:rules.reasons[0]});
}
// Optional second opinion from the local NLI model. Off unless LOCAL_SCREEN=1 and NLLB_URL is set,
// because the screening model must be downloaded first; a failure just returns null and the other layers still run.
export async function localCheck(text,{screen=localScreen,enabled=()=>process.env.LOCAL_SCREEN==='1'&&translationEnabled()}={}){
 if(!enabled())return null;
 try{return await screen(text);}catch{return null;}
}
export function applyLocal(result,local){
 if(!local||local.severity==='none'||!local.flags?.length)return result;
 const labels=local.flags.flatMap(flag=>LOCAL_LABELS.filter(([rx])=>rx.test(flag)).map(([,label])=>label));
 return raise(result,{verdict:'needs_expert',risk:'medium',labels:labels.length?labels:['off_topic'],summary:'The local safety screen flagged this post for an expert to check.'});
}
export async function checkPost(post,{check=checkContent,onProgress=()=>{},local=localCheck}={}){
 // With the real checker, English text is screened locally first (backend/screening); an injected `check` is used as given.
 const screened=check===checkContent?(text,options)=>localFirstCheck(text,{llm:checkContent,onProgress:options?.onProgress}):check;
 const primary=post.contentLanguage==='lo'?(post.contentLo||post.content):post.content;
 const versions=[...new Set([primary,post.content,post.contentLo].filter(value=>typeof value==='string'&&value.trim()))];
 const withLink=source=>post.link&&!source.includes(post.link)?source+'\n'+post.link:source;
 const results=await Promise.all(versions.map((source,index)=>screened(withLink(source),{onProgress:index===0?onProgress:()=>{}})));
 let result=results.reduce((worst,next)=>severity(next)>severity(worst)?next:worst);
 result=applyRules(result,post);
 result=applyLocal(result,await local(withLink(primary)));
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
