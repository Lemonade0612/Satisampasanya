import type {Post,Lang} from '../../types';
export function CommunityScore({post,lang}:{post:Post;lang:Lang}){
 const rank=post.communityRanking;
 if(!rank?.eligible)return null;
 return <details className="mt-3 text-xs font-lao text-emerald-700 dark:text-emerald-300">
  <summary className="min-h-11 flex items-center cursor-pointer gap-1">↗ {lang==='lo'?'ຄະແນນປະໂຫຍດຕໍ່ຊຸມຊົນ':'Community usefulness'} · {rank.score}</summary>
  <p className="leading-relaxed">{lang==='lo'?'ການກວດຄືນ':'Review'} {rank.parts.review} · {lang==='lo'?'ຄວາມປອດໄພ':'Safety'} {rank.parts.safety} · {lang==='lo'?'ການມີສ່ວນຮ່ວມ':'Engagement'} {rank.parts.engagement}</p>
  <p className="mt-1 text-muted-foreground">{lang==='lo'?'ການມັກແລະແຊຣ໌ບໍ່ໄດ້ພິສູດວ່າຂໍ້ມູນເປັນຄວາມຈິງ.':'Likes and shares do not prove a claim is true.'}</p>
 </details>;
}
