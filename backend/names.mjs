// Display names are free text and unverified, so members cannot take names that read as the
// platform or an authority. Staff accounts are named by administrators and are not checked here.
const CONFUSABLE={'0':'o','1':'i','3':'e','4':'a','5':'s','7':'t','@':'a','$':'s','а':'a','е':'e','о':'o','р':'p','с':'c','ѕ':'s','і':'i','т':'t','ı':'i'};
export function reservedName(name){
 const folded=name.normalize('NFKC').toLowerCase().replace(/[​-‍⁠﻿]/g,'');
 if(/ສະຕິ|ທາງການ/u.test(folded))return true; // "Sati" and "official" in Lao
 const latin=[...folded.normalize('NFD').replace(/\p{M}/gu,'')].map(char=>CONFUSABLE[char]??char).join('');
 // Join runs of single letters so "S.A.T.I" or "s a t i" read as one word.
 const words=[];let run='';
 for(const token of latin.split(/[^\p{L}]+/u).filter(Boolean)){if(token.length===1){run+=token;continue;}if(run)words.push(run);run='';words.push(token);}
 if(run)words.push(run);
 return words.includes('sati')||/official|satisampasanya/.test(latin.replace(/[^\p{L}]/gu,''));
}
