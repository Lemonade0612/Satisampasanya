import type {Post} from '../../../shared/types';
const names:Record<string,string>={
 profanity_only:'Profanity / bad language',harassment:'Bullying / harassment',victim_blaming:'Victim blaming',
 political_sarcasm:'Political content / sarcasm',off_topic:'Off-topic content',scam_risk:'Scam risk',
 trafficking_recruitment:'Trafficking / recruitment',phishing:'Phishing / OTP theft',impersonation:'Impersonation',
 misinformation:'Unverified claims',fear_bait:'Fear / pressure tactics',satire:'Satire',safe_tip:'Safety advice',news:'Safety news',
};
export function ModerationLabels({post}:{post:Post}){
 const labels=post.check?.labels||[];
 return <div className="moderation-labels" aria-label="Content review categories">
  <span className={`moderation-verdict ${post.check?.verdict==='caution'?'moderation-yellow':'moderation-red'}`}>
   {post.check?.verdict==='caution'?'Yellow · interactions locked':'Red · interactions locked'}
  </span>
  {post.check?.source==='training'&&<span className="moderation-category">Training example · preset assessment</span>}
  {labels.map(label=><span className="moderation-category" key={label}>{names[label]||label.replace(/_/g,' ')}</span>)}
 </div>;
}
