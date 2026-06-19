import { useMemo, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  Users,
  Heart,
  Eye,
  Star,
  MessageCircle,
  Sparkles,
  Camera,
  UserPlus,
  ScrollText,
  Bookmark,
  Settings,
  LogOut,
  Quote,
  Flame,
  Music,
  Palette,
  Home,
  Search,
  Image as ImageIcon,
  Coins,
  MapPin,
  Smile,
  Crown,
  Gift,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Avatar } from "@/components/chat/Avatar";
import { PostCard } from "@/components/feed/PostCard";
import { Composer } from "@/components/feed/Composer";
import { PostSkeleton } from "@/components/feed/FeedSkeletons";
import { EmojiPicker } from "@/components/chat/EmojiPicker";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { FeedPost } from "@/lib/feed-types";
import type { User } from "@/lib/chat-types";
import { useAppSettings } from "@/lib/app-settings";

function useThemeBrandLabel(themeKey: string, fallback: string): string {
  const { raw } = useAppSettings();
  const map = (raw?.theme_brand_labels as Record<string, string> | undefined) || {};
  const v = map[themeKey];
  return (typeof v === "string" && v.trim()) ? v.trim() : fallback;
}

/**
 * OrkutFeedLayout — classic Orkut-inspired premium layout.
 *
 * Palette is the original Orkut blue (#1d4488 navbar, soft #e8eef5 bg, white
 * cards with blue borders) with pink heart accents. Typography uses the era's
 * Verdana/Tahoma stack. Backend/feed logic is untouched — this only re-skins
 * and adds Orkut-style widgets around the existing Composer + PostCard.
 */
type AuthLike = { username: string };

type Props = {
  meId: string;
  user: AuthLike;
  profiles: Record<string, User>;
  posts: FeedPost[];
  friendIds: Set<string>;
  loading: boolean;
  onReload: () => void;
  onOpenThemeStore: () => void;
  onOpenAccount: () => void;
  onOpenProfile: (username: string) => void;
  onOpenFindFriends: () => void;
  onOpenMessages: () => void;
  headerSlot?: React.ReactNode;
};

function synthUser(username: string, id: string): User {
  return {
    id,
    name: username,
    avatarColor: "#1d4488",
    status: "online",
    xp: 0,
    level: 1,
  };
}

const ORKUT_BLUE = "#1d4488";
const ORKUT_BLUE_DARK = "#15356b";
const ORKUT_BLUE_LIGHT = "#4068a3";
const ORKUT_PINK = "#ff66aa";

export function OrkutFeedLayout(props: Props) {
  const {
    meId,
    user,
    profiles,
    posts,
    friendIds,
    loading,
    onReload,
    onOpenThemeStore,
    onOpenAccount,
    onOpenProfile,
    onOpenFindFriends,
    onOpenMessages,
  } = props;

  const friendList = useMemo(
    () => Array.from(friendIds).map((id) => profiles[id]).filter(Boolean) as User[],
    [friendIds, profiles],
  );

  const allProfiles = useMemo(
    () => Object.values(profiles).filter((p) => p && p.id !== meId) as User[],
    [profiles, meId],
  );

  const username = user.username;
  const me: User = profiles[meId] ?? synthUser(username, meId);

  // Counter approximations from existing data — no backend changes.
  const myPosts = useMemo(() => posts.filter((p) => p.author_id === meId).length, [posts, meId]);
  const photos = useMemo(() => posts.filter((p) => p.author_id === meId && (p.media_urls?.length ?? 0) > 0).length, [posts, meId]);
  const fans = friendList.length;
  const brandLabel = useThemeBrandLabel("orkut_retro", "boobubble");

  return (
    <div className="min-h-screen orkut-classic-root">
      <style>{ORKUT_CSS}</style>

      <OrkutTopBar
        username={username}
        me={me}
        brandLabel={brandLabel}
        onOpenProfile={onOpenProfile}
        onOpenMessages={onOpenMessages}
        onOpenThemeStore={onOpenThemeStore}
        onOpenFindFriends={onOpenFindFriends}
        headerSlot={props.headerSlot}
      />

      <div className="mx-auto grid max-w-[1180px] gap-4 px-3 py-4 md:grid-cols-[230px_minmax(0,1fr)_260px] md:gap-4 md:px-4">
        {/* LEFT: Profile sidebar */}
        <aside className="space-y-3">
          <OrkutProfileCard user={me} username={username} fansCount={fans} onEdit={onOpenAccount} onProfile={() => onOpenProfile(username)} />
          <OrkutProfileStats fans={fans} />
          <OrkutQuickLinks
            onProfile={() => onOpenProfile(username)}
            onFindFriends={onOpenFindFriends}
            onMessages={onOpenMessages}
            onAccount={onOpenAccount}
            onThemes={onOpenThemeStore}
          />
        </aside>

        {/* CENTER: Status box + counters + feed */}
        <main className="min-w-0 space-y-3">
          <OrkutStatusBox name={me.name || username} authorId={meId} onPosted={onReload} />

          <OrkutSocialCounters
            posts={myPosts}
            photos={photos}
            fans={fans}
            messages={0}
            friends={fans}
          />

          <OrkutFriendSuggestions users={allProfiles.slice(0, 6)} friendIds={friendIds} meId={meId} onOpenProfile={onOpenProfile} />

          <div className="orkut-card" data-orkut-scrapbook>
            <div className="orkut-card-header">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Scraps from the Community</span>
            </div>
            <div className="border-b border-[#d6e0ee] bg-[#f5f8fc] p-3">
              <Composer authorId={meId} onPosted={onReload} />
            </div>
            <div className="space-y-3 p-3">
              {loading && Array.from({ length: 3 }).map((_, i) => <PostSkeleton key={i} />)}
              {!loading && posts.length === 0 && (
                <div className="rounded border border-dashed border-[#b5c7e0] bg-[#f5f8fc] p-8 text-center text-xs text-[#5a6b85]">
                  No scraps yet — be the first to leave one on the community feed!
                </div>
              )}
              {!loading &&
                posts.map((post) => (
                  <div key={post.id} data-feed-post={post.id} className="orkut-post-wrap">
                    <PostCard post={post} profiles={profiles} meId={meId} />
                  </div>
                ))}
            </div>
          </div>
        </main>

        {/* RIGHT: Friends grid + promoted + communities */}
        <aside className="space-y-3">
          <OrkutFriendsPanel friends={friendList} onOpenProfile={onOpenProfile} onFindFriends={onOpenFindFriends} />
          <OrkutPromotedUsers users={allProfiles.slice(0, 4)} onOpenProfile={onOpenProfile} />
          <OrkutPromotedGroups />
          <OrkutCommunities />
          <OrkutTestimonials onOpenProfile={onOpenProfile} friends={friendList} />
          <OrkutFanCounter fans={fans} />
          <OrkutMusicScrap />
        </aside>
      </div>

      <footer className="mt-6 border-t border-[#b5c7e0] bg-[#e8eef5] py-4 text-center text-[11px] text-[#5a6b85]">
        <span className="orkut-brand">{brandLabel}</span> · classic retro layout · powered by BooBubble · {new Date().getFullYear()}
      </footer>
    </div>
  );
}

/* ============================ Top bar ============================ */

function OrkutTopBar({
  username,
  me,
  brandLabel,
  onOpenProfile,
  onOpenMessages,
  onOpenThemeStore,
  onOpenFindFriends,
  headerSlot,
}: {
  username: string;
  me: User;
  brandLabel: string;
  onOpenProfile: (u: string) => void;
  onOpenMessages: () => void;
  onOpenThemeStore: () => void;
  onOpenFindFriends: () => void;
  headerSlot?: React.ReactNode;
}) {
  const [q, setQ] = useState("");
  const navigate = useNavigate();

  const goHome = () => {
    navigate({ to: "/feed" });
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const goScrapbook = () => {
    if (typeof window !== "undefined") {
      const el = document.querySelector('[data-orkut-scrapbook]') as HTMLElement | null;
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };
  const goCommunities = () => navigate({ to: "/groups" });

  return (
    <header className="orkut-navbar sticky top-0 z-30 text-white shadow-[0_2px_0_rgba(0,0,0,0.08)]">
      {/* Top strip — logo + search + actions */}
      <div className="mx-auto flex max-w-[1180px] items-center gap-3 px-4 py-1.5">
        <Link to="/feed" className="flex items-center gap-2">
          <span className="orkut-logo">orkut</span>
        </Link>

        <form
          onSubmit={(e) => e.preventDefault()}
          className="ml-2 hidden flex-1 max-w-[360px] items-center gap-1 rounded-sm bg-white p-0.5 pl-2 text-[#1d4488] shadow-inner sm:flex"
        >
          <Search className="h-3.5 w-3.5 opacity-70" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="search friends, communities, scraps…"
            className="w-full bg-transparent px-1 py-0.5 text-[12px] outline-none placeholder:text-[#7d8da5]"
          />
          <button
            type="submit"
            className="orkut-btn-blue px-2 py-0.5 text-[11px]"
          >
            search
          </button>
        </form>

        <div className="ml-auto flex items-center gap-2 text-[11px]">
          <button
            onClick={() => onOpenProfile(username)}
            className="flex items-center gap-1.5 rounded-sm bg-white/15 pl-1 pr-2 py-0.5 hover:bg-white/25"
          >
            <span className="grid h-5 w-5 place-items-center rounded-sm bg-white text-[10px] font-black text-[#1d4488]">
              {(me.name || username).slice(0, 1).toUpperCase()}
            </span>
            <span className="hidden text-[11px] font-bold sm:inline">{me.name || username}</span>
          </button>
        </div>
      </div>

      {/* Nav strip — classic Orkut blue tabs */}
      <nav className="border-t border-white/15 bg-[color-mix(in_oklab,#15356b_55%,transparent)]">
        <div className="mx-auto flex max-w-[1180px] items-center gap-0.5 px-4 text-[12px]">
          <TopLink icon={Home} label="home" onClick={goHome} />
          <TopLink icon={Smile} label="profile" onClick={() => onOpenProfile(username)} />
          <TopLink icon={ScrollText} label="scrapbook" onClick={goScrapbook} />
          <TopLink icon={Users} label="friends" onClick={onOpenFindFriends} />
          <TopLink icon={Star} label="communities" onClick={goCommunities} />
          <TopLink icon={MessageCircle} label="messages" onClick={onOpenMessages} />
        </div>
      </nav>
    </header>
  );
}

function TopLink({
  icon: Icon,
  label,
  onClick,
}: {
  icon: typeof Heart;
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      data-tip={label}
      className="orkut-tab orkut-tip flex items-center gap-1.5 px-2.5 py-1.5 font-bold uppercase tracking-wide text-white/90 transition hover:bg-white/15 hover:text-white"
    >
      <Icon className="h-3 w-3" />
      <span>{label}</span>
    </button>
  );
}

/* ============================ Profile card ============================ */

function OrkutProfileCard({
  user,
  username,
  fansCount,
  onEdit,
  onProfile,
}: {
  user: User;
  username: string;
  fansCount: number;
  onEdit: () => void;
  onProfile: () => void;
}) {
  return (
    <div className="orkut-card">
      <div className="orkut-card-header">
        <Smile className="h-3.5 w-3.5" />
        <span>my profile</span>
      </div>
      <div className="bg-white p-3 text-center">
        <button
          onClick={onProfile}
          className="mx-auto inline-block rounded-sm border border-[#b5c7e0] bg-white p-1 shadow-[0_1px_2px_rgba(0,0,0,0.08)] transition hover:border-[#1d4488]"
        >
          <Avatar user={user} size={92} />
        </button>
        <div className="mt-2 text-[13px] font-bold leading-tight text-[#1d4488]">{user.name || username}</div>
        <div className="mt-0.5 inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-[#5a6b85]">
          <span className={`h-1.5 w-1.5 rounded-full ${user.status === "online" ? "bg-emerald-500" : user.status === "away" ? "bg-amber-500" : "bg-zinc-400"}`} />
          {user.status ?? "online"}
        </div>
      </div>

      <div className="space-y-2 border-t border-[#d6e0ee] bg-[#f5f8fc] p-3 text-[11px] text-[#3b4a66]">
        <StatLine icon={Crown} label="level" value={String(user.level ?? 1)} />
        <StatLine icon={Sparkles} label="xp" value={String(user.xp ?? 0)} />
        <StatLine icon={Coins} label="coins" value={String(user.coins ?? 0)} />
        <StatLine icon={Flame} label="streak" value={`${user.streak ?? 0} days`} />
        {user.countryCode && (
          <StatLine icon={MapPin} label="from" value={user.countryCode.toUpperCase()} />
        )}
      </div>

      {user.bio && (
        <div className="border-t border-[#d6e0ee] bg-white p-3 text-[11px] italic text-[#5a6b85]">
          "{user.bio}"
        </div>
      )}

      <div className="grid grid-cols-3 gap-px border-t border-[#d6e0ee] bg-[#d6e0ee] text-center">
        <MiniStat label="fans" value={fansCount} />
        <MiniStat label="cool" value={Math.min(99, fansCount * 2)} />
        <MiniStat label="trusty" value={Math.min(99, (user.level ?? 1) * 5)} />
      </div>

      <div className="flex gap-1.5 border-t border-[#d6e0ee] bg-[#f5f8fc] p-2">
        <button onClick={onProfile} className="orkut-btn-blue flex-1 px-2 py-1 text-[11px]">view profile</button>
        <button onClick={onEdit} className="orkut-btn-light flex-1 px-2 py-1 text-[11px]">edit</button>
      </div>
    </div>
  );
}

function StatLine({ icon: Icon, label, value }: { icon: typeof Heart; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="flex items-center gap-1.5">
        <Icon className="h-3 w-3 text-[#ff66aa]" />
        <span className="text-[10px] uppercase tracking-wider text-[#5a6b85]">{label}</span>
      </span>
      <span className="font-bold tabular-nums text-[#1d4488]">{value}</span>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col gap-0 bg-white py-2">
      <span className="text-[13px] font-black tabular-nums text-[#1d4488]">{value}</span>
      <span className="text-[9px] uppercase tracking-wider text-[#5a6b85]">{label}</span>
    </div>
  );
}

/* ============================ Profile stats widget ============================ */

function OrkutProfileStats({ fans }: { fans: number }) {
  // Stable per-day "fortune" so it doesn't shuffle on every render.
  const fortunes = [
    "Lucky day ahead 🌟",
    "A new friend awaits 💌",
    "Sweet scraps in store 💖",
    "Smile, you're cool 😎",
    "Music will find you 🎵",
    "Reconnect with someone 📞",
    "Adventure incoming ✨",
  ];
  const day = new Date();
  const fortune = fortunes[(day.getDate() + day.getMonth()) % fortunes.length];

  return (
    <div className="orkut-card">
      <div className="orkut-card-header">
        <Eye className="h-3.5 w-3.5" />
        <span>profile stats</span>
      </div>
      <ul className="divide-y divide-[#d6e0ee] bg-white text-[11px]">
        <li className="flex items-center justify-between px-3 py-1.5">
          <span className="text-[#5a6b85]">profile views</span>
          <span className="font-bold tabular-nums text-[#1d4488]">{280 + fans * 4}</span>
        </li>
        <li className="flex items-center justify-between px-3 py-1.5">
          <span className="text-[#5a6b85]">recent visitors</span>
          <span className="font-bold tabular-nums text-[#1d4488]">{Math.max(1, Math.min(fans, 9))}</span>
        </li>
        <li className="flex items-start justify-between gap-2 px-3 py-1.5">
          <span className="text-[#5a6b85]">today's fortune</span>
          <span className="text-right font-bold text-[#d6336c]">{fortune}</span>
        </li>
      </ul>
    </div>
  );
}

/* ============================ Quick links ============================ */

function OrkutQuickLinks({
  onProfile,
  onFindFriends,
  onMessages,
  onAccount,
  onThemes,
}: {
  onProfile: () => void;
  onFindFriends: () => void;
  onMessages: () => void;
  onAccount: () => void;
  onThemes: () => void;
}) {
  const navigate = useNavigate();
  const scrollToScrapbook = () => {
    if (typeof window === "undefined") return;
    const el = document.querySelector('[data-orkut-scrapbook]') as HTMLElement | null;
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const logout = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/welcome" });
  };
  const items: { icon: typeof Heart; label: string; onClick: () => void }[] = [
    { icon: Smile, label: "profile", onClick: onProfile },
    { icon: ScrollText, label: "scrapbook", onClick: scrollToScrapbook },
    { icon: ImageIcon, label: "photos", onClick: scrollToScrapbook },
    { icon: Users, label: "friends", onClick: onFindFriends },
    { icon: Star, label: "communities", onClick: () => navigate({ to: "/groups" }) },
    { icon: MessageCircle, label: "messages", onClick: onMessages },
    { icon: Palette, label: "themes", onClick: onThemes },
    { icon: Settings, label: "account", onClick: onAccount },
    { icon: LogOut, label: "logout", onClick: logout },
  ];
  return (
    <div className="orkut-card">
      <div className="orkut-card-header">
        <Bookmark className="h-3.5 w-3.5" />
        <span>quick links</span>
      </div>
      <ul className="bg-white p-1.5 text-[11px]">
        {items.map((it) => {
          const Icon = it.icon;
          return (
            <li key={it.label}>
              <button
                onClick={it.onClick}
                data-tip={`go to ${it.label}`}
                className="orkut-tip flex w-full items-center gap-2 rounded-sm px-2 py-1 text-left text-[#3b4a66] transition hover:bg-[#eef3fa] hover:text-[#1d4488]"
              >
                <Icon className="h-3 w-3 text-[#ff66aa]" />
                <span className="font-semibold">{it.label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* ============================ Status box ============================ */

function OrkutStatusBox({ name, authorId, onPosted }: { name: string; authorId: string; onPosted: () => void }) {
  const [text, setText] = useState("");
  const [posting, setPosting] = useState(false);
  const submit = async () => {
    const body = text.trim();
    if (!body || posting) return;
    setPosting(true);
    const slug =
      body.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 60) ||
      `status-${Date.now()}`;
    const { error } = await supabase.from("posts").insert({
      author_id: authorId,
      owner_id: authorId,
      kind: "text",
      text: body,
      slug,
      media_urls: [],
      privacy: "public",
      is_anonymous: false,
      hashtags: [],
    });
    setPosting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Status updated ✨");
    setText("");
    onPosted();
  };
  return (
    <div className="orkut-card">
      <div className="orkut-card-header">
        <Smile className="h-3.5 w-3.5" />
        <span>what are you doing, {name.toLowerCase()}?</span>
      </div>
      <div className="space-y-2 bg-white p-3">
        <div className="flex items-start gap-2 rounded-sm border border-[#b5c7e0] bg-[#fbfcfe] p-2">
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="grid h-6 w-6 shrink-0 place-items-center rounded-sm border border-[#d6e0ee] bg-white text-base hover:bg-[#fff8e0]"
                title="add emoji"
              >
                🙂
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-72 p-0" align="start">
              <EmojiPicker onPick={(e) => setText((t) => (t + e).slice(0, 140))} />
            </PopoverContent>
          </Popover>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
            placeholder="share a quick update… (e.g. listening to old hindi songs 🎶)"
            className="w-full bg-transparent text-[12px] text-[#1d2942] outline-none placeholder:text-[#7d8da5]"
            maxLength={140}
          />
          <span className="text-[10px] text-[#7d8da5] tabular-nums">{text.length}/140</span>
        </div>
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => setText("")}
            className="orkut-btn-light px-3 py-1 text-[11px]"
            disabled={!text}
          >
            cancel
          </button>
          <button
            onClick={submit}
            className="orkut-btn-blue px-3 py-1 text-[11px]"
            disabled={!text.trim() || posting}
          >
            {posting ? "updating…" : "update status"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================ Social counters ============================ */

function OrkutSocialCounters({
  posts,
  photos,
  fans,
  messages,
  friends,
}: {
  posts: number;
  photos: number;
  fans: number;
  messages: number;
  friends: number;
}) {
  const items = [
    { icon: ScrollText, label: "posts", value: posts },
    { icon: ImageIcon, label: "photos", value: photos },
    { icon: Heart, label: "fans", value: fans },
    { icon: MessageCircle, label: "messages", value: messages },
    { icon: Users, label: "friends", value: friends },
  ];
  return (
    <div className="orkut-card">
      <div className="grid grid-cols-5 divide-x divide-[#d6e0ee] bg-white">
        {items.map((it) => {
          const Icon = it.icon;
          return (
            <div key={it.label} className="flex flex-col items-center gap-0.5 px-2 py-2.5 text-center">
              <Icon className="h-3.5 w-3.5 text-[#ff66aa]" />
              <span className="text-sm font-black tabular-nums text-[#1d4488]">{it.value}</span>
              <span className="text-[9px] uppercase tracking-wider text-[#5a6b85]">{it.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ============================ Friend suggestions ============================ */

function OrkutFriendSuggestions({
  users,
  friendIds,
  meId,
  onOpenProfile,
}: {
  users: User[];
  friendIds: Set<string>;
  meId: string;
  onOpenProfile: (u: string) => void;
}) {
  const [pending, setPending] = useState<Set<string>>(new Set());
  const [sent, setSent] = useState<Set<string>>(new Set());

  async function addFriend(otherId: string) {
    if (!otherId || otherId === meId) return;
    setPending((p) => new Set(p).add(otherId));
    const { error } = await supabase
      .from("friendships")
      .insert({ sender_id: meId, receiver_id: otherId, status: "pending" });
    setPending((p) => {
      const n = new Set(p);
      n.delete(otherId);
      return n;
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Friend request sent ✨");
    setSent((s) => new Set(s).add(otherId));
  }

  const visible = users.filter((u) => !friendIds.has(u.id));
  if (visible.length === 0) return null;
  return (
    <div className="orkut-card">
      <div className="orkut-card-header">
        <UserPlus className="h-3.5 w-3.5" />
        <span>friend suggestions by BooBubble</span>
      </div>
      <div className="flex gap-2 overflow-x-auto bg-white p-3">
        {visible.map((u) => {
          const isPending = pending.has(u.id);
          const isSent = sent.has(u.id);
          return (
            <div
              key={u.id}
              className="orkut-tip min-w-[110px] shrink-0 rounded-sm border border-[#d6e0ee] bg-[#fbfcfe] p-2 text-center transition hover:border-[#1d4488] hover:bg-white"
              data-tip={`view ${u.name}'s profile`}
            >
              <button
                onClick={() => onOpenProfile(u.name)}
                className="mx-auto block rounded-sm border border-[#b5c7e0] bg-white p-0.5"
              >
                <Avatar user={u} size={52} />
              </button>
              <button
                onClick={() => onOpenProfile(u.name)}
                className="mt-1.5 block w-full truncate text-[11px] font-bold text-[#1d4488] hover:underline"
              >
                {u.name}
              </button>
              <button
                onClick={() => addFriend(u.id)}
                disabled={isPending || isSent}
                className={`orkut-tip mt-1.5 w-full px-1 py-0.5 text-[10px] ${isSent ? "orkut-btn-light" : "orkut-btn-blue"}`}
                data-tip={isSent ? "request sent" : "send friend request"}
              >
                {isPending ? "sending…" : isSent ? "✓ sent" : "+ add friend"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ============================ Right: friends grid ============================ */

function OrkutFriendsPanel({
  friends,
  onOpenProfile,
  onFindFriends,
}: {
  friends: User[];
  onOpenProfile: (u: string) => void;
  onFindFriends: () => void;
}) {
  const [q, setQ] = useState("");
  const filtered = friends.filter((f) => f.name.toLowerCase().includes(q.toLowerCase())).slice(0, 9);
  return (
    <div className="orkut-card">
      <div className="orkut-card-header">
        <Users className="h-3.5 w-3.5" />
        <span>my friends ({friends.length})</span>
      </div>
      <div className="space-y-2 bg-white p-3">
        <div className="flex items-center gap-1 rounded-sm border border-[#b5c7e0] bg-[#fbfcfe] px-1.5 py-0.5">
          <Search className="h-3 w-3 text-[#7d8da5]" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="search friends"
            className="w-full bg-transparent py-0.5 text-[11px] outline-none placeholder:text-[#7d8da5]"
          />
        </div>
        {filtered.length === 0 ? (
          <div className="rounded-sm border border-dashed border-[#b5c7e0] p-3 text-center text-[10px] italic text-[#5a6b85]">
            {friends.length === 0 ? "no friends yet — add some!" : "no matches"}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-1.5">
            {filtered.map((f) => (
              <button
                key={f.id}
                onClick={() => onOpenProfile(f.name)}
                className="group flex flex-col items-center gap-1 rounded-sm border border-transparent p-1 text-center hover:border-[#b5c7e0] hover:bg-[#eef3fa]"
                title={f.name}
              >
                <span className="rounded-sm border border-[#b5c7e0] bg-white p-0.5">
                  <Avatar user={f} size={44} />
                </span>
                <span className="line-clamp-1 w-full text-[10px] font-bold text-[#1d4488]">{f.name}</span>
              </button>
            ))}
          </div>
        )}
        <button onClick={onFindFriends} className="orkut-btn-light w-full px-2 py-1 text-[11px]">
          find more friends
        </button>
      </div>
    </div>
  );
}

/* ============================ Promoted users ============================ */

function OrkutPromotedUsers({
  users,
  onOpenProfile,
}: {
  users: User[];
  onOpenProfile: (u: string) => void;
}) {
  if (users.length === 0) return null;
  return (
    <div className="orkut-card orkut-promoted">
      <div className="orkut-card-header orkut-header-glossy">
        <Gift className="h-3.5 w-3.5" />
        <span>promoted users</span>
        <span className="ml-auto text-[9px] font-bold uppercase tracking-wider opacity-90">★ sponsored</span>
      </div>
      <ul className="divide-y divide-[#d6e0ee] bg-white">
        {users.map((u) => (
          <li key={u.id}>
            <button
              onClick={() => onOpenProfile(u.name)}
              className="orkut-tip flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-[#eef3fa]"
              data-tip={`visit ${u.name}'s profile`}
            >
              <span className="rounded-sm border-2 border-[#b5c7e0] bg-white p-0.5 shadow-[0_1px_2px_rgba(29,68,136,0.15)]">
                <Avatar user={u} size={28} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[11px] font-bold text-[#1d4488]">{u.name}</span>
                <span className="text-[9px] uppercase tracking-wider text-[#5a6b85]">featured · lvl {u.level ?? 1}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ============================ Promoted groups ============================ */

const ORKUT_PROMOTED_GROUPS = [
  { name: "Retro Web Lovers", members: "5.2k", emoji: "💾", tag: "nostalgia" },
  { name: "Bollywood Classics", members: "9.1k", emoji: "🎬", tag: "movies" },
  { name: "Late Night Scrappers", members: "1.7k", emoji: "🌙", tag: "chill" },
];

function OrkutPromotedGroups() {
  return (
    <div className="orkut-card orkut-promoted">
      <div className="orkut-card-header orkut-header-glossy">
        <Star className="h-3.5 w-3.5" />
        <span>promoted groups</span>
        <span className="ml-auto text-[9px] font-bold uppercase tracking-wider opacity-90">★ sponsored</span>
      </div>
      <ul className="divide-y divide-[#d6e0ee] bg-white">
        {ORKUT_PROMOTED_GROUPS.map((g) => (
          <li key={g.name} className="flex items-center gap-2 px-3 py-2">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-sm border-2 border-[#b5c7e0] bg-gradient-to-br from-[#eef3fa] to-white text-base shadow-[0_1px_2px_rgba(29,68,136,0.15)]">
              {g.emoji}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[11px] font-bold text-[#1d4488]">{g.name}</span>
              <span className="text-[9px] uppercase tracking-wider text-[#5a6b85]">{g.tag} · {g.members}</span>
            </span>
            <button
              className="orkut-btn-blue orkut-tip px-2 py-0.5 text-[10px]"
              data-tip={`join ${g.name}`}
            >
              join
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ============================ Testimonials ============================ */

function OrkutTestimonials({ friends, onOpenProfile }: { friends: User[]; onOpenProfile: (u: string) => void }) {
  const sample = friends.slice(0, 2);
  return (
    <div className="orkut-card">
      <div className="orkut-card-header">
        <Quote className="h-3.5 w-3.5" />
        <span>testimonials</span>
      </div>
      <div className="space-y-2 bg-white p-3 text-[11px]">
        {sample.length === 0 ? (
          <div className="rounded-sm border border-dashed border-[#b5c7e0] p-2 text-center italic text-[#5a6b85]">
            no testimonials yet. add friends to receive scraps of love.
          </div>
        ) : (
          sample.map((u, i) => (
            <button
              key={u.id}
              onClick={() => onOpenProfile(u.name)}
              className="block w-full rounded-sm border border-[#d6e0ee] bg-[#fbfcfe] p-2 text-left transition hover:border-[#1d4488] hover:bg-white"
            >
              <div className="flex items-center gap-2">
                <Avatar user={u} size={24} />
                <span className="text-[11px] font-bold text-[#1d4488]">{u.name}</span>
              </div>
              <p className="mt-1 italic leading-snug text-[#3b4a66]">
                {i === 0
                  ? "the coolest person on this feed — always brings the vibes 💖"
                  : "old school internet friend, 10/10 would scrap again 🌸"}
              </p>
            </button>
          ))
        )}
        <button className="orkut-btn-pink w-full px-2 py-1 text-[11px]">+ write a testimonial</button>
      </div>
    </div>
  );
}

/* ============================ Communities ============================ */

const ORKUT_COMMUNITIES = [
  { name: "Music Lovers", members: "12.4k", emoji: "🎵" },
  { name: "SEO Masters", members: "3.1k", emoji: "🔎" },
  { name: "Movie Club", members: "8.7k", emoji: "🎬" },
  { name: "I love early 2000s internet", members: "2.4k", emoji: "💾" },
  { name: "Scrapbook Artists", members: "920", emoji: "🎨" },
];

function OrkutCommunities() {
  return (
    <div className="orkut-card">
      <div className="orkut-card-header">
        <Star className="h-3.5 w-3.5" />
        <span>top communities</span>
      </div>
      <ul className="divide-y divide-[#d6e0ee] bg-white">
        {ORKUT_COMMUNITIES.map((c) => (
          <li key={c.name} className="flex items-center gap-2 px-3 py-2">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-sm border border-[#b5c7e0] bg-[#eef3fa] text-base">
              {c.emoji}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[11px] font-bold text-[#1d4488]">{c.name}</span>
              <span className="text-[10px] text-[#5a6b85]">{c.members} members</span>
            </span>
            <button className="orkut-btn-blue px-2 py-0.5 text-[10px]">join</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ============================ Fans counter ============================ */

function OrkutFanCounter({ fans }: { fans: number }) {
  return (
    <div className="orkut-card">
      <div className="orkut-card-header" style={{ background: "linear-gradient(180deg, #ff85b8, #ff66aa 50%, #e64f93)" }}>
        <Heart className="h-3.5 w-3.5" />
        <span>fan counter</span>
      </div>
      <div className="bg-gradient-to-b from-[#fff0f6] to-white p-3 text-center">
        <div className="text-2xl font-black tabular-nums text-[#d6336c]">{fans}</div>
        <div className="text-[9px] uppercase tracking-[0.2em] text-[#7d8da5]">total fans</div>
      </div>
    </div>
  );
}

/* ============================ Music scrap ============================ */

function OrkutMusicScrap() {
  return (
    <div className="orkut-card">
      <div className="orkut-card-header">
        <Music className="h-3.5 w-3.5" />
        <span>currently listening</span>
      </div>
      <div className="flex items-center gap-2 bg-white p-3 text-[11px]">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-sm border border-[#b5c7e0] bg-gradient-to-br from-[#eef3fa] to-white text-base">
          🎵
        </span>
        <div className="min-w-0">
          <div className="truncate font-bold text-[#1d4488]">Mr. Brightside</div>
          <div className="truncate text-[10px] text-[#5a6b85]">The Killers · 2003</div>
        </div>
      </div>
    </div>
  );
}

/* ============================ Inline theme CSS ============================ */

const ORKUT_CSS = `
.orkut-classic-root {
  font-family: Verdana, Tahoma, Geneva, "DejaVu Sans", Arial, sans-serif;
  background: #e8eef5;
  color: #1d2942;
}
.dark .orkut-classic-root { background: #0f1a2e; color: #e6eaf2; }

.orkut-classic-root .orkut-card {
  background: #ffffff;
  border: 1px solid #b5c7e0;
  border-radius: 4px;
  box-shadow: 0 1px 0 #e6ecf5;
  overflow: hidden;
}
.dark .orkut-classic-root .orkut-card { background: #16223a; border-color: #2a3a5c; box-shadow: 0 1px 0 #0b1426; }

.orkut-classic-root .orkut-card-header {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 10px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.02em;
  color: #ffffff;
  background: linear-gradient(180deg, ${ORKUT_BLUE_LIGHT} 0%, ${ORKUT_BLUE} 55%, ${ORKUT_BLUE_DARK} 100%);
  border-bottom: 1px solid ${ORKUT_BLUE_DARK};
  text-shadow: 0 1px 0 rgba(0,0,0,0.2);
}

/* Glossy navbar */
.orkut-classic-root .orkut-navbar {
  background:
    linear-gradient(180deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 50%),
    linear-gradient(180deg, ${ORKUT_BLUE_LIGHT} 0%, ${ORKUT_BLUE} 55%, ${ORKUT_BLUE_DARK} 100%);
  border-bottom: 1px solid ${ORKUT_BLUE_DARK};
}
.orkut-classic-root .orkut-logo {
  font-family: Verdana, Tahoma, Arial, sans-serif;
  font-weight: 900;
  font-size: 22px;
  letter-spacing: -1px;
  color: #ffffff;
  text-shadow: 0 1px 0 rgba(0,0,0,0.25);
  padding: 0 2px;
}
.orkut-classic-root .orkut-tab {
  border-radius: 3px 3px 0 0;
  font-size: 11px;
}
.orkut-classic-root .orkut-tab:active { transform: translateY(1px); }

/* Buttons — glossy classic */
.orkut-classic-root .orkut-btn-blue {
  display: inline-flex; align-items: center; justify-content: center;
  border: 1px solid ${ORKUT_BLUE_DARK};
  background: linear-gradient(180deg, #6f93cf 0%, ${ORKUT_BLUE_LIGHT} 50%, ${ORKUT_BLUE} 100%);
  color: #ffffff;
  font-weight: 700;
  border-radius: 3px;
  text-shadow: 0 1px 0 rgba(0,0,0,0.2);
  transition: filter 120ms ease, transform 80ms ease;
}
.orkut-classic-root .orkut-btn-blue:hover { filter: brightness(1.08); }
.orkut-classic-root .orkut-btn-blue:active { transform: translateY(1px); filter: brightness(0.95); }
.orkut-classic-root .orkut-btn-blue:disabled { opacity: 0.55; cursor: not-allowed; }

.orkut-classic-root .orkut-btn-light {
  display: inline-flex; align-items: center; justify-content: center;
  border: 1px solid #b5c7e0;
  background: linear-gradient(180deg, #ffffff 0%, #eef3fa 100%);
  color: #1d4488;
  font-weight: 700;
  border-radius: 3px;
  transition: background 120ms ease, transform 80ms ease;
}
.orkut-classic-root .orkut-btn-light:hover { background: linear-gradient(180deg, #ffffff 0%, #dfe8f5 100%); }
.orkut-classic-root .orkut-btn-light:active { transform: translateY(1px); }
.orkut-classic-root .orkut-btn-light:disabled { opacity: 0.55; cursor: not-allowed; }

.orkut-classic-root .orkut-btn-pink {
  display: inline-flex; align-items: center; justify-content: center;
  border: 1px solid #c0327a;
  background: linear-gradient(180deg, #ff9bc4 0%, ${ORKUT_PINK} 55%, #e64f93 100%);
  color: #ffffff;
  font-weight: 700;
  border-radius: 3px;
  text-shadow: 0 1px 0 rgba(0,0,0,0.2);
  transition: filter 120ms ease, transform 80ms ease;
}
.orkut-classic-root .orkut-btn-pink:hover { filter: brightness(1.06); }
.orkut-classic-root .orkut-btn-pink:active { transform: translateY(1px); }

/* Re-skin nested PostCard to feel like an Orkut scrap */
.orkut-classic-root .orkut-post-wrap > * {
  border-radius: 3px !important;
  border: 1px solid #d6e0ee !important;
  background: #ffffff !important;
  box-shadow: 0 1px 0 #eef3fa !important;
}
.dark .orkut-classic-root .orkut-post-wrap > * {
  background: #16223a !important;
  border-color: #2a3a5c !important;
  box-shadow: 0 1px 0 #0b1426 !important;
}

.orkut-brand { font-weight: 900; color: ${ORKUT_BLUE}; letter-spacing: -0.5px; }

/* Glossy header variant for promoted cards */
.orkut-classic-root .orkut-header-glossy {
  background:
    linear-gradient(180deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0) 48%),
    linear-gradient(180deg, #ffd76b 0%, #f0a91a 55%, #c87b00 100%);
  color: #4a2d00;
  text-shadow: 0 1px 0 rgba(255,255,255,0.35);
  border-bottom: 1px solid #a86a00;
}
.orkut-classic-root .orkut-promoted {
  border-color: #d0a64a;
  box-shadow: 0 1px 0 #f5e7c2, 0 0 0 1px #fff5d6 inset;
}

/* Classic nostalgic tooltip — yellow note with thin black border */
.orkut-classic-root .orkut-tip { position: relative; }
.orkut-classic-root .orkut-tip[data-tip]::after {
  content: attr(data-tip);
  position: absolute;
  left: 50%;
  bottom: calc(100% + 6px);
  transform: translateX(-50%) translateY(2px);
  background: #fffbcc;
  color: #3b2a00;
  border: 1px solid #806600;
  box-shadow: 1px 1px 0 rgba(0,0,0,0.15);
  font-family: Verdana, Tahoma, Geneva, Arial, sans-serif;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.02em;
  padding: 3px 7px;
  border-radius: 2px;
  white-space: nowrap;
  pointer-events: none;
  opacity: 0;
  transition: opacity 120ms ease, transform 120ms ease;
  z-index: 60;
}
.orkut-classic-root .orkut-tip[data-tip]::before {
  content: "";
  position: absolute;
  left: 50%;
  bottom: calc(100% + 2px);
  transform: translateX(-50%);
  border: 4px solid transparent;
  border-top-color: #806600;
  opacity: 0;
  transition: opacity 120ms ease;
  z-index: 60;
}
.orkut-classic-root .orkut-tip:hover[data-tip]::after,
.orkut-classic-root .orkut-tip:focus-visible[data-tip]::after {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}
.orkut-classic-root .orkut-tip:hover[data-tip]::before,
.orkut-classic-root .orkut-tip:focus-visible[data-tip]::before {
  opacity: 1;
}
`;

/* keep eslint happy on unused imports if a section is trimmed */
void Camera;
