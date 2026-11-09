import {randomUUID} from 'node:crypto';

// Daily scenarios that go through staff review before anyone plays them.
// draft → approved (content checked) → live (served to players). Any status can be rejected; rejected can return to draft.
// Every decision is written to moderation_log with who made it and when.

const fail=(message,status=400)=>{throw Object.assign(new Error(message),{status});};
export const BANDS=['kids','youth','adult','elder'];
// Highest intensity each band may see: 1 spot-the-fake basics, 2 money loss and fraud, 3 trafficking and forced criminality.
export const MAX_INTENSITY={kids:1,youth:3,adult:3,elder:2};
const SCAM_TYPES=['fake_job','prize','bank_phishing','overseas_recruitment','investment','game_item','stranger','romance','loan','impersonation','family_emergency','safety_basics'];
const FLAGS=['urgency','upfront_fee','too_good','unverified_identity','personal_data','off_platform','suspicious_link'];
const CHANNELS=['whatsapp','messenger','sms','video','tiktok'];
const ACTIONS=['reply','ignore','verify','report'];
const NEXT={draft:['approved','rejected'],approved:['live','draft','rejected'],live:['approved','rejected'],rejected:['draft']};

const str=(v,max,what)=>{if(typeof v!=='string'||!v.trim()||v.trim().length>max)fail(`${what} must contain 1–${max} characters.`);return v.trim();};
// Both languages are required: every scenario is played in Lao and English.
const l10n=(v,max,what)=>{if(!v||typeof v!=='object')fail(`${what} needs English and Lao text.`);return {en:str(v.en,max,`${what} (English)`),lo:str(v.lo,max,`${what} (Lao)`)};};
const list=(v,min,max,what)=>{if(!Array.isArray(v)||v.length<min||v.length>max)fail(`${what} needs ${min}–${max} items.`);return v;};
const oneOf=(v,options,what)=>{if(!options.includes(v))fail(`Choose a valid ${what}.`);return v;};

function step(s,i){
 if(!s||typeof s!=='object')fail('Each step must be an object.');
 const id=typeof s.id==='string'&&/^[a-z0-9_-]{1,20}$/.test(s.id)?s.id:`s${i+1}`;
 if(s.kind==='chat'){
  const choices=list(s.choices,2,4,'Each chat step').map(c=>({id:str(c?.id,20,'Choice id'),action:oneOf(c.action,ACTIONS,'choice action'),correct:c.correct===true,text:l10n(c.text,300,'Choice'),consequence:l10n(c.consequence,600,'Consequence')}));
  if(!choices.some(c=>c.correct))fail('Each chat step needs at least one safe choice.');
  return {id,kind:'chat',messages:list(s.messages,1,12,'Chat messages').map(m=>({from:oneOf(m?.from,['them','me','system'],'message sender'),text:l10n(m.text,600,'Message')})),prompt:l10n(s.prompt,300,'Prompt'),choices};
 }
 if(s.kind==='flags'){
  const segments=list(s.segments,2,30,'Red-flag segments').map(g=>g?.flag===undefined?{text:l10n(g?.text,400,'Segment')}:{text:l10n(g.text,400,'Segment'),flag:oneOf(g.flag,FLAGS,'red flag')});
  if(!segments.some(g=>g.flag))fail('A red-flag step needs at least one flagged segment.');
  return {id,kind:'flags',prompt:l10n(s.prompt,300,'Prompt'),segments};
 }
 fail('Steps must be chat or flags.');
}

// Rebuilds the scenario from known fields only, so a submission cannot smuggle in a status, reviewer or extra keys.
export function validateScenario(input){
 if(!input||typeof input!=='object'||Array.isArray(input))fail('Send a scenario object.');
 if(JSON.stringify(input).length>60000)fail('Scenario is too large.',413);
 const id=typeof input.id==='string'&&/^[a-z0-9-]{3,80}$/.test(input.id)?input.id:fail('Scenario id must be 3–80 lowercase letters, numbers or dashes.');
 const bands=[...new Set(list(input.bands,1,4,'Bands'))].map(b=>oneOf(b,BANDS,'age band'));
 const intensity=Number.isInteger(input.intensity)&&input.intensity>=1&&input.intensity<=3?input.intensity:fail('Intensity must be 1, 2 or 3.');
 const tooIntense=bands.filter(b=>intensity>MAX_INTENSITY[b]);
 if(tooIntense.length)fail(`Intensity ${intensity} is above what ${tooIntense.join(', ')} may see.`);
 const topic=typeof input.topic==='string'&&/^[\p{L}\p{M}\p{N}_]{1,40}$/u.test(input.topic)?input.topic:fail('Topic must be one hashtag-style word (up to 40 characters).');
 const steps=list(input.steps,1,10,'Steps').map(step);
 const redFlags=[...new Set(steps.flatMap(s=>s.kind==='flags'?s.segments.flatMap(g=>g.flag?[g.flag]:[]):[]).concat(Array.isArray(input.redFlags)?input.redFlags.filter(f=>FLAGS.includes(f)):[]))];
 const scenario={id,bands,intensity,topic,scamType:oneOf(input.scamType,SCAM_TYPES,'scam type'),channel:oneOf(input.channel,CHANNELS,'channel'),contact:str(input.contact,80,'Contact'),title:l10n(input.title,200,'Title'),intro:l10n(input.intro,600,'Intro'),steps,redFlags,explanation:l10n(input.explanation,1200,'Explanation'),needsNativeReview:input.needsNativeReview!==false};
 if(input.warning!==undefined)scenario.warning=l10n(input.warning,300,'Content note');
 if(input.boss===true)scenario.boss=true;
 return scenario;
}

export function logModeration(db,{kind,targetId,action,actor,actorName='AI screening',note='',detail={}}){
 db.prepare('INSERT INTO moderation_log(id,kind,target_id,action,actor_id,actor_name,note,detail,created) VALUES (?,?,?,?,?,?,?,?,?)')
  .run(randomUUID(),kind,targetId,action,actor?.id??null,actor?.name??actorName,note,JSON.stringify(detail),Date.now());
}
// Called after screening; only non-approved verdicts are logged so the log shows what the AI flagged and why.
export function logScreening(db,post){
 const c=post.check;if(!c||c.verdict==='approved')return;
 logModeration(db,{kind:'post',targetId:post.id,action:`ai_${c.verdict}`,actor:null,note:c.summary||post.flagReason||'',detail:{risk:c.risk,labels:c.labels||[],reasons:c.reasons||[],repost:!!post.repostOf}});
}

const staffRow=row=>({id:row.id,status:row.status,bands:JSON.parse(row.bands),intensity:row.intensity,topic:row.topic,title:{en:row.title_en,lo:row.title_lo},source:row.source,createdAt:row.created,updatedAt:row.updated,reviewedBy:row.reviewed_by?{id:row.reviewed_by,name:row.reviewer_name||'Former staff member'}:null,reviewedAt:row.reviewed_at,reviewNote:row.review_note||'',scenario:JSON.parse(row.data)});
const STAFF_SELECT='SELECT s.*,u.name reviewer_name FROM scenarios s LEFT JOIN users u ON u.id=s.reviewed_by';

export function createScenario(db,input,user,source='expert'){
 const scenario=validateScenario(input);
 if(db.prepare('SELECT id FROM scenarios WHERE id=?').get(scenario.id))fail('A scenario with this id already exists.',409);
 const now=Date.now();
 db.prepare('INSERT INTO scenarios(id,status,bands,intensity,topic,title_en,title_lo,data,source,created_by,created,updated) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)')
  .run(scenario.id,'draft',JSON.stringify(scenario.bands),scenario.intensity,scenario.topic,scenario.title.en,scenario.title.lo,JSON.stringify(scenario),source,user?.id??null,now,now);
 logModeration(db,{kind:'scenario',targetId:scenario.id,action:'submitted',actor:user,actorName:'AI draft generator',note:'',detail:{source,bands:scenario.bands,intensity:scenario.intensity}});
 return staffRow(db.prepare(`${STAFF_SELECT} WHERE s.id=?`).get(scenario.id));
}

export function reviewScenario(db,id,status,note,user){
 const row=db.prepare('SELECT * FROM scenarios WHERE id=?').get(id);
 if(!row)fail('Scenario not found.',404);
 if(!(NEXT[row.status]||[]).includes(status))fail(row.status==='draft'&&status==='live'?'Approve the scenario before making it live.':`A ${row.status} scenario cannot move to ${status}.`,409);
 const now=Date.now();
 db.prepare('UPDATE scenarios SET status=?,reviewed_by=?,reviewed_at=?,review_note=?,updated=? WHERE id=?').run(status,user.id,now,note,now,id);
 logModeration(db,{kind:'scenario',targetId:id,action:status,actor:user,note,detail:{from:row.status}});
 return staffRow(db.prepare(`${STAFF_SELECT} WHERE s.id=?`).get(id));
}

export const staffScenarios=db=>db.prepare(`${STAFF_SELECT} ORDER BY CASE s.status WHEN 'draft' THEN 0 WHEN 'approved' THEN 1 WHEN 'live' THEN 2 ELSE 3 END, s.updated DESC`).all().map(staffRow);

// Built-in scenarios ship inside the app, so the server cannot delete them; retiring an id tells every app
// to hide it. Restoring brings it back. Server-managed scenarios use their own status instead.
export function setBundledRetired(db,id,retired,note,user){
 if(typeof id!=='string'||!/^[a-z0-9-]{3,80}$/.test(id))fail('Choose a valid built-in scenario id.');
 if(db.prepare('SELECT id FROM scenarios WHERE id=?').get(id))fail('This scenario is managed here: use its status (take offline or reject) instead.',409);
 const current=db.prepare('SELECT id FROM scenario_retirements WHERE id=?').get(id);
 if(retired===!!current)fail(retired?'This scenario is already retired.':'This scenario is not retired.',409);
 if(retired)db.prepare('INSERT INTO scenario_retirements(id,note,retired_by,retired_at) VALUES (?,?,?,?)').run(id,note,user.id,Date.now());
 else db.prepare('DELETE FROM scenario_retirements WHERE id=?').run(id);
 logModeration(db,{kind:'scenario',targetId:id,action:retired?'retired':'restored',actor:user,note,detail:{builtIn:true}});
 return staffRetired(db);
}
export const staffRetired=db=>db.prepare('SELECT r.id,r.note,r.retired_at,r.retired_by,u.name FROM scenario_retirements r LEFT JOIN users u ON u.id=r.retired_by ORDER BY r.retired_at DESC').all()
 .map(r=>({id:r.id,note:r.note,retiredAt:r.retired_at,retiredBy:{id:r.retired_by,name:r.name||'Former staff member'}}));

// Public view: live rows for one band, shaped like the app's Scenario type, plus the retired built-in ids.
// Reviewer identity and notes stay in the workspace.
export function publicScenarios(db,band){
 return {scenarios:liveScenarios(db,band),retired:db.prepare('SELECT id FROM scenario_retirements ORDER BY id').all().map(r=>r.id)};
}
export function liveScenarios(db,band){
 if(!BANDS.includes(band))fail('Choose a valid age band.');
 return db.prepare("SELECT data,reviewed_at FROM scenarios WHERE status='live' AND EXISTS (SELECT 1 FROM json_each(scenarios.bands) WHERE value=?) AND intensity<=? ORDER BY id")
  .all(band,MAX_INTENSITY[band]).map(row=>({...JSON.parse(row.data),status:'verified',verifiedBy:'Sati review team',verifiedAt:new Date(row.reviewed_at).toISOString().slice(0,10)}));
}

export function moderationLog(db,limit=200){
 return db.prepare('SELECT m.*,s.title_en scenario_title_en,s.title_lo scenario_title_lo FROM moderation_log m LEFT JOIN scenarios s ON m.kind=\'scenario\' AND s.id=m.target_id ORDER BY m.created DESC LIMIT ?').all(limit)
  .map(r=>({id:r.id,kind:r.kind,targetId:r.target_id,action:r.action,actor:r.actor_id?{id:r.actor_id,name:r.actor_name}:null,actorName:r.actor_name,note:r.note,detail:JSON.parse(r.detail),createdAt:r.created,title:r.scenario_title_en?{en:r.scenario_title_en,lo:r.scenario_title_lo}:null}));
}

// Demo drafts so the review tab has real work on a fresh database. They start as drafts like any submission.
export function seedScenarioDrafts(db,drafts){
 if(db.prepare('SELECT COUNT(*) n FROM scenarios').get().n)return;
 db.exec('BEGIN');
 try{for(const d of drafts)createScenario(db,d,null,'ai_draft');db.exec('COMMIT');}catch(error){db.exec('ROLLBACK');throw error;}
}
