import { createFileRoute, Link } from "@tanstack/react-router";
import type React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft, Flame, Heart, Zap, Search, Crown, Clock, Trophy, Sparkles,
  Star, Eye, Users, MessageCircle, Bookmark, Share2, Radio, TrendingUp, Coins,
  RefreshCw, LayoutGrid, Rows3,
} from "lucide-react";
import {
  listCompetitionsEnriched,
  listCategories,
  listMyFollowedCompetitions,
  listRecentCompetitionVoters,
  shareCompetition,
  type EnrichedCompetition,
} from "@/lib/competitions.functions";
import { AnimatePresence, motion } from "framer-motion";
import { BadgeCheck } from "lucide-react";
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
type Density = "compact" | "expanded";

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

  const { data: comps = [], dataUpdatedAt } = useQuery({
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
  const [density, setDensity] = useState<Density>("compact");
  const [lastUpdated, setLastUpdated] = useState<string>("just now");

  useEffect(() => {
    const tick = () => {
      const s = Math.max(0, Math.round((Date.now() - dataUpdatedAt) / 1000));
      if (s < 5) setLastUpdated("just now");
      else if (s < 60) setLastUpdated(`${s}s ago`);
      else setLastUpdated(`${Math.floor(s / 60)}m ago`);
    };
    tick();
    const i = setInterval(tick, 5000);
    return () => clearInterval(i);
  }, [dataUpdatedAt]);

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
    { key: "all", label: "All", icon: <Sparkles className="h-3 w-3" /> },
    { key: "live", label: "Live", icon: <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-rose-400" /> },
    { key: "upcoming", label: "Upcoming", icon: <Clock className="h-3 w-3" /> },
    { key: "ending", label: "Ending Soon", icon: <Flame className="h-3 w-3" /> },
    { key: "featured", label: "Featured", icon: <Star className="h-3 w-3" /> },
    { key: "trending", label: "Trending", icon: <TrendingUp className="h-3 w-3" /> },
    { key: "prize", label: "Highest Prize", icon: <Trophy className="h-3 w-3" /> },
    { key: "following", label: "Following", icon: <Heart className="h-3 w-3" /> },
    { key: "finished", label: "Finished", icon: <Crown className="h-3 w-3" /> },
  ];

  return (
    <div
      className="relative min-h-screen pb-16 text-white"
      style={{
        background:
          "radial-gradient(1200px 600px at 15% -10%, rgba(124,58,237,0.14), transparent 60%)," +
          "radial-gradient(900px 500px at 100% 0%, rgba(245,158,11,0.08), transparent 60%)," +
          "radial-gradient(700px 400px at 50% 100%, rgba(236,72,153,0.06), transparent 60%)," +
          "linear-gradient(180deg, #0F172A 0%, #0B1220 60%, #0A0F1C 100%)",
      }}
    >
      {/* Hero */}
      <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl">
        <div className="mx-auto grid max-w-[1600px] grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-4 py-2.5">
          <Link to="/competitions">
            <Button size="icon" variant="ghost" className="h-8 w-8"><ArrowLeft className="h-4 w-4" /></Button>
          </Link>
          <div className="min-w-0 flex items-center gap-3 flex-wrap">
            <div className="min-w-0">
              <h1 className="flex items-center gap-2 text-base font-black tracking-tight sm:text-lg">
                <Zap className="h-4 w-4 text-amber-400" />
                <span className="bg-gradient-to-r from-violet-300 via-fuchsia-200 to-amber-300 bg-clip-text text-transparent">LIVE ARENA</span>
                <span className="inline-flex items-center gap-1 rounded-full border border-rose-400/30 bg-rose-500/15 px-1.5 py-0.5 text-[9px] font-bold text-rose-300">
                  <span className="h-1 w-1 animate-pulse rounded-full bg-rose-400" /> REALTIME
                </span>
              </h1>
              <p className="truncate text-[11px] text-slate-400">Watch every live competition across BooBubble in one place</p>
            </div>
            <div className="hidden lg:flex items-center gap-1.5">
              <StatPill icon={<Radio className="h-3 w-3" />} label="Live Now" value={liveCount} tint="rose" />
              <StatPill icon={<Eye className="h-3 w-3" />} label="Watching" value={totalWatching} tint="sky" />
              <StatPill icon={<Heart className="h-3 w-3" />} label="Votes Today" value={totalVotes} tint="fuchsia" />
              <StatPill icon={<Trophy className="h-3 w-3" />} label="Total Prize" value={totalPrize} tint="amber" />
            </div>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-semibold text-slate-400">
            <RefreshCw className="h-3 w-3" />
            <span>Updated {lastUpdated}</span>
            <span className="ml-1 h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
          </div>
        </div>

        {/* Filter bar */}
        <div className="border-t border-white/5 bg-slate-950/40">
          <div className="mx-auto flex max-w-[1600px] flex-wrap items-center gap-2 px-4 py-2">
            <div className="flex flex-1 flex-wrap gap-1">
              {filters.map((f) => {
                const active = filter === f.key;
                return (
                  <button
                    key={f.key}
                    onClick={() => setFilter(f.key)}
                    className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-all ${
                      active
                        ? "border-violet-400/50 bg-gradient-to-r from-violet-500/25 to-fuchsia-500/15 text-white shadow-[0_0_16px_rgba(139,92,246,0.30)]"
                        : "border-white/10 bg-white/[0.03] text-slate-300 hover:border-white/20 hover:bg-white/[0.06]"
                    }`}
                  >
                    {f.icon}{f.label}
                  </button>
                );
              })}
            </div>
            <div className="flex items-center gap-1.5">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="h-7 rounded-full border border-white/10 bg-white/[0.04] px-2.5 text-[11px] font-semibold text-slate-200 outline-none hover:border-white/20"
              >
                <option value="all">All categories</option>
                {(categories as any[]).filter((c) => c.enabled).map((c) => (
                  <option key={c.id} value={c.slug}>{c.name}</option>
                ))}
              </select>
              <div className="relative">
                <Search className="pointer-events-none absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-slate-400" />
                <Input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search…"
                  className="h-7 w-40 rounded-full border-white/10 bg-white/[0.04] pl-7 text-[11px] placeholder:text-slate-500"
                />
              </div>
            </div>
          </div>
          {/* Density toggle row */}
          <div className="mx-auto flex max-w-[1600px] items-center justify-between px-4 pb-2 pt-0.5">
            <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-500">
              <span>View:</span>
              <div className="inline-flex overflow-hidden rounded-full border border-white/10 bg-white/[0.03]">
                <button
                  onClick={() => setDensity("compact")}
                  className={`inline-flex items-center gap-1 px-2 py-1 text-[10px] font-semibold ${density === "compact" ? "bg-violet-500/25 text-white" : "text-slate-400 hover:text-slate-200"}`}
                >
                  <Rows3 className="h-3 w-3" /> Compact
                </button>
                <button
                  onClick={() => setDensity("expanded")}
                  className={`inline-flex items-center gap-1 px-2 py-1 text-[10px] font-semibold ${density === "expanded" ? "bg-violet-500/25 text-white" : "text-slate-400 hover:text-slate-200"}`}
                >
                  <LayoutGrid className="h-3 w-3" /> Expanded
                </button>
              </div>
            </div>
            <div className="text-[10px] font-semibold text-slate-500">
              {filtered.length} competition{filtered.length === 1 ? "" : "s"}
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1600px] px-3 py-3">
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] py-16 text-center text-sm text-slate-400">
            No competitions match your filters right now.
          </div>
        ) : (
          <div
            className={
              density === "compact"
                ? "grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5"
                : "grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            }
          >
            {filtered.map((c) => <ArenaCard key={c.id} c={c} />)}
          </div>
        )}
      </main>
    </div>
  );
}

function StatPill({ icon, label, value, tint }: { icon: React.ReactNode; label: string; value: number; tint: "rose" | "sky" | "fuchsia" | "amber" }) {
  const tints: Record<string, string> = {
    rose: "border-rose-400/25 bg-rose-500/10 text-rose-200",
    sky: "border-sky-400/25 bg-sky-500/10 text-sky-200",
    fuchsia: "border-fuchsia-400/25 bg-fuchsia-500/10 text-fuchsia-200",
    amber: "border-amber-400/25 bg-amber-500/10 text-amber-200",
  };
  return (
    <div className={`inline-flex flex-col items-center rounded-xl border px-2.5 py-1 leading-tight ${tints[tint]}`}>
      <div className="inline-flex items-center gap-1 text-[12px] font-black">
        {icon}
        <AnimatedCounter value={value} className="tabular-nums" />
      </div>
      <span className="text-[8.5px] font-bold uppercase tracking-wider opacity-70">{label}</span>
    </div>
  );
}

function battleStatus(c: EnrichedCompetition): { label: string; className: string } | null {
  const now = Date.now();
  const endsIn = new Date(c.end_at).getTime() - now;
  if (c.status === "live" && endsIn > 0 && endsIn < 3600_000) {
    return { label: "⏳ FINAL HOUR", className: "border-rose-400/40 bg-gradient-to-r from-rose-500/20 to-orange-500/15 text-rose-200" };
  }
  const top = c.top_competitors ?? [];
  const total = top.reduce((s, x) => s + (x.votes ?? 0), 0);
  if (c.status === "live" && total > 0 && top.length >= 2) {
    const leadPct = (top[0].votes / total) * 100;
    const gap = leadPct - ((top[1].votes / total) * 100);
    if (leadPct >= 70) return { label: "👑 DOMINATING", className: "border-emerald-400/40 bg-gradient-to-r from-emerald-500/20 to-teal-500/15 text-emerald-200" };
    if (gap < 5) return { label: "🔥 NECK TO NECK", className: "border-orange-400/40 bg-gradient-to-r from-orange-500/20 to-amber-500/15 text-orange-200" };
  }
  if (c.status === "live" && (c.total_votes ?? 0) > 100) {
    return { label: "⚡ RISING FAST", className: "border-fuchsia-400/40 bg-gradient-to-r from-fuchsia-500/20 to-violet-500/15 text-fuchsia-200" };
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

  const onShare = async (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    const url = `${window.location.origin}/competitions/${c.slug}`;
    try {
      if (navigator.share) await navigator.share({ title: c.name, url });
      else { await navigator.clipboard.writeText(url); toast.success("Link copied"); }
      shareFn({ data: { competitionId: c.id, channel: "web" } }).catch(() => {});
    } catch { /* user cancelled */ }
  };

  const barTint = (i: number) =>
    i === 0
      ? "from-amber-400 via-orange-400 to-rose-400"
      : i === 1
      ? "from-fuchsia-400 to-violet-500"
      : "from-slate-400 to-slate-500";

  return (
    <article
      className="group relative flex flex-col overflow-hidden rounded-xl border border-white/[0.08] bg-gradient-to-br from-slate-900/80 to-slate-950/90 shadow-[0_6px_20px_-10px_rgba(0,0,0,0.5)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-violet-400/25 hover:shadow-[0_12px_30px_-12px_rgba(139,92,246,0.25)]"
    >
      {/* Top strip: LIVE / category / countdown / watching */}
      <div className="flex items-center justify-between gap-1.5 px-2 pt-1.5">
        <div className="flex min-w-0 items-center gap-1">
          {c.status === "live" && (
            <span className="inline-flex items-center gap-1 rounded bg-rose-500 px-1 py-[1px] text-[8px] font-black tracking-wider text-white shadow-[0_0_8px_rgba(244,63,94,0.4)]">
              <span className="h-1 w-1 animate-pulse rounded-full bg-white" /> LIVE
            </span>
          )}
          {c.status === "upcoming" && (
            <span className="rounded bg-sky-500 px-1 py-[1px] text-[8px] font-black tracking-wider text-white">UPCOMING</span>
          )}
          {c.status === "completed" && (
            <span className="rounded bg-slate-700 px-1 py-[1px] text-[8px] font-black tracking-wider text-white">ENDED</span>
          )}
          {c.category && (
            <span
              className="truncate rounded border border-white/10 bg-white/[0.04] px-1 py-[1px] text-[8px] font-bold text-slate-300"
              style={{ color: c.category.color ?? undefined }}
            >
              {c.category.name}
            </span>
          )}
          {c.is_featured && (
            <span className="inline-flex items-center gap-0.5 rounded bg-amber-400/95 px-1 py-[1px] text-[8px] font-black text-slate-900">
              <Star className="h-2 w-2" />
            </span>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-1 text-[8px] font-bold text-slate-400">
          <span className="inline-flex items-center gap-0.5">
            <Users className="h-2 w-2" /> {formatK(c.views_count ?? 0)}
          </span>
        </div>
      </div>

      {/* Body: left banner + right nominees */}
      <div className="flex gap-2 px-2 pt-1.5">
        {/* LEFT */}
        <div className="flex w-[32%] shrink-0 flex-col">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg border border-white/5">
            {c.banner_url ? (
              <img src={c.banner_url} alt={c.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
            ) : (
              <div className="h-full w-full bg-gradient-to-br from-violet-900/60 via-fuchsia-900/40 to-amber-900/40" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
            {status && (
              <div className="absolute inset-x-1 bottom-1">
                <span className={`block truncate rounded border px-1 py-[1px] text-center text-[7.5px] font-black tracking-wider ${status.className}`}>
                  {status.label}
                </span>
              </div>
            )}
          </div>
          <h3 className="mt-1 line-clamp-1 text-[12px] font-black tracking-tight text-white">{c.name}</h3>
          <p className="line-clamp-1 text-[9px] font-semibold text-slate-400">{c.category?.name ?? "General"}</p>
          {prize > 0 && (
            <p className="mt-0.5 inline-flex items-center gap-0.5 text-[10px] font-black text-amber-300">
              <Coins className="h-2.5 w-2.5" /> {prize.toLocaleString()}
            </p>
          )}
          <div className="mt-0.5 text-[9px] font-bold text-slate-400">
            {c.status !== "completed" ? (
              <Countdown endAt={c.status === "upcoming" ? c.start_at : c.end_at} compact />
            ) : (
              <span>Finished</span>
            )}
          </div>
          {c.status !== "completed" && <CardLiveSupporters competitionId={c.id} />}
        </div>

        {/* RIGHT — nominees */}
        <div className="flex min-w-0 flex-1 flex-col justify-center gap-1">
          {top.length === 0 ? (
            <div className="rounded-md border border-dashed border-white/10 bg-white/[0.02] py-3 text-center text-[9px] text-slate-500">
              No nominees yet
            </div>
          ) : (
            top.map((n, i) => {
              const pct = Math.round((n.votes / total) * 100);
              return (
                <div key={n.id} className="space-y-[1px]">
                  <div className="flex items-center justify-between gap-1.5 text-[9.5px]">
                    <div className="flex min-w-0 items-center gap-1">
                      <span className="w-2.5 shrink-0 text-center text-[10px] leading-none">{rankIcons[i]}</span>
                      {n.photo_url ? (
                        <img src={n.photo_url} alt="" className={`h-3.5 w-3.5 shrink-0 rounded-full object-cover ring-1 ${i === 0 ? "ring-amber-300/60" : "ring-white/15"}`} />
                      ) : (
                        <div className="h-3.5 w-3.5 shrink-0 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500" />
                      )}
                      <span className={`truncate font-bold ${i === 0 ? "text-white" : "text-slate-200"}`}>{n.name}</span>
                    </div>
                    <span className="shrink-0 text-[9.5px] font-black tabular-nums text-slate-100">{pct}%</span>
                  </div>
                  <div className="h-1 overflow-hidden rounded-full bg-white/[0.05]">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${barTint(i)} transition-[width] duration-700 ease-out`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Stats row */}
      <div className="mt-1.5 flex items-center justify-between border-t border-white/[0.06] bg-white/[0.015] px-2 py-1 text-[9px] text-slate-400">
        <MiniStat icon={<Heart className="h-2.5 w-2.5 text-rose-300" />} value={c.total_votes} />
        <MiniStat icon={<MessageCircle className="h-2.5 w-2.5 text-emerald-300" />} value={0} />
        <MiniStat icon={<Star className="h-2.5 w-2.5 text-amber-300" />} value={c.follower_count} />
        <MiniStat icon={<Eye className="h-2.5 w-2.5 text-sky-300" />} value={c.views_count ?? 0} />
        <MiniStat icon={<Users className="h-2.5 w-2.5 text-violet-300" />} value={c.total_participants} />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 border-t border-white/[0.06] p-1.5">
        <Link
          to="/competitions/$slug"
          params={{ slug: c.slug }}
          className="inline-flex flex-1 items-center justify-center gap-1 rounded-md bg-gradient-to-r from-violet-500 to-fuchsia-500 py-1 text-[10px] font-black text-white shadow-md shadow-violet-500/20 transition-transform hover:scale-[1.01]"
        >
          <Zap className="h-2.5 w-2.5" /> {c.status === "live" ? "Vote" : c.status === "upcoming" ? "Preview" : "Result"}
        </Link>
        <Link
          to="/competitions/$slug"
          params={{ slug: c.slug }}
          className="inline-flex items-center justify-center rounded-md border border-white/10 bg-white/[0.03] px-2 py-1 text-[10px] font-bold text-slate-200 hover:bg-white/[0.06]"
        >
          Open
        </Link>
        <button
          type="button"
          onClick={onShare}
          className="rounded-md border border-white/10 bg-white/[0.03] p-1 text-slate-300 hover:bg-white/[0.06]"
          title="Share"
        >
          <Share2 className="h-2.5 w-2.5" />
        </button>
        <button
          type="button"
          className="rounded-md border border-white/10 bg-white/[0.03] p-1 text-slate-300 hover:bg-white/[0.06]"
          title="Bookmark"
        >
          <Bookmark className="h-2.5 w-2.5" />
        </button>
      </div>
    </article>
  );
}

function MiniStat({ icon, value }: { icon: React.ReactNode; value: number }) {
  return (
    <div className="inline-flex items-center gap-1">
      {icon}
      <span className="font-bold tabular-nums text-slate-200">{formatK(value ?? 0)}</span>
    </div>
  );
}

function formatK(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function timeAgoShort(iso: string): string {
  const diff = Math.max(0, Date.now() - new Date(iso).getTime());
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s || 1}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function CardLiveSupporters({ competitionId }: { competitionId: string }) {
  const fetcher = useServerFn(listRecentCompetitionVoters);
  const { data = [], refetch } = useQuery({
    queryKey: ["arena-card-voters", competitionId],
    queryFn: () => fetcher({ data: { competitionId, limit: 30 } }),
    staleTime: 30_000,
    refetchInterval: 60_000,
  });

  // Realtime — reuse existing broadcast channel emitted on vote
  useEffect(() => {
    const ch = supabase
      .channel(`arena-card:${competitionId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "competition_votes", filter: `competition_id=eq.${competitionId}` },
        () => refetch(),
      )
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [competitionId, refetch]);

  // Keep "X min ago" fresh
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 30_000);
    return () => clearInterval(id);
  }, []);

  const voters = data as Array<{
    voter_id: string;
    voted_at: string;
    username: string | null;
    avatar_url: string | null;
    avatar_color: string | null;
    is_verified: boolean;
  }>;

  // Engagement badge — votes in last 10 minutes
  const recent10m = useMemo(() => {
    const cutoff = Date.now() - 10 * 60_000;
    return voters.filter((v) => new Date(v.voted_at).getTime() >= cutoff).length;
  }, [voters]);

  const engagement = recent10m > 50
    ? { label: "⚡ Voting Frenzy", cls: "border-fuchsia-400/40 bg-fuchsia-500/15 text-fuchsia-200" }
    : recent10m > 10
      ? { label: "🔥 Crowd is Active", cls: "border-orange-400/40 bg-orange-500/15 text-orange-200" }
      : null;

  if (voters.length === 0) {
    return (
      <div className="mt-2 rounded-lg border border-dashed border-white/10 bg-white/[0.02] px-2 py-1.5 text-center text-[9.5px] font-semibold text-slate-400">
        ✨ Be the first supporter
      </div>
    );
  }

  const stack = voters.slice(0, 6);
  const extra = Math.max(0, voters.length - stack.length);
  const strip = voters.slice(0, 3);

  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex items-center gap-1">
        <div className="flex -space-x-2">
          <AnimatePresence initial={false}>
            {stack.map((v) => (
              <motion.div
                key={`${v.voter_id}-${v.voted_at}`}
                layout
                initial={{ opacity: 0, scale: 0.5, x: -8 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ type: "spring", stiffness: 320, damping: 24 }}
                className="relative h-5 w-5 shrink-0 overflow-hidden rounded-full border border-slate-900 ring-1 ring-white/10"
                style={{ background: v.avatar_color ?? "#334155" }}
                title={v.username ?? "Supporter"}
              >
                {v.avatar_url ? (
                  <img src={v.avatar_url} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span className="flex h-full w-full items-center justify-center text-[8px] font-black text-white">
                    {(v.username ?? "?").slice(0, 1).toUpperCase()}
                  </span>
                )}
                {v.is_verified && (
                  <BadgeCheck className="absolute -bottom-0.5 -right-0.5 h-2 w-2 text-sky-400" />
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        {extra > 0 && (
          <span className="ml-1 text-[9px] font-bold text-slate-400">+{extra} more</span>
        )}
      </div>

      {engagement && (
        <span className={`inline-block rounded-full border px-1.5 py-[1px] text-[8.5px] font-black tracking-wide ${engagement.cls}`}>
          {engagement.label}
        </span>
      )}

      <div>
        <div className="text-[8.5px] font-bold uppercase tracking-wider text-slate-500">Recently supported</div>
        <ul className="mt-0.5 space-y-[1px]">
          {strip.map((v) => (
            <li key={`${v.voter_id}-${v.voted_at}-r`} className="flex items-center justify-between gap-1 text-[9.5px]">
              <span className="flex min-w-0 items-center gap-0.5">
                <span className="truncate font-bold text-slate-200">{v.username ?? "Supporter"}</span>
                {v.is_verified && <BadgeCheck className="h-2 w-2 shrink-0 text-sky-400" />}
              </span>
              <span className="shrink-0 text-[8.5px] font-semibold text-slate-500">{timeAgoShort(v.voted_at)}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
