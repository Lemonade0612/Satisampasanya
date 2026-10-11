import { useCallback, useEffect, useState } from 'react';
import { ApiError } from './api';
import { adminApi, type AdminData } from './api';
export function useAdminDashboard(enabled:boolean) {
  const [data,setData] = useState<AdminData|null>(null);
  const [error,setError] = useState('');
  const [loading,setLoading] = useState(false);
  const [errorStatus,setErrorStatus] = useState<number|null>(null);
  const refresh = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    try { setData(await adminApi.dashboard()); setError(''); setErrorStatus(null); }
    catch (error) { setData(null); setError((error as Error).message); setErrorStatus(error instanceof ApiError ? error.status : null); }
    finally { setLoading(false); }
  },[enabled]);
  useEffect(() => {
    if (!enabled) {setData(null);setError('');setErrorStatus(null);return;}
    void refresh();
    const interval=setInterval(()=>void refresh(),15000);
    return ()=>clearInterval(interval);
  },[enabled,refresh]);
  return {data,error,errorStatus,loading,refresh};
}
