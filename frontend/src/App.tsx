import { useState, useEffect, useRef, useCallback, useMemo } from "react";
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
import { SettingsScreen } from "./screens/SettingsScreen";
import { TEXT_SCALE, useTextSize } from "./lib/textSize";
import { DailyScreen } from "./features/daily";
import type { Launch } from "./features/daily/screens/DailyHome";
import { CommentsModal } from "./components/modals/CommentsModal";
import { ComposeModal } from "./components/modals/ComposeModal";
import { RepostModal } from "./components/modals/RepostModal";
import { ImageExpandModal } from "./components/modals/ImageExpandModal";
import { BottomNav } from "./components/feed/BottomNav";
import { AskSatiButton } from "./components/shared/AskSatiButton";
import { AlertBanner } from "./components/feed/AlertBanner";
import { startPush, stopPush, setAppBadge, updatePushLang } from "./lib/push";
import { getProgress } from "./features/daily/lib/progress";
import { setDailyAccount, today } from "./features/daily/lib/storage";
import { BandSheet } from "./components/shared/BandSheet";
import { LangToggle } from "./components/shared/Controls";
import { GuestChip } from "./components/shared/GuestChip";
import { canInteract, postsForBand, setBand, setBandSaver, useBand, useHasBand } from "./lib/band";
import { SignupPrompt, type SignupReason } from "./components/shared/QuickSignup";
import { GuestProfile } from "./screens/GuestProfile";
import { ElderApp } from "./features/elder/ElderApp";
import { setEasyModeAccount, useEasyMode } from "./lib/easyMode";
import type { Lang, CurrentUser, ActiveView, Post, ThemeMode, PostDraft, Notification } from "./types";

// Blocked storage (private mode, strict settings) must never stop the app from loading.
const readPref = (key: string) => { try { return localStorage.getItem(key); } catch { return null; } };
const writePref = (key: string, value: string) => { try { localStorage.setItem(key, value); } catch { /* keep in memory only */ } };
const ELDER_GUEST = 'sati-elder-guest';
const dropPref = (key: string) => { try { localStorage.removeItem(key); } catch { /* nothing stored */ } };

// Remembers which account last signed in here, so its own progress keeps counting while offline.
const LAST_ACCOUNT = 'sati-last-account';

export default function App() {
  usePhoneViewport();
  const [showSplash, setShowSplash] = useState(true);
  const [lang, setLang] = useState<Lang>(readPref("sati-lang") === "lo" ? "lo" : "en");
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [view, setView] = useState<ActiveView>(location.hash.startsWith("#/daily") ? "daily" : "feed");
  const [feedTab, setFeedTab] = useState(0);
  const [customTopic,setCustomTopic]=useState<string|null>(null);
  const {posts: allPosts, error: connectionError, loading, refresh} = useLivePosts(user?.id);
  // The age band filters what every screen shows. Kids get a read-only, verified-only feed.
  const band = useBand();
  const textSize = useTextSize();
  const simple = useEasyMode();
  const [dailyStart, setDailyStart] = useState<Launch | null>(null);
  const interact = canInteract(band);
  const posts = useMemo(() => postsForBand(allPosts, band), [allPosts, band]);
  // Mirrors the server rule: 5 original posts per day, reset at midnight in Laos (UTC+7).
  const postsLeftToday = useMemo(() => {
    if (!user?.id) return 5;
    const laoMidnight = Date.parse(new Date(Date.now() + 7 * 3600000).toISOString().slice(0, 10) + 'T00:00:00+07:00');
    return Math.max(0, 5 - allPosts.filter(p => p.author.id === user.id && !p.repostOf && (p.createdAt ?? 0) > laoMidnight).length);
  }, [allPosts, user?.id]);
  // Text size (Settings) scales every rem-based size: 1×, 1.15× or 1.3× of the root font size.
  useEffect(() => { document.documentElement.style.fontSize = textSize === 'normal' ? '' : `calc(var(--font-size, 16px) * ${TEXT_SCALE[textSize]})`; }, [textSize]);
  const [sessionLoading, setSessionLoading] = useState(hasSession());
  const [actionError, setActionError] = useState('');
  // Guest mode: browse the feed, search, games and Daily without an account. Writing anything opens the
  // quick sign-up prompt. 'offline' (server unreachable) is Sati Daily only, with bundled scenarios.
  // 'ຜູ້ສູງອາຍຸ / ໂໝດໃຊ້ງ່າຍ' on the welcome screen starts a guest session that this phone remembers.
  const [guest, setGuest] = useState<null | 'guest' | 'offline'>(() => (readPref(ELDER_GUEST) === '1' ? 'guest' : null));
  const [bandSheet, setBandSheet] = useState(false);
  const bandChosen = useHasBand();
  const [signupReason, setSignupReason] = useState<SignupReason | null>(null);
  const browsing = !user && guest === 'guest';
  useEffect(() => { if (guest === null) dropPref(ELDER_GUEST); }, [guest]);
  // Every user change goes through here: progress is keyed by account, and the account's band wins.
  const applyUser = useCallback((value: CurrentUser | null) => {
    setDailyAccount(value?.id ?? null);
    setEasyModeAccount(value?.id ?? null, value?.easyMode);
    if (value?.id) { writePref(LAST_ACCOUNT, value.id); dropPref(ELDER_GUEST); }
    if (value?.ageBand) setBand(value.ageBand);
    setUser(value);
  }, []);
  const goOffline = useCallback(() => {
    if (hasSession()) setDailyAccount(readPref(LAST_ACCOUNT));
    setGuest('offline'); setView('daily');
  }, []);
  useEffect(() => {
    let alive = true;
    if (!hasSession()) { api.health().catch(() => { if (alive) goOffline(); }); return () => { alive = false; }; }
    api.me().then(value => { if (alive) applyUser(value); }).catch(error => {
      if (error instanceof ApiError && error.status === 401) clearSession();
      else if (alive) goOffline();
    }).finally(() => { if (alive) setSessionLoading(false); });
    return () => { alive = false; };
  }, []);
  // Signed in: band changes are saved to the account (the server checks the Kids password rule).
  useEffect(() => {
    setBandSaver(user ? async (next, password) => { applyUser(await api.profile({ ageBand: next, password })); } : null);
    return () => setBandSaver(null);
  }, [user?.id]);
  useEffect(() => { void refresh(); }, [band]);
  const leaveGuest = async () => {
    if (guest === 'offline') {
      try { await api.health(); } catch { return; }
      if (hasSession()) { try { applyUser(await api.me()); } catch { clearSession(); } }
    }
    setDailyAccount(null); setGuest(null); setView('feed');
    if (location.hash.startsWith('#/daily')) history.replaceState(null, '', location.pathname);
  };
  useEffect(() => { writePref('sati-lang', lang); }, [lang]);
  const [commentPostId, setCommentPostId] = useState<string | null>(null);
  const [showCompose, setShowCompose] = useState(false);
  const [alerts,setAlertList] = useState<Notification[]>([]);
  // On-ground banner: show alerts that arrive while the app is open, never the backlog from sign-in.
  const seenAlerts=useRef<Set<string>|null>(null);
  const setAlerts=(value:Notification[])=>{if(!seenAlerts.current)seenAlerts.current=new Set(value.map(a=>a.id));setAlertList(value);};
  const alertCount=alerts.filter(a=>!a.read).length;
  const loadAlerts=async()=>{try{setAlerts(await api.alerts());}catch{/* Feed status already reports connectivity issues. */}};
  useEffect(()=>{let alive=true;if(!user){setAlerts([]);return;}api.alerts().then(value=>{if(alive)setAlerts(value);}).catch(()=>{});return()=>{alive=false;};},[user?.id,allPosts]);
  const markAlerts=async(id?:string)=>{try{await api.readAlerts(id);await loadAlerts();}catch(e){setActionError((e as Error).message);}};
  const [showAlerts, setShowAlerts] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  // Ask Sati is full screen (no bottom nav); its back button returns to where it was opened.
  const [assistantFrom, setAssistantFrom] = useState<ActiveView>("feed");
  const openAssistant = () => { setAssistantFrom(view === "assistant" ? "feed" : view); setView("assistant"); };
  const [banner,setBanner]=useState<Notification|null>(null);
  const dismissBanner=useCallback(()=>setBanner(null),[]);
  useEffect(()=>{seenAlerts.current=null;setBanner(null);},[user?.id]);
  useEffect(()=>{
    if(!user)return;
    if(!seenAlerts.current)return;
    const fresh=alerts.filter(a=>!a.read&&!seenAlerts.current!.has(a.id));
    for(const a of alerts)seenAlerts.current.add(a.id);
    if(fresh.length&&!showAlerts)setBanner(fresh[0]);
  },[alerts]);
  useEffect(()=>{void setAppBadge(alertCount);},[alertCount]);
  useEffect(()=>{updatePushLang(lang);},[lang]);
  useEffect(()=>{
    if(!user)return;
    let stop=()=>{};let alive=true;
    startPush(lang,{onForeground:()=>void loadAlerts(),onOpen:(postId,alertId)=>{setBanner(null);setShowAlerts(false);setCommentPostId(postId);if(alertId)void markAlerts(alertId);}}).then(cleanup=>{if(alive)stop=cleanup;else cleanup();}).catch(error=>console.warn('Push setup failed:',error));
    const onVisible=()=>{if(document.visibilityState==='visible')void loadAlerts();};
    document.addEventListener('visibilitychange',onVisible);
    return()=>{alive=false;stop();document.removeEventListener('visibilitychange',onVisible);};
  },[user?.id]);
  const [dailyPending,setDailyPending]=useState(()=>getProgress().lastDay!==today());
  useEffect(()=>{setDailyPending(getProgress().lastDay!==today());},[view,user?.id]);
  const [repostPost, setRepostPost] = useState<Post | null>(null);
  const [postToast, setPostToast] = useState(false);
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {const saved=readPref('sati-theme');return saved==='dark'||saved==='system'?saved:'light';});
  const [expandedImage, setExpandedImage] = useState<string | null>(null);

  useEffect(() => {
    const query = window.matchMedia('(prefers-color-scheme: dark)');
    const apply = () => document.documentElement.classList.toggle('dark', themeMode === 'dark' || (themeMode === 'system' && query.matches));
    apply(); query.addEventListener('change', apply);
    writePref('sati-theme', themeMode);
    return () => query.removeEventListener('change', apply);
  }, [themeMode]);

  const toggleLang = () => setLang((l: Lang) => l === "en" ? "lo" : "en");

  const handleLogin = (u: CurrentUser) => {
    setActionError('');
    applyUser(u);
    setView("feed");
  };

  const handleLogout = async () => {
    await stopPush();
    try { await api.logout(); } catch { /* The local session is already cleared. */ }
    applyUser(null); setAlerts([]); setShowAlerts(false); setActionError(''); setView('feed'); setCommentPostId(null); setShowCompose(false); setRepostPost(null);
  };
  const notifyPosted = () => { setPostToast(true); setTimeout(() => setPostToast(false), 3000); };
  const handleAddPost = async (post: PostDraft,onProgress?:(stage:import('./components/safety/CheckProgress').CheckStage,done?:boolean)=>void) => { await api.createPost(post,onProgress); void refresh(); notifyPosted(); };
  const handleAddComment = async (postId: string, text: string) => { await api.comment(postId,text); await refresh(); };
  const handleRepost = async (post: Post, text: string) => { await api.repost(post.id,text,lang); void refresh(); notifyPosted(); };
  const react = async (postId: string, kind: 'like'|'warned') => {
    if (!user) { setSignupReason('react'); return; }
    const post=allPosts.find(p=>p.id===postId); if(!post)return;
    try { setActionError(''); await api.react(postId,kind,!(kind==='like'?post.liked:post.warned)); await refresh(); }
    catch(error){setActionError((error as Error).message);}
  };
  const handleLike = (id: string) => react(id,'like');
  const handleWarnedMe = (id: string) => react(id,'warned');
  const handleRepostCount = (id: string) => { if (!user) { setSignupReason('post'); return; } const post=posts.find(p=>p.id===id); if(post)setRepostPost(post); };
  const handleProfile = async (data: Partial<CurrentUser>) => { const updated=await api.profile(data); applyUser(updated); await refresh(); };

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

  // Easy mode (Elders by default, or switched on in Profile): the elder shell, Home / Check / Learn, no feed.
  // Also offline: its message check runs on the phone.
  if (simple && (user || guest)) return (
    <div className="app-shell w-full max-w-md mx-auto bg-background relative overflow-hidden"><ElderApp lang={lang} /></div>
  );

  if (!user && guest === 'offline') {
    const offline = true;
    return (
      <div className="app-shell w-full max-w-md mx-auto bg-background flex flex-col relative overflow-hidden">
        <div className="flex-1 min-h-0 overflow-hidden relative">
          <DailyScreen lang={lang} onCheckOnSati={() => void leaveGuest()}
            homeHeader={<button onClick={toggleLang} aria-label={lang === 'lo' ? 'ປ່ຽນພາສາ' : 'Change language'}
              className="min-h-11 min-w-11 rounded-full bg-white/20 hover:bg-white/30 px-3 text-sm font-bold font-lao">{lang === 'lo' ? 'EN' : 'ລາວ'}</button>}
            homeFooter={<GuestChip lang={lang} offline={offline} onAction={() => void leaveGuest()} />} />
        </div>
      </div>
    );
  }

  if (!user && !browsing) {
    return (
      <div className="app-shell w-full max-w-md mx-auto bg-background">
        {actionError && <p role="alert" className="text-sm p-3 text-red-600">{actionError}</p>}
        <AuthScreen lang={lang} onLangToggle={toggleLang} onLogin={handleLogin} onGuest={() => { setGuest('guest'); setView('feed'); }} onOffline={goOffline} />
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
            onCompose={() => user ? setShowCompose(true) : setSignupReason('post')}
            followedTopics={user?.followed || []}
            following={user?.following || []}
            currentUserId={user?.id}
            onFollow={id=>{if(!user){setSignupReason('follow');return;}const current=user.following || [];void handleProfile({following:current.includes(id)?current.filter(value=>value!==id):[...current,id]}).catch(e=>setActionError(e.message));}}
            onOpenAlerts={handleOpenAlerts}
            alertCount={alertCount}
            onRepostClick={setRepostPost}
            onLangToggle={toggleLang}
            onChangeBand={() => setBandSheet(true)}
            onPlayGame={game => { setDailyStart({ game, scope: 'all' }); setView('daily'); }}
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
            onCheckLink={() => user ? openAssistant() : setSignupReason('assistant')}
            onTopicClick={(topic) => {
              setCustomTopic(topic); setFeedTab(0);
              setView("feed");
            }}
          />
        )}
        {view === "assistant" && !showAlerts && user && <AssistantScreen lang={lang} onBack={() => setView(assistantFrom)} />}
        {view === "daily" && !showAlerts && <DailyScreen lang={lang} start={dailyStart} onStarted={() => setDailyStart(null)} onCheckOnSati={() => { history.replaceState(null, "", location.pathname); setView("feed"); }} />}
        {view === "profile" && !showAlerts && !user && <GuestProfile lang={lang} onDone={handleLogin} onEmail={() => setGuest(null)} onChangeBand={() => setBandSheet(true)} />}
        {view === "profile" && !showAlerts && user && (
          <ProfileScreen lang={lang} user={user} posts={allPosts} onUpdate={handleProfile} onCompose={interact ? () => setShowCompose(true) : undefined} onOpenSettings={() => setShowSettings(true)} />
        )}
        {showAlerts && (
          <div className="absolute inset-0 z-30">
            <AlertsScreen lang={lang} alerts={alerts} onMarkRead={markAlerts} onMarkAllRead={() => markAlerts()} onClose={() => setShowAlerts(false)} onOpenPost={id=>{setShowAlerts(false);setCommentPostId(id);}} onOpenSettings={() => setShowSettings(true)} />
          </div>
        )}
        {showSettings && (
          <div className="absolute inset-0 z-[35]">
            <SettingsScreen lang={lang} onLangChange={setLang} themeMode={themeMode} onThemeChange={setThemeMode} onChangeBand={() => setBandSheet(true)}
              onLogout={user ? () => { setShowSettings(false); void handleLogout(); } : undefined} onBack={() => setShowSettings(false)} />
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
          onOpenPost={setCommentPostId}
          readOnly={!interact}
          onNeedAccount={user ? undefined : () => setSignupReason('comment')}
        />
      )}
      {showCompose && interact && (
        <ComposeModal
          lang={lang}
          userName={user?.name}
          remaining={postsLeftToday}
          onClose={() => setShowCompose(false)}
          onPost={handleAddPost}
        />
      )}
      {repostPost && interact && (
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
      {(view === "feed" || view === "explore") && !showAlerts && <AskSatiButton lang={lang} onClick={() => user ? openAssistant() : setSignupReason('assistant')} />}
      {/* Existing accounts without a band choose once after sign-in; afterwards it opens from the header or Settings. */}
      {(user ? !user.ageBand : !bandChosen) || bandSheet ? <BandSheet lang={lang} onClose={(user ? user.ageBand : bandChosen) ? () => setBandSheet(false) : undefined} onSaved={() => setBandSheet(false)} /> : null}
      {signupReason && !user && <SignupPrompt lang={lang} reason={signupReason} onClose={() => setSignupReason(null)} onDone={u => { setSignupReason(null); setActionError(''); applyUser(u); }} onEmail={() => { setSignupReason(null); setGuest(null); }} />}
      {banner && <AlertBanner alert={banner} lang={lang} onDismiss={dismissBanner} onOpen={()=>{const b=banner;setBanner(null);void markAlerts(b.id);setShowAlerts(false);setCommentPostId(b.post_id);}} />}
      {postToast && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-50 bg-foreground text-background text-xs font-semibold px-4 py-2 rounded-full shadow-lg font-lao whitespace-nowrap">
          {lang === 'lo' ? 'ໂພສແລ້ວ!' : 'Posted!'}
        </div>
      )}
      {view !== "assistant" && <BottomNav active={view} onChange={(v) => { if (v !== "daily" && location.hash.startsWith("#/daily")) history.replaceState(null, "", location.pathname); setView(v); setShowAlerts(false); setShowSettings(false); }} lang={lang} onCompose={interact ? () => user ? setShowCompose(true) : setSignupReason('post') : undefined} dailyDot={dailyPending && view !== "daily"} />}
    </div>
  );
}
