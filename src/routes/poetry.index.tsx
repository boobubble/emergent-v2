import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { PenLine, Sparkles } from "lucide-react";
import { getMehfilDiscovery, listMehfilCategories } from "@/lib/mehfil.functions";
import { MehfilShell } from "@/components/mehfil/MehfilShell";
import { MehfilSearchBar } from "@/components/mehfil/MehfilSearchBar";
import { PoemCard } from "@/components/mehfil/PoemCard";
import { WriterRankBadge } from "@/components/mehfil/WriterRankBadge";
import type { WriterRank } from "@/lib/mehfil-types";

export const Route = createFileRoute("/poetry/")({
  head: () => ({
    meta: [
      { title: "Mehfil — A Community of Poets" },
      { name: "description", content: "Read, write and share original poetry. Trending verses, poetry battles, and a home for every kind of poet." },
      { property: "og:title", content: "Mehfil — A Community of Poets" },
      { property: "og:description", content: "Read, write and share original poetry. Trending verses, poetry battles, and a home for every kind of poet." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MehfilDiscoveryPage,
});

function MehfilDiscoveryPage() {
  const fetchDiscovery = useServerFn(getMehfilDiscovery);
  const fetchCats = useServerFn(listMehfilCategories);

  const disc = useQuery({ queryKey: ["mehfil", "discovery"], queryFn: () => fetchDiscovery() });
  const cats = useQuery({ queryKey: ["mehfil", "categories"], queryFn: () => fetchCats() });

  const heroPoem = useMemo(() => disc.data?.sections[0]?.poems[0] ?? null, [disc.data]);

  return (
    <MehfilShell>
      {/* HERO */}
      <section className="relative mb-10 overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-amber-500/10 p-8 md:p-12">
        <div className="grid gap-6 md:grid-cols-[1.2fr_1fr] md:items-center">
          <div>
            <span className="inline-block rounded-full bg-primary/15 px-3 py-1 text-xs font-bold uppercase tracking-widest text-primary">Mehfil</span>
            <h1 className="mt-3 font-serif text-4xl font-bold leading-tight md:text-5xl">
              Where every verse<br /> finds its audience
            </h1>
            <p className="mt-3 max-w-lg text-sm text-muted-foreground md:text-base">
              A community of poets, storytellers and dreamers. Publish original poetry, join weekly battles,
              and rise from Fresh Writer to Hall of Fame.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Link to="/poetry/compose" className="inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow hover:bg-primary/90">
                <PenLine className="h-4 w-4" /> Start Writing
              </Link>
              <Link to="/poetry/challenges" className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background/60 px-5 py-2.5 text-sm font-semibold hover:bg-muted">
                <Sparkles className="h-4 w-4" /> Poetry Battles
              </Link>
            </div>
          </div>
          {heroPoem && (
            <div className="hidden md:block">
              <PoemCard poem={heroPoem} variant="hero" />
            </div>
          )}
        </div>
      </section>

      {/* MEHFIL SEARCH */}
      <MehfilSearchBar />



      {/* CATEGORIES */}
      <section className="mb-10">
        <h2 className="mb-3 text-lg font-bold">📚 Categories</h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {(cats.data ?? []).map((c) => (
            <Link
              key={c.id}
              to="/poetry/category/$slug"
              params={{ slug: c.slug }}
              className="group rounded-xl border border-border/60 bg-card p-3 text-center transition hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md"
              style={{ borderTopColor: c.color ?? undefined, borderTopWidth: 3 }}
            >
              <div className="text-xs font-semibold group-hover:text-primary" style={{ color: c.color ?? undefined }}>{c.name}</div>
              <div className="mt-0.5 line-clamp-1 text-[10px] text-muted-foreground">{c.description}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* DISCOVERY SECTIONS */}
      {disc.isLoading && <div className="py-20 text-center text-sm text-muted-foreground">Loading Mehfil…</div>}
      {disc.data?.sections.map((sec) => (
        sec.poems.length > 0 && (
          <section key={sec.key} className="mb-10">
            <h2 className="mb-3 text-lg font-bold">{sec.label}</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {sec.poems.slice(0, 6).map((p) => <PoemCard key={p.id} poem={p} />)}
            </div>
          </section>
        )
      ))}

      {/* RISING WRITERS */}
      {disc.data?.rising && disc.data.rising.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-3 text-lg font-bold">📈 Rising Writers</h2>
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {disc.data.rising.slice(0, 8).map((r) => (
              <div key={r.stats.user_id} className="flex items-center gap-3 rounded-xl border border-border/60 bg-card p-3">
                {r.profile?.avatar_url ? (
                  <img src={r.profile.avatar_url} alt="" className="h-11 w-11 rounded-full object-cover" />
                ) : (
                  <div className="grid h-11 w-11 place-items-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                    {(r.profile?.display_name || r.profile?.username || "?").slice(0, 1).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold">
                    {r.profile?.display_name || r.profile?.username || "Anonymous"}
                  </div>
                  <WriterRankBadge rank={r.stats.writer_rank as WriterRank} />
                  <div className="mt-0.5 text-[11px] text-muted-foreground">
                    {r.stats.poems_published} poems · {r.stats.total_upvotes} upvotes
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="py-8 text-center text-xs text-muted-foreground">
        Mehfil · Phase 1 · Battles, leaderboard and Hall of Fame ship next.
      </div>
    </MehfilShell>
  );
}
