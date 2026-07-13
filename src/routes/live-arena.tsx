import { createFileRoute, Link } from "@tanstack/react-router";
import type React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft, Flame, Heart, Zap, Search, Crown, Clock, Trophy, Sparkles,
  Star, Eye, Users, MessageCircle, Bookmark, Share2, Radio, TrendingUp, Coins,
} from "lucide-react";
import {
  listCompetitionsEnriched,
  listCategories,
  listMyFollowedCompetitions,
  shareCompetition,
  type EnrichedCompetition,
} from "@/lib/competitions.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AnimatedCounter } from "@/components/competitions/AnimatedCounter";
import { Countdown } from "@/components/competitions/Countdown";
import { useAuth } from "@/lib/auth-store";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/live-arena")({
  head: () => ({
    meta: [
      { title: "Live Arena — Watch Every Live Competition in Real Time" },
      { name: "description", content: "A realtime dashboard of every live BooBubble competition — votes, leaders, and battles as they happen." },
      { property: "og:title", content: "Live Arena — BooBubble" },
      { property: "og:description", content: "Every live competition, all in one premium realtime arena." },
      { property: "og:type", content: "website" },
    ],
  }),
  component: LiveArenaPage,
});

type Filter = "all" | "live" | "upcoming" | "ending" | "featured" | "trending" | "prize" | "following" | "finished";

function prizeValue(rewards: any): number {
  if (!rewards || typeof rewards !== "object") return 0;
  return Number(rewards.coins ?? 0) + Number(rewards.xp ?? 0) * 0.5 + Number(rewards.premium_days ?? 0) * 100;
}

function trendingScore(c: EnrichedCompetition): number {
  const ageDays = Math.max(1, (Date.now() - new Date(c.start_at).getTime()) / 864e5);
  const recencyBoost = c.status === "live" ? 3 : c.status === "upcoming" ? 1.5 : 0.3;
  return ((c.total_votes + c.follower_count * 2) / ageDays) * recencyBoost;
}

function LiveArenaPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const list = useServerFn(listCompetitionsEnriched);
  const cats = useServerFn(listCategories);
  const followedFn = useServerFn(listMyFollowedCompetitions);

  const { data: comps = [] } = useQuery({
    queryKey: ["competitions-enriched", "live-arena"],
    queryFn: () => list({}),
    refetchInterval: 30_000,
  });
  const { data: categories = [] } = useQuery({
    queryKey: ["competition-categories"],
    queryFn: () => cats({}),
  });
  const { data: followed = [] } = useQuery({
    queryKey: ["competitions-followed"],
    queryFn: () => followedFn({}),
    enabled: !!user,
  });

  // Realtime: any vote inserted triggers a debounced refetch
  useEffect(() => {
    let t: any = null;
    const ch = supabase
      .channel("live-arena-votes")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "competition_votes" }, () => {
        if (t) return;
        t = setTimeout(() => {
          qc.invalidateQueries({ queryKey: ["competitions-enriched", "live-arena"] });
          t = null;
        }, 1500);
      })
      .subscribe();
    return () => { if (t) clearTimeout(t); supabase.removeChannel(ch); };
  }, [qc]);

  const [filter, setFilter] = useState<Filter>("all");
  const [category, setCategory] = useState<string>("all");
  const [q, setQ] = useState("");

  const arr = comps as EnrichedCompetition[];
  const followedIds = new Set((followed as EnrichedCompetition[]).map((c) => c.id));

  const filtered = useMemo(() => {
    let list = arr.slice();
    if (category !== "all") list = list.filter((c) => c.category?.slug === category);
    if (q.trim()) {
      const s = q.trim().toLowerCase();
      list = list.filter((c) => c.name.toLowerCase().includes(s) || c.category?.name.toLowerCase().includes(s));
    }
    const now = Date.now();
    switch (filter) {
      case "live": return list.filter((c) => c.status === "live");
      case "upcoming": return list.filter((c) => c.status === "upcoming");
      case "ending":
        return list
          .filter((c) => c.status === "live" && new Date(c.end_at).getTime() - now < 6 * 3600_000)
          .sort((a, b) => new Date(a.end_at).getTime() - new Date(b.end_at).getTime());
      case "featured": return list.filter((c) => c.is_featured && c.status !== "completed");
      case "trending":
        return list.filter((c) => c.status !== "completed").sort((a, b) => trendingScore(b) - trendingScore(a));
      case "prize":
        return list.filter((c) => prizeValue(c.rewards) > 0 && c.status !== "completed")
          .sort((a, b) => prizeValue(b.rewards) - prizeValue(a.rewards));
      case "following":
        return list.filter((c) => followedIds.has(c.id));
      case "finished": return list.filter((c) => c.status === "completed");
      case "all":
      default:
        // Live first, then upcoming, then rest
        return list.sort((a, b) => {
          const rank = (s: string) => (s === "live" ? 0 : s === "upcoming" ? 1 : 2);
          return rank(a.status) - rank(b.status);
        });
    }
  }, [arr, filter, category, q, followedIds]);

  const liveCount = arr.filter((c) => c.status === "live").length;
  const totalWatching = arr.reduce((s, c) => s + (c.views_count ?? 0), 0);
  const totalVotes = arr.reduce((s, c) => s + (c.total_votes ?? 0), 0);
  const totalPrize = arr.reduce((s, c) => s + prizeValue(c.rewards), 0);

  const filters: { key: Filter; label: string; icon: React.ReactNode }[] = [
    { key: "all", label: "All", icon: <Sparkles className="h-3.5 w-3.5" /> },
    { key: "live", label: "Live", icon: <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-rose-400" /> },
    { key: "upcoming", label: "Upcoming", icon: <Clock className="h-3.5 w-3.5" /> },
    { key: "ending", label: "Ending Soon", icon: <Flame className="h-3.5 w-3.5" /> },
    { key: "featured", label: "Featured", icon: <Star className="h-3.5 w-3.5" /> },
    { key: "trending", label: "Trending", icon: <TrendingUp className="h-3.5 w-3.5" /> },
    { key: "prize", label: "Highest Prize", icon: <Trophy className="h-3.5 w-3.5" /> },
    { key: "following", label: "Following", icon: <Heart className="h-3.5 w-3.5" /> },
    { key: "finished", label: "Finished", icon: <Crown className="h-3.5 w-3.5" /> },
  ];

  return (
    <div
      className="relative min-h-screen pb-24 text-white"
      style={{
        background:
          "radial-gradient(1000px 500px at 15% -10%, rgba(124,58,237,0.18), transparent 60%)," +
          "radial-gradient(800px 400px at 100% 0%, rgba(245,158,11,0.10), transparent 60%)," +
          "linear-gradient(180deg, #0F172A 0%, #0B1220 60%, #0A0F1C 100%)",
      }}
    >
      {/* Hero */}
      <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/60 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3">
          <Link to="/competitions"><Button size="icon" variant="ghost"><ArrowLeft className="h-4 w-4" /></Button></Link>
          <div className="min-w-0 flex-1">
            <h1 className="flex items-center gap-2 text-lg font-black tracking-tight sm:text-xl">
              <Zap className="h-5 w-5 text-amber-400" />
              <span className="bg-gradient-to-r from-violet-300 via-fuchsia-200 to-amber-300 bg-clip-text text-transparent">LIVE ARENA</span>
              <span className="ml-1 inline-flex items-center gap-1 rounded-full border border-rose-400/30 bg-rose-500/15 px-2 py-0.5 text-[10px] font-bold text-rose-300">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-rose-400" /> REALTIME
              </span>
            </h1>
            <p className="truncate text-xs text-slate-300/80">
              Watch every live competition across BooBubble in one place · {liveCount} live now
            </p>
          </div>
          <div className="hidden items-center gap-2 md:flex">
            <StatPill icon={<Radio className="h-3.5 w-3.5" />} label="Live" value={liveCount} tint="rose" />
            <StatPill icon={<Eye className="h-3.5 w-3.5" />} label="Watching" value={totalWatching} tint="sky" />
            <StatPill icon={<Heart className="h-3.5 w-3.5" />} label="Votes" value={totalVotes} tint="fuchsia" />
            <StatPill icon={<Coins className="h-3.5 w-3.5" />} label="Prize" value={totalPrize} tint="amber" />
          </div>
        </div>

        {/* Filter bar */}
        <div className="border-t border-white/5 bg-slate-950/40">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-2 px-4 py-2.5">
            <div className="flex flex-1 flex-wrap gap-1.5">
              {filters.map((f) => {
                const active = filter === f.key;
                return (
                  <button
                    key={f.key}
                    onClick={() => setFilter(f.key)}
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all ${
                      active
                        ? "border-violet-400/50 bg-gradient-to-r from-violet-500/30 to-fuchsia-500/20 text-white shadow-[0_0_20px_rgba(139,92,246,0.35)]"
                        : "border-white/10 bg-white/[0.03] text-slate-300 hover:border-white/20 hover:bg-white/[0.06]"
                    }`}
                  >
                    {f.icon}{f.label}
                  </button>
                );
              })}
            </div>
            <div className="flex items-center gap-2">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-slate-200 outline-none hover:border-white/20"
              >
                <option value="all">All categories</option>
                {(categories as any[]).filter((c) => c.enabled).map((c) => (
                  <option key={c.id} value={c.slug}>{c.name}</option>
                ))}
              </select>
              <div className="relative">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                <Input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search competitions…"
                  className="h-8 w-48 rounded-full border-white/10 bg-white/[0.04] pl-8 text-xs placeholder:text-slate-500"
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6">
        {filtered.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.02] py-16 text-center text-sm text-slate-400">
            No competitions match your filters right now.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((c) => <ArenaCard key={c.id} c={c} />)}
          </div>
        )}
      </main>
    </div>
  );
}

function StatPill({ icon, label, value, tint }: { icon: React.ReactNode; label: string; value: number; tint: "rose" | "sky" | "fuchsia" | "amber" }) {
  const tints: Record<string, string> = {
    rose: "border-rose-400/30 bg-rose-500/10 text-rose-200",
    sky: "border-sky-400/30 bg-sky-500/10 text-sky-200",
    fuchsia: "border-fuchsia-400/30 bg-fuchsia-500/10 text-fuchsia-200",
    amber: "border-amber-400/30 bg-amber-500/10 text-amber-200",
  };
  return (
    <div className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${tints[tint]}`}>
      {icon}
      <AnimatedCounter value={value} className="tabular-nums" />
      <span className="uppercase tracking-wider opacity-75">{label}</span>
    </div>
  );
}

function battleStatus(c: EnrichedCompetition): { label: string; className: string } | null {
  const now = Date.now();
  const endsIn = new Date(c.end_at).getTime() - now;
  if (c.status === "live" && endsIn > 0 && endsIn < 3600_000) {
    return { label: "⏳ Final Hour", className: "border-rose-400/40 bg-rose-500/15 text-rose-200" };
  }
  const top = c.top_competitors ?? [];
  const total = top.reduce((s, x) => s + (x.votes ?? 0), 0);
  if (c.status === "live" && total > 0 && top.length >= 2) {
    const leadPct = (top[0].votes / total) * 100;
    const gap = leadPct - ((top[1].votes / total) * 100);
    if (leadPct >= 70) return { label: "👑 Dominating", className: "border-amber-400/40 bg-amber-500/15 text-amber-200" };
    if (gap < 5) return { label: "🔥 Neck to Neck", className: "border-orange-400/40 bg-orange-500/15 text-orange-200" };
  }
  if (c.status === "live" && (c.total_votes ?? 0) > 100) {
    return { label: "⚡ Rising Fast", className: "border-fuchsia-400/40 bg-fuchsia-500/15 text-fuchsia-200" };
  }
  return null;
}

function ArenaCard({ c }: { c: EnrichedCompetition }) {
  const status = battleStatus(c);
  const top = (c.top_competitors ?? []).slice(0, 3);
  const total = Math.max(1, top.reduce((s, x) => s + (x.votes ?? 0), 0));
  const prize = prizeValue(c.rewards);
  const rankIcons = ["👑", "🥈", "🥉"];
  const shareFn = useServerFn(shareCompetition);

  const onShare = async () => {
    const url = `${window.location.origin}/competitions/${c.slug}`;
    try {
      if (navigator.share) await navigator.share({ title: c.name, url });
      else { await navigator.clipboard.writeText(url); toast.success("Link copied"); }
      shareFn({ data: { competitionId: c.id, channel: "web" } }).catch(() => {});
    } catch { /* user cancelled */ }
  };

  return (
    <article
      className="group relative flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-slate-900/70 to-slate-950/70 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.6)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-violet-400/30 hover:shadow-[0_20px_60px_-20px_rgba(139,92,246,0.35)]"
    >
      {/* Gradient border sheen */}
      <div className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: "linear-gradient(135deg, rgba(139,92,246,0.12), transparent 40%, rgba(245,158,11,0.10))" }}
      />

      {/* Banner */}
      <div className="relative h-36 w-full overflow-hidden">
        {c.banner_url ? (
          <img src={c.banner_url} alt={c.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-violet-900/60 via-fuchsia-900/40 to-amber-900/40" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
        {/* Top-left: LIVE / status */}
        <div className="absolute left-3 top-3 flex items-center gap-1.5">
          {c.status === "live" && (
            <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/90 px-2 py-0.5 text-[10px] font-black tracking-wider text-white shadow-lg">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" /> LIVE
            </span>
          )}
          {c.status === "upcoming" && (
            <span className="rounded-full bg-sky-500/90 px-2 py-0.5 text-[10px] font-black tracking-wider text-white">UPCOMING</span>
          )}
          {c.status === "completed" && (
            <span className="rounded-full bg-slate-700/90 px-2 py-0.5 text-[10px] font-black tracking-wider text-white">ENDED</span>
          )}
          {c.category && (
            <span
              className="rounded-full border border-white/20 bg-black/40 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur"
              style={{ color: c.category.color ?? undefined }}
            >
              {c.category.name}
            </span>
          )}
          {c.is_featured && (
            <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-400/95 px-2 py-0.5 text-[10px] font-black text-slate-900">
              <Star className="h-3 w-3" /> Featured
            </span>
          )}
        </div>
        {/* Top-right: countdown */}
        <div className="absolute right-3 top-3 rounded-full border border-white/15 bg-black/50 px-2 py-1 backdrop-blur">
          {c.status !== "completed" ? (
            <Countdown endAt={c.status === "upcoming" ? c.start_at : c.end_at} compact />
          ) : (
            <span className="text-[10px] font-bold text-slate-300">Finished</span>
          )}
        </div>
        {/* Title over banner */}
        <div className="absolute bottom-2 left-3 right-3">
          <h3 className="line-clamp-1 text-base font-black tracking-tight text-white drop-shadow-lg">{c.name}</h3>
          <div className="mt-0.5 flex items-center gap-2 text-[10px] font-semibold text-slate-300/90">
            {prize > 0 && <span className="inline-flex items-center gap-0.5"><Coins className="h-3 w-3 text-amber-300" />{prize.toLocaleString()}</span>}
            {status && <span className={`rounded-full border px-1.5 py-0.5 text-[10px] font-black ${status.className}`}>{status.label}</span>}
          </div>
        </div>
      </div>

      {/* Mini ticker */}
      <div className="flex items-center gap-2 border-b border-white/5 bg-white/[0.02] px-4 py-1.5 text-[10px] font-semibold text-slate-400">
        <TickerText c={c} />
      </div>

      {/* Nominees / bars */}
      <div className="flex-1 space-y-2 px-4 py-3">
        {top.length === 0 ? (
          <div className="py-4 text-center text-xs text-slate-500">No nominees yet</div>
        ) : (
          top.map((n, i) => {
            const pct = Math.round((n.votes / total) * 100);
            const barTint = i === 0
              ? "from-amber-400 to-amber-500"
              : i === 1 ? "from-slate-300 to-slate-400" : "from-orange-400 to-rose-400";
            return (
              <div key={n.id} className="space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <div className="flex min-w-0 items-center gap-1.5">
                    <span className="w-4 text-center">{rankIcons[i]}</span>
                    {n.photo_url ? (
                      <img src={n.photo_url} alt="" className="h-5 w-5 shrink-0 rounded-full object-cover ring-1 ring-white/20" />
                    ) : (
                      <div className="h-5 w-5 shrink-0 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500" />
                    )}
                    <span className="truncate font-semibold text-slate-100">{n.name}</span>
                  </div>
                  <span className="shrink-0 font-bold tabular-nums text-slate-200">{pct}%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${barTint} transition-[width] duration-700 ease-out`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-1 border-t border-white/5 bg-white/[0.02] px-4 py-2 text-center text-[10px] text-slate-300">
        <Stat icon={<Heart className="h-3 w-3 text-rose-300" />} value={c.total_votes} />
        <Stat icon={<Eye className="h-3 w-3 text-sky-300" />} value={c.views_count ?? 0} />
        <Stat icon={<Users className="h-3 w-3 text-violet-300" />} value={c.total_participants} />
        <Stat icon={<Star className="h-3 w-3 text-amber-300" />} value={c.follower_count} />
        <Stat icon={<MessageCircle className="h-3 w-3 text-emerald-300" />} value={0} />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5 border-t border-white/5 p-3">
        <Link
          to="/competitions/$slug"
          params={{ slug: c.slug }}
          className="inline-flex flex-1 items-center justify-center gap-1 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 py-2 text-xs font-bold text-white shadow-lg shadow-violet-500/25 transition-transform hover:scale-[1.02]"
        >
          <Zap className="h-3.5 w-3.5" /> {c.status === "live" ? "Vote Now" : c.status === "upcoming" ? "Preview" : "View Result"}
        </Link>
        <Link
          to="/competitions/$slug"
          params={{ slug: c.slug }}
          className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-white/[0.06]"
        >
          Open Battle
        </Link>
        <button
          type="button"
          onClick={onShare}
          className="rounded-xl border border-white/10 bg-white/[0.03] p-2 text-slate-300 hover:bg-white/[0.06]"
          title="Share"
        >
          <Share2 className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          className="rounded-xl border border-white/10 bg-white/[0.03] p-2 text-slate-300 hover:bg-white/[0.06]"
          title="Bookmark"
        >
          <Bookmark className="h-3.5 w-3.5" />
        </button>
      </div>
    </article>
  );
}

function Stat({ icon, value }: { icon: React.ReactNode; value: number }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <div>{icon}</div>
      <AnimatedCounter value={value ?? 0} className="font-bold tabular-nums text-slate-100" />
    </div>
  );
}

function TickerText({ c }: { c: EnrichedCompetition }) {
  const msgs: string[] = [];
  if (c.status === "live") {
    if ((c.total_votes ?? 0) > 0) msgs.push(`🗳️ ${c.total_votes.toLocaleString()} total votes`);
    if ((c.views_count ?? 0) > 0) msgs.push(`👥 ${c.views_count.toLocaleString()} watching`);
    const gap = (() => {
      const t = c.top_competitors ?? [];
      if (t.length < 2) return null;
      const sum = t.reduce((s, x) => s + x.votes, 0) || 1;
      return Math.round(((t[0].votes - t[1].votes) / sum) * 100);
    })();
    if (gap !== null) msgs.push(gap < 5 ? "🔥 Battle heating up" : `⚡ Leader by ${gap}%`);
  } else if (c.status === "upcoming") {
    msgs.push("⏳ Starting soon");
  } else {
    msgs.push("🏁 Competition finished");
  }
  return <span className="truncate">{msgs.join("  ·  ")}</span>;
}
