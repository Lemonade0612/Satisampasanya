import {useState} from 'react';
import {ModerationLabels} from './ModerationLabels';
import {adminApi,type AdminPost} from '../api';
export function ReviewDialog({post,onClose,onReviewed}:{post:AdminPost;onClose:()=>void;onReviewed:()=>Promise<void>}){
 const [state,setState]=useState<'clean'|'confirmed'|'false'|'rejected'>('clean');
 const [note,setNote]=useState('');const [busy,setBusy]=useState(false);const [error,setError]=useState('');
 const submit=async()=>{setBusy(true);setError('');try{await adminApi.review(post.id,state,note);await onReviewed();onClose();}catch(e){setError((e as Error).message);}finally{setBusy(false);}};
 return <div className="admin-modal-backdrop"><form className="admin-card admin-review-modal" role="dialog" aria-modal="true" aria-label="Review post" onSubmit={e=>{e.preventDefault();void submit();}}><h2>Review post</h2><ModerationLabels post={post}/>{post.check?.reasons.map((reason,index)=><blockquote className="moderation-evidence" key={index}><p>{reason.text}</p><q>{reason.evidence}</q></blockquote>)}{post.image&&<img src={post.image} alt="Post attachment" style={{maxWidth:"100%",maxHeight:280,objectFit:"contain",borderRadius:12}}/>}<p>{post.content}</p>{post.contentLo&&<p>{post.contentLo}</p>}{post.link&&<a href={post.link} target="_blank" rel="noreferrer">Open source</a>}<RiskPanel post={post} onChanged={async()=>{await onReviewed();onClose();}}/><label>Decision<select value={state} onChange={e=>setState(e.target.value as typeof state)}><option value="clean">Approve post</option><option value="confirmed">Confirmed scam</option><option value="false">False alarm</option><option value="rejected">Reject — keep interactions locked</option></select></label><label>Review note<textarea required maxLength={1000} value={note} onChange={e=>setNote(e.target.value)} placeholder="Explain the evidence behind your decision"/></label>{error&&<p role="alert">{error}</p>}<div className="admin-actions"><button type="button" disabled={busy} onClick={onClose}>Cancel</button><button disabled={busy||!note.trim()}>{busy?'Saving…':'Save review'}</button></div></form></div>;
}

const ICON={green:'🟢 Green',yellow:'🟡 Yellow',red:'🔴 Red'} as const;
function RiskPanel({post,onChanged}:{post:AdminPost;onChanged:()=>Promise<void>}){
 const [level,setLevel]=useState<'green'|'yellow'|'red'>(post.risk_level||'yellow');const [warn,setWarn]=useState(false);
 const [note,setNote]=useState('');const [busy,setBusy]=useState(false);const [error,setError]=useState('');
 if(!post.risk_level)return null;
 const save=async()=>{setBusy(true);setError('');try{await adminApi.overrideRisk(post.id,level,note,warn);await onChanged();}catch(e){setError((e as Error).message);}finally{setBusy(false);}};
 return <fieldset className="moderation-evidence"><legend>Risk flag: {ICON[post.risk_level]} · set by {post.flagged_by||'auto'} · {post.flag_count||0} reports</legend>
  {post.risk_reasons?.map(r=><p key={r.en}>{r.en} / {r.lo}</p>)}
  {post.risk_log?.map(e=><p key={e.at}><small>{new Date(e.at).toLocaleString()} · {e.byName}: {e.from} to {e.to}{e.warningExample?' (warning example)':''}{e.note?' · '+e.note:''}</small></p>)}
  <label>Override level<select value={level} onChange={e=>setLevel(e.target.value as typeof level)}><option value="green">Green</option><option value="yellow">Yellow</option><option value="red">Red</option></select></label>
  {level==='red'&&<label><input type="checkbox" checked={warn} onChange={e=>setWarn(e.target.checked)}/> Publish as warning example (red overlay)</label>}
  <label>Reason<input value={note} maxLength={1000} onChange={e=>setNote(e.target.value)} placeholder="Why are you changing the flag?"/></label>
  {error&&<p role="alert">{error}</p>}
  <button type="button" disabled={busy||!note.trim()} onClick={()=>void save()}>{busy?'Saving…':'Override flag (logged)'}</button></fieldset>;
}
