import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Home, Users, Sparkles, Flame, Clock, UserCircle, Settings, MessageCircle } from "lucide-react";
import chatroomIcon from "@/assets/chatroom-icon.jpg";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-store";
import { useRemoteProfiles } from "@/lib/use-remote-profiles";
import { Composer } from "@/components/feed/Composer";
import { PostCard } from "@/components/feed/PostCard";
import { FriendsWidget, HashtagsWidget, ChatroomOnlineWidget } from "@/components/feed/SideWidgets";
import { AccountPanel } from "@/components/feed/AccountPanel";
import { ProfilePanel } from "@/components/feed/ProfilePanel";
import { FeedDMDock } from "@/components/feed/FeedDMDock";
import { FeedNotifications } from "@/components/feed/FeedNotifications";
import { Avatar } from "@/components/chat/Avatar";
import type { FeedPost, FeedFriendship } from "@/lib/feed-types";

export const Route = createFileRoute("/feed")({
  head: () => ({
    meta: [
      { title: "Feed — Palrgo" },
      { name: "description", content: "Share posts, react, comment, and connect with friends on Palrgo." },
      { property: "og:title", content: "Feed — Palrgo" },
      { property: "og:description", content: "Lightweight social feed for the Palrgo community." },
    ],
  }),
  component: FeedPage,
});

type Tab = "foryou" | "trending" | "latest" | "friends";
type View = "feed" | "account" | "profile";

function getInitialView(): { view: View; username: string } {
  if (typeof window === "undefined") return { view: "feed", username: "" };
  const sp = new URLSearchParams(window.location.search);
  if (sp.get("u")) return { view: "profile", username: sp.get("u") || "" };
  if (sp.get("tab") === "account") return { view: "account", username: "" };
  return { view: "feed", username: "" };
}

function FeedPage() {
  const { user } = useAuth();
  const { profiles } = useRemoteProfiles();
  const [tab, setTab] = useState<Tab>("foryou");
  const initial = getInitialView();
  const [view, setView] = useState<View>(initial.view);
  const [profileUsername, setProfileUsername] = useState<string>(initial.username);
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [friendIds, setFriendIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [dmOpenKey, setDmOpenKey] = useState(0);

  const meId = user?.id ?? "";

  // Daily streak ping on mount
  useEffect(() => {
    if (!meId) return;
    (async () => {
      const today = new Date().toISOString().slice(0, 10);
      const { data: p } = await supabase.from("profiles").select("last_active_day, streak, longest_streak").eq("id", meId).maybeSingle();
      if (!p) return;
      if (p.last_active_day === today) return;
      const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
      const next = p.last_active_day === yesterday ? (p.streak ?? 0) + 1 : 1;
      await supabase.from("profiles").update({
        last_active_day: today,
        streak: next,
        longest_streak: Math.max(p.longest_streak ?? 0, next),
      }).eq("id", meId);
    })();
  }, [meId]);

  // Load friendships
  useEffect(() => {
    if (!meId) return;
    async function loadF() {
      const { data } = await supabase.from("friendships").select("*").eq("status", "accepted");
      const ids = new Set<string>();
      ((data ?? []) as FeedFriendship[]).forEach((f) => {
        ids.add(f.sender_id === meId ? f.receiver_id : f.sender_id);
      });
      setFriendIds(ids);
    }
    loadF();
    const ch = supabase.channel(`feed-fr-${meId}`).on("postgres_changes", { event: "*", schema: "public", table: "friendships" }, () => loadF()).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [meId]);

  // Load posts
  async function loadPosts() {
    setLoading(true);
    const { data } = await supabase.from("posts").select("*").order("created_at", { ascending: false }).limit(50);
    setPosts((data ?? []) as FeedPost[]);
    setLoading(false);
  }

  useEffect(() => {
    if (!meId) return;
    loadPosts();
    const ch = supabase.channel("feed-posts")
      .on("postgres_changes", { event: "*", schema: "public", table: "posts" }, (payload) => {
        if (payload.eventType === "INSERT") setPosts((p) => [payload.new as FeedPost, ...p]);
        else if (payload.eventType === "DELETE") setPosts((p) => p.filter((x) => x.id !== (payload.old as FeedPost).id));
        else if (payload.eventType === "UPDATE") setPosts((p) => p.map((x) => x.id === (payload.new as FeedPost).id ? payload.new as FeedPost : x));
      }).subscribe();
    return () => { supabase.removeChannel(ch); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meId]);

  const filtered = useMemo(() => {
    let list = [...posts];
    if (tab === "trending") {
      list.sort((a, b) => {
        const sa = a.reaction_count * 2 + a.comment_count * 3;
        const sb = b.reaction_count * 2 + b.comment_count * 3;
        return sb - sa;
      });
    } else if (tab === "latest") {
      list.sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
    } else if (tab === "friends") {
      list = list.filter((p) => friendIds.has(p.author_id) || p.author_id === meId);
    } else {
      // For You: newest first, with friends' posts gently boosted
      list.sort((a, b) => {
        const af = friendIds.has(a.author_id) ? 1 : 0;
        const bf = friendIds.has(b.author_id) ? 1 : 0;
        if (af !== bf) return bf - af;
        return +new Date(b.created_at) - +new Date(a.created_at);
      });
    }
    return list;
  }, [posts, tab, friendIds, meId]);

  if (!user) return null;
  if (user.isGuest) {
    return (
      <div className="grid min-h-screen place-items-center bg-background p-6 text-center text-foreground">
        <div className="max-w-sm rounded-3xl border border-border bg-card p-8">
          <div className="text-3xl">👤</div>
          <h1 className="mt-3 text-lg font-bold">Feed isn't available for guests</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Guests can chat in the lobby only. Create an account to post, react, and follow friends in the feed.
          </p>
          <Link to="/" className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
            <ArrowLeft className="h-4 w-4" /> Back to chat
          </Link>
        </div>
      </div>
    );
  }

  const TABS: { id: Tab; label: string; icon: typeof Sparkles }[] = [
    { id: "foryou", label: "For You", icon: Sparkles },
    { id: "trending", label: "Trending", icon: Flame },
    { id: "latest", label: "Latest", icon: Clock },
    { id: "friends", label: "Friends", icon: Users },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground pb-20 md:pb-0">
      {/* Top bar — minimal, white, Facebook-style */}
      <header className="sticky top-0 z-20 border-b border-border bg-card">
        <div className="mx-auto flex max-w-[1280px] items-center gap-4 px-4 py-2.5">
          <Link to="/" className="flex items-center gap-2 text-primary">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground font-bold">P</div>
            <span className="hidden text-lg font-semibold sm:inline">Palrgo</span>
          </Link>
          <div className="mx-auto hidden w-full max-w-md md:block">
            <div className="flex items-center gap-2 rounded-full bg-muted px-4 py-2 text-sm text-muted-foreground">
              <span>Search posts, people, hashtags…</span>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-1">
            <FeedNotifications meId={meId} profiles={profiles} />
            <button
              onClick={() => setDmOpenKey(k => k + 1)}
              className="grid h-9 w-9 place-items-center rounded-full hover:bg-accent"
              title="Messages"
              aria-label="Messages"
            >
              <MessageCircle className="h-5 w-5 text-foreground" />
            </button>
            <button
              onClick={() => { setProfileUsername(user.username); setView("profile"); }}
              className="flex items-center gap-2 rounded-full px-2 py-1 hover:bg-accent"
              title="My profile"
            >
              <div className="grid h-8 w-8 place-items-center rounded-full bg-primary/15 text-primary text-sm font-semibold">
                {user.username.slice(0, 1).toUpperCase()}
              </div>
              <span className="hidden text-sm font-medium sm:inline">{user.username}</span>
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1280px] gap-3 px-2 py-3 sm:gap-5 sm:px-4 sm:py-5 lg:grid-cols-[260px_minmax(0,1fr)_300px]">
        {/* Left rail — minimal nav card */}
        <aside className="hidden lg:block">
          <nav className="sticky top-20 rounded-2xl bg-card p-2 shadow-sm border border-border">
            <SideItem active={view === "feed"} onClick={() => setView("feed")} icon={Sparkles} label="News Feed" />
            <SideItem onClick={() => setView("account")} active={view === "account"} icon={Settings} label="Account" />
            <SideItem
              active={view === "profile"}
              onClick={() => { setProfileUsername(user.username); setView("profile"); }}
              icon={UserCircle}
              label="My Profile"
            />
          </nav>
        </aside>

        {/* Center */}
        <main className="min-w-0">
          {view === "account" ? (
            <div className="rounded-2xl bg-card p-4 shadow-sm border border-border"><AccountPanel /></div>
          ) : view === "profile" ? (
            <div className="rounded-2xl bg-card p-4 shadow-sm border border-border"><ProfilePanel username={profileUsername} onBack={() => setView("feed")} /></div>
          ) : (
            <>
              <div className="rounded-xl sm:rounded-2xl bg-card shadow-sm border border-border">
                <Composer authorId={meId} onPosted={loadPosts} />
              </div>

              <div className="mt-3 sm:mt-4 flex gap-1 overflow-x-auto rounded-full bg-card p-1 shadow-sm border border-border">
                {TABS.map((t) => {
                  const Icon = t.icon;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setTab(t.id)}
                      className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-full px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium transition-colors ${tab === t.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground"}`}
                    >
                      <Icon className="h-3.5 w-3.5" /> {t.label}
                    </button>
                  );
                })}
              </div>

              <div className="mt-3 sm:mt-4 space-y-3 sm:space-y-4">
                {loading && Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-40 sm:h-48 animate-pulse rounded-xl sm:rounded-2xl bg-card border border-border" />
                ))}
                {!loading && filtered.length === 0 && (
                  <div className="rounded-xl sm:rounded-2xl bg-card p-8 sm:p-12 text-center shadow-sm border border-border">
                    <p className="text-sm text-muted-foreground">No posts yet. Be the first to share something!</p>
                  </div>
                )}
                {!loading && filtered.map((post) => (
                  <PostCard key={post.id} post={post} profiles={profiles} meId={meId} />
                ))}
              </div>
            </>
          )}
        </main>

        {/* Right rail */}
        <aside className="hidden space-y-4 lg:block">
          <div className="sticky top-20 space-y-4">
            <ChatroomOnlineWidget />
            <FriendsWidget meId={meId} profiles={profiles} />
            <HashtagsWidget />
          </div>
        </aside>
      </div>

      {/* Mobile bottom nav — minimal */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 flex border-t border-border bg-card lg:hidden">
        <button onClick={() => setView("feed")} className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-xs ${view === "feed" ? "text-primary" : "text-muted-foreground"}`}><Sparkles className="h-5 w-5" /> Feed</button>
        <Link to="/" className="flex flex-1 flex-col items-center gap-0.5 py-2 text-xs text-muted-foreground"><img src={chatroomIcon} alt="Chatrooms" className="h-5 w-5 rounded-full bg-white object-contain p-0.5" /> Chatrooms</Link>
        <button onClick={() => setView("account")} className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-xs ${view === "account" ? "text-primary" : "text-muted-foreground"}`}><Settings className="h-5 w-5" /> Account</button>
        <button onClick={() => { setProfileUsername(user.username); setView("profile"); }} className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-xs ${view === "profile" ? "text-primary" : "text-muted-foreground"}`}><UserCircle className="h-5 w-5" /> Me</button>
      </nav>
    </div>
  );
}

function SideItem({ icon: Icon, label, active, onClick }: { icon: typeof Home; label: string; active?: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${active ? "bg-primary/10 text-primary" : "text-foreground hover:bg-accent"}`}
    >
      <Icon className="h-5 w-5" /> {label}
    </button>
  );
}

function NavLink({ to, icon: Icon, label, active }: { to: string; icon: typeof Home; label: string; active?: boolean }) {
  return (
    <Link to={to} className={`flex items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-medium transition-colors ${active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent hover:text-foreground"}`}>
      <Icon className="h-4 w-4" /> {label}
    </Link>
  );
}

function MobileNav({ to, params, icon: Icon, label, active }: { to: string; params?: Record<string, string>; icon: typeof Home; label: string; active?: boolean }) {
  return (
    <Link to={to} params={params as never} className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-xs ${active ? "text-primary" : "text-muted-foreground"}`}>
      <Icon className="h-5 w-5" /> {label}
    </Link>
  );
}
