import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { VenetianMask, ArrowRight, Sparkles, BarChart3 } from "lucide-react";
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

export function ActivePollsWidget() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/8 via-card to-card p-3 shadow-[0_8px_24px_-16px_oklch(0_0_0/0.4)]">
      <div className="mb-2 flex items-center gap-2">
        <span className="grid h-7 w-7 place-items-center rounded-lg bg-primary/15 text-primary">
          <BarChart3 className="h-4 w-4" />
        </span>
        <span className="text-[11px] font-bold uppercase tracking-wider text-primary">Polls</span>
      </div>
      <p className="px-1 py-1 text-xs text-muted-foreground">
        Vote on community polls in the feed — or create your own with the composer.
      </p>
      <Link
        to="/feed"
        className="mt-2 inline-flex w-full items-center justify-center gap-1 rounded-xl bg-primary/15 px-3 py-1.5 text-xs font-bold text-primary hover:bg-primary/25 transition"
      >
        Browse polls <ArrowRight className="h-3 w-3" />
      </Link>
    </div>
  );
}
