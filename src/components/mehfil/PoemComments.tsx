import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Send, Smile, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { EmojiPicker } from "@/components/chat/EmojiPicker";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { loadBrowserSupabase } from "@/integrations/supabase/load-browser";
import { useAuth } from "@/lib/auth-store";
import { useAuthGate } from "@/lib/auth-gate";
import {
  deletePoemComment,
  listPoemComments,
  postPoemComment,
} from "@/lib/mehfil.functions";
import { POEM_COMMENT_MAX, type MehfilPoemCommentEnriched } from "@/lib/mehfil-types";
import { isNavigableSlug } from "@/lib/route-slug";

interface Props {
  poemId: string;
  canModerate: boolean;
}

function fmtWhen(iso: string) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

export function PoemComments({ poemId, canModerate }: Props) {
  const { user } = useAuth();
  const gate = useAuthGate();
  const qc = useQueryClient();
  const queryKey = ["mehfil", "comments", poemId] as const;

  const fetchComments = useServerFn(listPoemComments);
  const postComment = useServerFn(postPoemComment);
  const removeComment = useServerFn(deletePoemComment);

  const q = useQuery({
    queryKey,
    queryFn: () => fetchComments({ data: { poemId } }),
    enabled: !!poemId,
    staleTime: 15_000,
  });

  const [text, setText] = useState("");

  useEffect(() => {
    if (!poemId) return;
    let cancelled = false;
    let channel: { unsubscribe?: () => Promise<unknown> } | null = null;
    let sb: Awaited<ReturnType<typeof loadBrowserSupabase>> | null = null;
    void (async () => {
      const client = await loadBrowserSupabase();
      if (cancelled) return;
      sb = client;
      const next = client
        .channel(`mehfil-poem-comments-${poemId}`)
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "mehfil_poem_comments", filter: `poem_id=eq.${poemId}` },
          () => {
            void qc.invalidateQueries({ queryKey: ["mehfil", "comments", poemId] });
            void qc.invalidateQueries({ queryKey: ["mehfil", "poem"] });
          },
        )
        .subscribe();
      if (cancelled) {
        void client.removeChannel(next);
        return;
      }
      channel = next;
    })();
    return () => {
      cancelled = true;
      if (sb && channel) void sb.removeChannel(channel as never);
    };
  }, [poemId, qc]);

  const postMut = useMutation({
    mutationFn: () => postComment({ data: { poemId, text } }),
    onSuccess: (row) => {
      setText("");
      qc.setQueryData<MehfilPoemCommentEnriched[]>(queryKey, (prev) => {
        const list = prev ?? [];
        if (list.some((c) => c.id === row.id)) return list;
        return [...list, row];
      });
      toast.success("Comment posted");
    },
    onError: (e: Error) => toast.error(e.message || "Couldn't post comment"),
  });

  const delMut = useMutation({
    mutationFn: (commentId: string) => removeComment({ data: { commentId } }),
    onSuccess: (_r, commentId) => {
      qc.setQueryData<MehfilPoemCommentEnriched[]>(queryKey, (prev) =>
        (prev ?? []).filter((c) => c.id !== commentId),
      );
      toast.success("Comment deleted");
    },
    onError: (e: Error) => toast.error(e.message || "Couldn't delete comment"),
  });

  const comments = q.data ?? [];
  const remaining = POEM_COMMENT_MAX - text.trim().length;
  const canPost = text.trim().length > 0 && !postMut.isPending;

  const submit = () => {
    if (!user) {
      gate.openSignIn();
      return;
    }
    if (!canPost) return;
    postMut.mutate();
  };

  return (
    <section id="comments" className="mt-10 rounded-2xl border border-border/60 bg-card p-5 md:p-6">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        Comments {comments.length > 0 ? `(${comments.length})` : ""}
      </h2>

      <div className="mt-4">
        {user ? (
          <div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value.slice(0, POEM_COMMENT_MAX))}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                  e.preventDefault();
                  submit();
                }
              }}
              rows={3}
              maxLength={POEM_COMMENT_MAX}
              placeholder="Share a thought on this poem…"
              className="w-full resize-y rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none ring-primary/30 placeholder:text-muted-foreground focus:ring-2"
            />
            <div className="mt-2 flex items-center justify-between gap-2">
              <span className="text-[11px] text-muted-foreground">{remaining} left</span>
              <div className="flex items-center gap-1.5">
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground hover:bg-accent/30 hover:text-foreground"
                      aria-label="Add emoji"
                    >
                      <Smile className="h-4 w-4" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent align="end" className="w-auto p-0">
                    <EmojiPicker onPick={(e) => setText((t) => (t + e).slice(0, POEM_COMMENT_MAX))} />
                  </PopoverContent>
                </Popover>
                <button
                  type="button"
                  onClick={submit}
                  disabled={!canPost}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
                >
                  {postMut.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                  Post
                </button>
              </div>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => gate.openSignIn()}
            className="w-full rounded-xl border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground hover:border-primary/40 hover:text-foreground"
          >
            Sign in to comment on this poem
          </button>
        )}
      </div>

      {q.isLoading ? (
        <div className="mt-6 flex justify-center py-6 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      ) : comments.length === 0 ? (
        <p className="mt-6 text-center text-xs text-muted-foreground">No comments yet. Be the first.</p>
      ) : (
        <ul className="mt-6 space-y-4">
          {comments.map((c) => {
            const name = c.author?.display_name || c.author?.username || "Anonymous";
            const username = c.author?.username;
            const canDelete = canModerate || user?.id === c.author_id;
            return (
              <li key={c.id} className="flex gap-3">
                {c.author?.avatar_url ? (
                  <img src={c.author.avatar_url} alt="" className="h-9 w-9 shrink-0 rounded-full object-cover" />
                ) : (
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    {name.slice(0, 1).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      {username && isNavigableSlug(username) ? (
                        <Link
                          to="/u/$username"
                          params={{ username }}
                          className="truncate text-sm font-semibold hover:underline"
                        >
                          {name}
                        </Link>
                      ) : (
                        <span className="truncate text-sm font-semibold">{name}</span>
                      )}
                      <div className="text-[11px] text-muted-foreground">{fmtWhen(c.created_at)}</div>
                    </div>
                    {canDelete && (
                      <button
                        type="button"
                        aria-label="Delete comment"
                        disabled={delMut.isPending}
                        onClick={() => {
                          if (!window.confirm("Delete this comment?")) return;
                          delMut.mutate(c.id);
                        }}
                        className="rounded-md p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                  <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-relaxed">{c.text}</p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
