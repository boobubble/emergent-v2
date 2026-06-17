import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Megaphone, Star, Users2, Flame, Activity, UserPlus, Check, Heart, MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Avatar } from "@/components/chat/Avatar";
import { PremiumCard } from "@/components/feed/SideWidgets";
import type { User } from "@/lib/chat-types";
import type { FeedPost } from "@/lib/feed-types";

/* ──────────────────────────── Promoted Posts ──────────────────────────── */

export function PromotedPostsWidget({ profiles }: { profiles: Record<string, User> }) {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      const { data } = await supabase
        .from("posts")
        .select("*")
        .eq("privacy", "public")
        .order("created_at", { ascending: false })
        .limit(40);
      if (!alive) return;
      const rows = (data ?? []) as unknown as FeedPost[];
      rows.sort((a, b) => (b.reaction_count ?? 0) - (a.reaction_count ?? 0));
      setPosts(rows.slice(0, 3));
      setLoaded(true);
    })();
    return () => { alive = false; };
  }, []);

  return (
    <PremiumCard
      title="Promoted posts"
      icon={<Megaphone className="h-3.5 w-3.5 text-amber-600 dark:text-amber-300" />}
      accent="amber"
      rightSlot={<span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300 ring-1 ring-inset ring-amber-400/30">Sponsored</span>}
    >
      <div className="space-y-2 pt-1">
        {!loaded && Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="h-14 rounded-xl skeleton-shimmer" />
        ))}
        {loaded && posts.length === 0 && (
          <p className="px-1 py-2 text-xs text-muted-foreground">No featured posts yet.</p>
        )}
        {loaded && posts.map((p) => {
          const author = profiles[p.user_id];
          const snippet = (p.body ?? "").replace(/\s+/g, " ").trim().slice(0, 70);
          return (
            <Link
              key={p.id}
              to="/feed/$slug"
              params={{ slug: p.id }}
              className="group flex gap-2.5 rounded-xl p-2 -mx-1 transition hover:bg-foreground/[0.04] active:scale-[0.99]"
            >
              {author ? (
                <Avatar user={author} size={36} />
              ) : (
                <div className="h-9 w-9 shrink-0 rounded-full bg-muted" />
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-foreground/80">
                  <span className="truncate">{author?.name ?? "Member"}</span>
                  <span className="rounded bg-amber-500/15 px-1 py-px text-[9px] font-bold uppercase text-amber-700 dark:text-amber-300">Ad</span>
                </div>
                <p className="line-clamp-2 text-[12px] leading-snug text-foreground/90">
                  {snippet || "Featured community post"}
                </p>
                <div className="mt-0.5 flex items-center gap-3 text-[10px] text-muted-foreground">
                  <span className="inline-flex items-center gap-1"><Heart className="h-3 w-3" />{(p as any).reaction_count ?? 0}</span>
                  <span className="inline-flex items-center gap-1"><MessageCircle className="h-3 w-3" />{(p as any).comment_count ?? 0}</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </PremiumCard>
  );
}

/* ──────────────────────────── Featured Members ──────────────────────────── */

export function FeaturedMembersWidget({
  meId,
  profiles,
}: {
  meId: string;
  profiles: Record<string, User>;
}) {
  const [following, setFollowing] = useState<Record<string, boolean>>({});
  const featured = useMemo(() => {
    return Object.values(profiles)
      .filter((u) => u.id !== meId && !u.isBot && !u.isGuest)
      .sort((a, b) => (b.xp ?? 0) - (a.xp ?? 0))
      .slice(0, 4);
  }, [profiles, meId]);

  async function follow(targetId: string) {
    if (!meId || following[targetId]) return;
    setFollowing((s) => ({ ...s, [targetId]: true }));
    await supabase.from("feed_friendships").insert({
      user_id: meId,
      friend_id: targetId,
      status: "pending",
    } as any);
  }

  return (
    <PremiumCard
      title="Featured members"
      icon={<Star className="h-3.5 w-3.5 text-fuchsia-600 dark:text-fuchsia-300" />}
      accent="fuchsia"
    >
      <ul className="space-y-1.5 pt-1">
        {featured.length === 0 && (
          <li className="px-1 py-2 text-xs text-muted-foreground">No members to feature yet.</li>
        )}
        {featured.map((u) => (
          <li key={u.id} className="flex items-center gap-2.5 rounded-xl p-1.5 -mx-1 transition hover:bg-foreground/[0.04]">
            <Avatar user={u} size={34} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="truncate text-[12px] font-semibold text-foreground">{u.name}</span>
                <span className="shrink-0 rounded bg-violet-500/15 px-1.5 py-px text-[9px] font-bold uppercase text-violet-700 dark:text-violet-300 ring-1 ring-inset ring-violet-400/25">
                  Lv {u.level ?? 1}
                </span>
              </div>
              <div className="text-[10px] text-muted-foreground tabular-nums">
                {(u.xp ?? 0).toLocaleString()} XP
                {u.badges?.length ? <> · {u.badges.length} 🏅</> : null}
              </div>
            </div>
            <button
              onClick={() => follow(u.id)}
              disabled={!!following[u.id]}
              className="inline-flex items-center gap-1 rounded-full bg-primary/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary-foreground shadow-[0_2px_8px_-2px_var(--primary-glow)] transition hover:bg-primary active:scale-95 disabled:opacity-60"
            >
              {following[u.id] ? <><Check className="h-3 w-3" />Sent</> : <><UserPlus className="h-3 w-3" />Add</>}
            </button>
          </li>
        ))}
      </ul>
    </PremiumCard>
  );
}

/* ──────────────────────────── Suggested Groups ──────────────────────────── */

type GroupSuggestion = {
  id: string;
  name: string;
  members: number;
  emoji: string;
  tint: string;
};

const SUGGESTED_GROUPS: GroupSuggestion[] = [
  { id: "g-night", name: "Night Owls", members: 1284, emoji: "🦉", tint: "from-indigo-500/30 to-violet-600/20" },
  { id: "g-music", name: "Vibe Lounge", members: 982, emoji: "🎧", tint: "from-fuchsia-500/30 to-pink-600/20" },
  { id: "g-gamers", name: "Pro Gamers Hub", members: 2317, emoji: "🎮", tint: "from-emerald-500/30 to-teal-600/20" },
  { id: "g-art", name: "Daily Sketch", members: 548, emoji: "🎨", tint: "from-amber-500/30 to-orange-600/20" },
];

export function SuggestedGroupsWidget() {
  const [joined, setJoined] = useState<Record<string, boolean>>({});
  return (
    <PremiumCard
      title="Suggested groups"
      icon={<Users2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-300" />}
      accent="emerald"
    >
      <ul className="space-y-1.5 pt-1">
        {SUGGESTED_GROUPS.map((g) => (
          <li key={g.id} className="flex items-center gap-2.5 rounded-xl p-1.5 -mx-1 transition hover:bg-foreground/[0.04]">
            <div className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br ${g.tint} text-base ring-1 ring-inset ring-border`}>
              {g.emoji}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[12px] font-semibold text-foreground">{g.name}</div>
              <div className="text-[10px] text-muted-foreground tabular-nums">
                {g.members.toLocaleString()} members
              </div>
            </div>
            <button
              onClick={() => setJoined((s) => ({ ...s, [g.id]: !s[g.id] }))}
              className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider transition active:scale-95 ${
                joined[g.id]
                  ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 ring-1 ring-inset ring-emerald-400/30"
                  : "bg-foreground text-background hover:opacity-90"
              }`}
            >
              {joined[g.id] ? "Joined" : "Join"}
            </button>
          </li>
        ))}
      </ul>
    </PremiumCard>
  );
}

/* ──────────────────────────── Trending Communities ──────────────────────────── */

const TRENDING_COMMUNITIES = [
  { id: "c-startup", name: "Indie Builders", growth: "+24%", members: 4310, emoji: "🚀" },
  { id: "c-fit", name: "Morning Run Club", growth: "+18%", members: 1972, emoji: "🏃" },
  { id: "c-foodies", name: "Street Foodies", growth: "+12%", members: 3614, emoji: "🍜" },
];

export function TrendingCommunitiesWidget() {
  return (
    <PremiumCard
      title="Trending communities"
      icon={<Flame className="h-3.5 w-3.5 text-rose-500 dark:text-rose-300" />}
      accent="rose"
    >
      <ul className="space-y-1 pt-1">
        {TRENDING_COMMUNITIES.map((c, i) => (
          <li key={c.id} className="flex items-center gap-2.5 rounded-xl p-1.5 -mx-1 transition hover:bg-foreground/[0.04]">
            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-foreground/[0.06] text-[10px] font-black tabular-nums text-foreground/70 ring-1 ring-inset ring-border">
              {i + 1}
            </span>
            <span className="text-lg leading-none">{c.emoji}</span>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[12px] font-semibold text-foreground">{c.name}</div>
              <div className="text-[10px] text-muted-foreground tabular-nums">
                {c.members.toLocaleString()} members
              </div>
            </div>
            <span className="shrink-0 rounded-full bg-rose-500/15 px-2 py-0.5 text-[10px] font-bold tabular-nums text-rose-600 dark:text-rose-300 ring-1 ring-inset ring-rose-400/30">
              {c.growth}
            </span>
          </li>
        ))}
      </ul>
    </PremiumCard>
  );
}

/* ──────────────────────────── Community Activity ──────────────────────────── */

type ActivityItem = {
  id: string;
  user: User;
  verb: string;
  target: string;
  time: string;
  tint: "violet" | "amber" | "emerald" | "rose";
};

const TINT_BG = {
  violet: "bg-violet-500/15 text-violet-700 dark:text-violet-300 ring-violet-400/25",
  amber: "bg-amber-500/15 text-amber-700 dark:text-amber-300 ring-amber-400/25",
  emerald: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 ring-emerald-400/25",
  rose: "bg-rose-500/15 text-rose-600 dark:text-rose-300 ring-rose-400/25",
};

export function CommunityActivityWidget({
  meId,
  profiles,
}: {
  meId: string;
  profiles: Record<string, User>;
}) {
  const items = useMemo<ActivityItem[]>(() => {
    const pool = Object.values(profiles).filter((u) => u.id !== meId && !u.isBot).slice(0, 16);
    if (pool.length === 0) return [];
    const verbs: Array<Pick<ActivityItem, "verb" | "target" | "tint">> = [
      { verb: "reached", target: "a new level", tint: "violet" },
      { verb: "earned", target: "a new badge", tint: "amber" },
      { verb: "joined", target: "a group", tint: "emerald" },
      { verb: "created", target: "a trending post", tint: "rose" },
    ];
    return pool.slice(0, 4).map((u, i) => ({
      id: u.id,
      user: u,
      ...verbs[i % verbs.length],
      time: ["just now", "2m", "8m", "15m"][i] ?? "now",
    }));
  }, [profiles, meId]);

  return (
    <PremiumCard
      title="Community activity"
      icon={<Activity className="h-3.5 w-3.5 text-sky-600 dark:text-sky-300" />}
      accent="sky"
    >
      <ul className="space-y-1 pt-1">
        {items.length === 0 && (
          <li className="px-1 py-2 text-xs text-muted-foreground">Quiet for now — check back soon.</li>
        )}
        {items.map((it) => (
          <li key={it.id + it.verb} className="flex items-center gap-2.5 rounded-xl p-1.5 -mx-1 transition hover:bg-foreground/[0.04]">
            <Avatar user={it.user} size={28} />
            <div className="min-w-0 flex-1 text-[12px] leading-snug">
              <span className="font-semibold text-foreground">{it.user.name}</span>{" "}
              <span className="text-muted-foreground">{it.verb}</span>{" "}
              <span className={`rounded px-1.5 py-px text-[10px] font-semibold ring-1 ring-inset ${TINT_BG[it.tint]}`}>
                {it.target}
              </span>
            </div>
            <span className="shrink-0 text-[10px] tabular-nums text-muted-foreground">{it.time}</span>
          </li>
        ))}
      </ul>
    </PremiumCard>
  );
}
