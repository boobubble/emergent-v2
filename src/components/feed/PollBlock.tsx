import { useEffect, useMemo, useState } from "react";
import { BarChart3, CheckCircle2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { FeedPost } from "@/lib/feed-types";

const VOTE_KEY = (postId: string) => `feed-poll-vote:${postId}`;

type PollData = NonNullable<FeedPost["poll"]>;

function readVoted(postId: string): number | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(VOTE_KEY(postId));
  if (raw === null) return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

function normalizeVotes(raw: Record<string, number> | undefined | null): Record<string, number> {
  const out: Record<string, number> = {};
  if (!raw) return out;
  for (const [k, v] of Object.entries(raw)) {
    const n = Number(v);
    if (Number.isFinite(n) && n >= 0) out[k] = n;
  }
  return out;
}

export function PollBlock({ post }: { post: FeedPost }) {
  const poll = post.poll;
  const [votes, setVotes] = useState<Record<string, number>>(() => normalizeVotes(poll?.votes));
  const [voted, setVoted] = useState<number | null>(() => readVoted(post.id));
  const [busy, setBusy] = useState(false);

  const total = useMemo(() => Object.values(votes).reduce((a, b) => a + (Number(b) || 0), 0), [votes]);

  // Sync when parent post updates (feed realtime) or poll JSON changes.
  useEffect(() => {
    if (post.poll?.votes) setVotes(normalizeVotes(post.poll.votes));
  }, [post.id, post.poll]);

  // Direct poll updates on this post row.
  useEffect(() => {
    const ch = supabase
      .channel(`poll-post-${post.id}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "posts", filter: `id=eq.${post.id}` },
        (payload) => {
          const nextPoll = (payload.new as FeedPost).poll;
          if (nextPoll?.votes) setVotes(normalizeVotes(nextPoll.votes));
        },
      )
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [post.id]);

  if (!poll) return null;

  async function castVote(idx: number) {
    if (voted !== null || busy) return;
    setBusy(true);
    const prevVotes = { ...votes };
    const prevVoted = voted;
    const optimistic = { ...prevVotes, [String(idx)]: (prevVotes[String(idx)] ?? 0) + 1 };
    setVotes(optimistic);
    setVoted(idx);
    try { localStorage.setItem(VOTE_KEY(post.id), String(idx)); } catch {}

    try {
      const { data: row, error: readErr } = await supabase
        .from("posts")
        .select("poll")
        .eq("id", post.id)
        .maybeSingle();
      if (readErr) throw readErr;

      const serverPoll: PollData = (row?.poll as PollData | null) ?? poll!;
      const serverVotes = normalizeVotes(serverPoll.votes);
      const merged = { ...serverVotes, [String(idx)]: (serverVotes[String(idx)] ?? 0) + 1 };
      const newPoll: PollData = { question: serverPoll.question, options: serverPoll.options, votes: merged };

      const { data: updated, error: writeErr } = await supabase
        .from("posts")
        .update({ poll: newPoll })
        .eq("id", post.id)
        .select("poll")
        .single();
      if (writeErr) throw writeErr;

      const finalPoll = (updated?.poll as PollData | null) ?? newPoll;
      setVotes(normalizeVotes(finalPoll.votes));
    } catch {
      setVotes(prevVotes);
      setVoted(prevVoted);
      try { localStorage.removeItem(VOTE_KEY(post.id)); } catch {}
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-4 overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/8 via-card to-card p-4 shadow-[0_4px_18px_-12px_var(--primary-glow)]">
      <div className="mb-3 flex items-center gap-2">
        <span className="grid h-7 w-7 place-items-center rounded-lg bg-primary/15 text-primary">
          <BarChart3 className="h-4 w-4" />
        </span>
        <span className="text-[11px] font-bold uppercase tracking-wider text-primary">Poll</span>
        <span className="ml-auto text-[11px] text-muted-foreground">
          {total} {total === 1 ? "vote" : "votes"}
        </span>
      </div>
      <p className="mb-3 text-[15px] font-semibold leading-snug">{poll.question}</p>
      <div className="space-y-2">
        {poll.options.map((opt, idx) => {
          const count = votes[String(idx)] ?? 0;
          const pct = total > 0 ? Math.round((count / total) * 100) : 0;
          const isPicked = voted === idx;
          const showResults = voted !== null;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => castVote(idx)}
              disabled={showResults || busy}
              className={`relative min-h-11 w-full overflow-hidden rounded-xl border px-3 py-2.5 text-left text-sm transition ${
                isPicked
                  ? "border-primary bg-primary/10 text-foreground"
                  : showResults
                    ? "border-border bg-background/60 text-foreground"
                    : "border-border bg-background/60 hover:border-primary/60 hover:bg-primary/5"
              }`}
            >
              {showResults && (
                <span
                  aria-hidden
                  className={`absolute inset-y-0 left-0 ${isPicked ? "bg-primary/20" : "bg-muted/60"}`}
                  style={{ width: `${pct}%` }}
                />
              )}
              <span className="relative flex items-center gap-2">
                {isPicked && <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />}
                <span className="flex-1 font-medium">{opt}</span>
                {showResults && (
                  <span className="text-xs font-semibold text-muted-foreground">{pct}%</span>
                )}
                {busy && isPicked && <Loader2 className="h-3 w-3 shrink-0 animate-spin text-primary" />}
              </span>
            </button>
          );
        })}
      </div>
      {voted === null && (
        <p className="mt-2 text-[11px] text-muted-foreground">Tap an option to vote.</p>
      )}
    </div>
  );
}
