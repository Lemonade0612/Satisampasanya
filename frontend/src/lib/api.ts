import { Capacitor } from '@capacitor/core';
import type {CheckStage} from '../components/safety/CheckProgress';
import type { CurrentUser, Post, PostDraft, Comment, Notification } from '../types';

export const API_BASE = import.meta.env.VITE_API_URL || (Capacitor.isNativePlatform() ? 'http://127.0.0.1:3001/api' : '/api');
const TOKEN_KEY = 'sati-session';
export const hasSession = () => !!localStorage.getItem(TOKEN_KEY);
export const clearSession = () => localStorage.removeItem(TOKEN_KEY);
export class ApiError extends Error { constructor(message: string, public status: number) { super(message); } }
export async function request<T>(path: string, method = 'GET', data?: unknown): Promise<T> {
  let response: Response;
  try {
    response = await fetch(API_BASE + path, { method, headers: { ...(data === undefined ? {} : {'Content-Type':'application/json'}), ...(hasSession() ? {Authorization:`Bearer ${localStorage.getItem(TOKEN_KEY)}`} : {}) }, body: data === undefined ? undefined : JSON.stringify(data) });
  } catch { throw new ApiError('Cannot reach the service. Open Start Backend.command (or Start iPhone.command for the simulator), then retry.', 0); }
  const value = await response.json();
  if (!response.ok) throw new ApiError(value.error || 'Request failed.', response.status);
  return value;
}
export async function publishWithProgress(post:PostDraft,onProgress:(stage:CheckStage,done?:boolean)=>void):Promise<Post>{
 const response=await fetch(API_BASE+'/posts?stream=1',{method:'POST',headers:{'Content-Type':'application/json',...(hasSession()?{Authorization:`Bearer ${localStorage.getItem(TOKEN_KEY)}`}:{})},body:JSON.stringify(post)});
 if(!response.ok){const value=await response.json();throw new ApiError(value.error||'Unable to check the post.',response.status);}
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
  async authenticate(mode: 'login'|'register', data: {email:string;password:string;name?:string}) {
    const value = await request<{token:string;user:CurrentUser}>(`/auth/${mode}`, 'POST', data);
    localStorage.setItem(TOKEN_KEY,value.token); return value.user;
  },
  alerts: () => request<Notification[]>('/alerts'),
  readAlerts: (id?:string) => request('/alerts/read','POST',{id}),
  me: () => request<CurrentUser>('/auth/me'),
  async logout() { try { await request('/auth/logout','POST'); } finally { clearSession(); } },
  posts: () => request<Post[]>('/posts'),
  createPost: (post:PostDraft,onProgress?:(stage:CheckStage,done?:boolean)=>void) => onProgress?publishWithProgress(post,onProgress):request<Post>('/posts','POST',post),
  comments: (id:string) => request<Comment[]>(`/posts/${id}/comments`),
  comment: (id:string,text:string) => request<Post>(`/posts/${id}/comments`,'POST',{text}),
  react: (id:string,kind:'like'|'warned',active:boolean) => request<Post>(`/posts/${id}/reactions`,'POST',{kind,active}),
  repost: (id:string,text:string,lang:string) => request<Post>(`/posts/${id}/reposts`,'POST',{text,lang}),
  profile: (data:Partial<CurrentUser>) => request<CurrentUser>('/profile','PATCH',data),
};
