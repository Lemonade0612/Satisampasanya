import type {Lang} from '../../types';
export type CheckStage='read'|'links'|'patterns'|'verdict';
const stages=[
 {key:'read',en:'Reading the post',lo:'ອ່ານຂໍ້ຄວາມ'},
 {key:'links',en:'Checking links & numbers',lo:'ກວດລິ້ງ ແລະ ເບີໂທ'},
 {key:'patterns',en:'Comparing scam patterns',lo:'ປຽບທຽບຮູບແບບການຫຼອກລວງ'},
 {key:'verdict',en:'Writing verdict',lo:'ສະຫຼຸບຜົນ'}
];
export function CheckProgress({stage,done=false,lang}:{stage:CheckStage;done?:boolean;lang:Lang}){
 const index=Math.max(0,stages.findIndex(value=>value.key===stage));
 const percent=done?100:Math.round((index+.5)/stages.length*100);
 return <div role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100} aria-label={lang==='lo'?'AI ກຳລັງກວດສອບ':'AI is checking'} className="rounded-xl border border-border p-3">
  <div className="flex justify-between text-sm"><b>{done?(lang==='lo'?'AI ກວດແລ້ວ':'Checked by AI'):(lang==='lo'?'AI ກຳລັງກວດສອບ':'AI is checking')}</b><span>{percent}%</span></div>
  <div className="h-1.5 rounded-full bg-[#e6e3f2] overflow-hidden my-2"><i className="block h-full bg-[#5B2DC8] transition-[width] duration-300" style={{width:percent+'%'}}/></div>
  <small>{done?'4/4 ✓':stages[index][lang]}</small>
 </div>;
}
