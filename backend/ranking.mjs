// Engagement is useful reach, never evidence that a claim is true.
export function communityRanking(post,{likes=0,helpful=0,commenters=0,reposters=0,createdAt=Date.now(),now=Date.now()}={}){
 const approvedReview=post.review&&['clean','confirmed'].includes(post.review.state);
 const eligible=!post.frozen&&post.state!=='false'&&(approvedReview||post.check?.verdict==='approved');
 const review=approvedReview?30:0;
 const safety=post.check?.verdict==='approved'&&post.check.on_topic?20:0;
 const engagement=Math.min(30,Math.round(4*Math.log1p(likes)+6*Math.log1p(helpful)+3*Math.log1p(commenters)+4*Math.log1p(reposters)));
 const score=eligible?Math.min(100,review+safety+engagement):0;
 const ageHours=Math.max(0,(now-createdAt)/3600000);
 return {eligible,score,rank:eligible?(score+10)/Math.pow(1+ageHours/24,1.2):0,parts:{review:eligible?review:0,safety:eligible?safety:0,engagement:eligible?engagement:0}};
}
