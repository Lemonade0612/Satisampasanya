const TOKEN_KEY='sati-admin-session';
export const hasSession=()=>!!sessionStorage.getItem(TOKEN_KEY);
export const clearSession=()=>sessionStorage.removeItem(TOKEN_KEY);
export class ApiError extends Error {constructor(message:string,public status:number){super(message);}}
async function request<T>(path:string,method='GET',data?:unknown):Promise<T>{
 let response:Response;
 try{response=await fetch((import.meta.env.VITE_API_URL || '/api')+path,{method,headers:{...(data===undefined?{}:{'Content-Type':'application/json'}),...(hasSession()?{Authorization:`Bearer ${sessionStorage.getItem(TOKEN_KEY)}`}:{})},body:data===undefined?undefined:JSON.stringify(data)});}
 catch{throw new ApiError('Cannot reach the backend. Start the Backend F5 configuration and retry.',0);}
 const value=await response.json().catch(()=>{throw new ApiError('The service returned an invalid response. Please retry.',response.status||502);});
 if(!response.ok)throw new ApiError(value.error||'Request failed.',response.status);
 return value;
}
export const api={
 async authenticate(_mode:'login',data:{email:string;password:string}){const result=await request<{token:string;user:{name:string}}>('/admin/auth/login','POST',data);sessionStorage.setItem(TOKEN_KEY,result.token);return result.user;},
 async forgot(email:string){return request<{message:string}>('/auth/forgot','POST',{email});},
 async logout(){try{await request('/auth/logout','POST');}finally{clearSession();}}
};

import type { Post } from '../../shared/types';
export interface AdminPost extends Post { review?: { state: string; note: string; reviewedAt: number; reviewerName: string } }
export interface ManagedUser {id:string;name:string;email:string;role:'member'|'viewer'|'reviewer'|'admin';status:'active'|'inactive';unit:string;createdAt:number|null;lastLogin:number|null}
export interface AdminData {
  permissions:{role:string;canManageUsers:boolean;canReview:boolean};
  posts: AdminPost[];
  users: ManagedUser[];
  totals: {posts:number;users:number;comments:number;reactions:number};
  updatedAt: number;
}
export type L10n = {en:string;lo:string};
export type ScenarioStatus = 'draft'|'approved'|'live'|'rejected';
type ScenarioStep = {id:string;kind:'chat';messages:{from:string;text:L10n}[];prompt:L10n;choices:{id:string;correct:boolean;text:L10n;consequence:L10n}[]}|{id:string;kind:'flags';prompt:L10n;segments:{text:L10n;flag?:string}[]};
export interface AdminScenario {
  id:string;status:ScenarioStatus;bands:string[];intensity:number;topic:string;title:L10n;source:'ai_draft'|'expert';
  createdAt:number;updatedAt:number;reviewedBy:{id:string;name:string}|null;reviewedAt:number|null;reviewNote:string;
  scenario:{contact:string;channel:string;intro:L10n;explanation:L10n;warning?:L10n;redFlags:string[];steps:ScenarioStep[]};
}
export interface RetiredScenario {id:string;note:string;retiredAt:number;retiredBy:{id:string;name:string}}
export interface ModerationEntry {id:string;kind:'post'|'scenario';targetId:string;action:string;actor:{id:string;name:string}|null;actorName:string;note:string;detail:Record<string,unknown>;createdAt:number;title:L10n|null}
export const adminApi = {
  scenarios: () => request<AdminScenario[]>('/admin/scenarios'),
  reviewScenario: (id:string,status:ScenarioStatus,note:string) => request<AdminScenario>(`/admin/scenarios/${encodeURIComponent(id)}/review`,'PATCH',{status,note}),
  moderation: () => request<ModerationEntry[]>('/admin/moderation'),
  retired: () => request<RetiredScenario[]>('/admin/scenarios/retired'),
  setRetired: (id:string,retired:boolean,note:string) => request<RetiredScenario[]>(`/admin/scenarios/retired/${encodeURIComponent(id)}`,'PATCH',{retired,note}),
  createUser:(data:unknown)=>request<ManagedUser>('/admin/users','POST',data),
  updateUser:(id:string,data:unknown)=>request<ManagedUser>(`/admin/users/${id}`,'PATCH',data),
  dashboard: () => request<AdminData>('/admin/dashboard'),
  review: (id:string,state:'clean'|'confirmed'|'false'|'rejected',note:string) => request(`/admin/posts/${id}/review`,'PATCH',{state,note}),
};
export const needsReview = (post:AdminPost) => !post.review && (post.frozen || ['flagged','sla'].includes(post.state) || ['caution','needs_expert'].includes(post.check?.verdict || ''));
export const formatCount = (value:number) => new Intl.NumberFormat('en-US',{notation:value>=10000?'compact':'standard',maximumFractionDigits:1}).format(value);
export const ageHours = (post:AdminPost) => (Date.now()-(post.createdAt||Date.now()))/3600000;
export const severity = (post:AdminPost) => post.check?.verdict==='caution'?'yellow':'red';
// Red before yellow, then oldest first, so the riskiest SLA breaches surface at the top.
export const byPriority = (a:AdminPost,b:AdminPost) => (severity(a)===severity(b)?0:severity(a)==='red'?-1:1) || (a.createdAt||0)-(b.createdAt||0);
export const TOPIC_COLORS=['var(--topic-job)','var(--topic-invest)','var(--topic-traffic)','var(--topic-romance)','var(--topic-other)'];
export const topicIndex = (post:AdminPost) => {const tags=post.tags.join(' ').toLowerCase();return tags.includes('job')?0:tags.includes('crypto')||tags.includes('invest')?1:tags.includes('trafficking')||tags.includes('border')?2:tags.includes('romance')?3:4;};
