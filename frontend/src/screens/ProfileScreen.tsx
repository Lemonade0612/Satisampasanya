import { SatiLogo } from "../components/shared/Brand";
import { readPhoto } from "../lib/images";
import { T } from "../lib/translations";
import { useState } from "react";
import { AVATAR_GRADIENTS, BANNER_GRADIENTS, TOPIC_LABELS, TOPICS } from "../lib/constants";
import { Image as ImageIcon, Camera, Pencil, LogOut } from "lucide-react";
import { LeafMark } from "@/components/ui/LeafMark";
import { TagChip } from "@/components/ui/TagChip";
import type { Lang, CurrentUser, Post, ProfileTab, LeafState } from "../types";

export function ProfileScreen({ lang, user, posts, onLogout, onUpdate }: {
  lang: Lang; user: CurrentUser; posts: Post[]; onLogout: () => void; onUpdate: (data: Partial<CurrentUser>) => Promise<void>;
}) {
  const t = T[lang];
  const [tab, setTab] = useState<ProfileTab>("posts");
  const [editing, setEditing] = useState(false);
  const [bio, setBio] = useState(user.bio || "");
  const [editBio, setEditBio] = useState(bio);
  const [displayName, setDisplayName] = useState(user.name);
  const [editName, setEditName] = useState(user.name);
  const avatarGradient = AVATAR_GRADIENTS[0];
  const bannerGradient = BANNER_GRADIENTS[0];
  const [followed, setFollowed] = useState(user.followed || []);
  const [avatarFile, setAvatarFile] = useState<string | null>(user.avatar || null);
  const [bannerFile, setBannerFile] = useState<string | null>(user.banner || null);

  const [saving,setSaving] = useState(false);
  const [error,setError] = useState('');
  const userPosts = posts.filter(p => !!user.id && p.author.id === user.id);
  const totalPoints = userPosts.reduce((sum, p) => sum + (p.points || 0), 0);
  const initials = displayName.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase() || "YO";

  const saveEdit = async () => {
    if(saving)return;setSaving(true);setError('');
    try {await onUpdate({name:editName.trim() || displayName,bio:editBio,avatar:avatarFile,banner:bannerFile});setDisplayName(editName.trim() || displayName);setBio(editBio);setEditing(false);}
    catch(e){setError((e as Error).message);}finally{setSaving(false);}
  };

  const cancelEdit = () => {
    setEditName(displayName);
    setEditBio(bio);
    setAvatarFile(user.avatar || null); setBannerFile(user.banner || null);
    setEditing(false);
    
    
  };

  const toggleFollow = async (topic: string) => {
    if(saving)return;
    const next=followed.includes(topic)?followed.filter(t=>t!==topic):[...followed,topic];
    setSaving(true);setError('');
    try{await onUpdate({followed:next});setFollowed(next);}catch(e){setError((e as Error).message);}finally{setSaving(false);}
  };

  return (
    <div className="h-full flex flex-col bg-background overflow-y-auto scrollbar-hide">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border"><SatiLogo size={28}/><span className="font-display font-semibold">{t.app_short}</span></div>
      {error && <p role="alert" className="p-3 text-red-600 text-sm">{error}</p>}
      {/* Banner */}
      <div className="relative h-32 w-full shrink-0" style={{ background: bannerFile ? undefined : bannerGradient }}>
        {bannerFile && <img src={bannerFile} alt="banner" className="w-full h-full object-cover" />}
        {editing && (
          <>
            <input type="file" accept="image/*" className="hidden" id="banner-upload" onChange={async (e) => {const f=e.target.files?.[0];if(f)try{setBannerFile(await readPhoto(f));}catch(err){setError((err as Error).message);}}} />
            <label htmlFor="banner-upload" className="absolute top-2 right-2 flex items-center gap-1.5 bg-black/40 text-white text-xs font-semibold px-3 py-1.5 rounded-full backdrop-blur-sm cursor-pointer z-10">
              <ImageIcon size={12} />{t.change_banner}
            </label>
          </>
        )}
      </div>
      {/* Avatar - positioned between banner and card */}
      <div className="relative -mt-8 ml-4 z-30 w-fit">
        <div className="w-16 h-16 rounded-full border-4 border-background flex items-center justify-center font-bold text-xl text-white overflow-hidden bg-gradient-to-br from-primary to-primaryLight"
          style={avatarFile ? undefined : { background: avatarGradient }}>
          {avatarFile ? <img src={avatarFile} alt="avatar" className="w-full h-full object-cover" /> : initials}
        </div>
        {editing && (
          <>
            <input type="file" accept="image/*" className="hidden" id="avatar-upload" onChange={async (e) => {const f=e.target.files?.[0];if(f)try{setAvatarFile(await readPhoto(f));}catch(err){setError((err as Error).message);}}} />
            <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-primary border-2 border-background flex items-center justify-center cursor-pointer">
              <Camera size={10} className="text-white" />
            </label>
          </>
        )}
      </div>

      {/* Identity */}
      <div className="px-4 pt-3 pb-4 border-b border-border bg-background">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0 mr-3">
            {editing
              ? <input value={editName} onChange={(e) => setEditName(e.target.value)} className="font-display font-bold text-xl outline-none border-b-2 border-primary bg-transparent w-full mb-0.5" />
              : <h2 className="font-display font-bold text-xl">{displayName}</h2>
            }
            <p className="text-sm text-muted-foreground">{user.handle}</p>
          </div>
          {editing
            ? <div className="flex gap-2 shrink-0">
                <button onClick={saveEdit} disabled={saving} className="text-xs font-semibold bg-primary text-white px-3 py-1.5 rounded-full font-lao">{t.save}</button>
                <button onClick={cancelEdit} className="text-xs font-semibold border border-border rounded-full px-3 py-1.5 font-lao">{t.cancel}</button>
              </div>
            : <button onClick={() => { setEditing(true); setEditName(displayName); setEditBio(bio); }}
                className="flex items-center gap-1.5 text-xs font-semibold border border-border rounded-full px-3 py-1.5 hover:bg-muted/50 transition-colors shrink-0 font-lao">
                <Pencil size={12} />{t.edit_profile}
              </button>
          }
        </div>
        {/* Trust badge */}
        <div className="flex items-center gap-1.5 mb-2">
          
          <span className="text-xs font-medium text-green-700 dark:text-green-400">{lang === 'lo' ? 'ສະມາຊິກຊຸມຊົນ' : 'Community member'}</span>
        </div>
        {editing
          ? <textarea value={editBio} onChange={(e) => setEditBio(e.target.value)} placeholder={t.bio_ph}
              className="text-sm leading-relaxed w-full outline-none border border-border rounded-xl p-2.5 resize-none bg-muted/30 mb-3 min-h-[56px] font-lao" />
          : <p className="text-sm leading-relaxed mb-3 text-foreground/80 font-lao">{bio}</p>
        }
        <div className="flex gap-5 text-sm mb-4">
          <span><strong className="text-foreground">{userPosts.length}</strong> <span className="text-muted-foreground font-lao">{t.posts}</span></span>
          <span><strong className="text-foreground">{followed.length}</strong> <span className="text-muted-foreground">{lang === 'lo' ? 'ຫົວຂໍ້ທີ່ຕິດຕາມ' : 'Topics followed'}</span></span>
          <span><strong className="text-foreground">{totalPoints}</strong> <span className="text-muted-foreground font-lao">{t.points_tab}</span></span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {followed.map(topic => (
            <span key={topic} className="text-[10px] font-medium bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 px-2.5 py-1 rounded-full flex flex-col">
              <span>#{lang === "lo" && TOPIC_LABELS[topic] ? TOPIC_LABELS[topic].lo : topic}</span>
            </span>
          ))}
          <button onClick={() => setTab("topics")} className="text-xs font-medium text-muted-foreground border border-border px-2.5 py-1 rounded-full hover:border-primary/30 font-lao">{t.add_topic}</button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border shrink-0 sticky top-0 bg-background/95 backdrop-blur-sm z-10">
        {(["posts","topics","points"] as ProfileTab[]).map(tabKey => (
          <button key={tabKey} onClick={() => setTab(tabKey)}
            className={`flex-1 py-3 text-sm font-medium transition-colors border-b-2 font-lao ${tab === tabKey ? "border-primary text-primary" : "border-transparent text-muted-foreground"}`}>
            {tabKey === "posts" ? t.posts : tabKey === "topics" ? t.topics : t.points_tab}
          </button>
        ))}
      </div>

      <div className="flex-1">
        {tab === "posts" && (
          <div>
            {userPosts.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground text-sm">No posts yet</div>
            ) : (
              userPosts.map(post => (
                <div key={post.id} className="px-4 py-3 border-b border-border">
                  <p className="text-sm text-foreground line-clamp-2">{lang === "lo" && post.contentLo ? post.contentLo : post.content}</p>
                  <div className="flex gap-2 mt-2">
                    {post.tags.map(tag => <TagChip key={tag} tag={tag} lang={lang} small />)}
                  </div>
                  <div className="flex items-center gap-3 mt-2 text-[11px] text-muted-foreground">
                    <span>{post.timestamp}</span>
                    <span>{post.likes} likes</span>
                    {post.points && <span className="text-emerald-600">{post.points} pts</span>}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
        {tab === "topics" && (
          <div className="p-4 space-y-0.5">
            {TOPICS.map(topic => {
              const label = TOPIC_LABELS[topic];
              return (
                <div key={topic} className="flex items-center justify-between py-3 border-b border-border/40">
                  <div>
                    <span className="text-sm font-semibold text-indigo-700">#{lang === "lo" && label ? label.lo : topic}</span>
                    {label && <span className="text-[10px] text-muted-foreground ml-2">#{lang === "lo" ? label.en : label.lo}</span>}
                  </div>
                  <button disabled={saving} onClick={() => toggleFollow(topic)}
                    className={`text-xs font-semibold px-3.5 py-1.5 rounded-full transition-all font-lao ${followed.includes(topic) ? "bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300" : "border border-border text-foreground/60 hover:border-primary/30"}`}>
                    {followed.includes(topic) ? t.following : t.follow}
                  </button>
                </div>
              );
            })}
          </div>
        )}
        {tab === "points" && (
          <div className="p-4">
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-3xl font-bold font-display text-foreground">{totalPoints}</p>
                <p className="text-xs text-muted-foreground mt-0.5 font-lao">{t.total_points}</p>
              </div>
            </div>
            <p className="text-[10px] font-bold tracking-wider uppercase text-foreground/40 mb-3 font-lao">{t.recent_activity}</p>
            {!totalPoints && <p className="text-sm text-muted-foreground">{lang === 'lo' ? 'ຍັງບໍ່ມີຄະແນນຢືນຢັນ' : 'No verified points yet.'}</p>}
            <div className="space-y-2.5">
              {userPosts.filter(p => p.state === "confirmed").map(p => ({pts: `+${p.points || 0}`, date: p.timestamp, state: "verified" as LeafState})).map((item,i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-muted/40 dark:bg-muted/20 rounded-xl border border-border/40">
                  <div className="flex items-center gap-2.5">
                    <LeafMark state={item.state} size={15} />
                    <div>
                      <p className="text-xs font-medium font-lao">{t.post_verified}</p>
                      <p className="text-[10px] text-muted-foreground">{item.date}</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-green-700">{item.pts}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="p-4 border-t border-border">
        <button onClick={onLogout} className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm font-semibold hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors">
          <LogOut size={16} /> Sign Out
        </button>
      </div>
    </div>
  );
}
