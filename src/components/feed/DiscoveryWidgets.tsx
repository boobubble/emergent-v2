import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Star, Users2, Flame, Activity, UserPlus, Check, TrendingUp, Award, Sparkles, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Avatar } from "@/components/chat/Avatar";
import { PremiumCard } from "@/components/feed/SideWidgets";
import type { User } from "@/lib/chat-types";

/* ──────────────────────────── Promoted Users ──────────────────────────── */

const PROMO_BADGES = ["Verified", "VIP", "Creator", "Top"] as const;

export function PromotedPostsWidget({ profiles }: { profiles: Record<string, User> }) {
  const [following, setFollowing] = useState<Record<string, boolean>>({});

  const promoted = useMemo(() => {
    return Object.values(profiles)
      .filter((u) => !u.isBot && !u.isGuest)
      .sort((a, b) => (b.xp ?? 0) - (a.xp ?? 0))
      .slice(0, 3);
  }, [profiles]);

  async function follow(targetId: string) {
    if (following[targetId]) return;
    setFollowing((s) => ({ ...s, [targetId]: true }));
    try {
      const { data: auth } = await supabase.auth.getUser();
      const meId = auth.user?.id;
      if (!meId || meId === targetId) return;
      await supabase.from("friendships").insert({
        sender_id: meId,
        receiver_id: targetId,
        status: "pending",
      } as any);
    } catch {
      /* ignore */
    }
  }

  return (
    <PremiumCard
      title="Promoted users"
      icon={<Flame className="h-3.5 w-3.5 text-amber-600 dark:text-amber-300" />}
      accent="amber"
      rightSlot={
        <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-400/30 to-orange-500/25 px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.08em] text-amber-800 dark:text-amber-100 ring-1 ring-inset ring-amber-400/40 shadow-[0_0_14px_-4px_rgba(245,158,11,0.55)]">
          <Sparkles className="h-2.5 w-2.5" /> Featured
        </span>
      }
    >
      <div className="relative -mx-1 rounded-2xl bg-gradient-to-br from-amber-500/[0.08] via-orange-500/[0.04] to-transparent p-2 ring-1 ring-inset ring-amber-400/15">
        <ul className="space-y-2">
          {promoted.length === 0 && (
            <li className="px-1 py-2 text-xs text-muted-foreground">No featured members yet.</li>
          )}
          {promoted.map((u, idx) => {
            const isFollowing = !!following[u.id];
            const badge = PROMO_BADGES[idx % PROMO_BADGES.length];
            const mutuals = ((u.xp ?? 0) % 9) + 1;
            const tagline = u.bio?.trim() || `Level ${u.level ?? 1} · ${(u.xp ?? 0).toLocaleString()} XP`;
            return (
              <li
                key={u.id}
                className="group relative overflow-hidden rounded-2xl bg-background/70 dark:bg-white/[0.035] p-2.5 ring-1 ring-inset ring-border/50 backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:ring-amber-400/45 hover:shadow-[0_14px_30px_-18px_rgba(245,158,11,0.7)] chat-bubble-in"
                style={{ animationDelay: `${idx * 70}ms` }}
              >
                <span
                  className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/60 to-transparent opacity-70"
                  aria-hidden
                />
                <div className="flex items-start gap-2.5">
                  <div className="relative shrink-0">
                    <div className="rounded-full p-[2px] bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500 shadow-[0_0_18px_-4px_rgba(245,158,11,0.6)]">
                      <div className="rounded-full bg-background p-[1.5px]">
                        <Avatar user={u} size={48} />
                      </div>
                    </div>
                    <span
                      className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-background"
                      aria-hidden
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="truncate text-[13px] font-bold text-foreground">{u.name}</span>
                      <span className="shrink-0 rounded-md bg-gradient-to-r from-amber-500/25 to-orange-500/20 px-1.5 py-px text-[9px] font-black uppercase tracking-wider text-amber-800 dark:text-amber-100 ring-1 ring-inset ring-amber-400/40">
                        {badge}
                      </span>
                    </div>
                    <p className="mt-0.5 line-clamp-1 text-[11px] leading-snug text-muted-foreground">
                      {tagline}
                    </p>
                    <div className="mt-1.5 flex items-center gap-2 text-[10px] font-medium text-muted-foreground tabular-nums">
                      <span className="inline-flex items-center gap-1 rounded-md bg-violet-500/12 px-1.5 py-px text-violet-700 dark:text-violet-200 ring-1 ring-inset ring-violet-400/25">
                        <Award className="h-2.5 w-2.5" />Lv {u.level ?? 1}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Users2 className="h-2.5 w-2.5" />{mutuals} mutual
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => follow(u.id)}
                    disabled={isFollowing}
                    className={`shrink-0 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider transition active:scale-95 ${
                      isFollowing
                        ? "bg-amber-500/15 text-amber-700 dark:text-amber-200 ring-1 ring-inset ring-amber-400/40"
                        : "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-[0_6px_18px_-6px_rgba(245,158,11,0.75)] hover:brightness-110"
                    }`}
                  >
                    {isFollowing ? <><Check className="h-3 w-3" />Added</> : <><UserPlus className="h-3 w-3" />Follow</>}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
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
  category: string;
  cover: string;
  tint: string;
};

const SUGGESTED_GROUPS: GroupSuggestion[] = [
  { id: "g-night", name: "Night Owls", members: 1284, emoji: "🦉", category: "Lifestyle", cover: "radial-gradient(120% 80% at 20% 20%, rgba(139,92,246,0.55), transparent 60%), linear-gradient(135deg, #4c1d95, #1e1b4b)", tint: "from-indigo-500/30 to-violet-600/20" },
  { id: "g-music", name: "Vibe Lounge", members: 982, emoji: "🎧", category: "Music", cover: "radial-gradient(120% 80% at 80% 20%, rgba(244,114,182,0.6), transparent 60%), linear-gradient(135deg, #831843, #4a044e)", tint: "from-fuchsia-500/30 to-pink-600/20" },
  { id: "g-gamers", name: "Pro Gamers Hub", members: 2317, emoji: "🎮", category: "Gaming", cover: "radial-gradient(120% 80% at 30% 80%, rgba(16,185,129,0.55), transparent 60%), linear-gradient(135deg, #064e3b, #022c22)", tint: "from-emerald-500/30 to-teal-600/20" },
  { id: "g-art", name: "Daily Sketch", members: 548, emoji: "🎨", category: "Creative", cover: "radial-gradient(120% 80% at 70% 30%, rgba(251,146,60,0.6), transparent 60%), linear-gradient(135deg, #7c2d12, #431407)", tint: "from-amber-500/30 to-orange-600/20" },
];

export function SuggestedGroupsWidget() {
  const [joined, setJoined] = useState<Record<string, boolean>>({});
  return (
    <PremiumCard
      title="Suggested groups"
      icon={<Users2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-300" />}
      accent="emerald"
      rightSlot={
        <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 ring-1 ring-inset ring-emerald-400/30">
          For you
        </span>
      }
    >
      <ul className="grid gap-2.5 pt-1">
        {SUGGESTED_GROUPS.map((g, idx) => {
          const isJoined = !!joined[g.id];
          return (
            <li
              key={g.id}
              className="group relative overflow-hidden rounded-2xl bg-background/70 dark:bg-white/[0.035] ring-1 ring-inset ring-border/50 backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:ring-emerald-400/45 hover:shadow-[0_14px_30px_-18px_rgba(16,185,129,0.7)] chat-bubble-in"
              style={{ animationDelay: `${idx * 70}ms` }}
            >
              {/* Banner */}
              <div
                className="relative h-14 w-full"
                style={{ backgroundImage: g.cover }}
                aria-hidden
              >
                <div className="absolute inset-0 bg-gradient-to-t from-background/85 via-background/20 to-transparent" />
                <span className="absolute right-2 top-2 rounded-full bg-black/40 px-1.5 py-px text-[9px] font-black uppercase tracking-wider text-white/90 ring-1 ring-inset ring-white/20 backdrop-blur-sm">
                  {g.category}
                </span>
                <div className="absolute -bottom-4 left-3 grid h-10 w-10 place-items-center rounded-xl text-xl ring-2 ring-background shadow-[0_6px_18px_-6px_rgba(0,0,0,0.5)]"
                  style={{ backgroundImage: g.cover }}
                >
                  <span className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.55)]">{g.emoji}</span>
                </div>
              </div>
              {/* Body */}
              <div className="flex items-end justify-between gap-2 px-3 pb-2.5 pt-5">
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13px] font-bold text-foreground">{g.name}</div>
                  <div className="mt-0.5 inline-flex items-center gap-1 text-[10px] font-medium text-muted-foreground tabular-nums">
                    <Users2 className="h-2.5 w-2.5" />
                    {g.members.toLocaleString()} members
                  </div>
                </div>
                <button
                  onClick={() => setJoined((s) => ({ ...s, [g.id]: !s[g.id] }))}
                  className={`shrink-0 rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-wider transition active:scale-95 ${
                    isJoined
                      ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-200 ring-1 ring-inset ring-emerald-400/40"
                      : "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-[0_6px_18px_-6px_rgba(16,185,129,0.75)] hover:brightness-110"
                  }`}
                >
                  {isJoined ? <span className="inline-flex items-center gap-1"><Check className="h-3 w-3" />Joined</span> : "Join"}
                </button>
              </div>
            </li>
          );
        })}
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
  const pool = useMemo<ActivityItem[]>(() => {
    const users = Object.values(profiles).filter((u) => u.id !== meId && !u.isBot).slice(0, 16);
    if (users.length === 0) return [];
    const verbs: Array<Pick<ActivityItem, "verb" | "target" | "tint" | "Icon">> = [
      { verb: "reached", target: "a new level", tint: "violet", Icon: Sparkles },
      { verb: "earned", target: "a new badge", tint: "amber", Icon: Award },
      { verb: "joined", target: "a group", tint: "emerald", Icon: Users2 },
      { verb: "created", target: "a trending post", tint: "rose", Icon: TrendingUp },
      { verb: "reacted to", target: "a hot post", tint: "rose", Icon: Flame },
      { verb: "starred", target: "a creator", tint: "amber", Icon: Star },
    ];
    return users.map((u, i) => ({
      id: u.id + ":" + i,
      user: u,
      ...verbs[i % verbs.length],
      time: "now",
    }));
  }, [profiles, meId]);

  // Rotating live feed: keep 4 visible, occasionally push a fresh one on top
  const [head, setHead] = useState(0);
  const [tick, setTick] = useState(0); // bumps when a new item slides in
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const obs = new IntersectionObserver(
      ([e]) => setInView(e.isIntersecting),
      { threshold: 0.2 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (pool.length <= 4 || !inView) return;
    const id = window.setInterval(() => {
      if (document.hidden) return;
      setHead((h) => (h + 1) % pool.length);
      setTick((t) => t + 1);
    }, 9000);
    return () => window.clearInterval(id);
  }, [pool.length, inView]);

  const items = useMemo(() => {
    if (pool.length === 0) return [];
    const out: ActivityItem[] = [];
    const labels = ["just now", "2m", "8m", "15m"];
    for (let i = 0; i < Math.min(4, pool.length); i++) {
      const src = pool[(head + i) % pool.length];
      out.push({ ...src, id: `${src.id}:${tick}:${i}`, time: labels[i] ?? "now" });
    }
    return out;
  }, [pool, head, tick]);


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
              className={`group relative flex items-center gap-2.5 overflow-hidden rounded-xl border border-transparent p-1.5 -mx-1 transition-all duration-300 hover:-translate-y-px hover:border-foreground/10 hover:bg-gradient-to-r hover:from-foreground/[0.06] hover:to-foreground/[0.02] hover:shadow-sm chat-bubble-in ${
                idx % 2 === 1 ? "bg-foreground/[0.025] dark:bg-white/[0.02]" : ""
              }`}
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
      {items.length > 0 && (
        <Link
          to="/feed"
          className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-sky-500/15 via-violet-500/15 to-fuchsia-500/15 px-3 py-1.5 text-[11px] font-black uppercase tracking-wider text-foreground/80 ring-1 ring-inset ring-border/60 transition hover:text-foreground hover:ring-sky-400/40 hover:shadow-[0_8px_22px_-14px_rgba(56,189,248,0.65)]"
        >
          View all activity <ArrowRight className="h-3 w-3" />
        </Link>
      )}
    </PremiumCard>
  );
}

