import { SatiLogo } from "../components/shared/Brand";
import { readPhoto } from "../lib/images";
import { T } from "../lib/translations";
import { useState } from "react";
import { AVATAR_GRADIENTS, TOPIC_LABELS, TOPICS } from "../lib/constants";
import { Image as ImageIcon, Camera, Pencil, LogOut, ChevronRight, ShieldCheck, Accessibility, Languages } from "lucide-react";
import { bandLabel } from "../components/shared/BandSheet";
import { TIERS } from "../features/daily/lib/age";
import { useBand } from "../lib/band";
import { setSimpleMode, useSimpleMode } from "../lib/simpleMode";
import { getProgress, currentStreak } from "../features/daily/lib/progress";
import { LeafMark } from "@/components/ui/LeafMark";
import { TagChip } from "@/components/ui/TagChip";
import type { Lang, CurrentUser, Post, ProfileTab, LeafState } from "../types";

export function ProfileScreen({ lang, user, posts, onLogout, onUpdate, onChangeBand, onCompose, onToggleLang }: {
  lang: Lang; user: CurrentUser; posts: Post[]; onLogout: () => void; onUpdate: (data: Partial<CurrentUser>) => Promise<void>; onChangeBand: () => void; onCompose?: () => void; onToggleLang: () => void;
}) {
  const t = T[lang];
  const [tab, setTab] = useState<ProfileTab>("posts");
  const [editing, setEditing] = useState(false);
  const [bio, setBio] = useState(user.bio || "");
  const [editBio, setEditBio] = useState(bio);
  const [displayName, setDisplayName] = useState(user.name);
  const [editName, setEditName] = useState(user.name);
  const avatarGradient = AVATAR_GRADIENTS[0];
  const band = useBand(), Icon = TIERS[band].icon;
  const simple = useSimpleMode();
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

  const progress = getProgress();
  const caught = progress.completed.length, streak = currentStreak(progress);
  const lo = lang === 'lo';
  const card = "rounded-2xl border border-border bg-card";

  return (
    <div className="h-full flex flex-col bg-background overflow-y-auto scrollbar-hide font-lao">
      <div className="flex items-center gap-2 px-4 py-3"><SatiLogo size={28}/><span className="font-display font-semibold text-lg">{lo ? 'ໂປຣໄຟລ໌' : 'Profile'}</span></div>
      {error && <p role="alert" className="px-4 pb-2 text-destructive text-sm">{error}</p>}

      {/* Banner */}
      <div className="relative h-32 mx-4 rounded-3xl overflow-hidden shrink-0" style={{ background: bannerFile ? undefined : 'linear-gradient(135deg, var(--primary), var(--brand-blue))' }}>
        {bannerFile && <img src={bannerFile} alt="" className="w-full h-full object-cover" />}
        {editing && (
          <>
            <input type="file" accept="image/*" className="hidden" id="banner-upload" onChange={async (e) => {const f=e.target.files?.[0];if(f)try{setBannerFile(await readPhoto(f));}catch(err){setError((err as Error).message);}}} />
            <label htmlFor="banner-upload" className="absolute top-2 right-2 flex items-center gap-1.5 bg-black/40 text-white text-xs font-semibold px-3 py-1.5 rounded-full backdrop-blur-sm cursor-pointer">
              <ImageIcon size={12} />{t.change_banner}
            </label>
          </>
        )}
      </div>

      {/* Avatar overlaps the banner by 44px */}
      <div className="relative -mt-11 mx-auto z-10 w-fit">
        <div className="w-[84px] h-[84px] rounded-full border-4 border-white flex items-center justify-center font-bold text-2xl text-white overflow-hidden"
          style={avatarFile ? undefined : { background: avatarGradient }}>
          {avatarFile ? <img src={avatarFile} alt="" className="w-full h-full object-cover" /> : initials}
        </div>
        {editing && (
          <>
            <input type="file" accept="image/*" className="hidden" id="avatar-upload" onChange={async (e) => {const f=e.target.files?.[0];if(f)try{setAvatarFile(await readPhoto(f));}catch(err){setError((err as Error).message);}}} />
            <label htmlFor="avatar-upload" aria-label={t.edit_profile} className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary border-2 border-white flex items-center justify-center cursor-pointer">
              <Camera size={14} className="text-white" />
            </label>
          </>
        )}
      </div>

      {/* Identity */}
      <div className="px-4 pt-2 text-center">
        {editing
          ? <input value={editName} onChange={(e) => setEditName(e.target.value)} className="font-display font-bold text-[22px] text-center outline-none border-b-2 border-primary bg-transparent w-full" />
          : <h2 className="font-display font-bold text-[22px] leading-tight">{displayName}</h2>}
        <div className="flex items-center justify-center gap-2 mt-1">
          <span className="text-sm text-muted-foreground">{user.handle}</span>
          <span className="text-xs font-semibold text-primary bg-secondary px-2.5 py-0.5 rounded-full">{bandLabel(band, lang)}</span>
        </div>
        {editing
          ? <textarea value={editBio} onChange={(e) => setEditBio(e.target.value)} placeholder={t.bio_ph}
              className="mt-3 text-sm leading-relaxed w-full outline-none border border-border rounded-xl p-2.5 resize-none bg-sidebar min-h-[56px]" />
          : bio && <p className="mt-2 text-sm leading-relaxed text-foreground/80">{bio}</p>}
        <div className="mt-3 flex justify-center gap-2">
          {editing
            ? <>
                <button onClick={saveEdit} disabled={saving} className="text-sm font-semibold bg-primary text-white px-5 py-2 rounded-full">{t.save}</button>
                <button onClick={cancelEdit} className="text-sm font-semibold border border-border rounded-full px-5 py-2">{t.cancel}</button>
              </>
            : <button onClick={() => { setEditing(true); setEditName(displayName); setEditBio(bio); }}
                className="flex items-center gap-1.5 text-sm font-semibold border border-primary text-primary rounded-full px-5 py-2 hover:bg-secondary transition-colors">
                <Pencil size={14} />{lo ? 'ແກ້ໄຂໂປຣໄຟລ໌' : 'Edit profile'}
              </button>}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 px-4 mt-5">
        {[[userPosts.length, lo ? 'ໂພສ' : 'Posts'], [followed.length, lo ? 'ຫົວຂໍ້' : 'Topics'], [totalPoints, lo ? 'ຄະແນນ' : 'Points']].map(([n, label]) => (
          <div key={label} className="bg-sidebar rounded-2xl py-3 text-center">
            <p className="font-display font-bold text-xl">{n}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>

      {/* Daily game progress */}
      <div className="mx-4 mt-3 bg-secondary rounded-2xl p-4">
        <p className="text-sm font-semibold">{lo ? `ຈັບການຫຼອກລວງໄດ້ ${caught} ຄັ້ງ · ຕິດຕໍ່ກັນ ${streak} ມື້` : `Caught ${caught} scams · ${streak}-day streak`}</p>
        <div className="mt-2 h-2 rounded-full bg-white overflow-hidden" role="progressbar" aria-valuemin={0} aria-valuemax={7} aria-valuenow={Math.min(streak, 7)}>
          <div className="h-full rounded-full" style={{ width: `${Math.min(streak, 7) / 7 * 100}%`, background: 'linear-gradient(90deg, var(--primary), var(--brand-blue))' }} />
        </div>
        <p className="text-xs text-muted-foreground mt-1.5">{lo ? `${Math.min(streak, 7)}/7 ມື້ ອາທິດນີ້` : `${Math.min(streak, 7)}/7 days this week`}</p>
      </div>

      {/* Tabs: segmented control */}
      <div className="mx-4 mt-5 p-1 bg-sidebar rounded-full flex shrink-0">
        {(["posts","topics","points"] as ProfileTab[]).map(tabKey => (
          <button key={tabKey} onClick={() => setTab(tabKey)} aria-pressed={tab === tabKey}
            className={`flex-1 py-2 text-sm font-semibold rounded-full transition-colors ${tab === tabKey ? "bg-white text-primary shadow-sm" : "text-muted-foreground"}`}>
            {tabKey === "posts" ? t.posts : tabKey === "topics" ? t.topics : t.points_tab}
          </button>
        ))}
      </div>

      <div className="flex-1 mt-2">
        {tab === "posts" && (
          <div>
            {userPosts.length === 0 ? (
              <div className="text-center py-10 px-6">
                <span className="mx-auto w-14 h-14 rounded-2xl bg-secondary text-primary flex items-center justify-center"><ShieldCheck size={28} /></span>
                <p className="mt-3 font-semibold">{lo ? 'ຍັງບໍ່ມີໂພສ' : 'No posts yet'}</p>
                <p className="text-sm text-muted-foreground mt-1">{lo ? 'ເຫັນຫຍັງແປກໆ? ແບ່ງປັນໃຫ້ໝູ່ຮູ້' : 'Seen something odd? Tell your friends'}</p>
                {onCompose && <button onClick={onCompose} className="mt-4 bg-primary text-white font-semibold text-sm px-6 py-2.5 rounded-full">{lo ? 'ໂພສທຳອິດ' : 'First post'}</button>}
              </div>
            ) : (
              userPosts.map(post => (
                <div key={post.id} className="px-4 py-3 border-b border-border">
                  <p className="text-sm text-foreground line-clamp-2">{lo && post.contentLo ? post.contentLo : post.content}</p>
                  <div className="flex gap-2 mt-2">
                    {post.tags.map(tag => <TagChip key={tag} tag={tag} lang={lang} small />)}
                  </div>
                  <div className="flex items-center gap-3 mt-2 text-[11px] text-muted-foreground">
                    <span>{post.timestamp}</span>
                    <span>{post.likes} {lo ? 'ຖືກໃຈ' : 'likes'}</span>
                    {post.points && <span className="text-emerald-600">{post.points} {lo ? 'ຄະແນນ' : 'pts'}</span>}
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
                    <span className="text-sm font-semibold text-primary">#{lo && label ? label.lo : topic}</span>
                    {label && <span className="text-[10px] text-muted-foreground ml-2">#{lo ? label.en : label.lo}</span>}
                  </div>
                  <button disabled={saving} onClick={() => toggleFollow(topic)}
                    className={`text-xs font-semibold px-3.5 py-1.5 rounded-full transition-all ${followed.includes(topic) ? "bg-secondary text-primary" : "border border-border text-foreground/60 hover:border-primary/30"}`}>
                    {followed.includes(topic) ? t.following : t.follow}
                  </button>
                </div>
              );
            })}
          </div>
        )}
        {tab === "points" && (
          <div className="p-4">
            <p className="text-3xl font-bold font-display text-foreground">{totalPoints}</p>
            <p className="text-xs text-muted-foreground mt-0.5 mb-5">{t.total_points}</p>
            <p className="text-[10px] font-bold tracking-wider uppercase text-foreground/40 mb-3">{t.recent_activity}</p>
            {!totalPoints && <p className="text-sm text-muted-foreground">{lo ? 'ຍັງບໍ່ມີຄະແນນຢືນຢັນ' : 'No verified points yet.'}</p>}
            <div className="space-y-2.5">
              {userPosts.filter(p => p.state === "confirmed").map(p => ({pts: `+${p.points || 0}`, date: p.timestamp, state: "verified" as LeafState})).map((item,i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-sidebar rounded-xl">
                  <div className="flex items-center gap-2.5">
                    <LeafMark state={item.state} size={15} />
                    <div>
                      <p className="text-xs font-medium">{t.post_verified}</p>
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

      {/* Settings */}
      <div className={`mx-4 mt-4 ${card} overflow-hidden divide-y divide-border`}>
        <SettingRow icon={<Icon size={20} />} label={lo ? 'ກຸ່ມອາຍຸ' : 'Age group'} value={bandLabel(band, lang)} onClick={onChangeBand} />
        <SettingRow icon={<Accessibility size={20} />} label={lo ? 'ໂໝດງ່າຍ' : 'Simple mode'} onClick={() => setSimpleMode(!simple)} switchOn={simple} />
        <SettingRow icon={<Languages size={20} />} label={lo ? 'ພາສາ' : 'Language'} value={lo ? 'ລາວ' : 'English'} onClick={onToggleLang} />
      </div>
      <button onClick={onLogout} className="mx-auto my-6 text-sm font-semibold text-destructive hover:underline flex items-center gap-1.5 min-h-11 px-4">
        <LogOut size={14} /> {lo ? 'ອອກຈາກລະບົບ' : 'Sign out'}
      </button>
    </div>
  );
}

function SettingRow({ icon, label, value, onClick, switchOn }: { icon: React.ReactNode; label: string; value?: string; onClick?: () => void; switchOn?: boolean }) {
  const isSwitch = switchOn !== undefined;
  return <button onClick={onClick} role={isSwitch ? 'switch' : undefined} aria-checked={isSwitch ? switchOn : undefined}
    className="w-full min-h-[60px] flex items-center gap-3 px-4 py-2 text-left hover:bg-sidebar transition-colors">
    <span className="w-10 h-10 rounded-xl bg-secondary text-primary flex items-center justify-center shrink-0">{icon}</span>
    <span className="flex-1 font-semibold">{label}</span>
    {value && <span className="text-sm text-muted-foreground">{value}</span>}
    {isSwitch
      ? <span className={`w-12 h-7 rounded-full p-1 transition-colors ${switchOn ? 'bg-primary' : 'bg-muted'}`}><span className={`block w-5 h-5 rounded-full bg-white shadow transition-transform ${switchOn ? 'translate-x-5' : ''}`} /></span>
      : <ChevronRight size={18} className="text-muted-foreground" />}
  </button>;
}
