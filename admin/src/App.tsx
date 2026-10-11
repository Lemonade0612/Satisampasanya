import {useEffect,useState} from 'react';
import {RefreshCw,Sun,Moon,ShieldCheck,ArrowUpRight} from 'lucide-react';
import {api,clearSession,hasSession,needsReview} from './api';
import {useAdminDashboard} from './useAdminDashboard';
import {Navigation,type AdminTab} from './components/Navigation';
import {AdminLogin} from './components/AdminLogin';
import {AdminStats} from './components/AdminStats';
import {ActivityChart} from './components/ActivityChart';
import {CategoryBreakdown} from './components/CategoryBreakdown';
import {ReviewQueue} from './components/ReviewQueue';
import {UserManagement} from './components/UserManagement';
import {AdminRecords} from './components/AdminRecords';
import {PostCalendar} from './components/PostCalendar';
import {ReviewWorkload} from './components/ReviewWorkload';
export function AdminScreen(){
 const [signedIn,setSignedIn]=useState(hasSession());const [name,setName]=useState(localStorage.getItem('sati-admin-name')||'Administrator');
 const [message,setMessage]=useState('');const [tab,setTab]=useState<AdminTab>('Overview');
 const [dark,setDark]=useState(localStorage.getItem('sati-admin-theme')!=='light');
 const {data,error,errorStatus,loading,refresh}=useAdminDashboard(signedIn);
 useEffect(()=>{localStorage.setItem('sati-admin-theme',dark?'dark':'light');},[dark]);
 useEffect(()=>{if(errorStatus===401){clearSession();setSignedIn(false);setMessage('Your session expired. Please sign in again.');}},[errorStatus]);
 const logout=async()=>{try{await api.logout();}catch{clearSession();}setSignedIn(false);};
 if(!signedIn)return <AdminLogin message={message} onLogin={value=>{setName(value);localStorage.setItem('sati-admin-name',value);setSignedIn(true);setMessage('');}}/>;
 return <div className={`admin-shell ${dark?'admin-dark':'admin-light'}`}><Navigation tab={tab} onChange={setTab} onLogout={()=>void logout()} canManageUsers={data?.permissions.canManageUsers||false} pending={data?.posts.filter(needsReview).length||0}/><div className="admin-workspace"><header className="admin-topbar"><div><span className="breadcrumb">Workspace / {tab}</span><strong>Community safety dashboard</strong></div><div className="admin-actions"><button className="icon-button" aria-label={dark?'Switch to light theme':'Switch to dark theme'} onClick={()=>setDark(!dark)}>{dark?<Sun size={19}/>:<Moon size={19}/>}</button><div className="admin-account"><span className="account-avatar">{name[0]?.toUpperCase()}</span><div><strong>{name}</strong><small>{data?.permissions.role.toUpperCase()||'WORKSPACE'}</small></div></div></div></header><main className="admin-content"><div className="admin-title"><div><span className="eyebrow">SATI ADMINISTRATION</span><h1>{tab==='Posts'?'All posts':tab==='Users'?'People & access':tab==='Queue'?'Review queue':'Overview'}</h1><p className="admin-muted">{data?`Live database · Updated ${new Date(data.updatedAt).toLocaleTimeString()} · Refreshes every 15 seconds`:error?'Connection needs attention':'Connecting to your backend…'}</p></div><button className="secondary-button" disabled={loading} onClick={()=>void refresh()}><RefreshCw size={16} className={loading?'spin':''}/>{loading?'Refreshing':'Refresh data'}</button></div>{error&&<div className="admin-error" role="alert">{error}{errorStatus===403&&<p>Sign out and use the registered account listed in ADMIN_EMAILS, then restart the backend if you changed that setting.</p>}</div>}{data&&<>{tab==='Overview'&&<section className="welcome-banner"><div><span className="eyebrow"><ShieldCheck size={15}/>COMMUNITY INTELLIGENCE</span><h2>Welcome back, {name.split(' ')[0]}.</h2><p>A clearer view of what matters. Help your community stay informed and safe.</p></div><button onClick={()=>setTab('Queue')}>Open review queue <ArrowUpRight size={18}/></button></section>}{tab!=='Users'&&<AdminStats data={data}/>}{tab==='Overview'&&<><div className="admin-grid charts-grid"><ActivityChart posts={data.posts}/><CategoryBreakdown posts={data.posts}/></div><div className="admin-grid"><PostCalendar posts={data.posts}/><ReviewWorkload posts={data.posts}/></div><ReviewQueue posts={data.posts} onReviewed={refresh} canReview={data.permissions.canReview}/></>}{tab==='Queue'&&<ReviewQueue posts={data.posts} onReviewed={refresh} canReview={data.permissions.canReview}/>} {tab==='Posts'&&<AdminRecords data={data} tab={tab}/>} {tab==='Users'&&data.permissions.canManageUsers&&<UserManagement data={data} onUpdated={refresh}/>}</>}<footer className="content-footer">Satisampasanya Administration<span>Connected to your SQLite backend</span></footer></main></div></div>;
}
