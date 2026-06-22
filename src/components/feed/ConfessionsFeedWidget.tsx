import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { VenetianMask, ArrowRight, Sparkles, BarChart3, Users, Radio } from "lucide-react";
import { postsSafe } from "@/lib/posts-safe";
import { listConfessions } from "@/lib/confessions.functions";

interface Item {
  id: string;
  text: string;
  alias: string | null;
  avatar_emoji: string | null;
  category: string;
  like_count: number;
}

export function ConfessionsFeedWidget() {
  const fetchList = useServerFn(listConfessions);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    fetchList({ data: { sort: "recent", limit: 5 } })
      .then((rows) => {
        if (!mounted) return;
        setItems((rows as unknown as Item[]) ?? []);
      })
      .catch(() => {})
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [fetchList]);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-fuchsia-500/30 bg-gradient-to-br from-fuchsia-500/10 via-card to-card p-3 shadow-[0_8px_24px_-16px_oklch(0_0_0/0.4)]">
      <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-fuchsia-500/20 blur-2xl" aria-hidden />
      <div className="mb-2 flex items-center gap-2">
        <span className="grid h-7 w-7 place-items-center rounded-lg bg-fuchsia-500/20 text-fuchsia-400">
          <VenetianMask className="h-4 w-4" />
        </span>
        <span className="text-[11px] font-bold uppercase tracking-wider text-fuchsia-400">Anonymous Confessions</span>
      </div>

      {loading ? (
        <p className="px-1 py-3 text-xs text-muted-foreground">Loading…</p>
      ) : items.length === 0 ? (
        <p className="px-1 py-2 text-xs text-muted-foreground">No confessions yet — be the first.</p>
      ) : (
        <div className="space-y-1.5">
          {items.slice(0, 4).map((it) => (
            <Link
              key={it.id}
              to="/confessions"
              className="group block rounded-xl border border-border/60 bg-background/60 px-2.5 py-2 transition hover:border-fuchsia-500/40 hover:bg-fuchsia-500/5"
            >
              <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                <span aria-hidden>{it.avatar_emoji ?? "🕶️"}</span>
                <span className="truncate">{it.alias ?? "Anonymous"}</span>
                <span className="ml-auto text-fuchsia-400/80">{it.category}</span>
              </div>
              <p className="mt-0.5 line-clamp-2 text-xs text-foreground/90 group-hover:text-foreground">
                {it.text || "(no text)"}
              </p>
            </Link>
          ))}
        </div>
      )}

      <Link
        to="/confessions"
        className="mt-2 inline-flex w-full items-center justify-center gap-1 rounded-xl bg-gradient-to-r from-fuchsia-500 to-pink-500 px-3 py-1.5 text-xs font-bold text-white shadow-[0_6px_18px_-8px_rgb(217_70_239/0.7)] hover:scale-[1.02] active:scale-95 transition"
      >
        <Sparkles className="h-3 w-3" /> Open Confessions <ArrowRight className="h-3 w-3" />
      </Link>
    </div>
  );
}

interface LivePoll {
  id: string;
  slug: string;
  question: string;
  options: string[];
  votes: Record<string, number>;
  total: number;
}

export function ActivePollsWidget() {
  const [poll, setPoll] = useState<LivePoll | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await postsSafe()
        .select("id, slug, poll, reaction_count, created_at")
        .eq("kind", "poll")
        .eq("privacy", "public")
        .order("created_at", { ascending: false })
        .limit(20);
      if (!mounted) return;
      const rows = ((data ?? []) as any[]).filter((r) => r.poll?.question && Array.isArray(r.poll?.options));
      rows.sort((a, b) => (b.reaction_count ?? 0) - (a.reaction_count ?? 0));
      const top = rows[0];
      if (top) {
        const votes = (top.poll.votes ?? {}) as Record<string, number>;
        const total = Object.values(votes).reduce((s, n) => s + (Number(n) || 0), 0);
        setPoll({
          id: top.id,
          slug: top.slug ?? top.id,
          question: top.poll.question,
          options: top.poll.options.slice(0, 3),
          votes,
          total,
        });
      }
      setLoading(false);
    })().catch(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  const ranked = useMemo(() => {
    if (!poll) return [];
    return poll.options.map((label, idx) => {
      const count = Number(poll.votes?.[String(idx)] ?? poll.votes?.[label] ?? 0);
      const pct = poll.total > 0 ? Math.round((count / poll.total) * 100) : 0;
      return { label, count, pct };
    });
  }, [poll]);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 via-card to-card p-3 shadow-[0_8px_24px_-16px_oklch(0_0_0/0.4)]">
      <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-primary/25 blur-2xl" aria-hidden />
      <div className="mb-2 flex items-center gap-2">
        <span className="grid h-7 w-7 place-items-center rounded-lg bg-primary/15 text-primary ring-1 ring-inset ring-primary/30">
          <BarChart3 className="h-4 w-4" />
        </span>
        <span className="text-[11px] font-black uppercase tracking-wider text-primary">Live Poll</span>
        {poll && (
          <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 ring-1 ring-inset ring-emerald-400/30">
            <Radio className="h-2.5 w-2.5" /> {poll.total} votes
          </span>
        )}
      </div>

      {loading ? (
        <div className="space-y-1.5 pt-1">
          <div className="h-3 w-2/3 rounded skeleton-shimmer" />
          <div className="h-6 rounded-lg skeleton-shimmer" />
          <div className="h-6 rounded-lg skeleton-shimmer" />
        </div>
      ) : !poll ? (
        <p className="px-1 py-1 text-xs text-muted-foreground">
          No active polls — create one with the composer.
        </p>
      ) : (
        <Link
          to="/feed/$slug"
          params={{ slug: poll.slug }}
          className="block rounded-xl ring-1 ring-inset ring-border/60 bg-background/60 dark:bg-white/[0.03] p-2.5 transition hover:ring-primary/40 hover:shadow-[0_8px_24px_-14px_var(--primary-glow)]"
        >
          <p className="line-clamp-2 text-[12px] font-semibold text-foreground/95">{poll.question}</p>
          <div className="mt-2 space-y-1.5">
            {ranked.map((opt, i) => (
              <div key={i} className="relative overflow-hidden rounded-md bg-foreground/[0.06] dark:bg-white/[0.04] ring-1 ring-inset ring-border/40">
                <div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary/35 to-primary/15"
                  style={{ width: `${opt.pct}%` }}
                  aria-hidden
                />
                <div className="relative flex items-center justify-between px-2 py-1 text-[11px]">
                  <span className="truncate font-medium text-foreground/90">{opt.label}</span>
                  <span className="ml-2 shrink-0 font-black tabular-nums text-foreground/80">{opt.pct}%</span>
                </div>
              </div>
            ))}
          </div>
        </Link>
      )}

      <Link
        to="/feed"
        className="mt-2.5 inline-flex w-full items-center justify-center gap-1 rounded-xl bg-gradient-to-r from-primary to-primary/70 px-3 py-1.5 text-xs font-black uppercase tracking-wider text-primary-foreground shadow-[0_6px_18px_-8px_var(--primary-glow)] hover:brightness-110 active:scale-95 transition"
      >
        {poll ? "Vote now" : "Browse polls"} <ArrowRight className="h-3 w-3" />
      </Link>
    </div>
  );
}
