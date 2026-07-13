import { createFileRoute, Link } from "@tanstack/react-router";
import type React from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { ArrowLeft, Flame, Heart, Plus, Sparkles, Trophy, Crown, Clock, CheckCircle2, Star, Coins } from "lucide-react";
import {
  listCompetitionsEnriched,
  listCategories,
  adminListAllCompetitions,
  listMyFollowedCompetitions,
  type EnrichedCompetition,
} from "@/lib/competitions.functions";
import { CompetitionProfileCard } from "@/components/competitions/CompetitionProfileCard";
import { CompetitionEditorDialog, emptyCompetition } from "@/components/competitions/CompetitionEditorDialog";
import { AdminCompetitionManageDialog } from "@/components/competitions/AdminCompetitionManageDialog";
import { useMyRoles } from "@/lib/use-my-role";
import { useAuth } from "@/lib/auth-store";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/competitions/")({
  head: () => ({
    meta: [
      { title: "Community Competitions — Live, Trending & Upcoming" },
      { name: "description", content: "Discover live competitions, join tournaments, vote for your favorite nominees, and win prizes across every category." },
      { property: "og:title", content: "Community Competitions" },
      { property: "og:description", content: "Vote, join, and win in community competitions." },
      { property: "og:type", content: "website" },
    ],
  }),
  component: CompetitionsIndex,
});

function prizeValue(rewards: any): number {
  if (!rewards || typeof rewards !== "object") return 0;
  return Number(rewards.coins ?? 0) + Number(rewards.xp ?? 0) * 0.5 + Number(rewards.premium_days ?? 0) * 100;
}

function trendingScore(c: EnrichedCompetition): number {
  const ageDays = Math.max(1, (Date.now() - new Date(c.start_at).getTime()) / 864e5);
  const recencyBoost = c.status === "live" ? 3 : c.status === "upcoming" ? 1.5 : 0.3;
  return ((c.total_votes + c.follower_count * 2) / ageDays) * recencyBoost;
}

function popularityScore(c: EnrichedCompetition): number {
  return c.total_votes * 2 + c.follower_count * 3 + c.total_participants + (c.views_count ?? 0) * 0.1;
}

function CompetitionsIndex() {
  const { isAdmin } = useMyRoles();
  const { user } = useAuth();
  const list = useServerFn(listCompetitionsEnriched);
  const adminList = useServerFn(adminListAllCompetitions);
  const followedFn = useServerFn(listMyFollowedCompetitions);
  const cats = useServerFn(listCategories);

  const { data: comps = [] } = useQuery({
    queryKey: ["competitions-enriched", isAdmin ? "admin" : "public"],
    queryFn: () => list({}),
  });
  const { data: adminExtras = [] } = useQuery({
    queryKey: ["competitions-admin-extras"],
    queryFn: () => adminList({}),
    enabled: isAdmin,
  });
  const { data: followed = [] } = useQuery({
    queryKey: ["competitions-followed"],
    queryFn: () => followedFn({}),
    enabled: !!user,
  });
  const { data: categories = [] } = useQuery({
    queryKey: ["competition-categories"],
    queryFn: () => cats({}),
  });

  const [category, setCategory] = useState<string>("all");
  const [editing, setEditing] = useState<any | null>(null);
  const [managing, setManaging] = useState<string | null>(null);

  const openEdit = (c: any) => {
    setEditing({
      id: c.id,
      name: c.name ?? "",
      slug: c.slug ?? "",
      description: c.description ?? "",
      rules: c.rules ?? "",
      banner_url: c.banner_url ?? "",
      category_id: c.category_id ?? c.category?.id ?? null,
      start_at: new Date(c.start_at).toISOString().slice(0, 16),
      end_at: new Date(c.end_at).toISOString().slice(0, 16),
      max_participants: c.max_participants ?? null,
      winner_count: c.winner_count ?? 1,
      status: c.status ?? "draft",
      allow_vote_change: !!c.allow_vote_change,
      show_live_counts: c.show_live_counts !== false,
      require_approval: !!c.require_approval,
      rewards: c.rewards ?? { coins: 0, xp: 0, badge: "", premium_days: 0, custom: "" },
      announce_channels: c.announce_channels ?? [],
      is_published: c.is_published !== false,
    });
  };

  const filtered = useMemo<EnrichedCompetition[]>(() => {
    const arr = comps as EnrichedCompetition[];
    if (category === "all") return arr;
    return arr.filter((c) => c.category?.slug === category);
  }, [comps, category]);

  const now = Date.now();
  const live = filtered.filter((c) => c.status === "live");
  const upcoming = filtered.filter((c) => c.status === "upcoming");
  const ended = [...filtered.filter((c) => c.status === "completed")]
    .sort((a, b) => new Date(b.end_at).getTime() - new Date(a.end_at).getTime());
  const recentlyEnded = ended.filter((c) => now - new Date(c.end_at).getTime() < 30 * 864e5).slice(0, 12);
  const featured = filtered.filter((c) => c.is_featured && c.status !== "completed").slice(0, 12);
  const trending = [...filtered]
    .filter((c) => c.status === "live" || c.status === "upcoming")
    .sort((a, b) => trendingScore(b) - trendingScore(a))
    .slice(0, 12);
  const popular = [...filtered]
    .sort((a, b) => popularityScore(b) - popularityScore(a))
    .slice(0, 12);
  const highestPrize = [...filtered]
    .filter((c) => prizeValue(c.rewards) > 0 && c.status !== "completed")
    .sort((a, b) => prizeValue(b.rewards) - prizeValue(a.rewards))
    .slice(0, 12);
  const following = (followed as EnrichedCompetition[]).filter(
    (c) => category === "all" || c.category?.slug === category
  );

  const trendingIds = new Set(trending.slice(0, 6).map((c) => c.id));
  const byCategory = new Map<string, EnrichedCompetition[]>();
  filtered.forEach((c) => {
    const key = c.category?.slug ?? "uncategorized";
    if (!byCategory.has(key)) byCategory.set(key, []);
    byCategory.get(key)!.push(c);
  });

  const sections: Array<{
    key: string;
    title: string;
    icon: React.ReactNode;
    items: EnrichedCompetition[];
    empty?: string;
    tint?: string;
  }> = [
    { key: "live", title: "Live Now", icon: <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-emerald-400" />, items: live, empty: "No live competitions right now — check back soon.", tint: "text-emerald-300" },
    { key: "featured", title: "Featured", icon: <Sparkles className="h-4 w-4" />, items: featured, tint: "text-amber-300" },
    { key: "trending", title: "Trending", icon: <Flame className="h-4 w-4" />, items: trending, tint: "text-rose-300" },
    { key: "upcoming", title: "Upcoming", icon: <Clock className="h-4 w-4" />, items: upcoming, empty: "Nothing on the horizon yet.", tint: "text-sky-300" },
    { key: "highestPrize", title: "Highest Prize", icon: <Coins className="h-4 w-4" />, items: highestPrize, tint: "text-amber-300" },
    { key: "popular", title: "Most Popular", icon: <Crown className="h-4 w-4" />, items: popular, tint: "text-fuchsia-300" },
    { key: "following", title: "Following", icon: <Heart className="h-4 w-4" />, items: following, empty: user ? "Follow a competition to see it here." : "Sign in to follow competitions.", tint: "text-rose-300" },
    { key: "recentlyEnded", title: "Recently Ended", icon: <CheckCircle2 className="h-4 w-4" />, items: recentlyEnded, tint: "text-zinc-300" },
  ];

  const combinedForAdmin = useMemo(() => {
    if (!isAdmin) return comps;
    // Merge admin's private drafts (from adminList) with enriched public list so edit works.
    const enrichedIds = new Set((comps as EnrichedCompetition[]).map((c) => c.id));
    const extraDrafts = (adminExtras as any[]).filter((c) => !enrichedIds.has(c.id));
    return [...(comps as any[]), ...extraDrafts];
  }, [comps, adminExtras, isAdmin]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-background/95 pb-24 text-foreground">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
          <Link to="/feed"><Button size="icon" variant="ghost"><ArrowLeft className="h-4 w-4" /></Button></Link>
          <div className="flex-1">
            <h1 className="flex items-center gap-2 text-lg font-bold">
              <Trophy className="h-5 w-5 text-amber-400" /> Competitions
            </h1>
            <p className="text-xs text-muted-foreground">Discover, vote, and win across every category.</p>
          </div>
          <Link to="/competitions/hall-of-fame">
            <Button variant="outline" size="sm" className="gap-1">
              <Star className="h-3.5 w-3.5" /> Hall of Fame
            </Button>
          </Link>
          <Link to="/competitions/leaderboard">
            <Button variant="outline" size="sm">Leaderboard</Button>
          </Link>
          {isAdmin && (
            <Button size="sm" onClick={() => setEditing(emptyCompetition())}>
              <Plus className="mr-1 h-4 w-4" /> New
            </Button>
          )}
        </div>
      </header>

      <CompetitionEditorDialog
        value={editing}
        onChange={setEditing}
        invalidateKeys={[["competitions-enriched", "admin"], ["competitions-enriched", "public"], ["competitions-admin-extras"]]}
        onSaved={({ id, isNew }) => { if (isNew && isAdmin) setManaging(id); }}
      />
      <AdminCompetitionManageDialog competitionId={managing} onClose={() => setManaging(null)} />

      <main className="mx-auto max-w-6xl px-4 py-6 space-y-10">
        {/* Category browse */}
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant={category === "all" ? "default" : "outline"} onClick={() => setCategory("all")}>All</Button>
          {(categories as any[]).filter((c) => c.enabled).map((c) => (
            <Button
              key={c.id}
              size="sm"
              variant={category === c.slug ? "default" : "outline"}
              onClick={() => setCategory(c.slug)}
              style={category === c.slug ? { background: c.color, borderColor: c.color } : undefined}
            >
              {c.name}
            </Button>
          ))}
        </div>

        {/* Sections */}
        {sections.map((s) => (
          <SectionRow
            key={s.key}
            title={s.title}
            icon={s.icon}
            tint={s.tint}
            items={s.items}
            empty={s.empty}
            trendingIds={trendingIds}
            onEdit={isAdmin ? openEdit : undefined}
          />
        ))}

        {/* Admin drafts visibility hint */}
        {isAdmin && (combinedForAdmin as any[]).length !== (comps as any[]).length && (
          <p className="text-xs text-muted-foreground">
            {(combinedForAdmin as any[]).length - (comps as any[]).length} draft/unpublished competitions are hidden from public sections.
          </p>
        )}

        {/* Browse by Category */}
        <section>
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold">
            <Trophy className="h-5 w-5 text-amber-400" /> Browse by Category
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
            {(categories as any[]).filter((c) => c.enabled).map((cat) => {
              const items = byCategory.get(cat.slug) ?? [];
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.slug)}
                  className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-4 text-left transition-all hover:-translate-y-0.5 hover:border-white/20"
                  style={{ boxShadow: `inset 0 0 0 1px ${cat.color}22` }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-bold" style={{ color: cat.color }}>{cat.name}</div>
                      <div className="text-xs text-muted-foreground">{items.length} competition{items.length === 1 ? "" : "s"}</div>
                    </div>
                    <Trophy className="h-6 w-6 opacity-40" style={{ color: cat.color }} />
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}

function SectionRow({
  title,
  icon,
  items,
  empty,
  tint,
  trendingIds,
  onEdit,
}: {
  title: string;
  icon: React.ReactNode;
  items: EnrichedCompetition[];
  empty?: string;
  tint?: string;
  trendingIds: Set<string>;
  onEdit?: (c: any) => void;
}) {
  if (items.length === 0 && !empty) return null;
  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h2 className={`flex items-center gap-2 text-lg font-bold ${tint ?? ""}`}>
          {icon} {title}
          <span className="text-xs font-normal text-muted-foreground">({items.length})</span>
        </h2>
      </div>
      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 p-6 text-center text-xs text-muted-foreground">
          {empty}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((c) => (
            <CompetitionProfileCard
              key={c.id}
              c={c}
              onEdit={onEdit}
              trending={trendingIds.has(c.id)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
