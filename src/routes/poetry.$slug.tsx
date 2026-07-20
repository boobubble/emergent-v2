import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState, useRef } from "react";
import { toast } from "sonner";
import {
  Bookmark, Heart, Eye, MessageCircle, Share2, Swords, Copy, Check,
  ChevronLeft, ChevronRight, Minus, Plus, Flame, UserPlus, Clock,
} from "lucide-react";
import {
  getPoemBySlug, recordPoemRead, togglePoemBookmark, getMehfilRelated, getPoemNeighbors,
} from "@/lib/mehfil.functions";
import { MehfilShell } from "@/components/mehfil/MehfilShell";
import { WriterRankBadge } from "@/components/mehfil/WriterRankBadge";
import { PoemCard } from "@/components/mehfil/PoemCard";
import { ReportButton } from "@/components/moderation/ReportButton";
import { MEHFIL_REACTIONS, poemPreview } from "@/lib/mehfil-types";
import { useAuth } from "@/lib/auth-store";
import { useAuthGate } from "@/lib/auth-gate";
import { gamify, GAM_EVENTS } from "@/lib/gamification-emit";
import { useMehfilPoemRealtime } from "@/lib/mehfil-realtime";
import { supabase } from "@/integrations/supabase/client";

const SITE_URL = "https://holo-chat-quest.lovable.app";

const FONT_SIZES = [16, 18, 20, 22, 24, 26, 28] as const;
const FONT_STORAGE_KEY = "poetry:reader:fontSize";

// Convert a 2-letter ISO country code to its emoji flag.
function countryFlag(cc?: string | null): string | null {
  if (!cc || cc.length !== 2) return null;
  const A = 0x1f1e6;
  const up = cc.toUpperCase();
  return String.fromCodePoint(A + up.charCodeAt(0) - 65) + String.fromCodePoint(A + up.charCodeAt(1) - 65);
}

export const Route = createFileRoute("/poetry/$slug")({
  loader: async ({ params }) => {
    const poem = await getPoemBySlug({ data: { slug: params.slug } });
    if (!poem) throw notFound();
    return { poem };
  },
  head: ({ params, loaderData }) => {
    const url = `${SITE_URL}/poetry/${params.slug}`;
    if (!loaderData) {
      return {
        meta: [{ title: "Poem not found · Poetry Hub" }, { name: "robots", content: "noindex" }],
        links: [{ rel: "canonical", href: url }],
      };
    }
    const p = loaderData.poem;
    const desc = p.seo_description || poemPreview(p.body, 155);
    const title = p.seo_title || `${p.title} · Poetry Hub`;
    const authorName = p.author?.display_name || p.author?.username || "Anonymous";
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "article" },
        { property: "og:url", content: url },
        ...(p.cover_url ? [{ property: "og:image", content: p.cover_url }] : []),
        { name: "twitter:card", content: p.cover_url ? "summary_large_image" : "summary" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: desc },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CreativeWork",
            headline: p.title,
            name: p.title,
            description: desc,
            url,
            datePublished: p.published_at,
            image: p.cover_url ? [p.cover_url] : undefined,
            author: { "@type": "Person", name: authorName },
            genre: p.category?.name,
            interactionStatistic: [
              { "@type": "InteractionCounter", interactionType: "https://schema.org/LikeAction", userInteractionCount: p.upvote_count ?? 0 },
              { "@type": "InteractionCounter", interactionType: "https://schema.org/ReadAction", userInteractionCount: p.read_count ?? 0 },
            ],
          }),
        },
      ],
    };
  },

  component: PoemDetailPage,
  notFoundComponent: () => (
    <MehfilShell showBack>
      <div className="py-20 text-center">
        <div className="text-lg font-semibold">Poem not found</div>
        <Link to="/poetry" className="mt-3 inline-block text-sm text-primary underline">Back to Poetry Hub</Link>
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
  const fetchNeighbors = useServerFn(getPoemNeighbors);

  const q = useQuery({
    queryKey: ["mehfil", "poem", slug],
    queryFn: () => fetchPoem({ data: { slug } }),
    initialData: initial,
    refetchOnWindowFocus: false,
  });
  const poem = q.data ?? initial;

  const qc = useQueryClient();
  useMehfilPoemRealtime(poem?.id, (row) => {
    qc.setQueryData(["mehfil", "poem", slug], (prev: typeof poem | undefined) =>
      prev ? { ...prev, ...row } : prev,
    );
  });

  // Related content (lazy)
  const fetchRelated = useServerFn(getMehfilRelated);
  const relatedQ = useQuery({
    queryKey: ["mehfil", "related", poem?.id],
    queryFn: () => fetchRelated({ data: { poemId: poem!.id, authorId: poem!.author_id, categoryId: poem!.category_id ?? null } }),
    enabled: !!poem?.id,
    staleTime: 60_000,
  });

  // Prev / Next
  const neighborsQ = useQuery({
    queryKey: ["mehfil", "neighbors", poem?.id],
    queryFn: () => fetchNeighbors({
      data: { poemId: poem!.id, publishedAt: poem!.published_at ?? poem!.created_at, categoryId: poem!.category_id ?? null },
    }),
    enabled: !!poem?.id && !!(poem?.published_at ?? poem?.created_at),
    staleTime: 5 * 60_000,
  });

  // Record a "read"
  useEffect(() => {
    if (!poem) return;
    void recordRead({ data: { poemId: poem.id } }).catch(() => {});
  }, [poem?.id, recordRead]);

  // Font size preference
  const [fontIdx, setFontIdx] = useState<number>(() => {
    if (typeof window === "undefined") return 2;
    const raw = window.localStorage.getItem(FONT_STORAGE_KEY);
    const n = raw ? Number(raw) : NaN;
    return Number.isFinite(n) && n >= 0 && n < FONT_SIZES.length ? n : 2;
  });
  useEffect(() => {
    if (typeof window !== "undefined") window.localStorage.setItem(FONT_STORAGE_KEY, String(fontIdx));
  }, [fontIdx]);
  const fontPx = FONT_SIZES[fontIdx];

  // Reading progress bar
  const articleRef = useRef<HTMLElement | null>(null);
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const el = articleRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const total = el.offsetHeight - window.innerHeight;
      if (total <= 0) { setProgress(rect.top < 0 ? 100 : 0); return; }
      const scrolled = Math.min(Math.max(-rect.top, 0), total);
      setProgress((scrolled / total) * 100);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); };
  }, [poem?.id]);

  const readingMinutes = useMemo(() => {
    const words = (poem?.body ?? "").trim().split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.round(words / 180));
  }, [poem?.body]);

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
  const flag = countryFlag(author?.country_code);

  const requireAuth = (fn: () => void) => (user ? fn() : gate.openSignIn());

  // Reactions
  type ReactionRow = { id: string; user_id: string; type: string };
  const [reactions, setReactions] = useState<ReactionRow[]>([]);
  const [reactionBusy, setReactionBusy] = useState(false);

  useEffect(() => {
    if (!poem?.id) return;
    let cancelled = false;
    supabase.from("reactions").select("id,user_id,type")
      .eq("target_type", "mehfil_poem").eq("target_id", poem.id)
      .then(({ data }) => { if (!cancelled) setReactions((data ?? []) as ReactionRow[]); });
    const ch = supabase.channel(`mehfil-reactions-${poem.id}`).on(
      "postgres_changes",
      { event: "*", schema: "public", table: "reactions", filter: `target_id=eq.${poem.id}` },
      (payload) => {
        if (payload.eventType === "INSERT") {
          const row = payload.new as ReactionRow & { target_type: string };
          if (row.target_type === "mehfil_poem") setReactions((prev) => (prev.some((r) => r.id === row.id) ? prev : [...prev, row]));
        } else if (payload.eventType === "DELETE") {
          const row = payload.old as ReactionRow;
          setReactions((prev) => prev.filter((r) => r.id !== row.id));
        } else if (payload.eventType === "UPDATE") {
          const row = payload.new as ReactionRow;
          setReactions((prev) => prev.map((r) => (r.id === row.id ? row : r)));
        }
      },
    ).subscribe();
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
        setReactions((prev) => prev.filter((r) => r.id !== myReaction.id));
        await supabase.from("reactions").delete().eq("id", myReaction.id);
        return;
      }
      if (myReaction) {
        setReactions((prev) => prev.filter((r) => r.id !== myReaction.id));
        await supabase.from("reactions").delete().eq("id", myReaction.id);
      }
      const { data, error } = await supabase.from("reactions")
        .insert({ user_id: user.id, target_type: "mehfil_poem", target_id: poem.id, type: rt as never })
        .select("id,user_id,type").single();
      if (error) throw error;
      if (data) setReactions((prev) => [...prev.filter((r) => r.user_id !== user.id), data as ReactionRow]);
      gamify(GAM_EVENTS.feedReactionAdded, 1, { target: "mehfil_poem", poem_id: poem.id, reaction: rt });
    } catch (e: any) {
      toast.error(e?.message ?? "Couldn't react");
    } finally {
      setReactionBusy(false);
    }
  };

  // Follow writer — dedicated one-way graph (see FollowWriterButton).

  // Copy poem
  const [copied, setCopied] = useState(false);
  const copyPoem = async () => {
    try {
      const url = typeof window !== "undefined" ? window.location.href : "";
      const text = `${poem.title}\nby ${displayName}\n\n${poem.body}\n\n${url}`;
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("Poem copied");
      setTimeout(() => setCopied(false), 1500);
    } catch { toast.error("Couldn't copy"); }
  };

  const share = () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (navigator.share) navigator.share({ title: poem.title, url }).catch(() => {});
    else { navigator.clipboard.writeText(url); toast.success("Link copied"); }
    gamify("poetry_share", 1, { poem_id: poem.id });
  };

  // Trending detection: poem is in the top of related trending set
  const isTrending = (relatedQ.data?.trending ?? []).some((p) => p.id === poem.id)
    || (poem.upvote_count ?? 0) >= 25 || (poem.read_count ?? 0) >= 500;

  const isOwnPoem = user?.id === poem.author_id;
  const prev = neighborsQ.data?.prev ?? null;
  const next = neighborsQ.data?.next ?? null;

  return (
    <MehfilShell showBack>
      {/* Reading progress bar */}
      <div className="pointer-events-none fixed left-0 right-0 top-0 z-40 h-1 bg-transparent">
        <div
          className="h-full bg-gradient-to-r from-primary via-primary/80 to-primary transition-[width] duration-100"
          style={{ width: `${progress}%` }}
        />
      </div>

      <article ref={articleRef} className="mx-auto max-w-3xl">
        {/* Header */}
        <header className="mb-6">
          <div className="flex flex-wrap items-center gap-2">
            {poem.category && (
              <Link
                to="/poetry/category/$slug"
                params={{ slug: poem.category.slug }}
                className="inline-block rounded-full px-3 py-1 text-xs font-semibold"
                style={{ backgroundColor: `${poem.category.color ?? "#6366f1"}22`, color: poem.category.color ?? "#6366f1" }}
              >
                {poem.category.name}
              </Link>
            )}
            {isTrending && (
              <span className="inline-flex items-center gap-1 rounded-full bg-orange-500/10 px-2.5 py-1 text-[11px] font-semibold text-orange-500">
                <Flame className="h-3 w-3" /> Trending
              </span>
            )}
            {poem.competition_id && (
              <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2.5 py-1 text-[11px] font-semibold text-red-500">
                <Swords className="h-3 w-3" /> In Battle
              </span>
            )}
            {poem.is_editors_pick && (
              <span className="rounded-full bg-amber-500/10 px-2.5 py-1 text-[11px] font-semibold text-amber-500">
                Editor’s Pick
              </span>
            )}
          </div>

          <h1 className="mt-3 font-serif text-3xl font-bold leading-tight md:text-5xl">{poem.title}</h1>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Link
              to="/u/$username"
              params={{ username: author?.username ?? "" }}
              className="flex items-center gap-3 hover:opacity-90"
            >
              {author?.avatar_url ? (
                <img src={author.avatar_url} alt="" className="h-12 w-12 rounded-full object-cover ring-2 ring-primary/10" />
              ) : (
                <div className="grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-base font-semibold text-primary">
                  {displayName.slice(0, 1).toUpperCase()}
                </div>
              )}
              <div>
                <div className="flex items-center gap-1.5 text-sm font-semibold">
                  {displayName}
                  {flag && <span className="text-base leading-none" title={author?.country_code ?? ""}>{flag}</span>}
                </div>
                <div className="mt-0.5 flex items-center gap-2 text-[11px] text-muted-foreground">
                  <WriterRankBadge rank={poem.writer_rank} />
                  {poem.published_at && (
                    <>
                      <span>·</span>
                      <span>
                        {new Date(poem.published_at).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
                      </span>
                    </>
                  )}
                  <span>·</span>
                  <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {readingMinutes} min read</span>
                </div>
              </div>
            </Link>

            {!isOwnPoem && author?.id && (
              <button
                onClick={() => requireAuth(followWriter)}
                className={`ml-auto inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                  following ? "border border-border bg-muted text-muted-foreground" : "bg-primary text-primary-foreground hover:opacity-90"
                }`}
              >
                <UserPlus className="h-3.5 w-3.5" />
                {following === "accepted" ? "Following" : following === "pending" ? "Requested" : "Follow"}
              </button>
            )}
          </div>
        </header>

        {/* Font controls */}
        <div className="mb-3 flex items-center justify-end gap-2 text-xs text-muted-foreground">
          <span className="mr-1">Aa</span>
          <button
            onClick={() => setFontIdx((i) => Math.max(0, i - 1))}
            disabled={fontIdx === 0}
            className="grid h-7 w-7 place-items-center rounded-full border border-border hover:bg-muted disabled:opacity-40"
            aria-label="Decrease font size"
          ><Minus className="h-3.5 w-3.5" /></button>
          <button
            onClick={() => setFontIdx((i) => Math.min(FONT_SIZES.length - 1, i + 1))}
            disabled={fontIdx === FONT_SIZES.length - 1}
            className="grid h-7 w-7 place-items-center rounded-full border border-border hover:bg-muted disabled:opacity-40"
            aria-label="Increase font size"
          ><Plus className="h-3.5 w-3.5" /></button>
        </div>

        {/* Poem body */}
        <div
          className="overflow-hidden rounded-3xl border border-border/60 p-8 shadow-sm md:p-14"
          style={themeStyle}
        >
          <div
            className="whitespace-pre-wrap font-serif leading-[1.85] tracking-[0.005em]"
            style={{ fontSize: `${fontPx}px`, lineHeight: 1.85 }}
          >
            {poem.body}
          </div>
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
                  active ? "border-primary bg-primary/10 text-primary" : "border-border bg-card hover:border-primary/50"
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

        {/* Stats + action bar (inline on desktop) */}
        <div className="mt-6 hidden items-center justify-between rounded-2xl border border-border/60 bg-card p-4 md:flex">
          <div className="flex items-center gap-5 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5"><Heart className="h-4 w-4" /> {poem.upvote_count}</span>
            <span className="inline-flex items-center gap-1.5"><Eye className="h-4 w-4" /> {poem.read_count}</span>
            <span className="inline-flex items-center gap-1.5"><MessageCircle className="h-4 w-4" /> {poem.comment_count}</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={copyPoem} className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold hover:bg-muted">
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />} {copied ? "Copied" : "Copy"}
            </button>
            <button
              onClick={() => requireAuth(() => bookmarkMut.mutate())}
              disabled={bookmarkMut.isPending}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold hover:bg-muted"
            >
              <Bookmark className="h-3.5 w-3.5" /> Bookmark
            </button>
            <button onClick={share} className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold hover:bg-muted">
              <Share2 className="h-3.5 w-3.5" /> Share
            </button>
            <ReportButton targetType="post" targetId={poem.id} variant="outline" />
          </div>
        </div>

        {/* Mobile: compact stats */}
        <div className="mt-6 flex items-center gap-5 rounded-2xl border border-border/60 bg-card p-3 text-sm text-muted-foreground md:hidden">
          <span className="inline-flex items-center gap-1.5"><Heart className="h-4 w-4" /> {poem.upvote_count}</span>
          <span className="inline-flex items-center gap-1.5"><Eye className="h-4 w-4" /> {poem.read_count}</span>
          <span className="inline-flex items-center gap-1.5"><MessageCircle className="h-4 w-4" /> {poem.comment_count}</span>
        </div>

        {poem.tags?.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-2">
            {poem.tags.map((t: string) => (
              <span key={t} className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">#{t}</span>
            ))}
          </div>
        )}

        {/* Prev / Next */}
        {(prev || next) && (
          <nav className="mt-10 grid gap-3 sm:grid-cols-2">
            {prev ? (
              <Link
                to="/poetry/$slug" params={{ slug: prev.slug }}
                className="group flex items-center gap-3 rounded-2xl border border-border/60 bg-card p-4 transition hover:border-primary/40"
              >
                <ChevronLeft className="h-5 w-5 shrink-0 text-muted-foreground group-hover:text-primary" />
                <div className="min-w-0">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Previous</div>
                  <div className="truncate text-sm font-semibold">{prev.title}</div>
                </div>
              </Link>
            ) : <div />}
            {next ? (
              <Link
                to="/poetry/$slug" params={{ slug: next.slug }}
                className="group flex items-center justify-end gap-3 rounded-2xl border border-border/60 bg-card p-4 text-right transition hover:border-primary/40"
              >
                <div className="min-w-0">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Next</div>
                  <div className="truncate text-sm font-semibold">{next.title}</div>
                </div>
                <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground group-hover:text-primary" />
              </Link>
            ) : <div />}
          </nav>
        )}

        <div id="comments" className="mt-10 rounded-2xl border border-dashed border-border/60 p-6 text-center text-xs text-muted-foreground">
          Comments coming soon — the shared platform comments module lands here in Phase 2.
        </div>

        {relatedQ.data?.moreFromAuthor && relatedQ.data.moreFromAuthor.length > 0 && (
          <section className="mt-10">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              More from {displayName}
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {relatedQ.data.moreFromAuthor.slice(0, 4).map((p) => (
                <PoemCard key={p.id} poem={p} variant="compact" />
              ))}
            </div>
          </section>
        )}

        {relatedQ.data?.related && relatedQ.data.related.length > 0 && (
          <section className="mt-10">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Related poems{poem.category ? ` in ${poem.category.name}` : ""}
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {relatedQ.data.related.slice(0, 4).map((p) => (
                <PoemCard key={p.id} poem={p} variant="compact" />
              ))}
            </div>
          </section>
        )}

        {relatedQ.data?.trending && relatedQ.data.trending.length > 0 && (
          <section className="mt-10">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Trending on Poetry Hub
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {relatedQ.data.trending.slice(0, 4).map((p) => (
                <PoemCard key={p.id} poem={p} variant="compact" />
              ))}
            </div>
          </section>
        )}

      </article>

      {/* Sticky mobile action bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-background/95 backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-3xl items-center justify-around gap-1 px-2 py-2">
          <button onClick={copyPoem} className="flex flex-col items-center gap-0.5 px-3 py-1 text-[10px] font-semibold text-muted-foreground">
            {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
            <span>{copied ? "Copied" : "Copy"}</span>
          </button>
          <button
            onClick={() => requireAuth(() => bookmarkMut.mutate())}
            disabled={bookmarkMut.isPending}
            className="flex flex-col items-center gap-0.5 px-3 py-1 text-[10px] font-semibold text-muted-foreground"
          >
            <Bookmark className="h-5 w-5" /><span>Save</span>
          </button>
          <button onClick={share} className="flex flex-col items-center gap-0.5 px-3 py-1 text-[10px] font-semibold text-muted-foreground">
            <Share2 className="h-5 w-5" /><span>Share</span>
          </button>
          <a href="#comments" className="flex flex-col items-center gap-0.5 px-3 py-1 text-[10px] font-semibold text-muted-foreground">
            <MessageCircle className="h-5 w-5" /><span>Comment</span>
          </a>
          <div className="flex flex-col items-center gap-0.5 px-1 py-1 text-[10px] font-semibold text-muted-foreground">
            <ReportButton targetType="post" targetId={poem.id} variant="ghost" size="icon" />
            <span>Report</span>
          </div>
        </div>
      </div>
      {/* Bottom padding so sticky bar doesn't cover content */}
      <div className="h-16 md:hidden" />
    </MehfilShell>
  );
}
