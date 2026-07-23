import type React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  Crown,
  Feather,
  Flame,
  Medal,
  Search,
  Sparkles,
  Star,
  Trophy,
} from "lucide-react";
import { listHallOfFame } from "@/lib/competitions.functions";
import { getMehfilHallOfFame } from "@/lib/mehfil.functions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { z } from "zod";

const searchSchema = z.object({
  // Kept for backward compatibility with legacy redirect links; unused visually.
  tab: z.enum(["all", "competitions", "poetry"]).optional().catch("all"),
  filter: z.string().optional().catch(undefined),
});

export const Route = createFileRoute("/hall-of-fame")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Hall of Fame — Museum of Champions" },
      {
        name: "description",
        content:
          "The greatest creators in platform history. Every competition champion and poetry laureate — one elegant gallery.",
      },
      { property: "og:title", content: "Hall of Fame — Museum of Champions" },
      {
        property: "og:description",
        content: "The greatest creators in platform history.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Hall of Fame",
          description: "Every champion across competitions and poetry battles.",
        }),
      },
    ],
  }),
  component: HallOfFamePage,
});

type Kind = "competition" | "poetry";
type UnifiedRow = {
  id: string;
  kind: Kind;
  year: number;
  rank: number;
  awardedAt: string;
  profile: {
    username?: string | null;
    display_name?: string | null;
    avatar_url?: string | null;
  } | null;
  title: string;
  linkTo: string;
  linkParams: Record<string, string>;
  category?: { name: string; color?: string | null } | null;
  votes?: number;
  share?: number;
  prize?: string | null;
  banner?: string | null;
  period?: string | null;
};

const rankStyle: Record<
  number,
  { icon: React.ReactNode; color: string; label: string; ring: string }
> = {
  1: {
    icon: <Crown className="h-4 w-4" />,
    color: "from-amber-300 via-yellow-400 to-amber-600",
    label: "Champion",
    ring: "ring-amber-400/50",
  },
  2: {
    icon: <Medal className="h-4 w-4" />,
    color: "from-slate-200 via-slate-300 to-slate-500",
    label: "Runner Up",
    ring: "ring-slate-300/40",
  },
  3: {
    icon: <Award className="h-4 w-4" />,
    color: "from-orange-400 via-amber-500 to-orange-700",
    label: "Third Place",
    ring: "ring-orange-400/40",
  },
};

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  const diff = Date.now() - then;
  const day = 86_400_000;
  if (diff < day) return "Today";
  if (diff < day * 2) return "Yesterday";
  if (diff < day * 7) return `${Math.floor(diff / day)} days ago`;
  if (diff < day * 30) return `${Math.floor(diff / (day * 7))} weeks ago`;
  if (diff < day * 365) return `${Math.floor(diff / (day * 30))} months ago`;
  return `${Math.floor(diff / (day * 365))} years ago`;
}

function HallOfFamePage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const [q, setQ] = useState("");
  const [chip, setChip] = useState<string>(() => {
    // Honor legacy ?tab= param as an initial chip
    if (search.tab === "competitions") return "kind:competition";
    if (search.tab === "poetry") return "kind:poetry";
    return search.filter ?? "all";
  });

  const fetchComp = useServerFn(listHallOfFame);
  const fetchPoetry = useServerFn(getMehfilHallOfFame);

  const compQ = useQuery({
    queryKey: ["hall-of-fame", "competitions"],
    queryFn: () => fetchComp({ data: {} }),
  });
  const poetryQ = useQuery({
    queryKey: ["hall-of-fame", "poetry"],
    queryFn: () => fetchPoetry(),
  });

  const unified = useMemo<UnifiedRow[]>(() => {
    const rows: UnifiedRow[] = [];
    (compQ.data ?? []).forEach((r: any) => {
      if (!r.competition?.slug) return;
      rows.push({
        id: `c:${r.id}`,
        kind: "competition",
        year: new Date(r.awarded_at).getFullYear(),
        rank: r.place,
        awardedAt: r.awarded_at,
        profile: r.profile,
        title: r.competition?.name ?? "Competition",
        linkTo: "/competitions/$slug",
        linkParams: { slug: r.competition.slug },
        category: r.competition?.category ?? null,
        votes: r.winning_votes,
        share: r.winning_share,
        prize: r.rewards?.coins
          ? `${formatNumber(r.rewards.coins)} coins`
          : r.rewards?.custom ?? null,
        banner: r.competition?.banner_url ?? null,
      });
    });
    (poetryQ.data ?? []).forEach((r: any) => {
      rows.push({
        id: `p:${r.id}`,
        kind: "poetry",
        year: new Date(r.awarded_at).getFullYear(),
        rank: r.rank,
        awardedAt: r.awarded_at,
        profile: r.profile,
        title: r.poem?.title ?? "Poetry Battle",
        linkTo: r.poem?.slug ? "/poetry/$slug" : "/poetry",
        linkParams: r.poem?.slug ? { slug: r.poem.slug } : {},
        period: r.period,
      });
    });
    return rows.sort(
      (a, b) => +new Date(b.awardedAt) - +new Date(a.awardedAt),
    );
  }, [compQ.data, poetryQ.data]);

  // Derived filter chip pool: years + categories (sorted by frequency)
  const years = useMemo(
    () => Array.from(new Set(unified.map((r) => r.year))).sort((a, b) => b - a),
    [unified],
  );
  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    unified.forEach((r) => {
      const name = r.category?.name;
      if (name) counts.set(name, (counts.get(name) ?? 0) + 1);
    });
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12)
      .map(([name]) => name);
  }, [unified]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return unified.filter((r) => {
      if (chip === "kind:competition" && r.kind !== "competition") return false;
      if (chip === "kind:poetry" && r.kind !== "poetry") return false;
      if (chip.startsWith("year:") && String(r.year) !== chip.slice(5))
        return false;
      if (chip.startsWith("cat:") && r.category?.name !== chip.slice(4))
        return false;
      if (needle) {
        const hay = `${r.title} ${r.profile?.username ?? ""} ${r.profile?.display_name ?? ""} ${r.category?.name ?? ""} ${r.year}`.toLowerCase();
        if (!hay.includes(needle)) return false;
      }
      return true;
    });
  }, [unified, chip, q]);

  // Group by relative bucket (Today/Yesterday/This Week/etc.) for latest-first feel.
  const grouped = useMemo(() => {
    const buckets = new Map<string, UnifiedRow[]>();
    const bucketFor = (iso: string) => {
      const diff = Date.now() - new Date(iso).getTime();
      const day = 86_400_000;
      if (diff < day) return "Today";
      if (diff < day * 2) return "Yesterday";
      if (diff < day * 7) return "This Week";
      if (diff < day * 30) return "This Month";
      if (diff < day * 365) return "This Year";
      return String(new Date(iso).getFullYear());
    };
    filtered.forEach((r) => {
      const key = bucketFor(r.awardedAt);
      if (!buckets.has(key)) buckets.set(key, []);
      buckets.get(key)!.push(r);
    });
    return Array.from(buckets.entries());
  }, [filtered]);

  // Stats
  const totalChampions = unified.length;
  const compCount = unified.filter((r) => r.kind === "competition").length;
  const poetryCount = unified.filter((r) => r.kind === "poetry").length;
  const yearsActive = years.length;

  // Featured champions: top ranks, mixed, most recent
  const featured = useMemo(() => {
    const gold = unified.filter((r) => r.rank === 1);
    // interleave competition + poetry
    const comps = gold.filter((r) => r.kind === "competition");
    const poems = gold.filter((r) => r.kind === "poetry");
    const mix: UnifiedRow[] = [];
    const max = Math.max(comps.length, poems.length);
    for (let i = 0; i < max; i++) {
      if (comps[i]) mix.push(comps[i]);
      if (poems[i]) mix.push(poems[i]);
    }
    return mix.slice(0, 10);
  }, [unified]);

  // Achievement wall
  const achievements = useMemo(() => {
    const winsByUser = new Map<
      string,
      { profile: UnifiedRow["profile"]; count: number; poetry: number; comp: number; gold: number; engagement: number }
    >();
    unified.forEach((r) => {
      const k = r.profile?.username ?? "unknown";
      const cur =
        winsByUser.get(k) ??
        { profile: r.profile, count: 0, poetry: 0, comp: 0, gold: 0, engagement: 0 };
      cur.count += 1;
      if (r.kind === "poetry") cur.poetry += 1;
      else cur.comp += 1;
      if (r.rank === 1) cur.gold += 1;
      cur.engagement += r.votes ?? 0;
      winsByUser.set(k, cur);
    });
    const arr = Array.from(winsByUser.values()).filter((v) => v.profile);
    const pick = (key: keyof (typeof arr)[number]) =>
      arr.slice().sort((a, b) => (b[key] as number) - (a[key] as number))[0];
    return {
      mostChampionships: pick("gold"),
      mostPoetry: pick("poetry"),
      mostAwards: pick("count"),
      highestEngagement: pick("engagement"),
    };
  }, [unified]);

  const isLoading = compQ.isLoading || poetryQ.isLoading;

  const selectChip = (v: string) => {
    setChip(v);
    // clear legacy tab param quietly
    navigate({ search: { filter: v === "all" ? undefined : v } as any, replace: true });
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#08070d] pb-24 text-foreground">
      {/* Ambient gold glow */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(ellipse_at_top,_rgba(251,191,36,0.18),_transparent_60%)]" />
      <div className="pointer-events-none absolute -left-32 top-40 h-[320px] w-[320px] rounded-full bg-fuchsia-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 top-96 h-[320px] w-[320px] rounded-full bg-amber-500/10 blur-3xl" />

      <header className="sticky top-0 z-30 border-b border-white/5 bg-black/40 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
          <Link to="/">
            <Button size="icon" variant="ghost">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="flex items-center gap-2 text-lg font-bold">
              <Trophy className="h-5 w-5 text-amber-400" /> Hall of Fame
            </h1>
            <p className="text-xs text-muted-foreground">
              The greatest creators in platform history.
            </p>
          </div>
        </div>
      </header>

      <main className="relative mx-auto max-w-6xl px-4 py-8">
        {/* Compact premium hero */}
        <section className="relative mb-10 overflow-hidden rounded-3xl border border-amber-400/20 bg-gradient-to-br from-amber-500/10 via-white/[0.02] to-fuchsia-500/10 p-6 shadow-[0_0_60px_-20px_rgba(251,191,36,0.35)] sm:p-8">
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-amber-400/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-fuchsia-500/10 blur-3xl" />

          <div className="relative flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-300">
                <Sparkles className="h-3 w-3" /> Museum of Champions
              </div>
              <h2 className="bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-400 bg-clip-text text-4xl font-black tracking-tight text-transparent sm:text-5xl">
                Hall of Fame
              </h2>
              <p className="mt-2 max-w-lg text-sm text-muted-foreground">
                The greatest creators in platform history. Competition champions
                and poetry laureates — enshrined together.
              </p>
            </div>
            <div className="relative h-24 w-24 shrink-0 sm:h-28 sm:w-28">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-300 via-yellow-500 to-amber-700 shadow-[0_0_60px_-5px_rgba(251,191,36,0.7)]" />
              <div className="absolute inset-[3px] flex items-center justify-center rounded-full bg-[#08070d]">
                <Trophy className="h-10 w-10 text-amber-300 sm:h-12 sm:w-12" />
              </div>
            </div>
          </div>

          <div className="relative mt-6 grid grid-cols-2 gap-2 sm:grid-cols-5">
            <HeroStat label="Total Champions" value={totalChampions} />
            <HeroStat label="Total Awards" value={totalChampions} />
            <HeroStat label="Competitions" value={compCount} icon={<Trophy className="h-3 w-3" />} />
            <HeroStat label="Poetry" value={poetryCount} icon={<Feather className="h-3 w-3" />} />
            <HeroStat label="Years Active" value={yearsActive || 1} />
          </div>
        </section>

        {/* Featured Champions carousel */}
        {featured.length > 0 && (
          <section className="mb-10">
            <div className="mb-3 flex items-end justify-between">
              <div>
                <h3 className="flex items-center gap-2 text-lg font-bold">
                  <Sparkles className="h-4 w-4 text-amber-300" /> Featured Champions
                </h3>
                <p className="text-xs text-muted-foreground">
                  Legends across competitions and poetry.
                </p>
              </div>
            </div>
            <div className="-mx-4 overflow-x-auto px-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              <div className="flex gap-3 pb-2">
                {featured.map((r) => (
                  <FeaturedCard key={r.id} row={r} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Search + filter chips */}
        <div className="mb-6 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search winners, poems, competitions, categories…"
              className="border-white/10 bg-white/[0.03] pl-9 text-sm backdrop-blur-xl"
            />
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <Chip active={chip === "all"} onClick={() => selectChip("all")}>
              All
            </Chip>
            <Chip
              active={chip === "kind:competition"}
              onClick={() => selectChip("kind:competition")}
              icon={<Trophy className="h-3 w-3" />}
              accent="amber"
            >
              Competition
            </Chip>
            <Chip
              active={chip === "kind:poetry"}
              onClick={() => selectChip("kind:poetry")}
              icon={<Feather className="h-3 w-3" />}
              accent="fuchsia"
            >
              Poetry
            </Chip>
            <span className="mx-1 h-4 w-px bg-white/10" />
            {years.slice(0, 5).map((y) => (
              <Chip
                key={y}
                active={chip === `year:${y}`}
                onClick={() => selectChip(`year:${y}`)}
              >
                {y}
              </Chip>
            ))}
            {categories.length > 0 && <span className="mx-1 h-4 w-px bg-white/10" />}
            {categories.map((c) => (
              <Chip
                key={c}
                active={chip === `cat:${c}`}
                onClick={() => selectChip(`cat:${c}`)}
              >
                {c}
              </Chip>
            ))}
            {(chip !== "all" || q) && (
              <button
                onClick={() => {
                  selectChip("all");
                  setQ("");
                }}
                className="ml-1 rounded-full border border-dashed border-white/15 px-3 py-1 text-xs text-muted-foreground hover:text-foreground"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Latest champions unified feed */}
        {isLoading ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-10 text-center text-sm text-muted-foreground">
            Loading champions…
          </div>
        ) : grouped.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 p-10 text-center text-sm text-muted-foreground">
            <Star className="mx-auto mb-2 h-8 w-8 opacity-40" />
            No champions match your filters yet.
          </div>
        ) : (
          <div className="space-y-10">
            {grouped.map(([bucket, rows]) => (
              <section key={bucket}>
                <div className="mb-4 flex items-center gap-3">
                  <div className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-300/80">
                    {bucket}
                  </div>
                  <div className="h-px flex-1 bg-gradient-to-r from-amber-400/30 via-white/5 to-transparent" />
                  <Badge
                    variant="outline"
                    className="border-amber-400/30 text-[10px] text-amber-200"
                  >
                    {rows.length} winner{rows.length === 1 ? "" : "s"}
                  </Badge>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {rows.map((r) => (
                    <ChampionCard key={r.id} row={r} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}

        {/* Achievement wall */}
        {!isLoading && unified.length > 0 && (
          <section className="mt-14">
            <div className="mb-4">
              <h3 className="flex items-center gap-2 text-lg font-bold">
                <Crown className="h-4 w-4 text-amber-300" /> Achievement Wall
              </h3>
              <p className="text-xs text-muted-foreground">
                All-time records across the platform.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <AchievementTile
                icon={<Crown className="h-4 w-4" />}
                label="Most Championships"
                accent="from-amber-400 to-yellow-600"
                profile={achievements.mostChampionships?.profile}
                value={achievements.mostChampionships?.gold ?? 0}
                unit="gold"
              />
              <AchievementTile
                icon={<Feather className="h-4 w-4" />}
                label="Most Poetry Wins"
                accent="from-fuchsia-400 to-purple-600"
                profile={achievements.mostPoetry?.profile}
                value={achievements.mostPoetry?.poetry ?? 0}
                unit="wins"
              />
              <AchievementTile
                icon={<Trophy className="h-4 w-4" />}
                label="Most Awards"
                accent="from-cyan-400 to-blue-600"
                profile={achievements.mostAwards?.profile}
                value={achievements.mostAwards?.count ?? 0}
                unit="awards"
              />
              <AchievementTile
                icon={<Flame className="h-4 w-4" />}
                label="Highest Engagement"
                accent="from-orange-400 to-rose-600"
                profile={achievements.highestEngagement?.profile}
                value={achievements.highestEngagement?.engagement ?? 0}
                unit="votes"
              />
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

/* ---------- Presentational bits ---------- */

function HeroStat({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-center backdrop-blur-xl">
      <div className="flex items-center justify-center gap-1 text-lg font-black text-amber-100">
        {icon}
        {value.toLocaleString()}
      </div>
      <div className="mt-0.5 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </div>
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
  icon,
  accent,
}: {
  active?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  icon?: React.ReactNode;
  accent?: "amber" | "fuchsia";
}) {
  const accentActive =
    accent === "amber"
      ? "border-amber-400/60 bg-amber-500/15 text-amber-200"
      : accent === "fuchsia"
        ? "border-fuchsia-400/60 bg-fuchsia-500/15 text-fuchsia-200"
        : "border-white/25 bg-white/10 text-white";
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium transition-all ${
        active
          ? accentActive
          : "border-white/10 bg-white/[0.02] text-muted-foreground hover:border-white/20 hover:text-foreground"
      }`}
    >
      {icon}
      {children}
    </button>
  );
}

function legendBadges(row: UnifiedRow): { label: string; icon: React.ReactNode; cls: string }[] {
  const b: { label: string; icon: React.ReactNode; cls: string }[] = [];
  if (row.rank === 1)
    b.push({
      label: "Gold Champion",
      icon: <Crown className="h-3 w-3" />,
      cls: "border-amber-400/60 text-amber-200 bg-amber-500/10",
    });
  if ((row.votes ?? 0) >= 1000)
    b.push({
      label: "Community Favorite",
      icon: <Star className="h-3 w-3" />,
      cls: "border-fuchsia-400/60 text-fuchsia-200 bg-fuchsia-500/10",
    });
  if ((row.share ?? 0) >= 0.6)
    b.push({
      label: "Legend",
      icon: <Sparkles className="h-3 w-3" />,
      cls: "border-cyan-400/60 text-cyan-200 bg-cyan-500/10",
    });
  return b;
}

function ChampionCard({ row }: { row: UnifiedRow }) {
  const style =
    rankStyle[row.rank] ?? {
      icon: <Star className="h-4 w-4" />,
      color: "from-white/20 to-white/10",
      label: `#${row.rank}`,
      ring: "ring-white/10",
    };
  const kindMeta =
    row.kind === "poetry"
      ? {
          icon: <Feather className="h-3 w-3" />,
          label: "Poetry Champion",
          cls: "border-fuchsia-400/40 text-fuchsia-200 bg-fuchsia-500/10",
        }
      : {
          icon: <Trophy className="h-3 w-3" />,
          label: "Competition Champion",
          cls: "border-amber-400/40 text-amber-200 bg-amber-500/10",
        };
  const badges = legendBadges(row);

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.05] to-white/[0.01] p-4 backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:border-amber-400/30 hover:shadow-[0_20px_50px_-20px_rgba(251,191,36,0.3)]">
      {/* rank ribbon */}
      <div
        className={`absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br ${style.color} opacity-20 blur-2xl transition-opacity group-hover:opacity-40`}
      />

      <div className="flex items-start gap-3">
        {row.profile ? (
          <Link
            to="/u/$username"
            params={{ username: row.profile.username ?? "" }}
            className="relative shrink-0"
          >
            <div
              className={`absolute -inset-0.5 rounded-full bg-gradient-to-br ${style.color} opacity-70 blur-sm`}
            />
            {row.profile.avatar_url ? (
              <img
                src={row.profile.avatar_url}
                alt={row.profile.username ?? ""}
                className={`relative h-14 w-14 rounded-full border-2 border-white/20 object-cover ring-2 ${style.ring}`}
              />
            ) : (
              <div
                className={`relative flex h-14 w-14 items-center justify-center rounded-full border-2 border-white/20 bg-white/10 text-base font-bold ring-2 ${style.ring}`}
              >
                {(row.profile.username ?? "?")[0]?.toUpperCase()}
              </div>
            )}
            <div
              className={`absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br ${style.color} shadow-lg`}
            >
              {style.icon}
            </div>
          </Link>
        ) : (
          <div className="h-14 w-14 rounded-full border-2 border-white/20 bg-white/10" />
        )}

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge variant="outline" className={`gap-1 ${kindMeta.cls}`}>
              {kindMeta.icon} {kindMeta.label}
            </Badge>
            {row.category && (
              <Badge
                variant="outline"
                style={{
                  borderColor: row.category.color ?? undefined,
                  color: row.category.color ?? undefined,
                }}
              >
                {row.category.name}
              </Badge>
            )}
          </div>
          <Link
            to={row.linkTo as any}
            params={row.linkParams as any}
            className="mt-1.5 block truncate text-base font-bold text-foreground transition-colors hover:text-amber-200"
          >
            {row.kind === "poetry" ? `"${row.title}"` : row.title}
          </Link>
          <div className="mt-0.5 truncate text-xs text-muted-foreground">
            Won by{" "}
            {row.profile ? (
              <Link
                to="/u/$username"
                params={{ username: row.profile.username ?? "" }}
                className="font-semibold text-foreground hover:text-amber-200"
              >
                @{row.profile.username}
              </Link>
            ) : (
              <span className="font-semibold text-foreground">Unknown</span>
            )}
            <span className="mx-1.5 text-white/20">•</span>
            {relativeTime(row.awardedAt)}
          </div>

          {badges.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {badges.map((b) => (
                <span
                  key={b.label}
                  className={`inline-flex items-center gap-1 rounded-full border px-2 py-[2px] text-[10px] font-medium ${b.cls}`}
                >
                  {b.icon} {b.label}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2 border-t border-white/5 pt-3">
        <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
          {typeof row.votes === "number" && (
            <span>
              <span className="font-semibold text-foreground">
                {formatNumber(row.votes)}
              </span>{" "}
              votes
            </span>
          )}
          {typeof row.share === "number" && (
            <span>
              <span className="font-semibold text-foreground">
                {(row.share * 100).toFixed(0)}%
              </span>{" "}
              share
            </span>
          )}
          {row.prize && (
            <span>
              <span className="font-semibold text-amber-200">{row.prize}</span>
            </span>
          )}
        </div>
        <Link
          to={row.linkTo as any}
          params={row.linkParams as any}
          className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-300 hover:text-amber-200"
        >
          View Legacy <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}

function FeaturedCard({ row }: { row: UnifiedRow }) {
  const style = rankStyle[row.rank] ?? rankStyle[1];
  const kind =
    row.kind === "poetry"
      ? { label: "Poetry", icon: <Feather className="h-3 w-3" /> }
      : { label: "Competition", icon: <Trophy className="h-3 w-3" /> };
  return (
    <Link
      to={row.linkTo as any}
      params={row.linkParams as any}
      className="group relative flex w-[260px] shrink-0 flex-col overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.01] p-4 backdrop-blur-xl transition-all hover:-translate-y-1 hover:border-amber-400/40"
    >
      <div
        className={`absolute -right-10 -top-10 h-28 w-28 rounded-full bg-gradient-to-br ${style.color} opacity-30 blur-2xl transition-opacity group-hover:opacity-60`}
      />
      <div className="relative mb-3 flex items-center justify-between">
        <Badge
          variant="outline"
          className="gap-1 border-amber-400/40 text-[10px] text-amber-200"
        >
          {kind.icon} {kind.label}
        </Badge>
        <div
          className={`flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br ${style.color} shadow-lg`}
        >
          {style.icon}
        </div>
      </div>
      <div className="relative flex items-center gap-2">
        {row.profile?.avatar_url ? (
          <img
            src={row.profile.avatar_url}
            alt=""
            className="h-10 w-10 rounded-full border border-white/20 object-cover"
          />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-sm font-bold">
            {(row.profile?.username ?? "?")[0]?.toUpperCase()}
          </div>
        )}
        <div className="min-w-0">
          <div className="truncate text-sm font-bold">
            @{row.profile?.username ?? "unknown"}
          </div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
            {style.label}
          </div>
        </div>
      </div>
      <div className="relative mt-3 truncate text-sm font-semibold text-foreground/90">
        {row.kind === "poetry" ? `"${row.title}"` : row.title}
      </div>
      <div className="relative mt-1 text-[11px] text-muted-foreground">
        {relativeTime(row.awardedAt)}
      </div>
    </Link>
  );
}

function AchievementTile({
  icon,
  label,
  profile,
  value,
  unit,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  profile: UnifiedRow["profile"] | undefined;
  value: number;
  unit: string;
  accent: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-xl">
      <div
        className={`absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br ${accent} opacity-20 blur-2xl`}
      />
      <div className="relative flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        <span
          className={`inline-flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br ${accent} text-black`}
        >
          {icon}
        </span>
        {label}
      </div>
      <div className="relative mt-3 flex items-center gap-3">
        {profile?.avatar_url ? (
          <img
            src={profile.avatar_url}
            alt=""
            className="h-10 w-10 rounded-full border border-white/20 object-cover"
          />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-sm font-bold">
            {(profile?.username ?? "?")[0]?.toUpperCase()}
          </div>
        )}
        <div className="min-w-0">
          {profile ? (
            <Link
              to="/u/$username"
              params={{ username: profile.username ?? "" }}
              className="block truncate text-sm font-bold hover:text-amber-200"
            >
              @{profile.username}
            </Link>
          ) : (
            <div className="text-sm font-bold text-muted-foreground">—</div>
          )}
          <div className="text-[11px] text-muted-foreground">
            <span className="font-semibold text-foreground">
              {formatNumber(value)}
            </span>{" "}
            {unit}
          </div>
        </div>
      </div>
    </div>
  );
}
