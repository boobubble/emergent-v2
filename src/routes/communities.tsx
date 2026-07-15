import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  listPublicCommunities,
  searchCommunities,
  getDiscoveryStats,
} from "@/lib/community.functions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AnimatedCounter } from "@/components/competitions/AnimatedCounter";
import { CommunityBadges } from "@/components/community/CommunityBadges";

import {
  Search, Users, Sparkles, Flame, Shield, BadgeCheck, Star, TrendingUp,
  Clock, Gamepad2, Music, Film, Code2, Palette, Trophy, Laugh, GraduationCap,
  Briefcase, Mic, Radio, Heart, Globe, MapPin,
} from "lucide-react";

export const Route = createFileRoute("/communities")({
  head: () => ({
    meta: [
      { title: "Discover Communities — BooBubble" },
      { name: "description", content: "Find and join creator communities: gaming, music, tech, art, sports and more. Live chat, feed, competitions and radio." },
      { property: "og:title", content: "Discover Communities — BooBubble" },
      { property: "og:description", content: "Browse trending creator communities and join the conversation." },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "https://holo-chat-quest.lovable.app/communities" }],
  }),
  component: DiscoveryPage,
});

const CATEGORIES = [
  { slug: "gaming", label: "Gaming", icon: Gamepad2 },
  { slug: "music", label: "Music", icon: Music },
  { slug: "entertainment", label: "Entertainment", icon: Film },
  { slug: "tech", label: "Technology", icon: Code2 },
  { slug: "art", label: "Art", icon: Palette },
  { slug: "sports", label: "Sports", icon: Trophy },
  { slug: "memes", label: "Memes", icon: Laugh },
  { slug: "education", label: "Education", icon: GraduationCap },
  { slug: "business", label: "Business", icon: Briefcase },
  { slug: "podcasts", label: "Podcasts", icon: Mic },
  { slug: "radio", label: "Radio", icon: Radio },
  { slug: "lifestyle", label: "Lifestyle", icon: Heart },
  { slug: "regional", label: "Regional", icon: MapPin },
  { slug: "global", label: "Global", icon: Globe },
] as const;

type SortMode = "trending" | "newest" | "members" | "active";

function DiscoveryPage() {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortMode>("trending");
  const [category, setCategory] = useState<string | null>(null);
  const [featuredOnly, setFeaturedOnly] = useState(false);

  const listFn = useServerFn(listPublicCommunities);
  const searchFn = useServerFn(searchCommunities);
  const statsFn = useServerFn(getDiscoveryStats);

  const trimmed = query.trim();
  const isSearching = trimmed.length >= 2;

  const { data: stats } = useQuery({
    queryKey: ["community-discovery-stats"],
    queryFn: () => statsFn(),
    staleTime: 60_000,
  });

  const { data: featured } = useQuery({
    queryKey: ["community-discovery-featured"],
    queryFn: () => listFn({ data: { featuredOnly: true, limit: 8, sort: "trending" } }),
    staleTime: 30_000,
  });

  const { data: list, isFetching } = useQuery({
    queryKey: ["community-discovery-list", sort, category, featuredOnly, isSearching ? trimmed : ""],
    queryFn: () =>
      isSearching
        ? searchFn({ data: { q: trimmed, category: category ?? undefined, limit: 40 } })
        : listFn({ data: { sort, category: category ?? undefined, featuredOnly, limit: 60 } }),
    staleTime: 15_000,
  });

  const featuredIds = useMemo(() => new Set((featured ?? []).map((c: any) => c.id)), [featured]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-background text-foreground">
      {/* Hero */}
      <section className="relative overflow-hidden border-b bg-gradient-to-br from-primary/10 via-background to-background">
        <div className="pointer-events-none absolute inset-0 opacity-40 [background:radial-gradient(1200px_400px_at_50%_-10%,hsl(var(--primary)/0.35),transparent_60%)]" />
        <div className="relative mx-auto max-w-6xl px-4 py-10 sm:py-14">
          <div className="text-center">
            <Badge variant="outline" className="mb-3 gap-1">
              <Sparkles className="h-3 w-3" /> Community Discovery
            </Badge>
            <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">
              Find your <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">community</span>
            </h1>
            <p className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
              Trending creator communities with live chat, feeds, competitions and radio.
            </p>
          </div>

          {/* Search */}
          <div className="mx-auto mt-6 max-w-2xl">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search communities, tags, creators…"
                className="h-12 rounded-full pl-10 pr-4 text-base shadow-lg backdrop-blur"
                aria-label="Search communities"
              />
            </div>
          </div>

          {/* Stats */}
          <div className="mx-auto mt-6 grid max-w-3xl grid-cols-3 gap-2 sm:gap-4">
            <StatCard label="Communities" value={stats?.total ?? 0} icon={<Sparkles className="h-4 w-4" />} />
            <StatCard label="Members" value={stats?.members ?? 0} icon={<Users className="h-4 w-4" />} />
            <StatCard label="Online now" value={stats?.online ?? 0} icon={<Flame className="h-4 w-4 text-orange-500" />} live />
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-6xl px-4 py-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Categories</h2>
          {category && (
            <Button size="sm" variant="ghost" onClick={() => setCategory(null)}>Clear</Button>
          )}
        </div>
        <div className="flex snap-x gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {CATEGORIES.map((c) => {
            const Icon = c.icon;
            const active = category === c.slug;
            return (
              <button
                key={c.slug}
                onClick={() => setCategory(active ? null : c.slug)}
                className={`group flex snap-start shrink-0 items-center gap-2 rounded-full border px-3 py-2 text-sm transition ${
                  active
                    ? "border-primary bg-primary text-primary-foreground shadow-md"
                    : "border-border bg-card hover:border-primary/50 hover:bg-accent"
                }`}
              >
                <Icon className="h-4 w-4" />
                {c.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* Filters + sort */}
      <section className="mx-auto max-w-6xl px-4">
        <div className="flex flex-wrap items-center gap-2 border-t pt-4">
          <span className="text-xs font-medium text-muted-foreground">Sort:</span>
          {(["trending", "newest", "members", "active"] as SortMode[]).map((s) => (
            <button
              key={s}
              onClick={() => setSort(s)}
              disabled={isSearching}
              className={`rounded-full border px-3 py-1 text-xs capitalize transition ${
                sort === s && !isSearching
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card hover:bg-accent disabled:opacity-40"
              }`}
            >
              {s === "trending" && <TrendingUp className="mr-1 inline h-3 w-3" />}
              {s === "newest" && <Clock className="mr-1 inline h-3 w-3" />}
              {s}
            </button>
          ))}
          <div className="ml-auto flex items-center gap-2">
            <label className="flex items-center gap-1 text-xs">
              <input
                type="checkbox"
                checked={featuredOnly}
                onChange={(e) => setFeaturedOnly(e.target.checked)}
                className="h-3.5 w-3.5"
              />
              Featured only
            </label>
          </div>
        </div>
      </section>

      {/* Featured strip */}
      {!isSearching && !featuredOnly && (featured?.length ?? 0) > 0 && (
        <section className="mx-auto max-w-6xl px-4 pt-6">
          <div className="mb-3 flex items-center gap-2">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            <h2 className="text-sm font-semibold uppercase tracking-wide">Featured</h2>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {(featured ?? []).map((c: any) => (
              <div key={c.id} className="w-72 shrink-0">
                <CommunityCard community={c} isFeatured />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Main grid */}
      <section className="mx-auto max-w-6xl px-4 py-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            {isSearching ? `Results for "${trimmed}"` : "All communities"}
          </h2>
          {isFetching && <span className="text-xs text-muted-foreground">Loading…</span>}
        </div>
        {(list?.length ?? 0) === 0 && !isFetching ? (
          <div className="rounded-lg border bg-card p-10 text-center text-sm text-muted-foreground">
            No communities found. Try clearing filters or searching for something else.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(list ?? []).map((c: any) => (
              <CommunityCard key={c.id} community={c} isFeatured={featuredIds.has(c.id)} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

// -------- StatCard --------
function StatCard({ label, value, icon, live }: { label: string; value: number; icon: React.ReactNode; live?: boolean }) {
  return (
    <div className="rounded-xl border bg-card/60 p-3 text-center shadow-sm backdrop-blur">
      <div className="mb-1 flex items-center justify-center gap-1 text-xs text-muted-foreground">
        {icon}
        {label}
        {live && <span className="ml-1 inline-block h-2 w-2 animate-pulse rounded-full bg-emerald-500" />}
      </div>
      <div className="text-xl font-bold sm:text-2xl">
        <AnimatedCounter value={value} />
      </div>
    </div>
  );
}

// -------- CommunityCard --------
function CommunityCard({ community, isFeatured }: { community: any; isFeatured?: boolean }) {
  const accent = community.accent_color ?? "hsl(var(--primary))";
  return (
    <Link
      to="/community/$slug"
      params={{ slug: community.slug }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border bg-card shadow-sm transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-xl"
      style={{ borderTopColor: accent, borderTopWidth: 2 }}
    >
      {/* Banner */}
      <div
        className="relative h-24 w-full bg-gradient-to-br from-primary/20 to-primary/5"
        style={community.banner_url ? { backgroundImage: `url(${community.banner_url})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-card/80 to-transparent" />
        <div className="absolute right-2 top-2">
          <CommunityBadges c={community as never} showFeatured />
        </div>

      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start gap-3">
          <div
            className="-mt-10 grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-xl border-2 border-card bg-muted text-lg font-bold shadow"
            style={community.logo_url ? { backgroundImage: `url(${community.logo_url})`, backgroundSize: "cover" } : { background: accent, color: "white" }}
          >
            {!community.logo_url && community.name?.[0]?.toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-base font-bold leading-tight">{community.name}</h3>
            <p className="truncate text-xs text-muted-foreground">/{community.slug}</p>
          </div>
        </div>

        {community.description && (
          <p className="line-clamp-2 text-sm text-muted-foreground">{community.description}</p>
        )}

        <div className="mt-auto flex items-center justify-between pt-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            {(community.member_count ?? 0).toLocaleString()}
          </span>
          {(community.online_count ?? 0) > 0 && (
            <span className="flex items-center gap-1">
              <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
              {community.online_count.toLocaleString()} online
            </span>
          )}
          {community.category && (
            <Badge variant="outline" className="capitalize">{community.category}</Badge>
          )}
        </div>
      </div>
    </Link>
  );
}
