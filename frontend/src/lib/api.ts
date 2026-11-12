import { Capacitor } from '@capacitor/core';
import type {CheckStage} from '../components/safety/CheckProgress';
import type { CurrentUser, Post, PostDraft, Comment, Notification } from '../types';
import { getBand } from './band';

export const API_BASE = import.meta.env.VITE_API_URL || (Capacitor.isNativePlatform() ? 'http://127.0.0.1:3001/api' : '/api');
const TOKEN_KEY = 'sati-session';
// Email accounts keep the session for this tab only. Quick accounts (nickname + optional PIN) stay signed in
// on this phone, because many of those users have no password to type again.
const store = (s: Storage) => { try { return s.getItem(TOKEN_KEY); } catch { return null; } };
const token = () => store(sessionStorage) || store(localStorage);
export const hasSession = () => !!token();
export const clearSession = () => { try { sessionStorage.removeItem(TOKEN_KEY); localStorage.removeItem(TOKEN_KEY); } catch { /* storage blocked */ } };
export class ApiError extends Error { constructor(message: string, public status: number) { super(message); } }
export async function request<T>(path: string, method = 'GET', data?: unknown, timeoutMs?: number): Promise<T> {
  let response: Response;
  // A timeout turns a hanging request on a weak connection into the same 'cannot reach' error as being offline.
  // Older Android WebViews lack AbortSignal.timeout, so the timer is set up by hand.
  const abort = timeoutMs ? new AbortController() : undefined;
  const timer = abort ? setTimeout(() => abort.abort(), timeoutMs) : undefined;
  const stop = abort?.signal;
  try {
    response = await fetch(API_BASE + path, { signal: stop, method, headers: { ...(data === undefined ? {} : {'Content-Type':'application/json'}), ...(hasSession() ? {Authorization:`Bearer ${token()}`} : {}) }, body: data === undefined ? undefined : JSON.stringify(data) });
  } catch { throw new ApiError('Cannot reach the service. Open Start Backend.command (or Start iPhone.command for the simulator), then retry.', 0); }
  finally { clearTimeout(timer); }
  const value = await response.json().catch(() => { throw new ApiError('The service returned an invalid response. Please retry.', response.status || 502); });
  if (!response.ok) throw new ApiError(value.error || 'Request failed.', response.status);
  return value;
}
export async function publishWithProgress(post:PostDraft,onProgress:(stage:CheckStage,done?:boolean)=>void):Promise<Post>{
 const response=await fetch(API_BASE+'/posts?stream=1',{method:'POST',headers:{'Content-Type':'application/json',...(hasSession()?{Authorization:`Bearer ${token()}`}:{})},body:JSON.stringify(post)});
 if(!response.ok){const value=await response.json().catch(()=>{throw new ApiError('The service returned an invalid response. Please retry.',response.status||502);});throw new ApiError(value.error||'Unable to check the post.',response.status);}
 if(!response.body)throw new ApiError('The connection ended before checking finished.',502);
 const reader=response.body.getReader(),decoder=new TextDecoder();let buffer='',result:Post|undefined;
 while(true){
  const {value,done}=await reader.read();buffer+=decoder.decode(value,{stream:!done});
  const lines=buffer.split('\n');buffer=lines.pop()||'';
  for(const line of lines){
   if(!line.trim())continue;const event=JSON.parse(line);
   if(event.type==='progress')onProgress(event.stage,false);
   if(event.type==='error')throw new ApiError(event.message,event.status);
   if(event.type==='result'){result=event.value;onProgress('verdict',true);}
  }
  if(done)break;
 }
 if(!result)throw new ApiError('The connection ended before a result arrived. Check your feed before retrying.',502);
 return result;
}
export const api = {
  async authenticate(mode: 'login'|'register', data: {email:string;password:string;name?:string;ageBand?:import('../types').Band}) {
    const value = await request<{token:string;user:CurrentUser}>(`/auth/${mode}`, 'POST', data);
    sessionStorage.setItem(TOKEN_KEY,value.token); return value.user;
  },
  // Quick sign-up: returns the sign-in code to show once (used with the PIN on another phone).
  async quick(data: {name:string;ageBand:import('../types').Band;pin?:string}) {
    const value = await request<{token:string;user:CurrentUser;code:string;pin:boolean}>('/auth/quick', 'POST', data);
    try { localStorage.setItem(TOKEN_KEY,value.token); } catch { sessionStorage.setItem(TOKEN_KEY,value.token); }
    return value;
  },
  alerts: () => request<Notification[]>('/alerts'),
  readAlerts: (id?:string) => request('/alerts/read','POST',{id}),
  registerDevice: (token:string,lang:string) => request('/devices','POST',{token,lang}),
  removeDevice: (token:string) => request('/devices/remove','POST',{token}),
  me: () => request<CurrentUser>('/auth/me', 'GET', undefined, 10000),
  health: () => request<{ok:boolean}>('/health', 'GET', undefined, 5000),
  async logout() { try { await request('/auth/logout','POST'); } finally { clearSession(); } },
  // The account's own band wins on the server; the local band covers accounts that have not chosen one yet.
  posts: () => request<Post[]>(`/posts?band=${getBand()}`),
  createPost: (post:PostDraft,onProgress?:(stage:CheckStage,done?:boolean)=>void) => onProgress?publishWithProgress(post,onProgress):request<Post>('/posts','POST',post),
  comments: (id:string) => request<Comment[]>(`/posts/${id}/comments`),
  comment: (id:string,text:string) => request<Post>(`/posts/${id}/comments`,'POST',{text}),
  react: (id:string,kind:'like'|'warned',active:boolean) => request<Post>(`/posts/${id}/reactions`,'POST',{kind,active}),
  repost: (id:string,text:string,lang:string) => request<Post>(`/posts/${id}/reposts`,'POST',{text,lang}),
  profile: (data:Partial<CurrentUser>&{password?:string}) => request<CurrentUser>('/profile','PATCH',data),
};
