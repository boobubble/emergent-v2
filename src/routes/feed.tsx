import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Home, Bell, Users, Sparkles, Flame, Clock, UserCircle, Settings } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-store";
import { useRemoteProfiles } from "@/lib/use-remote-profiles";
import { Composer } from "@/components/feed/Composer";
import { PostCard } from "@/components/feed/PostCard";
import { FriendsWidget, HashtagsWidget, LeaderboardWidget, StreakWidget } from "@/components/feed/SideWidgets";
import { AccountPanel } from "@/components/feed/AccountPanel";
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
type View = "feed" | "account";

function FeedPage() {
  const { user } = useAuth();
  const { profiles } = useRemoteProfiles();
  const [tab, setTab] = useState<Tab>("foryou");
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [friendIds, setFriendIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

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
      // For You: friends first, then by engagement
      list.sort((a, b) => {
        const af = friendIds.has(a.author_id) ? 1000 : 0;
        const bf = friendIds.has(b.author_id) ? 1000 : 0;
        return bf - af + (b.reaction_count + b.comment_count - a.reaction_count - a.comment_count);
      });
    }
    return list;
  }, [posts, tab, friendIds, meId]);

  if (!user) return null;

  const TABS: { id: Tab; label: string; icon: typeof Sparkles }[] = [
    { id: "foryou", label: "For You", icon: Sparkles },
    { id: "trending", label: "Trending", icon: Flame },
    { id: "latest", label: "Latest", icon: Clock },
    { id: "friends", label: "Friends", icon: Users },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground pb-20 md:pb-0">
      <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
          <Link to="/" className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Chat
          </Link>
          <h1 className="text-lg font-bold">Feed</h1>
          <div className="ml-auto flex items-center gap-2">
            <Link to="/u/$username" params={{ username: user.username }} className="rounded-full p-2 text-muted-foreground hover:bg-accent hover:text-foreground">
              <UserCircle className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-6 lg:grid-cols-[220px_1fr_280px]">
        {/* Left nav */}
        <aside className="hidden lg:block">
          <nav className="sticky top-20 space-y-1">
            <NavLink to="/" icon={Home} label="Home / Chat" />
            <NavLink to="/feed" icon={Sparkles} label="Feed" active />
            <NavLink to="/feed" icon={Flame} label="Leaderboard" />
            <NavLink to="/feed" icon={Bell} label="Achievements" />
          </nav>
        </aside>

        {/* Center */}
        <main className="min-w-0">
          <Composer authorId={meId} onPosted={loadPosts} />

          <div className="mt-4 flex gap-1 overflow-x-auto rounded-full border border-border bg-card p-1">
            {TABS.map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${tab === t.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground"}`}
                >
                  <Icon className="h-3.5 w-3.5" /> {t.label}
                </button>
              );
            })}
          </div>

          <div className="mt-4 space-y-4">
            {loading && Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-48 animate-pulse rounded-3xl border border-border bg-card" />
            ))}
            {!loading && filtered.length === 0 && (
              <div className="rounded-3xl border border-dashed border-border bg-card/50 p-12 text-center">
                <p className="text-sm text-muted-foreground">No posts yet. Be the first to share something!</p>
              </div>
            )}
            {!loading && filtered.map((post) => (
              <PostCard key={post.id} post={post} profiles={profiles} meId={meId} />
            ))}
          </div>
        </main>

        {/* Right widgets */}
        <aside className="hidden space-y-4 lg:block">
          <div className="sticky top-20 space-y-4">
            <FriendsWidget meId={meId} profiles={profiles} />
            <HashtagsWidget />
            <LeaderboardWidget profiles={profiles} />
            <StreakWidget profiles={profiles} />
          </div>
        </aside>
      </div>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 flex border-t border-border bg-background/95 backdrop-blur-md lg:hidden">
        <MobileNav to="/" icon={Home} label="Chat" />
        <MobileNav to="/feed" icon={Sparkles} label="Feed" active />
        <MobileNav to="/leaderboard" icon={Flame} label="Top" />
        <MobileNav to="/u/$username" params={{ username: user.username }} icon={UserCircle} label="Me" />
      </nav>
    </div>
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
