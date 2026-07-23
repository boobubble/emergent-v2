import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  ChevronLeft, ChevronUp, MessageCircle, Loader2, Send, EyeOff, Eye, Calendar, Share2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  getFeedback, postComment, toggleVote, findSimilarFeedback,
} from "@/lib/feedback.functions";
import {
  CATEGORY_META, STATUS_META,
  type FeedbackCategory, type FeedbackStatus,
} from "@/lib/feedback-config";
import { useAuth } from "@/lib/auth-store";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/feedback/$id")({
  head: () => ({
    meta: [
      { title: "Discussion — Community Forum" },
      { name: "description", content: "Community discussion, bug report, or feature request." },
      { property: "og:title", content: "Community Forum discussion" },
      { property: "og:description", content: "Join the discussion on the community forum." },
    ],
  }),
  component: DiscussionPage,
});

function fmtDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric", month: "short", day: "numeric",
    });
  } catch { return ""; }
}

function DiscussionPage() {
  const { id } = Route.useParams();
  const { user } = useAuth();
  const qc = useQueryClient();
  const navigate = useNavigate();

  const get = useServerFn(getFeedback);
  const comment = useServerFn(postComment);
  const vote = useServerFn(toggleVote);
  const findSimilar = useServerFn(findSimilarFeedback);

  const { data, isLoading, error } = useQuery({
    queryKey: ["forum", "detail", id],
    queryFn: () => get({ data: { id } }),
  });

  const { data: related } = useQuery({
    queryKey: ["forum", "related", data?.report?.title ?? ""],
    queryFn: () => findSimilar({ data: { title: data!.report.title } }),
    enabled: !!data?.report?.title,
  });

  const [text, setText] = useState("");
  const postMut = useMutation({
    mutationFn: () => comment({ data: { reportId: id, text: text.trim() } }),
    onSuccess: () => {
      setText("");
      qc.invalidateQueries({ queryKey: ["forum", "detail", id] });
      qc.invalidateQueries({ queryKey: ["forum"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const voteMut = useMutation({
    mutationFn: () => vote({ data: { reportId: id } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["forum", "detail", id] });
      qc.invalidateQueries({ queryKey: ["forum"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  // Realtime for this discussion
  useEffect(() => {
    const ch = supabase
      .channel(`forum-discussion-${id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "feedback_comments", filter: `report_id=eq.${id}` },
        () => qc.invalidateQueries({ queryKey: ["forum", "detail", id] }))
      .on("postgres_changes", { event: "*", schema: "public", table: "feedback_reports", filter: `id=eq.${id}` },
        () => qc.invalidateQueries({ queryKey: ["forum", "detail", id] }))
      .on("postgres_changes", { event: "*", schema: "public", table: "feedback_votes", filter: `report_id=eq.${id}` },
        () => qc.invalidateQueries({ queryKey: ["forum", "detail", id] }))
      .subscribe();
    return () => { void supabase.removeChannel(ch); };
  }, [id, qc]);

  if (isLoading) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="mx-auto grid min-h-[60vh] max-w-md place-items-center p-6 text-center">
        <div>
          <h1 className="text-xl font-bold">Discussion not found</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            It may have been deleted or made private.
          </p>
          <Link to="/feedback" className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
            <ChevronLeft className="h-4 w-4" /> Back to forum
          </Link>
        </div>
      </div>
    );
  }

  const r = data.report;
  const Cat = CATEGORY_META[r.category as FeedbackCategory] ?? CATEGORY_META.other;
  const St  = STATUS_META[r.status as FeedbackStatus] ?? STATUS_META.open;
  const relatedList = (related ?? []).filter((x) => x.id !== id).slice(0, 4);

  const share = async () => {
    if (typeof window === "undefined") return;
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: r.title, url });
      else { await navigator.clipboard.writeText(url); toast.success("Link copied"); }
    } catch { /* cancelled */ }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 border-b border-border/60 bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3">
          <Link to="/feedback" className="rounded-md p-1.5 hover:bg-muted" aria-label="Back to forum">
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-sm font-semibold">{r.title}</h1>
            <p className="text-[11px] text-muted-foreground">Discussion</p>
          </div>
          <Button size="sm" variant="ghost" className="gap-1.5" onClick={share}>
            <Share2 className="h-4 w-4" /> Share
          </Button>
        </div>
      </header>

      <main className="mx-auto grid max-w-5xl gap-4 p-4 lg:grid-cols-[1fr_260px]">
        <div className="min-w-0 space-y-4">
          {/* Post card */}
          <article className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5">
            <div className="flex items-start gap-3">
              <button
                onClick={() => {
                  if (!user) { toast.error("Sign in to vote"); return; }
                  voteMut.mutate();
                }}
                className={`flex h-16 w-12 shrink-0 flex-col items-center justify-center rounded-xl border transition ${
                  data.hasVoted
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-background text-foreground hover:border-primary/60"
                }`}
                aria-label="Upvote"
              >
                <ChevronUp className="h-4 w-4" />
                <span className="text-sm font-semibold tabular-nums">{r.upvote_count}</span>
                <span className="text-[9px] uppercase text-muted-foreground">votes</span>
              </button>
              <div className="min-w-0 flex-1">
                <h2 className="text-xl font-bold leading-tight sm:text-2xl">{r.title}</h2>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className={`inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium ${Cat.tone}`}>
                    <Cat.icon className="h-3 w-3" /> {Cat.label}
                  </span>
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${St.tone}`}>
                    {St.label}
                  </span>
                  {r.is_anonymous && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                      <EyeOff className="h-3 w-3" /> Anonymous
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                    <Calendar className="h-3 w-3" /> {fmtDate(r.created_at)}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                    <MessageCircle className="h-3 w-3" /> {data.comments.length} replies
                  </span>
                </div>
              </div>
            </div>

            {r.description && (
              <div className="mt-4 whitespace-pre-wrap rounded-xl border border-border bg-muted/30 p-3 text-sm leading-relaxed">
                {r.description}
              </div>
            )}
            {(r.screenshots ?? []).length > 0 && (
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {r.screenshots.map((url: string) => (
                  <a key={url} href={url} target="_blank" rel="noreferrer" className="overflow-hidden rounded-lg border border-border">
                    <img src={url} alt="Screenshot" className="h-28 w-full object-cover" />
                  </a>
                ))}
              </div>
            )}
            {r.admin_note && (
              <div className="mt-3 rounded-xl border border-primary/30 bg-primary/5 p-3 text-sm">
                <div className="mb-1 text-xs font-semibold text-primary">Official response</div>
                {r.admin_note}
              </div>
            )}
          </article>

          {/* Comments */}
          <section className="rounded-2xl border border-border bg-card p-4 shadow-sm">
            <h3 className="mb-3 text-sm font-semibold">
              Replies <span className="text-muted-foreground">({data.comments.length})</span>
            </h3>
            <div className="space-y-2">
              {data.comments.map((c) => (
                <div
                  key={c.id}
                  className={`rounded-xl border p-3 text-sm ${
                    c.is_admin_response
                      ? "border-primary/40 bg-primary/5"
                      : "border-border bg-background/60"
                  }`}
                >
                  {c.is_admin_response && (
                    <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-primary">
                      Official response
                    </div>
                  )}
                  <p className="whitespace-pre-wrap">{c.text}</p>
                  <div className="mt-1 text-[10px] text-muted-foreground">{fmtDate(c.created_at)}</div>
                </div>
              ))}
              {data.comments.length === 0 && (
                <p className="rounded-lg border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
                  No replies yet. Be the first to respond.
                </p>
              )}
            </div>

            {user ? (
              <div className="mt-3 flex items-end gap-2">
                <Textarea
                  value={text} onChange={(e) => setText(e.target.value)}
                  rows={2} maxLength={2000} placeholder="Write a reply…"
                  className="flex-1"
                />
                <Button
                  size="icon" onClick={() => postMut.mutate()}
                  disabled={postMut.isPending || text.trim().length === 0}
                >
                  {postMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>
            ) : (
              <Link
                to="/auth"
                className="mt-3 flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-primary/40 bg-primary/5 p-3 text-sm font-medium text-primary hover:bg-primary/10"
              >
                Sign in to reply
              </Link>
            )}
          </section>
        </div>

        {/* Sidebar */}
        <aside className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Details</h4>
            <dl className="space-y-1.5 text-xs">
              <div className="flex justify-between"><dt className="text-muted-foreground">Status</dt><dd className="font-medium">{St.label}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Category</dt><dd className="font-medium">{Cat.label}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Votes</dt><dd className="font-medium">{r.upvote_count}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Replies</dt><dd className="font-medium">{data.comments.length}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Created</dt><dd className="font-medium">{fmtDate(r.created_at)}</dd></div>
            </dl>
          </div>

          {relatedList.length > 0 && (
            <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Related discussions</h4>
              <ul className="space-y-2">
                {relatedList.map((s) => {
                  const RSt = STATUS_META[s.status as FeedbackStatus] ?? STATUS_META.open;
                  return (
                    <li key={s.id}>
                      <Link
                        to="/feedback/$id"
                        params={{ id: s.id }}
                        className="block rounded-lg border border-border/70 bg-background/40 p-2 text-xs hover:border-primary/40 hover:bg-primary/5"
                      >
                        <div className="line-clamp-2 font-medium">{s.title}</div>
                        <div className="mt-1 flex items-center gap-2 text-[10px] text-muted-foreground">
                          <span className={`rounded-full px-1.5 py-0.5 ${RSt.tone}`}>{RSt.label}</span>
                          <span className="inline-flex items-center gap-0.5"><ChevronUp className="h-3 w-3" /> {s.upvote_count}</span>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </aside>
      </main>
    </div>
  );
}
