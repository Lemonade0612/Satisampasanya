import {readFileSync,writeFileSync} from 'node:fs';
import {checkContent,askSafety,classifyIntent} from '../backend/safety/checker.mjs';
import {modelConfigured} from '../backend/safety/model.mjs';
if(!modelConfigured()){console.error('Put your private provider API key in .env.local first. No model acceptance checks have been run.');process.exit(1);}
const entries=JSON.parse(readFileSync(new URL('./demo/community-posts.json',import.meta.url),'utf8'));
const report=[];
for(const entry of entries){
 try{
  const result=await checkContent(entry.text);
  report.push({id:entry.id,expected:entry._expect,actual:result,verdictMatch:result.verdict===entry._expect.verdict,evidenceValid:result.reasons.every(reason=>entry.text.includes(reason.evidence)),languageValid:result.language===entry.lang});
 }catch(error){report.push({id:entry.id,verdictMatch:false,error:error.message});}
}
const question='ຖ້າວ່າຂ້ອຍຢາກໂອນເງິນໃຫ້ລູກ ເພາະລາວໂທມາເລື່ອງການພະນັນນີ້ ຂ້ອຍຄວນໃຫ້ບໍ?';
let ask;
try{const intent=await classifyIntent(question);const answer=intent==='ask'?await askSafety(question):null;ask={intent,answer,passed:intent==='ask'&&answer?.language==='lo'&&answer.steps.length>=2};}catch(error){ask={passed:false,error:error.message};}
const matched=report.filter(row=>row.verdictMatch).length;
writeFileSync('backend/data/checker-acceptance.json',JSON.stringify({posts:report,ask,matched,total:13},null,2)+'\n',{mode:0o600});
console.log(`${matched}/13 real verdict matches. Lao Ask check: ${ask.passed?'passed':'needs attention'}. Results are saved privately in backend/data/checker-acceptance.json.`);
if(matched!==13||!ask.passed||report.some(row=>!row.evidenceValid||!row.languageValid))process.exitCode=1;
