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
export const adminApi = {
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
