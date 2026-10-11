import { useCallback, useEffect, useRef, useState } from 'react';
import { api, API_BASE } from '../lib/api';
import type { Post } from '../types';

export function useLivePosts(userId?: string) {
  const [posts,setPosts]=useState<Post[]>([]);
  const [error,setError]=useState('');
  const [loading,setLoading]=useState(true);
  const revision=useRef(0);
  const refresh=useCallback(async()=>{
    const current=++revision.current;
    try { const result=await api.posts(); if(current===revision.current){setPosts(result);setError('');} }
    catch(e){if(current===revision.current)setError((e as Error).message);}
    finally {if(current===revision.current)setLoading(false);}
  },[userId]);
  useEffect(()=>{
    setLoading(true); void refresh();
    const events=new EventSource(API_BASE+'/events');
    events.addEventListener('change',refresh);
    events.onerror=()=>setError('Live connection interrupted. Reconnecting…');
    // Poll as a fallback when the app resumes or an SSE connection drops.
    const timer=setInterval(refresh,15000);
    const visible=()=>{if(document.visibilityState==='visible')void refresh();};
    document.addEventListener('visibilitychange',visible);
    return()=>{revision.current++;events.close();clearInterval(timer);document.removeEventListener('visibilitychange',visible);};
  },[refresh]);
  return {posts,error,loading,refresh};
}
