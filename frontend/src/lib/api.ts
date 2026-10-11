import { Capacitor } from '@capacitor/core';
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
  } catch { throw new ApiError('Cannot reach the backend. Start npm run backend and try again.', 0); }
  const value = await response.json();
  if (!response.ok) throw new ApiError(value.error || 'Request failed.', response.status);
  return value;
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
  createPost: (post:PostDraft) => request<Post>('/posts','POST',post),
  comments: (id:string) => request<Comment[]>(`/posts/${id}/comments`),
  comment: (id:string,text:string) => request<Post>(`/posts/${id}/comments`,'POST',{text}),
  react: (id:string,kind:'like'|'warned',active:boolean) => request<Post>(`/posts/${id}/reactions`,'POST',{kind,active}),
  repost: (id:string,text:string,lang:string) => request<Post>(`/posts/${id}/reposts`,'POST',{text,lang}),
  profile: (data:Partial<CurrentUser>) => request<CurrentUser>('/profile','PATCH',data),
};
