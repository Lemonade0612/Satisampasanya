// Traffic-light risk scoring for posts: green (safe/verified), yellow (check first), red (likely scam or off-topic).
// Rules live in rules/risk-rules.json so staff can edit them without touching code.
import {readFileSync} from 'node:fs';

export const RULES=JSON.parse(readFileSync(new URL('../rules/risk-rules.json',import.meta.url),'utf8'));
const compile=list=>(list||[]).map(source=>new RegExp(source,'iu'));
const COMPILED=new Map(RULES.rules.map(rule=>[rule.id,{patterns:compile(rule.patterns),unless:compile(rule.unless)}]));
const AWARENESS=compile(RULES.awareness_markers);
export const LEVELS=['green','yellow','red'];
export const REPORT_REASONS=['scam','trafficking','fake_job','inappropriate','off_topic'];
export const REPORT_YELLOW=3,REPORT_HIDE=5;

const levelFor=score=>score>=RULES.thresholds.red?'red':score>=RULES.thresholds.yellow?'yellow':'green';
const textOf=post=>[post.content,post.contentLo,post.repostText].filter(Boolean).join('\n');

export function trustedSourceFor(post){
 const id=post.sourceId&&RULES.trusted_sources.find(source=>source.id===post.sourceId);
 if(id)return id;
 let host='';try{host=new URL(post.link).hostname.toLowerCase();}catch{}
 return host?RULES.trusted_sources.find(source=>source.domains.some(domain=>host===domain||host.endsWith('.'+domain))):undefined;
}

// Returns {level,score,reasons:[{en,lo,rule}],hardRed,trustedSource?}.
export function scoreText(text,{trusted}={}){
 const aware=AWARENESS.some(pattern=>pattern.test(text));
 const hits=[];let score=0,hardRed=false;
 for(const rule of RULES.rules){
  const {patterns,unless}=COMPILED.get(rule.id);
  if(rule.requires_rule&&!hits.some(hit=>hit.rule===rule.id||hit.rule===rule.requires_rule))continue;
  if(!patterns.some(pattern=>pattern.test(text))||unless.some(pattern=>pattern.test(text)))continue;
  const soften=aware&&rule.category==='scam';
  hits.push({rule:rule.id,en:rule.reason.en,lo:rule.reason.lo});
  if(rule.hard_red&&!soften)hardRed=true;
  score+=soften?Math.floor(rule.weight*0.4):rule.weight;
 }
 // A trusted source is green unless the text itself is a hard red (profanity, ads, gambling, ...).
 if(trusted&&!hardRed)return {level:'green',score:0,reasons:[],hardRed:false,trustedSource:trusted.name};
 return {level:hardRed?"red":levelFor(score),score,reasons:hits,hardRed};
}

export const scorePost=post=>scoreText(textOf(post),{trusted:trustedSourceFor(post)});

// Fields stored on the post: risk_level, risk_reasons[{en,lo}], flagged_by, flag_count (+ risk_score, trusted source name).
export function applyRisk(post,now=Date.now()){
 if(post.risk_override)return post;
 const result=scorePost(post);
 post.risk_level=result.level;post.risk_score=result.score;
 post.risk_reasons=result.reasons.map(({en,lo})=>({en,lo}));
 post.flagged_by='auto';post.verified_source=result.trustedSource;
 post.risk_checked_at=now;
 return applyReports(post);
}

// User reports: 3+ push a green post to yellow and into admin review; 5+ hide it until an admin reviews it.
export function applyReports(post){
 post.flag_count=(post.reports||[]).length;
 if(post.risk_override)return post;
 if(post.flag_count>=REPORT_YELLOW){
  post.needs_admin_review=true;
  if(post.risk_level==='green'){
   post.risk_level='yellow';post.flagged_by='user';
   post.risk_reasons=[...(post.risk_reasons||[]),{en:'Reported by several people',lo:'ມີຫຼາຍຄົນລາຍງານໂພສນີ້'}];
  }
 }
 return post;
}

// A reviewer's decision (anything but reject) puts a held post back in the feed.
export const hiddenByRisk=post=>!post.risk_override&&!post.warningExample&&(!post.review||post.review.state==='rejected')&&(post.risk_level==='red'||(post.flag_count||0)>=REPORT_HIDE);
export const riskNeedsReview=post=>!post.risk_override&&(post.risk_level==='red'||(post.flag_count||0)>=REPORT_YELLOW);

export function addReport(post,userId,reason,now=Date.now()){
 if(!REPORT_REASONS.includes(reason))throw Object.assign(new Error('Choose a report reason.'),{status:400});
 post.reports=post.reports||[];
 if(post.reports.some(report=>report.userId===userId))throw Object.assign(new Error('You already reported this post.'),{status:409});
 post.reports.push({userId,reason,at:now});
 return applyReports(post);
}

// An admin sets the level by hand. The override is appended to risk_log and survives re-scoring.
// warningExample publishes a red post with the "likely scam" overlay instead of hiding it.
export function overrideRisk(post,{level,note='',warningExample=false},actor,now=Date.now()){
 if(!LEVELS.includes(level))throw Object.assign(new Error('Level must be green, yellow or red.'),{status:400});
 const entry={at:now,from:post.risk_level||null,to:level,by:actor.id,byName:actor.name,note,warningExample:level==='red'&&!!warningExample};
 post.risk_log=[...(post.risk_log||[]),entry];
 post.risk_level=level;post.flagged_by='admin';post.risk_override=true;
 post.warningExample=entry.warningExample;post.needs_admin_review=false;
 return post;
}
