import {Database, RefreshCw} from 'lucide-react';

export function DashboardStatus({loading,error,onRetry}:{loading:boolean;error:string;onRetry:()=>void}) {
 return <section className="admin-card dashboard-status" role={error?'alert':'status'} aria-live="polite">
  <span className="dashboard-status-icon"><Database size={26}/></span>
  <h2>{error?'Your workspace is temporarily unavailable':'Loading your workspace'}</h2>
  <p className="admin-muted">{error||'Preparing community activity, review queues, and account records.'}</p>
  {error&&<button className="secondary-button" disabled={loading} onClick={onRetry}><RefreshCw size={16}/>Try again</button>}
 </section>;
}
