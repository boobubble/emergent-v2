import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Laugh } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getCompetitionBySlug } from "@/lib/competitions.functions";
import { listCompetitionMemes, listCompetitionNominees, type NomineeLite } from "@/lib/competition-memes";
import { PostCard } from "@/components/feed/PostCard";
import type { FeedPost } from "@/lib/feed-types";
import type { User } from "@/lib/chat-types";
import { useAuth } from "@/lib/auth-store";

export const Route = createFileRoute("/competitions/$slug/memes")({
  validateSearch: (s: Record<string, unknown>) => ({
    nominee: typeof s.nominee === "string" ? s.nominee : "",
  }),
  loader: async ({ params }) => {
    const data = await getCompetitionBySlug({ data: { slug: params.slug } });
    return data;
  },
  head: ({ params }) => ({
    meta: [
      { title: `Trending Memes — ${params.slug}` },
      { name: "description", content: `😂 Trending memes for the ${params.slug} competition.` },
      { property: "og:title", content: `Trending Memes — ${params.slug}` },
      { property: "og:description", content: `Community memes supporting nominees in this competition.` },
    ],
  }),
  component: CompetitionMemesPage,
});

function CompetitionMemesPage() {
  const { competition } = Route.useLoaderData() as any;
  const { nominee } = Route.useSearch();
  const { user } = useAuth();
  const meId = user?.id ?? "";
  const [memes, setMemes] = useState<FeedPost[]>([]);
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
        limit: 100,
      });
      if (alive) setMemes(data);
    }
    load();
    const ch = supabase
      .channel(`comp-memes-page-${competition.id}`)
      .on("postgres_changes",
        { event: "*", schema: "public", table: "posts", filter: `competition_id=eq.${competition.id}` },
        () => load())
      .subscribe();
    return () => { alive = false; supabase.removeChannel(ch); };
  }, [competition?.id, nominee]);

  useEffect(() => {
    const ids = Array.from(new Set(memes.map((p) => p.author_id).filter(Boolean)));
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
  }, [memes]);

  if (!competition) {
    return <div className="mx-auto max-w-2xl p-8 text-center text-sm text-muted-foreground">Competition not found.</div>;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4 p-4">
      <Link to="/competitions/$slug" params={{ slug: competition.slug }} className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3 w-3" /> Back to {competition.name}
      </Link>
      <header className="rounded-2xl border bg-card p-4">
        <h1 className="inline-flex items-center gap-2 text-lg font-black">
          <Laugh className="h-5 w-5 text-amber-500" /> Trending Battle Memes
        </h1>
        <p className="mt-1 text-xs text-muted-foreground">
          Feed memes tagged with <span className="font-semibold">{competition.name}</span>. Ranked by engagement, newest first when tied.
        </p>
        {nominees.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            <Link
              to="/competitions/$slug/memes"
              params={{ slug: competition.slug }}
              className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${!nominee ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:text-foreground"}`}
            >
              All memes
            </Link>
            {nominees.map((n) => (
              <Link
                key={n.id}
                to="/competitions/$slug/memes"
                params={{ slug: competition.slug }}
                search={{ nominee: n.id } as any}
                className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${nominee === n.id ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:text-foreground"}`}
              >
                {n.name}
              </Link>
            ))}
          </div>
        )}
      </header>

      {memes.length === 0 ? (
        <div className="rounded-xl border bg-card p-10 text-center text-sm text-muted-foreground">
          No memes yet. Head to the Feed composer, pick <span className="font-semibold">😂 Meme</span>, and tag this competition.
        </div>
      ) : (
        <div className="space-y-4">
          {memes.map((p) => (
            <PostCard key={p.id} post={p} profiles={profiles} meId={meId} />
          ))}
        </div>
      )}
    </div>
  );
}
