import { useEffect, useState } from 'react';
import { ArrowLeft, Send } from 'lucide-react';
import { api, API_BASE } from '../../lib/api';
import { T } from '../../lib/translations';
import type { Comment, Post, Lang } from '../../types';

export function CommentsModal({postId,posts,lang,onClose,onAddComment}: {postId:string|null;posts:Post[];lang:Lang;onClose:()=>void;onAddComment:(id:string,text:string)=>Promise<void>}) {
  const post=posts.find(p=>p.id===postId),t=T[lang];
  const [comments,setComments]=useState<Comment[]>([]),[reply,setReply]=useState(''),[error,setError]=useState(''),[busy,setBusy]=useState(false);
  useEffect(()=>{
    if(!postId)return;let alive=true,revision=0;
    const load=async()=>{const r=++revision;try{const rows=await api.comments(postId);if(alive&&r===revision){setComments(rows);setError('');}}catch(e){if(alive)setError((e as Error).message);}};
    void load();const stream=new EventSource(API_BASE+'/events');stream.addEventListener('change',load);
    return()=>{alive=false;stream.close();};
  },[postId]);
  if(!post)return null;
  const submit=async()=>{if(!reply.trim()||busy)return;setBusy(true);setError('');try{await onAddComment(post.id,reply.trim());setReply('');setComments(await api.comments(post.id));}catch(e){setError((e as Error).message);}finally{setBusy(false);}};
  return <section role="dialog" aria-modal="true" aria-label={lang==='lo'?'ຄຳຄິດເຫັນ':'Comments'} className="phone-modal fixed inset-0 z-50 flex flex-col bg-background">
    <header className="flex items-center gap-3 px-4 py-2 border-b border-border shrink-0"><button onClick={onClose} aria-label={t.back} className="touch-target"><ArrowLeft size={22}/></button><h2 className="font-semibold">{lang==='lo'?'ຄຳຄິດເຫັນ':'Comments'}</h2></header>
    <div className="flex-1 min-h-0 overflow-y-auto p-4">
      <p className="font-semibold mb-2 break-words">{post.author.name}</p><p className="whitespace-pre-wrap break-words font-lao">{lang==='lo'&&post.contentLo?post.contentLo:post.content}</p>
      {post.image&&<img src={post.image} alt="" className="mt-3 max-h-60 w-full object-contain rounded-xl"/>}
      <div className="mt-5 pt-4 border-t border-border space-y-5">{!comments.length?<p className="text-sm text-muted-foreground py-5">{t.no_replies}</p>:comments.map(comment=><article key={comment.id} className="flex gap-3"><div className="w-9 h-9 shrink-0 rounded-full bg-primary text-white flex items-center justify-center text-xs">{comment.author.initials}</div><div className="min-w-0"><p className="font-semibold text-sm break-words">{comment.author.name} <time className="font-normal text-xs text-muted-foreground">{new Date(comment.createdAt).toLocaleString(lang==='lo'?'lo-LA':'en-US')}</time></p><p className="whitespace-pre-wrap break-words mt-1 font-lao">{comment.text}</p></div></article>)}</div>
    </div>
    <form onSubmit={e=>{e.preventDefault();void submit();}} className="border-t border-border bg-background p-3 shrink-0">{error&&<p role="alert" className="text-sm text-red-600 mb-2">{error}</p>}<div className="flex items-end gap-2"><textarea aria-label={t.reply_ph} value={reply} onChange={e=>setReply(e.target.value)} maxLength={1000} rows={2} placeholder={t.reply_ph} className="flex-1 min-w-0 rounded-2xl bg-muted/40 px-3 py-2 resize-none font-lao"/><button disabled={!reply.trim()||busy} aria-label={lang==='lo'?'ສົ່ງ':'Send'} className="touch-target bg-primary text-white rounded-full disabled:opacity-40"><Send size={20}/></button></div></form>
  </section>;
}
