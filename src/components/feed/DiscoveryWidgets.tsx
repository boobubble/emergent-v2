import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Megaphone, Star, Users2, Flame, Activity, UserPlus, Check, Heart, MessageCircle, TrendingUp, Award, Sparkles, ArrowRight, ImageIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { postsSafe } from "@/lib/posts-safe";
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
      const { data } = await postsSafe()
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
      rightSlot={
        <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-400/30 to-orange-500/25 px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.08em] text-amber-800 dark:text-amber-100 ring-1 ring-inset ring-amber-400/40 shadow-[0_0_14px_-4px_rgba(245,158,11,0.55)]">
          <Sparkles className="h-2.5 w-2.5" /> Sponsored
        </span>
      }
    >
      <div
        className="relative -mx-1 rounded-2xl bg-gradient-to-br from-amber-500/[0.08] via-orange-500/[0.04] to-transparent p-2 ring-1 ring-inset ring-amber-400/15"
      >
        <div className="space-y-2">
          {!loaded && Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-16 rounded-xl skeleton-shimmer" />
          ))}
          {loaded && posts.length === 0 && (
            <p className="px-1 py-2 text-xs text-muted-foreground">No featured posts yet.</p>
          )}
          {loaded && posts.map((p) => {
            const author = profiles[p.author_id];
            const snippet = (p.text ?? "").replace(/\s+/g, " ").trim().slice(0, 70);
            const thumb = (p as any).media_urls?.[0] as string | undefined;
            return (
              <Link
                key={p.id}
                to="/feed/$slug"
                params={{ slug: p.id }}
                className="group flex gap-2.5 rounded-xl bg-background/60 dark:bg-white/[0.03] p-2 ring-1 ring-inset ring-border/50 transition hover:bg-background hover:ring-amber-400/40 hover:shadow-[0_8px_24px_-14px_rgba(245,158,11,0.55)] active:scale-[0.99]"
              >
                {thumb ? (
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg ring-1 ring-inset ring-border/60">
                    <img src={thumb} alt="" className="h-full w-full object-cover" loading="lazy" />
                  </div>
                ) : (
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-amber-500/25 to-orange-500/15 ring-1 ring-inset ring-amber-400/30">
                    {author ? <Avatar user={author} size={32} /> : <ImageIcon className="h-4 w-4 text-amber-700/70 dark:text-amber-300/70" />}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-foreground/80">
                    <span className="truncate">{author?.name ?? "Member"}</span>
                    <span className="rounded bg-amber-500/20 px-1 py-px text-[9px] font-black uppercase text-amber-800 dark:text-amber-200 ring-1 ring-inset ring-amber-400/30">Ad</span>
                  </div>
                  <p className="line-clamp-2 text-[12px] leading-snug text-foreground/90">
                    {snippet || "Featured community post"}
                  </p>
                  <div className="mt-1 flex items-center gap-3 text-[10px] font-medium tabular-nums text-muted-foreground">
                    <span className="inline-flex items-center gap-1"><Heart className="h-3 w-3" />{(p as any).reaction_count ?? 0}</span>
                    <span className="inline-flex items-center gap-1"><MessageCircle className="h-3 w-3" />{(p as any).comment_count ?? 0}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
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
    await supabase.from("friendships").insert({
      sender_id: meId,
      receiver_id: targetId,
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

type ActivityTint = "violet" | "amber" | "emerald" | "rose";
type ActivityItem = {
  id: string;
  user: User;
  verb: string;
  target: string;
  time: string;
  tint: ActivityTint;
  Icon: typeof Activity;
};

const TINT_STYLES: Record<ActivityTint, { chip: string; ring: string; glow: string; iconWrap: string }> = {
  violet: {
    chip: "bg-gradient-to-r from-violet-500/20 to-fuchsia-500/15 text-violet-700 dark:text-violet-200 ring-violet-400/30",
    ring: "ring-violet-400/50",
    glow: "shadow-[0_0_18px_-6px_rgba(139,92,246,0.55)]",
    iconWrap: "bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white",
  },
  amber: {
    chip: "bg-gradient-to-r from-amber-500/20 to-orange-500/15 text-amber-700 dark:text-amber-200 ring-amber-400/30",
    ring: "ring-amber-400/50",
    glow: "shadow-[0_0_18px_-6px_rgba(245,158,11,0.55)]",
    iconWrap: "bg-gradient-to-br from-amber-400 to-orange-500 text-white",
  },
  emerald: {
    chip: "bg-gradient-to-r from-emerald-500/20 to-teal-500/15 text-emerald-700 dark:text-emerald-200 ring-emerald-400/30",
    ring: "ring-emerald-400/50",
    glow: "shadow-[0_0_18px_-6px_rgba(16,185,129,0.55)]",
    iconWrap: "bg-gradient-to-br from-emerald-400 to-teal-500 text-white",
  },
  rose: {
    chip: "bg-gradient-to-r from-rose-500/20 to-pink-500/15 text-rose-600 dark:text-rose-200 ring-rose-400/30",
    ring: "ring-rose-400/50",
    glow: "shadow-[0_0_18px_-6px_rgba(244,63,94,0.55)]",
    iconWrap: "bg-gradient-to-br from-rose-500 to-pink-500 text-white",
  },
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
    const verbs: Array<Pick<ActivityItem, "verb" | "target" | "tint" | "Icon">> = [
      { verb: "reached", target: "a new level", tint: "violet", Icon: Sparkles },
      { verb: "earned", target: "a new badge", tint: "amber", Icon: Award },
      { verb: "joined", target: "a group", tint: "emerald", Icon: Users2 },
      { verb: "created", target: "a trending post", tint: "rose", Icon: TrendingUp },
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
      rightSlot={
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 ring-1 ring-inset ring-emerald-400/30">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/70" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
          </span>
          Live
        </span>
      }
    >
      <ul className="space-y-1.5 pt-1">
        {items.length === 0 && (
          <li className="px-1 py-2 text-xs text-muted-foreground">Quiet for now — check back soon.</li>
        )}
        {items.map((it, idx) => {
          const t = TINT_STYLES[it.tint];
          return (
            <li
              key={it.id + it.verb}
              className="group relative flex items-center gap-2.5 overflow-hidden rounded-xl border border-transparent p-1.5 -mx-1 transition-all duration-300 hover:-translate-y-px hover:border-foreground/10 hover:bg-gradient-to-r hover:from-foreground/[0.05] hover:to-foreground/[0.02] hover:shadow-sm chat-bubble-in"
              style={{ animationDelay: `${idx * 60}ms` }}
            >
              <span
                className="pointer-events-none absolute inset-y-1 left-0 w-[3px] rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{ background: "linear-gradient(180deg, var(--primary), color-mix(in oklab, var(--primary) 40%, transparent))" }}
                aria-hidden
              />
              <div className="relative shrink-0">
                <div className={`rounded-full p-[1.5px] bg-gradient-to-br ring-1 ${t.ring} transition-transform duration-300 group-hover:scale-105 ${t.glow}`}>
                  <Avatar user={it.user} size={32} />
                </div>
                <span
                  className={`absolute -bottom-0.5 -right-0.5 grid h-4 w-4 place-items-center rounded-full ring-2 ring-background ${t.iconWrap}`}
                  aria-hidden
                >
                  <it.Icon className="h-2.5 w-2.5" />
                </span>
              </div>
              <div className="min-w-0 flex-1 text-[12px] leading-snug">
                <div className="truncate">
                  <span className="font-semibold text-foreground">{it.user.name}</span>{" "}
                  <span className="text-muted-foreground">{it.verb}</span>
                </div>
                <span className={`mt-0.5 inline-block rounded-md px-1.5 py-px text-[10px] font-semibold ring-1 ring-inset ${t.chip}`}>
                  {it.target}
                </span>
              </div>
              <span className="shrink-0 text-[10px] font-medium tabular-nums text-muted-foreground/80">
                {it.time}
              </span>
            </li>
          );
        })}
      </ul>
    </PremiumCard>
  );
}

