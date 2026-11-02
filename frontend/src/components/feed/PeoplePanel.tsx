import {useEffect,useState} from 'react';
import {ArrowLeft} from 'lucide-react';
import {request} from '../../lib/api';
import type {Author,Post,Lang} from '../../types';
export type PeopleTarget={kind:'person'|'activity';id:string};
type Profile={person:Author;posts:Post[]};
type Activity=Record<'likes'|'helpful'|'reposts'|'shares',Author[]>;
export function PeoplePanel({target,lang,onClose,onOpenPost}:{target:PeopleTarget;lang:Lang;onClose:()=>void;onOpenPost:(id:string)=>void}){
 const [current,setCurrent]=useState(target),[data,setData]=useState<Profile|Activity|null>(null),[error,setError]=useState('');
 const [profileTab,setProfileTab]=useState<'posts'|'reposts'>('posts');
 const [tab,setTab]=useState<keyof Activity>('likes');const lo=lang==='lo';
 useEffect(()=>{let alive=true;setData(null);setError('');request<Profile|Activity>(current.kind==='person'?`/people/${current.id}`:`/posts/${current.id}/activity`).then(value=>{if(alive)setData(value);}).catch(e=>{if(alive)setError(e.message);});return()=>{alive=false;};},[current.kind,current.id]);
 const navigate=(next:PeopleTarget)=>{setData(null);setError('');setProfileTab('posts');setCurrent(next);};
 const labels={likes:lo?'ມັກ':'Likes',helpful:lo?'ຊ່ວຍໃຫ້ປອດໄພ':'Helped',reposts:lo?'ແຊຣ໌ໂພສ':'Reposts',shares:lo?'ແບ່ງປັນ':'Shares'};
 const profile=current.kind==='person'?data as Profile|null:null;
 const activity=current.kind==='activity'?data as Activity|null:null;
 return <section role="dialog" aria-modal="true" aria-label={lo?'ຜູ້ໃຊ້':'People'} className="phone-modal fixed inset-0 z-[60] bg-background flex flex-col">
  <header className="flex gap-3 items-center border-b border-border p-3"><button className="touch-target" aria-label={lo?'ກັບ':'Back'} onClick={()=>current.kind==='person'&&target.kind==='activity'?navigate(target):onClose()}><ArrowLeft/></button><h2 className="font-semibold">{current.kind==='person'?(lo?'ໂປຣໄຟລ໌':'Profile'):(lo?'ການມີສ່ວນຮ່ວມ':'People who interacted')}</h2></header>
  <div className="flex-1 overflow-y-auto p-4 font-lao">{error&&<p role="alert">{error}</p>}{!data&&!error&&<p>{lo?'ກຳລັງໂຫຼດ…':'Loading…'}</p>}
   {profile&&<><div className="flex items-center gap-3"><span className="w-14 h-14 rounded-full text-white flex items-center justify-center font-bold" style={{background:profile.person.color}}>{profile.person.initials}</span><div><h3 className="font-bold text-lg">{profile.person.name}</h3><p className="text-muted-foreground text-sm">{profile.person.handle}</p></div></div><h3 className="font-semibold mt-6 mb-3">{lo?'ໂພສຂອງຜູ້ໃຊ້':'Their posts'} · {profile.posts.length}</h3><div className="flex gap-3 my-3"><button className="touch-target text-primary" onClick={()=>setProfileTab('posts')}>{lo?'ໂພສ':'Posts'} {profile.posts.filter(p=>!p.repostOf).length}</button><button className="touch-target text-primary" onClick={()=>setProfileTab('reposts')}>{lo?'ແຊຣ໌ໂພສ':'Reposts'} {profile.posts.filter(p=>p.repostOf).length}</button></div>{profile.posts.filter(p=>profileTab==='posts'?!p.repostOf:!!p.repostOf).map(p=><button key={p.id} className="block w-full text-left border-b border-border py-4" onClick={()=>{onClose();onOpenPost(p.id);}}>{p.repostOf&&<span className="text-xs text-primary">↻ {lo?'ແຊຣ໌ໂພສ':'Reposted'} · {p.originalPost?.author.name}</span>}<p className="whitespace-pre-wrap text-sm line-clamp-4">{p.contentLanguage==='lo'?(p.contentLo||p.content):p.content}</p><p className="text-xs text-muted-foreground mt-2">♡ {p.likes} · {lo?'ຄຳຄິດເຫັນ':'Comments'} {p.comments} · ↻ {p.reposts}</p></button>)}{!profile.posts.length&&<p>{lo?'ຍັງບໍ່ມີໂພສ':'No posts yet.'}</p>}</>}
   {activity&&<><div className="flex gap-1 mb-4">{(Object.keys(labels) as (keyof Activity)[]).map(key=><button key={key} onClick={()=>setTab(key)} className={`flex-1 min-h-11 text-xs rounded-lg ${tab===key?'bg-primary/10 text-primary':'text-muted-foreground'}`}>{labels[key]} {activity[key].length}</button>)}</div>{activity[tab].map(person=><button key={person.id} onClick={()=>navigate({kind:'person',id:person.id!})} className="w-full flex items-center gap-3 py-3 text-left border-b border-border"><span style={{background:person.color}} className="w-10 h-10 rounded-full text-white flex items-center justify-center text-sm">{person.initials}</span><span><strong className="text-sm">{person.name}</strong><span className="block text-xs text-muted-foreground">{person.handle}</span></span></button>)}{!activity[tab].length&&<p className="text-sm text-muted-foreground">{lo?'ຍັງບໍ່ມີການມີສ່ວນຮ່ວມ':'No activity yet.'}</p>}</>}
  </div>
 </section>;
}
