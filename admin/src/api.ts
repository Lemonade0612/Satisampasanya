const TOKEN_KEY='sati-admin-session';
export const hasSession=()=>!!localStorage.getItem(TOKEN_KEY);
export const clearSession=()=>localStorage.removeItem(TOKEN_KEY);
export class ApiError extends Error {constructor(message:string,public status:number){super(message);}}
async function request<T>(path:string,method='GET',data?:unknown):Promise<T>{
 let response:Response;
 try{response=await fetch('/api'+path,{method,headers:{...(data===undefined?{}:{'Content-Type':'application/json'}),...(hasSession()?{Authorization:`Bearer ${localStorage.getItem(TOKEN_KEY)}`}:{})},body:data===undefined?undefined:JSON.stringify(data)});}
 catch{throw new ApiError('Cannot reach the backend. Start the Backend F5 configuration and retry.',0);}
 const value=await response.json();
 if(!response.ok)throw new ApiError(value.error||'Request failed.',response.status);
 return value;
}
export const api={
 async authenticate(_mode:'login',data:{email:string;password:string}){const result=await request<{token:string;user:{name:string}}>('/auth/login','POST',data);localStorage.setItem(TOKEN_KEY,result.token);return result.user;},
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
export const needsReview = (post:AdminPost) => !post.review && ['flagged','sla'].includes(post.state);
