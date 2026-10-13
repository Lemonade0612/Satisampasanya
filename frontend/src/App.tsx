import { useState, useEffect } from "react";
import { api, hasSession, clearSession, ApiError } from "./lib/api";
import { usePhoneViewport } from "./hooks/usePhoneViewport";
import { useLivePosts } from "./hooks/useLivePosts";
import { SplashScreen } from "./screens/SplashScreen";
import { AuthScreen } from "./screens/AuthScreen";
import { FeedScreen } from "./screens/FeedScreen";
import { ExploreScreen } from "./screens/ExploreScreen";
import { ProfileScreen } from "./screens/ProfileScreen";
import { AssistantScreen } from "./screens/AssistantScreen";
import { AlertsScreen } from "./screens/AlertsScreen";
import { CommentsModal } from "./components/modals/CommentsModal";
import { ComposeModal } from "./components/modals/ComposeModal";
import { RepostModal } from "./components/modals/RepostModal";
import { ImageExpandModal } from "./components/modals/ImageExpandModal";
import { BottomNav } from "./components/feed/BottomNav";
import type { Lang, CurrentUser, ActiveView, Post, ThemeMode, PostDraft, Notification } from "./types";

export default function App() {
  usePhoneViewport();
  const [showSplash, setShowSplash] = useState(true);
  const [lang, setLang] = useState<Lang>(localStorage.getItem("sati-lang") === "lo" ? "lo" : "en");
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [view, setView] = useState<ActiveView>("feed");
  const [feedTab, setFeedTab] = useState(0);
  const [customTopic,setCustomTopic]=useState<string|null>(null);
  const {posts, error: connectionError, loading, refresh} = useLivePosts(user?.id);
  const [sessionLoading, setSessionLoading] = useState(hasSession());
  const [actionError, setActionError] = useState('');
  useEffect(() => {
    let alive = true;
    if (!hasSession()) return;
    api.me().then(value => { if (alive) setUser(value); }).catch(error => {
      if (error instanceof ApiError && error.status === 401) clearSession();
      else if (alive) setActionError(error.message);
    }).finally(() => { if (alive) setSessionLoading(false); });
    return () => { alive = false; };
  }, []);
  useEffect(() => { localStorage.setItem('sati-lang', lang); }, [lang]);
  const [commentPostId, setCommentPostId] = useState<string | null>(null);
  const [showCompose, setShowCompose] = useState(false);
  const [alerts,setAlerts] = useState<Notification[]>([]);
  const alertCount=alerts.filter(a=>!a.read).length;
  const loadAlerts=async()=>{try{setAlerts(await api.alerts());}catch{/* Feed status already reports connectivity issues. */}};
  useEffect(()=>{let alive=true;if(!user){setAlerts([]);return;}api.alerts().then(value=>{if(alive)setAlerts(value);}).catch(()=>{});return()=>{alive=false;};},[user?.id,posts]);
  const markAlerts=async(id?:string)=>{try{await api.readAlerts(id);await loadAlerts();}catch(e){setActionError((e as Error).message);}};
  const [showAlerts, setShowAlerts] = useState(false);
  const [repostPost, setRepostPost] = useState<Post | null>(null);
  const [postToast, setPostToast] = useState(false);
  const [themeMode, setThemeMode] = useState<ThemeMode>("light");
  const [expandedImage, setExpandedImage] = useState<string | null>(null);

  useEffect(() => {
    const query = window.matchMedia('(prefers-color-scheme: dark)');
    const apply = () => document.documentElement.classList.toggle('dark', themeMode === 'dark' || (themeMode === 'system' && query.matches));
    apply(); query.addEventListener('change', apply);
    localStorage.setItem('sati-theme', themeMode);
    return () => query.removeEventListener('change', apply);
  }, [themeMode]);

  const toggleLang = () => setLang((l: Lang) => l === "en" ? "lo" : "en");

  const handleLogin = (u: CurrentUser) => {
    setUser(u);
    setView("feed");
  };

  const handleLogout = async () => {
    try { await api.logout(); } catch { /* The local session is already cleared. */ }
    setUser(null); setView('feed'); setCommentPostId(null); setShowCompose(false); setRepostPost(null);
  };
  const notifyPosted = () => { setPostToast(true); setTimeout(() => setPostToast(false), 3000); };
  const handleAddPost = async (post: PostDraft,onProgress?:(stage:import('./components/safety/CheckProgress').CheckStage,done?:boolean)=>void) => { await api.createPost(post,onProgress); await refresh(); notifyPosted(); };
  const handleAddComment = async (postId: string, text: string) => { await api.comment(postId,text); await refresh(); };
  const handleRepost = async (post: Post, text: string) => { await api.repost(post.id,text,lang); await refresh(); notifyPosted(); };
  const react = async (postId: string, kind: 'like'|'warned') => {
    const post=posts.find(p=>p.id===postId); if(!post)return;
    try { setActionError(''); await api.react(postId,kind,!(kind==='like'?post.liked:post.warned)); await refresh(); }
    catch(error){setActionError((error as Error).message);}
  };
  const handleLike = (id: string) => react(id,'like');
  const handleWarnedMe = (id: string) => react(id,'warned');
  const handleRepostCount = (id: string) => { const post=posts.find(p=>p.id===id); if(post)setRepostPost(post); };
  const handleProfile = async (data: Partial<CurrentUser>) => { const updated=await api.profile(data); setUser(updated); await refresh(); };

  const handleOpenAlerts = () => {
    setShowAlerts(true);

  };

  if (showSplash) {
    return (
      <div className="app-shell w-full max-w-md mx-auto bg-background relative overflow-hidden">
        <SplashScreen onDone={() => setShowSplash(false)} />
      </div>
    );
  }

  if (sessionLoading) return <div className="app-shell flex items-center justify-center" role="status">{lang === 'lo' ? 'ກຳລັງໂຫຼດ…' : 'Loading your account…'}</div>;

  if (!user) {
    return (
      <div className="app-shell w-full max-w-md mx-auto bg-background">
        {actionError && <p role="alert" className="text-sm p-3 text-red-600">{actionError}</p>}
        <AuthScreen lang={lang} onLangToggle={toggleLang} onLogin={handleLogin} />
      </div>
    );
  }

  return (
    <div className="app-shell w-full max-w-md mx-auto bg-background flex flex-col relative overflow-hidden">
      {(connectionError || actionError) && <div role="alert" className="shrink-0 flex items-center gap-2 bg-amber-50 text-amber-900 px-3 py-2 text-sm"><span className="flex-1">{actionError || connectionError}</span><button className="touch-target" onClick={() => {setActionError('');void refresh();}}>{lang === 'lo' ? 'ລອງໃໝ່' : 'Retry'}</button></div>}
      {loading && <p role="status" className="p-3 text-sm">{lang === 'lo' ? 'ກຳລັງໂຫຼດໂພສ…' : 'Loading posts…'}</p>}
      <div className="flex-1 min-h-0 overflow-hidden relative">
        {view === "feed" && !showAlerts && (
          <FeedScreen
            lang={lang}
            posts={posts}
            activeTab={feedTab}
            onTabChange={index=>{setCustomTopic(null);setFeedTab(index);}}
            customTopic={customTopic}
            onOpenComments={setCommentPostId}
            onLike={handleLike}
            onRepost={handleRepostCount}
            onWarnedMe={handleWarnedMe}
            onCompose={() => setShowCompose(true)}
            followedTopics={user.followed || []}
            following={user.following || []}
            currentUserId={user.id}
            onFollow={id=>{const current=user.following || [];void handleProfile({following:current.includes(id)?current.filter(value=>value!==id):[...current,id]}).catch(e=>setActionError(e.message));}}
            onOpenAlerts={handleOpenAlerts}
            alertCount={alertCount}
            onRepostClick={setRepostPost}
            themeMode={themeMode}
            onThemeChange={setThemeMode}
            onLangToggle={toggleLang}
            onImageExpand={(url) => setExpandedImage(url)}
            onTopicClick={(topic) => {
              setCustomTopic(topic); setFeedTab(0);
            }}
          />
        )}
        {view === "explore" && !showAlerts && (
          <ExploreScreen 
            lang={lang} 
            posts={posts} 
            onOpenPost={setCommentPostId} 
            onTopicClick={(topic) => {
              setCustomTopic(topic); setFeedTab(0);
              setView("feed");
            }}
          />
        )}
        {view === "assistant" && !showAlerts && <AssistantScreen lang={lang} />}
        {view === "profile" && !showAlerts && (
          <ProfileScreen lang={lang} user={user} posts={posts} onLogout={handleLogout} onUpdate={handleProfile} />
        )}
        {showAlerts && (
          <div className="absolute inset-0 z-40">
            <AlertsScreen lang={lang} alerts={alerts} onMarkRead={markAlerts} onMarkAllRead={() => markAlerts()} onClose={() => setShowAlerts(false)} onOpenPost={id=>{setShowAlerts(false);setCommentPostId(id);}} />
          </div>
        )}
      </div>
      {commentPostId && (
        <CommentsModal
          postId={commentPostId}
          posts={posts}
          lang={lang}
          onClose={() => setCommentPostId(null)}
          onAddComment={handleAddComment}
        />
      )}
      {showCompose && (
        <ComposeModal
          lang={lang}
          onClose={() => setShowCompose(false)}
          onPost={handleAddPost}
        />
      )}
      {repostPost && (
        <RepostModal
          post={repostPost}
          lang={lang}
          onClose={() => setRepostPost(null)}
          onRepost={handleRepost}
        />
      )}
      {expandedImage && (
        <ImageExpandModal
          imageUrl={expandedImage}
          onClose={() => setExpandedImage(null)}
        />
      )}
      {postToast && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-50 bg-foreground text-background text-xs font-semibold px-4 py-2 rounded-full shadow-lg font-lao whitespace-nowrap">
          {lang === 'lo' ? 'ໂພສແລ້ວ!' : 'Posted!'}
        </div>
      )}
      <BottomNav active={view} onChange={(v) => { setView(v); setShowAlerts(false); }} lang={lang} onCompose={() => setShowCompose(true)} />
    </div>
  );
}
