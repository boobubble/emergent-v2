// Chatroom Poll Discovery Widget.
//
// Renders compact poll previews above the message input. All voting,
// commenting and engagement happens on the feed page — the CTA links there.

import { Link } from "@tanstack/react-router";
import { Clock3, Users, ArrowRight, Vote } from "lucide-react";

import { usePollWidgetConfig, usePollPreviews } from "@/lib/poll-widget-store";
import { POLL_CATEGORY_META, formatRemaining, type PollPreview } from "@/lib/poll-widget-config";

export function PollDiscoveryWidget() {
  const { config, ready } = usePollWidgetConfig();
  const { previews, loading } = usePollPreviews(config);

  if (!ready || !config.enabled) return null;
  if (loading) return null;
  if (!previews.length) return null;

  return (
    <div className="border-t border-border/60 bg-card/40 px-3 py-2">
      <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
        <Vote className="h-3 w-3" />
        Active polls
        <span className="text-muted-foreground/60">· tap to vote in the feed</span>
      </div>
      <div className="-mx-1 flex snap-x snap-mandatory gap-2 overflow-x-auto px-1 pb-1">
        {previews.map((p) => (
          <PollPreviewCard key={`${p.category}-${p.id}`} preview={p} config={config} />
        ))}
      </div>
    </div>
  );
}

function PollPreviewCard({
  preview,
  config,
}: {
  preview: PollPreview;
  config: { showVoteCounts: boolean; redirectToFeed: boolean };
}) {
  const meta = POLL_CATEGORY_META[preview.category];

  return (
    <div className="group relative min-w-[260px] max-w-[300px] flex-1 snap-start rounded-xl border border-border/60 bg-background/80 p-3 shadow-sm transition-colors hover:border-primary/40">
      <div className={`mb-1 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide ${meta.tone}`}>
        <span aria-hidden>{meta.emoji}</span>
        <span>{meta.label}</span>
        <span
          className={`ml-auto rounded-full px-1.5 py-0.5 text-[9px] font-bold ${
            preview.status === "open"
              ? "bg-emerald-500/15 text-emerald-400"
              : "bg-muted text-muted-foreground"
          }`}
        >
          {preview.status === "open" ? "OPEN" : "CLOSED"}
        </span>
      </div>

      <p className="line-clamp-2 text-sm font-medium leading-snug text-foreground">
        {preview.question}
      </p>

      <div className="mt-2 flex items-center gap-3 text-[11px] text-muted-foreground">
        {config.showVoteCounts && (
          <span className="inline-flex items-center gap-1">
            <Users className="h-3 w-3" />
            {preview.voteCount.toLocaleString()} votes
          </span>
        )}
        <span className="inline-flex items-center gap-1">
          <Clock3 className="h-3 w-3" />
          {formatRemaining(preview.expiresAt)}
        </span>
      </div>

      <div className="mt-1 text-[11px] text-muted-foreground/80">
        by <span className="font-medium text-foreground/80">{preview.creatorName}</span>
      </div>

      {config.redirectToFeed && (
        <Link
          to="/$slug"
          params={{ slug: preview.slug }}
          className="mt-2 inline-flex items-center gap-1 rounded-lg bg-primary/90 px-2.5 py-1 text-[11px] font-semibold text-primary-foreground transition-colors hover:bg-primary"
          aria-label={`Vote on ${preview.question} in the feed`}
        >
          Vote Now <ArrowRight className="h-3 w-3" />
        </Link>
      )}
    </div>
  );
}
