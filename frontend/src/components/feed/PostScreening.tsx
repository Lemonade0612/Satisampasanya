import type {Post,Lang} from "../../types";
import {CheckResultCard} from "../safety/CheckResultCard";
export function PostScreening({post,lang}:{post:Post;lang:Lang}){
 const lo=(post.check?.language||post.contentLanguage||lang)==='lo';
 if(post.review)return <section className="mt-3 font-lao text-sm"><span className={`inline-block rounded-full ${post.state==='rejected'?'bg-red-50 text-red-700':'bg-emerald-50 text-emerald-700'} px-3 py-1 text-xs`}>{post.state==='rejected'?(lo?'ຜູ້ກວດປະຕິເສດໂພສ':'Rejected by a reviewer'):(lo?'ກວດຄືນໂດຍຜູ້ກວດແລ້ວ':'Reviewed by a reviewer')}</span><p className="mt-2 whitespace-pre-wrap">{post.review.note}</p>{post.check&&<details className="mt-2"><summary>{lo?'ຜົນກວດ AI ກ່ອນໜ້າ':'Earlier AI assessment'}</summary><CheckResultCard result={post.check}/></details>}</section>;
 if(post.check)return <CheckResultCard result={post.check}/>;
 return <p className="mt-3 text-xs text-muted-foreground font-lao">{lo?'ລໍຖ້າການກວດສອບ':'Awaiting a check'}</p>;
}
