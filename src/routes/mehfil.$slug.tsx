import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Bookmark, Heart, Eye, MessageCircle, Share2, Swords } from "lucide-react";
import { getPoemBySlug, recordPoemRead, togglePoemBookmark } from "@/lib/mehfil.functions";
import { MehfilShell } from "@/components/mehfil/MehfilShell";
import { WriterRankBadge } from "@/components/mehfil/WriterRankBadge";
import { MEHFIL_REACTIONS, poemPreview } from "@/lib/mehfil-types";
import { useAuth } from "@/lib/auth-store";
import { useAuthGate } from "@/lib/auth-gate";
import { gamify, GAM_EVENTS } from "@/lib/gamification-emit";
import { useMehfilPoemRealtime } from "@/lib/mehfil-realtime";
import { supabase } from "@/integrations/supabase/client";


export const Route = createFileRoute("/mehfil/$slug")({
  loader: async ({ params }) => {
    const poem = await getPoemBySlug({ data: { slug: params.slug } });
    if (!poem) throw notFound();
    return { poem };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Poem not found · Mehfil" }, { name: "robots", content: "noindex" }] };
    }
    const p = loaderData.poem;
    const desc = p.seo_description || poemPreview(p.body, 155);
    const title = p.seo_title || `${p.title} · Mehfil`;
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "article" },
        ...(p.cover_url ? [{ property: "og:image", content: p.cover_url }] : []),
        { name: "twitter:card", content: p.cover_url ? "summary_large_image" : "summary" },
      ],
    };
  },
  component: PoemDetailPage,
  notFoundComponent: () => (
    <MehfilShell showBack>
      <div className="py-20 text-center">
        <div className="text-lg font-semibold">Poem not found</div>
        <Link to="/mehfil" className="mt-3 inline-block text-sm text-primary underline">Back to Mehfil</Link>
      </div>
    </MehfilShell>
  ),
  errorComponent: () => (
    <MehfilShell showBack>
      <div className="py-20 text-center text-sm text-destructive">Failed to load poem.</div>
    </MehfilShell>
  ),
});

function PoemDetailPage() {
  const { slug } = Route.useParams();
  const { poem: initial } = Route.useLoaderData();
  const { user } = useAuth();
  const gate = useAuthGate();

  const fetchPoem = useServerFn(getPoemBySlug);
  const recordRead = useServerFn(recordPoemRead);
  const toggleBookmark = useServerFn(togglePoemBookmark);

  const q = useQuery({
    queryKey: ["mehfil", "poem", slug],
    queryFn: () => fetchPoem({ data: { slug } }),
    initialData: initial,
    refetchOnWindowFocus: false,
  });
  const poem = q.data ?? initial;

  // Live counter updates for this poem (upvotes, reads, views)
  const qc = useQueryClient();
  useMehfilPoemRealtime(poem?.id, (row) => {
    qc.setQueryData(["mehfil", "poem", slug], (prev: typeof poem | undefined) =>
      prev ? { ...prev, ...row } : prev,
    );
  });

  // Record a "read" once the page loads
  useEffect(() => {
    if (!poem) return;
    void recordRead({ data: { poemId: poem.id } }).catch(() => {});
  }, [poem?.id, recordRead]);

  const bookmarkMut = useMutation({
    mutationFn: () => toggleBookmark({ data: { poemId: poem.id } }),
    onSuccess: (r) => toast.success(r.bookmarked ? "Bookmarked" : "Removed bookmark"),
    onError: (e: any) => toast.error(e?.message ?? "Failed"),
  });

  const themeStyle = poem.theme
    ? { background: poem.theme }
    : { background: "linear-gradient(180deg, hsl(var(--card)) 0%, hsl(var(--muted)/0.3) 100%)" };

  const author = poem.author;
  const displayName = author?.display_name || author?.username || "Anonymous";

  const requireAuth = (fn: () => void) => (user ? fn() : gate.openSignIn());

  // Reactions on this poem — persisted in shared `reactions` table with target_type='mehfil_poem'
  type ReactionRow = { id: string; user_id: string; type: string };
  const [reactions, setReactions] = useState<ReactionRow[]>([]);
  const [reactionBusy, setReactionBusy] = useState(false);

  useEffect(() => {
    if (!poem?.id) return;
    let cancelled = false;
    supabase
      .from("reactions")
      .select("id,user_id,type")
      .eq("target_type", "mehfil_poem")
      .eq("target_id", poem.id)
      .then(({ data }) => { if (!cancelled) setReactions((data ?? []) as ReactionRow[]); });
    const ch = supabase
      .channel(`mehfil-reactions-${poem.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "reactions", filter: `target_id=eq.${poem.id}` },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const row = payload.new as ReactionRow & { target_type: string };
            if (row.target_type === "mehfil_poem") {
              setReactions((prev) => (prev.some((r) => r.id === row.id) ? prev : [...prev, row]));
            }
          } else if (payload.eventType === "DELETE") {
            const row = payload.old as ReactionRow;
            setReactions((prev) => prev.filter((r) => r.id !== row.id));
          } else if (payload.eventType === "UPDATE") {
            const row = payload.new as ReactionRow;
            setReactions((prev) => prev.map((r) => (r.id === row.id ? row : r)));
          }
        },
      )
      .subscribe();
    return () => { cancelled = true; void supabase.removeChannel(ch); };
  }, [poem?.id]);

  const myReaction = user ? reactions.find((r) => r.user_id === user.id) ?? null : null;
  const counts: Record<string, number> = {};
  for (const r of reactions) counts[r.type] = (counts[r.type] ?? 0) + 1;

  const react = async (rt: string) => {
    if (!user || reactionBusy) return;
    setReactionBusy(true);
    try {
      if (myReaction?.type === rt) {
        // Toggle off
        setReactions((prev) => prev.filter((r) => r.id !== myReaction.id));
        await supabase.from("reactions").delete().eq("id", myReaction.id);
        return;
      }
      if (myReaction) {
        setReactions((prev) => prev.filter((r) => r.id !== myReaction.id));
        await supabase.from("reactions").delete().eq("id", myReaction.id);
      }
      const { data, error } = await supabase
        .from("reactions")
        .insert({ user_id: user.id, target_type: "mehfil_poem", target_id: poem.id, type: rt as never })
        .select("id,user_id,type")
        .single();
      if (error) throw error;
      if (data) setReactions((prev) => [...prev.filter((r) => r.user_id !== user.id), data as ReactionRow]);
      gamify(GAM_EVENTS.feedReactionAdded, 1, { target: "mehfil_poem", poem_id: poem.id, reaction: rt });
    } catch (e: any) {
      toast.error(e?.message ?? "Couldn't react");
    } finally {
      setReactionBusy(false);
    }
  };

  return (
    <MehfilShell showBack>
      <article className="mx-auto max-w-3xl">
        <header className="mb-6">
          {poem.category && (
            <Link
              to="/mehfil/category/$slug"
              params={{ slug: poem.category.slug }}
              className="inline-block rounded-full px-3 py-1 text-xs font-semibold"
              style={{ backgroundColor: `${poem.category.color ?? "#6366f1"}22`, color: poem.category.color ?? "#6366f1" }}
            >
              {poem.category.name}
            </Link>
          )}
          <h1 className="mt-3 font-serif text-3xl font-bold leading-tight md:text-4xl">{poem.title}</h1>

          <div className="mt-4 flex items-center gap-3">
            {author?.avatar_url ? (
              <img src={author.avatar_url} alt="" className="h-11 w-11 rounded-full object-cover" />
            ) : (
              <div className="grid h-11 w-11 place-items-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                {displayName.slice(0, 1).toUpperCase()}
              </div>
            )}
            <div>
              <div className="text-sm font-semibold">{displayName}</div>
              <div className="mt-0.5 flex items-center gap-2">
                <WriterRankBadge rank={poem.writer_rank} />
                {poem.published_at && (
                  <span className="text-[11px] text-muted-foreground">
                    {new Date(poem.published_at).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
                  </span>
                )}
              </div>
            </div>
          </div>

          {poem.competition_id && (
            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-orange-500/10 px-3 py-1.5 text-xs font-semibold text-orange-600">
              <Swords className="h-3.5 w-3.5" /> Entered in Poetry Battle
            </div>
          )}
        </header>

        <div className="overflow-hidden rounded-3xl border border-border/60 p-8 md:p-12" style={themeStyle}>
          <div className="whitespace-pre-wrap font-serif text-lg leading-relaxed md:text-xl">{poem.body}</div>
        </div>

        {/* Reactions */}
        <div className="mt-6 flex flex-wrap items-center gap-2">
          {MEHFIL_REACTIONS.map((r) => {
            const active = myReaction?.type === r.type;
            const c = counts[r.type] ?? 0;
            return (
              <button
                key={r.type}
                onClick={() => requireAuth(() => react(r.type))}
                disabled={reactionBusy}
                aria-pressed={active}
                className={`group inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition hover:-translate-y-0.5 hover:shadow disabled:opacity-60 ${
                  active
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-card hover:border-primary/50"
                }`}
              >
                <span className="text-base">{r.emoji}</span>
                <span>{r.label}</span>
                {c > 0 && (
                  <span className={`ml-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${active ? "bg-primary/20" : "bg-muted"}`}>
                    {c}
                  </span>
                )}
              </button>
            );
          })}
          {reactions.length > 0 && (
            <span className="ml-1 text-[11px] text-muted-foreground">
              {reactions.length} {reactions.length === 1 ? "reaction" : "reactions"}
            </span>
          )}
        </div>


        {/* Stats bar */}
        <div className="mt-6 flex items-center justify-between rounded-2xl border border-border/60 bg-card p-4">
          <div className="flex items-center gap-5 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5"><Heart className="h-4 w-4" /> {poem.upvote_count}</span>
            <span className="inline-flex items-center gap-1.5"><Eye className="h-4 w-4" /> {poem.read_count}</span>
            <span className="inline-flex items-center gap-1.5"><MessageCircle className="h-4 w-4" /> {poem.comment_count}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => requireAuth(() => bookmarkMut.mutate())}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold hover:bg-muted"
              disabled={bookmarkMut.isPending}
            >
              <Bookmark className="h-3.5 w-3.5" /> Bookmark
            </button>
            <button
              onClick={() => {
                const url = typeof window !== "undefined" ? window.location.href : "";
                if (navigator.share) navigator.share({ title: poem.title, url }).catch(() => {});
                else { navigator.clipboard.writeText(url); toast.success("Link copied"); }
                gamify("poetry_share", 1, { poem_id: poem.id });
              }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold hover:bg-muted"
            >
              <Share2 className="h-3.5 w-3.5" /> Share
            </button>
          </div>
        </div>

        {poem.tags?.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-2">
            {poem.tags.map((t: string) => (
              <span key={t} className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">#{t}</span>
            ))}
          </div>
        )}

        <div className="mt-10 rounded-2xl border border-dashed border-border/60 p-6 text-center text-xs text-muted-foreground">
          Comments reuse the shared platform comments module and land here in Phase 2.
        </div>
      </article>
    </MehfilShell>
  );
}
