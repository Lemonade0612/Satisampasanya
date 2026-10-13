import type {CheckResult} from '../../types';
export function CheckResultCard({result}:{result:CheckResult}){
 const lo=result.language==='lo';
 const colours={low:{color:'#157f3b',background:'#e8f7ee'},medium:{color:'#8a4b00',background:'#fff1da'},high:{color:'#c0292b',background:'#fdeaea'}};
 const title=result.verdict==='approved'?(lo?'ກວດໂດຍ AI ແລ້ວ ✓':'Checked by AI ✓'):result.verdict==='needs_expert'?(lo?'ພາຍໃຕ້ການກວດສອບຂອງຜູ້ຊ່ຽວຊານ':'Under expert review'):(lo?'ຄວນປັບຂໍ້ຄວາມ':'Consider an edit');
 return <section lang={result.language} className="mt-3 text-sm font-lao">
  <span className="inline-block rounded-full px-3 py-1.5 text-sm font-semibold" style={colours[result.verdict==='approved'?'low':result.verdict==='needs_expert'?'high':'medium']}>{title}</span>
  <p className="mt-2 leading-relaxed">{result.summary}</p>
  {result.verdict!=='approved'&&result.reasons.slice(0,3).map((reason,index)=><div key={index} className="mt-2 pl-3 border-l-2 border-border"><p>{reason.text}</p><blockquote className="mt-1 text-muted-foreground">“{reason.evidence}”</blockquote></div>)}
  {result.suggested_edit&&<p className="mt-2 rounded-xl bg-amber-50 text-amber-900 p-3">{result.suggested_edit}</p>}
 </section>;
}
