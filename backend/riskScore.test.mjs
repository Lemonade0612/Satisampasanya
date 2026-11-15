import test from 'node:test';
import assert from 'node:assert/strict';
import {scorePost,applyRisk,addReport,overrideRisk,hiddenByRisk,riskNeedsReview,RULES} from './riskScore.mjs';

const post=(content,extra={})=>({content,...extra});

test('a Tianjin-style "free everything" offer scores red with reasons in both languages',()=>{
 const result=scorePost(post('Winter camp in Tianjin! Free visa, free flights, free tuition and free accommodation for ages 15-35. Message us on WhatsApp.'));
 assert.equal(result.level,'red');assert.ok(result.hardRed);
 assert.ok(result.reasons.some(r=>r.rule==='free_bundle'));
 assert.ok(result.reasons.every(r=>r.en&&r.lo));
});
test('a job post with a WhatsApp-only contact scores yellow',()=>{
 const result=scorePost(post('We are hiring shop staff in Vientiane. Contact us on WhatsApp +000 for details.'));
 assert.equal(result.level,'yellow');assert.ok(!result.hardRed);
 assert.ok(result.reasons.some(r=>r.rule==='contact_messaging_only'));
});
test('a UNICEF post is green, by source id or by link domain',()=>{
 assert.equal(scorePost(post('Mental health support for young people.',{sourceId:'unicef'})).level,'green');
 const linked=scorePost(post('Child protection update',{link:'https://www.unicef.org/laos/story'}));
 assert.equal(linked.level,'green');assert.equal(linked.trustedSource,'UNICEF');
 assert.equal(scorePost(post('Child protection update',{link:'https://unicef.org.evil.example/x'})).level,'green');// no keywords, so plain green, but not trusted
 assert.equal(scorePost(post('Hiring now, contact WhatsApp',{link:'https://unicef.org.evil.example/x'})).level,'yellow');
});
test('profanity is a hard red, even from a trusted source',()=>{
 for(const sourceId of [undefined,'unicef']){
  const result=scorePost(post('this is fucking nonsense',{sourceId}));
  assert.equal(result.level,'red');assert.ok(result.hardRed);
 }
});
test('a warning about a scam is not itself red',()=>{
 const result=scorePost(post('WARNING: fake job ads promise free visa and free flights and ask you to pay a deposit first. Do not send money.'));
 assert.notEqual(result.level,'red');
});
test('3 user reports turn a green post yellow, 5 hide it, admin override is logged',()=>{
 const p=applyRisk(post('Tips for keeping your account safe.'));
 assert.equal(p.risk_level,'green');assert.equal(p.flag_count,0);
 addReport(p,'u1','scam');addReport(p,'u2','fake_job');
 assert.equal(p.risk_level,'green');assert.ok(!riskNeedsReview(p));
 addReport(p,'u3','scam');
 assert.equal(p.risk_level,'yellow');assert.equal(p.flagged_by,'user');assert.ok(riskNeedsReview(p));assert.ok(!hiddenByRisk(p));
 addReport(p,'u4','scam');addReport(p,'u5','scam');
 assert.ok(hiddenByRisk(p));
 assert.throws(()=>addReport(p,'u5','scam'),/already reported/);
 assert.throws(()=>addReport(p,'u6','spam'),/reason/);
 overrideRisk(p,{level:'green',note:'checked, fine'},{id:'a1',name:'Admin'});
 assert.equal(p.risk_level,'green');assert.equal(p.flagged_by,'admin');assert.ok(!hiddenByRisk(p));
 assert.equal(p.risk_log.length,1);assert.equal(p.risk_log[0].from,'yellow');
 assert.equal(applyRisk(p).risk_level,'green');// rescoring never undoes an admin decision
});
test('a red post is hidden unless an admin publishes it as a warning example',()=>{
 const p=applyRisk(post('Free visa, free flights and free tuition. Pay a deposit first.'));
 assert.equal(p.risk_level,'red');assert.ok(hiddenByRisk(p));assert.ok(riskNeedsReview(p));
 overrideRisk(p,{level:'red',warningExample:true},{id:'a1',name:'Admin'});
 assert.ok(!hiddenByRisk(p));assert.equal(p.warningExample,true);
});
test('rules file is well formed',()=>{
 const ids=new Set();
 for(const rule of RULES.rules){assert.ok(!ids.has(rule.id));ids.add(rule.id);assert.ok(rule.reason.en&&rule.reason.lo);}
});

test('every seed post scores the colour it is meant to teach',async()=>{
 const {readFileSync}=await import('node:fs');
 const entries=JSON.parse(readFileSync(new URL('../scripts/demo/risk-seed-posts.json',import.meta.url),'utf8'));
 assert.equal(entries.filter(e=>e.example).length,4);// Tianjin plus one fictional demo per colour
 for(const entry of entries){
  const result=applyRisk({content:entry.en,contentLo:entry.lo,sourceId:entry.sourceId});
  assert.equal(result.risk_level,entry.expect,entry.id);
 }
});
