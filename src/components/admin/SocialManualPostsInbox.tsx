import { useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CheckCircle2, Circle, Loader2, SkipForward, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { listSocialManualPosts, updateSocialManualStatus, type ManualInboxCard } from "@/lib/social-manual.functions";
import {
  AUTO_PLATFORM_LABEL,
  AUTO_PLATFORMS,
  MANUAL_PLATFORM_LABEL,
  MANUAL_PLATFORMS,
  type ManualInboxFilter,
  type ManualSocialPlatform,
} from "@/lib/social-manual-distribution";
import {
  SocialManualShareModal,
  type SocialManualShareTarget,
} from "@/components/admin/SocialManualShareModal";

const FILTERS: { id: ManualInboxFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "needs_manual", label: "Needs Manual Sharing" },
  { id: "partial", label: "Partially Shared" },
  { id: "completed", label: "Completed" },
];

export function SocialManualPostsInbox() {
  const qc = useQueryClient();
  const listFn = useServerFn(listSocialManualPosts);
  const updateFn = useServerFn(updateSocialManualStatus);
  const [filter, setFilter] = useState<ManualInboxFilter>("all");
  const [share, setShare] = useState<SocialManualShareTarget | null>(null);

  const q = useQuery({
    queryKey: ["social-manual-posts", filter],
    queryFn: () => listFn({ data: { filter } }),
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["social-manual-posts"] });
    qc.invalidateQueries({ queryKey: ["social-automation"] });
  };

  const skipMut = useMutation({
    mutationFn: (p: { feedPostId: string; platform: ManualSocialPlatform }) =>
      updateFn({ data: { feedPostId: p.feedPostId, platform: p.platform, status: "skipped" } }),
    onSuccess: () => {
      toast.success("Skipped");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const posts = (q.data?.posts ?? []) as ManualInboxCard[];

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Distribution inbox for existing Yaarzo welcome feed posts. Instagram, X, and TikTok stay automatic via Buffer.
        Facebook, Pinterest, Bluesky, and YouTube are prepared here from the same post — not a new caption.
      </p>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Button
            key={f.id}
            size="sm"
            variant={filter === f.id ? "default" : "outline"}
            onClick={() => setFilter(f.id)}
          >
            {f.label}
          </Button>
        ))}
      </div>

      {q.isLoading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading welcome posts…
        </div>
      )}
      {q.isError && (
        <p className="text-sm text-destructive">
          {(q.error as Error)?.message ?? "Failed to load manual posts"}
        </p>
      )}
      {!q.isLoading && posts.length === 0 && (
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">
            No eligible welcome feed posts. Members must opt in to social featuring, and the original Yaarzo welcome post must exist.
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {posts.map((post) => (
          <WelcomeDistributionCard
            key={post.feed_post_id}
            post={post}
            onShare={(platform) =>
              setShare({
                payload: post,
                platform,
                status: post.manual[platform].status,
                publishedUrl: post.manual[platform].published_url,
              })
            }
            onSkip={(platform) =>
              skipMut.mutate({ feedPostId: post.feed_post_id, platform })
            }
          />
        ))}
      </div>

      {share && (
        <SocialManualShareModal
          target={share}
          onClose={() => setShare(null)}
          onStatusChange={() => {
            invalidate();
            setShare(null);
          }}
        />
      )}
    </div>
  );
}

function WelcomeDistributionCard({
  post,
  onShare,
  onSkip,
}: {
  post: ManualInboxCard;
  onShare: (platform: ManualSocialPlatform) => void;
  onSkip: (platform: ManualSocialPlatform) => void;
}) {
  const created = useMemo(
    () => (post.created_at ? new Date(post.created_at).toLocaleString() : ""),
    [post.created_at],
  );

  return (
    <article className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <header className="flex items-start gap-3">
        {post.media_url ? (
          <img src={post.media_url} alt="" className="h-14 w-14 rounded-full object-cover ring-1 ring-border" />
        ) : (
          <div className="grid h-14 w-14 place-items-center rounded-full bg-muted text-sm font-semibold">
            {post.display_name.slice(0, 1).toUpperCase()}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="text-[15px] font-semibold tracking-tight">{post.display_name}</div>
          <div className="text-xs text-muted-foreground">@{post.username}</div>
          <div className="text-[11px] text-muted-foreground/80">{created}</div>
        </div>
      </header>

      <p className="mt-4 whitespace-pre-wrap text-[15px] leading-relaxed text-foreground/95">
        {post.caption || "🎉 Welcome to Yaarzo"}
      </p>
      <a
        href={post.profile_url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 inline-block truncate text-sm text-primary hover:underline"
      >
        {post.profile_url}
      </a>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-border/70 bg-muted/20 p-3">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Auto</div>
          <div className="mt-2 space-y-1.5">
            {AUTO_PLATFORMS.map((p) => (
              <div key={p} className="flex items-center justify-between text-sm">
                <span>{AUTO_PLATFORM_LABEL[p]}</span>
                <AutoBadge status={post.auto[p].status} label={post.auto[p].label} published={post.auto[p].published} />
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-border/70 bg-muted/20 p-3">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Manual</div>
          <div className="mt-2 space-y-2">
            {MANUAL_PLATFORMS.map((p) => {
              const row = post.manual[p];
              return (
                <div key={p} className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-sm">
                    <span>{MANUAL_PLATFORM_LABEL[p]}</span>
                    <ManualBadge status={row.status} />
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline" className="h-7 px-2 text-[11px]" onClick={() => onShare(p)}>
                      {row.status === "posted" ? "View" : "Share"}
                    </Button>
                    {row.status === "not_posted" && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2 text-[11px]"
                        onClick={() => onSkip(p)}
                      >
                        Skip
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </article>
  );
}

function AutoBadge({
  status,
  label,
  published,
}: {
  status: string;
  label: string;
  published: boolean;
}) {
  if (published) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
        <CheckCircle2 className="h-3.5 w-3.5" /> {label}
      </span>
    );
  }
  if (status === "queued") {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600">
        <Circle className="h-3.5 w-3.5" /> {label}
      </span>
    );
  }
  if (status === "failed") {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-destructive">
        <XCircle className="h-3.5 w-3.5" /> {label}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
      <Circle className="h-3.5 w-3.5" /> {label}
    </span>
  );
}

function ManualBadge({ status }: { status: string }) {
  if (status === "posted") {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600">
        <CheckCircle2 className="h-3 w-3" /> Posted
      </span>
    );
  }
  if (status === "skipped") {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
        <SkipForward className="h-3 w-3" /> Skipped
      </span>
    );
  }
  return <span className="text-[11px] text-muted-foreground">Not posted</span>;
}
