import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { postsSafe } from "@/lib/posts-safe";
import { type FeedPost } from "@/lib/feed-types";

function normalizePost(row: Partial<FeedPost>): FeedPost {
  return {
    id: row.id ?? "",
    author_id: row.author_id ?? "",
    owner_id: row.owner_id ?? row.author_id ?? "",
    kind: row.kind ?? "text",
    text: row.text ?? "",
    slug: row.slug ?? row.id ?? "post",
    media_urls: Array.isArray(row.media_urls) ? row.media_urls : [],
    poll: row.poll ?? null,
    privacy: row.privacy ?? "public",
    is_anonymous: Boolean(row.is_anonymous),
    hashtags: Array.isArray(row.hashtags) ? row.hashtags : [],
    reaction_count: row.reaction_count ?? 0,
    comment_count: row.comment_count ?? 0,
    trending_score: row.trending_score ?? 0,
    created_at: row.created_at ?? new Date().toISOString(),
  };
}
import type { User } from "@/lib/chat-types";
import { Composer } from "@/components/feed/Composer";
import { PostCard } from "@/components/feed/PostCard";
import { useAuth } from "@/lib/auth-store";
import { useCommunity } from "@/lib/community-context";
import { Search, Rss } from "lucide-react";

export const Route = createFileRoute("/community/$slug/feed")({
  component: CommunityFeed,
});

function CommunityFeed() {
  const { community, communityId, isMember, isOwner } = useCommunity();
  const { user } = useAuth();
  const meId = user?.id ?? "";
  const canPost = !!user && (isMember || isOwner);

  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [profiles, setProfiles] = useState<Record<string, User>>({});

  async function load() {
    setLoading(true);
    const { data } = await postsSafe()
      .select("*")
      .eq("community_id", communityId)
      .order("created_at", { ascending: false })
      .limit(50);
    setPosts(((data ?? []) as Partial<FeedPost>[]).map(normalizePost));
    setLoading(false);
  }

  useEffect(() => {
    load();
    const ch = supabase
      .channel(`feed-community-${communityId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "posts", filter: `community_id=eq.${communityId}` },
        (payload) => {
          if (payload.eventType === "INSERT") setPosts((p) => [normalizePost(payload.new as Partial<FeedPost>), ...p]);
          else if (payload.eventType === "DELETE") setPosts((p) => p.filter((x) => x.id !== (payload.old as FeedPost).id));
          else if (payload.eventType === "UPDATE")
            setPosts((p) => p.map((x) => (x.id === (payload.new as FeedPost).id ? normalizePost(payload.new as Partial<FeedPost>) : x)));
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [communityId]);

  // Load author profiles for visible posts
  useEffect(() => {
    const ids = Array.from(new Set(posts.map((p) => p.author_id).filter(Boolean)));
    if (!ids.length) return;
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id,username,display_name,avatar_url,avatar_color")
        .in("id", ids);
      const map: Record<string, User> = {};
      for (const p of data ?? []) {
        map[p.id as string] = {
          id: p.id as string,
          name: (p.display_name || p.username || "user") as string,
          avatarUrl: (p.avatar_url as string) ?? undefined,
          avatarColor: (p.avatar_color as string) ?? undefined,
          status: "offline",
          xp: 0,
          level: 1,
          streak: 0,
          longestStreak: 0,
          coins: 0,
          badges: [],
          isBot: false,
          isGuest: false,
        } as unknown as User;
      }
      setProfiles(map);
    })();
  }, [posts]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return posts;
    return posts.filter((p) => {
      const text = (p.text || "").toLowerCase();
      const tags = (p.hashtags || []).map((t) => t.toLowerCase());
      return text.includes(q) || tags.some((t) => t.includes(q));
    });
  }, [posts, query]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 rounded-lg border bg-card px-3 py-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`Search ${community.name}…`}
          className="flex-1 bg-transparent text-sm outline-none"
        />
        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase text-primary">Community</span>
      </div>

      {canPost && (
        <Composer authorId={meId} communityId={communityId} onPosted={load} />
      )}
      {!user && (
        <div className="rounded-lg border bg-muted/30 p-4 text-center text-sm text-muted-foreground">
          Sign in to post in this community.
        </div>
      )}
      {user && !canPost && (
        <div className="rounded-lg border bg-muted/30 p-4 text-center text-sm text-muted-foreground">
          Join this community to post here.
        </div>
      )}

      {loading ? (
        <div className="py-12 text-center text-sm text-muted-foreground">Loading community posts…</div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border bg-card p-10 text-center">
          <Rss className="mx-auto h-8 w-8 text-muted-foreground" />
          <h3 className="mt-3 font-semibold">No posts yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {canPost ? "Be the first to post in this community." : "Come back soon — this community is just getting started."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((p) => (
            <PostCard key={p.id} post={p} profiles={profiles} meId={meId} />
          ))}
        </div>
      )}
    </div>
  );
}
