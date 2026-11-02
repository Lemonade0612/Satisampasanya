import type {CheckResult} from '../../types';
export function CheckResultCard({result}:{result:CheckResult}){
 const lo=result.language==='lo';
 const colours={approved:{color:'#157f3b',background:'#e8f7ee'},caution:{color:'#8a4b00',background:'#fff1da'},needs_expert:{color:'#c0292b',background:'#fdeaea'}};
 const title=result.verdict==='approved'?(lo?'ກວດໂດຍ AI ແລ້ວ ✓':'Checked by AI ✓'):result.verdict==='needs_expert'?(lo?'ລໍຖ້າຜູ້ຊ່ຽວຊານກວດສອບ':'Under expert review'):(lo?'ຄວນປັບຂໍ້ຄວາມ':'Awaiting moderator review');
 const same=(a:string,b:string)=>a.replace(/[\s“”"'.,!?]/gu,'')===b.replace(/[\s“”"'.,!?]/gu,'');
 const reasons=result.reasons.filter((r,i,all)=>all.findIndex(other=>other.evidence===r.evidence)===i).slice(0,3);
 return <section lang={result.language} className="mt-3 text-sm font-lao break-words">
  {result.source==='training'&&<p className="mb-2 text-xs text-muted-foreground">{lo?'ຕົວຢ່າງຝຶກການກວດສອບ · ຜົນປະເມີນກຳນົດໄວ້':'Training example · preset assessment'}</p>}
  <span className="inline-block rounded-full px-3 py-1.5 text-sm font-semibold" style={colours[result.verdict]}>{title}</span>
  {result.verdict!=='approved'&&<p className="mt-2 text-xs text-red-700">{lo?'ການມັກ, ຄຳຄິດເຫັນ ແລະການແຊຣ໌ຖືກລັອກ. ເກີນ 48 ຊົ່ວໂມງຈະແຈ້ງຜູ້ກວດ ແລະຍັງລັອກໄວ້.':'Likes, comments, reposts and sharing are locked until a moderator reviews this post. Reviewers are reminded after 48 hours.'}</p>}
  {result.verdict==='approved'?<p className="mt-2 leading-relaxed">{result.summary}</p>:<details className="mt-2">
   <summary className="min-h-11 flex items-center cursor-pointer text-muted-foreground">{lo?'ເບິ່ງເຫດຜົນການກວດ':'Why this label?'}</summary>
   <p className="leading-relaxed">{result.summary}</p>
   {reasons.map((reason,index)=><div key={index} className="mt-2 pl-3 border-l-2 border-border">{!same(reason.text,reason.evidence)&&!same(reason.text,result.summary)&&<p>{reason.text}</p>}<blockquote className="mt-1 text-muted-foreground">“{reason.evidence}”</blockquote></div>)}
   {result.suggested_edit&&<p className="mt-2 rounded-xl bg-amber-50 text-amber-900 p-3">{result.suggested_edit}</p>}
  </details>}
 </section>;
}
