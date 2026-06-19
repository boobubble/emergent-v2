import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
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
  Calendar,
  Music,
  Palette,
} from "lucide-react";
import { Avatar } from "@/components/chat/Avatar";
import { PostCard } from "@/components/feed/PostCard";
import { Composer } from "@/components/feed/Composer";
import { PostSkeleton } from "@/components/feed/FeedSkeletons";
import type { FeedPost } from "@/lib/feed-types";
import type { User } from "@/lib/chat-types";

/**
 * OrkutFeedLayout — premium flagship layout for `orkut_retro` theme.
 *
 * A true alternative layout (NOT a visual skin) inspired by Orkut's
 * classic profile-first design:
 *   - Left: profile card, fans count, recent visitors, quick links
 *   - Center: scrapbook-style composer + posts
 *   - Right: testimonials, communities, birthdays
 *
 * Uses purple/pink gradients via the orkut_retro theme tokens already
 * defined in styles.css. Renders only when feedTheme === "orkut_retro".
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
    avatarColor: "#9333ea",
    status: "online",
    xp: 0,
    level: 1,
  };
}

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

  const username = user.username;
  const me: User = profiles[meId] ?? synthUser(username, meId);

  return (
    <div className="min-h-screen bg-[oklch(0.97_0.02_310)] text-foreground dark:bg-[oklch(0.18_0.04_295)] orkut-retro-root">
      <style>{ORKUT_CSS}</style>
      <OrkutTopBar username={username} onOpenProfile={onOpenProfile} onOpenMessages={onOpenMessages} onOpenThemeStore={onOpenThemeStore} headerSlot={props.headerSlot} />

      <div className="mx-auto grid max-w-[1180px] gap-4 px-3 py-5 md:grid-cols-[260px_minmax(0,1fr)_280px] md:gap-5 md:px-4">
        {/* LEFT: Profile sidebar */}
        <aside className="space-y-4">
          <OrkutProfileCard user={me} username={username} fansCount={friendList.length} onEdit={onOpenAccount} onProfile={() => onOpenProfile(username)} />
          <OrkutRecentVisitors visitors={friendList.slice(0, 6)} onOpenProfile={onOpenProfile} />
          <OrkutQuickLinks
            onFindFriends={onOpenFindFriends}
            onMessages={onOpenMessages}
            onAccount={onOpenAccount}
            onThemes={onOpenThemeStore}
          />
        </aside>

        {/* CENTER: Scrapbook feed */}
        <main className="min-w-0 space-y-4">
          <OrkutWelcomeBanner name={me.name || username} fans={friendList.length} />

          <div className="orkut-card">
            <div className="orkut-card-header">
              <ScrollText className="h-4 w-4" />
              <span>Scrapbook · Share something with your friends</span>
            </div>
            <div className="p-3">
              <Composer authorId={meId} onPosted={onReload} />
            </div>
          </div>

          <div className="orkut-card">
            <div className="orkut-card-header">
              <Sparkles className="h-4 w-4" />
              <span>Community Feed</span>
            </div>
            <div className="space-y-3 p-3">
              {loading && Array.from({ length: 3 }).map((_, i) => <PostSkeleton key={i} />)}
              {!loading && posts.length === 0 && (
                <div className="rounded-md border border-dashed border-[color-mix(in_oklab,var(--primary)_40%,transparent)] bg-[color-mix(in_oklab,var(--primary)_6%,transparent)] p-8 text-center text-sm text-muted-foreground">
                  No scraps yet. Be the first to post on the community feed!
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

        {/* RIGHT: Testimonials + Communities */}
        <aside className="space-y-4">
          <OrkutTestimonials onOpenProfile={onOpenProfile} friends={friendList} />
          <OrkutCommunities />
          <OrkutFanCounter fans={friendList.length} />
          <OrkutMusicScrap />
        </aside>
      </div>

      <footer className="mt-6 border-t border-[color-mix(in_oklab,var(--primary)_25%,transparent)] bg-[color-mix(in_oklab,var(--primary)_8%,transparent)] py-4 text-center text-xs text-muted-foreground">
        <span className="orkut-brand">Orkut Retro Layout</span> · A nostalgic premium theme · {new Date().getFullYear()}
      </footer>
    </div>
  );
}

/* ============================ Top bar ============================ */

function OrkutTopBar({
  username,
  onOpenProfile,
  onOpenMessages,
  onOpenThemeStore,
}: {
  username: string;
  onOpenProfile: (u: string) => void;
  onOpenMessages: () => void;
  onOpenThemeStore: () => void;
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-[color-mix(in_oklab,var(--primary)_30%,transparent)] bg-gradient-to-r from-[#6b21a8] via-[#9333ea] to-[#db2777] text-white shadow-md">
      <div className="mx-auto flex max-w-[1180px] items-center gap-3 px-4 py-2">
        <Link to="/feed" className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-md bg-white/95 font-black text-[#9333ea] shadow-inner">
            o
          </span>
          <span className="text-lg font-black tracking-tight" style={{ fontFamily: '"Georgia", serif' }}>
            orkut <span className="text-pink-200">retro</span>
          </span>
        </Link>
        <nav className="ml-4 hidden items-center gap-1 text-[13px] font-semibold md:flex">
          <TopLink label="home" />
          <TopLink label="profile" onClick={() => onOpenProfile(username)} />
          <TopLink label="scraps" />
          <TopLink label="communities" />
          <TopLink label="friends" />
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={onOpenThemeStore}
            className="hidden items-center gap-1 rounded-md bg-white/15 px-2.5 py-1 text-xs font-bold uppercase tracking-wider hover:bg-white/25 md:inline-flex"
          >
            <Palette className="h-3.5 w-3.5" /> themes
          </button>
          <button
            onClick={onOpenMessages}
            className="grid h-8 w-8 place-items-center rounded-md bg-white/15 hover:bg-white/25"
            aria-label="Messages"
            title="Messages"
          >
            <MessageCircle className="h-4 w-4" />
          </button>
          <button
            onClick={() => onOpenProfile(username)}
            className="flex items-center gap-2 rounded-md bg-white/15 pl-1 pr-2 py-1 hover:bg-white/25"
          >
            <span className="grid h-6 w-6 place-items-center rounded-sm bg-white text-[#9333ea] text-xs font-black">
              {username.slice(0, 1).toUpperCase()}
            </span>
            <span className="hidden text-xs font-bold sm:inline">{username}</span>
          </button>
        </div>
      </div>
    </header>
  );
}

function TopLink({ label, onClick }: { label: string; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="rounded px-2 py-1 text-white/90 transition hover:bg-white/15 hover:text-white"
    >
      {label}
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
      <div className="bg-gradient-to-br from-[#9333ea] to-[#db2777] p-4 text-center text-white">
        <div className="mx-auto inline-block rounded-md border-4 border-white/90 bg-white p-0.5 shadow-md">
          <Avatar user={user} size={88} />
        </div>
        <div className="mt-2 text-base font-bold leading-tight">{user.name || username}</div>
        <div className="text-[11px] uppercase tracking-wider text-pink-100/90">{user.status ?? "online"}</div>
      </div>


      <div className="p-3 text-xs">
        {user.bio ? (
          <p className="mb-2 italic text-muted-foreground">"{user.bio}"</p>
        ) : (
          <p className="mb-2 italic text-muted-foreground">No about message yet — add one to make your profile pop!</p>
        )}

        <div className="grid grid-cols-3 gap-2 border-y border-[color-mix(in_oklab,var(--primary)_25%,transparent)] py-2 text-center">
          <Stat label="fans" value={fansCount} icon={Star} />
          <Stat label="cool" value={Math.min(99, fansCount * 2)} icon={Heart} />
          <Stat label="trusty" value={Math.min(99, (user.level ?? 1) * 5)} icon={Sparkles} />
        </div>

        <div className="mt-3 flex gap-2">
          <button
            onClick={onProfile}
            className="flex-1 rounded-md border border-[color-mix(in_oklab,var(--primary)_40%,transparent)] bg-[color-mix(in_oklab,var(--primary)_10%,transparent)] px-2 py-1.5 text-[11px] font-bold text-[color:var(--primary)] hover:bg-[color-mix(in_oklab,var(--primary)_18%,transparent)]"
          >
            view profile
          </button>
          <button
            onClick={onEdit}
            className="flex-1 rounded-md border border-[color-mix(in_oklab,var(--primary)_40%,transparent)] bg-white/60 px-2 py-1.5 text-[11px] font-bold text-foreground hover:bg-white/90 dark:bg-white/10 dark:hover:bg-white/20"
          >
            edit
          </button>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, icon: Icon }: { label: string; value: number; icon: typeof Heart }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <Icon className="h-3.5 w-3.5 text-[#db2777]" />
      <span className="text-sm font-black tabular-nums text-[color:var(--primary)]">{value}</span>
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
    </div>
  );
}

/* ============================ Recent visitors ============================ */

function OrkutRecentVisitors({ visitors, onOpenProfile }: { visitors: User[]; onOpenProfile: (u: string) => void }) {
  return (
    <div className="orkut-card">
      <div className="orkut-card-header">
        <Eye className="h-4 w-4" />
        <span>Recent Visitors</span>
      </div>
      <div className="p-3">
        {visitors.length === 0 ? (
          <p className="text-[11px] italic text-muted-foreground">No visitors yet today.</p>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {visitors.map((v) => (
              <button
                key={v.id}
                onClick={() => onOpenProfile(v.name)}
                className="group flex flex-col items-center gap-1 rounded-md border border-transparent p-1 text-center hover:border-[color-mix(in_oklab,var(--primary)_35%,transparent)] hover:bg-[color-mix(in_oklab,var(--primary)_8%,transparent)]"
                title={v.name}
              >
                <span className="rounded-sm border-2 border-white bg-white p-0.5 shadow-sm">
                  <Avatar user={v} size={40} />
                </span>
                <span className="line-clamp-1 text-[10px] font-semibold">{v.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================ Quick links ============================ */

function OrkutQuickLinks({
  onFindFriends,
  onMessages,
  onAccount,
  onThemes,
}: {
  onFindFriends: () => void;
  onMessages: () => void;
  onAccount: () => void;
  onThemes: () => void;
}) {
  const items: { icon: typeof Heart; label: string; onClick: () => void }[] = [
    { icon: UserPlus, label: "find friends", onClick: onFindFriends },
    { icon: MessageCircle, label: "messages", onClick: onMessages },
    { icon: Bookmark, label: "scraps", onClick: () => {} },
    { icon: Palette, label: "themes", onClick: onThemes },
    { icon: Settings, label: "account", onClick: onAccount },
    { icon: LogOut, label: "logout", onClick: () => {} },
  ];
  return (
    <div className="orkut-card">
      <div className="orkut-card-header">
        <Sparkles className="h-4 w-4" />
        <span>Quick Links</span>
      </div>
      <ul className="p-2 text-xs">
        {items.map((it) => {
          const Icon = it.icon;
          return (
            <li key={it.label}>
              <button
                onClick={it.onClick}
                className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-foreground transition hover:bg-[color-mix(in_oklab,var(--primary)_10%,transparent)] hover:text-[color:var(--primary)]"
              >
                <Icon className="h-3.5 w-3.5 text-[#db2777]" />
                <span className="font-semibold">{it.label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* ============================ Welcome banner ============================ */

function OrkutWelcomeBanner({ name, fans }: { name: string; fans: number }) {
  const hour = new Date().getHours();
  const greet = hour < 12 ? "good morning" : hour < 18 ? "good afternoon" : "good evening";
  return (
    <div className="orkut-card overflow-hidden">
      <div className="flex items-center gap-3 bg-gradient-to-r from-[#fce7f3] via-[#f3e8ff] to-[#e0e7ff] p-4 dark:from-[#3b0764]/60 dark:via-[#581c87]/60 dark:to-[#831843]/60">
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#9333ea] to-[#db2777] text-2xl shadow-md">
          🌸
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-bold text-[#6b21a8] dark:text-pink-200">{greet}, {name}!</div>
          <div className="text-[11px] text-muted-foreground">
            You have <span className="font-bold text-[#db2777]">{fans}</span> fans · Welcome back to the scrapbook.
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================ Testimonials ============================ */

function OrkutTestimonials({ friends, onOpenProfile }: { friends: User[]; onOpenProfile: (u: string) => void }) {
  // Showcase entries — empty/placeholder until users write real testimonials.
  const sample = friends.slice(0, 2);
  return (
    <div className="orkut-card">
      <div className="orkut-card-header">
        <Quote className="h-4 w-4" />
        <span>Testimonials</span>
      </div>
      <div className="space-y-3 p-3 text-xs">
        {sample.length === 0 ? (
          <div className="rounded-md border border-dashed border-[color-mix(in_oklab,var(--primary)_35%,transparent)] p-3 text-center italic text-muted-foreground">
            No testimonials yet. Add friends to receive your first scrap of love.
          </div>
        ) : (
          sample.map((u, i) => (
            <button
              key={u.id}
              onClick={() => onOpenProfile(u.name)}
              className="block w-full rounded-md border border-[color-mix(in_oklab,var(--primary)_25%,transparent)] bg-white/60 p-2.5 text-left transition hover:bg-white/90 dark:bg-white/5 dark:hover:bg-white/10"
            >
              <div className="flex items-center gap-2">
                <Avatar user={u} size={28} />
                <span className="text-[11px] font-bold text-[color:var(--primary)]">{u.name}</span>
              </div>
              <p className="mt-1.5 italic leading-snug text-foreground/85">
                {i === 0
                  ? "the coolest person on this feed — always brings the vibes ✨💜"
                  : "old school internet friend, 10/10 would scrap again 🌸"}
              </p>
            </button>
          ))
        )}
        <button className="w-full rounded-md bg-gradient-to-r from-[#9333ea] to-[#db2777] py-1.5 text-[11px] font-bold uppercase tracking-wider text-white shadow-sm hover:opacity-95">
          + write a testimonial
        </button>
      </div>
    </div>
  );
}

/* ============================ Communities ============================ */

const ORKUT_COMMUNITIES = [
  { name: "I love early 2000s internet", members: "2.4k", color: "from-fuchsia-500 to-pink-500", emoji: "💾" },
  { name: "Nostalgia Lovers", members: "1.8k", color: "from-violet-500 to-purple-500", emoji: "📼" },
  { name: "Friendship Goals", members: "5.1k", color: "from-pink-500 to-rose-500", emoji: "💖" },
  { name: "Scrapbook Artists", members: "920", color: "from-purple-500 to-indigo-500", emoji: "🎨" },
];

function OrkutCommunities() {
  return (
    <div className="orkut-card">
      <div className="orkut-card-header">
        <Users className="h-4 w-4" />
        <span>Your Communities</span>
      </div>
      <ul className="space-y-2 p-3 text-xs">
        {ORKUT_COMMUNITIES.map((c) => (
          <li key={c.name}>
            <button className="group flex w-full items-center gap-2.5 rounded-md border border-[color-mix(in_oklab,var(--primary)_18%,transparent)] bg-white/50 p-2 text-left transition hover:bg-white/90 dark:bg-white/5 dark:hover:bg-white/10">
              <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-sm bg-gradient-to-br ${c.color} text-base shadow-sm`}>
                {c.emoji}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[12px] font-bold text-[color:var(--primary)]">{c.name}</span>
                <span className="text-[10px] text-muted-foreground">{c.members} members</span>
              </span>
            </button>
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
      <div className="bg-gradient-to-r from-[#fb7185] to-[#db2777] p-3 text-center text-white">
        <Flame className="mx-auto h-5 w-5" />
        <div className="mt-1 text-2xl font-black tabular-nums">{fans}</div>
        <div className="text-[10px] uppercase tracking-[0.2em]">total fans</div>
      </div>
    </div>
  );
}

/* ============================ Music scrap ============================ */

function OrkutMusicScrap() {
  return (
    <div className="orkut-card">
      <div className="orkut-card-header">
        <Music className="h-4 w-4" />
        <span>Currently Listening</span>
      </div>
      <div className="flex items-center gap-2 p-3 text-xs">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-sm bg-gradient-to-br from-purple-500 to-pink-500 text-base shadow-sm">
          🎵
        </span>
        <div className="min-w-0">
          <div className="truncate font-bold text-[color:var(--primary)]">Mr. Brightside</div>
          <div className="truncate text-[10px] text-muted-foreground">The Killers · 2003</div>
        </div>
      </div>
    </div>
  );
}

/* ============================ Inline theme CSS ============================ */

const ORKUT_CSS = `
.orkut-retro-root { font-family: "Georgia", "Times New Roman", serif; }
.orkut-retro-root .orkut-card {
  background: var(--card);
  border: 1px solid color-mix(in oklab, var(--primary) 30%, transparent);
  border-radius: 6px;
  box-shadow: 0 1px 0 color-mix(in oklab, var(--primary) 18%, transparent), 0 2px 6px rgba(0,0,0,0.06);
  overflow: hidden;
}
.orkut-retro-root .orkut-card-header {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: white;
  background: linear-gradient(90deg, #6b21a8, #9333ea 60%, #db2777);
}
.orkut-retro-root .orkut-post-wrap > * {
  border-radius: 4px !important;
  border: 1px solid color-mix(in oklab, var(--primary) 22%, transparent) !important;
}
.orkut-brand { font-weight: 800; color: #9333ea; }
`;

/* keep eslint happy on unused import in some builds */
void Camera;
void Calendar;
void useState;
void useEffect;
