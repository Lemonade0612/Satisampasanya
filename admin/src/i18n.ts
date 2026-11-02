import {createContext,useContext} from 'react';
export type Lang='en'|'lo';
export const LangContext=createContext<Lang>('en');
export const useLang=()=>useContext(LangContext);
const LO_DAYS=['ວັນອາທິດ','ວັນຈັນ','ວັນອັງຄານ','ວັນພຸດ','ວັນພະຫັດ','ວັນສຸກ','ວັນເສົາ'],LO_MONTHS=['ມັງກອນ','ກຸມພາ','ມີນາ','ເມສາ','ພຶດສະພາ','ມິຖຸນາ','ກໍລະກົດ','ສິງຫາ','ກັນຍາ','ຕຸລາ','ພະຈິກ','ທັນວາ'];
// Browsers without Lao locale data fall back to English, so Lao dates are built by hand.
export const longDate=(d:Date,lang:Lang)=>lang==='lo'?`${LO_DAYS[d.getDay()]} ${d.getDate()} ${LO_MONTHS[d.getMonth()]}`:d.toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long'});
export const shortDate=(d:Date,lang:Lang)=>lang==='lo'?`${d.getDate()} ${LO_MONTHS[d.getMonth()]}`:d.toLocaleDateString('en-US',{month:'short',day:'numeric'});
export const dayDate=(d:Date,lang:Lang)=>lang==='lo'?`${LO_DAYS[d.getDay()]} ${d.getDate()} ${LO_MONTHS[d.getMonth()]}`:d.toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'});
// Waiting time reads in hours up to the 48h target, then in days.
export const waitLabel=(hours:number,lang:Lang)=>{const [d,h,m]=lang==='lo'?[' ມື້',' ຊມ',' ນທ']:['d','h','m'];return hours<1?`${Math.max(1,Math.round(hours*60))}${m}`:hours<=48?`${Math.floor(hours)}${h}`:`${Math.floor(hours/24)}${d} ${Math.floor(hours%24)}${h}`;};
export const waitWords=(hours:number,lang:Lang)=>lang==='lo'?(hours<=48?`${Math.floor(hours)} ຊົ່ວໂມງ`:`${Math.floor(hours/24)} ມື້`):(hours<=48?`${Math.floor(hours)} hours`:`${Math.floor(hours/24)} days`);
const en={
 overview:'Overview',queue:'Review queue',posts:'All posts',users:'People & access',brandSub:'Safety desk · Admin',openApp:'Open user app',signOut:'Sign out',waiting:(n:number)=>`${n} waiting`,
 live:'Live · updated',autoRefresh:'auto-refresh 15s',offline:'Connection needs attention',connecting:'Connecting…',refresh:'Refresh',refreshing:'Refreshing',light:'Switch to light theme',dark:'Switch to dark theme',language:'Language',
 morning:'Good morning.',afternoon:'Good afternoon.',evening:'Good evening.',heroPre:"Here's the ",heroEm:'safety desk',heroPost:'.',
 startReviewing:'Start reviewing →',queueClear:'Queue clear. Nothing is waiting for review.',
 alertAll:(n:number,w:string)=>`${n===1?'The only open post is':`All ${n} open posts are`} past or near the 48-hour target. Oldest has waited ${w}.`,
 alertSome:(b:number,n:number,w:string)=>`${b} of ${n} open ${n===1?'post':'posts'} ${b===1?'is':'are'} past or near the 48-hour target. Oldest has waited ${w}.`,
 alertNone:(n:number,w:string)=>`${n} open ${n===1?'post':'posts'}, all within the 48-hour target. Oldest has waited ${w}.`,
 kpis:'Key figures',backlog:'Open backlog',posts24:'Posts · last 24h',flagRate:'Flag rate · last 24h',median:'Median time to decision',
 clear:'Queue clear',noNew:'No new posts',noDecisions:'No decisions yet',nearTarget:(n:number)=>`${n} past or near the 48h target`,notNear:'Nothing near the 48h target',
 totals:(p:number,u:number)=>`${p} total · ${u} members`,sentReview:(n:number)=>`${n} posts sent to review`,decisions:(n:number)=>`${n} decisions recorded`,
 activity:'Posted vs. reviewed',activitySub:'Per day, last 14 days',posted:'Posted',reviewed:'Reviewed',
 insNone:'No posts or reviews in the last 14 days.',insNoReview:(p:number)=>`${p} posts arrived and none were reviewed in the last 14 days.`,insPace:(r:number,p:number)=>`Reviews kept pace: ${r} decisions for ${p} new posts.`,insBehind:(n:number)=>`Reviews are falling behind: ${n} more posts arrived than were reviewed.`,
 topics:'Flagged posts by topic',topicsSub:(n:number)=>`${n} flagged and resolved posts`,topicNames:['Job scam','Investment','Trafficking','Romance','Other'],
 tip:'Most flagged posts land in "Other", so topic trends are hard to see. Encourage posters to add a topic tag such as #job, #invest or #romance.',
 calendar:'Posts per day',calendarSub:(n:number)=>`Last 3 weeks · ${n} posts`,weekdays:['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],upcoming:'upcoming',postCount:(n:number)=>`${n} ${n===1?'post':'posts'}`,
 busiest:'Busiest day',noPostsYet:'No posts yet',nothingInRange:'Nothing in this range',quiet:'Quiet streak',days:(n:number)=>`${n} ${n===1?'day':'days'}`,longestQuiet:'Longest run with no posts',everyDay:'Posts every day',fewer:'Fewer',more:'More',
 workload:'Review workload',workloadSub:'One square per open post',red:'Red',watch:'Watch',queueEmpty:'No open posts. The queue is clear.',urgent:'Urgent',standard:'Standard',completed:'Completed',
 noReviewers:'No reviewer activity yet',noReviewersSub:'Decisions will show here once someone saves a review.',invite:'Invite a reviewer →',reviews:(n:number)=>`${n} reviews`,
 eyes:'Needs eyes first',eyesSub:'Red before Watch, then the longest wait',seeAll:(n:number)=>`See all ${n} →`,caughtUp:'All caught up. No flagged posts are waiting.',rank:(n:number)=>`Rank ${n}`,
 safeTip:'Likely a safety tip — quick approve?',pastTarget:(w:string)=>`${w} past target`,left:(w:string)=>`${w} left`,review:'Review',viewerCannot:'Insight viewers cannot save reviews',
};
const lo:typeof en={
 overview:'ພາບລວມ',queue:'ຄິວກວດສອບ',posts:'ໂພສທັງໝົດ',users:'ຜູ້ໃຊ້ ແລະ ສິດ',brandSub:'ໂຕະຄວາມປອດໄພ · ຜູ້ດູແລ',openApp:'ເປີດແອັບຜູ້ໃຊ້',signOut:'ອອກຈາກລະບົບ',waiting:n=>`ລໍຖ້າ ${n}`,
 live:'ສົດ · ອັບເດດ',autoRefresh:'ໂຫຼດໃໝ່ທຸກ 15 ວິນາທີ',offline:'ການເຊື່ອມຕໍ່ມີບັນຫາ',connecting:'ກຳລັງເຊື່ອມຕໍ່…',refresh:'ໂຫຼດໃໝ່',refreshing:'ກຳລັງໂຫຼດ',light:'ປ່ຽນເປັນໂໝດສະຫວ່າງ',dark:'ປ່ຽນເປັນໂໝດມືດ',language:'ພາສາ',
 morning:'ສະບາຍດີຕອນເຊົ້າ.',afternoon:'ສະບາຍດີຕອນບ່າຍ.',evening:'ສະບາຍດີຕອນແລງ.',heroPre:'ນີ້ແມ່ນ',heroEm:'ໂຕະຄວາມປອດໄພ',heroPost:'',
 startReviewing:'ເລີ່ມກວດສອບ →',queueClear:'ຄິວວ່າງ. ບໍ່ມີໂພສລໍຖ້າກວດສອບ.',
 alertAll:(n,w)=>`ໂພສທີ່ເປີດຢູ່ທັງໝົດ ${n} ໂພສ ເກີນ ຫຼື ໃກ້ເກີນເປົ້າໝາຍ 48 ຊົ່ວໂມງ. ໂພສເກົ່າສຸດລໍຖ້າມາ ${w}.`,
 alertSome:(b,n,w)=>`${b} ໃນ ${n} ໂພສທີ່ເປີດຢູ່ ເກີນ ຫຼື ໃກ້ເກີນເປົ້າໝາຍ 48 ຊົ່ວໂມງ. ໂພສເກົ່າສຸດລໍຖ້າມາ ${w}.`,
 alertNone:(n,w)=>`ມີ ${n} ໂພສທີ່ເປີດຢູ່, ທັງໝົດຢູ່ໃນເປົ້າໝາຍ 48 ຊົ່ວໂມງ. ໂພສເກົ່າສຸດລໍຖ້າມາ ${w}.`,
 kpis:'ຕົວເລກຫຼັກ',backlog:'ໂພສຄ້າງກວດ',posts24:'ໂພສ · 24 ຊົ່ວໂມງ',flagRate:'ອັດຕາການແຈ້ງເຕືອນ · 24 ຊົ່ວໂມງ',median:'ເວລາຕັດສິນ (ຄ່າກາງ)',
 clear:'ຄິວວ່າງ',noNew:'ບໍ່ມີໂພສໃໝ່',noDecisions:'ຍັງບໍ່ມີການຕັດສິນ',nearTarget:n=>`${n} ເກີນ ຫຼື ໃກ້ເກີນ 48 ຊົ່ວໂມງ`,notNear:'ບໍ່ມີໂພສໃກ້ເກີນ 48 ຊົ່ວໂມງ',
 totals:(p,u)=>`ທັງໝົດ ${p} · ສະມາຊິກ ${u}`,sentReview:n=>`ສົ່ງກວດ ${n} ໂພສ`,decisions:n=>`ບັນທຶກການຕັດສິນ ${n}`,
 activity:'ໂພສໃໝ່ ທຽບກັບ ກວດແລ້ວ',activitySub:'ລາຍວັນ, 14 ມື້ຜ່ານມາ',posted:'ໂພສໃໝ່',reviewed:'ກວດແລ້ວ',
 insNone:'ບໍ່ມີໂພສ ຫຼື ການກວດໃນ 14 ມື້ຜ່ານມາ.',insNoReview:p=>`ມີໂພສໃໝ່ ${p} ໂພສ ແຕ່ຍັງບໍ່ໄດ້ກວດຈັກໂພສໃນ 14 ມື້ຜ່ານມາ.`,insPace:(r,p)=>`ກວດທັນ: ຕັດສິນ ${r} ຈາກໂພສໃໝ່ ${p}.`,insBehind:n=>`ກວດບໍ່ທັນ: ໂພສໃໝ່ຫຼາຍກວ່າທີ່ກວດ ${n} ໂພສ.`,
 topics:'ໂພສທີ່ຖືກແຈ້ງເຕືອນ ຕາມຫົວຂໍ້',topicsSub:n=>`${n} ໂພສທີ່ຖືກແຈ້ງເຕືອນ ແລະ ແກ້ໄຂແລ້ວ`,topicNames:['ວຽກຫຼອກລວງ','ການລົງທຶນ','ການຄ້າມະນຸດ','ຄວາມຮັກອອນລາຍ','ອື່ນໆ'],
 tip:'ໂພສສ່ວນຫຼາຍຢູ່ໃນ "ອື່ນໆ", ຈຶ່ງເບິ່ງແນວໂນ້ມຍາກ. ແນະນຳໃຫ້ຜູ້ໂພສໃສ່ແທັກຫົວຂໍ້ ເຊັ່ນ #job, #invest ຫຼື #romance.',
 calendar:'ໂພສຕໍ່ມື້',calendarSub:n=>`3 ອາທິດຜ່ານມາ · ${n} ໂພສ`,weekdays:['ຈ','ອ','ພ','ພຫ','ສຸ','ສ','ອາ'],upcoming:'ຍັງບໍ່ຮອດ',postCount:n=>`${n} ໂພສ`,
 busiest:'ມື້ທີ່ມີໂພສຫຼາຍສຸດ',noPostsYet:'ຍັງບໍ່ມີໂພສ',nothingInRange:'ບໍ່ມີໃນຊ່ວງນີ້',quiet:'ຊ່ວງງຽບ',days:n=>`${n} ມື້`,longestQuiet:'ຊ່ວງທີ່ບໍ່ມີໂພສຍາວສຸດ',everyDay:'ມີໂພສທຸກມື້',fewer:'ໜ້ອຍ',more:'ຫຼາຍ',
 workload:'ວຽກກວດສອບ',workloadSub:'ໜຶ່ງຫ່ອງ ຕໍ່ ໜຶ່ງໂພສທີ່ເປີດຢູ່',red:'ແດງ',watch:'ເຝົ້າລະວັງ',queueEmpty:'ບໍ່ມີໂພສເປີດຢູ່. ຄິວວ່າງ.',urgent:'ດ່ວນ',standard:'ທົ່ວໄປ',completed:'ສຳເລັດ',
 noReviewers:'ຍັງບໍ່ມີຜູ້ກວດສອບ',noReviewersSub:'ການຕັດສິນຈະສະແດງຢູ່ນີ້ ເມື່ອມີຄົນບັນທຶກການກວດ.',invite:'ເຊີນຜູ້ກວດສອບ →',reviews:n=>`ກວດ ${n} ໂພສ`,
 eyes:'ຄວນເບິ່ງກ່ອນ',eyesSub:'ແດງກ່ອນເຝົ້າລະວັງ, ແລ້ວລໍຖ້າດົນສຸດ',seeAll:n=>`ເບິ່ງທັງໝົດ ${n} →`,caughtUp:'ກວດໝົດແລ້ວ. ບໍ່ມີໂພສລໍຖ້າ.',rank:n=>`ອັນດັບ ${n}`,
 safeTip:'ອາດເປັນຄຳແນະນຳຄວາມປອດໄພ — ອະນຸມັດໄວ?',pastTarget:w=>`ເກີນເປົ້າໝາຍ ${w}`,left:w=>`ເຫຼືອ ${w}`,review:'ກວດສອບ',viewerCannot:'ຜູ້ເບິ່ງຂໍ້ມູນບໍ່ສາມາດບັນທຶກການກວດ',
};
export const strings=(lang:Lang)=>lang==='lo'?lo:en;
export const useT=()=>strings(useLang());
