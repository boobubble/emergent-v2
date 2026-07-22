import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getCompetitionBySlug } from "@/lib/competitions.functions";
import {
  listCompetitionMemes,
  listCompetitionNominees,
  funSlugToCategory,
  FUN_META,
  type FunCategory,
  type NomineeLite,
} from "@/lib/competition-memes";
import { PostCard } from "@/components/feed/PostCard";
import type { FeedPost } from "@/lib/feed-types";
import type { User } from "@/lib/chat-types";
import { useAuth } from "@/lib/auth-store";

export const Route = createFileRoute("/competitions/$slug/fun/$type")({
  validateSearch: (s: Record<string, unknown>) => ({
    nominee: typeof s.nominee === "string" ? s.nominee : "",
  }),
  loader: async ({ params }) => {
    const cat = funSlugToCategory(params.type);
    if (!cat) throw notFound();
    const data = await getCompetitionBySlug({ data: { slug: params.slug } });
    return { ...data, category: cat };
  },
  head: ({ params }) => {
    const cat = funSlugToCategory(params.type);
    const meta = cat ? FUN_META[cat] : null;
    const title = meta ? `${meta.emoji} ${meta.plural} — ${params.slug}` : "Fun Zone";
    return {
      meta: [
        { title },
        { name: "description", content: meta ? `Community ${meta.plural.toLowerCase()} tagged with the ${params.slug} competition.` : "Fun Zone" },
        { property: "og:title", content: title },
        { property: "og:description", content: meta ? `Community ${meta.plural.toLowerCase()} for ${params.slug}.` : "Fun Zone" },
      ],
    };
  },
  notFoundComponent: () => (
    <div className="mx-auto max-w-2xl p-8 text-center text-sm text-muted-foreground">Unknown Fun Zone category.</div>
  ),
  errorComponent: () => (
    <div className="mx-auto max-w-2xl p-8 text-center text-sm text-muted-foreground">Failed to load.</div>
  ),
  component: FunTypePage,
});

function FunTypePage() {
  const { competition, category } = Route.useLoaderData() as any as { competition: any; category: FunCategory };
  const { nominee } = Route.useSearch();
  const { user } = useAuth();
  const meId = user?.id ?? "";
  const meta = FUN_META[category];
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [nominees, setNominees] = useState<NomineeLite[]>([]);
  const [profiles, setProfiles] = useState<Record<string, User>>({});

  useEffect(() => {
    if (!competition?.id) return;
    listCompetitionNominees(competition.id).then(setNominees);
  }, [competition?.id]);

  useEffect(() => {
    if (!competition?.id) return;
    let alive = true;
    async function load() {
      const data = await listCompetitionMemes({
        competitionId: competition.id,
        nomineeId: nominee || null,
        category,
        limit: 100,
      });
      if (alive) setPosts(data);
    }
    load();
    const ch = supabase
      .channel(`comp-fun-${competition.id}-${category}`)
      .on("postgres_changes",
        { event: "*", schema: "public", table: "posts", filter: `competition_id=eq.${competition.id}` },
        () => load())
      .subscribe();
    return () => { alive = false; supabase.removeChannel(ch); };
  }, [competition?.id, category, nominee]);

  useEffect(() => {
    const ids = Array.from(new Set(posts.map((p) => p.author_id).filter(Boolean)));
    if (!ids.length) return;
    (async () => {
      const { data } = await supabase.from("profiles").select("id,username,display_name,avatar_url,avatar_color").in("id", ids);
      const map: Record<string, User> = {};
      for (const p of data ?? []) {
        map[p.id as string] = {
          id: p.id as string,
          name: (p.display_name || p.username || "user") as string,
          avatarUrl: (p.avatar_url as string) ?? undefined,
          avatarColor: (p.avatar_color as string) ?? undefined,
          status: "offline", xp: 0, level: 1, streak: 0, longestStreak: 0, coins: 0,
          badges: [], isBot: false, isGuest: false,
        } as unknown as User;
      }
      setProfiles(map);
    })();
  }, [posts]);

  if (!competition) {
    return <div className="mx-auto max-w-2xl p-8 text-center text-sm text-muted-foreground">Competition not found.</div>;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4 p-4">
      <Link to="/competitions/$slug" params={{ slug: competition.slug }} className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3 w-3" /> Back to {competition.name}
      </Link>
      <header className={`rounded-2xl border bg-gradient-to-br ${meta.accent} p-4`}>
        <h1 className="inline-flex items-center gap-2 text-lg font-black">
          <span className="text-2xl">{meta.emoji}</span> {meta.plural}
        </h1>
        <p className="mt-1 text-xs text-muted-foreground">
          Feed {meta.plural.toLowerCase()} tagged with <span className="font-semibold">{competition.name}</span>. Ranked by engagement.
        </p>
        {nominees.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            <Link
              to="/competitions/$slug/fun/$type"
              params={{ slug: competition.slug, type: meta.slug }}
              className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${!nominee ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:text-foreground"}`}
            >
              All
            </Link>
            {nominees.map((n) => (
              <Link
                key={n.id}
                to="/competitions/$slug/fun/$type"
                params={{ slug: competition.slug, type: meta.slug }}
                search={{ nominee: n.id } as any}
                className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${nominee === n.id ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:text-foreground"}`}
              >
                {n.name}
              </Link>
            ))}
          </div>
        )}
      </header>

      {posts.length === 0 ? (
        <div className="rounded-xl border bg-card p-10 text-center text-sm text-muted-foreground">
          No {meta.plural.toLowerCase()} yet. Head to the Feed composer, pick <span className="font-semibold">🎉 Fun → {meta.label}</span>, and tag this competition.
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((p) => (
            <PostCard key={p.id} post={p} profiles={profiles} meId={meId} />
          ))}
        </div>
      )}
    </div>
  );
}
